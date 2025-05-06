// 'use client'
// import { useRef, useEffect, useState } from 'react'

// import Grid from '@mui/material/Grid'
// import Button from '@mui/material/Button'
// import TextField from '@mui/material/TextField'
// import Typography from '@mui/material/Typography'
// import InputAdornment from '@mui/material/InputAdornment'
// import IconButton from '@mui/material/IconButton'
// import AddIcon from '@mui/icons-material/Add'
// import RemoveIcon from '@mui/icons-material/Remove'
// import Dialog from '@mui/material/Dialog'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogActions from '@mui/material/DialogActions'
// import Tabs from '@mui/material/Tabs'
// import Tab from '@mui/material/Tab'
// import Box from '@mui/material/Box'

// import DirectionalIcon from '@components/DirectionalIcon'

// const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// const StepPersonalInfo = ({ handleNext, contacts, setContacts, address, setAddress, vendorName, setVendorName }) => {
//   const [mapDialogOpen, setMapDialogOpen] = useState(false)
//   const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.209 })
//   const [landmark, setLandmark] = useState('')
//   const [latitude, setLatitude] = useState('')
//   const [longitude, setLongitude] = useState('')
//   const [addressTab, setAddressTab] = useState(0)
//   const [manualAddress, setManualAddress] = useState({
//     street: '',
//     city: '',
//     state: '',
//     pincode: '',
//     landmark: ''
//   })
  
//   const mapRef = useRef(null)
//   const markerRef = useRef(null)
//   const autocompleteRef = useRef(null)
//   const mapInstance = useRef(null)
//   const googleMapsLoaded = useRef(false)

//   const loadGoogleMapsScript = () => {
//     if (!googleMapsLoaded.current && !window.google) {
//       const script = document.createElement('script')
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`
//       script.async = true
//       script.defer = true
//       script.onload = () => {
//         googleMapsLoaded.current = true
//         if (mapDialogOpen) {
//           initMap()
//         }
//       }
//       document.body.appendChild(script)
//     } else if (googleMapsLoaded.current && mapDialogOpen) {
//       initMap()
//     }
//   }

//   useEffect(() => {
//     if (mapDialogOpen) {
//       loadGoogleMapsScript()
//     }
//   }, [mapDialogOpen])

//   const initMap = () => {
//     if (!mapRef.current || !window.google) return

//     const map = new window.google.maps.Map(mapRef.current, {
//       center: currentLocation,
//       zoom: 15
//     })
//     mapInstance.current = map

//     // Use the regular Marker for now, since AdvancedMarkerElement is still causing issues for some
//     markerRef.current = new window.google.maps.Marker({
//       position: currentLocation,
//       map,
//       draggable: true
//     })

//     const input = document.getElementById('autocomplete-input')
//     if (input) {
//       // Use traditional Autocomplete since it's more reliable
//       autocompleteRef.current = new window.google.maps.places.Autocomplete(input)
//       autocompleteRef.current.bindTo('bounds', map)
      
//       autocompleteRef.current.addListener('place_changed', () => {
//         const place = autocompleteRef.current.getPlace()
//         if (!place.geometry) return
        
//         map.setCenter(place.geometry.location)
//         markerRef.current.setPosition(place.geometry.location)
        
//         setLatitude(place.geometry.location.lat())
//         setLongitude(place.geometry.location.lng())
//         setAddress(place.formatted_address)
        
//         // Extract landmark from address components
//         const landmarkComponent = place.address_components.find(
//           comp => comp.types.includes('point_of_interest') || comp.types.includes('establishment')
//         )
//         if (landmarkComponent) {
//           setLandmark(landmarkComponent.long_name)
//         }
//       })
//     }

//     markerRef.current.addListener('dragend', () => {
//       const position = markerRef.current.getPosition()
//       setLatitude(position.lat())
//       setLongitude(position.lng())
      
//       const geocoder = new window.google.maps.Geocoder()
//       geocoder.geocode({ location: position }, (results, status) => {
//         if (status === 'OK' && results[0]) {
//           setAddress(results[0].formatted_address)
          
//           // Extract landmark from address components
//           const landmarkComponent = results[0].address_components.find(
//             comp => comp.types.includes('point_of_interest') || comp.types.includes('establishment')
//           )
//           if (landmarkComponent) {
//             setLandmark(landmarkComponent.long_name)
//           }
//         }
//       })
//     })
//   }

//   const handleAddContact = () => {
//     setContacts([...contacts, { id: contacts.length + 1, name: '', mobile: '' }])
//   }

//   const handleContactChange = (id, field, value) => {
//     setContacts(contacts.map(contact => (contact.id === id ? { ...contact, [field]: value } : contact)))
//   }

//   const handleRemoveContact = id => {
//     setContacts(contacts.filter(contact => contact.id !== id))
//   }

//   const handleOpenMapDialog = () => {
//     setMapDialogOpen(true)
//   }

//   const handleCloseMapDialog = () => {
//     setMapDialogOpen(false)
//   }

//   const handleConfirmLocation = () => {
//     if (addressTab === 0) {
//       // Using map selection - address is already set
//       setMapDialogOpen(false)
//     } else {
//       // Using manual entry
//       const formattedAddress = `${manualAddress.street}, ${manualAddress.city}, ${manualAddress.state} - ${manualAddress.pincode}`
//       setAddress(formattedAddress)
//       setLandmark(manualAddress.landmark)
//       setMapDialogOpen(false)
//     }
//   }

//   const handleAddressTabChange = (event, newValue) => {
//     setAddressTab(newValue)
//   }

//   const handleManualAddressChange = (field, value) => {
//     setManualAddress({
//       ...manualAddress,
//       [field]: value
//     })
//   }

//   // Try to get user's current location when component mounts
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setCurrentLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           })
//         },
//         (error) => {
//           console.error("Error getting current location:", error)
//         }
//       )
//     }
//   }, [])

//   return (
//     <>
//       <Typography variant='h4' className='mbe-1'>
//         Personal Information
//       </Typography>
//       <Typography>Enter Vendor Personal Information</Typography>
//       <br />
//       {/* Vendor Name Field */}
//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label='Vendor Name'
//             placeholder='Enter Your Vendor Name'
//             value={vendorName}
//             onChange={e => setVendorName(e.target.value)}
//           />
//         </Grid>
//       </Grid>
//       {/* Contact Repeater Block */}
//       <Grid container spacing={3} style={{ marginTop: '10px' }}>
//         {contacts.map((contact, index) => (
//           <Grid item xs={12} key={contact.id} className='repeater-item'>
//             <Grid container spacing={3} alignItems='center'>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label={`Contact Person`}
//                   placeholder='Contact Person'
//                   value={contact.name}
//                   onChange={e => handleContactChange(contact.id, 'name', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                   <TextField
//                     fullWidth
//                     label={`Contact Number`}
//                     placeholder='Contact Number'
//                     value={contact.mobile}
//                     onChange={e => handleContactChange(contact.id, 'mobile', e.target.value)}
//                     InputProps={{
//                       startAdornment: <InputAdornment position='start'>IN (+91)</InputAdornment>
//                     }}
//                   />
//                   {index > 0 && (
//                     <IconButton onClick={() => handleRemoveContact(contact.id)} color='error'>
//                       <RemoveIcon />
//                     </IconButton>
//                   )}
//                 </div>
//               </Grid>
//             </Grid>
//           </Grid>
//         ))}
//         {/* Add Contact Button */}
//         <Grid item xs={12}>
//           <Button variant='contained' onClick={handleAddContact} startIcon={<AddIcon />}>
//             Add Another Contact
//           </Button>
//         </Grid>
//       </Grid>
//       {/* Address Field */}
//       <Grid container spacing={3} style={{ marginTop: '10px' }}>
//         <Grid item xs={12}>
//           <TextField
//             fullWidth
//             label='Address'
//             placeholder='Click to select or enter address'
//             value={address}
//             InputProps={{
//               readOnly: true,
//             }}
//             onClick={handleOpenMapDialog}
//             style={{ cursor: 'pointer' }}
//           />
//         </Grid>
//       </Grid>

//       {/* Map Dialog with Tabs for Map/Manual Entry */}
//       <Dialog 
//         open={mapDialogOpen} 
//         onClose={handleCloseMapDialog}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle>Location Details</DialogTitle>
//         <DialogContent>
//           <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
//             <Tabs value={addressTab} onChange={handleAddressTabChange} aria-label="address entry tabs">
//               <Tab label="Select on Map" />
//               <Tab label="Enter Manually" />
//             </Tabs>
//           </Box>
          
//           {addressTab === 0 ? (
//             // Map Selection Tab
//             <>
//               <TextField
//                 id="autocomplete-input"
//                 fullWidth
//                 label="Search location"
//                 placeholder="Enter an address to search"
//                 margin="normal"
//               />
//               <div ref={mapRef} style={{ width: '100%', height: '400px', marginTop: '10px' }}></div>
              
//               <Grid container spacing={2} style={{ marginTop: '10px' }}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Latitude"
//                     value={latitude}
//                     InputProps={{
//                       readOnly: true,
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Longitude"
//                     value={longitude}
//                     InputProps={{
//                       readOnly: true,
//                     }}
//                   />
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     label="Landmark"
//                     value={landmark}
//                     onChange={(e) => setLandmark(e.target.value)}
//                     placeholder="Enter a nearby landmark"
//                   />
//                 </Grid>
//               </Grid>
//             </>
//           ) : (
//             // Manual Entry Tab
//             <Grid container spacing={2} style={{ marginTop: '10px' }}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Street Address"
//                   value={manualAddress.street}
//                   onChange={(e) => handleManualAddressChange('street', e.target.value)}
//                   placeholder="Enter street address"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="City"
//                   value={manualAddress.city}
//                   onChange={(e) => handleManualAddressChange('city', e.target.value)}
//                   placeholder="Enter city"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="State"
//                   value={manualAddress.state}
//                   onChange={(e) => handleManualAddressChange('state', e.target.value)}
//                   placeholder="Enter state"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="PIN Code"
//                   value={manualAddress.pincode}
//                   onChange={(e) => handleManualAddressChange('pincode', e.target.value)}
//                   placeholder="Enter PIN code"
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   fullWidth
//                   label="Landmark"
//                   value={manualAddress.landmark}
//                   onChange={(e) => handleManualAddressChange('landmark', e.target.value)}
//                   placeholder="Enter a nearby landmark"
//                 />
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseMapDialog}>Cancel</Button>
//           <Button onClick={handleConfirmLocation} variant="contained" color="primary">
//             Confirm Location
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Navigation Buttons */}
//       <Grid container spacing={3} justifyContent='space-between' style={{ marginTop: '20px' }}>
//         <Grid item>
//           <Button
//             variant='contained'
//             onClick={handleNext}
//             endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' />}
//           >
//             Next
//           </Button>
//         </Grid>
//       </Grid>
//     </>
//   )
// }

// export default StepPersonalInfo

'use client'
import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import DirectionalIcon from '@components/DirectionalIcon'

const StepPersonalInfo = ({ 
  handleNext, 
  contacts, 
  setContacts, 
  address, 
  setAddress, 
  vendorName, 
  setVendorName, 
  latitude, 
  setLatitude, 
  longitude, 
  setLongitude, 
  landmark, 
  setLandmark 
}) => {
  // State to track if add button should be enabled
  const [addButtonEnabled, setAddButtonEnabled] = useState(false)

  // Check if the last contact has both name and mobile filled
  useEffect(() => {
    if (contacts.length > 0) {
      const lastContact = contacts[contacts.length - 1]
      setAddButtonEnabled(
        lastContact.name.trim() !== '' &&
        /^\d{10}$/.test(lastContact.mobile.trim())
      )
      
    } else {
      setAddButtonEnabled(false)
    }
  }, [contacts])

  const handleAddContact = () => {
    setContacts([...contacts, { id: contacts.length + 1, name: '', mobile: '' }])
    // Disable button after adding a new contact
    setAddButtonEnabled(false)
  }

  const handleContactChange = (id, field, value) => {
    if (field === 'mobile') {
      // Allow only digits and limit to 10 characters
      if (!/^\d*$/.test(value) || value.length > 10) return
    }
    setContacts(contacts.map(contact => {
      if (contact.id === id) {
        return { ...contact, [field]: value }
      }
      return contact
    }))
  }

  const handleRemoveContact = id => {
    setContacts(contacts.filter(contact => contact.id !== id))
  }

  return (
    <>
      <Typography variant='h4' className='mbe-1'>
        Personal Information
      </Typography>
      <Typography>Enter Vendor Personal Information</Typography>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Vendor Name'
            placeholder='Enter Your Vendor Name'
            value={vendorName}
            onChange={e => setVendorName(e.target.value)}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} style={{ marginTop: '10px' }}>
        {contacts.map((contact, index) => (
          <Grid item xs={12} key={contact.id} className='repeater-item'>
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={`Contact Person`}
                  placeholder='Contact Person'
                  value={contact.name}
                  onChange={e => handleContactChange(contact.id, 'name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TextField
                    fullWidth
                    label={`Contact Number`}
                    placeholder='Contact Number'
                    value={contact.mobile}
                    onChange={e => handleContactChange(contact.id, 'mobile', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>IN (+91)</InputAdornment>,
                      inputProps: { maxLength: 10 }
                    }}
                    required
                  />
                  {index > 0 && (
                    <IconButton onClick={() => handleRemoveContact(contact.id)} color='error'>
                      <RemoveIcon />
                    </IconButton>
                  )}
                </div>
              </Grid>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button 
            variant='contained' 
            onClick={handleAddContact} 
            startIcon={<AddIcon />}
            disabled={!addButtonEnabled}
          >
            Add Another Contact
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={3} style={{ marginTop: '10px' }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Address'
            placeholder='Enter complete address'
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Latitude'
            placeholder='Enter latitude (e.g., 28.6139)'
            value={latitude}
            onChange={e => setLatitude(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='Longitude'
            placeholder='Enter longitude (e.g., 77.209)'
            value={longitude}
            onChange={e => setLongitude(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Landmark'
            placeholder='Enter a nearby landmark'
            value={landmark}
            onChange={e => setLandmark(e.target.value)}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} justifyContent='space-between' style={{ marginTop: '20px' }}>
        <Grid item>
          <Button
            variant='contained'
            onClick={handleNext}
            endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' />}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default StepPersonalInfo
