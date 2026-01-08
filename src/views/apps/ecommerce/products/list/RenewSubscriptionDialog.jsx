'use client'

import { useState, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Card,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material'
import { useSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const loadRazorpay = () => {
  return new Promise(resolve => {
    const script = document.createElement('script')

    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const RenewSubscriptionDialog = ({
  open,
  onClose,
  bookingId,
  vehicleType,
  vehicleNumber,
  bookingDetails,
  userId,
  userName,
  mobileNumber,
  onSuccess
}) => {
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')
  const [renewMonths, setRenewMonths] = useState(1)
  const [monthlyRate, setMonthlyRate] = useState(0)
  const [payableAmount, setPayableAmount] = useState(0)
  const [gstData, setGstData] = useState({ gst: 18, handlingfee: 5 }) // Default values

  useEffect(() => {
    if (open && vendorId && vehicleType) {
      fetchChargesAndGst()
    }
  }, [open, vendorId, vehicleType])

  useEffect(() => {
    if (monthlyRate > 0) {
      setPayableAmount(monthlyRate * renewMonths)
    }
  }, [renewMonths, monthlyRate])

  const fetchChargesAndGst = async () => {
    setCalculating(true)
    setError('')

    try {
      // Fetch GST Data
      const gstResponse = await fetch(`${API_URL}/vendor/getgstfee`)

      if (gstResponse.ok) {
        const data = await gstResponse.json()

        if (Array.isArray(data) && data.length > 0) {
          setGstData({
            gst: parseFloat(data[0].gst || 0),
            handlingfee: parseFloat(data[0].handlingfee || 0)
          })
        }
      }

      // Fetch Charges
      const chargesResponse = await fetch(`${API_URL}/vendor/charges/${vendorId}/${vehicleType}`)

      if (chargesResponse.ok) {
        const data = await chargesResponse.json()
        const charges = data.transformedData || []

        // Find monthly charge
        const monthly = charges.find(c => c.type.toLowerCase().startsWith('monthly'))

        if (monthly) {
          setMonthlyRate(parseFloat(monthly.amount))
        } else {
          setError('Monthly charges not configured for this vehicle type.')
        }
      } else {
        setError('Failed to fetch charges.')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('An error occurred while fetching charges.')
    } finally {
      setCalculating(false)
    }
  }

  const calculateTotalWithTaxes = amount => {
    const gstPercent = gstData.gst
    const handling = gstData.handlingfee
    const gstAmount = (amount * gstPercent) / 100

    // Rounding logic to match Flutter: ceil
    return Math.ceil(amount + gstAmount + handling)
  }

  const handleRenew = async () => {
    setLoading(true)
    setError('')

    const res = await loadRazorpay()

    if (!res) {
      setError('Razorpay SDK failed to load')
      setLoading(false)

      return
    }

    const totalAmount = calculateTotalWithTaxes(payableAmount)

    try {
      // 1. Create Order
      const orderPayload = {
        amount: (totalAmount * 100).toFixed(2), // Amount in paisa
        vendor_id: vendorId,
        plan_id: 'monthly_renewal',
        transaction_name: 'UserBooking',
        user_id: userId
      }

      const orderRes = await fetch(`${API_URL}/vendor/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(orderPayload)
      })

      const orderData = await orderRes.json()

      if (!orderData.success) {
        throw new Error('Failed to create payment order')
      }

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_YourKeyHere', // Use env var
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'ParkMyWheels',
        description: 'Subscription Renewal',
        order_id: orderData.order.id,
        handler: async function (response) {
          await handlePaymentSuccess(response, totalAmount)
        },
        prefill: {
          name: userName || '',
          contact: mobileNumber || ''
        },
        theme: { color: '#3BA775' }
      }

      const rzp1 = new window.Razorpay(options)

      rzp1.on('payment.failed', function (response) {
        console.error(response.error)
        setError(`Payment Failed: ${response.error.description}`)
        setLoading(false)
      })
      rzp1.open()
    } catch (err) {
      console.error('Error initiating renewal:', err)
      setError(err.message || 'Failed to initiate renewal.')
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentResponse, paidAmount) => {
    try {
      // 3. Record Payment Success
      // NOTE: Flutter calls usersucesspay with userid in URL
      await fetch(`${API_URL}/vendor/usersucesspay/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          payment_id: paymentResponse.razorpay_payment_id,
          order_id: paymentResponse.razorpay_order_id,
          amount: paidAmount,
          userid: userId,
          vendorid: vendorId,
          transaction_name: 'UserBooking',
          payment_status: 'verified'
        })
      })

      // 4. Update Subscription
      const gstAmount = (payableAmount * gstData.gst) / 100

      // Calculate New End Date based on existing subscription end date
      let baseDate = new Date()
      const existingEndDateStr = bookingDetails?.subscriptionenddate || ''

      if (existingEndDateStr) {
        // Try parsing DD-MM-YYYY or YYYY-MM-DD
        // Flutter logic: split by space, try various formats.
        // Assuming DD-MM-YYYY based on typical response
        const parts = existingEndDateStr.trim().split(' ')[0].split(/[-/]/)

        if (parts.length === 3) {
          // Heuristic: if first part is 4 digits, it's YYYY-MM-DD, else DD-MM-YYYY
          if (parts[0].length === 4) {
            baseDate = new Date(parts[0], parts[1] - 1, parts[2])
          } else {
            baseDate = new Date(parts[2], parts[1] - 1, parts[0])
          }
        }

        // Check if date is valid
        if (isNaN(baseDate.getTime())) {
          baseDate = new Date()
        }
      }

      // Add months logic (handling overflow)
      // Note: setMonth handles overflow automatically (e.g. month 13 becomes Jan next year)
      baseDate.setMonth(baseDate.getMonth() + renewMonths)

      const newEndDateStr =
        String(baseDate.getDate()).padStart(2, '0') +
        '-' +
        String(baseDate.getMonth() + 1).padStart(2, '0') +
        '-' +
        baseDate.getFullYear()

      const renewResponse = await fetch(`${API_URL}/vendor/renewmonthl/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          new_total_amount: paidAmount,
          gst_amount: gstAmount,
          handling_fee: gstData.handlingfee,
          total_additional: paidAmount,
          new_subscription_enddate: newEndDateStr
        })
      })

      if (!renewResponse.ok) {
        throw new Error('Failed to update subscription on server')
      }

      onSuccess('Subscription renewed successfully')
      onClose()
    } catch (err) {
      console.error('Error finishing renewal:', err)
      setError('Payment successful but failed to update subscription.')
    } finally {
      setLoading(false)
    }
  }

  const gstAmt = (payableAmount * gstData.gst) / 100
  const totalPayable = calculateTotalWithTaxes(payableAmount)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Renew Subscription</DialogTitle>
      <DialogContent>
        {loading && !calculating && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Processing Payment...</Typography>
          </Box>
        )}

        {!loading && (
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity='error'>{error}</Alert>}

            <Typography variant='body1'>
              Vehicle: <b>{vehicleNumber}</b> ({vehicleType})
            </Typography>

            {calculating ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <TextField
                  select
                  label='Renewal Duration'
                  value={renewMonths}
                  onChange={e => setRenewMonths(e.target.value)}
                  fullWidth
                  disabled={monthlyRate === 0}
                >
                  {[1, 2, 3, 6, 12].map(option => (
                    <MenuItem key={option} value={option}>
                      {option} Month{option > 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </TextField>

                <Card variant='outlined' sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant='subtitle2' gutterBottom>
                    Payment Summary
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>Subscription Fee ({renewMonths} m)</Typography>
                    <Typography variant='body2'>₹{payableAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>GST ({gstData.gst}%)</Typography>
                    <Typography variant='body2'>₹{gstAmt.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>Handling Fee</Typography>
                    <Typography variant='body2'>₹{gstData.handlingfee}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight='bold'>Total Payable</Typography>
                    <Typography fontWeight='bold' color='primary'>
                      ₹{totalPayable.toFixed(2)}
                    </Typography>
                  </Box>
                </Card>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant='contained' onClick={handleRenew} disabled={loading || calculating || payableAmount <= 0}>
          Pay & Renew
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RenewSubscriptionDialog
