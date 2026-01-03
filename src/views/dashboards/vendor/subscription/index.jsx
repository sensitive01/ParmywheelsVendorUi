'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Box,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  InputAdornment
} from '@mui/material'
import axios from 'axios'
import { useSession } from 'next-auth/react'

// Icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// Razorpay Script Loader
const loadRazorpay = () => {
  return new Promise(resolve => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://parkmywheels-backend.onrender.com'

const VendorSubscriptions = () => {
  const { data: session } = useSession()
  const vendorId = session?.user?.id || '66a78d8a90103759600a12e2' // Fallback for testing

  const [value, setValue] = useState(0) // 0=On Parking, 1=Completed
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchQuery, setSearchQuery] = useState('')

  // --- Renew Modal State ---
  const [renewModalOpen, setRenewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [renewMonths, setRenewMonths] = useState(1)
  const [parkingCharges, setParkingCharges] = useState([])
  const [payableAmount, setPayableAmount] = useState(0)
  const [gstData, setGstData] = useState({ gst: '0', handlingfee: '0' })
  const [renewLoading, setRenewLoading] = useState(false)

  // --- Exit Modal State ---
  const [exitModalOpen, setExitModalOpen] = useState(false)

  // Fetch Data
  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const url = `${API_URL}/vendor/getbookingdata/${vendorId}`
      const response = await axios.get(url)

      // Robust data extraction
      const data = response.data?.bookings || response.data?.data || (Array.isArray(response.data) ? response.data : [])

      if (Array.isArray(data)) {
        setBookings(data)
      } else {
        console.error('Fetched data is not an array:', response.data)
        setBookings([])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      showSnackbar('Error fetching bookings', 'error')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [vendorId])

  const fetchGstData = async () => {
    try {
      const response = await axios.get(`${API_URL}/vendor/getgstfee`)
      if (response.data && response.data.length > 0) {
        setGstData(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching GST data:', error)
    }
  }

  useEffect(() => {
    if (vendorId) {
      fetchBookings()
      fetchGstData()
    }
  }, [vendorId, fetchBookings])

  // --- Helper Functions ---
  const handleTabChange = (event, newValue) => {
    setValue(newValue)
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const getVehicleIcon = type => {
    const t = (type || '').toLowerCase()
    if (t === 'car') return <DirectionsCarIcon />
    if (t === 'bike' || t === 'twowheeler') return <TwoWheelerIcon />
    return <LocalShippingIcon />
  }

  // --- Renew Logic ---
  const openRenewModal = async booking => {
    setSelectedBooking(booking)
    setRenewMonths(1)
    setRenewModalOpen(true)
    setRenewLoading(true)
    try {
      const response = await axios.get(`${API_URL}/vendor/charges/${vendorId}/${booking.vehicletype}`)
      if (response.data && response.data.transformedData) {
        setParkingCharges(response.data.transformedData)
      } else {
        setParkingCharges([])
      }
    } catch (error) {
      console.error('Error fetching charges:', error)
    } finally {
      setRenewLoading(false)
    }
  }

  useEffect(() => {
    if (renewModalOpen && parkingCharges.length > 0) {
      const monthlyCharge = parkingCharges.find(c => c.type.toLowerCase().startsWith('monthly'))
      if (monthlyCharge) {
        setPayableAmount(monthlyCharge.amount * renewMonths)
      } else {
        setPayableAmount(0)
      }
    }
  }, [renewMonths, parkingCharges, renewModalOpen])

  const calculateTotalWithTaxes = amount => {
    const gstPercent = parseFloat(gstData.gst || 0)
    const handling = parseFloat(gstData.handlingfee || 0)
    const gstAmount = (amount * gstPercent) / 100
    return Math.ceil(amount + gstAmount + handling)
  }

  const handleProcessRenew = async () => {
    const res = await loadRazorpay()
    if (!res) {
      showSnackbar('Razorpay SDK failed to load', 'error')
      return
    }

    const totalAmount = calculateTotalWithTaxes(payableAmount)

    try {
      const orderPayload = {
        amount: (totalAmount * 100).toFixed(2),
        vendor_id: vendorId,
        plan_id: 'monthly_renewal',
        transaction_name: 'UserBooking',
        user_id: selectedBooking.userid || undefined
      }

      const orderRes = await axios.post(`${API_URL}/vendor/create-order`, orderPayload)

      if (orderRes.data && orderRes.data.success) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_YourKeyHere',
          amount: orderRes.data.order.amount,
          currency: 'INR',
          name: 'ParkMyWheels',
          description: 'Subscription Renewal',
          order_id: orderRes.data.order.id,
          handler: async function (response) {
            await handlePaymentSuccess(response, totalAmount)
          },
          prefill: {
            name: selectedBooking.username || '',
            contact: selectedBooking.mobilenumber || ''
          },
          theme: { color: '#3BA775' }
        }
        const rzp1 = new window.Razorpay(options)
        rzp1.open()
      } else {
        showSnackbar('Failed to create payment order', 'error')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      showSnackbar('Error initiating payment', 'error')
    }
  }

  const handlePaymentSuccess = async (paymentResponse, paidAmount) => {
    try {
      await axios.post(`${API_URL}/vendor/usersucesspay/${selectedBooking.userid}`, {
        payment_id: paymentResponse.razorpay_payment_id,
        order_id: paymentResponse.razorpay_order_id,
        amount: paidAmount,
        userid: selectedBooking.userid,
        vendorid: vendorId,
        transaction_name: 'UserBooking',
        payment_status: 'verified'
      })

      const addedDays = renewMonths * 30
      const newEndDate = new Date()
      newEndDate.setDate(newEndDate.getDate() + addedDays)
      const newEndDateStr =
        String(newEndDate.getDate()).padStart(2, '0') +
        '-' +
        String(newEndDate.getMonth() + 1).padStart(2, '0') +
        '-' +
        newEndDate.getFullYear()

      await axios.put(`${API_URL}/vendor/renewmonthl/${selectedBooking.id}`, {
        new_total_amount: paidAmount,
        gst_amount: (payableAmount * parseFloat(gstData.gst)) / 100,
        handling_fee: parseFloat(gstData.handlingfee),
        total_additional: paidAmount,
        new_subscription_enddate: newEndDateStr
      })

      showSnackbar('Subscription Renewed Successfully', 'success')
      setRenewModalOpen(false)
      fetchBookings()
    } catch (error) {
      console.error('Payment success handling error:', error)
      showSnackbar('Payment successful but update failed', 'warning')
    }
  }

  // --- Exit Logic ---
  const handleExitClick = booking => {
    setSelectedBooking(booking)
    setExitModalOpen(true)
  }

  const confirmExit = async () => {
    if (!selectedBooking) return
    try {
      const now = new Date()
      const exitDate = now.toLocaleDateString('en-GB').split('/').join('-')
      const exitTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

      await axios.put(`${API_URL}/vendor/updatesubscriptionstatus/${selectedBooking.id}`, {
        status: 'Booked',
        exitDate: exitDate,
        exitTime: exitTime
      })

      showSnackbar('Vehicle Exited Successfully', 'success')
      setExitModalOpen(false)
      fetchBookings()
    } catch (error) {
      console.error('Exit error', error)
      showSnackbar('Failed to process exit', 'error')
    }
  }

  // --- Filter Logic ---
  const getFilteredData = () => {
    let data = []
    if (value === 0) {
      data = bookings.filter(b => (b.status === 'PARKED' || b.status === 'Parked') && b.sts === 'Subscription')
    } else {
      data = bookings.filter(b => b.status === 'COMPLETED' && b.sts === 'Subscription')
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      data = data.filter(
        b =>
          b.vehicleNumber?.toLowerCase().includes(q) ||
          b.username?.toLowerCase().includes(q) ||
          b.mobilenumber?.includes(q)
      )
    }
    return data
  }

  const filteredData = getFilteredData()

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Sticky Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'background.paper',
          pb: 2,
          pt: 1
        }}
      >
        <Typography variant='h5' fontWeight='bold' color='text.primary'>
          Subscriptions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' }, alignItems: 'center' }}>
          <TextField
            size='small'
            placeholder='Search Vehicle...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              )
            }}
            sx={{
              bgcolor: 'white',
              borderRadius: 1,
              width: { xs: '100%', md: 350 },
              '& .MuiOutlinedInput-root': { borderRadius: 3 }
            }}
          />
          <IconButton sx={{ bgcolor: 'white', boxShadow: 2, borderRadius: 2, p: 1 }}>
            <FilterListIcon color='primary' />
          </IconButton>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          variant='fullWidth'
          textColor='primary'
          indicatorColor='primary'
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 }
          }}
        >
          <Tab label='On Parking' icon={<DirectionsCarIcon />} iconPosition='start' />
          <Tab label='Completed' icon={<CheckCircleIcon />} iconPosition='start' />
        </Tabs>

        <CardContent sx={{ bgcolor: '#f8f9fa', minHeight: 400, p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <CircularProgress />
            </Box>
          ) : filteredData.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
              <Typography variant='h6' color='textSecondary'>
                No Subscriptions Found
              </Typography>
            </Box>
          ) : (
            filteredData.map(item => (
              <Box key={item.id} sx={{ mb: 2, position: 'relative' }}>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 1.5,
                    pt: 4,
                    borderRadius: '0 0 16px 16px',
                    mb: 1,
                    position: 'absolute',
                    top: 20,
                    left: 0,
                    right: 0,
                    zIndex: 0,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant='body2' fontWeight='bold'>
                    {item.parkingDate} {item.parkingTime}
                  </Typography>
                </Box>
                <Card sx={{ position: 'relative', zIndex: 1, borderRadius: 2, mb: 6, boxShadow: 3 }}>
                  <CardContent sx={{ p: '16px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='h6' color='primary' fontWeight='bold'>
                          {item.vehicleNumber}
                        </Typography>
                      </Box>
                      {value === 0 && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size='small'
                            variant='outlined'
                            color='primary'
                            startIcon={<AutorenewIcon />}
                            onClick={() => openRenewModal(item)}
                          >
                            Renew
                          </Button>
                          <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            startIcon={<ExitToAppIcon />}
                            onClick={() => handleExitClick(item)}
                          >
                            Exit
                          </Button>
                        </Box>
                      )}
                    </Box>

                    <Grid container spacing={2} alignItems='center'>
                      <Grid item>
                        <Box
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            p: 1,
                            borderRadius: '0 16px 16px 0',
                            ml: -2,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {getVehicleIcon(item.vehicletype || item.vehicleType)}
                        </Box>
                      </Grid>
                      <Grid item xs>
                        <Typography variant='caption' display='block' fontWeight='bold'>
                          Parking Schedule:
                        </Typography>
                        <Typography variant='body2'>
                          {item.parkingDate} {item.parkingTime}
                        </Typography>
                        <Typography variant='caption' color='textSecondary'>
                          Status: {item.status}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant='body2' color='primary' fontWeight='bold'>
                          Subscription
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Renew Modal */}
      <Dialog open={renewModalOpen} onClose={() => setRenewModalOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Renew Subscription</DialogTitle>
        <DialogContent>
          {renewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant='body1'>
                Vehicle: <b>{selectedBooking?.vehicleNumber}</b>
              </Typography>
              <TextField
                select
                label='Duration'
                value={renewMonths}
                onChange={e => setRenewMonths(e.target.value)}
                fullWidth
              >
                {[1, 2, 3, 6, 12].map(option => (
                  <MenuItem key={option} value={option}>
                    {option} Month{option > 1 ? 's' : ''}
                  </MenuItem>
                ))}
              </TextField>

              <Card variant='outlined' sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                <Typography variant='subtitle2'>Payment Summary</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Subscription Fee ({renewMonths} m)</Typography>
                  <Typography>₹{payableAmount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>GST ({gstData.gst}%)</Typography>
                  <Typography>₹{((payableAmount * parseFloat(gstData.gst || 0)) / 100).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Handling Fee</Typography>
                  <Typography>₹{gstData.handlingfee}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight='bold'>Total Payable</Typography>
                  <Typography fontWeight='bold' color='primary'>
                    ₹{calculateTotalWithTaxes(payableAmount)}
                  </Typography>
                </Box>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenewModalOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleProcessRenew} disabled={payableAmount <= 0}>
            Pay & Renew
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Modal Confirmation */}
      <Dialog open={exitModalOpen} onClose={() => setExitModalOpen(false)}>
        <DialogTitle>Confirm Exit</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to exit <b>{selectedBooking?.vehicleNumber}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitModalOpen(false)}>Cancel</Button>
          <Button onClick={confirmExit} color='error' variant='contained'>
            Confirm Exit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default VendorSubscriptions
