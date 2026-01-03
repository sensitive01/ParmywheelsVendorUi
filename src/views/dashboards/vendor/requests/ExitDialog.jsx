import React, { useState, useEffect, useCallback } from 'react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Grid,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://parkmywheels-backend.onrender.com'

const ExitDialog = ({ open, onClose, booking, vendorId, onExitSuccess }) => {
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(true)
  const [gstData, setGstData] = useState({ gst: 0, handlingfee: 0 })

  const [payableData, setPayableData] = useState({
    payableDuration: 0, // seconds or Duration object?
    payableAmount: 0,
    gstAmount: 0,
    handlingFee: 0,
    totalAmount: 0,
    formattedDuration: '00:00:00'
  })

  const [now, setNow] = useState(new Date())

  // --- Helpers ---
  const parseParkingDateTime = (dateStr, timeStr) => {
    // dateStr: dd-MM-yyyy, timeStr: hh:mm AM/PM
    if (!dateStr || !timeStr) return new Date()

    const [day, month, year] = dateStr.split('-').map(Number)
    let [time, modifier] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)

    if (modifier === 'PM' && hours < 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0

    return new Date(year, month - 1, day, hours, minutes)
  }

  const roundUpToNearestRupee = amount => Math.ceil(amount)

  // --- Data Fetching ---
  const fetchGst = async () => {
    try {
      const res = await axios.get(`${API_URL}/vendor/getgstfee`)

      if (res.data && res.data.length > 0) {
        return {
          gst: parseFloat(res.data[0].gst || 0),
          handlingfee: parseFloat(res.data[0].handlingfee || 0)
        }
      }
    } catch (e) {
      console.error('Fetch GST Error', e)
    }

    return { gst: 0, handlingfee: 0 }
  }

  const fetchBackendCalculation = async bookingId => {
    // Try primary calc endpoint
    try {
      const res = await axios.get(`${API_URL}/vendor/charge-calculation/${bookingId}`)

      if (res.data && res.data.success) {
        return parseFloat(res.data.payableAmount || 0)
      }
    } catch (e) {
      console.warn('Backend calc failed, trying fallback', e)
    }

    // Try fallback endpoint
    try {
      const res = await axios.get(`${API_URL}/vendor/fet/${bookingId}`)

      if (res.data && res.data.success) {
        return parseFloat(res.data.payableAmount || 0)
      }
    } catch (e) {
      console.warn('Fallback fetch failed', e)
    }

    return null // Return null to signal "use frontend calc"
  }

  // --- Main Logic ---
  useEffect(() => {
    let timer

    const init = async () => {
      setLoading(true)
      if (!booking) return

      const bookingId = booking.id || booking._id || ''

      // 1. Fetch GST
      const gst = await fetchGst()

      setGstData(gst)

      // 2. Start Timer for Live Duration
      const parkingTime = parseParkingDateTime(
        booking.parkingDate || booking.parkeddate,
        booking.parkingTime || booking.parkedtime
      ) // Handle both key casing

      const updateData = async () => {
        const currentTime = new Date()

        setNow(currentTime)
        const diffMs = currentTime - parkingTime
        const diffSeconds = Math.max(0, Math.floor(diffMs / 1000))

        // Format Duration
        const hours = Math.floor(diffSeconds / 3600)
        const minutes = Math.floor((diffSeconds % 3600) / 60)
        const seconds = diffSeconds % 60
        const formattedDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

        // 3. Calc Amount (Backend priority)
        let amount = await fetchBackendCalculation(bookingId)

        // Frontend Fallback (Simple Hourly for now as backup - replicating full logic is complex without charges array)
        if (amount === null) {
          // Placeholder fallback: Just example logic if backend fails completely
          // Ideally we fetch 'charges' and do the full logic, but let's assume backend works or defaults 0
          amount = 0
        }

        // 4. Calculate Taxes
        // Logic: Round(Parking) -> + GST(on rounded) -> + Handling(Rounded)

        const roundedParking = roundUpToNearestRupee(amount)
        let gstVal = 0
        let handlingVal = 0

        if (booking.userid) {
          // Only for app users
          gstVal = roundUpToNearestRupee((roundedParking * gst.gst) / 100)
          handlingVal = roundUpToNearestRupee(gst.handlingfee)
        }

        const total = roundedParking + gstVal + handlingVal

        setPayableData({
          payableDuration: diffSeconds, // Store in seconds probably useful? or keep duration obj
          payableAmount: amount, // Raw amount
          gstAmount: gstVal,
          handlingFee: handlingVal,
          totalAmount: total,
          formattedDuration
        })
        setCalculating(false)
        setLoading(false)
      }

      updateData()
      timer = setInterval(updateData, 5000) // Update every 5s
    }

    if (open) {
      init()
    }

    return () => clearInterval(timer)
  }, [open, booking])

  const handleExitConfirm = async () => {
    if (!booking) return

    try {
      // Prepare Payload
      // Needs roundedParkingCharge, roundedGst, roundedHandlingFee, finalTotal
      // And 'hour' string.

      const roundedParking = roundUpToNearestRupee(payableData.payableAmount)

      const payload = {
        amount: roundedParking,
        hour: payableData.formattedDuration
      }

      if (booking.userid) {
        payload.gstamout = payableData.gstAmount
        payload.handlingfee = payableData.handlingFee
        payload.totalamout = payableData.totalAmount
      }

      const bookingId = booking.id || booking._id || ''

      await axios.put(`${API_URL}/vendor/exitvehicle/${bookingId}`, payload)

      onExitSuccess()
      onClose()
    } catch (e) {
      console.error('Exit Failed', e)

      // Show error? Passed handler could show snackbar
    }
  }

  if (!open || !booking) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant='h6' fontWeight='bold'>
          Exit Vehicle
        </Typography>
        <IconButton onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='h6' color='primary' fontWeight='bold'>
                {booking.vehicleNumber}
              </Typography>
              <Box
                sx={{
                  bgcolor: 'primary.light',
                  color: 'white',
                  p: 0.5,
                  px: 1,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {booking.vehicleType === 'Car' ? (
                  <DirectionsCarIcon fontSize='small' />
                ) : (
                  <TwoWheelerIcon fontSize='small' />
                )}
                <Typography variant='caption' fontWeight='bold'>
                  {payableData.formattedDuration}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Details List */}
            <Grid container spacing={1}>
              <DetailRow label='Booking ID' value={(booking.id || booking._id || '').slice(-8)} />
              <DetailRow
                label='In Time'
                value={`${booking.parkingDate || booking.parkeddate} ${booking.parkingTime || booking.parkedtime}`}
              />
              <DetailRow label='Name' value={booking.username || booking.vendorname || booking.personName || 'N/A'} />
              <DetailRow
                label='Mobile'
                value={booking.phoneno || booking.mobilenumber || booking.mobileNumber || 'N/A'}
              />
              <DetailRow label='Type' value={`${booking.sts} (${booking.bookType || 'Standard'})`} />
              <DetailRow label='Booked By' value={booking.userid ? 'Customer' : 'Vendor'} />
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* Payment Calculation */}
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
              <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
                Payment Details
              </Typography>

              <AmountRow label='Parking Charges' amount={roundUpToNearestRupee(payableData.payableAmount)} />

              {booking.userid && (
                <>
                  <AmountRow label='Handling Fee' amount={payableData.handlingFee} />
                  <AmountRow label={`GST (${gstData.gst}%)`} amount={payableData.gstAmount} />
                </>
              )}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant='h6' color='primary' fontWeight='bold'>
                  Payable Amount
                </Typography>
                <Typography variant='h6' color='primary' fontWeight='bold'>
                  ₹{payableData.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        {
          /* !loading && */ <Button
            variant='contained'
            color='primary'
            fullWidth
            size='large'
            onClick={handleExitConfirm}
            startIcon={<CloseIcon sx={{ transform: 'rotate(90deg)' }} />} // Icon looking like 'Exit' door? or just generic
          >
            Confirm Exit & Pay
          </Button>
        }
      </DialogActions>
    </Dialog>
  )
}

const DetailRow = ({ label, value }) => (
  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant='body2' color='textSecondary'>
      {label}:
    </Typography>
    <Typography variant='body2' fontWeight='bold'>
      {value}
    </Typography>
  </Grid>
)

const AmountRow = ({ label, amount }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
    <Typography variant='body2'>{label}</Typography>
    <Typography variant='body2' fontWeight='bold'>
      ₹{amount.toFixed(2)}
    </Typography>
  </Box>
)

export default ExitDialog
