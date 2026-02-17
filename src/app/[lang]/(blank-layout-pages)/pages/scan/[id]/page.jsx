'use client'
import React, { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import axios from 'axios'

// MUI Imports
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Divider,
  Container,
  Paper
} from '@mui/material'

// Icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SearchIcon from '@mui/icons-material/Search'

// Utils
import { showNotification } from '@/utils/requestNotificationPermission'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const PublicScannerPage = () => {
  const params = useParams()
  const vendorId = params.id

  const [vehicleNumber, setVehicleNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [viewState, setViewState] = useState('search') // 'search' | 'result'

  // Timer state
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    let interval = null

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [timer])

  const fetchBookingDetails = async () => {
    if (!vehicleNumber) return

    if (!vendorId) {
      setError('Vendor ID missing from the link')

      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unable to access vendor bookings. Please contact support.')
        }

        throw new Error('Failed to fetch bookings')
      }

      const result = await response.json()

      if (result && result.bookings) {
        // Filter by vehicle number
        const matches = result.bookings.filter(
          b => b.vehicleNumber?.toString().toLowerCase() === vehicleNumber.toString().toLowerCase()
        )

        if (matches.length > 0) {
          // Prioritize Active/Parked/Approved bookings
          const activeBooking =
            matches.find(b => ['parked', 'pending', 'approved'].includes(b.status?.toLowerCase())) || matches[0]

          setBookingData(activeBooking)
          setViewState('result')
        } else {
          setError('No active bookings found for this vehicle number')
        }
      } else {
        setError('No bookings found')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error fetching details')
    } finally {
      setLoading(false)
    }
  }

  const handleGetVehicle = async () => {
    if (timer > 0) return

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const message = `${vehicleNumber} needs to be returned, confirmed at ${timeString}`

    // Show browser notification locally (Simulator)
    showNotification('Return Request', {
      body: message,
      icon: '/images/avatars/1.png'
    })

    try {
      setLoading(true)

      // Call API to notify vendor backend
      const response = await axios.post(`${API_URL}/vendor/requestVehicleReturn`, {
        vendorId: vendorId,
        vehicleNumber: vehicleNumber,
        bookingId: bookingData?._id,
        requestTime: new Date().toISOString()
      })

      if (response.status === 200 || response.status === 201) {
        console.log('Backend notification sent successfully', response.data)
        setSuccessMessage(`Request sent successfully! Returns request for ${vehicleNumber} confirmed at ${timeString}.`)
        setError(null)
        setTimer(30)
      } else {
        console.warn('Backend notification failed:', response.data?.message)


        setSuccessMessage(`Request processed. ${vehicleNumber} at ${timeString}.`)
        setTimer(30)
      }
    } catch (error) {
      console.error('Error sending return request to backend:', error)
      setError('Could not reach server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchAgain = () => {
    setViewState('search')
    setVehicleNumber('')
    setError(null)
    setBookingData(null)
    setSuccessMessage(null)
  }

  const getVehicleIcon = type => {
    return type?.toLowerCase() === 'car' ? (
      <DirectionsCarIcon fontSize='medium' color='primary' />
    ) : (
      <TwoWheelerIcon fontSize='medium' color='primary' />
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth='sm' disableGutters>
        {/* Logo Area */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img
            src="/public/login.png"
            alt='ParkMyWheels'
            style={{ height: 50, marginBottom: 8, objectFit: 'contain' }}
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <Typography variant='h5' sx={{ display: 'none', fontWeight: 800, color: '#333', letterSpacing: '-0.5px' }}>
            ParkMy<span style={{ color: '#666cff' }}>Wheels</span>
          </Typography>
        </Box>

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            bgcolor: 'white'
          }}
        >
          {viewState === 'search' && (
            <CardContent sx={{ p: 4 }}>
              <Typography variant='h5' align='center' gutterBottom sx={{ fontWeight: 700, color: '#2c2e3e' }}>
                Vehicle Return Request
              </Typography>
              <Typography variant='body2' align='center' sx={{ color: '#666', mb: 4 }}>
                Enter vehicle number to request return.
              </Typography>

              <Box
                component='form'
                onSubmit={e => {
                  e.preventDefault()
                  fetchBookingDetails()
                }}
              >
                <TextField
                  fullWidth
                  label='Vehicle Number'
                  variant='outlined'
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder='KA01AB1234'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon color='action' />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: '#f8f9fa' }
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  variant='contained'
                  fullWidth
                  size='large'
                  onClick={fetchBookingDetails}
                  disabled={loading || !vehicleNumber}
                  sx={{
                    height: 50,
                    borderRadius: 2,
                    bgcolor: '#666cff',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(102, 108, 255, 0.3)',
                    '&:hover': { bgcolor: '#5a5fe0' }
                  }}
                >
                  {loading ? <CircularProgress size={24} color='inherit' /> : 'Find Vehicle'}
                </Button>
              </Box>

              {error && (
                <Alert severity='error' sx={{ mt: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          )}

          {viewState === 'result' && bookingData && (
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mb: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#eff1ff',
                    borderRadius: '50%',
                    mb: 2
                  }}
                >
                  {getVehicleIcon(bookingData.vehicleType)}
                </Box>
                <Typography variant='h5' sx={{ fontWeight: 800, color: '#333' }}>
                  {bookingData.vehicleNumber}
                </Typography>
                <Chip
                  label={bookingData.status}
                  color={['parked', 'approved'].includes(bookingData.status?.toLowerCase()) ? 'success' : 'default'}
                  size='small'
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 4, bgcolor: '#f8f9fa', p: 2, borderRadius: 3 }}>
                <Grid item xs={6} sx={{ textAlign: 'center' }}>
                  <Typography variant='caption' sx={{ color: '#888', display: 'block' }}>
                    Date
                  </Typography>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                    {bookingData.parkingDate || bookingData.bookingDate}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'center' }}>
                  <Typography variant='caption' sx={{ color: '#888', display: 'block' }}>
                    Time
                  </Typography>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                    {bookingData.parkingTime || bookingData.bookingTime}
                  </Typography>
                </Grid>
              </Grid>

              {successMessage ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Alert
                    severity='success'
                    icon={<CheckCircleOutlineIcon fontSize='inherit' />}
                    sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}
                  >
                    {successMessage}
                  </Alert>
                  {timer > 0 && (
                    <Typography variant='caption' sx={{ color: '#999', display: 'block', mb: 2 }}>
                      Wait {timer}s before requesting again
                    </Typography>
                  )}
                  <Button
                    onClick={handleGetVehicle}
                    disabled={timer > 0}
                    fullWidth
                    variant='outlined'
                    color='primary'
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Request Again
                  </Button>
                </Box>
              ) : (
                <Button
                  variant='contained'
                  onClick={handleGetVehicle}
                  fullWidth
                  size='large'
                  disabled={loading}
                  sx={{
                    height: 50,
                    borderRadius: 2,
                    bgcolor: '#ff4c51',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(255, 76, 81, 0.4)',
                    '&:hover': { bgcolor: '#eb454a' }
                  }}
                >
                  {loading ? <CircularProgress size={24} color='inherit' /> : 'Request Return'}
                </Button>
              )}

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button onClick={handleSearchAgain} size='small' sx={{ textTransform: 'none', color: '#888' }}>
                  Not this vehicle? Search again
                </Button>
              </Box>
            </CardContent>
          )}

          {viewState === 'result' && error && !bookingData && (
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Button onClick={handleSearchAgain}>Try Again</Button>
            </CardContent>
          )}
        </Card>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant='caption' sx={{ color: '#999' }}>
            © {new Date().getFullYear()} ParkMyWheels
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default PublicScannerPage
