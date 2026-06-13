'use client'
import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'
import axios from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Divider from '@mui/material/Divider'

// Third-party Imports
import classnames from 'classnames'


// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const OrderCard = ({ }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession()
  const vendorId = session?.user?.id


  // State to store booking counts
  const [bookingTypeFilter, setBookingTypeFilter] = useState('user')
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    COMPLETED: 0,
    Approved: 0,
    Cancelled: 0,
    Parked: 0
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vendor_booking_tab_preference')
      if (saved) setBookingTypeFilter(saved)

      const handleTabChange = () => {
        const updated = localStorage.getItem('vendor_booking_tab_preference')
        if (updated) setBookingTypeFilter(updated)
      }

      window.addEventListener('booking-type-changed', handleTabChange)
      return () => window.removeEventListener('booking-type-changed', handleTabChange)
    }
  }, [])


  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))


  // Status-to-Icon Mapping
  const statusIcons = {
    Pending: 'ri-time-line', // Clock icon
    Approved: 'ri-thumb-up-line', // Thumbs up
    Cancelled: 'ri-close-circle-line', // Cross icon
    PARKED: 'ri-parking-box-line', // Parking icon
    COMPLETED: 'ri-check-double-line', // Checkmark icon

  }


  // Fetch booking data
  useEffect(() => {
    if (!vendorId) return

    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}?countOnly=true&bookingTypeFilter=${bookingTypeFilter}`)

        console.log('API Counts Response:', response.data) // Debug the response
        
        if (response.data && response.data.counts) {
          const fetchedCounts = response.data.counts;
          
          setStatusCounts({
            Pending: fetchedCounts.pending || 0,
            Approved: fetchedCounts.approved || 0,
            Cancelled: fetchedCounts.cancelled || 0,
            PARKED: fetchedCounts.parked || 0,
            COMPLETED: fetchedCounts.completed || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching bookings counts:', error)
      }
    }

    fetchBookings()

    // Listen for custom delete events to refetch booking count immediately
    const handleBookingDeleted = () => {
      fetchBookings()
    }
    window.addEventListener('booking-deleted', handleBookingDeleted)

    return () => {
      window.removeEventListener('booking-deleted', handleBookingDeleted)
    }
  }, [vendorId, API_URL, bookingTypeFilter])


  // Data structure for UI display
  const statusData = Object.keys(statusCounts).map(status => ({
    title: status.charAt(0) + status.slice(1).toLowerCase(), // Capitalize first letter
    value: statusCounts[status],
    icon: statusIcons[status] || 'ri-question-line' // Default icon if missing
  }))

  
return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {statusData.map((item, index) => (
            <Grid
            item
            xs={12}
            sm={6}
            md={2.4} // Set to 2.4 to fit 5 items per row (12 / 5 = 2.4)
            key={index}
            className={classnames({
              '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                isBelowMdScreen && !isBelowSmScreen,
              '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
            })}
          >
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>{item.value}</Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={42} skin='light'>
                  <i className={classnames(item.icon, 'text-[26px]')} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < statusData.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < statusData.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default OrderCard
