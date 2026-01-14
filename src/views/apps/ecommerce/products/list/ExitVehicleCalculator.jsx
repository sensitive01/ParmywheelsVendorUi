'use client'

import { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'
import {
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Divider,
  Card,
  CardContent,
  Stack,
  Grid
} from '@mui/material'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const ParkedTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  useEffect(() => {
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')

      return
    }

    try {
      const [day, month, year] = parkedDate.split('-')
      const [timePart, ampm] = parkedTime.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)

      if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0
      }

      const parkingStartTime = new Date(
        `${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
      )

      const timer = setInterval(() => {
        const now = new Date()
        const diffMs = now - parkingStartTime
        const diffSecs = Math.floor(diffMs / 1000)
        const hours = Math.floor(diffSecs / 3600)
        const minutes = Math.floor((diffSecs % 3600) / 60)
        const seconds = diffSecs % 60
        const formattedHours = hours.toString().padStart(2, '0')
        const formattedMinutes = minutes.toString().padStart(2, '0')
        const formattedSeconds = seconds.toString().padStart(2, '0')

        setElapsedTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
      }, 1000)

      return () => clearInterval(timer)
    } catch (error) {
      console.error('Error setting up timer:', error)
      setElapsedTime('00:00:00')
    }
  }, [parkedDate, parkedTime])

  return (
    <Typography component='span' sx={{ fontFamily: 'monospace', fontWeight: 500, color: 'text.secondary' }}>
      ({elapsedTime})
    </Typography>
  )
}

const ExitVehicleCalculator = ({
  bookingId,
  vehicleType = 'Car',
  bookType = 'Hourly',
  bookingDetails = null,
  onClose,
  onSuccess
}) => {
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  const [loading, setLoading] = useState(false)
  const [fetchingBookingDetails, setFetchingBookingDetails] = useState(false)
  const [hours, setHours] = useState(0) // For billing calculation
  const [formattedDuration, setFormattedDuration] = useState('00:00:00') // For display
  const [amount, setAmount] = useState(0)
  const [error, setError] = useState('')
  const [calculationDetails, setCalculationDetails] = useState(null)
  const [bookingData, setBookingData] = useState(bookingDetails || null)
  const [otp, setOtp] = useState('')
  const [backendOtp, setBackendOtp] = useState('')

  const [fullDayModes, setFullDayModes] = useState({
    car: 'Full Day',
    bike: 'Full Day',
    others: 'Full Day'
  })

  // GST and Tax State
  const [gstPercentage, setGstPercentage] = useState(0)
  const [handlingFee, setHandlingFee] = useState(0)
  const [gstAmount, setGstAmount] = useState(0)
  const [totalWithTaxes, setTotalWithTaxes] = useState(0)

  const [isVendorBooking, setIsVendorBooking] = useState(false)
  const is24Hours = bookingData?.bookType === '24 Hours' || bookType === '24 Hours'
  const isSubscription = bookingData?.sts === 'Subscription'

  // Helper function to calculate elapsed time in HH:MM:SS format
  const calculateElapsedTime = (parkedDate, parkedTime) => {
    if (!parkedDate || !parkedTime) return '00:00:00'

    try {
      const [day, month, year] = parkedDate.split('-')
      const [timePart, ampm] = parkedTime.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)

      if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0
      }

      const parkingStartTime = new Date(
        `${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
      )

      const now = new Date()
      const diffMs = now - parkingStartTime
      const diffSecs = Math.max(0, Math.floor(diffMs / 1000))
      const hrs = Math.floor(diffSecs / 3600)
      const mins = Math.floor((diffSecs % 3600) / 60)
      const secs = diffSecs % 60

      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } catch (error) {
      console.error('Error calculating elapsed time:', error)

      return '00:00:00'
    }
  }

  const fetchBookingDirectly = async id => {
    try {
      setFetchingBookingDetails(true)
      console.log(`Fetching booking details for ID: ${id} from direct API`)

      const response = await fetch(`${API_URL}/vendor/getbooking/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch booking details')
      }

      const data = await response.json()

      // FIXED: Check for data.data instead of data.booking
      if (!data || !data.data) {
        throw new Error('Invalid booking data received')
      }

      console.log('Received booking details from direct API:', data.data)

      setBookingData(data.data)

      // Check if this is a vendor booking (no userid present)
      setIsVendorBooking(!data.data.userid)

      if (data.data.otp && !isVendorBooking) {
        console.log('Received OTP from API:', data.data.otp)
        setBackendOtp(data.data.otp)
      }

      // NEW: Set the base amount if available
      if (data.data.baseAmount !== undefined && data.data.baseAmount !== null) {
        setAmount(data.data.baseAmount)
      }

      return data.data
    } catch (err) {
      console.error('Error fetching booking details from direct API:', err)
      setError('Failed to fetch booking details: ' + (err.message || ''))

      return null
    } finally {
      setFetchingBookingDetails(false)
    }
  }

  const fetchFullDayModes = async () => {
    try {
      console.log(`Fetching full day modes for vendor: ${vendorId}`)
      const response = await fetch(`${API_URL}/vendor/getfullday/${vendorId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch full day modes')
      }

      const data = await response.json()

      console.log('Received full day modes:', data)

      if (data && data.data) {
        setFullDayModes({
          car: data.data.fulldaycar || 'Full Day',
          bike: data.data.fulldaybike || 'Full Day',
          others: data.data.fulldayothers || 'Full Day'
        })
      }
    } catch (err) {
      console.error('Error fetching full day modes:', err)
    }
  }

  const fetchGstData = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/getgstfee`)

      if (response.ok) {
        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          setGstPercentage(parseFloat(data[0].gst || '0'))
          setHandlingFee(parseFloat(data[0].handlingfee || '0'))
        }
      }
    } catch (error) {
      console.error('Failed to fetch GST fees:', error)
    }
  }

  useEffect(() => {
    const getBookingDetails = async () => {
      if (bookingDetails) {
        setBookingData(bookingDetails)
        setIsVendorBooking(!bookingDetails.userid)

        if (bookingDetails.otp && bookingDetails.userid) {
          setBackendOtp(bookingDetails.otp)
        } else {
          await fetchBookingDirectly(bookingId)
        }

        return
      }

      if (!bookingId) return

      try {
        const directBooking = await fetchBookingDirectly(bookingId)

        if (directBooking) {
          return
        }

        setFetchingBookingDetails(true)
        console.log(`Falling back to original API for ID: ${bookingId}`)

        const response = await fetch(`${API_URL}/vendor/getbookingdetails/${bookingId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }

        const data = await response.json()

        if (!data || !data.booking) {
          throw new Error('Invalid booking data received')
        }

        console.log('Received booking details from fallback:', data.booking)
        setBookingData(data.booking)
        setIsVendorBooking(!data.booking.userid)

        if (!data.booking.otp || isVendorBooking) {
          await fetchBookingDirectly(bookingId)
        } else {
          setBackendOtp(data.booking.otp)
        }
      } catch (err) {
        console.error('Error fetching booking details:', err)
        setError('Failed to fetch booking details: ' + (err.message || ''))
      } finally {
        setFetchingBookingDetails(false)
      }
    }

    if (bookingId) {
      getBookingDetails()
    }
  }, [bookingId, bookingDetails])

  useEffect(() => {
    if (vendorId) {
      fetchFullDayModes()
      fetchGstData()
    }
  }, [vendorId])

  useEffect(() => {
    const calculateDuration = () => {
      try {
        // For subscription, we don't need to calculate duration based on time
        if (isSubscription) {
          setHours(1) // Just set to 1 as we'll use the monthly rate
          setFormattedDuration('00:00:00')

          return { duration: 1, method: null }
        }

        const parkingDate = bookingData?.parkedDate
        const parkingTime = bookingData?.parkedTime

        console.log('Calculating duration with:', { parkingDate, parkingTime })

        if (!parkingDate || !parkingTime) {
          console.error('Missing parking data:', { parkingDate, parkingTime })
          throw new Error('Parking date or time not available')
        }

        const [day, month, year] = parkingDate.split('-').map(Number)

        let [time, period] = parkingTime.split(' ')
        let [hours, minutes] = time.split(':').map(Number)

        if (period === 'PM' && hours < 12) {
          hours += 12
        } else if (period === 'AM' && hours === 12) {
          hours = 0
        }

        const parkingDateTime = new Date(year, month - 1, day, hours, minutes)
        const currentDateTime = new Date()

        console.log('Parking date time:', parkingDateTime)
        console.log('Current date time:', currentDateTime)

        const diffMs = currentDateTime - parkingDateTime

        if (is24Hours) {
          const effectiveVehicleType = bookingData?.vehicleType?.toLowerCase() || vehicleType.toLowerCase()
          const fullDayMode = fullDayModes[effectiveVehicleType] || 'Full Day'

          console.log(`Using full day mode "${fullDayMode}" for ${effectiveVehicleType}`)

          if (fullDayMode === '24 Hours') {
            // 24 Hours mode: Calculate complete 24-hour periods from parking time
            const diffHours = diffMs / (1000 * 60 * 60)
            const days = Math.ceil(diffHours / 24)
            const calculatedDays = Math.max(1, days)

            console.log('Calculated days (24 Hours mode):', calculatedDays)

            // Store calculation method for later display
            const calculationMethod = {
              methodName: '24 Hours',
              description: 'Complete 24-hour periods from parking time',
              parkingDateTime: parkingDateTime,
              currentDateTime: currentDateTime,
              diffHours: diffHours,
              days: calculatedDays
            }

            setHours(calculatedDays)
            setFormattedDuration(calculateElapsedTime(parkingDate, parkingTime))

            return { duration: calculatedDays, method: calculationMethod }
          } else {
            // Modified Full Day mode: Calculate calendar days but don't include current day unless complete
            const parkingDay = new Date(year, month - 1, day)

            const currentDay = new Date(
              currentDateTime.getFullYear(),
              currentDateTime.getMonth(),
              currentDateTime.getDate()
            )

            // Calculate the difference in days (not inclusive of the current day)
            const timeDiff = currentDay.getTime() - parkingDay.getTime()
            const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

            // Only add the current day if it's complete (already passed midnight)
            // Always charge minimum 1 day
            const calculatedDays = Math.max(1, diffDays)

            console.log('Calculated calendar days (Full Day mode):', calculatedDays)

            // Store calculation method for later display
            const calculationMethod = {
              methodName: 'Full Day',
              description: 'Calendar days (excluding current day unless complete)',
              parkingDay: parkingDay,
              currentDay: currentDay,
              diffDays: calculatedDays,
              explanation: 'Charges apply for each complete calendar day, excluding the current day if not yet complete'
            }

            setHours(calculatedDays)
            setFormattedDuration(calculateElapsedTime(parkingDate, parkingTime))

            return { duration: calculatedDays, method: calculationMethod }
          }
        } else {
          // Hourly booking - calculate both billing hours and formatted display
          const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
          const displayHours = Math.floor(totalSeconds / 3600)
          const displayMinutes = Math.floor((totalSeconds % 3600) / 60)
          const displaySeconds = totalSeconds % 60

          // Format for display (HH:MM:SS)
          const formatted = `${displayHours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`

          // Billing hours (ceiling for charging purposes)
          const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
          const calculatedHours = Math.max(1, diffHours)

          console.log('Calculated hours (Hourly booking):', calculatedHours)

          // Store calculation method for later display
          const calculationMethod = {
            methodName: 'Hourly',
            description: 'Hours since parking time',
            parkingDateTime: parkingDateTime,
            currentDateTime: currentDateTime,
            diffHours: calculatedHours
          }

          setHours(calculatedHours) // For billing
          setFormattedDuration(formatted) // For display

          return { duration: calculatedHours, method: calculationMethod }
        }
      } catch (err) {
        console.error('Error calculating duration:', err)
        setError('Failed to calculate parking duration. Using default value.')
        setHours(1)
        setFormattedDuration('00:00:00')

        return { duration: 1, method: null }
      }
    }

    if (bookingData?.parkedDate && bookingData?.parkedTime && fullDayModes) {
      const result = calculateDuration()

      // Fetch payable amount directly from vendor API
      const fetchPayableAmount = async () => {
        try {
          const headers = { 'Content-Type': 'application/json' }

          if (session?.accessToken) {
            headers['Authorization'] = `Bearer ${session.accessToken}`
          }

          const resp = await fetch(`${API_URL}/vendor/fet/${bookingId}`, { headers })

          if (!resp.ok) return
          const data = await resp.json()

          if (data && data.success && data.payableAmount) {
            const serverAmount = Number(data.payableAmount)

            if (!isNaN(serverAmount)) {
              setAmount(serverAmount)

              // Just use the server provided duration hours directly
              if (data.durationHours) {
                const sHours = Number(data.durationHours)

                if (!isNaN(sHours)) {
                  setHours(sHours)
                }
              }

              // Clear complex calculation details as user requested basic view
              setCalculationDetails(null)
            }
          }
        } catch (e) {
          console.error('Failed to fetch payable amount:', e)
          setError('Failed to fetch amount from server')
        }
      }

      fetchPayableAmount()
    }
  }, [bookingData, is24Hours, fullDayModes, vehicleType, isSubscription, bookingId, hours, session?.accessToken])

  // Recalculate totals when amount, gst, or handling fee changes
  useEffect(() => {
    if (amount >= 0) {
      const roundedParkingCharge = Math.ceil(amount)
      const calculatedGst = Math.ceil((roundedParkingCharge * gstPercentage) / 100)
      const roundedHandling = Math.ceil(handlingFee)

      // Use a consistent logic whether user or vendor booking for display,
      // but logic might differ in what we *charge*.
      // The Flutter code implies taxes are added if userid is not empty (Customer booking).
      // For vendor booking, usually taxes might be skipped or inclusive.
      // Let's assume we display taxes only for non-Vendor bookings based on Flutter logic:
      // "if (widget.userid.isNotEmpty) ... show GST/Handling"

      if (!isVendorBooking) {
        setGstAmount(calculatedGst)
        setTotalWithTaxes(roundedParkingCharge + calculatedGst + roundedHandling)
      } else {
        setGstAmount(0)
        setTotalWithTaxes(roundedParkingCharge)
      }
    }
  }, [amount, gstPercentage, handlingFee, isVendorBooking])

  // Real-time updates for timer only (no local amount calc)
  useEffect(() => {
    if (!is24Hours && !isSubscription && bookingData?.parkedDate && bookingData?.parkedTime) {
      const timer = setInterval(() => {
        // Update formatted duration
        const newFormattedDuration = calculateElapsedTime(bookingData.parkedDate, bookingData.parkedTime)

        setFormattedDuration(newFormattedDuration)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [bookingData, is24Hours, isSubscription])

  const handleHoursChange = e => {
    const value = Math.max(1, parseInt(e.target.value) || 1)

    setHours(value)
  }

  const formatDate = dateStr => {
    if (!dateStr) return 'N/A'

    return dateStr
  }

  const formatTime = timeStr => {
    if (!timeStr) return 'N/A'

    let [time, period] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)

    if (period === 'PM' && hours < 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const formatDateObject = date => {
    if (!date) return 'N/A'

    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
  }

  const formatTimeObject = date => {
    if (!date) return 'N/A'
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    // Allow amount to be 0 (e.g. subscription or free parking)
    if (!bookingId || amount === null || amount === undefined || !hours) {
      setError('Booking ID and duration are required')

      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Submitting exit data:', {
        bookingId,
        amount,
        hour: bookingData?.parkedTime,
        is24Hours,
        isSubscription,
        vendorId,
        otp: null
      })

      // Prepare body according to Flutter logic
      const roundedParkingCharge = Math.ceil(amount)

      const body = {
        amount: roundedParkingCharge,
        duration: formattedDuration,
        hour: formattedDuration,
        is24Hours,
        isSubscription,
        vendorId,
        otp: null
      }

      if (!isVendorBooking) {
        body.gstamout = gstAmount
        body.handlingfee = Math.ceil(handlingFee)
        body.totalamout = totalWithTaxes
      }

      const endpoint = isSubscription
        ? `${API_URL}/vendor/exitvendorsubscription/${bookingId}`
        : `${API_URL}/vendor/exitvehicle/${bookingId}`

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update booking status')
      }

      const data = await response.json()

      onSuccess?.(data.message || 'Vehicle exit processed successfully')

      // Refresh the page after a short delay to show the success message
      setTimeout(() => {
        window.location.reload()
      }, 1000)

      onClose?.()
    } catch (err) {
      console.error('Error processing exit:', err)
      setError(err.message || 'Failed to process vehicle exit')
    } finally {
      setLoading(false)
    }
  }

  const isLoading = fetchingBookingDetails || loading

  return (
    <Box>
      <DialogTitle>Calculate Exit Charges</DialogTitle>
      <Box sx={{ px: 3, pb: 1 }}>
        <Typography variant='subtitle2' color='text.secondary'>
          Booking ID: {bookingId}
          {isVendorBooking && (
            <Typography component='span' color='primary' sx={{ ml: 1 }}>
              (Vendor Booking)
            </Typography>
          )}
          {isSubscription && (
            <Typography component='span' color='primary' sx={{ ml: 1 }}>
              (Subscription)
            </Typography>
          )}
        </Typography>
      </Box>

      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {isLoading && !error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant='body2' sx={{ ml: 2 }}>
              {fetchingBookingDetails ? 'Loading booking details...' : 'Processing...'}
            </Typography>
          </Box>
        ) : (
          <>
            <Card variant='outlined' sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='subtitle1' color='text.secondary' gutterBottom>
                  Vehicle Type: {bookingData?.vehicleType || vehicleType}
                </Typography>
                <Typography variant='subtitle1' color='text.secondary' gutterBottom>
                  Booking Type: {isSubscription ? 'Subscription' : bookingData?.bookType || bookType}
                </Typography>
                {isSubscription && (
                  <Typography variant='subtitle1' color='text.secondary' gutterBottom>
                    Subscription Type: {bookingData?.subsctiptiontype || 'Monthly'}
                  </Typography>
                )}
                {!isSubscription && is24Hours && (
                  <Typography variant='subtitle1' color='text.secondary' gutterBottom>
                    Full Day Mode:{' '}
                    {fullDayModes[bookingData?.vehicleType?.toLowerCase() || vehicleType.toLowerCase()] || 'Full Day'}
                  </Typography>
                )}
                <Divider sx={{ my: 1 }} />
                <Typography variant='subtitle1' color='text.secondary'>
                  Parked Since: {formatDate(bookingData?.parkedDate)} at {formatTime(bookingData?.parkedTime)}{' '}
                  {bookingData?.parkedDate && bookingData?.parkedTime && !isSubscription && (
                    <ParkedTimer parkedDate={bookingData.parkedDate} parkedTime={bookingData.parkedTime} />
                  )}
                </Typography>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              {!isSubscription && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={is24Hours ? 'Number of Days' : 'Duration (HH:MM:SS)'}
                    type='text'
                    value={is24Hours ? hours : formattedDuration}
                    InputProps={{
                      readOnly: true,
                      inputProps: { min: 1 }
                    }}
                    disabled={isLoading}
                    required
                  />
                </Grid>
              )}
            </Grid>

            {!isSubscription && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant='body2'>Parking Charges:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant='body2'>₹{Math.ceil(amount).toFixed(2)}</Typography>
                  </Grid>

                  {!isVendorBooking && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant='body2'>Handling Fee:</Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography variant='body2'>₹{Math.ceil(handlingFee).toFixed(2)}</Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography variant='body2'>GST ({gstPercentage}%):</Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography variant='body2'>₹{gstAmount.toFixed(2)}</Typography>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant='h6' color='primary'>
                      Payable Amount:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant='h6' fontWeight='bold' color='primary'>
                      ₹{(!isVendorBooking ? totalWithTaxes : Math.ceil(amount)).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color='secondary'>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color='primary'
          disabled={isLoading || !vendorId}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : 'Confirm Exit'}
        </Button>
      </DialogActions>
    </Box>
  )
}

export default ExitVehicleCalculator
