'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

// Material UI imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import Container from '@mui/material/Container'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Paper from '@mui/material/Paper'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import SaveIcon from '@mui/icons-material/Save'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AvTimerIcon from '@mui/icons-material/AvTimer'
import CloseIcon from '@mui/icons-material/Close'

const BusinessHoursUpdate = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()
  const vendorId = session?.user?.id

  const [businessHours, setBusinessHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const hours = Array.from({ length: 24 }, (_, index) => 
    index < 10 ? `0${index}:00` : `${index}:00`
  )

  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

  const initializeDefaultHours = () => {
    return DAYS_OF_WEEK.map(day => ({
      day,
      openTime: '09:00',
      closeTime: '21:00',
      is24Hours: false,
      isClosed: false
    }))
  }

  useEffect(() => {
    const fetchBusinessHours = async () => {
      if (status !== 'authenticated' || !vendorId) {
        setLoading(false)
        return
      }

      try {
        console.log(`Fetching business hours from: ${API_URL}/vendor/fetchbusinesshours/${vendorId}`)
        const response = await axios.get(`${API_URL}/vendor/fetchbusinesshours/${vendorId}`)
        
        if (response.data?.businessHours && response.data.businessHours.length > 0) {
          setBusinessHours(response.data.businessHours)
        } else {
          setBusinessHours(initializeDefaultHours())
        }
      } catch (err) {
        console.error('API Error fetching business hours:', err)
        setError('Failed to load business hours')
        setBusinessHours(initializeDefaultHours())
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessHours()
  }, [status, vendorId])

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/vendor/updatehours/${vendorId}`,
        { businessHours }
      )
      
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Business hours saved successfully!',
          severity: 'success'
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      console.error('Error saving business hours:', err)
      setSnackbar({
        open: true,
        message: 'Failed to save business hours',
        severity: 'error'
      })
    }
  }

  const handleModeChange = (index, mode) => {
    const updatedHours = [...businessHours]
    
    switch (mode) {
      case 'timeBased':
        updatedHours[index] = {
          ...updatedHours[index],
          isClosed: false,
          is24Hours: false
        }
        break
      case '24Hours':
        updatedHours[index] = {
          ...updatedHours[index],
          isClosed: false,
          is24Hours: true
        }
        break
      case 'closed':
        updatedHours[index] = {
          ...updatedHours[index],
          isClosed: true,
          is24Hours: false
        }
        break
    }

    setBusinessHours(updatedHours)
  }

  const handleTimeChange = (index, field, value) => {
    const updatedHours = [...businessHours]
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    }
    setBusinessHours(updatedHours)
  }

  const getCurrentMode = (dayData) => {
    if (dayData.isClosed) return 'closed'
    if (dayData.is24Hours) return '24Hours'
    return 'timeBased'
  }

  if (loading) {
    return (
      <Card sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{ mt: 6 }}>
        <CardHeader title="Operational Timings"
        sx={{ bgcolor: 'error.main' }}
        titleTypographyProps={{ color: 'common.white' }}
         />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader 
        title="Operational Timings" 
        sx={{ bgcolor: 'primary.main' }}
        titleTypographyProps={{ color: 'common.white' }}
      />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1} sx={{ fontWeight: 'bold', px: 1 }}>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Day</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Open at</Typography>
            </Grid>
            <Grid item xs={3} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2">Close at</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="subtitle2">Mode</Typography>
            </Grid>
          </Grid>
        </Box>

        {businessHours.map((dayData, index) => (
          <Paper 
            key={index}
            elevation={1}
            sx={{ 
              p: 1, 
              mb: 1, 
              borderRadius: 2,
              ':hover': { boxShadow: 2 }
            }}
          >
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={3}>
                <Typography fontWeight={500} variant="body2">
                  {dayData.day}
                </Typography>
              </Grid>
              
              <Grid item xs={3}>
                {dayData.isClosed ? (
                  <Box sx={{ bgcolor: 'error.light', borderRadius: 1, p: 0.5, textAlign: 'center' }}>
                   <Typography variant="caption" color="common.white" fontWeight={600}>
                    Closed
                   </Typography>

                  </Box>
                ) : dayData.is24Hours ? (
                  <Box sx={{ bgcolor: 'success.light', borderRadius: 1, p: 0.5, textAlign: 'center' }}>
                  <Typography variant="caption" color="common.white" fontWeight={600}>
                    24 Hours
                  </Typography>

                  </Box>
                ) : (
                  <FormControl size="small" fullWidth>
                    <Select
                      value={dayData.openTime}
                      onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                      sx={{ 
                        height: 32, 
                        fontSize: { xs: '0.75rem', sm: '0.8rem' }
                      }}
                    >
                      {hours.map((time) => (
                        <MenuItem key={time} value={time} dense>
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              
              <Grid item xs={3} sx={{ display: { xs: 'none', sm: 'block' } }}>
                {!dayData.isClosed && !dayData.is24Hours && (
                  <FormControl size="small" fullWidth>
                    <Select
                      value={dayData.closeTime}
                      onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                      sx={{ 
                        height: 32, 
                        fontSize: { xs: '0.75rem', sm: '0.8rem' } 
                      }}
                    >
                      {hours.map((time) => (
                        <MenuItem key={time} value={time} dense>
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <ToggleButtonGroup
                  value={getCurrentMode(dayData)}
                  exclusive
                  onChange={(event, newMode) => newMode && handleModeChange(index, newMode)}
                  size="small"
                  fullWidth
                  sx={{ height: 32 }}
                >
                  <ToggleButton value="timeBased">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize="small" />
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="24Hours">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AvTimerIcon fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>
                        24h
                      </Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="closed">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CloseIcon fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>
                        Closed
                      </Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            fullWidth
            onClick={handleSave}
            sx={{ 
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            Save Operational Timings
          </Button>
        </Box>
      </CardContent>

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
}

export default BusinessHoursUpdate
