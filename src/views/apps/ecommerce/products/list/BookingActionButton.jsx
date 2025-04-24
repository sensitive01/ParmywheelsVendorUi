'use client'

import { useState } from 'react'
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

const API_URL = process.env.NEXT_PUBLIC_API_URL

const BookingActionButton = ({ bookingId, currentStatus, onUpdate }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [actionType, setActionType] = useState('')
  const [amount, setAmount] = useState('')
  const [hours, setHours] = useState('')
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
    setAmount('')
    setHours('')
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
        headers: { 'Content-Type': 'application/json' }
      }

      switch (actionType) {
        case 'exitVehicle':
          if (!amount || !hours) {
            showSnackbar('Amount and hours are required', 'error')
            setLoading(false)
            return
          }
          endpoint = `${API_URL}/vendor/exitvehicle/${bookingId}`
          options.body = JSON.stringify({
            amount: Number(amount),
            hour: Number(hours)
          })
          break
        case 'approve':
          if (!dateInput || !timeInput) {
            showSnackbar('Approval date and time are required', 'error')
            setLoading(false)
            return
          }
          
          endpoint = `${API_URL}/vendor/approvebooking/${bookingId}`
          options.body = JSON.stringify({
            approvedDate: dateInput,
            approvedTime: timeInput
          })
          break
        case 'cancel':
          endpoint = `${API_URL}/vendor/cancelbooking/${bookingId}`
          options.body = JSON.stringify({})  // Empty body as the API uses server timestamp
          break
        case 'cancelApproved':
          endpoint = `${API_URL}/vendor/approvedcancelbooking/${bookingId}`
          options.body = JSON.stringify({})  // Empty body as the API uses server timestamp
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
            parkedTime: timeInput
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

  const renderDialogContent = () => {
    switch (actionType) {
      case 'exitVehicle':
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />
          </Stack>
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
        maxWidth="sm" 
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
        
        <DialogContent>
          {renderDialogContent()}
        </DialogContent>
        
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


// 'use client'

// import { useState, useEffect } from 'react'
// import { 
//   Button, 
//   Menu, 
//   MenuItem, 
//   Dialog, 
//   DialogTitle, 
//   DialogContent, 
//   DialogActions, 
//   TextField,
//   Alert,
//   Snackbar,
//   CircularProgress,
//   Stack,
//   Typography,
//   Box,
//   Divider
// } from '@mui/material'
// import { useSession } from 'next-auth/react'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// const BookingActionButton = ({ bookingId, currentStatus, onUpdate, vehicleType }) => {
//   const [anchorEl, setAnchorEl] = useState(null)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [actionType, setActionType] = useState('')
//   const [amount, setAmount] = useState('')
//   const [hours, setHours] = useState('')
//   const [dateInput, setDateInput] = useState('')
//   const [timeInput, setTimeInput] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [calculatingCharges, setCalculatingCharges] = useState(false)
//   const [chargesData, setChargesData] = useState(null)
//   const [parkingDetails, setParkingDetails] = useState(null)
//   const { data: session } = useSession()
//   const vendorId = session?.user?.id
  
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   })

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget)
//   }

//   const handleClose = () => {
//     setAnchorEl(null)
//   }

//   const handleSnackbarClose = () => {
//     setSnackbar(prev => ({ ...prev, open: false }))
//   }

//   // Fetch booking details to get parking start time
//   const fetchBookingDetails = async (bookingId) => {
//     try {
//       const response = await fetch(`${API_URL}/vendor/booking/${bookingId}`)
//       if (!response.ok) {
//         throw new Error('Failed to fetch booking details')
//       }
//       const data = await response.json()
//       return data.booking
//     } catch (error) {
//       console.error('Error fetching booking details:', error)
//       return null
//     }
//   }

//   // Calculate parking duration in hours
//   const calculateParkingDuration = (parkedDate, parkedTime) => {
//     if (!parkedDate || !parkedTime) return 0
    
//     try {
//       // Parse parked date and time
//       const [day, month, year] = parkedDate.split('-')
//       const [timePart, ampm] = parkedTime.split(' ')
//       let [hours, minutes] = timePart.split(':').map(Number)
      
//       // Convert to 24-hour format if needed
//       if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
//         hours += 12
//       } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
//         hours = 0
//       }
      
//       // Create start date object
//       const parkingStartTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)
//       const now = new Date()
      
//       // Calculate difference in hours (decimal)
//       const diffMs = now - parkingStartTime
//       const diffHours = diffMs / (1000 * 60 * 60)
      
//       return diffHours
//     } catch (error) {
//       console.error('Error calculating parking duration:', error)
//       return 0
//     }
//   }

//   // Calculate charges based on parking duration and charge sheet
//   const calculateCharges = (parkingHours, charges, vehicleCategory) => {
//     if (!charges || !vehicleCategory) return { totalAmount: 0, totalHours: 0 }
    
//     // Filter charges for the specific vehicle category
//     const categoryCharges = charges.filter(charge => 
//       charge.category.toLowerCase() === vehicleCategory.toLowerCase()
//     )
    
//     if (categoryCharges.length === 0) return { totalAmount: 0, totalHours: 0 }
    
//     // Find minimum charges
//     const minCharges = categoryCharges.find(charge => 
//       charge.type.includes('0 to') && !charge.type.includes('Additional')
//     )
    
//     // Find additional hour charges
//     const additionalHourCharges = categoryCharges.find(charge => 
//       charge.type.includes('Additional')
//     )
    
//     // Find full day charges
//     const fullDayCharges = categoryCharges.find(charge => 
//       charge.type.includes('Full Day')
//     )
    
//     // Find monthly charges
//     const monthlyCharges = categoryCharges.find(charge => 
//       charge.type.includes('Monthly')
//     )
    
//     let totalAmount = 0
//     let effectiveHours = Math.ceil(parkingHours) // Round up to the nearest hour
    
//     // Calculate charges based on duration
//     if (parkingHours <= 24) {
//       // Check if we should apply minimum charges
//       if (minCharges) {
//         // Extract the hour limit from minimum charges (e.g., "0 to 3 hours" → 3)
//         const minHoursLimit = parseFloat(minCharges.type.match(/\d+/g)[1])
        
//         if (parkingHours <= minHoursLimit) {
//           // If parking time is within minimum hours limit, apply only minimum charges
//           totalAmount = parseFloat(minCharges.amount)
//         } else {
//           // Apply minimum charges + additional hours charges
//           totalAmount = parseFloat(minCharges.amount)
          
//           if (additionalHourCharges) {
//             const additionalHours = effectiveHours - minHoursLimit
//             if (additionalHours > 0) {
//               totalAmount += additionalHours * parseFloat(additionalHourCharges.amount)
//             }
//           }
//         }
//       }
      
//       // Check if full day rate is cheaper
//       if (fullDayCharges && parseFloat(fullDayCharges.amount) < totalAmount) {
//         totalAmount = parseFloat(fullDayCharges.amount)
//       }
//     } else {
//       // For multi-day parking
//       const days = Math.floor(parkingHours / 24)
//       const remainingHours = parkingHours % 24
      
//       if (fullDayCharges) {
//         totalAmount = days * parseFloat(fullDayCharges.amount)
//       }
      
//       // Add charges for remaining hours
//       if (remainingHours > 0) {
//         if (minCharges && remainingHours <= parseFloat(minCharges.type.match(/\d+/g)[1])) {
//           totalAmount += parseFloat(minCharges.amount)
//         } else if (additionalHourCharges) {
//           const minHoursLimit = minCharges ? parseFloat(minCharges.type.match(/\d+/g)[1]) : 0
//           totalAmount += parseFloat(minCharges ? minCharges.amount : 0)
//           totalAmount += (remainingHours - minHoursLimit) * parseFloat(additionalHourCharges.amount)
//         }
//       }
      
//       // Check if monthly rate is applicable and cheaper
//       if (monthlyCharges && parkingHours >= 24 * 30) {
//         const months = Math.floor(parkingHours / (24 * 30))
//         const monthlyAmount = months * parseFloat(monthlyCharges.amount)
        
//         if (monthlyAmount < totalAmount) {
//           totalAmount = monthlyAmount
//         }
//       }
//     }
    
//     return {
//       totalAmount: Math.round(totalAmount),
//       totalHours: effectiveHours
//     }
//   }

//   const handleActionClick = async (action) => {
//     setActionType(action)
//     handleClose()
//     resetFields()
    
//     // Initialize with current date and time in required format
//     const now = new Date()
//     const day = String(now.getDate()).padStart(2, '0')
//     const month = String(now.getMonth() + 1).padStart(2, '0')
//     const year = now.getFullYear()
//     const formattedDate = `${day}-${month}-${year}`
    
//     const hours = String(now.getHours() % 12 || 12).padStart(2, '0')
//     const minutes = String(now.getMinutes()).padStart(2, '0')
//     const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
//     const formattedTime = `${hours}:${minutes} ${ampm}`
    
//     setDateInput(formattedDate)
//     setTimeInput(formattedTime)
    
//     // If exit vehicle action, calculate charges
//     if (action === 'exitVehicle' && vendorId) {
//       setCalculatingCharges(true)
      
//       try {
//         // Fetch charge data
//         const chargesResponse = await fetch(`${API_URL}/vendor/getchargesdata/${vendorId}`)
//         if (!chargesResponse.ok) {
//           throw new Error('Failed to fetch charges data')
//         }
//         const chargesData = await chargesResponse.json()
//         setChargesData(chargesData.vendor.charges)
        
//         // Fetch booking details to get parked time
//         const bookingDetails = await fetchBookingDetails(bookingId)
//         if (bookingDetails) {
//           setParkingDetails(bookingDetails)
          
//           // Calculate parking duration
//           const parkingHours = calculateParkingDuration(
//             bookingDetails.parkedDate, 
//             bookingDetails.parkedTime
//           )
          
//           // Calculate charges based on vehicle type and duration
//           const category = vehicleType || bookingDetails.vehicleType || 'Car'
//           const { totalAmount, totalHours } = calculateCharges(
//             parkingHours, 
//             chargesData.vendor.charges, 
//             category
//           )
          
//           // Set calculated values
//           setAmount(totalAmount.toString())
//           setHours(totalHours.toString())
//         }
//       } catch (error) {
//         console.error('Error calculating charges:', error)
//         showSnackbar('Failed to calculate charges. Please enter manually.', 'warning')
//       } finally {
//         setCalculatingCharges(false)
//       }
//     }
    
//     setOpenDialog(true)
//   }

//   const resetFields = () => {
//     setAmount('')
//     setHours('')
//     setDateInput('')
//     setTimeInput('')
//     setChargesData(null)
//     setParkingDetails(null)
//   }

//   const handleDialogClose = () => {
//     setOpenDialog(false)
//     resetFields()
//   }

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({
//       open: true,
//       message,
//       severity
//     })
//   }

//   const handleSubmit = async () => {
//     if (!bookingId) {
//       showSnackbar('Booking ID is missing', 'error')
//       return
//     }

//     setLoading(true)
    
//     try {
//       let endpoint = ''
//       let options = {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' }
//       }

//       switch (actionType) {
//         case 'exitVehicle':
//           if (!amount || !hours) {
//             showSnackbar('Amount and hours are required', 'error')
//             setLoading(false)
//             return
//           }
//           endpoint = `${API_URL}/vendor/exitvehicle/${bookingId}`
//           options.body = JSON.stringify({
//             amount: Number(amount),
//             hour: Number(hours)
//           })
//           break
//         case 'approve':
//           if (!dateInput || !timeInput) {
//             showSnackbar('Approval date and time are required', 'error')
//             setLoading(false)
//             return
//           }
          
//           endpoint = `${API_URL}/vendor/approvebooking/${bookingId}`
//           options.body = JSON.stringify({
//             approvedDate: dateInput,
//             approvedTime: timeInput
//           })
//           break
//         case 'cancel':
//           endpoint = `${API_URL}/vendor/cancelbooking/${bookingId}`
//           options.body = JSON.stringify({})  // Empty body as the API uses server timestamp
//           break
//         case 'cancelApproved':
//           endpoint = `${API_URL}/vendor/approvedcancelbooking/${bookingId}`
//           options.body = JSON.stringify({})  // Empty body as the API uses server timestamp
//           break
//         case 'allowParking':
//           if (!dateInput || !timeInput) {
//             showSnackbar('Parking date and time are required', 'error')
//             setLoading(false)
//             return
//           }
          
//           endpoint = `${API_URL}/vendor/allowparking/${bookingId}`
//           options.body = JSON.stringify({
//             parkedDate: dateInput,
//             parkedTime: timeInput
//           })
//           break
//         default:
//           throw new Error('Invalid action type')
//       }

//       const response = await fetch(endpoint, options)
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || 'Failed to update booking status')
//       }

//       const data = await response.json()
//       showSnackbar(data.message || 'Status updated successfully')
//       handleDialogClose()
//       if (onUpdate) onUpdate()
//     } catch (error) {
//       console.error('Error updating booking status:', error)
//       showSnackbar(error.message || 'Failed to update status', 'error')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getAvailableActions = () => {
//     const status = currentStatus?.toLowerCase()

//     switch (status) {
//       case 'pending':
//         return [
//           { action: 'approve', label: 'Approve Booking', color: 'success' },
//           { action: 'cancel', label: 'Cancel Booking', color: 'error' }
//         ]
//       case 'approved':
//         return [
//           { action: 'allowParking', label: 'Allow Parking', color: 'info' },
//           { action: 'cancelApproved', label: 'Cancel Booking', color: 'error' }
//         ]
//       case 'parked':
//         return [
//           { action: 'exitVehicle', label: 'Exit Vehicle', color: 'warning' }
//         ]
//       default:
//         return []
//     }
//   }

//   // Format time display for better readability
//   const formatTimeDisplay = (timeStr) => {
//     if (!timeStr) return ''
//     if (timeStr.includes('AM') || timeStr.includes('PM')) {
//       return timeStr
//     }
//     try {
//       const [hours, minutes] = timeStr.split(':').map(Number)
//       const period = hours >= 12 ? 'PM' : 'AM'
//       const hours12 = hours % 12 || 12
//       return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
//     } catch (e) {
//       return timeStr
//     }
//   }

//   const renderDialogContent = () => {
//     switch (actionType) {
//       case 'exitVehicle':
//         return (
//           <Stack spacing={3} sx={{ mt: 2 }}>
//             {calculatingCharges ? (
//               <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
//                 <CircularProgress />
//               </Box>
//             ) : parkingDetails ? (
//               <Box sx={{ mb: 2 }}>
//                 <Alert severity="info" sx={{ mb: 2 }}>
//                   <Typography variant="body2">
//                     <strong>Vehicle:</strong> {parkingDetails.vehicleType || 'N/A'} ({parkingDetails.vehicleNumber || 'N/A'})
//                   </Typography>
//                   <Typography variant="body2">
//                     <strong>Parked At:</strong> {parkingDetails.parkedDate || 'N/A'}, {formatTimeDisplay(parkingDetails.parkedTime || 'N/A')}
//                   </Typography>
//                 </Alert>
//               </Box>
//             ) : null}
            
//             <TextField
//               label="Amount (₹)"
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               fullWidth
//               required
//               disabled={loading}
//               InputProps={{
//                 startAdornment: '₹',
//               }}
//             />
//             <TextField
//               label="Hours"
//               type="number"
//               value={hours}
//               onChange={(e) => setHours(e.target.value)}
//               fullWidth
//               required
//               disabled={loading}
//             />
            
//             {chargesData && chargesData.length > 0 && (
//               <Box sx={{ mt: 2 }}>
//                 <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                   Charges Reference:
//                 </Typography>
//                 <Divider sx={{ mb: 2 }} />
//                 {chargesData
//                   .filter(charge => vehicleType && charge.category.toLowerCase() === vehicleType.toLowerCase())
//                   .map((charge, index) => (
//                     <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
//                       {charge.type}: ₹{charge.amount}
//                     </Typography>
//                   ))}
//               </Box>
//             )}
//           </Stack>
//         )
//       case 'approve':
//       case 'allowParking':
//         return (
//           <Stack spacing={3} sx={{ mt: 2 }}>
//             <TextField
//               label={actionType === 'approve' ? "Approval Date (DD-MM-YYYY)" : "Parking Date (DD-MM-YYYY)"}
//               value={dateInput}
//               onChange={(e) => setDateInput(e.target.value)}
//               placeholder="DD-MM-YYYY"
//               fullWidth
//               required
//               disabled={loading}
//             />
//             <TextField
//               label={actionType === 'approve' ? "Approval Time (hh:mm AM/PM)" : "Parking Time (hh:mm AM/PM)"}
//               value={timeInput}
//               onChange={(e) => setTimeInput(e.target.value)}
//               placeholder="hh:mm AM/PM"
//               fullWidth
//               required
//               disabled={loading}
//             />
//             <Typography variant="caption" color="text.secondary">
//               Format: Date (DD-MM-YYYY) and Time (hh:mm AM/PM)
//             </Typography>
//           </Stack>
//         )
//       case 'cancel':
//       case 'cancelApproved':
//         return (
//           <Alert severity="warning" sx={{ mt: 2 }}>
//             Are you sure you want to cancel this booking? This action cannot be undone.
//           </Alert>
//         )
//       default:
//         return null
//     }
//   }

//   const actions = getAvailableActions()

//   if (actions.length === 0) {
//     return (
//       <Button 
//         variant="outlined" 
//         color={
//           currentStatus?.toLowerCase() === 'completed' ? 'success' : 
//           currentStatus?.toLowerCase() === 'cancelled' ? 'error' : 'default'
//         }
//         disabled
//       >
//         {currentStatus || 'N/A'}
//       </Button>
//     )
//   }

//   return (
//     <>
//       <Button
//         variant="outlined"
//         color="primary"
//         onClick={handleClick}
//         endIcon={<i className="ri-arrow-down-s-line" />}
//         disabled={loading}
//       >
//         {loading ? <CircularProgress size={20} /> : 'Update Status'}
//       </Button>
      
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleClose}
//       >
//         {actions.map((actionItem) => (
//           <MenuItem 
//             key={actionItem.action} 
//             onClick={() => handleActionClick(actionItem.action)}
//           >
//             {actionItem.label}
//           </MenuItem>
//         ))}
//       </Menu>

//       <Dialog 
//         open={openDialog} 
//         onClose={handleDialogClose} 
//         maxWidth="sm" 
//         fullWidth
//       >
//         <DialogTitle>
//           {{
//             'approve': 'Approve Booking',
//             'cancel': 'Cancel Booking',
//             'cancelApproved': 'Cancel Approved Booking',
//             'allowParking': 'Allow Parking',
//             'exitVehicle': 'Exit Vehicle'
//           }[actionType] || 'Update Booking Status'}
//         </DialogTitle>
        
//         <DialogContent>
//           {renderDialogContent()}
//         </DialogContent>
        
//         <DialogActions>
//           <Button 
//             onClick={handleDialogClose} 
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleSubmit} 
//             variant="contained" 
//             color={
//               actionType === 'cancel' || actionType === 'cancelApproved' ? 'error' : 
//               actionType === 'approve' ? 'success' : 'primary'
//             }
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={20} /> : 'Confirm'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert 
//           onClose={handleSnackbarClose} 
//           severity={snackbar.severity} 
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   )
// }

// export default BookingActionButton
