'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import { Typography, Button, Menu, MenuItem, TextField } from '@mui/material'

// Components Imports
import { useSession } from 'next-auth/react'

import axios from 'axios'

import QRCode from 'qrcode'

import Award from '@views/dashboards/crm/Award'
import CardStatVertical from '@components/card-statistics/Vertical'
import StackedBarChart from '@views/dashboards/crm/StackedBarChart'
import DonutChart from '@views/dashboards/crm/DonutChart'
import OrganicSessions from '@views/dashboards/crm/OrganicSessions'

// Third-party Imports

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

  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const vendorId = session?.user?.id
  const { lang: locale } = useParams()

  const [bookings, setBookings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null)
  const downloadMenuOpen = Boolean(downloadAnchorEl)

  // Date Parsing Helpers
  const parseDateString = dateStr => {
    if (!dateStr || dateStr === 'N/A') return null
    try {
      const parts = dateStr.split('-')

      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return new Date(parts[0], parts[1] - 1, parts[2])
        } else if (parts[2].length === 4) {
          // DD-MM-YYYY
          return new Date(parts[2], parts[1] - 1, parts[0])
        }
      }

      const d = new Date(dateStr)

      return isNaN(d.getTime()) ? null : d
    } catch (e) {
      return null
    }
  }

  const getBookingDate = booking => {
    return parseDateString(booking.parkingDate) || parseDateString(booking.bookingDate) || (booking.createdAt ? new Date(booking.createdAt) : null)
  }

  const getItemDateTime = item => {
    if (!item) return 0

    const dateStr = item.parkingDate || item.bookingDate || item.createdAt
    const timeStr = item.parkingTime || item.bookingTime

    if (!dateStr) return 0

    try {
      let year, month, day
      const dateParts = String(dateStr).split('-')

      if (dateParts[0].length === 4) {
        // YYYY-MM-DD
        year = parseInt(dateParts[0])
        month = parseInt(dateParts[1])
        day = parseInt(dateParts[2])
      } else {
        // DD-MM-YYYY
        day = parseInt(dateParts[0])
        month = parseInt(dateParts[1])
        year = parseInt(dateParts[2])
      }

      let hours = 0
      let minutes = 0

      if (timeStr) {
        const cleanedTime = String(timeStr).trim()
        const ampmMatch = cleanedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i)

        if (ampmMatch) {
          hours = parseInt(ampmMatch[1], 10)
          minutes = parseInt(ampmMatch[2], 10)

          const ampm = ampmMatch[3]

          if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) {
            hours += 12
          } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
            hours = 0
          }
        } else if (cleanedTime.includes(':')) {
          const parts = cleanedTime.split(':')

          hours = parseInt(parts[0], 10) || 0
          minutes = parseInt(parts[1], 10) || 0
        }
      }

      return new Date(year, month - 1, day, hours, minutes).getTime()
    } catch (e) {
      const d = parseDateString(dateStr)

      return d ? d.getTime() : 0
    }
  }

  // Fetch booking data
  useEffect(() => {
    const fetchAllBookings = async () => {
      if (!vendorId) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`,
          {
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache'
            }
          }
        )

        const data = response.data?.bookings || response.data?.data || (Array.isArray(response.data) ? response.data : [])
        if (Array.isArray(data)) {
          setAllBookings(data)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllBookings()
  }, [vendorId])

  // Recalculate dashboard statistics dynamically
  useEffect(() => {
    let filtered = [...allBookings]

    if (fromDate || toDate) {
      const start = fromDate ? new Date(fromDate) : null
      const end = toDate ? new Date(toDate) : null

      if (start) start.setHours(0, 0, 0, 0)
      if (end) end.setHours(23, 59, 59, 999)

      filtered = filtered.filter(b => {
        const bDate = getBookingDate(b)

        if (!bDate) return false
        bDate.setHours(0, 0, 0, 0)

        if (start && bDate < start) return false
        if (end && bDate > end) return false

        return true
      })
    }

    const counts = {
      Pending: 0,
      COMPLETED: 0,
      Approved: 0,
      Cancelled: 0,
      Parked: 0,
      Subscriptions: 0
    }
    let totalAmt = 0

    filtered.forEach(b => {
      const status = (b.status || '').toString().trim().toUpperCase()
      const isSub = (b.sts || '').toString().trim().toUpperCase() === 'SUBSCRIPTION'

      if (isSub) {
        counts.Subscriptions++
      } else if (status === 'PENDING') {
        counts.Pending++
      } else if (status === 'APPROVED') {
        counts.Approved++
      } else if (status === 'CANCELLED') {
        counts.Cancelled++
      } else if (status === 'PARKED' || status === 'ON PARKING') {
        counts.Parked++
      } else if (status === 'COMPLETED') {
        counts.COMPLETED++
      }

      const amt = parseFloat(b.amount) || 0
      totalAmt += amt
    })

    filtered.sort((a, b) => getItemDateTime(b) - getItemDateTime(a)) // Newest first

    setStatusCounts(counts)
    setTotalAmount(totalAmt)
    setBookings(filtered)
  }, [allBookings, fromDate, toDate])

  const handleDownloadClick = event => setDownloadAnchorEl(event.currentTarget)
  const handleDownloadClose = () => setDownloadAnchorEl(null)

  const handleDownloadQR = async () => {
    if (!vendorId) return

    try {
      // Generate QR Code with URL to the scanner page
      const baseUrl = window.location.origin
      const qrData = `${baseUrl}/${locale || 'en'}/pages/scan/${vendorId}`

      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })

      const link = document.createElement('a')

      link.href = qrCodeUrl
      link.download = `vendor_scanner_qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error generating QR code:', err)
    }
  }

  const fetchAllBookingsForExport = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`
      )
      return response.data.bookings || []
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const exportToCSV = async () => {
    const dataToExport = bookings.length > 0 ? bookings : await fetchAllBookingsForExport()
    if (!dataToExport || dataToExport.length === 0) return handleDownloadClose()

    const headers = [
      'Booking ID',
      'Booking Date',
      'Parking Date',
      'Parking Time',
      'Exit Date',
      'Exit Time',
      'Duration (Hours)',
      'Amount',
      'Status',
      'Type'
    ]

    const rows = dataToExport.map(b => [
      b._id ?? '',
      b.bookingDate ?? '',
      b.parkingDate ?? '',
      b.parkingTime ?? '',
      b.exitvehicledate ?? '',
      b.exitvehicletime ?? '',
      b.hour ?? '',
      b.amount ?? '',
      b.status ?? '',
      b.sts ?? ''
    ])

    let csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows
        .map(r =>
          r
            .map(v => String(v).replaceAll('"', '""'))
            .map(v => (/[,"]/.test(v) ? '"' + v + '"' : v))
            .join(',')
        )
        .join('\n')

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
    const dataToExport = bookings.length > 0 ? bookings : await fetchAllBookingsForExport()
    if (!dataToExport || dataToExport.length === 0) return handleDownloadClose()
    const XLSX = await loadXLSX()

    const header = [
      'Booking ID',
      'Booking Date',
      'Parking Date',
      'Parking Time',
      'Exit Date',
      'Exit Time',
      'Duration (Hours)',
      'Amount',
      'Status',
      'Type'
    ]

    const groups = {
      Pending: [],
      Approved: [],
      Cancelled: [],
      Parked: [],
      COMPLETED: [],
      Subscriptions: []
    }

    dataToExport.forEach(b => {
      const raw = (b.status || '').toString().trim().toLowerCase()

      const key =
        raw === 'completed'
          ? 'COMPLETED'
          : raw === 'pending'
            ? 'Pending'
            : raw === 'approved'
              ? 'Approved'
              : raw === 'cancelled'
                ? 'Cancelled'
                : raw === 'parked'
                  ? 'Parked'
                  : null

      const row = [
        b._id ?? '',
        b.bookingDate ?? '',
        b.parkingDate ?? '',
        b.parkingTime ?? '',
        b.exitvehicledate ?? '',
        b.exitvehicletime ?? '',
        b.hour ?? '',
        b.amount ?? '',
        b.status ?? '',
        b.sts ?? ''
      ]

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
    const totalBookings =
      (statusCounts.Pending || 0) +
      (statusCounts.Approved || 0) +
      (statusCounts.Cancelled || 0) +
      (statusCounts.Parked || 0) +
      (statusCounts.COMPLETED || 0) +
      (statusCounts.Subscriptions || 0);

    const rows = [
      ['Metric', 'Value'],
      ['Pending Bookings', String(statusCounts.Pending)],
      ['Approved Bookings', String(statusCounts.Approved)],
      ['Cancelled Bookings', String(statusCounts.Cancelled)],
      ['Parked Bookings', String(statusCounts.Parked)],
      ['Completed Bookings', String(statusCounts.COMPLETED)],
      ['Subscriptions', String(statusCounts.Subscriptions)],
      ['Total Bookings', String(totalBookings)],
      ['Total Amount (INR)', String(totalAmount)]
    ]

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows
        .map(r =>
          r
            .map(v => String(v).replaceAll('"', '""'))
            .map(v => (/[,"]/.test(v) ? '"' + v + '"' : v))
            .join(',')
        )
        .join('\n')

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
      {/* Download Report Button */}
      <Grid size={{ xs: 12 }}>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <Typography variant='h5' fontWeight='bold' color='text.primary'>
            Dashboard
          </Typography>
          <div className='flex flex-wrap items-center gap-3'>
            <TextField
              label='From Date'
              type='date'
              size='small'
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                width: 150,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
            <TextField
              label='To Date'
              type='date'
              size='small'
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                width: 150,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
            {(fromDate || toDate) && (
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => {
                  setFromDate('')
                  setToDate('')
                }}
                size='small'
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  height: 38
                }}
              >
                Clear
              </Button>
            )}
            <Button variant='contained' size='small' onClick={handleDownloadQR}>
              <i className='ri-qr-code-line mr-2'></i> Download QR
            </Button>
            <Button variant='contained' size='small' onClick={handleDownloadClick}>
              Download Report
            </Button>
            <Menu anchorEl={downloadAnchorEl} open={downloadMenuOpen} onClose={handleDownloadClose}>
              <MenuItem onClick={exportSummaryToCSV}>Export Summary (matches tiles)</MenuItem>
              <MenuItem onClick={exportXlsxByStatus}>Export XLSX by Status (multiple sheets)</MenuItem>
              <MenuItem onClick={exportToCSV}>Export Detailed (all bookings)</MenuItem>
            </Menu>
          </div>
        </div>
      </Grid>

      {/* First Row: Award Card + Total Amount (Main Card) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Award />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <CardStatVertical
          stats={`₹${totalAmount.toLocaleString('en-IN')}`}
          title='Total Amount'
          trendNumber='45%'
          avatarColor='success'
          avatarIcon='ri-money-rupee-circle-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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

      {/* Second Row: More Stats */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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

      {/* Third Row: Charts */}
      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <StackedBarChart />
      </Grid>
      {/* <Grid size={{ xs: 12, sm: 6, md: 2 }}>
        <DonutChart />
      </Grid> */}
      <Grid size={{ xs: 12, md: 4 }}>
        <OrganicSessions />
      </Grid>
    </Grid>
  )
}

export default DashboardCRM
