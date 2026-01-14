'use client'

import { useState, useEffect, useCallback } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { useSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const RenewSubscriptionDialog = ({
  open,
  onClose,
  bookingId,
  vehicleType,
  vehicleNumber,
  bookingDetails,
  onSuccess
}) => {
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  const [months, setMonths] = useState(1)
  const [loading, setLoading] = useState(true)
  const [chargesData, setChargesData] = useState([])
  const [gstData, setGstData] = useState({ gst: 0, handlingfee: 0 })
  const [error, setError] = useState(null)
  const [amounts, setAmounts] = useState({ payable: 0, gst: 0, handling: 0, total: 0 })

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch GST Data
      const gstResponse = await fetch(`${API_URL}/vendor/getgstfee`)
      const gstDataResult = await gstResponse.json()

      const gstInfo =
        Array.isArray(gstDataResult) && gstDataResult.length > 0 ? gstDataResult[0] : { gst: '0', handlingfee: '0' }

      setGstData({
        gst: parseFloat(gstInfo.gst || 0),
        handlingfee: parseFloat(gstInfo.handlingfee || 0)
      })

      // Fetch Charges
      // Use props if available, otherwise fall back to bookingDetails
      const vId = vendorId || bookingDetails?.Vendorid
      const vType = vehicleType || bookingDetails?.vehicleType

      if (vId && vType) {
        const chargesResponse = await fetch(`${API_URL}/vendor/charges/${vId}/${vType}`)

        if (chargesResponse.ok) {
          const chargesResult = await chargesResponse.json()

          setChargesData(chargesResult.transformedData || [])
        }
      }
    } catch (err) {
      console.error('Error fetching renewal data:', err)
      setError('Failed to load pricing details')
    } finally {
      setLoading(false)
    }
  }, [vendorId, bookingDetails, vehicleType])

  useEffect(() => {
    if (open && bookingDetails) {
      fetchInitialData()
    }
  }, [open, bookingDetails, fetchInitialData])

  const calculateAmounts = useCallback(() => {
    if (!chargesData.length) {
      setAmounts({ payable: 0, gst: 0, handling: 0, total: 0 })

      return
    }

    // Find monthly charge
    const monthlyCharge = chargesData.find(c => c.type?.toLowerCase().startsWith('monthly'))
    const baseRate = monthlyCharge ? parseFloat(monthlyCharge.amount) : 0

    const payable = Math.ceil(baseRate * months)

    // As per user request, GST and Handling Fee should not be charged for renewal
    const gstAmount = 0
    const handling = 0
    const total = payable + gstAmount + handling

    setAmounts({ payable, gst: gstAmount, handling, total })
  }, [chargesData, months, gstData])

  useEffect(() => {
    calculateAmounts()
  }, [months, chargesData, gstData, calculateAmounts])

  const calculateNewEndDate = () => {
    let baseDate = new Date()
    const targetDate = new Date(baseDate.setMonth(baseDate.getMonth() + months))

    return `${targetDate.getDate().toString().padStart(2, '0')}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getFullYear()}`
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const payload = {
        new_total_amount: amounts.total,
        gst_amount: amounts.gst,
        handling_fee: amounts.handling,
        total_additional: amounts.total,
        new_subscription_enddate: calculateNewEndDate()
      }

      const idToUse = bookingId || bookingDetails?._id

      const response = await fetch(`${API_URL}/vendor/renewmonthl/${idToUse}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Renewal failed')
      }

      onSuccess('Subscription renewed successfully')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Renew Subscription</DialogTitle>
      <DialogContent>
        {loading && !chargesData.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity='error'>{error}</Alert>}

            <Typography variant='subtitle2' color='textSecondary'>
              Vehicle: {vehicleNumber || bookingDetails?.vehicleNumber}
            </Typography>

            <FormControl fullWidth size='small'>
              <InputLabel>Duration (Months)</InputLabel>
              <Select value={months} label='Duration (Months)' onChange={e => setMonths(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <MenuItem key={m} value={m}>
                    {m} Month{m > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 600 }}>
                Payment Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body2'>Subscription Fee ({months} months)</Typography>
                <Typography variant='body2'>₹{amounts.payable.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='subtitle1' fontWeight={600}>
                  Total Amount
                </Typography>
                <Typography variant='subtitle1' fontWeight={600} color='primary'>
                  ₹{amounts.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={loading || amounts.payable === 0}>
          Confirm & Renew
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RenewSubscriptionDialog
