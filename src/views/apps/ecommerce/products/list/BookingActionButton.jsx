// import { useState } from "react";

// import axios from "axios";
// import Button from "@mui/material/Button";
// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogTitle from "@mui/material/DialogTitle";
// import TextField from "@mui/material/TextField";

// const API_URL = "https://parkmywheelsapi.onrender.com/vendor";

// const BookingActionButton = ({ bookingId, currentStatus, onUpdate }) => {
//     const [status, setStatus] = useState(currentStatus);
//     const [loading, setLoading] = useState(false);
//     const [openDialog, setOpenDialog] = useState(false);
//     const [amount, setAmount] = useState("");
//     const [hour, setHour] = useState("");
//     const [exitDisabled, setExitDisabled] = useState(false); // ✅ New state to disable Exit button

//     // Function to handle API calls
//     const handleApiCall = async () => {
//         setLoading(true);

//         try {
//             let url = "";
//             let newStatus = status;

//             if (status === "Pending") {
//                 url = `${API_URL}/approvebooking/${bookingId}`;
//                 newStatus = "Approved";
//             } else if (status === "Approved") {
//                 url = `${API_URL}/allowparking/${bookingId}`;
//                 newStatus = "Parked";
//             } else if (status === "Cancelled") {
//                 return; // No action after cancellation
//             }

//             if (url) {
//                 const response = await axios.put(url);

//                 if (response.data.success) {
//                     setStatus(newStatus);
//                     onUpdate(); // Refresh table
//                 }
//             }
//         } catch (error) {
//             console.error("API Error:", error);
//         }

//         setLoading(false);
//     };

//     // Function to handle exit with amount & hours
//     const handleExit = async () => {
//         setLoading(true);

//         try {
//             const response = await axios.put(`${API_URL}/exitvehicle/${bookingId}`, { amount, hour });

//             if (response.data.success) {
//                 setStatus("Completed"); // ✅ Final step, disable the button
//                 setExitDisabled(true); // ✅ Disable Exit button after submission
//                 onUpdate(); // Refresh table
//             }
//         } catch (error) {
//             console.error("Exit API Error:", error);
//         }

//         setLoading(false);
//         setOpenDialog(false);
//     };

//     // Get button properties dynamically
//     const getButtonProps = () => {
//         if (status === "Pending") return { label: "Approve", color: "primary", onClick: handleApiCall };
//         if (status === "Approved") return { label: "Allow Parking", color: "success", onClick: handleApiCall };
//         if (status === "Parked") return { label: "Exit Vehicle", color: "warning", onClick: () => setOpenDialog(true), disabled: exitDisabled }; // ✅ Exit button disabled after submission
//         if (status === "Cancelled" || status === "Completed") return { label: status, color: "secondary", disabled: true };

//         // ✅ Default fallback to prevent `undefined` errors
//         return { label: "Unknown Status", color: "default", disabled: true };
//     };

//     const buttonProps = getButtonProps();

//     return (
//         <div>
//             <Button variant="contained" color={buttonProps.color} onClick={buttonProps.onClick} disabled={buttonProps.disabled || loading}>
//                 {buttonProps.label}
//             </Button>

//             {/* Exit Dialog Form */}
//             <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//                 <DialogTitle>Exit Vehicle - Enter Details</DialogTitle>
//                 <DialogContent>
//                     <TextField label="Amount" fullWidth margin="dense" value={amount} onChange={(e) => setAmount(e.target.value)} />
//                     <TextField label="Hour" fullWidth margin="dense" value={hour} onChange={(e) => setHour(e.target.value)} />
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//                     <Button onClick={handleExit} color="primary" disabled={loading || exitDisabled}>
//                         Submit
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// };

// export default BookingActionButton;

// 'use client'

// import { useState } from 'react'
// import { Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
// // import { LocalizationProvider } from '@mui/x-date-pickers'
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
// // import { DatePicker } from '@mui/x-date-pickers/DatePicker'
// // import { TimePicker } from '@mui/x-date-pickers/TimePicker'
// import format from 'date-fns/format'
// import Alert from '@mui/material/Alert'
// import Snackbar from '@mui/material/Snackbar'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// const BookingActionButton = ({ bookingId, currentStatus, onUpdate }) => {
//   const [anchorEl, setAnchorEl] = useState(null)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [actionType, setActionType] = useState('')
//   const [dateValue, setDateValue] = useState(new Date())
//   const [timeValue, setTimeValue] = useState(new Date())
//   const [amount, setAmount] = useState('')
//   const [hours, setHours] = useState('')
//   const [loading, setLoading] = useState(false)
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
//     setSnackbar({ ...snackbar, open: false })
//   }

//   const formatDate = (date) => {
//     return format(date, 'dd-MM-yyyy')
//   }

//   const formatTime = (date) => {
//     return format(date, 'hh:mm a')
//   }

//   const handleActionClick = (action) => {
//     setActionType(action)
//     handleClose()
//     setOpenDialog(true)
//   }

//   const handleDialogClose = () => {
//     setOpenDialog(false)
//     setDateValue(new Date())
//     setTimeValue(new Date())
//     setAmount('')
//     setHours('')
//   }

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({
//       open: true,
//       message,
//       severity
//     })
//   }

//   const handleSubmit = async () => {
//     setLoading(true)
//     try {
//       let response
//       let payload = {}
//       let endpoint = ''

//       switch (actionType) {
//         case 'approve':
//           endpoint = `${API_URL}/vendor/approvebooking/${bookingId}`
//           payload = {
//             approvedDate: formatDate(dateValue),
//             approvedTime: formatTime(timeValue)
//           }
//           response = await fetch(endpoint, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//           })
//           break

//         case 'cancel':
//           endpoint = `${API_URL}/vendor/cancelbooking/${bookingId}`
//           response = await fetch(endpoint, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' }
//           })
//           break

//         case 'cancelApproved':
//           endpoint = `${API_URL}/vendor/approvedcancelbooking/${bookingId}`
//           response = await fetch(endpoint, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' }
//           })
//           break

//         case 'allowParking':
//           endpoint = `${API_URL}/vendor/allowparking/${bookingId}`
//           payload = {
//             parkedDate: formatDate(dateValue),
//             parkedTime: formatTime(timeValue)
//           }
//           response = await fetch(endpoint, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//           })
//           break

//         case 'exitVehicle':
//           endpoint = `${API_URL}/vendor/exitvehicle/${bookingId}`
//           payload = {
//             amount: Number(amount),
//             hour: Number(hours)
//           }
//           response = await fetch(endpoint, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//           })
//           break

//         default:
//           throw new Error('Invalid action type')
//       }

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || 'Failed to update booking status')
//       }

//       const data = await response.json()
//       showSnackbar(data.message || 'Status updated successfully')
//       handleDialogClose()
//       if (onUpdate) onUpdate() // Refresh data after successful operation
//     } catch (error) {
//       console.error('Error updating booking status:', error)
//       showSnackbar(error.message || 'Failed to update status', 'error')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Determine available actions based on current status
//   // Note: API responses are case-sensitive, using exact status values
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
//         return [] // No actions for cancelled or completed bookings
//     }
//   }

//   const actions = getAvailableActions()

//   // If no actions available, show status instead
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
//       >
//         Update Status
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

//       <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           {actionType === 'approve' && 'Approve Booking'}
//           {actionType === 'cancel' && 'Cancel Booking'}
//           {actionType === 'cancelApproved' && 'Cancel Approved Booking'}
//           {actionType === 'allowParking' && 'Allow Parking'}
//           {actionType === 'exitVehicle' && 'Exit Vehicle'}
//         </DialogTitle>
        
//         <DialogContent>
//           {(actionType === 'approve' || actionType === 'allowParking') && (
//             <LocalizationProvider dateAdapter={AdapterDateFns}>
//               <div className="flex flex-col gap-4 mt-2">
//               <TextField
//   label="Date"
//   type="date"
//   value={formatDate(dateValue)} // Use formatDate to format the date
//   onChange={(e) => setDateValue(new Date(e.target.value))}
//   fullWidth
//   required
// />
// <TextField
//   label="Time"
//   type="time"
//   value={formatTime(timeValue)} // Use formatTime to format the time
//   onChange={(e) => setTimeValue(new Date(`1970-01-01T${e.target.value}:00`))}
//   fullWidth
//   required
// />

//               </div>
//             </LocalizationProvider>
//           )}

//           {actionType === 'exitVehicle' && (
//             <div className="flex flex-col gap-4 mt-2">
//               <TextField
//                 label="Amount"
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 fullWidth
//                 required
//               />
//               <TextField
//                 label="Hours"
//                 type="number"
//                 value={hours}
//                 onChange={(e) => setHours(e.target.value)}
//                 fullWidth
//                 required
//               />
//             </div>
//           )}

//           {(actionType === 'cancel' || actionType === 'cancelApproved') && (
//             <Alert severity="warning" sx={{ mt: 2 }}>
//               Are you sure you want to cancel this booking? This action cannot be undone.
//             </Alert>
//           )}
//         </DialogContent>
        
//         <DialogActions>
//           <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
//           <Button 
//             onClick={handleSubmit} 
//             variant="contained" 
//             color={
//               actionType === 'cancel' || actionType === 'cancelApproved' ? 'error' : 
//               actionType === 'approve' ? 'success' : 'primary'
//             }
//             disabled={loading}
//           >
//             {loading ? 'Processing...' : 'Confirm'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   )
// }

// export default BookingActionButton
// 'use client'

// import { useState } from 'react'
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
//   CircularProgress
// } from '@mui/material'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// const BookingActionButton = ({ bookingId, currentStatus, onUpdate }) => {
//   const [anchorEl, setAnchorEl] = useState(null)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [actionType, setActionType] = useState('')
//   const [amount, setAmount] = useState('')
//   const [hours, setHours] = useState('')
//   const [loading, setLoading] = useState(false)
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

//   const handleActionClick = (action) => {
//     setActionType(action)
//     handleClose()
//     setOpenDialog(true)
//   }

//   const handleDialogClose = () => {
//     setOpenDialog(false)
//     setAmount('')
//     setHours('')
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
//             return
//           }
//           endpoint = `${API_URL}/vendor/exitvehicle/${bookingId}`
//           options.body = JSON.stringify({
//             amount: Number(amount),
//             hour: Number(hours)
//           })
//           break
//         case 'approve':
//           endpoint = `${API_URL}/vendor/approvebooking/${bookingId}`
//           break
//         case 'cancel':
//           endpoint = `${API_URL}/vendor/cancelbooking/${bookingId}`
//           break
//         case 'cancelApproved':
//           endpoint = `${API_URL}/vendor/approvedcancelbooking/${bookingId}`
//           break
//         case 'allowParking':
//           endpoint = `${API_URL}/vendor/allowparking/${bookingId}`
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
//           {actionType === 'exitVehicle' && (
//             <div className="flex flex-col gap-4 mt-2">
//               <TextField
//                 label="Amount"
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 fullWidth
//                 required
//                 disabled={loading}
//               />
//               <TextField
//                 label="Hours"
//                 type="number"
//                 value={hours}
//                 onChange={(e) => setHours(e.target.value)}
//                 fullWidth
//                 required
//                 disabled={loading}
//               />
//             </div>
//           )}

//           {(actionType === 'cancel' || actionType === 'cancelApproved') && (
//             <Alert severity="warning" sx={{ mt: 2 }}>
//               Are you sure you want to cancel this booking? This action cannot be undone.
//             </Alert>
//           )}
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
