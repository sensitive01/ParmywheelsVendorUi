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
import CustomIconButton from '@core/components/mui/IconButton'
import Stack from '@mui/material/Stack'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const amenitiesList = [
  'CCTV',
  'Wi-Fi',
  'Covered Parking',
  'Self Car Wash',
  'Charging',
  'Restroom',
  'Security',
  'Gated Parking',
  'Open Parking'
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
      const data = await response.json()
      if (data?.AmenitiesData) {
        setSavedData(data.AmenitiesData)
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error fetching amenities data:', error)
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

  const handleEdit = () => {
    if (savedData) {
      setAmenities(savedData.amenities || [])
      setParkingEntries(savedData.parkingEntries || [{ amount: '', text: '' }])
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

  const handleSubmit = async () => {
    const payload = {
      vendorId,
      amenities,
      parkingEntries: parkingEntries.map(({ amount, text }) => ({ amount, text }))
    }

    try {
      const url = isEditMode
        ? `${API_URL}/vendor/updateamenitiesdata/${vendorId}`
        : `${API_URL}/vendor/amenities`
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      if (data?.AmenitiesData) {
        setSavedData(data.AmenitiesData)
        setShowForm(false)
        setIsEditMode(false)
        fetchAmenitiesData()
      }
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  const renderDataView = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent>
            <div>Loading...</div>
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
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
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
                    {savedData.amenities.map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        color="primary"
                        variant="outlined"
                        style={{ padding: '15px', fontSize: '1rem' }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Services & Pricing" />
                <CardContent>
                  <div style={{ height: 400, width: '100%' }}>
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
      <CardHeader title={isEditMode ? 'Edit Variants & Amenities' : 'Variants & Amenities'} />
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
                    {selected.map(value => (
                      <Chip key={value} label={value} color='primary' />
                    ))}
                  </div>
                )}
              >
                {amenitiesList.map(amenity => (
                  <MenuItem key={amenity} value={amenity}>
                    <Checkbox checked={amenities.indexOf(amenity) > -1} />
                    <ListItemText primary={amenity} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {parkingEntries.map((entry, index) => (
            <Grid key={index} item xs={12} className='repeater-item'>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Service Name'
                    value={entry.text}
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
                      value={entry.amount}
                      onChange={e => handleParkingEntryChange(index, 'amount', e.target.value)}
                      placeholder='Enter Amount'
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
            >
              Add Another Option
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-start">
              <Button variant='contained' color='success' onClick={handleSubmit}>
                {isEditMode ? 'Update' : 'Submit'} Data
              </Button>
              <Button variant='outlined' color='secondary' onClick={handleCancel}>
                Cancel
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  return showForm ? renderForm() : renderDataView()
}

export default ProductVariants
