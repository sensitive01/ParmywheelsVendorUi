'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import Award from '@views/dashboards/crm/Award'
import CardStatVertical from '@components/card-statistics/Vertical'
import StackedBarChart from '@views/dashboards/crm/StackedBarChart'
import DonutChart from '@views/dashboards/crm/DonutChart'
import OrganicSessions from '@views/dashboards/crm/OrganicSessions'
import ProjectTimeline from '@views/dashboards/crm/ProjectTimeline'
import WeeklyOverview from '@views/dashboards/crm/WeeklyOverview'
import SocialNetworkVisits from '@views/dashboards/crm/SocialNetworkVisits'
import MonthlyBudget from '@views/dashboards/crm/MonthlyBudget'
import MeetingSchedule from '@views/dashboards/crm/MeetingSchedule'
import ExternalLinks from '@views/dashboards/crm/ExternalLinks'
import PaymentHistory from '@views/dashboards/crm/PaymentHistory'
import SalesInCountries from '@views/dashboards/crm/SalesInCountries'
import UserTable from '@views/dashboards/crm/UserTable'

// Third-party Imports
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Typography } from '@mui/material'

const DashboardCRM = () => {
  // State for booking counts
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    COMPLETED: 0,
    Approved: 0,
    Cancelled: 0,
    Parked: 0,
    Subscriptions: 0
  })

  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  // Fetch booking data
  useEffect(() => {
    const fetchBookings = async () => {
      if (!vendorId) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        const bookings = response.data.bookings

        if (Array.isArray(bookings)) {
          const counts = {
            Pending: 0,
            Approved: 0,
            Cancelled: 0,
            Parked: 0,
            COMPLETED: 0,
            Subscriptions: 0
          }
          
          bookings.forEach(booking => {
            const status = booking.status?.trim().toLowerCase()
            const normalizedKey = 
              status === 'completed' ? 'COMPLETED' :
              status === 'pending' ? 'Pending' :
              status === 'approved' ? 'Approved' :
              status === 'cancelled' ? 'Cancelled' :
              status === 'parked' ? 'Parked' :
              null
            
            if (normalizedKey && counts[normalizedKey] !== undefined) {
              counts[normalizedKey] += 1
            }
            
            // Count subscriptions
            if (booking.sts === 'Subscription') {
              counts.Subscriptions += 1
            }
          })
          
          setStatusCounts(counts)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [vendorId])

  if (loading) {
    return (
      <div className='flex items-center justify-center p-10'>
        <Typography variant='body1'>Loading dashboard data...</Typography>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Award />
      </Grid>
      <Grid size={{ xs: 12, md: 2, sm: 3 }}>
        <CardStatVertical
          stats={String(statusCounts.Pending)}
          title='Pending Bookings'
          trendNumber='22%'
          avatarColor='primary'
          avatarIcon='ri-time-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CardStatVertical
          stats={String(statusCounts.COMPLETED)}
          title='Completed Bookings'
          trendNumber='38%'
          avatarColor='success'
          avatarIcon='ri-check-double-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CardStatVertical
          stats={String(statusCounts.Approved)}
          title='Approved Bookings'
          trendNumber='38%'
          avatarColor='info'
          avatarIcon='ri-thumb-up-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CardStatVertical
          stats={String(statusCounts.Cancelled)}
          title='Cancelled Bookings'
          trendNumber='38%'
          avatarColor='error'
          avatarIcon='ri-close-circle-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CardStatVertical
          stats={String(statusCounts.Parked)}
          title='Parked Bookings'
          trendNumber='38%'
          avatarColor='warning'
          avatarIcon='ri-parking-box-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CardStatVertical
          stats={String(statusCounts.Subscriptions)}
          title='Subscriptions'
          trendNumber='38%'
          avatarColor='secondary'
          avatarIcon='ri-calendar-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <StackedBarChart />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <DonutChart />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <OrganicSessions />
      </Grid>
      {/* <Grid size={{ xs: 12, md: 8 }}>
        <ProjectTimeline />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <WeeklyOverview />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <SocialNetworkVisits />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <MonthlyBudget />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <MeetingSchedule />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ExternalLinks />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <PaymentHistory />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <SalesInCountries />
      </Grid> */}
    </Grid>
  )
}

export default DashboardCRM
