'use client'

import { useState, useEffect, useRef } from 'react'

import { useSession } from 'next-auth/react'

// import { Html5QrcodeScanner } from 'html5-qrcode'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'

// Icons
import SearchIcon from '@mui/icons-material/Search'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'

// Utils
import { showNotification } from '@/utils/requestNotificationPermission'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const ScannerPage = () => {
  const { data: session } = useSession()
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [error, setError] = useState(null)
  const [scanResult, setScanResult] = useState(null)

  // Scanner state
  const [isScannerActive, setIsScannerActive] = useState(false)
  const scannerRef = useRef(null)

  const onScanSuccess = (decodedText, decodedResult) => {
    // Handle the scanned code
    // console.log(`Code matched = ${decodedText}`, decodedResult)
    setScanResult(decodedText)
    setVehicleNumber(decodedText)
    setIsScannerActive(false) // Stop scanning on success
    setOpenDialog(true)
  }

  const onScanFailure = error => {
    // console.warn(`Code scan error = ${error}`)
  }

  useEffect(() => {
    let scanner = null

    // Helper to initialize scanner
    const startScanner = async () => {
      if (isScannerActive) {
        try {
          // Dynamic import to avoid SSR issues
          const { Html5QrcodeScanner } = await import('html5-qrcode')

          // Small delay to ensure DOM element exists
          await new Promise(resolve => setTimeout(resolve, 100))

          const readerElement = document.getElementById('reader')

          if (readerElement) {
            // Check if scanner is already running to avoid duplicates
            if (scannerRef.current) {
              await scannerRef.current.clear().catch(err => console.warn('Cleanup error:', err))
            }

            scanner = new Html5QrcodeScanner(
              'reader',
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                disableFlip: false,

                // iOS specific optimization: prefer back camera
                videoConstraints: {
                  facingMode: 'environment'
                }
              },
              /* verbose= */ false
            )

            scanner.render(onScanSuccess, onScanFailure)
            scannerRef.current = scanner
          }
        } catch (err) {
          console.error('Error starting scanner:', err)

          // Show user friendly error for camera permissions
          if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
            alert('Camera access failure. Please ensure you are using HTTPS and have granted camera permissions.')
          }
        }
      }
    }

    startScanner()

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.warn('Failed to clear scanner', error)
        })
        scannerRef.current = null
      }
    }
  }, [isScannerActive])

  const handleManualOpen = () => {
    setVehicleNumber('')
    setBookingData(null)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setBookingData(null)
    setError(null)
    setVehicleNumber('')
  }

  const fetchBookingDetails = async () => {
    if (!vehicleNumber) return

    try {
      setLoading(true)
      setError(null)
      setBookingData(null)

      // Fetch all bookings for vendor and filter
      const vendorId = session?.user?.id

      if (!vendorId) {
        setError('Vendor ID not found')
        setLoading(false)

        return
      }

      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`)

      if (!response.ok) {
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
        } else {
          setError('No bookings found for this vehicle number')
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
    // Trigger return request notification
    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Notification Message Format requested by user
    const message = `${vehicleNumber} needs to be returned, customer confirmed return request at ${timeString}`

    // Show browser notification
    showNotification('Return Request', {
      body: message,
      icon: '/images/avatars/1.png'
    })

    // Log to console - simulating backend push
    console.log('Return Request Initiated:', message)

    // Ideally call API here
    // await fetch(`${API_URL}/vendor/returnRequest`, { method: 'POST', body: JSON.stringify({ vehicleNumber, time: timeString }) })

    alert(message)

    // setOpenDialog(false)
  }

  const getVehicleIcon = type => {
    return type?.toLowerCase() === 'car' ? <DirectionsCarIcon /> : <TwoWheelerIcon />
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' sx={{ mb: 3 }}>
        Vendor Scanner
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400
              }}
            >
              {!isScannerActive ? (
                <Button
                  variant='contained'
                  size='large'
                  startIcon={<QrCodeScannerIcon />}
                  onClick={() => setIsScannerActive(true)}
                  sx={{ mb: 2 }}
                >
                  Start Scanner
                </Button>
              ) : (
                <Box sx={{ width: '100%', maxWidth: 400 }}>
                  <div id='reader' style={{ width: '100%' }}></div>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => setIsScannerActive(false)}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Stop Scanner
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 3, width: '100%' }}>OR</Divider>

              <Button variant='outlined' onClick={handleManualOpen}>
                Enter Client Vehicle Number
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                How to use
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                1. <strong>Scan QR:</strong> Use the scanner to scan the customer's vehicle QR code.
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                2. <strong>Manual Entry:</strong> If scanning fails, enter the vehicle number manually.
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                3. <strong>Get Details:</strong> Click "Get Details" to view the booking status.
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                4. <strong>Return Request:</strong> Click "Get Vehicle" to notify the team that the customer has
                requested their vehicle.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Booking Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Vehicle Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={8}>
                <TextField
                  label='Vehicle Number'
                  fullWidth
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  size='small'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      fetchBookingDetails()
                    }
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant='contained'
                  onClick={fetchBookingDetails}
                  disabled={loading || !vehicleNumber}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Get Details'}
                </Button>
              </Grid>
            </Grid>

            {error && (
              <Alert severity='error' sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {bookingData && (
              <Card variant='outlined' sx={{ mt: 3, bgcolor: '#fbfbfb' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getVehicleIcon(bookingData.vehicleType)}
                      <Typography variant='h6'>{bookingData.vehicleNumber}</Typography>
                    </Box>
                    <Chip
                      label={bookingData.status}
                      color={['parked', 'approved'].includes(bookingData.status?.toLowerCase()) ? 'success' : 'default'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant='caption' color='text.secondary'>
                        Booking ID
                      </Typography>
                      <Typography variant='body2'>{bookingData._id || bookingData.id || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='caption' color='text.secondary'>
                        Vehicle Type
                      </Typography>
                      <Typography variant='body2'>{bookingData.vehicleType}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='caption' color='text.secondary'>
                        Date
                      </Typography>
                      <Typography variant='body2'>{bookingData.parkingDate || bookingData.bookingDate}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='caption' color='text.secondary'>
                        Time
                      </Typography>
                      <Typography variant='body2'>{bookingData.parkingTime || bookingData.bookingTime}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='caption' color='text.secondary'>
                        Customer
                      </Typography>
                      <Typography variant='body2'>{bookingData.personName || 'Guest'}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant='contained'
                      color='secondary'
                      onClick={handleGetVehicle}
                      startIcon={<DirectionsCarIcon />}
                      size='large'
                      fullWidth
                    >
                      Get Vehicle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ScannerPage
