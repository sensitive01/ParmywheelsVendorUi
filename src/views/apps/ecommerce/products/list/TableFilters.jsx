
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
