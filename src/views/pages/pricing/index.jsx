// // 'use client'
// // // React Imports
// // import { useState } from 'react'
// // import { useSession } from 'next-auth/react'
// // import axios from 'axios'
// // // MUI Imports
// // import Grid from '@mui/material/Grid'
// // import Card from '@mui/material/Card'
// // import CardHeader from '@mui/material/CardHeader'
// // import CardContent from '@mui/material/CardContent'
// // import Button from '@mui/material/Button'
// // import TextField from '@mui/material/TextField'
// // import FormControl from '@mui/material/FormControl'
// // import InputLabel from '@mui/material/InputLabel'
// // import MenuItem from '@mui/material/MenuItem'
// // import Select from '@mui/material/Select'
// // import Chip from '@mui/material/Chip'
// // import Checkbox from '@mui/material/Checkbox'
// // import ListItemText from '@mui/material/ListItemText'
// // // Components Imports
// // import CustomIconButton from '@core/components/mui/IconButton'
// // const API_URL = process.env.NEXT_PUBLIC_API_URL
// // const amenitiesList = [
// //   'CCTV',
// //   'Wi-Fi',
// //   'Covered Parking',
// //   'Self Car Wash',
// //   'Charging',
// //   'Restroom',
// //   'Security',
// //   'Gated Parking',
// //   'Open Parking'
// // ]
// // const ProductVariants = () => {
// //   // States
// //   const [count, setCount] = useState(1)
// //   const [amenities, setAmenities] = useState([])
// //   const [parkingEntries, setParkingEntries] = useState([{ amount: '', text: '' }])
// //   const { data: session } = useSession()
// //   const vendorId = session?.user?.id
// //   const handleAmenitiesChange = event => {
// //     setAmenities(event.target.value)
// //   }
// //   const handleParkingEntryChange = (index, field, value) => {
// //     const updatedEntries = [...parkingEntries]
// //     updatedEntries[index][field] = value
// //     setParkingEntries(updatedEntries)
// //   }
// //   const addParkingEntry = () => {
// //     setParkingEntries([...parkingEntries, { amount: '', text: '' }])
// //   }
// //   const deleteParkingEntry = index => {
// //     const updatedEntries = parkingEntries.filter((_, i) => i !== index)
// //     setParkingEntries(updatedEntries)
// //   }
// //   const deleteForm = e => {
// //     e.preventDefault()
// //     e.target.closest('.repeater-item')?.remove()
// //   }
// //   const handleSubmit = async () => {
// //     const payload = {
// //       vendorId, // Replace with actual vendor ID
// //       amenities,
// //       parkingEntries
// //     }
// //     try {
// //       const response = await fetch(`${API_URL}/vendor/amenities`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(payload)
// //       })
// //       console.log('Response:', response.data)
// //     } catch (error) {
// //       console.error('Error submitting data:', error)
// //     }
// //   }
// //   return (
// //     <Card>
// //       <CardHeader title='Variants & Amenities' />
// //       <CardContent>
// //         <Grid container spacing={6}>
// //           <Grid item xs={12}>
// //             <FormControl fullWidth>
// //               <InputLabel>Amenities</InputLabel>
// //               <Select
// //                 multiple
// //                 value={amenities}
// //                 onChange={handleAmenitiesChange}
// //                 renderValue={selected => (
// //                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// //                     {selected.map(value => (
// //                       <Chip key={value} label={value} color='primary' />
// //                     ))}
// //                   </div>
// //                 )}
// //               >
// //                 {amenitiesList.map(amenity => (
// //                   <MenuItem key={amenity} value={amenity}>
// //                     <Checkbox checked={amenities.indexOf(amenity) > -1} />
// //                     <ListItemText primary={amenity} />
// //                   </MenuItem>
// //                 ))}
// //               </Select>
// //             </FormControl>
// //           </Grid>
// //           {parkingEntries.map((entry, index) => (
// //             <Grid key={index} item xs={12} className='repeater-item'>
// //               <Grid container spacing={6}>
// //                 <Grid item xs={12} sm={4}>
// //                   <TextField
// //                     fullWidth
// //                     label='Service Name'
// //                     value={entry.text}
// //                     onChange={e => handleParkingEntryChange(index, 'text', e.target.value)}
// //                     placeholder='Enter Service Name' />
// //                 </Grid>
// //                 <Grid item xs={12} sm={8}>
// //                   <div className='flex items-center gap-6'>
// //                     <TextField fullWidth label='Amount'
// //                       type='number'
// //                       value={entry.amount}
// //                       onChange={e => handleParkingEntryChange(index, 'amount', e.target.value)}
// //                       placeholder='Enter Amount'
// //                     />
// //                     <CustomIconButton onClick={deleteForm} className='min-is-fit'>
// //                       <i className='ri-close-line' />
// //                     </CustomIconButton>
// //                   </div>
// //                 </Grid>
// //               </Grid>
// //             </Grid>
// //           ))}
// //           <Grid item xs={12}>
// //             <Button variant='contained' onClick={() => setCount(count + 1)} startIcon={<i className='ri-add-line' />}>
// //               Add Another Option
// //             </Button>
// //           </Grid>
// //           <Grid item xs={12}>
// //             <Button variant='contained' color='success' onClick={handleSubmit}>
// //               Submit Data
// //             </Button>
// //           </Grid>
// //         </Grid>
// //       </CardContent>
// //     </Card>
// //   )
// // }
// // export default ProductVariants
// 'use client'
// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// // MUI Imports
// import Grid from '@mui/material/Grid'
// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import TextField from '@mui/material/TextField'
// import FormControl from '@mui/material/FormControl'
// import InputLabel from '@mui/material/InputLabel'
// import MenuItem from '@mui/material/MenuItem'
// import Select from '@mui/material/Select'
// import Chip from '@mui/material/Chip'
// import Checkbox from '@mui/material/Checkbox'
// import ListItemText from '@mui/material/ListItemText'
// import Paper from '@mui/material/Paper'
// import Table from '@mui/material/Table'
// import TableBody from '@mui/material/TableBody'
// import TableCell from '@mui/material/TableCell'
// import TableContainer from '@mui/material/TableContainer'
// import TableHead from '@mui/material/TableHead'
// import TableRow from '@mui/material/TableRow'
// import IconButton from '@mui/material/IconButton'
// import EditIcon from '@mui/icons-material/Edit'
// // Components Imports
// import CustomIconButton from '@core/components/mui/IconButton'
// const API_URL = process.env.NEXT_PUBLIC_API_URL
// const amenitiesList = [
//   'CCTV',
//   'Wi-Fi',
//   'Covered Parking',
//   'Self Car Wash',
//   'Charging',
//   'Restroom',
//   'Security',
//   'Gated Parking',
//   'Open Parking'
// ]
// const ProductVariants = () => {
//   // States
//   const [count, setCount] = useState(1)
//   const [amenities, setAmenities] = useState([])
//   const [parkingEntries, setParkingEntries] = useState([{ amount: '', text: '' }])
//   const [showForm, setShowForm] = useState(true)
//   const [savedData, setSavedData] = useState(null)
//   const [isEditMode, setIsEditMode] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)
//   const { data: session } = useSession()
//   const vendorId = session?.user?.id
//   useEffect(() => {
//     if (vendorId) {
//       fetchAmenitiesData()
//     }
//   }, [vendorId])
//   const fetchAmenitiesData = async () => {
//     setIsLoading(true)
//     try {
//       const response = await fetch(`${API_URL}/vendor/getamenitiesdata/${vendorId}`)
//       const data = await response.json()
//       if (data?.AmenitiesData) {
//         setSavedData(data.AmenitiesData)
//         setShowForm(false)
//       }
//     } catch (error) {
//       console.error('Error fetching amenities data:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }
//   const handleAmenitiesChange = event => {
//     setAmenities(event.target.value)
//   }
//   const handleParkingEntryChange = (index, field, value) => {
//     const updatedEntries = [...parkingEntries]
//     updatedEntries[index][field] = value
//     setParkingEntries(updatedEntries)
//   }
//   const addParkingEntry = () => {
//     setParkingEntries([...parkingEntries, { amount: '', text: '' }])
//   }
//   const deleteParkingEntry = index => {
//     const updatedEntries = parkingEntries.filter((_, i) => i !== index)
//     setParkingEntries(updatedEntries)
//   }
//   const handleEdit = () => {
//     if (savedData) {
//       setAmenities(savedData.amenities || [])
//       setParkingEntries(savedData.parkingEntries || [{ amount: '', text: '' }])
//       setIsEditMode(true)
//       setShowForm(true)
//     }
//   }
//   const handleSubmit = async () => {
//     const payload = {
//       vendorId,
//       amenities,
//       parkingEntries: parkingEntries.map(({ amount, text }) => ({ amount, text })) // Only send required fields
//     }
//     try {
//       const url = isEditMode
//         ? `${API_URL}/vendor/updateamenitiesdata/${vendorId}`
//         : `${API_URL}/vendor/amenities`
//       const response = await fetch(url, {
//         method: isEditMode ? 'PUT' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       })
//       const data = await response.json()
//       if (data?.AmenitiesData) {
//         setSavedData(data.AmenitiesData)
//         setShowForm(false)
//         setIsEditMode(false)
//         // Refresh the data after submission
//         fetchAmenitiesData()
//       }
//     } catch (error) {
//       console.error('Error submitting data:', error)
//     }
//   }
//   const renderDataView = () => {
//     if (isLoading) {
//       return (
//         <Card>
//           <CardContent>
//             <div>Loading...</div>
//           </CardContent>
//         </Card>
//       )
//     }
//     if (!savedData) {
//       return (
//         <Card>
//           <CardContent>
//             <div>No data available. Please add amenities and services.</div>
//           </CardContent>
//         </Card>
//       )
//     }
//     return (
//       <Card>
//         <CardHeader
//           title='Amenities & Services'
//           action={
//             <Button
//               variant="contained"
//               color="primary"
//               startIcon={<EditIcon />}
//               onClick={handleEdit}
//             >
//               Edit
//             </Button>
//           }
//         />
//         <CardContent>
//           <Grid container spacing={4}>
//             <Grid item xs={12}>
//               <Paper>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Available Amenities</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       <TableRow>
//                         <TableCell>
//                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//                             {savedData.amenities.map((amenity) => (
//                               <Chip key={amenity} label={amenity} color="primary" />
//                             ))}
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             </Grid>
//             <Grid item xs={12}>
//               <Paper>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Service Name</TableCell>
//                         <TableCell>Amount</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {savedData.parkingEntries.map((entry) => (
//                         <TableRow key={entry._id}>
//                           <TableCell>{entry.text}</TableCell>
//                           <TableCell>{entry.amount}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </Paper>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>
//     )
//   }
//   const renderForm = () => (
//     <Card>
//       <CardHeader title={isEditMode ? 'Edit Variants & Amenities' : 'Variants & Amenities'} />
//       <CardContent>
//         <Grid container spacing={6}>
//           <Grid item xs={12}>
//             <FormControl fullWidth>
//               <InputLabel>Amenities</InputLabel>
//               <Select
//                 multiple
//                 value={amenities}
//                 onChange={handleAmenitiesChange}
//                 renderValue={selected => (
//                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//                     {selected.map(value => (
//                       <Chip key={value} label={value} color='primary' />
//                     ))}
//                   </div>
//                 )}
//               >
//                 {amenitiesList.map(amenity => (
//                   <MenuItem key={amenity} value={amenity}>
//                     <Checkbox checked={amenities.indexOf(amenity) > -1} />
//                     <ListItemText primary={amenity} />
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
//           {parkingEntries.map((entry, index) => (
//             <Grid key={index} item xs={12} className='repeater-item'>
//               <Grid container spacing={6}>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     label='Service Name'
//                     value={entry.text}
//                     onChange={e => handleParkingEntryChange(index, 'text', e.target.value)}
//                     placeholder='Enter Service Name'
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={8}>
//                   <div className='flex items-center gap-6'>
//                     <TextField
//                       fullWidth
//                       label='Amount'
//                       type='number'
//                       value={entry.amount}
//                       onChange={e => handleParkingEntryChange(index, 'amount', e.target.value)}
//                       placeholder='Enter Amount'
//                     />
//                     {parkingEntries.length > 1 && (
//                       <CustomIconButton onClick={() => deleteParkingEntry(index)} className='min-is-fit'>
//                         <i className='ri-close-line' />
//                       </CustomIconButton>
//                     )}
//                   </div>
//                 </Grid>
//               </Grid>
//             </Grid>
//           ))}
//           <Grid item xs={12}>
//             <Button
//               variant='contained'
//               onClick={addParkingEntry}
//               startIcon={<i className='ri-add-line' />}
//             >
//               Add Another Option
//             </Button>
//           </Grid>
//           <Grid item xs={12}>
//             <Button variant='contained' color='success' onClick={handleSubmit}>
//               {isEditMode ? 'Update' : 'Submit'} Data
//             </Button>
//           </Grid>
//         </Grid>
//       </CardContent>
//     </Card>
//   )
//   return showForm ? renderForm() : renderDataView()
// }
// export default ProductVariants
// // // MUI Imports
// // import Card from '@mui/material/Card'
// // import CardContent from '@mui/material/CardContent'
// // // Component Imports
// // import Pricing from '@components/pricing'
// // const PricingPage = ({ data }) => {
// //   return (
// //     <Card>
// //       <CardContent className='xl:!plb-16 xl:pli-[6.25rem] pbs-10 pbe-5 pli-5 sm:p-16'>
// //         <Pricing data={data} />
// //       </CardContent>
// //     </Card>
// //   )
// // }
// // export default PricingPage




'use client'
import { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'
import { DataGrid } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import EditIcon from '@mui/icons-material/Edit'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import CustomIconButton from '@core/components/mui/IconButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const amenitiesWithIcons = [
  { name: 'CCTV', icon: 'ri-camera-line' },
  { name: 'Wi-Fi', icon: 'ri-wifi-line' },
  { name: 'Covered Parking', icon: 'ri-caravan-line' },
  { name: 'Self Car Wash', icon: 'ri-car-washing-line' },
  { name: 'Charging', icon: 'ri-flashlight-line' },
  { name: 'Restroom', icon: 'ri-user-2-line' },
  { name: 'Security', icon: 'ri-shield-check-line' },
  { name: 'Gated Parking', icon: 'ri-parking-line' },
  { name: 'Open Parking', icon: 'ri-tree-line' }
]

const ProductVariants = () => {
  // States
  const [count, setCount] = useState(1)
  const [amenities, setAmenities] = useState([])
  const [parkingEntries, setParkingEntries] = useState([{ amount: '', text: '' }])
  const [showForm, setShowForm] = useState(true)
  const [savedData, setSavedData] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  const [customAmenityDialogOpen, setCustomAmenityDialogOpen] = useState(false)
  const [customAmenityInput, setCustomAmenityInput] = useState('')
  const [amenitiesList, setAmenitiesList] = useState(amenitiesWithIcons)
  
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  // DataGrid columns configuration
  const parkingColumns = [
    { 
      field: 'text', 
      headerName: 'Service Name', 
      flex: 1,
      renderCell: (params) => (
        <div style={{ fontWeight: 500 }}>{params.value}</div>
      )
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      flex: 1,
      renderCell: (params) => (
        <div style={{ color: '#2196f3', fontWeight: 500 }}>
          ₹{params.value}
        </div>
      )
    }
  ]

  useEffect(() => {
    if (vendorId) {
      fetchAmenitiesData()
    }
  }, [vendorId])

  const fetchAmenitiesData = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/vendor/getamenitiesdata/${vendorId}`)
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
      
      const data = await response.json()

      if (data?.AmenitiesData || data?.updatedAmenitiesData) {
        const amenitiesData = data?.AmenitiesData || data?.updatedAmenitiesData
        setSavedData(amenitiesData)
        setShowForm(false)
        
        // Add any custom amenities from saved data to the list
        if (amenitiesData.amenities) {
          const customAmenities = amenitiesData.amenities.filter(
            amenity => !amenitiesWithIcons.some(a => a.name === amenity)
          ).map(amenity => ({ name: amenity, icon: 'ri-checkbox-blank-circle-line' }))
          
          if (customAmenities.length > 0) {
            setAmenitiesList([...amenitiesWithIcons, ...customAmenities])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching amenities data:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load amenities data: ' + error.message,
        severity: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmenitiesChange = event => {
    setAmenities(event.target.value)
  }

  const handleParkingEntryChange = (index, field, value) => {
    const updatedEntries = [...parkingEntries]
    updatedEntries[index][field] = value
    setParkingEntries(updatedEntries)
  }

  const addParkingEntry = () => {
    setParkingEntries([...parkingEntries, { amount: '', text: '' }])
  }

  const deleteParkingEntry = index => {
    const updatedEntries = parkingEntries.filter((_, i) => i !== index)
    setParkingEntries(updatedEntries)
  }

  const canAddAnotherService = () => {
    // Check if all current entries have both text and amount filled
    return parkingEntries.every(entry => entry.text.trim() && entry.amount)
  }

  const handleEdit = () => {
    if (savedData) {
      setAmenities(savedData.amenities || [])
      setParkingEntries(savedData.parkingEntries?.length > 0 
        ? savedData.parkingEntries 
        : [{ amount: '', text: '' }]
      )
      setIsEditMode(true)
      setShowForm(true)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setIsEditMode(false)

    // Reset form data to saved state
    if (savedData) {
      setAmenities(savedData.amenities || [])
      setParkingEntries(savedData.parkingEntries || [{ amount: '', text: '' }])
    }
  }

  // Function to update amenities only
  const updateAmenities = async () => {
    try {
      const amenitiesPayload = {
        vendorId,
        amenities
      }
      
      console.log('Submitting amenities payload:', amenitiesPayload)
      
      let url = isEditMode
        ? `${API_URL}/vendor/updateamenitiesdata/${vendorId}`
        : `${API_URL}/vendor/amenities`
      
      const amenitiesResponse = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amenitiesPayload),
        credentials: 'include'
      })
      
      if (!amenitiesResponse.ok) {
        throw new Error(`Server responded with status: ${amenitiesResponse.status}`)
      }
      
      const amenitiesData = await amenitiesResponse.json()
      console.log('Amenities update response:', amenitiesData)
      
      return amenitiesData
    } catch (error) {
      console.error('Error updating amenities:', error)
      throw error
    }
  }
  
  // Function to update parking entries only
  const updateParkingEntries = async () => {
    try {
      // Validate parking entries
      if (parkingEntries.some(entry => !entry.text || !entry.amount)) {
        throw new Error('Please fill in all service name and amount fields')
      }
      
      const parkingPayload = {
        vendorId,
        parkingEntries
      }
      
      console.log('Submitting parking entries payload:', parkingPayload)
      
      let url = isEditMode
        ? `${API_URL}/vendor/updateparkingentries/${vendorId}`
        : `${API_URL}/vendor/parkingentries`
      
      const parkingResponse = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parkingPayload),
        credentials: 'include'
      })
      
      if (!parkingResponse.ok) {
        throw new Error(`Server responded with status: ${parkingResponse.status}`)
      }
      
      const parkingData = await parkingResponse.json()
      console.log('Parking entries update response:', parkingData)
      
      return parkingData
    } catch (error) {
      console.error('Error updating parking entries:', error)
      throw error
    }
  }

  // Function to create both amenities and parking entries (for new data)
  const createAmenitiesAndServices = async () => {
    try {
      // Validate data
      if (parkingEntries.some(entry => !entry.text || !entry.amount)) {
        throw new Error('Please fill in all service name and amount fields')
      }
      
      const payload = {
        vendorId,
        amenities,
        parkingEntries: parkingEntries.map(({ amount, text }) => ({ amount, text }))
      }
      
      console.log('Creating new amenities and services:', payload)
      
      const response = await fetch(`${API_URL}/vendor/amenities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Create response:', data)
      
      return data
    } catch (error) {
      console.error('Error creating amenities and services:', error)
      throw error
    }
  }

  const handleSubmit = async () => {
    // Validate form
    if (parkingEntries.some(entry => !entry.text || !entry.amount)) {
      setSnackbar({
        open: true,
        message: 'Please fill in all service name and amount fields',
        severity: 'error'
      })
      return
    }
    
    setUpdateLoading(true)
    
    try {
      let result
      
      if (isEditMode) {
        // Update mode - call both APIs separately
        const amenitiesResult = await updateAmenities()
        const parkingResult = await updateParkingEntries()
        
        // Use the amenities result as our main result
        result = amenitiesResult
      } else {
        // Create mode - use the combined endpoint
        result = await createAmenitiesAndServices()
      }
      
      // Handle successful update/create
      if (result?.AmenitiesData || result?.updatedAmenitiesData) {
        const updatedData = result?.AmenitiesData || result?.updatedAmenitiesData
        setSavedData(updatedData)
        setShowForm(false)
        setIsEditMode(false)
        
        setSnackbar({
          open: true,
          message: isEditMode 
            ? 'Amenities and services updated successfully!' 
            : 'Amenities and services created successfully!',
          severity: 'success'
        })
        
        // Refresh data to ensure consistency
        await fetchAmenitiesData()
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save data',
        severity: 'error'
      })
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleOpenCustomAmenityDialog = () => {
    setCustomAmenityDialogOpen(true)
  }

  const handleCloseCustomAmenityDialog = () => {
    setCustomAmenityDialogOpen(false)
    setCustomAmenityInput('')
  }

  const handleAddCustomAmenity = () => {
    if (customAmenityInput.trim()) {
      const newAmenity = { 
        name: customAmenityInput.trim(), 
        icon: 'ri-checkbox-blank-circle-line' 
      }
      
      // Add to the amenities list if not already present
      if (!amenitiesList.some(a => a.name === newAmenity.name)) {
        setAmenitiesList([...amenitiesList, newAmenity])
      }
      
      // Add to selected amenities if not already selected
      if (!amenities.includes(newAmenity.name)) {
        setAmenities([...amenities, newAmenity.name])
      }
      
      handleCloseCustomAmenityDialog()
    }
  }

  const renderDataView = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </CardContent>
        </Card>
      )
    }

    if (!savedData) {
      return (
        <Card>
          <CardContent>
            <div>No data available. Please add amenities and services.</div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader
          title='Amenities & Services'
          sx={{ bgcolor: 'primary.main' }}
          titleTypographyProps={{ color: 'common.white' }}
          action={
            <Button
              variant="contained"
             color='success' 
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ m: 1 }}
            >
              Edit
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Available Amenities" />
                <CardContent>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {savedData.amenities?.length > 0 ? (
                      savedData.amenities.map((amenity) => {
                        const amenityData = amenitiesList.find(a => a.name === amenity) || { name: amenity, icon: 'ri-checkbox-blank-circle-line' }
                        return (
                          <Chip
                            key={amenity}
                            label={amenity}
                            color="primary"
                            variant="outlined"
                            style={{ padding: '15px', fontSize: '1rem' }}
                            icon={<i className={amenityData.icon} style={{ marginLeft: '8px' }} />}
                          />
                        )
                      })
                    ) : (
                      <p>No amenities added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Services & Pricing" />
                <CardContent>
                  {savedData.parkingEntries?.length > 0 ? (
                    <div style={{ height: 'auto', width: '100%' }}>
                      <DataGrid
                        rows={savedData.parkingEntries.map((entry, index) => ({
                          id: index,
                          ...entry
                        }))}
                        columns={parkingColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        disableSelectionOnClick
                        autoHeight
                        sx={{
                          '& .MuiDataGrid-cell:hover': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <p>No services added yet</p>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  const renderForm = () => (
    <Card>
      <CardHeader 
        title={isEditMode ? 'Edit Amenities & Services' : 'Add Amenities & Services'} 
        sx={{ bgcolor: 'primary.main' }}
        titleTypographyProps={{ color: 'common.white' }}
      />
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Amenities</InputLabel>
              <Select
                multiple
                value={amenities}
                onChange={handleAmenitiesChange}
                renderValue={selected => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selected.map(value => {
                      const amenityData = amenitiesList.find(a => a.name === value) || { name: value, icon: 'ri-checkbox-blank-circle-line' }
                      return (
                        <Chip 
                          key={value} 
                          label={value} 
                          color='primary'
                          icon={<i className={amenityData.icon} />}
                        />
                      )
                    })}
                  </div>
                )}
              >
                {amenitiesList.map(amenity => (
                  <MenuItem key={amenity.name} value={amenity.name}>
                    <Checkbox checked={amenities.indexOf(amenity.name) > -1} />
                    <i className={amenity.icon} style={{ marginRight: '8px' }} />
                    <ListItemText primary={amenity.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant='outlined'
              onClick={handleOpenCustomAmenityDialog}
              sx={{ mt: 2 }}
              startIcon={<i className='ri-add-line' />}
            >
              Add Custom Amenity
            </Button>
          </Grid>
          {parkingEntries.map((entry, index) => (
            <Grid key={index} item xs={12} className='repeater-item'>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Service Name'
                    value={entry.text || ''}
                    onChange={e => handleParkingEntryChange(index, 'text', e.target.value)}
                    placeholder='Enter Service Name'
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <div className='flex items-center gap-6'>
                    <TextField
                      fullWidth
                      label='Amount'
                      type='number'
                      value={entry.amount || ''}
                      onChange={e => handleParkingEntryChange(index, 'amount', e.target.value)}
                      placeholder='Enter Amount'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>₹</InputAdornment>
                      }}
                    />
                    {parkingEntries.length > 1 && (
                      <CustomIconButton onClick={() => deleteParkingEntry(index)} className='min-is-fit'>
                        <i className='ri-close-line' />
                      </CustomIconButton>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant='contained'
              onClick={addParkingEntry}
              startIcon={<i className='ri-add-line' />}
              disabled={!canAddAnotherService()}
            >
              Add Another Service
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-start">
              <Button 
                variant='contained' 
                color='success' 
                onClick={handleSubmit}
                disabled={updateLoading || !canAddAnotherService()}
              >
                {updateLoading ? (
                  <>
                    {isEditMode ? 'Updating...' : 'Submitting...'} 
                    <CircularProgress size={24} sx={{ ml: 1, color: 'white' }} />
                  </>
                ) : (
                  isEditMode ? 'Update' : 'Submit'
                )}
              </Button>
              <Button variant='outlined' color='secondary' onClick={handleCancel} disabled={updateLoading}>
                Cancel
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>

      {/* Custom Amenity Dialog */}
      <Dialog open={customAmenityDialogOpen} onClose={handleCloseCustomAmenityDialog}>
        <DialogTitle>Add Custom Amenity</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amenity Name"
            type="text"
            fullWidth
            variant="standard"
            value={customAmenityInput}
            onChange={(e) => setCustomAmenityInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCustomAmenityDialog}>Cancel</Button>
          <Button onClick={handleAddCustomAmenity} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )

  return showForm ? renderForm() : renderDataView()
}

export default ProductVariants
