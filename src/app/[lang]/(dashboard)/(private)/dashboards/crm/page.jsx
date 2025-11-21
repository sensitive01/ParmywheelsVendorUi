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
import { Typography, Button, Menu, MenuItem } from '@mui/material'

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

  const [bookings, setBookings] = useState([])
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null)
  const downloadMenuOpen = Boolean(downloadAnchorEl)

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
        setBookings(Array.isArray(bookings) ? bookings : [])

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

  const handleDownloadClick = event => setDownloadAnchorEl(event.currentTarget)
  const handleDownloadClose = () => setDownloadAnchorEl(null)

  const exportToCSV = () => {
    if (!bookings || bookings.length === 0) return handleDownloadClose()

    const headers = ['Booking ID', 'Booking Date', 'Parking Date', 'Parking Time', 'Amount', 'Status', 'Type']
    const rows = bookings.map(b => [
      b._id ?? '',
      b.bookingDate ?? '',
      b.parkingDate ?? '',
      b.parkingTime ?? '',
      b.amount ?? '',
      b.status ?? '',
      b.sts ?? ''
    ])

    let csvContent = 'data:text/csv;charset=utf-8,'
      + headers.join(',') + '\n'
      + rows.map(r => r.map(v => String(v).replaceAll('"', '""')).map(v => /[,"]/.test(v) ? '"' + v + '"' : v).join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'vendor_bookings_report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    handleDownloadClose()
  }

  const loadXLSX = async () => {
    if (typeof window !== 'undefined' && window.XLSX) return window.XLSX
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
      script.async = true
      script.onload = () => resolve(window.XLSX)
      script.onerror = reject
      document.body.appendChild(script)
    })
  }

  const exportXlsxByStatus = async () => {
    if (!bookings || bookings.length === 0) return handleDownloadClose()
    const XLSX = await loadXLSX()

    const header = ['Booking ID', 'Booking Date', 'Parking Date', 'Parking Time', 'Amount', 'Status', 'Type']
    const groups = {
      Pending: [],
      Approved: [],
      Cancelled: [],
      Parked: [],
      COMPLETED: [],
      Subscriptions: []
    }

    bookings.forEach(b => {
      const raw = (b.status || '').toString().trim().toLowerCase()
      const key = raw === 'completed' ? 'COMPLETED'
        : raw === 'pending' ? 'Pending'
          : raw === 'approved' ? 'Approved'
            : raw === 'cancelled' ? 'Cancelled'
              : raw === 'parked' ? 'Parked'
                : null
      const row = [b._id ?? '', b.bookingDate ?? '', b.parkingDate ?? '', b.parkingTime ?? '', b.amount ?? '', b.status ?? '', b.sts ?? '']
      if (key && groups[key]) groups[key].push(row)
      if (b.sts === 'Subscription') groups['Subscriptions'].push(row)
    })

    const wb = XLSX.utils.book_new()
    Object.entries(groups).forEach(([sheetName, rows]) => {
      const aoa = [header, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })

    XLSX.writeFile(wb, 'vendor_bookings_by_status.xlsx')
    handleDownloadClose()
  }

  const exportSummaryToCSV = () => {
    // Build a summary matching dashboard tiles
    const totalAmount = (bookings || []).reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
    const totalBookings = (bookings || []).length

    const rows = [
      ['Metric', 'Value'],
      ['Pending Bookings', String(statusCounts.Pending)],
      ['Approved Bookings', String(statusCounts.Approved)],
      ['Cancelled Bookings', String(statusCounts.Cancelled)],
      ['Parked Bookings', String(statusCounts.Parked)],
      ['Completed Bookings', String(statusCounts.COMPLETED)],
      ['Subscriptions', String(statusCounts.Subscriptions)],
      ['Total Bookings', String(totalBookings)],
      ['Total Amount', String(totalAmount)]
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.map(v => String(v).replaceAll('"', '""')).map(v => /[,"]/.test(v) ? '"' + v + '"' : v).join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'vendor_dashboard_summary.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    handleDownloadClose()
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-10'>
        <Typography variant='body1'>Loading dashboard data...</Typography>
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <div className='flex items-center justify-end gap-2'>
          <Button variant='contained' size='small' onClick={handleDownloadClick}>
            Download Report
          </Button>
          <Menu anchorEl={downloadAnchorEl} open={downloadMenuOpen} onClose={handleDownloadClose}>
            <MenuItem onClick={exportSummaryToCSV}>Export Summary (matches tiles)</MenuItem>
            <MenuItem onClick={exportXlsxByStatus}>Export XLSX by Status (multiple sheets)</MenuItem>
            <MenuItem onClick={exportToCSV}>Export Detailed (all bookings)</MenuItem>
          </Menu>
        </div>
      </Grid>
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
