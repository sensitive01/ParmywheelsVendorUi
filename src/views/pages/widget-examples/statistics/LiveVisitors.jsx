// 'use client'
// // MUI Imports
// import { useEffect, useState } from 'react'
// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// // Components Imports
// import OptionMenu from '@core/components/option-menu'
// import CustomAvatar from '@core/components/mui/Avatar'
// import axios from 'axios'
// import { useSession } from 'next-auth/react'
// // Vars
// const Sales = () => {
//   const [data, setData] = useState([
//     { stats: '0', color: 'success', title: 'Available Slots', icon: 'ri-database-2-line' },
//     { stats: '0', color: 'warning', title: 'Car Slots', icon: 'ri-car-line' },
//     { stats: '0', color: 'info', title: 'Bike Slots', icon: 'ri-motorbike-line' },
//     { stats: '0', color: 'primary', title: 'Other Slots', icon: 'ri-user-star-line' }
//   ])
//  const API_URL = process.env.NEXT_PUBLIC_API_URL
//   const { data: session } = useSession()
//   const vendorid = session?.user?.id
//   useEffect(() => {
//     if (!vendorid) return // Prevent API call if vendorid is undefined
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/vendor/fetch-slot-vendor-data/${vendorid}`)
//         const { totalCount, Cars, Bikes, Others } = response.data
//         setData([
//           { stats: totalCount, color: 'success', title: 'Available Slots', icon: 'ri-database-2-line' },
//           { stats: Cars, color: 'warning', title: 'Car Slots', icon: 'ri-car-line' },
//           { stats: Bikes, color: 'info', title: 'Bike Slots', icon: 'ri-motorbike-line' },
//           { stats: Others, color: 'primary', title: 'Other Slots', icon: 'ri-user-star-line' }
//         ])
//       } catch (error) {
//         console.error('Error fetching data:', error)
//       }
//     }
//     fetchData()
//   }, [vendorid])
//   return (
//     <Card>
//       <CardHeader
//         title='Total Slots'
//         action={<OptionMenu options={['Update']} />}
//         subheader={
//           <div className='flex items-center gap-2'>
//             <span>Total {data[0].stats} Slots Available</span>
//           </div>
//         }
//       />
//       <CardContent>
//         <div className='flex flex-wrap justify-between gap-4'>
//           {data.map((item, index) => (
//             <div key={index} className='flex items-center gap-3'>
//               <CustomAvatar variant='rounded' skin='light' color={item.color}>
//                 <i className={item.icon}></i>
//               </CustomAvatar>
//               <div>
//                 <Typography variant='h5'>{item.stats}</Typography>
//                 <Typography>{item.title}</Typography>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
// export default Sales
'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import { useSession } from 'next-auth/react'


// Components Imports
import EditIcon from '@mui/icons-material/Edit'

import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Vars
const Sales = () => {
  const [data, setData] = useState([
    { stats: '0', color: 'success', title: 'Available Slots', icon: 'ri-database-2-line' },
    { stats: '0', color: 'warning', title: 'Car Slots', icon: 'ri-car-line' },
    { stats: '0', color: 'info', title: 'Bike Slots', icon: 'ri-motorbike-line' },
    { stats: '0', color: 'primary', title: 'Other Slots', icon: 'ri-user-star-line' }
  ])

  const [openDialog, setOpenDialog] = useState(false)
  const [parkingEntries, setParkingEntries] = useState([])
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession()
  const vendorid = session?.user?.id

  useEffect(() => {
    if (!vendorid) return // Prevent API call if vendorid is undefined

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/vendor/fetch-slot-vendor-data/${vendorid}`)
        const { totalCount, Cars, Bikes, Others } = response.data

        setData([
          { stats: totalCount, color: 'success', title: 'Total Slots', icon: 'ri-database-2-line' },
          { stats: Cars, color: 'warning', title: 'Car Slots', icon: 'ri-car-line' },
          { stats: Bikes, color: 'info', title: 'Bike Slots', icon: 'ri-motorbike-line' },
          { stats: Others, color: 'primary', title: 'Other Slots', icon: 'ri-user-star-line' }
        ])

        // Set parkingEntries for dialog form
        setParkingEntries([
          { type: 'car', count: Cars || 0 },
          { type: 'bike', count: Bikes || 0 },
          { type: 'others', count: Others || 0 }
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [vendorid])


  // Open Dialog
  const handleOpenDialog = () => {
    setOpenDialog(true)
  }


  // Close Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }


  // Add New Parking Entry
  const handleAddParkingEntry = () => {
    setParkingEntries([...parkingEntries, { type: '', count: '' }])
  }


  // Remove Parking Entry
  const handleRemoveParkingEntry = (index) => {
    setParkingEntries(parkingEntries.filter((_, i) => i !== index))
  }


  // Handle Input Changes
  const handleInputChange = (index, field, value) => {
    const updatedEntries = [...parkingEntries]

    updatedEntries[index][field] = value
    setParkingEntries(updatedEntries)
  }

  const handleSubmit = async () => {
    try {
      const formattedEntries = parkingEntries.map(entry => ({
        type: entry.type === "car" ? "Cars" : entry.type === "bike" ? "Bikes" : "Others",
        count: entry.count.toString()  // Ensure count is always a string
      }));

      console.log("Formatted Payload:", JSON.stringify({ parkingEntries: formattedEntries }, null, 2)); // Debugging

      const response = await axios.put(
        `${API_URL}/vendor/update-parking-entries-vendor-data/${vendorid}`,
        { parkingEntries: formattedEntries }
      );

      alert("Vendor details updated successfully!");
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating vendor details:", error.response?.data || error.message);
    }
  };

  
return (
    <Card>
      <CardHeader
        title='Total Slots'
        action={<Button variant="contained" startIcon={<EditIcon />}
          onClick={handleOpenDialog}>Update</Button>}
        subheader={<div className='flex items-center gap-2'><span>Total {data[0].stats} Slots Available</span></div>}
      />
      <CardContent>
        <div className='flex flex-wrap justify-between gap-4'>
          {data.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color={item.color}>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{item.stats}</Typography>
                <Typography>{item.title}</Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {/* Dialog for Updating Vendor Details */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          Update Parking Entries
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {parkingEntries.map((entry, index) => (
              <Grid key={index} item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Parking Type</InputLabel>
                      <Select
                        value={entry.type}
                        onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                      >
                        <MenuItem value="bike">Bike</MenuItem>
                        <MenuItem value="car">Car</MenuItem>
                        <MenuItem value="others">Others</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <div className="flex items-center gap-8">
                      <TextField
                        label="Count"
                        type="number"
                        value={entry.count}
                        onChange={(e) => handleInputChange(index, 'count', e.target.value)}
                        fullWidth
                      />
                      {index > 0 && (
                        <IconButton onClick={() => handleRemoveParkingEntry(index)} color='error'>
                          <CloseIcon />
                        </IconButton>
                      )}
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Button variant="contained" onClick={handleAddParkingEntry} startIcon={<i className="ri-add-line" />} sx={{ mt: 2 }}>
            Add Another Option
          </Button>
        </DialogContent>
        <br/>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="success" startIcon={<EditIcon />}
            onClick={handleSubmit}>Update Vendor Details</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default Sales
