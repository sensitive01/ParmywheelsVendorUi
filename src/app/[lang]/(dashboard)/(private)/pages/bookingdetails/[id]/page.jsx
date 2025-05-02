'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'


import CustomAvatar from '@core/components/mui/Avatar'


import { getLocalizedUrl } from '@/utils/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const stsChipColor = {
  instant: { color: '#ff4d49', text: 'Instant' },
  subscription: { color: '#72e128', text: 'Subscription' },
  schedule: { color: '#fdb528', text: 'Schedule' }
};

export const statusChipColor = {
  completed: { color: 'success' },
  pending: { color: 'warning' },
  parked: { color: '#666CFF' },
  cancelled: { color: 'error' },
  approved: { color: 'info' }
};

const calculateDuration = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime || !endDate || !endTime) return 'N/A'
  
  try {

    const [startDay, startMonth, startYear] = startDate.split('-')
    const [startTimePart, startAmpm] = startTime.split(' ')
    let [startHours, startMinutes] = startTimePart.split(':').map(Number)

    if (startAmpm && startAmpm.toUpperCase() === 'PM' && startHours !== 12) {
      startHours += 12
    } else if (startAmpm && startAmpm.toUpperCase() === 'AM' && startHours === 12) {
      startHours = 0
    }
    

    const startDateTime = new Date(`${startYear}-${startMonth}-${startDay}T${startHours}:${startMinutes}:00`)

    const [endDay, endMonth, endYear] = endDate.split('-')
    const [endTimePart, endAmpm] = endTime.split(' ')
    let [endHours, endMinutes] = endTimePart.split(':').map(Number)

    if (endAmpm && endAmpm.toUpperCase() === 'PM' && endHours !== 12) {
      endHours += 12
    } else if (endAmpm && endAmpm.toUpperCase() === 'AM' && endHours === 12) {
      endHours = 0
    }

    const endDateTime = new Date(`${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:00`)

    const diffMs = endDateTime - startDateTime
    

    const diffSecs = Math.floor(diffMs / 1000)
    const days = Math.floor(diffSecs / (3600 * 24))
    const hours = Math.floor((diffSecs % (3600 * 24)) / 3600)
    const minutes = Math.floor((diffSecs % 3600) / 60)
    

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else {
      return `${hours}h ${minutes}m`
    }
  } catch (e) {
    console.error("Error calculating duration:", e)
    return 'N/A'
  }
}

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return 'N/A'
  
  try {
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } 
    else if (dateStr.includes('-')) {
      const [day, month, year] = dateStr.split('-')
      return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
    
    return dateStr
  } catch (e) {
    console.error("Date parsing error:", e, dateStr)
    return dateStr
  }
}

const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return 'N/A'
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr
  }
  try {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  } catch (e) {
    return timeStr
  }
}

const BookingDetailView = () => {
  const [bookingData, setBookingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const vendorId = session?.user?.id

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) {
        setError('Booking ID is missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/vendor/getbooking/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        
        const result = await response.json()
        
        if (result && result.booking) {
          setBookingData(result.booking)
        } else {
          throw new Error('Booking not found')
        }
      } catch (error) {
        console.error("Error fetching booking details:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookingDetails()
  }, [id])


  const getVehicleIcon = (vehicleType) => {
    if (!vehicleType) return 'ri-roadster-fill'
    
    const type = vehicleType.toLowerCase()
    if (type === 'car') return 'ri-car-fill'
    if (type === 'bike') return 'ri-motorbike-fill'
    
    return 'ri-roadster-fill'
  }

  const getVehicleIconColor = (vehicleType) => {
    if (!vehicleType) return '#282a42'
    
    const type = vehicleType.toLowerCase()
    if (type === 'car') return '#ff4d49'
    if (type === 'bike') return '#72e128'
    
    return '#282a42'
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              component={Link} 
              href={getLocalizedUrl('/apps/ecommerce/products/list', locale)}
              startIcon={<i className="ri-arrow-left-line" />}
            >
              Back to Booking List
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (!bookingData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">Booking not found</Alert>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              component={Link} 
              href={getLocalizedUrl('/apps/ecommerce/products/list', locale)}
              startIcon={<i className="ri-arrow-left-line" />}
            >
              Back to Booking List
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  const statusKey = bookingData.status?.toLowerCase()
  const statusChipProps = statusChipColor[statusKey] || { color: 'default' }

  const stsKey = bookingData.sts?.toLowerCase()
  const stsChipProps = stsChipColor[stsKey] || { color: 'text.secondary', text: bookingData.sts || 'N/A' }

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3">Booking Details</Typography>
        <Button 
          variant="outlined" 
          component={Link} 
          href={getLocalizedUrl('/apps/ecommerce/products/list', locale)}
          startIcon={<i className="ri-arrow-left-line" />}
        >
          Back to Booking List
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ pt: 4, pb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CustomAvatar 
                      skin='light' 
                      color='primary' 
                      sx={{ mr: 2.5, width: 60, height: 60, fontSize: '2rem' }}
                    >
                      <i className={getVehicleIcon(bookingData.vehicleType)} style={{ color: getVehicleIconColor(bookingData.vehicleType) }}></i>
                    </CustomAvatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6">
                        #{bookingData.vehicleNumber || 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Chip
                          label={bookingData.status || 'N/A'}
                          variant="tonal"
                          size="small"
                          sx={statusChipProps.color.startsWith('#') ? { 
                            backgroundColor: statusChipProps.color, 
                            color: 'white' 
                          } : {}}
                          color={!statusChipProps.color.startsWith('#') ? statusChipProps.color : undefined}
                        />
                        <Typography
                          sx={{ 
                            color: stsChipProps.color, 
                            fontWeight: 500, 
                            display: 'flex', 
                            alignItems: 'center',
                            fontSize: '0.875rem'
                          }}
                        >
                          <i className="ri-circle-fill" style={{ fontSize: '10px', marginRight: '6px', color: stsChipProps.color }}></i>
                          {stsChipProps.text}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Typography variant="h6">
                      Amount: ₹{bookingData.amount || '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Booking Type: {bookingData.bookType || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      ID: {bookingData._id}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Booking Information" />
            <Divider />
            <CardContent>
              <Grid container spacing={4}>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 500 }}>Vehicle Number</TableCell>
                          <TableCell>{bookingData.vehicleNumber || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 500 }}>Vehicle Type</TableCell>
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className={getVehicleIcon(bookingData.vehicleType)} style={{ fontSize: '16px', color: getVehicleIconColor(bookingData.vehicleType) }}></i>
                            {bookingData.vehicleType || 'N/A'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 500 }}>Car Type</TableCell>
                          <TableCell>{bookingData.carType || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 500 }}>Booking Date & Time</TableCell>
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className="ri-calendar-2-line" style={{ fontSize: '16px', color: '#666' }}></i>
                            {`${formatDateDisplay(bookingData.bookingDate)}, ${formatTimeDisplay(bookingData.bookingTime)}`}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 500 }}>Amount</TableCell>
                          <TableCell>₹{bookingData.amount || '0'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 500 }}>Booking Type</TableCell>
                          <TableCell>{bookingData.bookType || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 500 }}>OTP</TableCell>
                          <TableCell>{bookingData.otp || 'N/A'}</TableCell>
                        </TableRow>
                        {bookingData.subsctiptiontype && (
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 500 }}>Subscription Type</TableCell>
                            <TableCell>{bookingData.subsctiptiontype}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Parking Timeline
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        {bookingData.approvedDate && bookingData.approvedTime && (
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 500 }}>Approved</TableCell>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className="ri-checkbox-circle-line" style={{ fontSize: '16px', color: '#72e128' }}></i>
                              {`${formatDateDisplay(bookingData.approvedDate)}, ${formatTimeDisplay(bookingData.approvedTime)}`}
                            </TableCell>
                          </TableRow>
                        )}
                        {bookingData.parkedDate && bookingData.parkedTime && (
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 500 }}>Parked</TableCell>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className="ri-parking-line" style={{ fontSize: '16px', color: '#666CFF' }}></i>
                              {`${formatDateDisplay(bookingData.parkedDate)}, ${formatTimeDisplay(bookingData.parkedTime)}`}
                            </TableCell>
                          </TableRow>
                        )}
                        {bookingData.exitvehicledate && bookingData.exitvehicletime && (
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 500 }}>Exit</TableCell>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className="ri-logout-box-line" style={{ fontSize: '16px', color: '#ff4d49' }}></i>
                              {`${formatDateDisplay(bookingData.exitvehicledate)}, ${formatTimeDisplay(bookingData.exitvehicletime)}`}
                            </TableCell>
                          </TableRow>
                        )}
                        {bookingData.cancelledDate && bookingData.cancelledTime && (
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 500 }}>Cancelled</TableCell>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className="ri-close-circle-line" style={{ fontSize: '16px', color: '#ff4d49' }}></i>
                              {`${formatDateDisplay(bookingData.cancelledDate)}, ${formatTimeDisplay(bookingData.cancelledTime)}`}
                            </TableCell>
                          </TableRow>
                        )}
                        {statusKey === 'completed' && bookingData.parkedDate && bookingData.parkedTime && 
                          bookingData.exitvehicledate && bookingData.exitvehicletime && (
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 500 }}>Total Duration</TableCell>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className="ri-time-line" style={{ fontSize: '16px', color: '#72e128' }}></i>
                              <Typography sx={{ fontWeight: 500, color: '#72e128' }}>
                                {calculateDuration(
                                  bookingData.parkedDate, 
                                  bookingData.parkedTime, 
                                  bookingData.exitvehicledate, 
                                  bookingData.exitvehicletime
                                )}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        {bookingData.hour && bookingData.hour !== '00:00:00' && (
                          <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 500 }}>Hours</TableCell>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <i className="ri-time-line" style={{ fontSize: '16px', color: '#666' }}></i>
                              {bookingData.hour}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {bookingData.additionalData && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Additional Information
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="body2">
                        {bookingData.additionalData}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Customer Information" />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <CustomAvatar 
                  src="/images/avatars/1.png" 
                  skin='light' 
                  sx={{ width: 80, height: 80, mb: 2 }}
                />
                <Typography variant="h6">
                  {bookingData.personName || 'Unknown Customer'}
                </Typography>
                {bookingData.mobileNumber && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {bookingData.mobileNumber}
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardHeader title="Booking Status" />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Current Status</Typography>
                  <Chip
                    label={bookingData.status || 'N/A'}
                    variant="tonal"
                    size="small"
                    sx={statusChipProps.color.startsWith('#') ? { 
                      backgroundColor: statusChipProps.color, 
                      color: 'white' 
                    } : {}}
                    color={!statusChipProps.color.startsWith('#') ? statusChipProps.color : undefined}
                  />
                </Box>
                {bookingData.cancelledStatus && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Cancellation Reason</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {bookingData.cancelledStatus}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default BookingDetailView
