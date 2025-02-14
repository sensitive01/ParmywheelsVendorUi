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
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    COMPLETED: 0,
    Approved: 0,
    Cancelled: 0,
    Parked: 0
  })
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
        const response = await axios.get(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`)
        console.log('API Response:', response.data) // Debug the response
        const bookings = response.data.bookings // Access the correct array
        if (!Array.isArray(bookings)) {
          console.error('Expected an array but got:', bookings)
          return
        }
        const counts = {
          Pending: 0,
          Approved: 0,
          Cancelled: 0,
          PARKED: 0,
          COMPLETED: 0,
        }
        
        bookings.forEach(booking => {
          const status = booking.status?.trim().toLowerCase(); // Normalize status to lowercase
          const normalizedKey = 
            status === 'completed' ? 'COMPLETED' :
            status === 'pending' ? 'Pending' :
            status === 'approved' ? 'Approved' :
            status === 'cancelled' ? 'Cancelled' :
            status === 'parked' ? 'PARKED' :
            null; // Handle unexpected cases
        
          if (normalizedKey && counts[normalizedKey] !== undefined) {
            counts[normalizedKey] += 1;
          }
        });
        
        setStatusCounts(counts)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      }
    }
    if (vendorId) fetchBookings()
  }, [vendorId])
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
