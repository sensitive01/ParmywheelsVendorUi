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
  InputLabel,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'

import HomeIcon from '@mui/icons-material/Home'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import CircleIcon from '@mui/icons-material/Circle'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FullscreenIcon from '@mui/icons-material/Fullscreen'

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

  const [openImages, setOpenImages] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)

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

          // Show historical data immediately for better UX
          if (parsed.bookingData) setBookingData(parsed.bookingData)
          if (parsed.successMessage) setSuccessMessage(parsed.successMessage)

          if (parsed.returnTimerEnd) {
            const remaining = Math.floor((parsed.returnTimerEnd - Date.now()) / 1000)

            if (remaining > 0) setReturnTimer(remaining)
          }

          setViewState('result')

          // CRITICAL: Immediately re-verify with the API to prevent stale "Parked" status
          if (parsed.valetToken && parsed.plateNumber) {
            fetchBookingDetails(parsed.valetToken, parsed.plateNumber, true)
          }
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

  // Periodic refresh while on result page to detect when vendor exits vehicle
  useEffect(() => {
    let refreshInterval = null

    if (viewState === 'result' && bookingData && bookingData.status?.toLowerCase() === 'parked') {
      refreshInterval = setInterval(() => {
        fetchBookingDetails(valetToken, plateNumber, true)
      }, 30000) // Re-check every 30s
    }

    return () => clearInterval(refreshInterval)
  }, [viewState, bookingData, valetToken, plateNumber])

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

    // Stop and clear timer if vehicle is completed
    if (bookingData?.status?.toLowerCase() === 'completed') {
      if (returnTimer !== 0) setReturnTimer(0)
      if (successMessage) setSuccessMessage(null)

      return
    }

    if (returnTimer > 0) {
      interval = setInterval(() => {
        setReturnTimer(prev => prev - 1)
      }, 1000)
    } else {
      clearInterval(interval)
      if (successMessage) setSuccessMessage(null)
    }

    return () => clearInterval(interval)
  }, [returnTimer, successMessage, bookingData])

  useEffect(() => {
    let interval = null

    if (bookingData && viewState === 'result') {
      const updateDuration = () => {
        try {
          if (!bookingData.parkingDate || !bookingData.parkingTime) return

          const parseDateTime = (dateStr, timeStr) => {
            const dateParts = dateStr.split('-')
            const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)/i)

            if (dateParts.length === 3 && timeParts) {
              let hours = parseInt(timeParts[1])
              const minutes = parseInt(timeParts[2])
              const ampm = timeParts[3].toUpperCase()

              if (ampm === 'PM' && hours < 12) hours += 12
              if (ampm === 'AM' && hours === 12) hours = 0

              return new Date(
                parseInt(dateParts[2]),
                parseInt(dateParts[1]) - 1,
                parseInt(dateParts[0]),
                hours,
                minutes
              )
            }

            return null
          }

          const parkedTime = parseDateTime(bookingData.parkingDate, bookingData.parkingTime)

          let endTime = new Date()

          if (
            bookingData.status?.toLowerCase() === 'completed' &&
            bookingData.exitvehicledate &&
            bookingData.exitvehicletime
          ) {
            const exitTime = parseDateTime(bookingData.exitvehicledate, bookingData.exitvehicletime)

            if (exitTime) endTime = exitTime
          }

          if (parkedTime) {
            const diffMs = endTime - parkedTime
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

      if (bookingData.status?.toLowerCase() === 'parked') {
        interval = setInterval(updateDuration, 1000)
      }
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

  const fetchBookingDetails = async (token = null, plate = null, isSilent = false) => {
    // If called from an event handler (like onClick), 'token' will be the event object.
    // We only want to use the 'token' argument if it's a string or number.
    const cleanToken = typeof token === 'string' || typeof token === 'number' ? token : null
    const cleanPlate = typeof plate === 'string' || typeof plate === 'number' ? plate : null

    const finalToken = cleanToken || valetToken
    const finalPlate = cleanPlate || plateNumber

    if (!finalPlate || !finalToken) {
      if (!isSilent) setError('Please enter both Token and Vehicle Number')

      return
    }

    const searchTerm = `${finalToken}-${finalPlate}`

    if (!vendorId) {
      if (!isSilent) setError('Vendor ID missing link')

      return
    }

    try {
      if (!isSilent) setLoading(true)
      if (!isSilent) setError(null)

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
          // Find active booking first, else latest
          const activeBooking =
            matches.find(b => ['parked', 'pending', 'approved'].includes(b.status?.toLowerCase())) || matches[0]

          if (activeBooking) {
            // Update storage if status changed
            if (activeBooking.status !== bookingData?.status) {
              setBookingData(activeBooking)
            } else {
              setBookingData(activeBooking) // Refresh the full object
            }

            setViewState('result')
          } else {
            if (!isSilent) setError(`No active bookings found`)
          }
        } else {
          if (!isSilent) setError(`Vehicle not found: ${searchTerm}`)
        }
      } else {
        if (!isSilent) setError('No bookings found')
      }
    } catch (err) {
      if (!isSilent) setError('Error fetching details')
    } finally {
      if (!isSilent) setLoading(false)
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
      <Box sx={{ width: '100vw', height: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100dvh',
        bgcolor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: isDesktop ? 'center' : 'stretch',
        pt: isDesktop ? 4 : 'env(safe-area-inset-top)',
        pb: isDesktop ? 4 : 'env(safe-area-inset-bottom)'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '500px',
          height: isDesktop ? 'auto' : '100dvh',
          minHeight: isDesktop ? '600px' : '100dvh',
          maxHeight: isDesktop ? '95vh' : '100dvh',
          bgcolor: 'white',
          borderRadius: isDesktop ? 4 : 0,
          boxShadow: isDesktop ? '0 20px 40px rgba(0,0,0,0.1)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
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
            px: { xs: 2.5, sm: 3 },
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
                onClick={() => fetchBookingDetails()}
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

                  {bookingData?.vehicleImages?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant='caption'
                        sx={{
                          color: '#555',
                          fontWeight: 700,
                          mb: 1,
                          display: 'block',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        Vehicle Photos
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          overflowX: 'auto',
                          pb: 1,
                          '&::-webkit-scrollbar': { height: 4 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 2 }
                        }}
                      >
                        {bookingData.vehicleImages.map((img, idx) => (
                          <Box
                            key={idx}
                            onClick={() => {
                              setSelectedImage(img)
                              setOpenImages(true)
                              setZoom(1)
                            }}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              overflow: 'hidden',
                              flexShrink: 0,
                              cursor: 'pointer',
                              position: 'relative',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              border: '2px solid white',
                              '&:hover': { transform: 'scale(1.05)', transition: '0.2s' }
                            }}
                          >
                            <img
                              src={img}
                              alt={`Vehicle ${idx}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                p: 0.5,
                                display: 'flex',
                                borderRadius: '4px 0 0 0'
                              }}
                            >
                              <FullscreenIcon sx={{ fontSize: 14 }} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
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

              {bookingData?.status?.toLowerCase() === 'completed' ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: '#e6f4ea',
                    border: '1px solid #dcefe3',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='h6' sx={{ color: '#1a1b2e', fontWeight: 800 }}>
                      Status:
                    </Typography>
                    <Typography variant='h6' sx={{ color: BRAND_MAIN, fontWeight: 800, textTransform: 'capitalize' }}>
                      Completed
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='body2' sx={{ color: '#555', fontWeight: 600 }}>
                      Exit Date & Time:
                    </Typography>
                    <Typography variant='body1' sx={{ color: '#111', fontWeight: 700 }}>
                      {bookingData.exitvehicledate} {bookingData.exitvehicletime}
                    </Typography>
                  </Box>
                </Paper>
              ) : bookingData?.status?.toLowerCase() === 'parked' ? (
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
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: '#fff0f0',
                    border: '1px solid #ffcccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant='h6' sx={{ color: '#d32f2f', fontWeight: 800 }}>
                    Not Parked
                  </Typography>
                </Paper>
              )}

              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#f8f8f8',
                  p: 0,
                  mt: 1
                }}
              >
                {successMessage && bookingData?.status?.toLowerCase() !== 'completed' ? (
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
                      '&:hover': { bgcolor: '#000' },
                      display: bookingData?.status?.toLowerCase() === 'completed' ? 'none' : 'flex'
                    }}
                  >
                    {loading ? <CircularProgress size={26} color='inherit' /> : 'Get my Vehicle'}
                  </Button>
                )}
              </Paper>
              <Box sx={{ mt: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant='outlined'
                  onClick={handleSearchAgain}
                  sx={{
                    height: 56,
                    borderRadius: 3,
                    borderColor: '#e0e0e0',
                    color: '#555',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    bgcolor: 'white',
                    '&:hover': { borderColor: '#ccc', bgcolor: '#f9f9f9', color: '#333' }
                  }}
                >
                  Check Another Vehicle
                </Button>
              </Box>
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
        {/* Image Dialog */}
        <Dialog
          open={openImages}
          onClose={() => setOpenImages(false)}
          maxWidth='lg'
          fullWidth
          fullScreen={!isDesktop}
          PaperProps={{
            sx: {
              borderRadius: isDesktop ? 4 : 0,
              overflow: 'hidden',
              bgcolor: '#000',
              backgroundImage: 'none',
              display: 'flex',
              flexDirection: 'column',
              height: isDesktop ? '92vh' : '100dvh',
              maxHeight: '100dvh'
            }
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              bgcolor: '#000',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            {/* Standard Header (Maintains correct spacing) */}
            <Box
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#0a0a0a',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                pt: !isDesktop ? 'max(16px, env(safe-area-inset-top))' : 2.5,
                flexShrink: 0
              }}
            >
              <Box>
                <Typography variant='subtitle1' sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: 0.5 }}>
                  Vehicle Gallery
                </Typography>
                <Typography variant='caption' sx={{ opacity: 0.7, fontWeight: 700 }}>
                  {bookingData?.vehicleImages?.indexOf(selectedImage) + 1} / {bookingData?.vehicleImages?.length}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setOpenImages(false)}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  width: 42,
                  height: 42
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'none',
                bgcolor: '#000',
                minHeight: 0 // Flex child requires this for internal height calculation
              }}
            >
              {isDesktop && bookingData?.vehicleImages?.length > 1 && (
                <>
                  <IconButton
                    onClick={() => {
                      const idx = bookingData.vehicleImages.indexOf(selectedImage)
                      const newIdx = (idx - 1 + bookingData.vehicleImages.length) % bookingData.vehicleImages.length

                      setSelectedImage(bookingData.vehicleImages[newIdx])
                      setZoom(1)
                    }}
                    sx={{
                      position: 'absolute',
                      left: 24,
                      zIndex: 40,
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <ChevronLeftIcon fontSize='large' />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      const idx = bookingData.vehicleImages.indexOf(selectedImage)
                      const newIdx = (idx + 1) % bookingData.vehicleImages.length

                      setSelectedImage(bookingData.vehicleImages[newIdx])
                      setZoom(1)
                    }}
                    sx={{
                      position: 'absolute',
                      right: 24,
                      zIndex: 40,
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <ChevronRightIcon fontSize='large' />
                  </IconButton>
                </>
              )}

              <Box
                onMouseMove={e => {
                  if (!isDesktop) return
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - left) / width) * 100
                  const y = ((e.clientY - top) / height) * 100

                  setMousePos({ x, y })
                  setIsHovering(true)
                }}
                onMouseLeave={() => setIsHovering(false)}
                onTouchStart={e => {
                  if (isDesktop) return
                  setIsHovering(true)
                  const touch = e.touches[0]
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
                  const x = ((touch.clientX - left) / width) * 100
                  const y = ((touch.clientY - top) / height) * 100

                  setMousePos({ x, y })
                }}
                onTouchMove={e => {
                  if (isDesktop) return
                  const touch = e.touches[0]
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
                  const x = Math.min(100, Math.max(0, ((touch.clientX - left) / width) * 100))
                  const y = Math.min(100, Math.max(0, ((touch.clientY - top) / height) * 100))

                  setMousePos({ x, y })
                }}
                onTouchEnd={() => !isDesktop && setIsHovering(false)}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: isDesktop ? 'crosshair' : 'zoom-in',
                  p: isDesktop ? 3 : 1,
                  touchAction: 'none' // Prevent page scroll when zooming
                }}
              >
                <img
                  src={selectedImage}
                  alt='Vehicle'
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: isHovering ? `scale(2.5)` : `scale(${zoom})`,
                    transition: isHovering ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformOrigin: isHovering ? `${mousePos.x}% ${mousePos.y}%` : 'center center',
                    objectFit: 'contain',
                    userSelect: 'none',
                    WebkitUserDrag: 'none',
                    boxShadow: isHovering ? 'none' : '0 4px 30px rgba(0,0,0,0.5)',
                    borderRadius: 4
                  }}
                />
              </Box>

              {/* Floating Zoom UI */}
              <Paper
                elevation={10}
                sx={{
                  position: 'absolute',
                  bottom: isDesktop ? 30 : 50,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.6,
                  borderRadius: 8,
                  bgcolor: 'rgba(28, 28, 30, 0.85)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  zIndex: 50
                }}
              >
                <IconButton
                  onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}
                  disabled={zoom <= 1}
                  size='small'
                  sx={{ color: 'white', '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}
                >
                  <ZoomOutIcon />
                </IconButton>
                <Typography
                  variant='caption'
                  sx={{ color: 'white', fontWeight: 900, px: 2, minWidth: 45, textAlign: 'center' }}
                >
                  {Math.round(zoom * 100)}%
                </Typography>
                <IconButton
                  onClick={() => setZoom(prev => Math.min(4, prev + 1))}
                  disabled={zoom >= 4}
                  size='small'
                  sx={{ color: 'white', '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}
                >
                  <ZoomInIcon />
                </IconButton>
              </Paper>
            </Box>

            {/* Thumbnail Strip with Safe Area Padding */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#0a0a0a',
                display: 'flex',
                gap: 1.5,
                overflowX: 'auto',
                justifyContent: isDesktop ? 'center' : 'flex-start',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                zIndex: 60,
                pb: !isDesktop ? 'max(16px, env(safe-area-inset-bottom))' : 2,
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }
              }}
            >
              {bookingData?.vehicleImages?.map((img, idx) => (
                <Box
                  key={idx}
                  onClick={() => {
                    setSelectedImage(img)
                    setZoom(1)
                  }}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: selectedImage === img ? `3px solid ${BRAND_MAIN}` : '2px solid transparent',
                    opacity: selectedImage === img ? 1 : 0.4,
                    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: selectedImage === img ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: selectedImage === img ? `0 0 15px ${BRAND_MAIN}55` : 'none'
                  }}
                >
                  <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  )
}

export default PublicScannerPage
