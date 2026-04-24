'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'

// Third-party Imports
import axios from 'axios'
import { useSession } from 'next-auth/react'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Components
const TabListContainer = styled(TabList)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: '8px',
  padding: '4px',
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .MuiTab-root': {
    borderRadius: '6px',
    minHeight: '38px',
    padding: '6px 20px',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxShadow: theme.shadows[1]
    }
  }
}))

const CustomSwitch = styled(Switch)(({ theme }) => ({
  // ... existing switch styles
}))

const ToggleCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(4),
  borderRadius: '12px',
  '& .MuiTypography-root': {
    fontWeight: 700,
    marginBottom: theme.spacing(3)
  }
}))

const ChargeCard = styled(Card, {
  shouldForwardProp: prop => prop !== 'hasCharge' && prop !== 'disabled'
})(({ theme, hasCharge, disabled }) => ({
  backgroundColor: hasCharge ? theme.palette.primary.main : theme.palette.background.paper,
  color: hasCharge ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: hasCharge ? 'none' : `1px dashed ${theme.palette.divider}`,
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  pointerEvents: disabled ? 'none' : 'auto',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: disabled ? 'none' : 'translateY(-4px)'
  }
}))

const ParkingManagement = () => {
  // States
  const [activeTab, setActiveTab] = useState('slots')
  const [loading, setLoading] = useState(true)
  const [vendorData, setVendorData] = useState(null)
  const [toggleStates, setToggleStates] = useState({
    bookEnabled: false,
    printEnabled: false,
    exitEnabled: false,
    vehicleUploadEnabled: false,
    slotViewEnabled: false,
    valetEnabled: false
  })
  const [slotsData, setSlotsData] = useState({
    total: { count: 0, car: 0, bike: 0, others: 0 },
    parked: { count: 0, car: 0, bike: 0, others: 0 },
    available: { count: 0, car: 0, bike: 0, others: 0 }
  })
  const [enabledVehicles, setEnabledVehicles] = useState({
    carEnabled: false,
    bikeEnabled: false,
    othersEnabled: false,
    carTemporary: false,
    bikeTemporary: false,
    othersTemporary: false,
    carWeekly: false,
    bikeWeekly: false,
    othersWeekly: false,
    car12h: false,
    bike12h: false,
    others12h: false,
    carFullDay: false,
    bikeFullDay: false,
    othersFullDay: false,
    car48h: false,
    bike48h: false,
    others48h: false,
    car72h: false,
    bike72h: false,
    others72h: false,
    carMonthly: false,
    bikeMonthly: false,
    othersMonthly: false
  })
  const [chargesData, setChargesData] = useState([])
  const [amenitiesData, setAmenitiesData] = useState([])
  const [additionalServices, setAdditionalServices] = useState([])
  const [chargeSubTab, setChargeSubTab] = useState('Car')
  const [businessHours, setBusinessHours] = useState([])

  // Add Charge Dialog States
  const [openAddCharge, setOpenAddCharge] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [chargeForm, setChargeForm] = useState({ type: '', amount: '' })
  const [savingCharge, setSavingCharge] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // Amenities & Services States
  const [openAddAmenity, setOpenAddAmenity] = useState(false)
  const [newAmenity, setNewAmenity] = useState('')
  const [newService, setNewService] = useState({ text: '', amount: '' })
  const [savingAmenity, setSavingAmenity] = useState(false)
  const [savingService, setSavingService] = useState(false)

  const { data: session } = useSession()
  const vendorId = session?.user?.id
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // Fetch all data
  useEffect(() => {
    if (vendorId) {
      fetchAllData()
    }
  }, [vendorId])

  const fetchAllData = async () => {
    if (!vendorId) {
      console.error('No vendorId found in session')
      setLoading(false)
      return
    }

    console.log('Fetching data for vendorId:', vendorId)
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        axios.get(`${API_URL}/vendor/fetch-vendor-data?id=${vendorId}`),
        axios.get(`${API_URL}/vendor/get-toggle-states/${vendorId}`),
        axios.get(`${API_URL}/vendor/fetchenable/${vendorId}`),
        axios.get(`${API_URL}/vendor/getchargesdata/${vendorId}`),
        axios.get(`${API_URL}/vendor/getamenitiesdata/${vendorId}`),
        axios.get(`${API_URL}/vendor/fetchcategories/${vendorId}`),
        axios.get(`${API_URL}/vendor/fetchbookedslot/${vendorId}`),
        axios.get(`${API_URL}/vendor/availableslots/${vendorId}`),
        axios.get(`${API_URL}/vendor/fetchbusinesshours/${vendorId}`)
      ])

      console.log('API Fetch Results:', results)

      const [vendorRes, toggleRes, enableRes, chargesRes, amenitiesRes, totalRes, parkedRes, availableRes, businessRes] = results.map(r => r.status === 'fulfilled' ? r.value : null)

      if (vendorRes) {
        const vData = vendorRes.data.data || vendorRes.data.vendor || vendorRes.data
        console.log('Vendor Data:', vData)
        setVendorData(vData)

        // Sync toggles from vendor data if available
        setToggleStates({
          bookEnabled: vData.bookEnabled ?? toggleStates.bookEnabled,
          printEnabled: vData.printEnabled ?? toggleStates.printEnabled,
          exitEnabled: vData.exitEnabled ?? toggleStates.exitEnabled,
          vehicleUploadEnabled: vData.vehicleUploadEnabled ?? toggleStates.vehicleUploadEnabled,
          valetEnabled: vData.valetEnabled ?? toggleStates.valetEnabled,
          slotViewEnabled: vData.slotViewEnabled ?? toggleStates.slotViewEnabled
        })

        // Sync total slots from parkingEntries if available
        if (vData.parkingEntries) {
          setSlotsData(prev => ({
            ...prev,
            total: {
              count: vData.parkingEntries.reduce((acc, curr) => acc + Number(curr.count), 0),
              car: Number(vData.parkingEntries.find(p => p.type === 'Cars' || p.type === 'Car')?.count) || 0,
              bike: Number(vData.parkingEntries.find(p => p.type === 'Bikes' || p.type === 'Bike')?.count) || 0,
              others: Number(vData.parkingEntries.find(p => p.type === 'Others' || p.type === 'Other')?.count) || 0
            }
          }))
        }
      }

      if (toggleRes && toggleRes.data) setToggleStates(prev => ({ ...prev, ...toggleRes.data }))
      if (enableRes) setEnabledVehicles(enableRes.data || enabledVehicles)
      if (chargesRes) setChargesData(chargesRes.data.vendor?.charges || chargesRes.data.charges || [])
      if (amenitiesRes && amenitiesRes.data) {
        const data = amenitiesRes.data.AmenitiesData || amenitiesRes.data
        setAmenitiesData(data.amenities || [])
        // Map parkingEntries to our internal state (using 'text' for service name)
        setAdditionalServices(data.parkingEntries || data.services || [])
      }

      if (businessRes && businessRes.data) {
        setBusinessHours(businessRes.data.businessHours || [])
      }

      const mapSlots = (res) => {
        if (!res || !res.data) return null
        const data = res.data

        // Handle flat structure (like in availableslots)
        if (data.Cars !== undefined || data.Bikes !== undefined) {
          return {
            count: Number(data.totalCount) || 0,
            car: Number(data.Cars || data.Car) || 0,
            bike: Number(data.Bikes || data.Bike) || 0,
            others: Number(data.Others || data.Other) || 0
          }
        }

        // Handle nested categories structure
        return {
          count: Number(data.totalCount) || 0,
          car: Number(data.categories?.find(c => c.name === 'Car' || c.type === 'Car' || c.name === 'Cars')?.count) || 0,
          bike: Number(data.categories?.find(c => c.name === 'Bike' || c.type === 'Bike' || c.name === 'Bikes')?.count) || 0,
          others: Number(data.categories?.find(c => c.name === 'Others' || c.type === 'Others' || c.name === 'Other')?.count) || 0
        }
      }

      const parkedDataRaw = mapSlots(parkedRes)
      const availableData = mapSlots(availableRes)
      const totalData = mapSlots(totalRes)

      setSlotsData(prev => {
          const total = totalData || prev.total
          const available = availableData || prev.available

          // Calculate parked as Total - Available per user request
          const calculatedParked = {
            count: Math.max(0, total.count - available.count),
            car: Math.max(0, total.car - available.car),
            bike: Math.max(0, total.bike - available.bike),
            others: Math.max(0, total.others - available.others)
          }

          return {
            total,
            available,
            parked: calculatedParked
          }
      })
    } catch (error) {
      console.error('Error in Parking Management fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleChange = async (field, value) => {
    const updatedToggles = { ...toggleStates, [field]: value }
    setToggleStates(updatedToggles)
    try {
      await axios.put(`${API_URL}/vendor/update-toggle-states/${vendorId}`, updatedToggles)
    } catch (error) {
      console.error('Error updating toggle state:', error)
    }
  }

  const handleVehicleEnableChange = async (field, value) => {
    let updated = { ...enabledVehicles, [field]: value }

    // Logic from Flutter: if disabling a vehicle type, reset all its sub-options
    const vehicleTypes = ['car', 'bike', 'others']
    vehicleTypes.forEach(type => {
      if (field === `${type}Enabled` && !value) {
        updated[`${type}Temporary`] = false
        updated[`${type}Weekly`] = false
        updated[`${type}Monthly`] = false
        updated[`${type}12h`] = false
        updated[`${type}FullDay`] = false
        updated[`${type}48h`] = false
        updated[`${type}72h`] = false
      }
    })

    setEnabledVehicles(updated)

    // If the currently selected sub-tab is the one being disabled, switch to another enabled one
    if (field.endsWith('Enabled') && !value && field.startsWith(chargeSubTab.toLowerCase())) {
      const nextEnabled = vehicleTypes.find(t =>
        (t === 'car' ? updated.carEnabled : t === 'bike' ? updated.bikeEnabled : updated.othersEnabled) &&
        `${t}Enabled` !== field
      )
      if (nextEnabled) {
        setChargeSubTab(nextEnabled.charAt(0).toUpperCase() + nextEnabled.slice(1))
      }
    }

    try {
      await axios.put(`${API_URL}/vendor/updateenable/${vendorId}`, updated)
      // Optional: re-fetch to ensure sync with backend
      // fetchAllData()
    } catch (error) {
      console.error('Error updating vehicle enable state:', error)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleOpenAddCharge = (item, existingCharge) => {
    setSelectedItem(item)
    setChargeForm({
      type: existingCharge ? existingCharge.type : (typeOptions[item.title]?.[0] || item.type),
      amount: existingCharge ? existingCharge.amount : ''
    })
    setOpenAddCharge(true)
  }

  const handleSaveCharge = async () => {
    if (!chargeForm.amount) {
      setSnackbar({ open: true, message: 'Please enter an amount', severity: 'error' })
      return
    }

    setSavingCharge(true)
    try {
      const payload = {
        vendorid: vendorId,
        category: chargeSubTab,
        type: chargeForm.type,
        amount: chargeForm.amount
      }

      // Using the generic addcharge endpoint which is common in this backend structure
      await axios.post(`${API_URL}/vendor/addcharge`, payload)

      setSnackbar({ open: true, message: 'Charge saved successfully', severity: 'success' })
      setOpenAddCharge(false)
      fetchAllData() // Refresh list
    } catch (error) {
      console.error('Error saving charge:', error)
      setSnackbar({ open: true, message: 'Failed to save charge', severity: 'error' })
    } finally {
      setSavingCharge(false)
    }
  }

  const typeOptions = {
    'Minimum Charge': ['0 to 1 hour', '0 to 2 hours', '0 to 3 hours', '0 to 4 hours'],
    'Additional Charge': ['Additional 1 hour', 'Additional 2 hours', 'Additional 3 hours', 'Additional 4 hours'],
    'Weekly Charge': ['Weekly'],
    '12h Charge': ['12 hours'],
    'Full Day': ['Full day'],
    '48h Charge': ['48 hours'],
    '72h Charge': ['72 hours'],
    'Monthly Charge': ['Monthly']
  }

  const amenityIcons = {
    'CCTV': 'ri-vidicon-line',
    'Wi-Fi': 'ri-wifi-line',
    'Covered Parking': 'ri-parking-box-line',
    'Self Car Wash': 'ri-car-wash-line',
    'Charging': 'ri-charging-pile-2-line',
    'Restroom': 'ri-rest-time-line',
    'Security': 'ri-shield-star-line',
    'Gated Parking': 'ri-door-lock-box-line',
    'Open Parking': 'ri-sun-cloudy-line'
  }

  const masterAmenities = [
    'CCTV', 'Wi-Fi', 'Covered Parking', 'Self Car Wash', 'Charging', 'Restroom', 'Security', 'Gated Parking', 'Open Parking'
  ]

  const handleToggleAmenity = async (amenity) => {
    let updatedAmenities
    if (amenitiesData.includes(amenity)) {
      updatedAmenities = amenitiesData.filter(a => a !== amenity)
    } else {
      updatedAmenities = [...amenitiesData, amenity]
    }
    
    setAmenitiesData(updatedAmenities)
    try {
      await axios.put(`${API_URL}/vendor/updateamenitiesdata/${vendorId}`, {
        vendorId: vendorId,
        amenities: updatedAmenities,
        parkingEntries: additionalServices.map(s => ({ text: s.text || s.type, amount: s.amount }))
      })
    } catch (error) {
      console.error('Error toggling amenity:', error)
      setSnackbar({ open: true, message: 'Failed to update amenity', severity: 'error' })
    }
  }

  const handleSaveAmenity = async () => {
    if (!newAmenity.trim()) return
    setSavingAmenity(true)
    try {
      const updatedAmenities = [...amenitiesData, newAmenity.trim()]
      await axios.put(`${API_URL}/vendor/updateamenitiesdata/${vendorId}`, {
        vendorId: vendorId,
        amenities: updatedAmenities,
        parkingEntries: additionalServices.map(s => ({ text: s.text || s.type, amount: s.amount }))
      })
      setAmenitiesData(updatedAmenities)
      setSnackbar({ open: true, message: 'Amenity added successfully', severity: 'success' })
      setOpenAddAmenity(false)
      setNewAmenity('')
    } catch (error) {
      console.error('Error saving amenity:', error)
      setSnackbar({ open: true, message: 'Failed to add amenity', severity: 'error' })
    } finally {
      setSavingAmenity(false)
    }
  }

  const handleSaveService = async () => {
    if (!newService.text || !newService.amount) {
      setSnackbar({ open: true, message: 'Please fill both fields', severity: 'error' })
      return
    }
    setSavingService(true)
    try {
      const updatedServices = [...additionalServices, newService]
      await axios.put(`${API_URL}/vendor/updateamenitiesdata/${vendorId}`, {
        vendorId: vendorId,
        amenities: amenitiesData,
        parkingEntries: updatedServices.map(s => ({ text: s.text || s.type, amount: s.amount }))
      })
      setAdditionalServices(updatedServices)
      setNewService({ text: '', amount: '' })
      setSnackbar({ open: true, message: 'Service added successfully', severity: 'success' })
    } catch (error) {
      console.error('Error saving service:', error)
      setSnackbar({ open: true, message: 'Failed to add service', severity: 'error' })
    } finally {
      setSavingService(false)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  const renderSlotsTab = () => (
    <Grid container spacing={6}>
      {/* Stats Cards */}
      {[
        { title: 'Total', data: slotsData.total, bgColor: '#2d9a70' },
        { title: 'Parked', data: slotsData.parked, bgColor: '#2d9a70' },
        { title: 'Available', data: slotsData.available, bgColor: '#2d9a70' }
      ].map((card, index) => (
        <Grid size={{ xs: 12, md: 4 }} key={index}>
          <Card sx={{ bgcolor: card.bgColor, color: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant='h6' sx={{ color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, mb: 4 }}>
                {card.title}
              </Typography>
              <Box sx={{ my: 6, display: 'flex', justifyContent: 'center' }}>
                <Avatar sx={{ bgcolor: 'white', color: card.bgColor, width: 85, height: 85, fontSize: '2.25rem', fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  {card.data.count}
                </Avatar>
              </Box>
              <Box display='flex' justifyContent='space-around' sx={{ px: 2, mt: 4 }}>
                <Box>
                  <Typography variant='subtitle1' sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Car</Typography>
                  <Typography variant='h5' sx={{ color: 'white', fontWeight: 800 }}>{card.data.car}</Typography>
                </Box>
                <Box>
                  <Typography variant='subtitle1' sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Bike</Typography>
                  <Typography variant='h5' sx={{ color: 'white', fontWeight: 800 }}>{card.data.bike}</Typography>
                </Box>
                <Box>
                  <Typography variant='subtitle1' sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>Other</Typography>
                  <Typography variant='h5' sx={{ color: 'white', fontWeight: 800 }}>{card.data.others}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Vendor Profile Info */}
      <Grid size={{ xs: 12 }}>
        <Card sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: '12px', bgcolor: 'background.paper' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 6, py: 4 }}>
            <Avatar src={vendorData?.image} sx={{ width: 90, height: 90, border: '2px solid', borderColor: 'divider' }}>
               <i className='ri-user-line' style={{ fontSize: '2rem' }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant='h6' sx={{ mb: 1 }}><strong>Address:</strong> {vendorData?.address || vendorData?.vendor_address || 'N/A'}</Typography>
              <Typography variant='h6'><strong>Landmark:</strong> {vendorData?.landMark || vendorData?.vendor_landMark || vendorData?.landmark || 'N/A'}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Function Controls */}
      <Grid size={{ xs: 12 }}>
        <Typography variant='h6' sx={{ mb: 4, textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Function Controls</Typography>
        <Grid container spacing={4}>
          {[
            { label: 'Book Enable', field: 'bookEnabled' },
            { label: 'Print Enable', field: 'printEnabled' },
            { label: 'Exit Enable', field: 'exitEnabled' },
            { label: 'Vehicle Upload', field: 'vehicleUploadEnabled' },
            { label: 'Valet', field: 'valetEnabled' }
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={item.field}>
              <ToggleCard sx={{ py: 6 }}>
                <Typography variant='subtitle1'>{item.label}</Typography>
                <Box display='flex' alignItems='center' justifyContent='center' gap={3}>
                   <Typography variant='caption' sx={{ fontWeight: 800, color: toggleStates[item.field] ? 'success.main' : 'text.disabled' }}>
                    {toggleStates[item.field] ? 'ON' : 'OFF'}
                   </Typography>
                  <Switch
                    checked={toggleStates[item.field]}
                    onChange={(e) => handleToggleChange(item.field, e.target.checked)}
                    color='success'
                  />
                </Box>
              </ToggleCard>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Contact & Location Details */}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant='h6' sx={{ mb: 4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Contact details</Typography>
        <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', height: 260 }}>
          <CardContent sx={{ py: 6 }}>
            <Box display='flex' alignItems='center' gap={4} sx={{ mb: 6 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 45, height: 45 }}>
                <i className='ri-user-smile-line' />
              </Avatar>
              <Box>
                <Typography variant='caption' sx={{ display: 'block', fontWeight: 600, color: 'text.secondary' }}>Primary Contact</Typography>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>{vendorData?.contacts?.[0]?.name || 'N/A'}</Typography>
              </Box>
            </Box>
            <Box display='flex' alignItems='center' gap={4}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 45, height: 45 }}>
                <i className='ri-phone-line' />
              </Avatar>
              <Box>
                <Typography variant='caption' sx={{ display: 'block', fontWeight: 600, color: 'text.secondary' }}>Mobile Number</Typography>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>{vendorData?.contacts?.[0]?.mobile || 'N/A'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant='h6' sx={{ mb: 4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Location details</Typography>
        <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', height: 260 }}>
          <Box sx={{ height: 180, width: '100%', bgcolor: 'secondary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {vendorData?.latitude && vendorData?.longitude ? (
              <iframe
                title='Vendor Location'
                width='100%'
                height='100%'
                frameBorder='0'
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${vendorData.latitude},${vendorData.longitude}&output=embed`}
                allowFullScreen
              ></iframe>
            ) : (
              <Box textAlign='center' sx={{ color: 'text.secondary' }}>
                <i className='ri-map-pin-line' style={{ fontSize: '2rem' }} />
                <Typography>Coordinates not available</Typography>
              </Box>
            )}
          </Box>
          <CardContent sx={{ py: 3 }}>
            <Typography variant='caption' sx={{ display: 'block', fontWeight: 600, color: 'text.secondary' }}>Coordinates</Typography>
            <Typography variant='body2' sx={{ fontWeight: 700 }}>
              Lat: {vendorData?.latitude || 'N/A'}, Long: {vendorData?.longitude || 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Business Hours Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant='h6' sx={{ mb: 4, textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Business Hours</Typography>
        <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 0 }}>
             <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                      <tr style={{ backgroundColor: 'rgba(45, 154, 112, 0.1)' }}>
                         <th style={{ textAlign: 'left', padding: '12px 24px', fontWeight: 800 }}>Day</th>
                         <th style={{ textAlign: 'center', padding: '12px 24px', fontWeight: 800 }}>Open at</th>
                         <th style={{ textAlign: 'center', padding: '12px 24px', fontWeight: 800 }}>Close at</th>
                         <th style={{ textAlign: 'center', padding: '12px 24px', fontWeight: 800 }}>Status</th>
                      </tr>
                   </thead>
                   <tbody>
                      {businessHours.length > 0 ? businessHours.map((hour, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                           <td style={{ padding: '12px 24px', fontWeight: 600 }}>{hour.day}</td>
                           <td style={{ textAlign: 'center', padding: '12px 24px' }}>
                              {hour.isClosed ? '--' : hour.is24Hours ? '12:00 AM' : hour.openTime || '09:00 AM'}
                           </td>
                           <td style={{ textAlign: 'center', padding: '12px 24px' }}>
                              {hour.isClosed ? '--' : hour.is24Hours ? '11:59 PM' : hour.closeTime || '09:00 PM'}
                           </td>
                           <td style={{ textAlign: 'center', padding: '12px 24px' }}>
                              {hour.isClosed ? (
                                <Chip label='Closed' size='small' color='error' />
                              ) : hour.is24Hours ? (
                                <Chip label='24 Hours' size='small' color='success' />
                              ) : (
                                <Chip label='Open' size='small' color='primary' />
                              )}
                           </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'gray' }}>No business hours data available</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    </Grid>
  )

  const renderChargesTab = () => {
    const categories = ['Car', 'Bike', 'Others']
    const enabledCategories = categories.filter(cat => enabledVehicles[`${cat.toLowerCase()}Enabled`])

    const durations = [
      { label: 'Temporary', field: 'Temporary' },
      { label: 'Weekly', field: 'Weekly' },
      { label: 'Monthly', field: 'Monthly' },
      { label: '12h', field: '12h' },
      { label: 'Full Day', field: 'FullDay' },
      { label: '48h', field: '48h' },
      { label: '72h', field: '72h' }
    ]

    // Mapping for charge cards to their respective enable toggles
    const chargeDurationMap = {
      'Minimum Charge': 'Temporary',
      'Additional Charge': 'Temporary',
      'Weekly Charge': 'Weekly',
      '12h Charge': '12h',
      'Full Day': 'FullDay',
      '48h Charge': '48h',
      '72h Charge': '72h',
      'Monthly Charge': 'Monthly'
    }

    return (
      <Grid container spacing={6}>
        {/* Top Vehicle Enable Switches */}
        <Grid size={{ xs: 12 }} container justifyContent='center' spacing={4}>
          {categories.map(cat => (
            <Grid key={cat}>
               <Box textAlign='center'>
                  <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>{cat}</Typography>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Chip
                      label={enabledVehicles[`${cat.toLowerCase()}Enabled`] ? 'ON' : 'OFF'}
                      size='small'
                      color={enabledVehicles[`${cat.toLowerCase()}Enabled`] ? 'success' : 'default'}
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Switch
                      checked={enabledVehicles[`${cat.toLowerCase()}Enabled`]}
                      onChange={(e) => handleVehicleEnableChange(`${cat.toLowerCase()}Enabled`, e.target.checked)}
                    />
                    <i className='ri-plug-fill' style={{ color: enabledVehicles[`${cat.toLowerCase()}Enabled`] ? '#4caf50' : '#f44336', fontSize: '1.2rem' }} />
                  </Box>
               </Box>
            </Grid>
          ))}
        </Grid>

        {enabledCategories.length > 0 ? (
          <Grid size={{ xs: 12 }}>
            <TabContext value={chargeSubTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <TabList onChange={(e, v) => setChargeSubTab(v)} variant='fullWidth'>
                  {enabledCategories.map(cat => (
                    <Tab
                      key={cat}
                      icon={<i className={cat === 'Car' ? 'ri-car-fill' : cat === 'Bike' ? 'ri-motorbike-fill' : 'ri-settings-3-fill'} />}
                      iconPosition='start'
                      label={cat === 'Others' ? 'Others' : `${cat}s`}
                      value={cat}
                    />
                  ))}
                </TabList>
              </Box>

              {/* Duration Toggles for selected vehicle */}
              <Box sx={{ mb: 6 }}>
                <Grid container spacing={2} justifyContent='center'>
                  {durations.map(dur => (
                    <Grid key={dur.field}>
                       <Box textAlign='center' sx={{ minWidth: 100 }}>
                          <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary' }}>{dur.label}</Typography>
                          <Box display='flex' alignItems='center' justifyContent='center'>
                             <Switch
                               size='small'
                               checked={enabledVehicles[`${chargeSubTab.toLowerCase()}${dur.field}`]}
                               onChange={(e) => handleVehicleEnableChange(`${chargeSubTab.toLowerCase()}${dur.field}`, e.target.checked)}
                             />
                          </Box>
                       </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Charge Cards Grid */}
              <Grid container spacing={4}>
                {[
                  { title: 'Minimum Charge', type: '0 to 4 hours' },
                  { title: 'Additional Charge', type: 'Additional 3 hours' },
                  { title: 'Weekly Charge', type: 'Weekly' },
                  { title: '12h Charge', type: '12 hours' },
                  { title: 'Full Day', type: 'Full day' },
                  { title: '48h Charge', type: '48 hours' },
                  { title: '72h Charge', type: '72 hours' },
                  { title: 'Monthly Charge', type: 'Monthly' }
                ].map((item, idx) => {
                  const charge = chargesData.find(c => c.category === chargeSubTab && c.type === item.type)
                  const isDurationEnabled = enabledVehicles[`${chargeSubTab.toLowerCase()}${chargeDurationMap[item.title]}`]

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                      <ChargeCard
                        hasCharge={!!charge}
                        disabled={!isDurationEnabled}
                        onClick={() => handleOpenAddCharge(item, charge)}
                      >
                        <Typography variant='subtitle1' color='inherit' sx={{ fontWeight: 700 }}>{item.title}</Typography>
                        <Typography variant='caption' color='inherit' sx={{ mb: 4, display: 'block' }}>{item.type}</Typography>
                        {charge ? (
                          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mx: 'auto', fontWeight: 900 }}>
                            {charge.amount}
                          </Avatar>
                        ) : (
                          <Avatar sx={{ bgcolor: 'grey.300', color: 'text.primary', mx: 'auto', width: 40, height: 40 }}>
                            <i className='ri-add-line' style={{ fontSize: '1.5rem' }} />
                          </Avatar>
                        )}
                      </ChargeCard>
                    </Grid>
                  )
                })}
              </Grid>
            </TabContext>
          </Grid>
        ) : (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'action.hover', borderRadius: '12px', mt: 4 }}>
              <i className='ri-information-line' style={{ fontSize: '3rem', color: 'gray' }} />
              <Typography variant='h6' sx={{ mt: 2, color: 'text.secondary' }}>Please enable at least one vehicle type to manage charges</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    )
  }

  const renderAmenitiesTab = () => (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 6 }}>
              <Typography variant='h6' sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Choose Amenities</Typography>
              <Button 
                variant='contained' 
                color='success' 
                size='small' 
                startIcon={<i className='ri-add-circle-line' />}
                onClick={() => setOpenAddAmenity(true)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                Add Amenities
              </Button>
            </Box>
            <Box display='flex' flexWrap='wrap' gap={3}>
              {masterAmenities.map((amenity, idx) => {
                const isActive = amenitiesData.includes(amenity)
                return (
                  <Chip 
                    key={idx} 
                    icon={<i className={amenityIcons[amenity]} style={{ fontSize: '1.1rem' }} />}
                    label={amenity} 
                    onClick={() => handleToggleAmenity(amenity)}
                    color={isActive ? 'primary' : 'default'}
                    variant={isActive ? 'tonal' : 'outlined'}
                    sx={{ 
                      fontWeight: 700, 
                      px: 2, 
                      py: 5,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      borderWidth: isActive ? 0 : 1,
                      bgcolor: isActive ? undefined : 'rgba(0,0,0,0.02)',
                      '& .MuiChip-icon': { color: isActive ? 'primary.main' : 'text.disabled' }
                    }} 
                  />
                )
              })}
              
              {/* Custom Amenities */}
              {amenitiesData.filter(a => !masterAmenities.includes(a)).map((amenity, idx) => (
                <Chip 
                  key={`custom-${idx}`} 
                  icon={<i className='ri-checkbox-circle-line' style={{ fontSize: '1.1rem' }} />}
                  label={amenity} 
                  onClick={() => handleToggleAmenity(amenity)}
                  color='primary' 
                  variant='tonal' 
                  sx={{ 
                    fontWeight: 700, 
                    px: 2, 
                    py: 5,
                    borderRadius: '8px',
                    '& .MuiChip-icon': { color: 'primary.main' }
                  }} 
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant='h6' sx={{ fontWeight: 800, textTransform: 'uppercase', mb: 6 }}>Additional Services</Typography>
            
            {/* Service Input Form */}
            <Grid container spacing={4} alignItems='center' sx={{ mb: 8 }}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField 
                  fullWidth 
                  size='small' 
                  placeholder='Services' 
                  value={newService.text}
                  onChange={(e) => setNewService({ ...newService, text: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField 
                  fullWidth 
                  size='small' 
                  placeholder='Amount' 
                  type='number'
                  value={newService.amount}
                  onChange={(e) => setNewService({ ...newService, amount: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button 
                  variant='contained'
                  color='success'
                  disabled={savingService}
                  onClick={handleSaveService}
                  sx={{ 
                    borderRadius: '8px', 
                    minWidth: 40, 
                    width: 40, 
                    height: 40, 
                    p: 0,
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#388e3c' }
                  }}
                >
                  {savingService ? <CircularProgress size={20} color='inherit' /> : <i className='ri-add-line' style={{ fontSize: '1.2rem' }} />}
                </Button>
              </Grid>
            </Grid>

            {/* Services List Table */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Box display='flex' justifyContent='space-between' sx={{ px: 4, py: 3, bgcolor: 'action.hover', borderRadius: '8px', mb: 2 }}>
                   <Typography variant='subtitle2' sx={{ fontWeight: 800, flex: 0.5 }}>S.No</Typography>
                   <Typography variant='subtitle2' sx={{ fontWeight: 800, flex: 2 }}>Services</Typography>
                   <Typography variant='subtitle2' sx={{ fontWeight: 800, flex: 1, textAlign: 'right' }}>Amount</Typography>
                </Box>
              </Grid>
              {additionalServices.map((service, idx) => (
                <Grid size={{ xs: 12 }} key={idx}>
                  <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant='body2' sx={{ fontWeight: 700, flex: 0.5 }}>{idx + 1}.</Typography>
                    <Typography variant='body2' sx={{ flex: 2 }}>{service.text || service.type}</Typography>
                    <Typography variant='body2' color='primary' sx={{ fontWeight: 800, flex: 1, textAlign: 'right' }}>₹{service.amount}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  return (
    <Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 6 }}>
        <Typography variant='h4' sx={{ fontWeight: 700 }}>Manage Parking Area</Typography>
        <IconButton sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
          <i className='ri-pencil-line' />
        </IconButton>
      </Box>

      <TabContext value={activeTab}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <TabListContainer onChange={handleTabChange} aria-label='parking management tabs'>
            <Tab label='Slots' value='slots' />
            <Tab label='Charges' value='charges' />
            <Tab label='Amenities' value='amenities' />
          </TabListContainer>
        </Box>
        <TabPanel value='slots' sx={{ p: 0 }}>{renderSlotsTab()}</TabPanel>
        <TabPanel value='charges' sx={{ p: 0 }}>{renderChargesTab()}</TabPanel>
        <TabPanel value='amenities' sx={{ p: 0 }}>{renderAmenitiesTab()}</TabPanel>
      </TabContext>

      {/* Add/Edit Charge Dialog */}
      <Dialog open={openAddCharge} onClose={() => setOpenAddCharge(false)} fullWidth maxWidth='xs'>
        <DialogTitle sx={{ pb: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size='small' onClick={() => setOpenAddCharge(false)} sx={{ color: 'text.primary' }}>
            <i className='ri-arrow-left-line' />
          </IconButton>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            {chargeSubTab} {selectedItem?.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant='caption' color='error' sx={{ display: 'block', mb: 6, fontWeight: 600 }}>
            Kindly add the amount exclusive of GST*
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label='Type'
                variant='outlined'
                value={chargeForm.type}
                onChange={(e) => setChargeForm({ ...chargeForm, type: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                {(typeOptions[selectedItem?.title] || [selectedItem?.type]).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label='Amount'
                type='number'
                variant='outlined'
                value={chargeForm.amount}
                onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
                slotProps={{
                  input: {
                    startAdornment: <Typography sx={{ mr: 2, color: 'text.secondary', fontWeight: 700 }}>₹</Typography>
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant='contained'
              color='success'
              disabled={savingCharge}
              onClick={handleSaveCharge}
              startIcon={savingCharge ? <CircularProgress size={20} color='inherit' /> : <i className='ri-login-box-line' />}
              sx={{
                borderRadius: '12px',
                px: 8,
                py: 3,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(45, 154, 112, 0.3)'
              }}
            >
              Add Charges
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Add Other Amenities Dialog */}
      <Dialog open={openAddAmenity} onClose={() => setOpenAddAmenity(false)} fullWidth maxWidth='xs'>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>Add Other Amenities</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField 
            fullWidth 
            placeholder='Enter New Amenity' 
            variant='outlined' 
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'action.hover' } }}
          />
          <Box sx={{ mt: 6, display: 'flex', gap: 4 }}>
            <Button 
              fullWidth 
              variant='contained' 
              color='success' 
              onClick={() => setOpenAddAmenity(false)}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, bgcolor: '#4caf50' }}
            >
              Cancel
            </Button>
            <Button 
              fullWidth 
              variant='contained' 
              color='success'
              disabled={savingAmenity}
              onClick={handleSaveAmenity}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, bgcolor: '#4caf50' }}
            >
              {savingAmenity ? <CircularProgress size={20} color='inherit' /> : 'Add'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ParkingManagement
