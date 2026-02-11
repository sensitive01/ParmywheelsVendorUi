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
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Grid,
  InputAdornment
} from '@mui/material'
import axios from 'axios'
import { useSession } from 'next-auth/react'

// Icon Imports
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'

import ExitDialog from './ExitDialog'

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://parkmywheels-backend.onrender.com'

const VendorRequests = () => {
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  // Tab & Data State
  const [value, setValue] = useState(0)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [subTab, setSubTab] = useState(0) // 0=Today, 1=All for Approved

  // Search State
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [otpModalOpen, setOtpModalOpen] = useState(false)
  const [exitModalOpen, setExitModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  // OTP Logic
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const normalize = status => (status || '').toString().trim().toUpperCase()

  // Format Helpers
  const formatDateTime = (dateStr, timeStr) => `${dateStr} ${timeStr}`

  const getVehicleIcon = type => {
    const t = (type || '').toLowerCase()

    if (t === 'car') return <DirectionsCarIcon />
    if (t === 'bike' || t === 'twowheeler') return <TwoWheelerIcon />

    return <DirectionsCarIcon />
  }

  // Fetch Data
  const fetchBookings = useCallback(async () => {
    if (!vendorId) return
    setLoading(true)

    try {
      const url = `${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`
      const response = await axios.get(url)

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
    } finally {
      setLoading(false)
    }
  }, [vendorId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Handlers
  const handleTabChange = (event, newValue) => setValue(newValue)

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity })
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false })

  // Actions
  const handleApprove = async bookingId => {
    const now = new Date()
    const approvedDate = now.toLocaleDateString('en-GB').split('/').join('-')
    const approvedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    try {
      await axios.put(`${API_URL}/vendor/approvebooking/${bookingId}`, {
        status: 'Approved',
        approvedDate,
        approvedTime
      })
      showSnackbar('Booking Approved', 'success')
      fetchBookings()
    } catch (error) {
      showSnackbar('Failed to approve booking', 'error')
    }
  }

  const handleCancelPending = async bookingId => {
    try {
      await axios.put(`${API_URL}/vendor/cancelbooking/${bookingId}`, { status: 'Cancelled' })
      showSnackbar('Booking Cancelled', 'info')
      fetchBookings()
    } catch (error) {
      showSnackbar('Failed to cancel booking', 'error')
    }
  }

  const handleCancelApproved = async bookingId => {
    try {
      await axios.put(`${API_URL}/vendor/approvedcancelbooking/${bookingId}`, { status: 'Cancelled' })
      showSnackbar('Booking Cancelled', 'info')
      fetchBookings()
    } catch (error) {
      showSnackbar('Failed to cancel booking', 'error')
    }
  }

  const handleAllowParkingClick = booking => {
    const today = new Date()

    const todayStr =
      String(today.getDate()).padStart(2, '0') +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      today.getFullYear()

    if (booking.parkingDate !== todayStr) {
      showSnackbar("Parking date does not match today's date.", 'error')

      return
    }

    if (booking.userid) {
      setSelectedBooking(booking)
      setOtp('')
      setOtpError('')
      setOtpModalOpen(true)
    } else {
      processAllowParking(booking.id || booking._id)
    }
  }

  const processAllowParking = async bookingId => {
    const now = new Date()
    const parkedDate = now.toLocaleDateString('en-GB').split('/').join('-')
    const parkedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    setActionLoading(true)

    try {
      await axios.put(`${API_URL}/vendor/allowparking/${bookingId}`, {
        status: 'PARKED',
        parkedDate,
        parkedTime
      })
      showSnackbar('Parking Allowed Successfully', 'success')
      setOtpModalOpen(false)
      fetchBookings()
    } catch (error) {
      showSnackbar('Failed to allow parking', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleVerifyOtp = () => {
    const bookingOtp = String(selectedBooking?.otp || '').trim()
    console.log('Booking OTP:', bookingOtp)
    const inputOtp = String(otp).trim()

    if (selectedBooking && inputOtp === bookingOtp.substring(0, 3)) {
      processAllowParking(selectedBooking.id || selectedBooking._id)
    } else {
      setOtpError('Invalid OTP')
    }
  }

  const handleExitClick = booking => {
    setSelectedBooking(booking)
    setExitModalOpen(true)
  }

  const handleExitSuccess = () => {
    showSnackbar('Vehicle Exited Successfully', 'success')
    setExitModalOpen(false)
    fetchBookings()
  }

  // Filtering
  const getFilteredBookings = () => {
    let filtered = []

    switch (value) {
      case 0:
        filtered = bookings.filter(b => normalize(b.status) === 'PENDING')
        break

      case 1: {
        filtered = bookings.filter(b => normalize(b.status) === 'APPROVED')

        if (subTab === 0) {
          const today = new Date()

          const todayStr =
            String(today.getDate()).padStart(2, '0') +
            '-' +
            String(today.getMonth() + 1).padStart(2, '0') +
            '-' +
            today.getFullYear()

          filtered = filtered.filter(b => b.parkingDate === todayStr)
        }

        break
      }

      case 2:
        filtered = bookings.filter(b => normalize(b.status) === 'PARKED' || normalize(b.status) === 'ON PARKING')
        break
      case 3:
        filtered = bookings.filter(b => normalize(b.status) === 'COMPLETED')
        break
      case 4:
        filtered = bookings.filter(b => normalize(b.status) === 'CANCELLED')
        break
      case 5:
        filtered = bookings
        break
      default:
        filtered = []
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()

      filtered = filtered.filter(
        b =>
          b.vehicleNumber?.toLowerCase().includes(q) ||
          b.phoneno?.includes(q) ||
          b.mobilenumber?.includes(q) ||
          b.mobileNumber?.includes(q) ||
          b.username?.toLowerCase().includes(q) ||
          b.personName?.toLowerCase().includes(q)
      )
    }

    return filtered
  }

  const filteredData = getFilteredBookings()

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header & Search */}
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
          Requests
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' }, alignItems: 'center' }}>
          <TextField
            size='small'
            placeholder='Search Vehicle, Mobile...'
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

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          variant='scrollable'
          scrollButtons='auto'
          textColor='primary'
          indicatorColor='primary'
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 }
          }}
        >
          <Tab label='Pending' />
          <Tab label='Approved' />
          <Tab label='Parked' />
          <Tab label='Completed' />
          <Tab label='Cancelled' />
          <Tab label='All' />
        </Tabs>

        {value === 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, bgcolor: '#f8f9fa' }}>
            <Box sx={{ bgcolor: '#e9ecef', borderRadius: 2, p: 0.5, display: 'flex' }}>
              <Button
                size='small'
                variant={subTab === 0 ? 'contained' : 'text'}
                onClick={() => setSubTab(0)}
                sx={{ borderRadius: 1.5, boxShadow: 'none', textTransform: 'none', px: 2 }}
              >
                Today
              </Button>
              <Button
                size='small'
                variant={subTab === 1 ? 'contained' : 'text'}
                onClick={() => setSubTab(1)}
                sx={{ borderRadius: 1.5, boxShadow: 'none', textTransform: 'none', px: 2 }}
              >
                All
              </Button>
            </Box>
          </Box>
        )}

        <CardContent sx={{ bgcolor: '#f8f9fa', minHeight: 400, p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <CircularProgress />
            </Box>
          ) : filteredData.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
              <Typography variant='h6' color='textSecondary'>
                No Requests Found
              </Typography>
            </Box>
          ) : (
            filteredData.map((booking, index) => (
              <Card
                key={booking.id || booking._id || index}
                sx={{ mb: 2, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          p: 0.8,
                          borderRadius: 2,
                          display: 'flex'
                        }}
                      >
                        {getVehicleIcon(booking.vehicleType || booking.vehicletype)}
                      </Box>
                      <Box>
                        <Typography variant='h6' fontWeight='800' sx={{ letterSpacing: 0.5 }}>
                          {booking.vehicleNumber}
                        </Typography>
                        <Typography variant='caption' color='textSecondary' fontWeight='bold'>
                          {booking.sts === 'Schedule'
                            ? 'Prescheduled'
                            : booking.sts === 'Instant'
                              ? 'Drive-in'
                              : booking.sts}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={booking.status}
                      color={
                        booking.status === 'Cancelled'
                          ? 'error'
                          : booking.status === 'COMPLETED'
                            ? 'success'
                            : 'primary'
                      }
                      size='small'
                      sx={{ fontWeight: 'bold', borderRadius: 1 }}
                    />
                  </Box>
                  <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant='caption' color='textSecondary'>
                        Name
                      </Typography>
                      <Typography variant='subtitle2' fontWeight='600'>
                        {booking.username || booking.vendorname || booking.personName || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant='caption' color='textSecondary'>
                        Mobile
                      </Typography>
                      <Typography variant='subtitle2' fontWeight='600'>
                        {booking.phoneno || booking.mobilenumber || booking.mobileNumber || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant='caption' color='textSecondary'>
                        {booking.status === 'COMPLETED' ? 'Exit Time' : 'In Time'}
                      </Typography>
                      <Typography variant='subtitle2' fontWeight='600'>
                        {formatDateTime(
                          booking.status === 'COMPLETED' ? booking.exitvehicledate : booking.parkingDate,
                          booking.status === 'COMPLETED' ? booking.exitvehicletime : booking.parkingTime
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {(value === 0 || normalize(booking.status) === 'PENDING') && (
                      <>
                        <Button
                          variant='outlined'
                          color='error'
                          size='small'
                          onClick={() => handleCancelPending(booking.id)}
                          sx={{ borderRadius: 2 }}
                        >
                          Decline
                        </Button>
                        <Button
                          variant='contained'
                          color='success'
                          size='small'
                          onClick={() => handleApprove(booking.id)}
                          sx={{ borderRadius: 2, color: 'white' }}
                        >
                          Accept
                        </Button>
                      </>
                    )}
                    {(value === 1 || normalize(booking.status) === 'APPROVED') && (
                      <>
                        <Button
                          variant='outlined'
                          color='error'
                          size='small'
                          onClick={() => handleCancelApproved(booking.id)}
                          sx={{ borderRadius: 2 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant='contained'
                          color='primary'
                          size='small'
                          onClick={() => handleAllowParkingClick(booking)}
                          sx={{ borderRadius: 2 }}
                        >
                          Allow Parking
                        </Button>
                      </>
                    )}
                    {(value === 2 ||
                      normalize(booking.status) === 'PARKED' ||
                      normalize(booking.status) === 'ON PARKING') && (
                      <Button
                        variant='contained'
                        color='error'
                        size='small'
                        onClick={() => handleExitClick(booking)}
                        sx={{ borderRadius: 2, minWidth: 100 }}
                      >
                        Exit
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Enter OTP</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant='body2' align='center' color='textSecondary'>
              Ask user for the 3-digit OTP code.
            </Typography>
            <TextField
              autoFocus
              margin='dense'
              label='OTP'
              type='number'
              fullWidth
              variant='outlined'
              value={otp}
              onChange={e => {
                setOtp(e.target.value)
                setOtpError('')
              }}
              error={!!otpError}
              helperText={otpError}
              inputProps={{ maxLength: 3, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={handleVerifyOtp}
            variant='contained'
            color='primary'
            disabled={otp.length !== 3 || actionLoading}
            sx={{ minWidth: 150 }}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Verify & Allow'}
          </Button>
        </DialogActions>
      </Dialog>

      <ExitDialog
        open={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        booking={selectedBooking}
        vendorId={vendorId}
        onExitSuccess={handleExitSuccess}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default VendorRequests
