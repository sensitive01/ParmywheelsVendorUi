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
  Assignment
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
// Component Imports
import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'
import DirectionalIcon from '@components/DirectionalIcon'
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
  // backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main
}))
const steps = [
  {
    title: 'Vehicle Type',
    // subtitle: 'Enter your account details'
  },
  {
    title: 'Booking Details',
    // subtitle: 'Setup Information'
  },
  {
    title: 'Personal Info',
    // subtitle: 'Add Social Links'
  }
]
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
  useEffect(() => {
    if (sts === 'Instant') {
      const now = new Date().toISOString().slice(0, 16)
      setParkingDate(now.split('T')[0])
      setParkingTime(now.split('T')[1])
    }
  }, [sts])
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
        break
      case 2:
        if (!personName) newErrors.personName = 'Name is required'
        if (!mobileNumber) newErrors.mobileNumber = 'Mobile number is required'
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
  console.log('vendorId==',vendorId)
  console.log('api===',API_URL)
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        vendorId,
        personName,
        mobileNumber,
        vehicleType,
        carType: vehicleType === 'Car' ? carType : '',
        vehicleNumber,
        bookingDate: parkingDate,
        bookingTime: parkingTime,
        tenditivecheckout: tentativeCheckout,
        subsctiptiontype: sts === 'Subscription' ? subscriptionType : '',
        status: 'Pending',
        sts
      }
      const response = await axios.post('https://parkmywheelsapi.onrender.com/vendor/createbooking', payload)
      setAlert({
        show: true,
        message: 'Booking created successfully!',
        type: 'success'
      })
      // Reset form after successful submission
      setTimeout(() => {
        setActiveStep(0)
        setVehicleType('Car')
        setVehicleNumber('')
        setSts('Instant')
        setPersonName('')
        setMobileNumber('')
      }, 2000)
    } catch (error) {
      setAlert({
        show: true,
        message: 'Failed to create booking. Please try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }
  const renderVehicleTypeStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom style={{ marginTop: '20px', marginBottom: '20px' }}>
        Vehicle Type
      </Typography>
      <Grid container spacing={2}>
        {[
          { value: 'Car', label: 'Car', icon: DirectionsCarFilled },
          { value: 'Bike', label: 'Bike', icon: TwoWheeler },
          { value: 'Others', label: 'Others', icon: LocalShipping }
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
            onChange={(e) => setVehicleNumber(e.target.value)}
            error={!!errors.vehicleNumber}
            helperText={errors.vehicleNumber}
            placeholder="Enter vehicle number"
          />
        </Grid>
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
          />
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
            error={!!errors.personName}
            helperText={errors.personName}
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
                    StepIconComponent={StepperCustomDot} // Ensure custom icon integration
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
          {getStepContent(activeStep)}
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
