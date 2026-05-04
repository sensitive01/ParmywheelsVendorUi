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

import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { showNotification } from '@/utils/requestNotificationPermission'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const BRAND_GRADIENT = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
const DARK_GRADIENT = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
const BLUE_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
const NEUTRAL_BG = '#0A0C10'
const TEXT_DARK = '#FFFFFF'
const TEXT_LIGHT = '#94A3B8'
const BRAND_MAIN = '#10B981'

const PublicScannerPage = () => {
  const params = useParams()
  const vendorId = params.id
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const [valetToken, setValetToken] = useState('')
  const [isBookingSuccess, setIsBookingSuccess] = useState(false)
  const [plateNumber, setPlateNumber] = useState('')

  const [loading, setLoading] = useState(false)
  const [vendorLoading, setVendorLoading] = useState(true)
  const [bookingData, setBookingData] = useState(null)
  const [vendorData, setVendorData] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [mainMode, setMainMode] = useState('finding') // 'selection' | 'booking' | 'finding'
  const [viewState, setViewState] = useState('search') // 'search' | 'result'

  // Booking specific states
  const [vehicleType, setVehicleType] = useState('Car')
  const [bookingType, setBookingType] = useState('Instant') // 'Instant' | 'Schedule' | 'Subscription'
  const [bookingName, setBookingName] = useState('')
  const [bookingMobile, setBookingMobile] = useState('')
  const [bookingPlate, setBookingPlate] = useState('')
  const [bookingDate, setBookingDate] = useState('') // Combined Fallback
  const [bookingTime, setBookingTime] = useState('') // Combined Fallback
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [bookingCarType, setBookingCarType] = useState('')
  const [charges, setCharges] = useState([])
  const [availableSlots, setAvailableSlots] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const [openImages, setOpenImages] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)

  const [returnTimer, setReturnTimer] = useState(0)
  const [parkingDuration, setParkingDuration] = useState('00 h 00 m 00 s')
  const [valetMode, setValetMode] = useState('dark') // 'dark' | 'light'
  
  // Restore Session
  useEffect(() => {
    if (!vendorId) return

    const saved = localStorage.getItem(`valet_session_${vendorId}`)

    if (saved) {
      try {
        const { token, plate } = JSON.parse(saved)

        if (token) setValetToken(token)
        if (plate) setPlateNumber(plate)

        // Silent fetch to restore view if already parked
        if (token && plate) {
          fetchBookingDetails(token, plate, true)
        }
      } catch (e) {
        console.error('Session restore failed', e)
      }
    }
  }, [vendorId])

  // Fetch Vendor Data periodically

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

  // Fetch charges and slots for booking
  useEffect(() => {
    if (!vendorId || mainMode !== 'booking') return

    const fetchBookingEssentials = async () => {
      try {
        // Fetch Charges
        const chargesRes = await axios.get(`${API_URL}/vendor/getchargesdata/${vendorId}`)

        if (chargesRes.data?.vendor?.charges) {
          setCharges(chargesRes.data.vendor.charges)
        }

        // Fetch Slots
        const slotsRes = await axios.get(`${API_URL}/vendor/availableslots/${vendorId}`)

        if (slotsRes.data) {
          setAvailableSlots(slotsRes.data)
        }
      } catch (e) {
        console.error('Error fetching booking essentials:', e)
      }
    }

    fetchBookingEssentials()
  }, [vendorId, mainMode])

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
        const matches = result.bookings.filter(b => {
          const vNum = b.vehicleNumber?.toString().toLowerCase() || ''
          const sTerm = searchTerm.toString().toLowerCase()

          // Match exact (token-plate) or matches token-plate-location
          return vNum === sTerm || vNum.startsWith(sTerm + '-')
        })

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

            localStorage.setItem(`valet_session_${vendorId}`, JSON.stringify({ token: finalToken, plate: finalPlate }))
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
        setReturnTimer(1200)
      } else {
        setSuccessMessage(`Request processed.`)
        setReturnTimer(1200)
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


  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100dvh',
        background: '#05070A',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-5%',
          width: '70%',
          height: '70%',
          background: `radial-gradient(circle, ${BRAND_MAIN}15 0%, transparent 70%)`,
          zIndex: 0,
          filter: 'blur(80px)'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, #3B82F610 0%, transparent 70%)',
          zIndex: 0,
          filter: 'blur(80px)'
        }
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '450px',
          height: isDesktop ? '92vh' : '100dvh',
          bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.015)' : '#FFFFFF',
          backdropFilter: valetMode === 'dark' ? 'blur(40px)' : 'none',
          border: valetMode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: valetMode === 'dark' ? '0 40px 100px rgba(0,0,0,0.5)' : 'none',
          borderRadius: isDesktop ? 10 : 0,
          borderBottomLeftRadius: 0, // Enforce flat bottom always
          borderBottomRightRadius: 0,
          zIndex: 1,
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundImage: valetMode === 'dark'
            ? 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.08) 0, transparent 50%)'
            : 'none'
        }}
      >
        <Box
          sx={{
            pt: 4,
            pb: 1,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Theme Toggle Overlay */}
          <IconButton
            onClick={() => setValetMode(prev => prev === 'dark' ? 'light' : 'dark')}
            sx={{
              position: 'absolute',
              right: 20,
              top: 30,
              bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: valetMode === 'dark' ? 'white' : '#05070A',
              '&:hover': { bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
            }}
          >
            {valetMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: '1px solid',
              borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            {vendorData?.image ? (
              <img src={vendorData.image} alt='Logo' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <DirectionsCarIcon sx={{ color: BRAND_MAIN, fontSize: 28 }} />
            )}
          </Box>
          <Typography variant='h6' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', letterSpacing: 1, fontSize: '0.85rem', textAlign: 'center' }}>
            {vendorData?.vendorName?.toUpperCase() || 'VALET ELITE'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: BRAND_MAIN, boxShadow: `0 0 10px ${BRAND_MAIN}` }} />
            <Typography variant='caption' sx={{ color: valetMode === 'dark' ? TEXT_LIGHT : '#64748b', fontWeight: 800, letterSpacing: 2, fontSize: '0.55rem', opacity: 0.8 }}>
              PREMIUM CONCIERGE OPEN
            </Typography>
          </Box>
        </Box>
        {/* CONTENT - Flex Centered if Search */}
        {/* Obsidian Concierge Panels */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 2.5, sm: 4 },
            pt: 2,
            pb: 16,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {mainMode === 'selection' && viewState === 'search' && (
            <Box sx={{ width: '100%', px: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', pb: 8 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant='h5' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', letterSpacing: -0.5 }}>
                   Portal Selection
                </Typography>
                <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#64748b', opacity: 0.7, fontWeight: 700, letterSpacing: 1 }}>
                  CHOOSE YOUR SERVICE TYPE BELOW
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Book Slot - Portal */}
                {/* 
                <Box
                  onClick={() => setMainMode('booking')}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    cursor: 'pointer',
                    bgcolor: valetMode === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid',
                    borderColor: valetMode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    transition: '0.4s',
                    boxShadow: valetMode === 'dark' ? '0 15px 35px rgba(0,0,0,0.4)' : '0 10px 30px rgba(16, 185, 129, 0.1)',
                    '&:hover': { transform: 'translateY(-4px)', borderColor: BRAND_MAIN }
                  }}
                >
                  <Box sx={{ width: 68, height: 68, borderRadius: 5, bgcolor: BRAND_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <DirectionsCarIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h5' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', letterSpacing: -0.5 }}>Book Slot</Typography>
                    <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#64748b', opacity: 0.8, fontWeight: 800 }}>BOOK PARKING SLOTS</Typography>
                  </Box>
                </Box>
                */}

                {/* Get My Vehicle - Portal */}
                <Box
                  onClick={() => setMainMode('finding')}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    cursor: 'pointer',
                    bgcolor: valetMode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid',
                    borderColor: valetMode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    transition: '0.4s',
                    boxShadow: valetMode === 'dark' ? '0 15px 35px rgba(0,0,0,0.4)' : '0 10px 30px rgba(59, 130, 246, 0.1)',
                    '&:hover': { transform: 'translateY(-4px)', borderColor: '#3b82f6' }
                  }}
                >
                  <Box sx={{ width: 68, height: 68, borderRadius: 5, bgcolor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <LocalParkingIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h5' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', letterSpacing: -0.5 }}>Get My Vehicle</Typography>
                    <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#64748b', opacity: 0.8, fontWeight: 800 }}>GET MY VEHICLE</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}


              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant='caption' sx={{ color: valetMode === 'dark' ? TEXT_LIGHT : '#475569', opacity: valetMode === 'dark' ? 0.3 : 0.6, letterSpacing: 8, fontWeight: 900, fontSize: '0.55rem' }}>
                  PARKMYWHEELS
                </Typography>
              </Box>

          {mainMode === 'booking' && viewState === 'search' && (
            <Box sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
                <IconButton
                  onClick={() => setMainMode('selection')}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    mr: 3,
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    p: 1.5
                  }}
                  size='small'
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Box>
                  <Typography variant='h4' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 950, letterSpacing: -1 }}>
                    New <span style={{ color: valetMode === 'dark' ? 'white' : BRAND_MAIN }}>Booking</span>
                  </Typography>
                  <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 700, letterSpacing: 2, opacity: 0.6 }}>
                    SECURE INDUCTION
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 4, display: 'flex', bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)', p: 0.75, borderRadius: 5, border: valetMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                {['Instant', 'Schedule', 'Subscription'].map(type => (
                  <Box
                    key={type}
                    onClick={() => setBookingType(type)}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      textAlign: 'center',
                      borderRadius: 4.5,
                      cursor: 'pointer',
                      bgcolor: bookingType === type ? (valetMode === 'dark' ? 'white' : '#05070A') : 'transparent',
                      color: bookingType === type ? (valetMode === 'dark' ? '#05070A' : 'white') : (valetMode === 'dark' ? 'white' : '#05070A'),
                      fontWeight: 900,
                      fontSize: '0.7rem',
                      letterSpacing: 1,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  >
                    {type.toUpperCase()}
                  </Box>
                ))}
              </Box>

              {/* Vehicle Selection */}
               <Box sx={{ mb: 4 }}>
                <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 900, ml: 1, letterSpacing: 2, fontSize: '0.65rem' }}>
                  VEHICLE CATEGORY
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { id: 'Car', label: 'Car', icon: DirectionsCarIcon },
                    { id: 'Bike', label: 'Bike', icon: TwoWheelerIcon },
                    { id: 'Others', label: 'Other', icon: LocalShippingIcon }
                  ].map(type => (
                    <Grid item xs={4} key={type.id}>
                      <Box
                        onClick={() => setVehicleType(type.id)}
                        sx={{
                          py: 2.5,
                          borderRadius: 5,
                          cursor: 'pointer',
                          bgcolor: vehicleType === type.id ? (valetMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') : (valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                          color: valetMode === 'dark' ? 'white' : '#05070A',
                          border: '1px solid',
                          borderColor: vehicleType === type.id ? (valetMode === 'dark' ? 'white' : '#05070A') : (valetMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'),
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1.2,
                          transition: 'all 0.3s',
                          opacity: vehicleType === type.id ? 1 : 0.4
                        }}
                      >
                        <type.icon sx={{ fontSize: 28, color: 'inherit' }} />
                        <Typography variant='caption' sx={{ fontWeight: 900, fontSize: '0.65rem', letterSpacing: 1.5, color: 'inherit' }}>
                          {type.label.toUpperCase()}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {/* Identification */}
                <Box>
                  <Typography variant='caption' sx={{ fontWeight: 900, color: valetMode === 'dark' ? 'white' : '#05070A', ml: 1, mb: 1, display: 'block', letterSpacing: 1 }}>
                    VEHICLE NUMBER
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder='VEHICLE NUMBER'
                    value={bookingPlate}
                    onChange={e => setBookingPlate(e.target.value.toUpperCase())}
                    variant='outlined'
                    InputProps={{
                      sx: {
                        borderRadius: 5,
                        fontWeight: 900,
                        color: valetMode === 'dark' ? 'white' : '#05070A',
                        bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        fontSize: '1.1rem',
                        '& fieldset': { border: valetMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' },
                        '&:hover fieldset': { borderColor: valetMode === 'dark' ? 'white' : '#05070A' },
                        '&.Mui-focused fieldset': { borderColor: valetMode === 'dark' ? 'white' : '#05070A', boxShadow: valetMode === 'dark' ? '0 0 15px rgba(255,255,255,0.1)' : 'none' },
                        '& input::placeholder': { color: valetMode === 'dark' ? 'white' : '#05070A', opacity: 0.3 }
                      }
                    }}
                  />
                </Box>

                {/* Contact */}
                <Box>
                  <Typography variant='caption' sx={{ fontWeight: 900, color: valetMode === 'dark' ? 'white' : '#05070A', ml: 1, mb: 1, display: 'block', letterSpacing: 1 }}>
                    CONTACT CHANNEL
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder='MOBILE +91'
                    type='tel'
                    value={bookingMobile}
                    onChange={e => setBookingMobile(e.target.value)}
                    variant='outlined'
                    InputProps={{
                      sx: {
                        borderRadius: 5,
                        fontWeight: 900,
                        color: valetMode === 'dark' ? 'white' : '#05070A',
                        bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        fontSize: '1.1rem',
                        '& fieldset': { border: valetMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' },
                        '&:hover fieldset': { borderColor: valetMode === 'dark' ? 'white' : '#05070A' },
                        '&.Mui-focused fieldset': { borderColor: valetMode === 'dark' ? 'white' : '#05070A', boxShadow: valetMode === 'dark' ? '0 0 15px rgba(255,255,255,0.1)' : 'none' },
                        '& input::placeholder': { color: valetMode === 'dark' ? 'white' : '#05070A', opacity: 0.3 }
                      }
                    }}
                  />
                </Box>

                {/* Conditional Fields for Schedule */}
                {bookingType === 'Schedule' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <Box>
                      <Typography variant='caption' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', ml: 1, mb: 1, display: 'block', letterSpacing: 1 }}>
                        SCHEDULE START
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          type='date'
                          fullWidth
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          variant='outlined'
                          InputProps={{
                            sx: {
                              borderRadius: 5,
                              fontWeight: 900,
                              color: valetMode === 'dark' ? 'white' : '#05070A',
                              bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                              '& fieldset': { border: '1px solid', borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                              '& input': { colorScheme: valetMode === 'dark' ? 'dark' : 'light' }
                            }
                          }}
                        />
                        <TextField
                          type='time'
                          fullWidth
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          variant='outlined'
                          InputProps={{
                            sx: {
                              borderRadius: 5,
                              fontWeight: 900,
                              color: valetMode === 'dark' ? 'white' : '#05070A',
                              bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                              '& fieldset': { border: '1px solid', borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                              '& input': { colorScheme: valetMode === 'dark' ? 'dark' : 'light' }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant='caption' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', ml: 1, mb: 1, display: 'block', letterSpacing: 1 }}>
                        SCHEDULE END
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          type='date'
                          fullWidth
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                          variant='outlined'
                          InputProps={{
                            sx: {
                              borderRadius: 5,
                              fontWeight: 900,
                              color: valetMode === 'dark' ? 'white' : '#05070A',
                              bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                              '& fieldset': { border: '1px solid', borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                              '& input': { colorScheme: valetMode === 'dark' ? 'dark' : 'light' }
                            }
                          }}
                        />
                        <TextField
                          type='time'
                          fullWidth
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          variant='outlined'
                          InputProps={{
                            sx: {
                              borderRadius: 5,
                              fontWeight: 900,
                              color: valetMode === 'dark' ? 'white' : '#05070A',
                              bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                              '& fieldset': { border: '1px solid', borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                              '& input': { colorScheme: valetMode === 'dark' ? 'dark' : 'light' }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}

                <Button
                  fullWidth
                  size='large'
                  variant='contained'
                  disabled={loading || !bookingPlate || (bookingType === 'Schedule' && (!startDate || !startTime))}
                  onClick={async () => {
                    setLoading(true)
                    setError(null)
                    try {
                      if (vendorData?.parkingStatus === 'Closed') {
                        setError('Parking is currently closed.')
                        setLoading(false)

                        return
                      }

                      const typeMap = { Car: 'Cars', Bike: 'Bikes', Others: 'Others' }
                      const available = availableSlots?.[typeMap[vehicleType]] || 0

                      if (available <= 0) {
                        setError(`Full. No ${vehicleType} slots available.`)
                        setLoading(false)

                        return
                      }

                      const charge = charges.find(c => c.category === vehicleType && c.type === (bookingType === 'Subscription' ? 'Monthly' : 'Hourly'))
                      const amount = charge ? charge.amount : '0'

                      const now = new Date()
                      const formattedDate = now.getDate().toString().padStart(2, '0') + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getFullYear()
                      const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

                      const payload = {
                        vendorId,
                        vendorName: vendorData?.vendorName || 'Vendor',
                        personName: bookingName || 'Customer',
                        mobileNumber: bookingMobile,
                        vehicleType,
                        vehicleNumber: bookingPlate,
                        bookingDate: bookingType === 'Schedule' ? bookingDate : formattedDate,
                        bookingTime: bookingType === 'Schedule' ? bookingTime : formattedTime,
                        approvedDate: formattedDate,
                        approvedTime: formattedTime,
                        parkedDate: formattedDate,
                        parkedTime: formattedTime,
                        parkingDate: formattedDate,
                        parkingTime: formattedTime,
                        status: bookingType === 'Instant' ? 'PARKED' : 'PENDING',
                        sts: bookingType,
                        bookType: bookingType === 'Subscription' ? 'Monthly' : 'Hourly',
                        amount: amount
                      }

                      const res = await axios.post(`${API_URL}/vendor/vendorcreatebooking`, payload)

                      if (res.data) {
                        setBookingData(res.data)
                        setIsBookingSuccess(true)
                        setViewState('result')
                        setMainMode('home')
                      }
                    } catch (err) {
                      const backendMsg = err.response?.data?.message || err.response?.data?.error || 'System busy. Please try again.'
                      setError(backendMsg)
                    } finally {
                      setLoading(false)
                    }
                  }}
                  sx={{
                    height: 64,
                    borderRadius: 5,
                    background: BRAND_GRADIENT,
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    textTransform: 'none',
                    mt: 1,
                    boxShadow: '0 15px 30px rgba(16, 185, 129, 0.25)',
                    '&:hover': { background: BRAND_GRADIENT, opacity: 0.9 }
                  }}
                >
                  {loading ? <CircularProgress size={24} color='inherit' /> : `Confirm ${bookingType}`}
                </Button>
              </Box>

              {error && (
                <Alert
                  severity='error'
                  sx={{ mt: 4, borderRadius: 5, fontWeight: 800, bgcolor: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4d', border: '1px solid rgba(255, 0, 0, 0.2)' }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          )}

          {mainMode === 'finding' && viewState === 'search' && (
            <Box sx={{ width: '100%', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
                {/* 
                <IconButton
                  onClick={() => setMainMode('selection')}
                  sx={{
                    bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    mr: 2,
                    border: '1px solid',
                    borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    color: valetMode === 'dark' ? 'white' : '#05070A'
                  }}
                  size='small'
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                </IconButton>
                */}
                <Typography variant='h5' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 900, letterSpacing: '-0.02em' }}>
                  Get My Vehicle
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ p: 4, bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 6, border: '1px dashed', borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <Typography variant='body1' sx={{ color: valetMode === 'dark' ? TEXT_LIGHT : '#64748b', fontWeight: 700, textAlign: 'center' }}>
                    Verify your valet token to see live status.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='caption' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', ml: 1, mb: 1, display: 'block', letterSpacing: 1 }}>
                      TOKEN
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder='#'
                      value={valetToken}
                      onChange={e => setValetToken(e.target.value)}
                      variant='outlined'
                      InputProps={{
                        sx: {
                          borderRadius: 4,
                          fontWeight: 900,
                          color: valetMode === 'dark' ? 'white' : '#05070A',
                          bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          fontSize: '1rem',
                          textAlign: 'center',
                          '& fieldset': { border: '1px solid', borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                          '&:hover fieldset': { borderColor: valetMode === 'dark' ? 'white' : '#05070A' },
                          '& input::placeholder': { opacity: 0.3 }
                        }
                      }}
                      inputProps={{ style: { textAlign: 'center' } }}
                    />
                  </Box>
                  <Box sx={{ flex: 2.2 }}>
                    <Typography variant='caption' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', ml: 1, mb: 1, display: 'block', letterSpacing: 1 }}>
                      VEHICLE NUMBER
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder='PLATE NO.'
                      value={plateNumber}
                      onChange={e => setPlateNumber(e.target.value.toUpperCase())}
                      variant='outlined'
                      InputProps={{
                        sx: {
                          borderRadius: 4,
                          fontWeight: 900,
                          color: valetMode === 'dark' ? 'white' : '#05070A',
                          bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          fontSize: '1rem',
                          '& fieldset': { border: '1px solid', borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                          '&:hover fieldset': { borderColor: valetMode === 'dark' ? 'white' : '#05070A' },
                          '& input::placeholder': { opacity: 0.3 }
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
                    height: 72,
                    borderRadius: 5,
                    bgcolor: BRAND_MAIN,
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 950,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    boxShadow: valetMode === 'dark' ? '0 20px 40px rgba(16, 185, 129, 0.2)' : '0 20px 40px rgba(16, 185, 129, 0.15)',
                    '&:hover': { 
                      bgcolor: '#059669 !important', 
                      color: 'white !important',
                      transform: 'translateY(-2px)' 
                    },
                    '&:disabled': { opacity: 0.4 }
                  }}
                >
                  {loading ? <CircularProgress size={30} color='inherit' /> : 'FIND VEHICLE'}
                </Button>
              </Box>
            </Box>
          )}

          {viewState === 'result' && bookingData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 1, px: 1 }}>
              {isBookingSuccess ? (
                /* PURE SUCCESS MESSAGE VIEW FOR NEW ARRIVALS */
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, mt: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)'
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 70, color: '#10B981' }} />
                  </Box>

                  <Box>
                    <Typography variant='h2' sx={{ fontWeight: 950, color: valetMode === 'dark' ? 'white' : '#05070A', mb: 1.5, letterSpacing: -1 }}>
                      Booking Successful
                    </Typography>
                    <Typography variant='body1' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', opacity: 0.6, fontWeight: 700, px: 4 }}>
                      Your vehicle {bookingData?.vehicleNumber} has been secured successfully.
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant='contained'
                    onClick={() => {
                      setViewState('search')
                      setMainMode('selection')
                      setIsBookingSuccess(false)
                      setSuccessMessage(null)
                    }}
                    sx={{
                      height: 64,
                      borderRadius: 5,
                      background: BRAND_GRADIENT,
                      fontWeight: 950,
                      fontSize: '1.2rem',
                      boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    Back to Home
                  </Button>
                </Box>
              ) : (
                /* FULL OPERATIONAL VIEW FOR PICKUPS/VEHICLE SEARCH */
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: valetMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      border: valetMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: valetMode === 'dark' ? '0 30px 60px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      <Box>
                        <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 900, letterSpacing: 2, opacity: 0.5 }}>
                          TOKEN / VEHICLE
                        </Typography>
                        <Typography variant='h4' sx={{ color: BRAND_MAIN, fontWeight: 950, letterSpacing: '-0.05em', mt: 1, lineHeight: 1 }}>
                          #{valetToken || 'VALET'}
                        </Typography>
                        <Typography variant='h6' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 950, mt: 0.5 }}>
                          {bookingData?.vehicleNumber?.includes('-') ? bookingData.vehicleNumber.split('-')[1] : (bookingData?.vehicleNumber || 'PENDING')}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 900, letterSpacing: 2, opacity: 0.5 }}>
                          STAY DURATION
                        </Typography>
                        <Typography variant='body1' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 950, fontFamily: 'monospace', mt: 0.5 }}>
                          {parkingDuration}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 3.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 0 40px rgba(255,255,255,0.1)'
                      }}
                    >
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt='QR' style={{ width: 100, height: 100 }} />
                      ) : (
                        <CircularProgress size={30} />
                      )}
                      <Typography variant='caption' sx={{ mt: 1.5, color: '#000', fontSize: '0.65rem', fontWeight: 950, letterSpacing: 1 }}>
                        SCAN AT EXIT
                      </Typography>
                    </Box>
                  </Box>

                  {bookingData?.vehicleImages?.length > 0 && (
                    <Box>
                      <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 950, ml: 1, letterSpacing: 2, opacity: 0.6 }}>
                          VEHICLE CONDITION
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', mt: 1.5, pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                        {bookingData.vehicleImages.map((img, idx) => (
                          <Box
                            key={idx}
                            onClick={() => {
                              setSelectedImage(img)
                              setOpenImages(true)
                              setZoom(1)
                            }}
                            sx={{
                              width: 110,
                              height: 110,
                              borderRadius: 5,
                              overflow: 'hidden',
                              flexShrink: 0,
                              cursor: 'pointer',
                              border: '1px solid rgba(255,255,255,0.15)',
                              position: 'relative',
                              '&:hover': { transform: 'translateY(-5px)', borderColor: 'white' }
                            }}
                          >
                            <img src={img} alt='Vehicle' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Status Timeline */}
                  <Box sx={{ p: 4, borderRadius: 4, background: valetMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: valetMode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                       <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: BRAND_MAIN, boxShadow: `0 0 15px ${BRAND_MAIN}` }} />
                       <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 950, lineHeight: 1 }}>Parked & Secured</Typography>
                          <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', opacity: 0.5, fontWeight: 700 }}>{bookingData.parkingDate} {bookingData.parkingTime}</Typography>
                       </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                       <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: `2.5px solid ${successMessage ? BRAND_MAIN : (valetMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}`, bgcolor: successMessage ? BRAND_MAIN : 'transparent' }} />
                       <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' sx={{ color: successMessage ? (valetMode === 'dark' ? 'white' : '#05070A') : (valetMode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'), fontWeight: 950, lineHeight: 1 }}>Return Tracking</Typography>
                          <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', opacity: 0.5, fontWeight: 700 }}>{successMessage ? 'Vehicle requested' : 'Pending request'}</Typography>
                       </Box>
                    </Box>
                  </Box>

                  {successMessage && successMessage !== 'BOOKING SUCCESSFUL' && (
                    <Box
                      sx={{
                        textAlign: 'center',
                        p: 4.5,
                        bgcolor: valetMode === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.08)',
                        borderRadius: 7,
                        border: '1px solid',
                        borderColor: valetMode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'
                      }}
                    >
                      <Typography variant='caption' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', mb: 2.5, fontWeight: 950, letterSpacing: 5, display: 'block', opacity: 0.5 }}>
                        HAVE A PLEASANT TRIP
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center' }}>
                        <Box sx={{ bgcolor: valetMode === 'dark' ? 'white' : '#05070A', color: valetMode === 'dark' ? '#05070A' : 'white', px: 3, py: 2, borderRadius: 5, fontWeight: 950, fontSize: '1.4rem', minWidth: 60 }}>
                          {returnTimeParts.m}
                        </Box>
                        <Typography variant='h4' sx={{ color: valetMode === 'dark' ? 'white' : '#05070A', fontWeight: 950 }}>:</Typography>
                        <Box sx={{ bgcolor: valetMode === 'dark' ? 'white' : '#05070A', color: valetMode === 'dark' ? '#05070A' : 'white', px: 3, py: 2, borderRadius: 5, fontWeight: 950, fontSize: '1.4rem', minWidth: 60 }}>
                          {returnTimeParts.s}
                        </Box>
                      </Box>
                      <Typography variant='caption' sx={{ color: BRAND_MAIN, mt: 3, display: 'block', fontWeight: 950, letterSpacing: 2 }}>ESTIMATED ARRIVAL</Typography>
                    </Box>
                  )}

                  {!successMessage && bookingData?.status?.toLowerCase() === 'parked' && (
                    <Button
                      fullWidth
                      onClick={handleGetVehicle}
                      disabled={loading}
                      sx={{
                        py: 3,
                        borderRadius: 6,
                        bgcolor: valetMode === 'dark' ? 'white' : '#111827',
                        color: valetMode === 'dark' ? '#111827' : 'white',
                        fontSize: '1.2rem',
                        fontWeight: 950,
                        textTransform: 'uppercase',
                        letterSpacing: 2,
                        boxShadow: valetMode === 'dark' ? '0 30px 60px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.1)',
                        transition: 'all 0.4s',
                        '&:hover': { 
                          bgcolor: valetMode === 'dark' ? '#f3f4f6 !important' : '#1f2937 !important', 
                          color: valetMode === 'dark' ? '#111827 !important' : 'white !important',
                          transform: 'translateY(-3px)',
                          boxShadow: valetMode === 'dark' ? '0 30px 60px rgba(0,0,0,0.8)' : '0 15px 35px rgba(0,0,0,0.2)'
                        },
                        '&:disabled': { opacity: 0.5 }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color='inherit' /> : 'GET MY VEHICLE'}
                    </Button>
                  )}

                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={handleSearchAgain}
                    sx={{
                      py: 2.5,
                      borderRadius: 10,
                      borderColor: valetMode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                      color: valetMode === 'dark' ? 'white' : '#05070A',
                      opacity: valetMode === 'dark' ? 0.5 : 0.8,
                      fontWeight: 950,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                      '&:hover': { 
                        borderColor: valetMode === 'dark' ? 'white' : '#05070A', 
                        opacity: 1,
                        bgcolor: valetMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: valetMode === 'dark' ? 'white' : '#05070A'
                      }
                    }}
                  >
                    Find Another Vehicle
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            mt: 'auto',
            pb: 0,
            px: 0,
            zIndex: 10,
            position: 'sticky',
            bottom: 0,
            width: '100%',
            height: 85,
            background: valetMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f8fafc',
            backdropFilter: valetMode === 'dark' ? 'blur(30px)' : 'none',
            borderTop: '1px solid',
            borderColor: valetMode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            boxShadow: valetMode === 'dark' ? '0 -20px 60px rgba(0,0,0,0.5)' : 'none',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          }}
        >
          <Grid container sx={{ px: 4 }}>
            {[
              { id: 'finding', label: 'HOME', icon: <HomeIcon />, active: mainMode === 'home' || mainMode === 'selection' || !mainMode || mainMode === 'finding' },
              { id: 'booking', label: 'VALET', icon: <LocalParkingIcon />, active: mainMode === 'booking' },
              { id: 'bookings', label: 'BOOKINGS', icon: <CalendarTodayIcon />, active: mainMode === 'bookings' },
              { id: 'account', label: 'ACCOUNT', icon: <PersonIcon />, active: mainMode === 'account' }
            ].map((item, index) => (
              <Grid item xs={3} key={index}>
                <Box
                  onClick={() => {
                    if (item.id === 'finding') {
                      setMainMode(item.id)
                      setViewState('search')
                      setIsBookingSuccess(false)
                    } else {
                      window.location.href = 'https://parkmywheels.com/app.html'
                    }
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: valetMode === 'dark' ? '#FFFFFF !important' : '#000000 !important',
                    opacity: item.active ? 1 : 0.45,
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}
                >
                  <Box sx={{
                    mb: 0.5,
                    display: 'flex',
                    color: 'inherit',
                    '& svg': {
                      color: 'inherit',
                      fill: 'currentColor',
                      fontSize: 24
                    }
                  }}>
                    {item.icon}
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 950,
                      fontSize: '0.65rem',
                      letterSpacing: 1.2,
                      color: 'inherit',
                      textTransform: 'uppercase'
                    }}
                  >
                    {item.label}
                  </Typography>
                  {item.active && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -15,
                        width: 28,
                        height: 3,
                        borderRadius: 10,
                        bgcolor: BRAND_MAIN,
                        boxShadow: valetMode === 'dark' ? `0 0 10px ${BRAND_MAIN}` : 'none'
                      }}
                    />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
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
