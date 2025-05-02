'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// MUI Imports
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Container from '@mui/material/Container'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import CircularProgress from '@mui/material/CircularProgress'

// Icon Imports
import SearchIcon from '@mui/icons-material/Search'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Grid } from '@mui/material'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const VendorSearchScreen = () => {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [filteredData, setFilteredData] = useState([])
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const vendorId = session?.user?.id

  const fetchData = async () => {
    if (!vendorId) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const result = await response.json()

      if (result && result.bookings) {
        // Filter and map only the required fields
        const filteredBookings = result.bookings
          .filter(booking => ["pending", "approved", "cancelled", "parked", "completed"]
            .includes(booking.status.toLowerCase()))
          .map(booking => ({
            sts: booking.sts,
            parkingDate: booking.parkingDate,
            parkingTime: booking.parkingTime,
            vehicleNumber: booking.vehicleNumber,
            status: booking.status,
            // Include minimal other fields needed for display
            vehicleType: booking.vehicleType,
            bookingDate: booking.bookingDate,
            bookingTime: booking.bookingTime,
            exitvehicledate: booking.exitvehicledate,
            exitvehicletime: booking.exitvehicletime
          }))
        
        setData(filteredBookings)
        setFilteredData(filteredBookings)
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredData(data)
      return
    }
    
    const filtered = data.filter(booking => {
      const vehicleNumber = booking.vehicleNumber?.toString().toLowerCase() || ''
      return vehicleNumber.includes(query.toLowerCase())
    })
    
    setFilteredData(filtered)
  }

  useEffect(() => {
    fetchData()
  }, [vendorId])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <>
      {/* <AppBar position="static" sx={{ bgcolor: '#f5f5f5' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            sx={{ color: 'black', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'black', fontSize: 18, fontWeight: 500 }}>
            Vehicle Search
          </Typography>
        </Toolbar>
      </AppBar> */}
      
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box sx={{ mb: 3, mt: 1 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by vehicle number"
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 40,
                bgcolor: '#ffffff',
                '& fieldset': {
                  borderColor: '#329a73',
                  borderWidth: 0.5,
                },
                '&:hover fieldset': {
                  borderColor: '#329a73',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#329a73',
                },
              },
              '& .MuiInputBase-input': {
                px: 1.5,
                py: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#329a73' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {filteredData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <Typography>
              {searchQuery ? 'No bookings found for this vehicle number' : 'No bookings available'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredData.map((booking, index) => (
              <Card key={index} sx={{ borderRadius: '8px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: booking.status === 'Cancelled' ? 'error.main' : '#329a73' }}>
                      {booking.vehicleNumber || 'N/A'}
                    </Typography>
                    <Typography sx={{ 
                      color: booking.status.toLowerCase() === 'cancelled' ? 'error.main' : 
                            booking.status.toLowerCase() === 'completed' ? 'success.main' : '#329a73', 
                      fontWeight: 'bold' 
                    }}>
                      {booking.status}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      bgcolor: booking.status.toLowerCase() === 'cancelled' ? 'error.main' : '#329a73',
                      color: 'white',
                      borderRadius: '4px',
                      p: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      mr: 1
                    }}>
                      {booking.vehicleType === "Car" ? 
                        <DirectionsCarIcon sx={{ fontSize: 20 }} /> : 
                        <TwoWheelerIcon sx={{ fontSize: 20 }} />
                      }
                    </Box>
                    <Typography variant="body2">
                      {booking.vehicleType || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Schedule Type: {booking.sts || 'N/A'}
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Parking Date:</Typography>
                      <Typography variant="body2">{booking.parkingDate || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Parking Time:</Typography>
                      <Typography variant="body2">{booking.parkingTime || 'N/A'}</Typography>
                    </Grid>
                    {/* {booking.status.toLowerCase() === 'completed' && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Exit Date:</Typography>
                          <Typography variant="body2">{booking.exitvehicledate || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Exit Time:</Typography>
                          <Typography variant="body2">{booking.exitvehicletime || 'N/A'}</Typography>
                        </Grid>
                      </>
                    )} */}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </>
  )
}

export default VendorSearchScreen
