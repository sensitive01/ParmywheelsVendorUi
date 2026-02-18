'use client'
import React, { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import axios from 'axios'

// MUI Imports
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  InputLabel
} from '@mui/material'

import HomeIcon from '@mui/icons-material/Home'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import CircleIcon from '@mui/icons-material/Circle'

import { showNotification } from '@/utils/requestNotificationPermission'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const BRAND_MAIN = '#329a73'
const BRAND_DARK = '#257a5a'
const BRAND_LIGHT = '#e8f5e9'

const PublicScannerPage = () => {
  const params = useParams()
  const vendorId = params.id
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const [valetToken, setValetToken] = useState('')
  const [plateNumber, setPlateNumber] = useState('')

  const [loading, setLoading] = useState(false)
  const [vendorLoading, setVendorLoading] = useState(true)
  const [bookingData, setBookingData] = useState(null)
  const [vendorData, setVendorData] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [viewState, setViewState] = useState('search') // 'search' | 'result'
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const [returnTimer, setReturnTimer] = useState(0)
  const [parkingDuration, setParkingDuration] = useState('00 h 00 m 00 s')
  const [isRestoringSession, setIsRestoringSession] = useState(true)

  // --- PERSISTENCE LOGIC (Load data on Mount) ---
  useEffect(() => {
    if (!vendorId) {
      return
    }

    try {
      const savedSession = localStorage.getItem(`valet_session_${vendorId}`)

      if (savedSession) {
        const parsed = JSON.parse(savedSession)

        if (parsed.timestamp && Date.now() - parsed.timestamp < 7200000) {
          setValetToken(parsed.valetToken || '')
          setPlateNumber(parsed.plateNumber || '')
          setBookingData(parsed.bookingData)
          setSuccessMessage(parsed.successMessage)

          if (parsed.returnTimerEnd) {
            const remaining = Math.floor((parsed.returnTimerEnd - Date.now()) / 1000)

            if (remaining > 0) setReturnTimer(remaining)
          }

          setViewState('result')
        } else {
          localStorage.removeItem(`valet_session_${vendorId}`)
        }
      }
    } catch (e) {
      console.error('Failed to restore session', e)
    } finally {
      setIsRestoringSession(false)
    }
  }, [vendorId])

  useEffect(() => {
    if (viewState === 'result' && bookingData) {
      const sessionData = {
        valetToken,
        plateNumber,
        bookingData,
        successMessage,
        timestamp: Date.now(),

        returnTimerEnd: returnTimer > 0 ? Date.now() + returnTimer * 1000 : null
      }

      localStorage.setItem(`valet_session_${vendorId}`, JSON.stringify(sessionData))
    } else if (viewState === 'search') {
    }
  }, [viewState, bookingData, successMessage, valetToken, plateNumber, vendorId, returnTimer])

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorId) return

      try {
        setVendorLoading(true)

        const response = await fetch(`${API_URL}/vendor/fetch-vendor-data?id=${vendorId}&t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })

        if (response.ok) {
          const result = await response.json()

          setVendorData(result.data)
        }
      } catch (err) {
        console.error('Error fetching vendor data:', err)
      } finally {
        setVendorLoading(false)
      }
    }

    fetchVendorData()
  }, [vendorId])

  useEffect(() => {
    let interval = null

    if (returnTimer > 0) {
      interval = setInterval(() => {
        setReturnTimer(prev => prev - 1)
      }, 1000)
    } else {
      clearInterval(interval)
      if (successMessage) setSuccessMessage(null)
    }

    return () => clearInterval(interval)
  }, [returnTimer, successMessage])

  useEffect(() => {
    let interval = null

    if (bookingData && viewState === 'result') {
      const updateDuration = () => {
        try {
          if (!bookingData.parkingDate || !bookingData.parkingTime) return

          const dateParts = bookingData.parkingDate.split('-')
          const timeParts = bookingData.parkingTime.match(/(\d+):(\d+)\s*(AM|PM)/)

          if (dateParts.length === 3 && timeParts) {
            let hours = parseInt(timeParts[1])
            const minutes = parseInt(timeParts[2])
            const ampm = timeParts[3]

            if (ampm === 'PM' && hours < 12) hours += 12
            if (ampm === 'AM' && hours === 12) hours = 0

            const parkedTime = new Date(
              parseInt(dateParts[2]),
              parseInt(dateParts[1]) - 1,
              parseInt(dateParts[0]),
              hours,
              minutes
            )

            const now = new Date()
            const diffMs = now - parkedTime
            const diffSeconds = Math.max(0, Math.floor(diffMs / 1000))

            const h = Math.floor(diffSeconds / 3600)
            const m = Math.floor((diffSeconds % 3600) / 60)
            const s = diffSeconds % 60

            setParkingDuration(
              `${h.toString().padStart(2, '0')} h ${m.toString().padStart(2, '0')} m ${s.toString().padStart(2, '0')} s`
            )
          }
        } catch (e) {
          console.error('Error parsing date', e)
          setParkingDuration('00 h 00 m 00 s')
        }
      }

      updateDuration()
      interval = setInterval(updateDuration, 1000)
    }

    return () => clearInterval(interval)
  }, [bookingData, viewState])

  useEffect(() => {
    if (bookingData && bookingData._id) {
      import('qrcode').then(QRCode => {
        QRCode.toDataURL(bookingData._id, { margin: 1, width: 200 })
          .then(url => {
            setQrCodeUrl(url)
          })
          .catch(err => {
            console.error(err)
          })
      })
    }
  }, [bookingData])

  const fetchBookingDetails = async () => {
    if (!plateNumber || !valetToken) {
      setError('Please enter both Token and Vehicle Number')

      return
    }

    const searchTerm = `${valetToken}-${plateNumber}`

    if (!vendorId) {
      setError('Vendor ID missing link')

      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { Pragma: 'no-cache' }
      })

      if (!response.ok) throw new Error('Failed to fetch bookings')

      const result = await response.json()

      if (result && result.bookings) {
        const matches = result.bookings.filter(
          b => b.vehicleNumber?.toString().toLowerCase() === searchTerm.toString().toLowerCase()
        )

        if (matches.length > 0) {
          const activeBooking =
            matches.find(b => ['parked', 'pending', 'approved'].includes(b.status?.toLowerCase())) || matches[0]

          if (activeBooking) {
            setBookingData(activeBooking)
            setViewState('result')
          } else {
            setError(`No active bookings found`)
          }
        } else {
          setError(`Vehicle not found: ${searchTerm}`)
        }
      } else {
        setError('No bookings found')
      }
    } catch (err) {
      setError('Error fetching details')
    } finally {
      setLoading(false)
    }
  }

  const handleGetVehicle = async () => {
    if (returnTimer > 0) return

    try {
      setLoading(true)

      const response = await axios.post(`${API_URL}/vendor/requestVehicleReturn`, {
        vendorId: vendorId,
        vehicleNumber: bookingData.vehicleNumber,
        bookingId: bookingData?._id,
        requestTime: new Date().toISOString()
      })

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(`Request sent!`)
        setError(null)
        setReturnTimer(300)
      } else {
        setSuccessMessage(`Request processed.`)
        setReturnTimer(300)
      }
    } catch (error) {
      setError('Connection failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchAgain = () => {
    setViewState('search')
    setValetToken('')
    setPlateNumber('')
    setError(null)
    setBookingData(null)
    setSuccessMessage(null)
    setReturnTimer(0)

    localStorage.removeItem(`valet_session_${vendorId}`)
  }

  const handleFooterLink = () => {
    window.location.href = 'https://parkmywheels.com/app.html'
  }

  const getTimerParts = seconds => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    }
  }

  const returnTimeParts = getTimerParts(returnTimer)

  if (isRestoringSession) {
    return (
      <Box sx={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pt: 'env(safe-area-inset-top)',
        pb: 'env(safe-area-inset-bottom)'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '500px',
          height: '100vh',
          maxHeight: isDesktop ? '95vh' : '100vh',
          bgcolor: 'white',
          borderRadius: isDesktop ? 4 : 0,
          boxShadow: isDesktop ? '0 20px 40px rgba(0,0,0,0.1)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        }} >
        <Box
          sx={{
            height: 80,
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            borderBottom: '1px solid #f0f0f0',
            flexShrink: 0
          }}
        >
          <Box sx={{ width: 40 }} />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {vendorData?.image ? (
                <img src={vendorData.image} alt='Logo' style={{ width: 30, height: 30, objectFit: 'contain' }} />
              ) : (
                <img src='/public/login.png' alt='PMW' style={{ height: 24, objectFit: 'contain' }} />
              )}
            </Box>
            <Typography variant='caption' sx={{ fontWeight: 800, color: '#1a1b2e' }}>
              {vendorData?.vendorName || 'PARKMYWHEELS'}
            </Typography>
          </Box>

          <Box sx={{ width: 40 }} />
        </Box>
        {/* CONTENT - Flex Centered if Search */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 3,
            pb: 12,
            bgcolor: viewState === 'result' ? '#f8f8f8' : 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: viewState === 'search' ? 'center' : 'flex-start',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {viewState === 'search' && (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant='h5' sx={{ color: '#1a1b2e', fontWeight: 800, mb: 1 }}>
                Valet Check-in
              </Typography>
              <Typography variant='body2' sx={{ color: '#666', mb: 4 }}>
                Please enter your details below
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
                <Box sx={{ flex: '0 0 30%' }}>
                  <InputLabel sx={{ mb: 1, fontSize: '0.85rem', fontWeight: 700, color: '#333' }}>TOKEN</InputLabel>
                  <TextField
                    fullWidth
                    placeholder='1'
                    value={valetToken}
                    onChange={e => setValetToken(e.target.value.toUpperCase())}
                    variant='outlined'
                    type='tel'
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        fontWeight: 700,
                        bgcolor: '#fff',
                        '& input': { textAlign: 'center', p: 1.5 }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <InputLabel sx={{ mb: 1, fontSize: '0.85rem', fontWeight: 700, color: '#333' }}>
                    VEHICLE NUMBER
                  </InputLabel>
                  <TextField
                    fullWidth
                    placeholder='Last 4 digits'
                    value={plateNumber}
                    onChange={e => setPlateNumber(e.target.value.toUpperCase())}
                    variant='outlined'
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        fontWeight: 700,
                        bgcolor: '#fff',
                        '& input': { p: 1.5 }
                      }
                    }}
                  />
                </Box>
              </Box>

              <Button
                fullWidth
                size='large'
                variant='contained'
                onClick={fetchBookingDetails}
                disabled={loading || !plateNumber || !valetToken}
                sx={{
                  height: 56,
                  borderRadius: 3,
                  bgcolor: BRAND_MAIN,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(50, 154, 115, 0.3)',
                  '&:hover': { bgcolor: BRAND_DARK }
                }}
              >
                {loading ? <CircularProgress size={24} color='inherit' /> : 'Find Vehicle'}
              </Button>

              {error && (
                <Alert severity='error' sx={{ mt: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}

          {viewState === 'result' && bookingData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: '#e6f4ea',
                  border: '1px solid #dcefe3',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {valetToken && (
                    <Box>
                      <Typography variant='caption' sx={{ color: '#555', fontWeight: 600 }}>
                        Token Number
                      </Typography>
                      <Typography variant='h4' sx={{ color: '#111', fontWeight: 800 }}>
                        #{valetToken}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant='caption' sx={{ color: '#555', fontWeight: 600 }}>
                      Vehicle Number
                    </Typography>
                    <Typography variant={valetToken ? 'h6' : 'h5'} sx={{ color: '#111', fontWeight: 800 }}>
                      {bookingData.vehicleNumber.includes('-')
                        ? bookingData.vehicleNumber.split('-').slice(1).join('-')
                        : bookingData.vehicleNumber}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant='caption' sx={{ color: '#555', fontWeight: 600 }}>
                      Parking Date & Time
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#333', fontWeight: 700 }}>
                      {bookingData.parkingDate} {bookingData.parkingTime}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant='caption' sx={{ color: '#555', fontWeight: 600 }}>
                      Duration
                    </Typography>
                    <Typography variant='body1' sx={{ color: '#333', fontWeight: 600, fontFamily: 'monospace' }}>
                      {parkingDuration}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt='QR' style={{ width: 120, height: 120 }} />
                  ) : (
                    <CircularProgress size={30} />
                  )}
                  <Typography variant='caption' sx={{ mt: 1, color: '#666', fontSize: '0.65rem', fontWeight: 600 }}>
                    Display at exit
                  </Typography>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#e6f4ea',
                  border: '1px solid #dcefe3',
                  p: 2.5,
                  position: 'relative'
                }}
              >
                <Box sx={{ position: 'absolute', top: 35, bottom: 35, left: 29, width: 2, bgcolor: '#ccc' }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <CircleIcon
                    sx={{
                      fontSize: 14,
                      color: 'transparent',
                      border: '2px solid #555',
                      borderRadius: '50%',
                      mt: 0.5,
                      zIndex: 1
                    }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#111' }}>
                      Pickup (Parked)
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#333' }}>
                      {bookingData.parkingDate} {bookingData.parkingTime}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CircleIcon
                    sx={{
                      fontSize: 14,
                      color: successMessage ? BRAND_MAIN : 'transparent',
                      border: `2px solid ${successMessage ? BRAND_MAIN : '#555'}`,
                      borderRadius: '50%',
                      mt: 0.5,
                      zIndex: 1
                    }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#111' }}>
                      Return
                    </Typography>
                    {successMessage ? (
                      <Typography variant='caption' sx={{ color: BRAND_MAIN, fontWeight: 700 }}>
                        Requested
                      </Typography>
                    ) : (
                      <Typography variant='caption' sx={{ color: '#666' }}>
                        -
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#f8f8f8',
                  p: 0,
                  mt: 1
                }}
              >
                {successMessage ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      bgcolor: '#fff',
                      borderRadius: 3,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Typography variant='body2' sx={{ color: '#666', mb: 1.5, fontWeight: 600 }}>
                      Your car arrives in
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {[returnTimeParts.h, returnTimeParts.m, returnTimeParts.s].map((val, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              bgcolor: '#eee',
                              minWidth: 40,
                              py: 1,
                              borderRadius: 2,
                              fontSize: '1.4rem',
                              fontWeight: 600,
                              color: '#333'
                            }}
                          >
                            {val}
                          </Box>
                          {i < 2 && <Typography sx={{ fontWeight: 700, color: '#888' }}>:</Typography>}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    size='large'
                    variant='contained'
                    onClick={handleGetVehicle}
                    disabled={loading}
                    sx={{
                      height: 56,
                      borderRadius: 3,
                      bgcolor: '#1a1b2e',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(26, 27, 46, 0.2)',
                      '&:hover': { bgcolor: '#000' }
                    }}
                  >
                    {loading ? <CircularProgress size={26} color='inherit' /> : 'Request Return'}
                  </Button>
                )}
              </Paper>
            </Box>
          )}
        </Box>
        <Paper
          elevation={0}
          sx={{
            borderTop: '1px solid #f0f0f0',
            bgcolor: 'white',
            pb: 'env(safe-area-inset-bottom)'
          }}
        >
          <Grid container>
            {[
              { label: 'Home', icon: <HomeIcon /> },
              { label: 'Valet', icon: <LocalParkingIcon />, active: true },
              { label: 'Bookings', icon: <CalendarTodayIcon /> },
              { label: 'Account', icon: <PersonIcon /> }
            ].map((item, index) => (
              <Grid item xs={3} key={index}>
                <Box
                  onClick={() => !item.active && handleFooterLink()}
                  sx={{
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: item.active ? BRAND_MAIN : '#B0B5C0',
                    position: 'relative'
                  }}
                >
                  {item.active && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        width: 30,
                        height: 3,
                        bgcolor: BRAND_MAIN,
                        borderRadius: '0 0 4px 4px'
                      }}
                    />
                  )}
                  <Box sx={{ mb: 0.5 }}>{React.cloneElement(item.icon, { fontSize: 'medium' })}</Box>
                  <Typography variant='caption' sx={{ fontSize: '0.7rem', fontWeight: item.active ? 700 : 500 }}>
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  )
}

export default PublicScannerPage
