'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Collapse,
  Divider,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Snackbar
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { 
  DirectionsCar, 
  TwoWheeler, 
  InfoOutlined, 
  CheckCircleOutline, 
  PrintOutlined, 
  ExitToApp,
  CalendarMonth,
  AccessTime,
  CurrencyRupee
} from '@mui/icons-material'

// Styled Components for POS-style UI
const VehicleToggle = styled(Box)(({ theme, selected }) => ({
  width: 65,
  height: 42,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: `1px solid ${selected ? '#4caf50' : '#e0e0e0'}`,
  backgroundColor: selected ? '#e8f5e9' : '#fff',
  borderRadius: 4,
  gap: 6,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f1f8e9'
  }
}))

const ModeButton = styled(Box)(({ theme, selected }) => ({
  flex: 1,
  height: 55,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: `1px solid ${selected ? '#4caf50' : '#e0e0e0'}`,
  backgroundColor: selected ? '#4caf50' : '#fff',
  color: selected ? '#fff' : '#000',
  borderRadius: 8,
  padding: theme.spacing(1),
  textAlign: 'center',
  transition: 'all 0.2s ease'
}))

const PassButton = styled(Box)(({ theme, selected }) => ({
  flex: 1,
  height: 48,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: `1px solid ${selected ? '#4caf50' : '#e0e0e0'}`,
  backgroundColor: selected ? '#4caf50' : '#fff',
  color: selected ? '#fff' : '#4caf50',
  borderRadius: 8,
  padding: theme.spacing(0.5),
  transition: 'all 0.2s ease'
}))

const RadioBox = styled(Box)(({ theme, selected }) => ({
  flex: 1,
  padding: theme.spacing(0.8, 1.5),
  border: `1px solid ${selected ? '#4caf50' : '#e0e0e0'}`,
  backgroundColor: selected ? '#4caf50' : '#fff',
  color: selected ? '#fff' : '#000',
  borderRadius: 20,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 600
}))

const FieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#9e9e9e',
  marginBottom: 4,
  textTransform: 'uppercase'
}))

export default function NewBookingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const vendorId = session?.user?.id
  const vendorName = session?.user?.name
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // State
  const [loading, setLoading] = useState(false)
  const [vehicleType, setVehicleType] = useState('Car') // Car, Bike, Others
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [valetToken, setValetToken] = useState('')
  const [valetLocation, setValetLocation] = useState('')
  const [bookingMode, setBookingMode] = useState('Instant') // Instant, Weekly, Monthly
  const [selectedPass, setSelectedPass] = useState(null) // 12, 24, 48, 72
  const [parkingDateTime, setParkingDateTime] = useState('')
  const [showOptional, setShowOptional] = useState(false)
  const [personName, setPersonName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [tentativeCheckout, setTentativeCheckout] = useState('')
  const [paymentType, setPaymentType] = useState('On Entry')
  const [paymentMode, setPaymentMode] = useState('Cash')
  
  // Data State
  const [charges, setCharges] = useState([])
  const [availableSlots, setAvailableSlots] = useState(null)
  const [businessHours, setBusinessHours] = useState([])
  const [valetStatus, setValetStatus] = useState(false)
  const [priceChartOpen, setPriceChartOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Initialize Date/Time
  useEffect(() => {
    const now = new Date()
    const formatted = now.toISOString().slice(0, 16)
    setParkingDateTime(formatted)
    
    if (bookingMode === 'Instant') {
      const timer = setInterval(() => {
        setParkingDateTime(new Date().toISOString().slice(0, 16))
      }, 60000)
      return () => clearInterval(timer)
    }
  }, [bookingMode])

  // Fetch Data
  useEffect(() => {
    if (!vendorId) return
    const fetchData = async () => {
      try {
        const [chargesRes, slotsRes, businessRes, vendorRes, toggleRes] = await Promise.all([
          axios.get(`${API_URL}/vendor/getchargesdata/${vendorId}`),
          axios.get(`${API_URL}/vendor/availableslots/${vendorId}`),
          axios.get(`${API_URL}/vendor/fetchbusinesshours/${vendorId}`).catch(() => ({ data: { businessHours: [] } })),
          axios.get(`${API_URL}/vendor/getvendor/${vendorId}`).catch(() => ({ data: {} })),
          axios.get(`${API_URL}/vendor/get-toggle-states/${vendorId}`).catch(() => ({ data: {} }))
        ])
        
        // Extract data
        const chargesData = chargesRes.data?.vendor || chargesRes.data
        const vendorData = vendorRes.data?.data || vendorRes.data?.vendor || {}
        const toggleData = toggleRes.data || {}
        
        setCharges(chargesData?.charges || [])
        
        // Comprehensive Valet Check
        const valetVal = 
          toggleData?.valetEnabled || 
          vendorData?.valetEnabled || 
          vendorData?.valetStatus || 
          vendorData?.valet || 
          chargesData?.valetStatus || 
          chargesData?.valetEnabled
          
        const isValetOn = valetVal === 'ON' || valetVal === 'on' || valetVal === true || valetVal === 'true'
        
        console.log('Valet Debug:', { valetVal, isValetOn, toggleData, vendorData })
        setValetStatus(isValetOn)
        
        setAvailableSlots(slotsRes.data)
        setBusinessHours(businessRes.data?.businessHours || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [vendorId, API_URL])

  // Helpers
  const getChargeAmount = (typePattern) => {
    const charge = charges.find(c => 
      c.category.toLowerCase() === vehicleType.toLowerCase() && 
      typePattern.test(c.type.toLowerCase())
    )
    return charge ? charge.amount : '0'
  }

  const getPassAmount = (hours) => {
    const charge = charges.find(c => 
      c.category.toLowerCase() === vehicleType.toLowerCase() && 
      c.type.toLowerCase().includes(`${hours}`) && 
      (c.type.toLowerCase().includes('hour') || c.type.toLowerCase().includes('hr'))
    )
    return charge ? charge.amount : '0'
  }

  const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
  }

  const formatTimeTo12H = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    let hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
  }

  const handlePassSelect = (hours) => {
    setSelectedPass(hours)
    const checkoutDate = new Date(parkingDateTime)
    checkoutDate.setHours(checkoutDate.getHours() + hours)
    setTentativeCheckout(checkoutDate.toISOString().slice(0, 16))
  }

  const handleSubmit = async (actionType) => {
    if (!vehicleNumber) {
      setSnackbar({ open: true, message: 'Please enter vehicle number', severity: 'error' })
      return
    }

    // Check availability
    const available = availableSlots?.[vehicleType === 'Car' ? 'Cars' : vehicleType === 'Bike' ? 'Bikes' : 'Others'] || 0
    if (available <= 0) {
      setSnackbar({ open: true, message: `No space available for ${vehicleType}`, severity: 'error' })
      return
    }

    setLoading(true)
    try {
      const now = new Date()
      const amount = bookingMode === 'Subscription' 
        ? getChargeAmount(new RegExp(bookingMode, 'i'))
        : selectedPass 
          ? getPassAmount(selectedPass)
          : getChargeAmount(/0 to 4 hours/i) || '0'

      const payload = {
        vendorId,
        vendorName,
        vehicleType,
        vehicleNumber: valetStatus && valetToken ? `${valetToken}-${vehicleNumber}-${valetLocation}` : vehicleNumber,
        personName,
        mobileNumber,
        amount,
        status: actionType === 'EXIT' ? 'COMPLETED' : 'PARKED',
        sts: bookingMode === 'Subscription' ? 'monthly' : selectedPass ? `${selectedPass}hr` : 'Instant',
        bookingDate: formatToDDMMYYYY(now),
        bookingTime: formatTimeTo12H(now),
        parkingDate: formatToDDMMYYYY(parkingDateTime),
        parkingTime: formatTimeTo12H(parkingDateTime),
        approvedDate: formatToDDMMYYYY(parkingDateTime),
        approvedTime: formatTimeTo12H(parkingDateTime),
        parkedDate: formatToDDMMYYYY(parkingDateTime),
        parkedTime: formatTimeTo12H(parkingDateTime),
        tenditivecheckout: tentativeCheckout ? `${formatToDDMMYYYY(tentativeCheckout)} ${formatTimeTo12H(tentativeCheckout)}` : '',
        paymentType,
        paymentMode,
        bookType: 'Hourly'
      }

      const endpoint = actionType === 'NOW' ? '/vendor/machinecreatebooking' : '/vendor/vendorcreatebooking'
      await axios.post(`${API_URL}${endpoint}`, payload)
      
      setSnackbar({ open: true, message: 'Booking created successfully!', severity: 'success' })
      
      // Reset form
      setVehicleNumber('')
      setValetToken('')
      setValetLocation('')
      setSelectedPass(null)
      setPersonName('')
      setMobileNumber('')
      setVehicleModel('')
      setTentativeCheckout('')
      
      // Refresh slots
      const slotsRes = await axios.get(`${API_URL}/vendor/availableslots/${vendorId}`)
      setAvailableSlots(slotsRes.data)
      
    } catch (error) {
      console.error('Booking error:', error)
      setSnackbar({ open: true, message: 'Failed to create booking', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', maxWidth: '100vw' }}>
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 800, color: '#222', letterSpacing: '-0.3px' }}>
                Create New Booking
              </Typography>
              <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {vendorName} | POS Dashboard
              </Typography>
            </Box>
            <Tooltip title="Price Charts">
              <IconButton size="small" onClick={() => setPriceChartOpen(true)} sx={{ bgcolor: '#e8f5e9', color: '#4caf50', '&:hover': { bgcolor: '#c8e6c9' } }}>
                <InfoOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            {/* Left Column: Core Booking Details */}
            <Grid item xs={12} md={8}>
              <Box>
                {/* Registration Row */}
                <Box sx={{ mb: 2.5 }}>
                  <FieldLabel sx={{ color: '#4caf50' }}>VEHICLE REGISTRATION NUMBER *</FieldLabel>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} sm="auto">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <VehicleToggle selected={vehicleType === 'Car'} onClick={() => setVehicleType('Car')} sx={{ width: 80, height: 60 }}>
                          <DirectionsCar sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontWeight: 800, fontSize: '0.7rem' }}>CAR</Typography>
                        </VehicleToggle>
                        <VehicleToggle selected={vehicleType === 'Bike'} onClick={() => setVehicleType('Bike')} sx={{ width: 80, height: 60 }}>
                          <TwoWheeler sx={{ fontSize: 20 }} />
                          <Typography sx={{ fontWeight: 800, fontSize: '0.7rem' }}>BIKE</Typography>
                        </VehicleToggle>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm>
                      <TextField 
                        fullWidth 
                        placeholder="MH 12 AB 1234"
                        value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2, 
                            height: 60, 
                            bgcolor: '#fcfcfc', 
                            fontSize: '1.5rem', 
                            fontWeight: 800,
                            '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: '2px' }
                          },
                          '& input': { textAlign: 'center', letterSpacing: '1px' }
                        }}
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Valet Info Row (Conditional) */}
                {valetStatus && (
                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel>VALET TOKEN #</FieldLabel>
                      <TextField 
                        fullWidth size="small" placeholder="Token"
                        value={valetToken} onChange={(e) => setValetToken(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: 50, fontWeight: 600 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FieldLabel>VALET LOCATION</FieldLabel>
                      <TextField 
                        fullWidth size="small" placeholder="Floor/Row"
                        value={valetLocation} onChange={(e) => setValetLocation(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: 50, fontWeight: 600 } }}
                      />
                    </Grid>
                  </Grid>
                )}

                {/* Mode Selection */}
                <Box sx={{ mb: 2.5 }}>
                  <FieldLabel>BOOKING MODE</FieldLabel>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <ModeButton 
                      selected={bookingMode === 'Instant'} 
                      onClick={() => { setBookingMode('Instant'); setSelectedPass(null); }}
                      sx={{ height: 65 }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Instant Parking</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', opacity: 0.9 }}>₹{vehicleType === 'Car' ? '50/2hr' : '20/2hr'}</Typography>
                    </ModeButton>
                    <ModeButton 
                      selected={bookingMode === 'Weekly'} 
                      onClick={() => { setBookingMode('Weekly'); setSelectedPass(null); }}
                      sx={{ height: 65 }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Weekly Pass</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', opacity: 0.9 }}>₹{getChargeAmount(/weekly/i)}</Typography>
                    </ModeButton>
                    <ModeButton 
                      selected={bookingMode === 'Monthly'} 
                      onClick={() => { setBookingMode('Monthly'); setSelectedPass(null); }}
                      sx={{ height: 65 }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Monthly Pass</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', opacity: 0.9 }}>₹{getChargeAmount(/monthly/i)}</Typography>
                    </ModeButton>
                  </Box>
                </Box>

                {/* Pass Selection */}
                {bookingMode === 'Instant' && (
                  <Box sx={{ mb: 2.5 }}>
                    <FieldLabel>DURATION PASS</FieldLabel>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      {[12, 24, 48, 72].map(hours => (
                        <PassButton 
                          key={hours} 
                          selected={selectedPass === hours}
                          onClick={() => handlePassSelect(hours)}
                          sx={{ height: 60 }}
                        >
                          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{hours}h</Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>₹{hours === 24 ? getChargeAmount(/full day/i) : getPassAmount(hours)}</Typography>
                        </PassButton>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Optional Info Toggle */}
                <FormControlLabel
                  control={<Checkbox size="small" checked={showOptional} onChange={(e) => setShowOptional(e.target.checked)} sx={{ color: '#4caf50', '&.Mui-checked': { color: '#4caf50' } }} />}
                  label={<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#666' }}>Add Guest & Vehicle Details</Typography>}
                  sx={{ mb: 1 }}
                />

                <Collapse in={showOptional}>
                  <Box sx={{ p: 2.5, bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #eee' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FieldLabel>TENTATIVE CHECKOUT</FieldLabel>
                        <TextField fullWidth size="small" type="datetime-local" value={tentativeCheckout} onChange={(e) => setTentativeCheckout(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: 1.5 } }} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FieldLabel>GUEST NAME</FieldLabel>
                        <TextField fullWidth size="small" placeholder="Name" value={personName} onChange={(e) => setPersonName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: 1.5 } }} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FieldLabel>MOBILE</FieldLabel>
                        <TextField fullWidth size="small" placeholder="Mobile" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: 1.5 } }} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FieldLabel>MODEL</FieldLabel>
                        <TextField fullWidth size="small" placeholder="Model" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: 1.5 } }} />
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Box>
            </Grid>

            {/* Right Column: Timing, Payment & Final Actions */}
            <Grid item xs={12} md={4}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fcfcfc', p: 3, borderRadius: 2, border: '1px solid #eee' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#333', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: 20, color: '#4caf50' }} /> SUMMARY
                </Typography>

                {/* Date Time Selection */}
                <Box sx={{ mb: 3 }}>
                  <FieldLabel sx={{ color: '#4caf50' }}>ENTRY DATE & TIME</FieldLabel>
                  <TextField
                    fullWidth type="datetime-local" size="small"
                    value={parkingDateTime}
                    onChange={(e) => setParkingDateTime(e.target.value)}
                    disabled={bookingMode === 'Instant'}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 1.5, 
                        bgcolor: bookingMode === 'Instant' ? '#e9ecef' : '#fff',
                        height: 50,
                        fontSize: '1rem',
                        fontWeight: 700
                      } 
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Payment Section */}
                <Box sx={{ mb: 3 }}>
                  <FieldLabel>PAYMENT TYPE</FieldLabel>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                    <RadioBox selected={paymentType === 'On Entry'} onClick={() => setPaymentType('On Entry')} sx={{ py: 1.2 }}>ENTRY</RadioBox>
                    <RadioBox selected={paymentType === 'On Exit'} onClick={() => setPaymentType('On Exit')} sx={{ py: 1.2 }}>EXIT</RadioBox>
                  </Box>
                  
                  <FieldLabel>PAYMENT MODE</FieldLabel>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <RadioBox selected={paymentMode === 'Cash'} onClick={() => setPaymentMode('Cash')} sx={{ py: 1.2 }}>CASH</RadioBox>
                    <RadioBox selected={paymentMode === 'Online'} onClick={() => setPaymentMode('Online')} sx={{ py: 1.2 }}>ONLINE</RadioBox>
                  </Box>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Button 
                    fullWidth variant="contained" 
                    disabled={loading}
                    onClick={() => handleSubmit('NOW')}
                    sx={{ py: 1.8, mb: 1.5, borderRadius: 2, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, fontWeight: 800, fontSize: '1.1rem' }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />}
                  >
                    CONFIRM BOOKING
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button 
                      fullWidth variant="contained"
                      disabled={loading}
                      onClick={() => handleSubmit('PRINT')}
                      sx={{ py: 1.4, borderRadius: 1.5, bgcolor: '#5c6bc0', '&:hover': { bgcolor: '#3f51b5' }, fontWeight: 700, fontSize: '0.9rem' }}
                      startIcon={<PrintOutlined sx={{ fontSize: 18 }} />}
                    >
                      PRINT
                    </Button>
                    <Button 
                      fullWidth variant="outlined"
                      disabled={loading}
                      onClick={() => handleSubmit('EXIT')}
                      sx={{ py: 1.4, borderRadius: 1.5, color: '#4caf50', borderColor: '#4caf50', '&:hover': { borderColor: '#388e3c', bgcolor: '#fff' }, fontWeight: 700, fontSize: '0.9rem' }}
                      startIcon={<ExitToApp sx={{ fontSize: 18 }} />}
                    >
                      EXIT
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Price Chart Dialog */}
      <Dialog open={priceChartOpen} onClose={() => setPriceChartOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CurrencyRupee color="primary" /> Price Charts
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {charges.map((charge, index) => (
              <Grid item xs={4} key={index}>
                <Card variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{charge.category}</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', color: 'text.secondary' }}>{charge.type}</Typography>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700 }}>₹{charge.amount}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
