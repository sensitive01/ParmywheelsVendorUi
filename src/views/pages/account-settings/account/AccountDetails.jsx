'use client'
import { useState, useRef, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'
import { Button, Card, CardContent, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import CustomIconButton from '@/@core/components/mui/IconButton';
import ProductImage from '../../../apps/ecommerce/products/add/ProductImage'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

const VendorRegistration = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null) // Store image URL for preview
  const [showMap, setShowMap] = useState(false)
  const [vendorName, setVendorName] = useState('')
  const [contacts, setContacts] = useState([{ id: 1, name: '', mobile: '' }])
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [parkingEntries, setParkingEntries] = useState([{ type: '', count: '' }])
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const autocompleteRef = useRef(null)


  // Load session data into form fields
  useEffect(() => {
    if (session?.user) {
      const user = session.user

      setVendorName(user.name || '')
      setAddress(user.address || '')
      setLatitude(user.latitude || '')
      setLongitude(user.longitude || '')
      setContacts(user.contacts || [{ id: 1, name: '', mobile: '' }])


      // **Load Image Preview**
      // ✅ Ensure correct image field
      // **Ensure correct image field is used**
      if (user.image || user.picture) {
        console.log('Image URL:', user.image || user.picture); // Debugging line
        setImagePreview(user.image || user.picture);
      } else {
        setImagePreview(null);
      }


      // **Ensure Parking Entries are Loaded**
      if (user.parkingEntries && Array.isArray(user.parkingEntries)) {
        setParkingEntries(user.parkingEntries)
      } else {
        setParkingEntries([{ type: '', count: '' }])
      }
    }
  }, [session])
  useEffect(() => {
    if (showMap && GOOGLE_MAPS_API_KEY) {
      if (!window.google) {
        const script = document.createElement('script')

        script.src = `https://maps.gomaps.pro/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.onload = initMap
        document.body.appendChild(script)
      } else {
        initMap()
      }
    }
  }, [showMap])

  const initMap = () => {
    const map = new window.google.maps.Map(mapRef.current, { center: { lat: 28.6139, lng: 77.209 }, zoom: 15 })

    markerRef.current = new window.google.maps.Marker({ position: map.getCenter(), map, draggable: true })
    const input = document.getElementById('autocomplete')

    autocompleteRef.current = new window.google.maps.places.Autocomplete(input)
    autocompleteRef.current.bindTo('bounds', map)
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()

      if (!place.geometry) return
      map.setCenter(place.geometry.location)
      markerRef.current.setPosition(place.geometry.location)
      setAddress(place.formatted_address)
      setLatitude(place.geometry.location.lat())
      setLongitude(place.geometry.location.lng())
    })
  }

  const handleAddContact = () => setContacts([...contacts, { id: contacts.length + 1, name: '', mobile: '' }])
  const handleRemoveContact = id => setContacts(contacts.filter(contact => contact.id !== id))
  const handleAddParkingEntry = () => setParkingEntries([...parkingEntries, { type: '', count: '' }])
  const handleRemoveParkingEntry = index => setParkingEntries(parkingEntries.filter((_, i) => i !== index))

  const handleSubmit = async () => {
    const vendorId = session?.user?.id

    if (!vendorId) {
      alert('User not logged in')
      
return
    }

    const formData = new FormData()

    formData.append('vendorName', vendorName)
    formData.append('address', address)
    formData.append('latitude', latitude)
    formData.append('longitude', longitude)
    formData.append('contacts', JSON.stringify(contacts))
    formData.append('parkingEntries', JSON.stringify(parkingEntries))

    if (image) {
      formData.append('image', image)
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/updatevendor/${vendorId}`, {
        method: 'PUT',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        alert('Vendor details updated successfully!')
        router.push('/') // Redirect after successful update
      } else {
        alert(result.message || 'Failed to update vendor')
      }
    } catch (error) {
      console.error('Error updating vendor:', error)
      alert('Something went wrong!')
    }
  }

  
return (
    <Card >
      <CardContent>
        <Typography variant='h4' className='mbe-1' align='center'>
          Update Vendor Details
        </Typography>
        <br />
        {/* Vendor Name Field */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Vendor Name'
              placeholder='John'
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
            />
          </Grid>
        </Grid>
        {/* Contact Repeater Block */}
        <Grid container spacing={3} style={{ marginTop: '10px' }}>
          {contacts.map((contact, index) => (
            <Grid item xs={12} key={contact.id} className='repeater-item'>
              <Grid container spacing={3} alignItems='center'>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label={`Contact Name ${index + 1}`} value={contact.name} onChange={e => {
                    const updatedContacts = [...contacts]

                    updatedContacts[index].name = e.target.value
                    setContacts(updatedContacts)
                  }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TextField fullWidth label={`Contact Number ${index + 1}`} value={contact.mobile} onChange={e => {
                      const updatedContacts = [...contacts]

                      updatedContacts[index].mobile = e.target.value
                      setContacts(updatedContacts)
                    }}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>IN (+91)</InputAdornment>
                      }}
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
            <Button variant='contained' onClick={handleAddContact} startIcon={<AddIcon />}>
              Add Another Contact
            </Button>
          </Grid>
        </Grid>
        {/* Address Field */}
        <Grid container spacing={3} style={{ marginTop: '10px' }}>
          <Grid item xs={12}>
            <TextField
              id='autocomplete'
              fullWidth
              label='Address'
              placeholder='Click to select address'
              value={address}
              onChange={e => setAddress(e.target.value)}
              onFocus={() => setShowMap(true)}
            />
          </Grid>
          {showMap && (
            <Grid item xs={12} style={{ marginBottom: '20px' }} >
              <div ref={mapRef} style={{ width: '100%', height: '300px', marginTop: '10px' }}></div>
              <Button onClick={() => setShowMap(false)} variant='contained' style={{ marginTop: '10px' }}>
                Confirm Address
              </Button>
            </Grid>
          )}
        </Grid>
        <Grid item xs={12} className="flex justify-center mb-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="User Image"
                style={{ width: 100, height: 100, borderRadius: '50%' }}
              />
            ) : (
              <Typography variant="body2">No Image Available</Typography>
            )}
          </Grid>
        <Grid item xs={12} style={{ marginBottom: '20px', marginTop: '20px' }}>
          <ProductImage
            onChange={(file) => {
              setImage(file);
            }}
          />
          

        </Grid>
        <Grid container spacing={2}>
          {/* Parking Entries */}
          <Grid item xs={12}>
            <Typography variant="body2" className="mb-2">Parking Entries</Typography>
            <Grid container spacing={2}> {/* Added spacing here for vertical gaps */}
              {parkingEntries.map((entry, index) => (
                <Grid key={index} item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Parking Type</InputLabel>
                        <Select
                          value={entry.type}
                          onChange={(e) => {
                            const updatedEntries = [...parkingEntries];

                            updatedEntries[index].type = e.target.value;
                            setParkingEntries(updatedEntries);
                          }}
                          label="Parking Type"
                        >
                          <MenuItem value="Cars">Cars</MenuItem>
                          <MenuItem value="Bikes">Bikes</MenuItem>
                          <MenuItem value="Others">Others</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <div className="flex items-center gap-8">
                        <TextField
                          label="Count"
                          value={entry.count}
                          onChange={(e) => {
                            const updatedEntries = [...parkingEntries];

                            updatedEntries[index].count = e.target.value;
                            setParkingEntries(updatedEntries);
                          }}
                          fullWidth
                        />
                        {index > 0 && (
                          <CustomIconButton onClick={() => handleRemoveParkingEntry(index)} color='error' className="min-is-fit">
                            <i className="ri-close-line" />
                          </CustomIconButton>
                        )}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <br />
            {/* Add another Parking Entry Button */}
            <Grid item xs={12} style={{ marginBottom: '20px' }}>
              <Button variant="contained" onClick={handleAddParkingEntry} startIcon={<i className="ri-add-line" />}>
                Add Another Option
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Update Vendor Details
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default VendorRegistration
