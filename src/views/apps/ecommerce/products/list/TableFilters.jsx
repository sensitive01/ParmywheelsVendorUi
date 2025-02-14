// // React Imports
// import { useState, useEffect } from 'react'
// // MUI Imports
// import Grid from '@mui/material/Grid2'
// import CardContent from '@mui/material/CardContent'
// import FormControl from '@mui/material/FormControl'
// import InputLabel from '@mui/material/InputLabel'
// import MenuItem from '@mui/material/MenuItem'
// import Select from '@mui/material/Select'
// // Vars
// const productStockObj = {
//   'In Stock': true,
//   'Out of Stock': false
// }
// const TableFilters = ({ setData, productData }) => {
//   // States
//   const [category, setCategory] = useState('')
//   const [stock, setStock] = useState('')
//   const [status, setStatus] = useState('')
//   useEffect(
//     () => {
//       const filteredData = productData?.filter(product => {
//         if (category && product.category !== category) return false
//         if (stock && product.stock !== productStockObj[stock]) return false
//         if (status && product.status !== status) return false
//         return true
//       })
//       setData(filteredData ?? [])
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [category, stock, status, productData]
//   )
//   return (
//     <CardContent>
//       <Grid container spacing={6}>
//         <Grid size={{ xs: 12, sm: 4 }}>
//           <FormControl fullWidth>
//             <InputLabel id='status-select'>Status</InputLabel>
//             <Select
//               fullWidth
//               id='select-status'
//               label='Status'
//               value={status}
//               onChange={e => setStatus(e.target.value)}
//               labelId='status-select'
//             >
//               <MenuItem value=''>Select Status</MenuItem>
//               <MenuItem value='Scheduled'>Scheduled</MenuItem>
//               <MenuItem value='Published'>Publish</MenuItem>
//               <MenuItem value='Inactive'>Inactive</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 4 }}>
//           <FormControl fullWidth>
//             <InputLabel id='category-select'>Category</InputLabel>
//             <Select
//               fullWidth
//               id='select-category'
//               value={category}
//               onChange={e => setCategory(e.target.value)}
//               label='Category'
//               labelId='category-select'
//             >
//               <MenuItem value=''>Select Category</MenuItem>
//               <MenuItem value='Accessories'>Accessories</MenuItem>
//               <MenuItem value='Home Decor'>Home Decor</MenuItem>
//               <MenuItem value='Electronics'>Electronics</MenuItem>
//               <MenuItem value='Shoes'>Shoes</MenuItem>
//               <MenuItem value='Office'>Office</MenuItem>
//               <MenuItem value='Games'>Games</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid size={{ xs: 12, sm: 4 }}>
//           <FormControl fullWidth>
//             <InputLabel id='stock-select'>Stock</InputLabel>
//             <Select
//               fullWidth
//               id='select-stock'
//               value={stock}
//               onChange={e => setStock(e.target.value)}
//               label='Stock'
//               labelId='stock-select'
//             >
//               <MenuItem value=''>Select Stock</MenuItem>
//               <MenuItem value='In Stock'>In Stock</MenuItem>
//               <MenuItem value='Out of Stock'>Out of Stock</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//       </Grid>
//     </CardContent>
//   )
// }
// export default TableFilters



// React Imports
import { useState, useEffect } from 'react'
// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

const TableFilters = ({ setData, bookingData }) => {
  const [vehicleType, setVehicleType] = useState('')
  const [sts, setSts] = useState('')
  const [status, setStatus] = useState('')
  const [bookingDate, setBookingDate] = useState('')

  useEffect(() => {
    const filteredData = bookingData?.filter(booking => {
      if (vehicleType && booking.vehicleType !== vehicleType) return false
      if (sts && booking.sts !== sts) return false
      if (status && booking.status !== status) return false
      if (bookingDate && booking.bookingDate !== bookingDate) return false
      return true
    })

    setData(filteredData ?? [])
  }, [vehicleType, sts, status, bookingDate, bookingData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id='vehicle-type-select'>Vehicle Type</InputLabel>
            <Select
              fullWidth
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              labelId='vehicle-type-select'
            >
              <MenuItem value=''>Select Vehicle Type</MenuItem>
              <MenuItem value='Car'>Car</MenuItem>
              <MenuItem value='Bike'>Bike</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id='sts-select'>STS</InputLabel>
            <Select
              fullWidth
              value={sts}
              onChange={e => setSts(e.target.value)}
              labelId='sts-select'
            >
              <MenuItem value=''>Select STS</MenuItem>
              <MenuItem value='Instant'>Instant</MenuItem>
              <MenuItem value='Subscription'>Subscription</MenuItem>
              <MenuItem value='Schedule'>Schedule</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Status</InputLabel>
            <Select
              fullWidth
              value={status}
              onChange={e => setStatus(e.target.value)}
              labelId='status-select'
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Approved'>Approved</MenuItem>
              <MenuItem value='Cancelled'>Cancelled</MenuItem>
              <MenuItem value='PARKED'>Parked</MenuItem>
              <MenuItem value='COMPLETED'>Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label='Booking Date'
            type='date'
            value={bookingDate}
            onChange={e => setBookingDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </CardContent>
  )
}


export default TableFilters
