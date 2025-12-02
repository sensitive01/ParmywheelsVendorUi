
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleActionClick = (action) => {
    setActionType(action)
    handleClose()
    resetFields()

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

    setOpenDialog(true)
  }

  const resetFields = () => {
    setDateInput('')
    setTimeInput('')
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
    resetFields()
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
          'Authorization': `Bearer ${session?.accessToken}`
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

    switch (status) {
      case 'pending':
        return [
          { action: 'approve', label: 'Approve Booking', color: 'success' },
          { action: 'cancel', label: 'Cancel Booking', color: 'error' }
        ]
      case 'approved':
        return [
          { action: 'allowParking', label: 'Allow Parking', color: 'info' },
          { action: 'cancelApproved', label: 'Cancel Booking', color: 'error' }
        ]
      case 'parked':
        return [
          { action: 'exitVehicle', label: 'Exit Vehicle', color: 'warning' }
        ]
      default:
        return []
    }
  }

  const handleExitSuccess = (message) => {
    showSnackbar(message)
    handleDialogClose()
    if (onUpdate) onUpdate()
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
              label={actionType === 'approve' ? "Approval Date (DD-MM-YYYY)" : "Parking Date (DD-MM-YYYY)"}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="DD-MM-YYYY"
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label={actionType === 'approve' ? "Approval Time (hh:mm AM/PM)" : "Parking Time (hh:mm AM/PM)"}
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="hh:mm AM/PM"
              fullWidth
              required
              disabled={loading}
            />
            <Typography variant="caption" color="text.secondary">
              Format: Date (DD-MM-YYYY) and Time (hh:mm AM/PM)
            </Typography>
          </Stack>
        )
      case 'cancel':
      case 'cancelApproved':
        return (
          <Alert severity="warning" sx={{ mt: 2 }}>
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
        variant="outlined"
        color={
          currentStatus?.toLowerCase() === 'completed' ? 'success' :
            currentStatus?.toLowerCase() === 'cancelled' ? 'error' : 'default'
        }
        disabled
      >
        {currentStatus || 'N/A'}
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleClick}
        endIcon={<i className="ri-arrow-down-s-line" />}
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : 'Update Status'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {actions.map((actionItem) => (
          <MenuItem
            key={actionItem.action}
            onClick={() => handleActionClick(actionItem.action)}
          >
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
            'approve': 'Approve Booking',
            'cancel': 'Cancel Booking',
            'cancelApproved': 'Cancel Approved Booking',
            'allowParking': 'Allow Parking',
            'exitVehicle': 'Exit Vehicle'
          }[actionType] || 'Update Booking Status'}
        </DialogTitle>

        {renderDialogContent()}

        {actionType !== 'exitVehicle' && (
          <DialogActions>
            <Button
              onClick={handleDialogClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color={
                actionType === 'cancel' || actionType === 'cancelApproved' ? 'error' :
                  actionType === 'approve' ? 'success' : 'primary'
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
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default BookingActionButton
