'use client'

import { useState } from 'react'

import { useSession } from 'next-auth/react'
import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material'

import ExitVehicleCalculator from './ExitVehicleCalculator'
import RenewSubscriptionDialog from './RenewSubscriptionDialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const BookingActionButton = ({ bookingId, currentStatus, bookingDetails, onUpdate }) => {
  const { data: session } = useSession()
  const [anchorEl, setAnchorEl] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [actionType, setActionType] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [loading, setLoading] = useState(false)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // Renewal State
  const [showRenewDialog, setShowRenewDialog] = useState(false)

  const isSubscription = bookingDetails?.sts?.toLowerCase() === 'subscription'

  const [otp, setOtp] = useState('')
  const [backendOtp, setBackendOtp] = useState('')
  const isVendorBooking = !bookingDetails?.userid

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const fetchBookingOtp = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/getbooking/${bookingId}`)
      const data = await response.json()

      console.log('Fetched Booking Data:', data)

      if (data?.data?.otp) {
        setBackendOtp(String(data.data.otp))
      } else if (data?.otp) {
        // Handle potential flat structure
        setBackendOtp(String(data.otp))
      } else if (data?.booking?.otp) {
        // Handle potential nested booking structure
        setBackendOtp(String(data.booking.otp))
      }
    } catch (error) {
      console.error('Error fetching OTP:', error)
    }
  }

  const handleActionClick = async action => {
    handleClose()

    if (action === 'renew') {
      setShowRenewDialog(true)

      return
    }

    setActionType(action)
    resetFields()
    setOtp('')
    setBackendOtp('')

    // Initialize with current date and time in required format
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const formattedDate = `${day}-${month}-${year}`

    const hours = String(now.getHours() % 12 || 12).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
    const formattedTime = `${hours}:${minutes} ${ampm}`

    setDateInput(formattedDate)
    setTimeInput(formattedTime)

    if (action === 'allowParking' && !isVendorBooking) {
      // Use bookingDetails.otp as initial value if available, while fetching fresh one
      if (bookingDetails?.otp) {
        setBackendOtp(String(bookingDetails.otp))
      }
      await fetchBookingOtp()
    }

    setOpenDialog(true)
  }

  const resetFields = () => {
    setDateInput('')
    setTimeInput('')
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
    resetFields()
    setOtp('')
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    })
  }

  const handleSubmit = async () => {
    if (!bookingId) {
      showSnackbar('Booking ID is missing', 'error')

      return
    }

    setLoading(true)

    try {
      let endpoint = ''
      let options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`
        }
      }

      switch (actionType) {
        case 'approve':
          if (!dateInput || !timeInput) {
            showSnackbar('Approval date and time are required', 'error')
            setLoading(false)

            return
          }

          endpoint = `${API_URL}/vendor/approvebooking/${bookingId}`
          options.body = JSON.stringify({
            approvedDate: dateInput,
            approvedTime: timeInput,
            vendorId: session?.user?.id
          })
          break
        case 'cancel':
          endpoint = `${API_URL}/vendor/cancelbooking/${bookingId}`
          options.body = JSON.stringify({
            vendorId: session?.user?.id
          })
          break
        case 'cancelApproved':
          endpoint = `${API_URL}/vendor/approvedcancelbooking/${bookingId}`
          options.body = JSON.stringify({
            vendorId: session?.user?.id
          })
          break
        case 'allowParking':
          if (!dateInput || !timeInput) {
            showSnackbar('Parking date and time are required', 'error')
            setLoading(false)

            return
          }

          if (!isVendorBooking) {
            if (!otp) {
              showSnackbar('First 3 digits of OTP are required', 'error')
              setLoading(false)

              return
            }

            console.log('Verifying OTP - Input:', otp, 'Backend:', backendOtp)

            if (otp.length !== 3 || !backendOtp || !String(backendOtp).trim().startsWith(String(otp).trim())) {
              showSnackbar('OTP does not match the first 3 digits of booking OTP', 'error')
              setLoading(false)

              return
            }
          }

          endpoint = `${API_URL}/vendor/allowparking/${bookingId}`
          options.body = JSON.stringify({
            parkedDate: dateInput,
            parkedTime: timeInput,
            vendorId: session?.user?.id
          })
          break
        default:
          throw new Error('Invalid action type')
      }

      const response = await fetch(endpoint, options)

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update booking status')
      }

      const data = await response.json()

      showSnackbar(data.message || 'Status updated successfully')
      handleDialogClose()
      if (onUpdate) onUpdate()

      // Refresh the page after a short delay to show the success message
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error updating booking status:', error)
      showSnackbar(error.message || 'Failed to update status', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getAvailableActions = () => {
    const status = currentStatus?.toLowerCase()
    const actions = []

    if (isSubscription) {
      // Subscription Actions
      if (status === 'pending') {
        actions.push(
          { action: 'approve', label: 'Approve Booking', color: 'success' },
          { action: 'cancel', label: 'Cancel Booking', color: 'error' }
        )
      } else if (status === 'approved') {
        actions.push(
          { action: 'allowParking', label: 'Allow Parking', color: 'info' },
          { action: 'cancelApproved', label: 'Cancel Booking', color: 'error' }
        )
      } else if (status === 'parked') {
        actions.push(
          { action: 'exitVehicle', label: 'Exit Subscription', color: 'warning' },
          { action: 'renew', label: 'Renew Subscription', color: 'primary' }
        )
      }
    } else {
      // Regular Actions
      switch (status) {
        case 'pending':
          actions.push(
            { action: 'approve', label: 'Approve Booking', color: 'success' },
            { action: 'cancel', label: 'Cancel Booking', color: 'error' }
          )
          break
        case 'approved':
          actions.push(
            { action: 'allowParking', label: 'Allow Parking', color: 'info' },
            { action: 'cancelApproved', label: 'Cancel Booking', color: 'error' }
          )
          break
        case 'parked':
          actions.push({ action: 'exitVehicle', label: 'Exit Vehicle', color: 'warning' })
          break
      }
    }

    return actions
  }

  const handleExitSuccess = message => {
    showSnackbar(message)
    handleDialogClose()
    if (onUpdate) onUpdate()
  }

  const handleRenewSuccess = message => {
    showSnackbar(message)
    setShowRenewDialog(false)
    if (onUpdate) onUpdate()

    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const renderDialogContent = () => {
    switch (actionType) {
      case 'exitVehicle':
        return (
          <ExitVehicleCalculator
            bookingId={bookingId}
            vehicleType={bookingDetails?.vehicleType || 'Car'}
            bookType={bookingDetails?.bookType || 'Hourly'}
            bookingDetails={bookingDetails}
            onClose={handleDialogClose}
            onSuccess={handleExitSuccess}
          />
        )
      case 'approve':
      case 'allowParking':
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label={actionType === 'approve' ? 'Approval Date (DD-MM-YYYY)' : 'Parking Date (DD-MM-YYYY)'}
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              placeholder='DD-MM-YYYY'
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label={actionType === 'approve' ? 'Approval Time (hh:mm AM/PM)' : 'Parking Time (hh:mm AM/PM)'}
              value={timeInput}
              onChange={e => setTimeInput(e.target.value)}
              placeholder='hh:mm AM/PM'
              fullWidth
              required
              disabled={loading}
            />
            {actionType === 'allowParking' && !isVendorBooking && (
              <TextField
                label='Enter First 3 Digits of OTP'
                value={otp}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 3)

                  setOtp(val)
                }}
                error={!otp || (otp && backendOtp && !String(backendOtp).trim().startsWith(String(otp).trim()))}
                helperText={
                  !otp
                    ? 'First 3 digits of OTP are required'
                    : otp && backendOtp && !String(backendOtp).trim().startsWith(String(otp).trim())
                      ? 'OTP does not match the first 3 digits'
                      : ''
                }
                fullWidth
                required
                disabled={loading}
                inputProps={{ maxLength: 3 }}
              />
            )}
            <Typography variant='caption' color='text.secondary'>
              Format: Date (DD-MM-YYYY) and Time (hh:mm AM/PM)
            </Typography>
          </Stack>
        )
      case 'cancel':
      case 'cancelApproved':
        return (
          <Alert severity='warning' sx={{ mt: 2 }}>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Alert>
        )
      default:
        return null
    }
  }

  const actions = getAvailableActions()

  if (actions.length === 0) {
    return (
      <Button
        variant='outlined'
        color={
          currentStatus?.toLowerCase() === 'completed'
            ? 'success'
            : currentStatus?.toLowerCase() === 'cancelled'
              ? 'error'
              : 'default'
        }
        disabled
      >
        {currentStatus || 'N/A'}
      </Button>
    )
  }

  return (
    <>
      <RenewSubscriptionDialog
        open={showRenewDialog}
        onClose={() => setShowRenewDialog(false)}
        bookingId={bookingId}
        vehicleType={bookingDetails?.vehicleType || 'Car'}
        vehicleNumber={bookingDetails?.vehicleNumber || 'N/A'}
        bookingDetails={bookingDetails}
        userId={bookingDetails?.userid}
        userName={bookingDetails?.personName}
        mobileNumber={bookingDetails?.mobileNumber}
        onSuccess={handleRenewSuccess}
      />

      <Button
        variant='outlined'
        color='primary'
        onClick={handleClick}
        endIcon={<i className='ri-arrow-down-s-line' />}
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : 'Update Status'}
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {actions.map(actionItem => (
          <MenuItem key={actionItem.action} onClick={() => handleActionClick(actionItem.action)}>
            {actionItem.label}
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth={actionType === 'exitVehicle' ? 'md' : 'sm'}
        fullWidth
      >
        <DialogTitle>
          {{
            approve: 'Approve Booking',
            cancel: 'Cancel Booking',
            cancelApproved: 'Cancel Approved Booking',
            allowParking: 'Allow Parking',
            exitVehicle: 'Exit Vehicle'
          }[actionType] || 'Update Booking Status'}
        </DialogTitle>

        {renderDialogContent()}

        {actionType !== 'exitVehicle' && (
          <DialogActions>
            <Button onClick={handleDialogClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant='contained'
              color={
                actionType === 'cancel' || actionType === 'cancelApproved'
                  ? 'error'
                  : actionType === 'approve'
                    ? 'success'
                    : 'primary'
              }
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Confirm'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default BookingActionButton
