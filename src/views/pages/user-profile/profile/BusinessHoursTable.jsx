




'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

// Material UI imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Container from '@mui/material/Container'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Chip from '@mui/material/Chip'
import HomeIcon from '@mui/icons-material/Home'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'

const BusinessHoursTable = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()
  const vendorId = session?.user?.id

  const [businessHours, setBusinessHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]

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
          // Sort business hours by day of week to ensure consistent order
          const sortedHours = response.data.businessHours.sort((a, b) => {
            return DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
          })
          setBusinessHours(sortedHours)
        } else {
          setError('No business hours data found')
        }
      } catch (err) {
        console.error('API Error fetching business hours:', err)
        setError('Failed to load business hours data')
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessHours()
  }, [status, vendorId])

  // Function to determine the status and display text for each day
  const getStatusInfo = (dayData) => {
    if (dayData.isClosed) {
      return {
        label: 'Closed',
        color: 'error',
        icon: <ErrorOutlineIcon fontSize="small" />
      }
    } else if (dayData.is24Hours) {
      return {
        label: 'Open 24 Hours',
        color: 'success',
        icon: <CheckCircleOutlineIcon fontSize="small" />
      }
    } else {
      return {
        label: `${dayData.openTime} - ${dayData.closeTime}`,
        color: 'primary',
        icon: <AccessTimeFilledIcon fontSize="small" />
      }
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Card maxWidth="lg" sx={{ py: 4 }}>    

      {/* Page title */}
      <Typography variant="h4" component="h1" sx={{ mb: 4, ml:6 }}>
        Business Hours
      </Typography>

     
        <CardHeader 
           title="Operational Timings" 
           sx={{ bgcolor: 'primary.light' }}
           titleTypographyProps={{ color: 'common.white' }}
        />
       
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : businessHours.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No business hours data available. Please set your business hours.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 0, borderRadius: 0 }}>
              <Table sx={{ minWidth: 650 }} aria-label="business hours table">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businessHours.map((dayData, index) => {
                    const statusInfo = getStatusInfo(dayData)
                    
                    return (
                      <TableRow 
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                          {dayData.day}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusInfo.icon}
                            label={dayData.isClosed ? 'Closed' : 'Open'}
                            color={statusInfo.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {dayData.isClosed ? (
                              '' // Just leave it blank instead of showing "Not operational"
                            ) : dayData.is24Hours ? (
                              <Typography variant="body2" color="success.main">24 hours</Typography>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                                <Typography variant="body2">
                                  {dayData.openTime} - {dayData.closeTime}
                                </Typography>
                              </Box>
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
       
    
    </Card>
  )
}

export default BusinessHoursTable
