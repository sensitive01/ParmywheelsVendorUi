// 'use client'
// import { useState, useEffect } from 'react'
// import axios from 'axios'
// import { useSession } from 'next-auth/react'

// import {
//   Box,
//   Step,
//   Container,
//   Paper,
//   Typography,
//   Grid,
//   TextField,
//   Button,
//   IconButton,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Chip,
//   Alert,
//   Collapse,
//   InputAdornment,
//   CircularProgress,
//   Switch,
//   FormGroup,
// } from '@mui/material'
// import MuiStepper from '@mui/material/Stepper'
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Divider from '@mui/material/Divider'
// import StepLabel from '@mui/material/StepLabel'
// import {
//   DirectionsCarFilled,
//   TwoWheeler,
//   LocalShipping,
//   AccessTime,
//   CalendarMonth,
//   AutorenewRounded,
//   Close as CloseIcon,
//   Check as CheckIcon,
//   KeyboardArrowRight,
//   Assignment,
//   ScheduleOutlined,
//   WatchLater
// } from '@mui/icons-material'
// import { styled } from '@mui/material/styles'

// // Component Imports
// import StepperWrapper from '@core/styles/stepper'
// import StepperCustomDot from '@components/stepper-dot'
// import DirectionalIcon from '@components/DirectionalIcon'
// import { createBookingNotification, showNotification } from '@/utils/requestNotificationPermission'

// const StyledPaper = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(3),
//   borderRadius: theme.spacing(1),
//   background: '#ffffff',
//   boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
//   overflow: 'hidden'
// }))

// const Stepper = styled(MuiStepper)(({ theme }) => ({
//   justifyContent: 'center',
//   '& .MuiStep-root': {
//     '&:first-of-type': {
//       paddingInlineStart: 0
//     },
//     '&:last-of-type': {
//       paddingInlineEnd: 0
//     },
//     [theme.breakpoints.down('md')]: {
//       paddingInline: 0
//     }
//   }
// }))

// const OptionCard = styled(Paper)(({ selected }) => ({
//   padding: '16px',
//   display: 'flex',
//   alignItems: 'center',
//   gap: '12px',
//   cursor: 'pointer',
//   border: selected ? '1px solid #1976d2' : '1px solid #e0e0e0',
//   backgroundColor: selected ? '#f5f9ff' : '#ffffff',
//   transition: 'all 0.2s ease',
//   '&:hover': {
//     backgroundColor: selected ? '#f5f9ff' : '#f8f8f8',
//     transform: 'translateY(-2px)'
//   }
// }))

// const IconWrapper = styled(Box)(({ theme }) => ({
//   width: 20,
//   height: 40,
//   borderRadius: '50%',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   color: theme.palette.primary.main
// }))

// // Custom styled toggle switch container
// const BookingTypeToggle = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'space-between',
//   padding: '12px 16px',
//   borderRadius: '48px',
//   border: '1px solid #e0e0e0',
//   background: '#f8f8f8',
//   marginTop: theme.spacing(2),
//   marginBottom: theme.spacing(2)
// }))

// // Custom styled toggle switch with clock icon
// const StyledSwitch = styled(Switch)(({ theme }) => ({
//   width: 120,
//   height: 34,
//   padding: 0,
//   '& .MuiSwitch-switchBase': {
//     padding: 0,
//     margin: 2,
//     transitionDuration: '300ms',
//     '&.Mui-checked': {
//       transform: 'translateX(86px)',
//       color: '#ff0000',
//       '& + .MuiSwitch-track': {
//         backgroundColor: '#4caf50',
//         opacity: 1,
//         border: 0,
//       },
//       '&.Mui-disabled + .MuiSwitch-track': {
//         opacity: 0.5,
//       },
//     },
//     '&.Mui-focusVisible .MuiSwitch-thumb': {
//       color: '#33cf4d',
//       border: '6px solid #fff',
//     },
//     '&.Mui-disabled .MuiSwitch-thumb': {
//       color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
//     },
//     '&.Mui-disabled + .MuiSwitch-track': {
//       opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
//     },
//   },
//   '& .MuiSwitch-thumb': {
//     boxSizing: 'border-box',
//     width: 30,
//     height: 30,
//     backgroundColor: props => props.checked ? '#ff0000' : '#ffffff',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     '& svg': {
//       fontSize: '20px',
//       color: props => props.checked ? 'white' : '#757575'
//     }
//   },
//   '& .MuiSwitch-track': {
//     borderRadius: 34 / 2,
//     backgroundColor: theme.palette.mode === 'light' ? '#4caf50' : '#39393D',
//     opacity: 1,
//     transition: theme.transitions.create(['background-color'], {
//       duration: 500,
//     }),
//   },
// }))

// const steps = [
//   {
//     title: 'Vehicle Type',
//   },
//   {
//     title: 'Booking Details',
//   },
//   {
//     title: 'Personal Info',
//   }
// ]

// export default function ParkingBooking() {
//   const API_URL = process.env.NEXT_PUBLIC_API_URL
//   const { data: session } = useSession()
//   const vendorId = session?.user?.id
//   const [activeStep, setActiveStep] = useState(0)
//   const [vehicleType, setVehicleType] = useState('Car')
//   const [vehicleNumber, setVehicleNumber] = useState('')
//   const [sts, setSts] = useState('Instant')
//   const [parkingDate, setParkingDate] = useState('')
//   const [parkingTime, setParkingTime] = useState('')
//   const [tentativeCheckout, setTentativeCheckout] = useState('')
//   const [carType, setCarType] = useState('')
//   const [personName, setPersonName] = useState('')
//   const [mobileNumber, setMobileNumber] = useState('')
//   const [subscriptionType, setSubscriptionType] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })
//   const [errors, setErrors] = useState({})
//   const [bookType, setBookType] = useState('Hourly')
//   const [is24Hours, setIs24Hours] = useState(false)

//   useEffect(() => {
//     if (sts === 'Instant') {
//       const now = new Date().toISOString().slice(0, 16)
//       setParkingDate(now.split('T')[0])
//       setParkingTime(now.split('T')[1])
//     }
//   }, [sts])

//   const validate = () => {
//     const newErrors = {}

//     switch (activeStep) {
//       case 0:
//         if (!vehicleType) newErrors.vehicleType = 'Please select a vehicle type'
//         break
//       case 1:
//         if (!vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required'
//         if (sts === 'Subscription' && !subscriptionType) {
//           newErrors.subscriptionType = 'Please select a subscription type'
//         }
//         break
//       case 2:
//         if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
//           newErrors.mobileNumber = 'Enter a valid 10-digit number'
//         }
//         break
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleNext = () => {
//     if (validate()) {
//       if (activeStep === steps.length - 1) {
//         handleSubmit()
//       } else {
//         setActiveStep((prev) => prev + 1)
//       }
//     }
//   }

//   const handleBack = () => {
//     setActiveStep((prev) => prev - 1)
//   }

//   const handleSubmit = async () => {
//     setLoading(true)

//     try {
//       const payload = {
//         vendorId,
//         personName,
//         mobileNumber,
//         vehicleType,
//         carType: vehicleType === 'Car' ? carType : '',
//         vehicleNumber,
//         bookingDate: parkingDate,
//         bookingTime: parkingTime,
//         tenditivecheckout: tentativeCheckout,
//         subsctiptiontype: sts === 'Subscription' ? subscriptionType : '',
//         status: 'PENDING',
//         sts,
//         bookType: sts === 'Subscription' ? '' : bookType
//       }

//       const response = await axios.post(`${API_URL}/vendor/createbooking`, payload);
      
//       showNotification('New Booking Created', {
//         body: `${vehicleType} booking for ${vehicleNumber} created successfully`,
//         tag: 'new-booking'
//       })
      
//       createBookingNotification({
//         vehicleType,
//         vehicleNumber,
//         personName,
//         status: 'PENDING'
//       })

//       setAlert({
//         show: true,
//         message: 'Booking created successfully!',
//         type: 'success'
//       })

//       setTimeout(() => {
//         setActiveStep(0)
//         setVehicleType('Car')
//         setVehicleNumber('')
//         setSts('Instant')
//         setPersonName('')
//         setMobileNumber('')
//         setBookType('Hourly')
//         setIs24Hours(false)
//       }, 2000)
//     } catch (error) {
//       setAlert({
//         show: true,
//         message: 'Failed to create booking. Please try again.',
//         type: 'error'
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleBookTypeChange = (event) => {
//     const checked = event.target.checked
//     setIs24Hours(checked)
//     setBookType(checked ? '24 Hours' : 'Hourly')
//   }

//   const handleVehicleNumberChange = (e) => {
//     setVehicleNumber(e.target.value.toUpperCase());
//   }

//   const renderVehicleTypeStep = () => (
//     <Box>
//       <Typography variant="h6" gutterBottom style={{ marginTop: '20px', marginBottom: '20px' }}>
//         Vehicle Type
//       </Typography>
//       <Grid container spacing={2}>
//         {[
//           { value: 'Car', label: 'Car', icon: DirectionsCarFilled },
//           { value: 'Bike', label: 'Bikes', icon: TwoWheeler },
//           { value: 'Others', label: 'Other', icon: LocalShipping }
//         ].map((option) => (
//           <Grid item xs={12} sm={4} key={option.value}>
//             <OptionCard
//               selected={vehicleType === option.value}
//               onClick={() => setVehicleType(option.value)}
//               elevation={vehicleType === option.value ? 2 : 1}
//             >
//               <IconWrapper>
//                 <option.icon color="#ffe32a" />
//               </IconWrapper>
//               <Typography variant="subtitle1">{option.label}</Typography>
//               {vehicleType === option.value && (
//                 <CheckIcon color="primary" sx={{ ml: 'auto' }} />
//               )}
//             </OptionCard>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   )

//   const renderBookingDetailsStep = () => (
//     <Box>
//       <Typography variant="h6" gutterBottom style={{ marginTop: '20px', marginBottom: '20px' }}>
//         Booking Details
//       </Typography>
//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <RadioGroup row value={sts} onChange={(e) => setSts(e.target.value)}>
//             {[
//               { value: 'Instant', label: 'Instant', icon: AccessTime },
//               { value: 'Scheduled', label: 'Scheduled', icon: CalendarMonth },
//               { value: 'Subscription', label: 'Subscription', icon: AutorenewRounded }
//             ].map((option) => (
//               <FormControlLabel
//                 key={option.value}
//                 value={option.value}
//                 control={<Radio color="primary" />}
//                 label={
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <option.icon fontSize="small" />
//                     {option.label}
//                   </Box>
//                 }
//                 sx={{ mr: 4 }}
//               />
//             ))}
//           </RadioGroup>
//         </Grid>
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="Vehicle Number"
//             value={vehicleNumber}
//             onChange={handleVehicleNumberChange}
//             error={!!errors.vehicleNumber}
//             helperText={errors.vehicleNumber}
//             placeholder="Enter vehicle number"
//             inputProps={{
//               style: { textTransform: 'uppercase' }  
//             }}
//           />
//         </Grid>
        
//         {sts !== 'Subscription' && (
//           <Grid item xs={12}>
//             <BookingTypeToggle>
//               <Typography variant="body1" sx={{ fontWeight: 500 }}>
//                 Hourly
//               </Typography>
//               <StyledSwitch
//                 checked={is24Hours}
//                 onChange={handleBookTypeChange}
//                 inputProps={{ 'aria-label': 'booking type toggle' }}
//                 icon={<WatchLater />}
//                 checkedIcon={<WatchLater />}
//               />
//               <Typography variant="body1" sx={{ fontWeight: 500 }}>
//                 24 hours
//               </Typography>
//             </BookingTypeToggle>
//           </Grid>
//         )}
        
//         {sts === 'Subscription' && (
//           <Grid item xs={12} sm={6}>
//             <FormControl fullWidth error={!!errors.subscriptionType}>
//               <InputLabel>Subscription Type</InputLabel>
//               <Select
//                 value={subscriptionType}
//                 onChange={(e) => setSubscriptionType(e.target.value)}
//                 label="Subscription Type"
//               >
//                 {['Weekly', 'Monthly', 'Yearly'].map((type) => (
//                   <MenuItem key={type} value={type}>{type}</MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
//         )}
//         {vehicleType === 'Car' && (
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="Car Type"
//               value={carType}
//               onChange={(e) => setCarType(e.target.value)}
//               placeholder="e.g. Sedan, SUV"
//             />
//           </Grid>
//         )}
//         <Grid item xs={12} sm={6}>
//           <TextField
//             fullWidth
//             label="Parking Date"
//             type="date"
//             value={parkingDate}
//             onChange={(e) => setParkingDate(e.target.value)}
//             disabled={sts === 'Instant'}
//             InputLabelProps={{ shrink: true }}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             fullWidth
//             label="Parking Time"
//             type="time"
//             value={parkingTime}
//             onChange={(e) => setParkingTime(e.target.value)}
//             disabled={sts === 'Instant'}
//             InputLabelProps={{ shrink: true }}
//           />
//         </Grid>
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label="Tentative Checkout"
//             type="datetime-local"
//             value={tentativeCheckout}
//             onChange={(e) => setTentativeCheckout(e.target.value)}
//             InputLabelProps={{ shrink: true }}
//           />
//         </Grid>
//       </Grid>
//     </Box>
//   )

//   const renderPersonalInfoStep = () => (
//     <Box>
//       <Typography variant="h6" gutterBottom style={{ marginTop: '20px', marginBottom: '20px' }}>
//         Personal Information
//       </Typography>
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             label="Full Name"
//             value={personName}
//             onChange={(e) => setPersonName(e.target.value)}
//             placeholder="Enter your full name"
//           />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <TextField
//             fullWidth
//             label="Mobile Number"
//             value={mobileNumber}
//             onChange={(e) => setMobileNumber(e.target.value)}
//             error={!!errors.mobileNumber}
//             helperText={errors.mobileNumber}
//             placeholder="Enter your mobile number"
//             InputProps={{
//               startAdornment: <InputAdornment position="start">+91</InputAdornment>
//             }}
//           />
//         </Grid>
//       </Grid>
//     </Box>
//   )

//   const getStepContent = (step) => {
//     switch (step) {
//       case 0:
//         return renderVehicleTypeStep()
//       case 1:
//         return renderBookingDetailsStep()
//       case 2:
//         return renderPersonalInfoStep()
//       default:
//         return null
//     }
//   }

//   return (
//     <>
//       <Box sx={{ mb: 4 }}>
//         <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
//           Parking Booking
//         </Typography>
//       </Box>
//       <Card>
//         <CardContent>
//           <StepperWrapper>
//             <Stepper activeStep={activeStep} alternativeLabel>
//               {steps.map((label, index) => (
//                 <Step key={index}>
//                   <StepLabel
//                     slots={{
//                       stepIcon: StepperCustomDot
//                     }}
//                     StepIconComponent={StepperCustomDot}
//                   >
//                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                       <Typography className="step-number">{`0${index + 1}`}</Typography>
//                       <Typography className="step-title">{label.title}</Typography>
//                     </div>
//                   </StepLabel>
//                 </Step>
//               ))}
//             </Stepper>
//           </StepperWrapper>
//           <Divider style={{ marginLeft: '-20px', marginRight: '-20px', marginTop: '20px' }} />
//           <Collapse in={alert.show}>
//             <Alert
//               severity={alert.type}
//               action={
//                 <IconButton
//                   size="small"
//                   onClick={() => setAlert({ ...alert, show: false })}
//                 >
//                   <CloseIcon fontSize="small" />
//                 </IconButton>
//               }
//               sx={{ mb: 2 }}
//             >
//               {alert.message}
//             </Alert>
//           </Collapse>
//           {getStepContent(activeStep)}
//           <Divider style={{ marginLeft: '-20px', marginRight: '-20px', marginTop: '40px' }} />
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 10 }}>
//             <>
//               <Button
//                 disabled={activeStep === 0}
//                 onClick={handleBack}
//                 variant="outlined"
//                 color='secondary'
//                 startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
//               >
//                 Back
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={handleNext}
//                 type='submit'
//                 endIcon={loading ? <CircularProgress size={20} /> : <DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
//                 disabled={loading}
//               >
//                 {activeStep === steps.length - 1 ? 'Complete Booking' : 'Next'}
//               </Button>
//             </>
//           </Box>
//         </CardContent>
//       </Card>
//     </>
//   )
// }

//amount and hour added from the charge sheet

'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

import {
  Box,
  Step,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Collapse,
  InputAdornment,
  CircularProgress,
  Switch,
  FormGroup,
} from '@mui/material'
import MuiStepper from '@mui/material/Stepper'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import StepLabel from '@mui/material/StepLabel'
import {
  DirectionsCarFilled,
  TwoWheeler,
  LocalShipping,
  AccessTime,
  CalendarMonth,
  AutorenewRounded,
  Close as CloseIcon,
  Check as CheckIcon,
  KeyboardArrowRight,
  Assignment,
  ScheduleOutlined,
  WatchLater
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

// Component Imports
import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'
import DirectionalIcon from '@components/DirectionalIcon'
import { createBookingNotification, showNotification } from '@/utils/requestNotificationPermission'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  background: '#ffffff',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
  overflow: 'hidden'
}))

const Stepper = styled(MuiStepper)(({ theme }) => ({
  justifyContent: 'center',
  '& .MuiStep-root': {
    '&:first-of-type': {
      paddingInlineStart: 0
    },
    '&:last-of-type': {
      paddingInlineEnd: 0
    },
    [theme.breakpoints.down('md')]: {
      paddingInline: 0
    }
  }
}))

const OptionCard = styled(Paper)(({ selected }) => ({
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  border: selected ? '1px solid #1976d2' : '1px solid #e0e0e0',
  backgroundColor: selected ? '#f5f9ff' : '#ffffff',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? '#f5f9ff' : '#f8f8f8',
    transform: 'translateY(-2px)'
  }
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 20,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main
}))

// Custom styled toggle switch container
const BookingTypeToggle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderRadius: '48px',
  border: '1px solid #e0e0e0',
  background: '#f8f8f8',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2)
}))

// Custom styled toggle switch with clock icon
const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 120,
  height: 34,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(86px)',
      color: '#ff0000',
      '& + .MuiSwitch-track': {
        backgroundColor: '#4caf50',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 30,
    height: 30,
    backgroundColor: props => props.checked ? '#ff0000' : '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& svg': {
      fontSize: '20px',
      color: props => props.checked ? 'white' : '#757575'
    }
  },
  '& .MuiSwitch-track': {
    borderRadius: 34 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#4caf50' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}))

const steps = [
  {
    title: 'Vehicle Type',
  },
  {
    title: 'Booking Details',
  },
  {
    title: 'Personal Info',
  }
]

// Default rates in case API fails
const DEFAULT_RATES = {
  Car: {
    minimum: { amount: 50, hours: 1 },
    additional: { amount: 20, hours: 1 },
    fullDay: { amount: 200 }
  },
  Bike: {
    minimum: { amount: 20, hours: 1 },
    additional: { amount: 10, hours: 1 },
    fullDay: { amount: 100 }
  },
  Others: {
    minimum: { amount: 80, hours: 1 },
    additional: { amount: 30, hours: 1 },
    fullDay: { amount: 300 }
  }
}

// Define subscription rates (weekly, monthly, yearly)
const SUBSCRIPTION_RATES = {
  Weekly: {
    Car: 1000,
    Bike: 500,
    Others: 1500
  },
  Monthly: {
    Car: 3000,
    Bike: 1500,
    Others: 4500
  },
  Yearly: {
    Car: 30000,
    Bike: 15000,
    Others: 45000
  }
}

export default function ParkingBooking() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession()
  const vendorId = session?.user?.id
  const [activeStep, setActiveStep] = useState(0)
  const [vehicleType, setVehicleType] = useState('Car')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [sts, setSts] = useState('Instant')
  const [parkingDate, setParkingDate] = useState('')
  const [parkingTime, setParkingTime] = useState('')
  const [tentativeCheckout, setTentativeCheckout] = useState('')
  const [carType, setCarType] = useState('')
  const [personName, setPersonName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [subscriptionType, setSubscriptionType] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' })
  const [errors, setErrors] = useState({})
  const [bookType, setBookType] = useState('Hourly')
  const [is24Hours, setIs24Hours] = useState(false)
  const [amount, setAmount] = useState(0)
  const [hour, setHour] = useState(1) // Default to 1 hour
  const [parkingCharges, setParkingCharges] = useState({
    Car: { ...DEFAULT_RATES.Car },
    Bike: { ...DEFAULT_RATES.Bike },
    Others: { ...DEFAULT_RATES.Others }
  })
  const [fetchingCharges, setFetchingCharges] = useState(false)

  // Fetch parking charges when component mounts
  useEffect(() => {
    if (vendorId) {
      fetchParkingCharges(vendorId)
    }
  }, [vendorId])

  // Set current date/time for instant booking
  useEffect(() => {
    if (sts === 'Instant') {
      const now = new Date().toISOString().slice(0, 16)
      setParkingDate(now.split('T')[0])
      setParkingTime(now.split('T')[1])
    }
  }, [sts])
  
  // Calculate amount and hours based on selected options
  useEffect(() => {
    calculateAmountAndHours()
  }, [vehicleType, bookType, subscriptionType, sts, tentativeCheckout, parkingDate, parkingTime, parkingCharges])

  // Fetch parking charges from API
  const fetchParkingCharges = async (vendorId) => {
    try {
      setFetchingCharges(true)
      const response = await axios.get(`${API_URL}/vendor/getchargesdata/${vendorId}`)
      
      if (response.data && response.data.vendor && response.data.vendor.charges) {
        const charges = response.data.vendor.charges
        const formattedCharges = {
          Car: { ...DEFAULT_RATES.Car },
          Bike: { ...DEFAULT_RATES.Bike },
          Others: { ...DEFAULT_RATES.Others }
        }
        
        // Process charges from API response
        charges.forEach(charge => {
          const category = charge.category
          
          if (!formattedCharges[category]) {
            formattedCharges[category] = { ...DEFAULT_RATES.Others }
          }
          
          // Handle different charge types based on the API response structure
          if (charge.type.includes('0 to 1 hours') && !charge.type.includes('Additional')) {
            formattedCharges[category].minimum = {
              amount: parseFloat(charge.amount),
              hours: 1
            }
          } else if (charge.type.includes('Additional')) {
            formattedCharges[category].additional = {
              amount: parseFloat(charge.amount),
              hours: 1
            }
          } else if (charge.type.includes('Full Day')) {
            formattedCharges[category].fullDay = {
              amount: parseFloat(charge.amount)
            }
          }
        })
        
        setParkingCharges(formattedCharges)
        console.log('Parking charges fetched:', formattedCharges)
        
        // Recalculate amount after fetching updated charges
        calculateAmountAndHours()
      }
    } catch (error) {
      console.error('Error fetching parking charges:', error)
      // Keep default charges if API fails
    } finally {
      setFetchingCharges(false)
    }
  }

  const calculateAmountAndHours = () => {
    // For subscription bookings
    if (sts === 'Subscription' && subscriptionType) {
      const subscriptionAmount = SUBSCRIPTION_RATES[subscriptionType][vehicleType]
      setAmount(subscriptionAmount)
      
      // Set hours based on subscription type
      switch(subscriptionType) {
        case 'Weekly':
          setHour(24 * 7) // 7 days in hours
          break
        case 'Monthly':
          setHour(24 * 30) // 30 days in hours
          break
        case 'Yearly':
          setHour(24 * 365) // 365 days in hours
          break
        default:
          setHour(24) // Default to 24 hours
      }
      return
    }
    
    // Get the charges for the selected vehicle type
    const chargeRates = parkingCharges[vehicleType] || DEFAULT_RATES[vehicleType]
    
    // For 24-hour bookings
    if (bookType === '24 Hours' || is24Hours) {
      // Use full day charge if available
      if (chargeRates.fullDay) {
        setAmount(chargeRates.fullDay.amount)
      } else {
        // Calculate 24-hour rate based on minimum + additional charges
        const minimumCharge = chargeRates.minimum.amount
        const minimumHours = chargeRates.minimum.hours
        const additionalHourRate = chargeRates.additional.amount / chargeRates.additional.hours
        const additionalHours = 24 - minimumHours
        const additionalCharge = additionalHours * additionalHourRate
        
        setAmount(minimumCharge + additionalCharge)
      }
      setHour(24)
      return
    }
    
    // For hourly bookings, calculate based on duration
    if (tentativeCheckout && parkingDate && parkingTime) {
      const startTime = new Date(`${parkingDate}T${parkingTime}`)
      const endTime = new Date(tentativeCheckout)
      
      if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
        // Calculate duration in milliseconds
        const diffMs = endTime - startTime
        const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)))
        
        // Set the actual hours for billing
        setHour(diffHours)
        
        // Check for midnight boundary (if booking crosses to next day)
        const startDay = new Date(startTime)
        startDay.setHours(0, 0, 0, 0)
        const nextDay = new Date(startDay)
        nextDay.setDate(nextDay.getDate() + 1)
        
        // If booking duration spans multiple days
        if (endTime >= nextDay) {
          // Calculate number of full days
          const daysDiff = Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24))
          const remainingHours = diffHours - (daysDiff * 24)
          
          let totalAmount = 0
          
          // Add full day charges for complete days
          if (daysDiff > 0 && chargeRates.fullDay) {
            totalAmount += daysDiff * chargeRates.fullDay.amount
          } else if (daysDiff > 0) {
            // If no full day rate is available, calculate using hourly
            totalAmount += daysDiff * 24 * (chargeRates.additional.amount / chargeRates.additional.hours)
          }
          
          // Add charges for remaining hours
          if (remainingHours > 0) {
            if (remainingHours <= chargeRates.minimum.hours) {
              totalAmount += chargeRates.minimum.amount
            } else {
              totalAmount += chargeRates.minimum.amount + 
                ((remainingHours - chargeRates.minimum.hours) * 
                 (chargeRates.additional.amount / chargeRates.additional.hours))
            }
          }
          
          setAmount(totalAmount)
          return
        }
        
        // Check if full day rate is more economical for single-day bookings
        if (chargeRates.fullDay && diffHours > 12) {
          const hourlyTotal = chargeRates.minimum.amount + 
            ((diffHours - chargeRates.minimum.hours) * 
             (chargeRates.additional.amount / chargeRates.additional.hours))
          
          // Use whichever is cheaper: hourly rate or full day rate
          if (chargeRates.fullDay.amount <= hourlyTotal) {
            setAmount(chargeRates.fullDay.amount)
            return
          }
        }
        
        // Standard hourly calculation
        if (diffHours <= chargeRates.minimum.hours) {
          // Within minimum hours threshold
          setAmount(chargeRates.minimum.amount)
        } else {
          // Calculate additional hours beyond minimum
          const additionalHours = diffHours - chargeRates.minimum.hours
          const additionalHourlyRate = chargeRates.additional.amount / chargeRates.additional.hours
          const additionalCharge = additionalHours * additionalHourlyRate
          
          setAmount(chargeRates.minimum.amount + additionalCharge)
        }
      } else {
        // Default to minimum if dates are invalid
        setHour(chargeRates.minimum.hours)
        setAmount(chargeRates.minimum.amount)
      }
    } else {
      // Default to minimum charge if no tentative checkout
      setHour(chargeRates.minimum.hours)
      setAmount(chargeRates.minimum.amount)
    }
  }

  const validate = () => {
    const newErrors = {}

    switch (activeStep) {
      case 0:
        if (!vehicleType) newErrors.vehicleType = 'Please select a vehicle type'
        break
      case 1:
        if (!vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required'
        if (sts === 'Subscription' && !subscriptionType) {
          newErrors.subscriptionType = 'Please select a subscription type'
        }
        if (!tentativeCheckout && sts !== 'Subscription') {
          // newErrors.tentativeCheckout = 'Please provide a tentative checkout time'
        }
        break
      case 2:
        if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
          newErrors.mobileNumber = 'Enter a valid 10-digit number'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      if (activeStep === steps.length - 1) {
        handleSubmit()
      } else {
        setActiveStep((prev) => prev + 1)
      }
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const currentDate = new Date()
      
      const payload = {
        vendorId,
        vendorName: session?.user?.name || '',
        personName,
        mobileNumber,
        vehicleType,
        carType: vehicleType === 'Car' ? carType : '',
        vehicleNumber,
        bookingDate: currentDate.toISOString().split('T')[0], // Current date for booking
        bookingTime: currentDate.toISOString().split('T')[1].substring(0, 5), // Current time for booking
        parkingDate,
        parkingTime,
        tenditivecheckout: tentativeCheckout,
        subsctiptiontype: sts === 'Subscription' ? subscriptionType : '',
        status: 'PENDING',
        sts,
        bookType: sts === 'Subscription' ? '' : bookType,
        amount: amount, // Add the calculated amount
        hour: hour, // Add the calculated hours
        exitvehicledate: tentativeCheckout ? new Date(tentativeCheckout).toISOString().split('T')[0] : '',
        exitvehicletime: tentativeCheckout ? new Date(tentativeCheckout).toISOString().split('T')[1].substring(0, 5) : ''
      }

      console.log('Submitting booking with payload:', payload)
      const response = await axios.post(`${API_URL}/vendor/createbooking`, payload)
      
      showNotification('New Booking Created', {
        body: `${vehicleType} booking for ${vehicleNumber} created successfully`,
        tag: 'new-booking'
      })
      
      createBookingNotification({
        vehicleType,
        vehicleNumber,
        personName,
        status: 'PENDING'
      })

      setAlert({
        show: true,
        message: 'Booking created successfully!',
        type: 'success'
      })

      setTimeout(() => {
        setActiveStep(0)
        setVehicleType('Car')
        setVehicleNumber('')
        setSts('Instant')
        setPersonName('')
        setMobileNumber('')
        setBookType('Hourly')
        setIs24Hours(false)
        setTentativeCheckout('')
        setCarType('')
        
        // Reset amount and hour to defaults
        const defaultCharges = parkingCharges.Car || DEFAULT_RATES.Car
        setAmount(defaultCharges.minimum.amount)
        setHour(defaultCharges.minimum.hours)
      }, 2000)
    } catch (error) {
      console.error("Booking creation error:", error.response?.data || error.message)
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Failed to create booking. Please try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookTypeChange = (event) => {
    const checked = event.target.checked
    setIs24Hours(checked)
    setBookType(checked ? '24 Hours' : 'Hourly')
  }

  const handleVehicleNumberChange = (e) => {
    setVehicleNumber(e.target.value.toUpperCase())
  }

  const renderVehicleTypeStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom style={{ marginTop: '20px', marginBottom: '20px' }}>
        Vehicle Type
      </Typography>
      <Grid container spacing={2}>
        {[
          { value: 'Car', label: 'Car', icon: DirectionsCarFilled },
          { value: 'Bike', label: 'Bikes', icon: TwoWheeler },
          { value: 'Others', label: 'Other', icon: LocalShipping }
        ].map((option) => (
          <Grid item xs={12} sm={4} key={option.value}>
            <OptionCard
              selected={vehicleType === option.value}
              onClick={() => setVehicleType(option.value)}
              elevation={vehicleType === option.value ? 2 : 1}
            >
              <IconWrapper>
                <option.icon color="#ffe32a" />
              </IconWrapper>
              <Typography variant="subtitle1">{option.label}</Typography>
              {vehicleType === option.value && (
                <CheckIcon color="primary" sx={{ ml: 'auto' }} />
              )}
            </OptionCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  const renderBookingDetailsStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom style={{ marginTop: '20px', marginBottom: '20px' }}>
        Booking Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <RadioGroup row value={sts} onChange={(e) => setSts(e.target.value)}>
            {[
              { value: 'Instant', label: 'Instant', icon: AccessTime },
              { value: 'Scheduled', label: 'Scheduled', icon: CalendarMonth },
              { value: 'Subscription', label: 'Subscription', icon: AutorenewRounded }
            ].map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio color="primary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <option.icon fontSize="small" />
                    {option.label}
                  </Box>
                }
                sx={{ mr: 4 }}
              />
            ))}
          </RadioGroup>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Vehicle Number"
            value={vehicleNumber}
            onChange={handleVehicleNumberChange}
            error={!!errors.vehicleNumber}
            helperText={errors.vehicleNumber}
            placeholder="Enter vehicle number"
            inputProps={{
              style: { textTransform: 'uppercase' }  
            }}
          />
        </Grid>
        
        {sts !== 'Subscription' && (
          <Grid item xs={12}>
            <BookingTypeToggle>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Hourly
              </Typography>
              <StyledSwitch
                checked={is24Hours}
                onChange={handleBookTypeChange}
                inputProps={{ 'aria-label': 'booking type toggle' }}
                icon={<WatchLater />}
                checkedIcon={<WatchLater />}
              />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                24 hours
              </Typography>
            </BookingTypeToggle>
          </Grid>
        )}
        
        {sts === 'Subscription' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.subscriptionType}>
              <InputLabel>Subscription Type</InputLabel>
              <Select
                value={subscriptionType}
                onChange={(e) => setSubscriptionType(e.target.value)}
                label="Subscription Type"
              >
                {['Weekly', 'Monthly', 'Yearly'].map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {vehicleType === 'Car' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Car Type"
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              placeholder="e.g. Sedan, SUV"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Parking Date"
            type="date"
            value={parkingDate}
            onChange={(e) => setParkingDate(e.target.value)}
            disabled={sts === 'Instant'}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Parking Time"
            type="time"
            value={parkingTime}
            onChange={(e) => setParkingTime(e.target.value)}
            disabled={sts === 'Instant'}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tentative Checkout"
            type="datetime-local"
            value={tentativeCheckout}
            onChange={(e) => setTentativeCheckout(e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.tentativeCheckout}
            helperText={errors.tentativeCheckout}
          />
        </Grid>
        
        {/* Display calculated amount */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Booking Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Vehicle Type:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {vehicleType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Booking Type:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {sts === 'Subscription' ? `${subscriptionType} Subscription` : `${bookType}`}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Duration:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {sts === 'Subscription' 
                    ? subscriptionType 
                    : (is24Hours 
                        ? '24 Hours' 
                        : `${hour} Hour${hour > 1 ? 's' : ''}`)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Total Amount:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                  ₹{amount}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )

  const renderPersonalInfoStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom style={{ marginTop: '20px', marginBottom: '20px' }}>
        Personal Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Full Name"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Enter your full name"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            error={!!errors.mobileNumber}
            helperText={errors.mobileNumber}
            placeholder="Enter your mobile number"
            InputProps={{
              startAdornment: <InputAdornment position="start">+91</InputAdornment>
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderVehicleTypeStep()
      case 1:
        return renderBookingDetailsStep()
      case 2:
        return renderPersonalInfoStep()
      default:
        return null
    }
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
          Parking Booking
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <StepperWrapper>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel
                    slots={{
                      stepIcon: StepperCustomDot
                    }}
                    StepIconComponent={StepperCustomDot}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Typography className="step-number">{`0${index + 1}`}</Typography>
                      <Typography className="step-title">{label.title}</Typography>
                    </div>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </StepperWrapper>
          <Divider style={{ marginLeft: '-20px', marginRight: '-20px', marginTop: '20px' }} />
          <Collapse in={alert.show}>
            <Alert
              severity={alert.type}
              action={
                <IconButton
                  size="small"
                  onClick={() => setAlert({ ...alert, show: false })}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {alert.message}
            </Alert>
          </Collapse>
          {fetchingCharges ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            getStepContent(activeStep)
          )}
          <Divider style={{ marginLeft: '-20px', marginRight: '-20px', marginTop: '40px' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 10 }}>
            <>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                color='secondary'
                startIcon={<DirectionalIcon ltrIconClass='ri-arrow-left-line' rtlIconClass='ri-arrow-right-line' />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                type='submit'
                endIcon={loading ? <CircularProgress size={20} /> : <DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
                disabled={loading}
              >
                {activeStep === steps.length - 1 ? 'Complete Booking' : 'Next'}
              </Button>
            </>
          </Box>
        </CardContent>
      </Card>
    </>
  )
}
