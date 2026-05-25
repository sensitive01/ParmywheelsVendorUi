'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Container,
  CircularProgress
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { DataGrid } from '@mui/x-data-grid'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

const UserBookings = () => {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const urlSubunitId = searchParams?.get('subunitId')
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.parkmywheels.com'

  const [transactions, setTransactions] = useState([])
  const [subunits, setSubunits] = useState([])
  const [selectedSubunit, setSelectedSubunit] = useState(urlSubunitId || 'all') // 'all', 'main', or subunit ID
  const [isLoading, setIsLoading] = useState(false)
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [bookingTypeFilter, setBookingTypeFilter] = useState('user')
  const open = Boolean(anchorEl)

  const getCurrentDate = () => {
    const today = new Date()

    return today.toISOString().split('T')[0]
  }

  const [startDate, setStartDate] = useState(getCurrentDate())
  const [endDate, setEndDate] = useState(getCurrentDate())

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const formatDateForDisplay = dateString => {
    if (!dateString) return ''
    const [day, month, year] = dateString.split('-')

    return `${day}-${month}-${year}`
  }

  // Parse date strings: ISO, YYYY-MM-DD, or DD-MM-YYYY
  const parseToDate = str => {
    if (!str) return null
    if (typeof str !== 'string') return new Date(str)
    if (str.includes('T')) return new Date(str)

    if (str.includes('-')) {
      const parts = str.split('-')

      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(str)
      } else if (parts[2]?.length === 4) {
        // DD-MM-YYYY
        const [day, month, year] = parts

        return new Date(`${year}-${month}-${day}`)
      }
    }

    return null
  }

  // Decide which date field to use for sorting
  const getItemDate = item => item.parkingDate || item.bookingDate || item.createdAt || null

  const filteredTransactions = transactions.filter(item => {
    const vendorId = session?.user?.id

    if (!vendorId) return true

    // Identify if the booking is a vendor-created booking
    // A booking is vendor-created if userid is missing, OR if userid matches the vendorId of the booking
    const isVendorCreated = !item.userid || String(item.userid) === String(item.vendorid || vendorId)

    if (bookingTypeFilter === 'user') {
      return !isVendorCreated
    } else {
      return isVendorCreated
    }
  })

  // Use filteredTransactions for totals
  const getTotalReceivable = () => {
    return filteredTransactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.receivable.replace('₹', '')) || 0

      return total + amount
    }, 0)
  }

  // Fetch subunits list on mount
  useEffect(() => {
    const fetchSubunitsList = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await axios.get(`${API_URL}/vendor/subunits/${session.user.id}`)
          if (response.data?.success) {
            setSubunits(response.data.data || [])
          }
        } catch (e) {
          console.error("Error fetching subunits list for filter dropdown:", e)
        }
      }
    }
    fetchSubunitsList()
  }, [status, session])

  // Fetch transactions when vendor session or selected location changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchTransactions(session.user.id)
    } else if (status === 'unauthenticated') {
      setSnackbar({
        open: true,
        message: 'Please login to view your transactions',
        severity: 'warning'
      })
    }
  }, [status, session, selectedSubunit])

  const fetchTransactions = async userId => {
    setIsLoading(true)

    try {
      const params = {}
      if (selectedSubunit === 'all') {
        params.includeSubunits = 'true'
      } else if (selectedSubunit !== 'main') {
        params.subunitId = selectedSubunit
      }

      const response = await axios.get(`${API_URL}/vendor/userbookingtrans/${userId}`, { params })

      if (response.status === 200) {
        const raw = response.data.data || []

        // Sort newest first using parkingDate -> bookingDate -> createdAt
        const sorted = [...raw].sort((a, b) => {
          const ad = parseToDate(getItemDate(a)) || 0
          const bd = parseToDate(getItemDate(b)) || 0

          return bd - ad
        })

        // Deduplicate by invoiceid to prevent repeated bookings
        const uniqueInvoices = new Set()
        const uniqueDataFiltered = []

        sorted.forEach(item => {
          const invId = item.invoiceid || item._id

          if (!uniqueInvoices.has(invId)) {
            uniqueInvoices.add(invId)
            uniqueDataFiltered.push(item)
          }
        })

        const data = uniqueDataFiltered.map((item, index) => ({
          id: item._id,
          serialNo: index + 1,
          bookingId: item.invoiceid || item._id,
          userid: item.userid,
          vendorid: item.vendorid || item.vendorId, // include vendorid for correct filtering
          bookingDate: item.bookingDate || 'N/A',
          parkingDate: item.parkingDate || 'N/A',
          parkingTime: item.parkingTime || 'N/A',
          bookingAmount: `₹${item.amount}`,
          handlingFee: `₹${item.handlingfee === 'NaN' ? '0.00' : item.handlingfee}`,
          releaseFee: `₹${item.releasefee === 'NaN' ? '0.00' : item.releasefee}`,
          receivable: `₹${item.recievableamount === 'NaN' ? item.amount : item.recievableamount}`,
          payableAmount: `₹${item.payableamout === 'NaN' ? item.amount : item.payableamout}`,
          vehicleNumber: item.vehicleNumber || item.vehiclenumber || 'N/A',
          gstAmount: `₹${item.gstamout || '0.00'}`,
          totalAmount: `₹${item.totalamout || item.amount}`
        }))

        setTransactions(data)
      } else {
        setSnackbar({
          open: true,
          message: 'Error fetching transactions: ' + response.statusText,
          severity: 'error'
        })
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching transactions: ' + error.message,
        severity: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyDateFilter = () => {
    const filtered = transactions.filter(t => {
      const [day, month, year] = t.parkingDate.split('-')
      const transactionDate = new Date(`${year}-${month}-${day}`)
      const start = new Date(startDate)
      const end = new Date(endDate)

      return transactionDate >= start && transactionDate <= end
    })

    setTransactions(filtered)
    setDateDialogOpen(false)
  }

  const handleClearFilters = () => {
    const currentDate = getCurrentDate()

    setStartDate(currentDate)
    setEndDate(currentDate)
    if (session?.user?.id) {
      fetchTransactions(session.user.id)
    }
    setDateDialogOpen(false)
  }

  const handleDownloadClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDownloadClose = () => {
    setAnchorEl(null)
  }

  const exportToExcel = () => {
    if (filteredTransactions.length === 0) {
      setSnackbar({
        open: true,
        message: 'No data to export',
        severity: 'warning'
      })

      return
    }

    // Create CSV content based on rows
    const headers = [
      'S.No',
      'Booking ID',
      'Vehicle Number',
      'Date',
      'Time',
      'Charges',
      ...(bookingTypeFilter === 'user' ? ['GST Amount', 'Handling Fee'] : []),
      'Platform Fee',
      'Receivable Amount',
      'Total Amount'
    ]

    const rows = filteredTransactions.map(t => {
      const row = [t.serialNo, t.bookingId, t.vehicleNumber, t.parkingDate, t.parkingTime, t.bookingAmount]

      if (bookingTypeFilter === 'user') {
        row.push(t.gstAmount)
        row.push(t.handlingFee)
      }

      row.push(`-${t.releaseFee}`) // Platform fee as negative
      row.push(t.receivable)
      row.push(t.totalAmount)

      return row
    })

    let csvContent =
      'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')

    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `transactions_${bookingTypeFilter}_${startDate}_to_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    handleDownloadClose()
  }

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      setSnackbar({
        open: true,
        message: 'No data to export',
        severity: 'warning'
      })

      return
    }

    // Create a simple HTML table for PDF
    const htmlContent = `
      <html>
        <head>
          <title>Transactions Report</title>
          <style>
            table { border-collapse: collapse; width: 100%; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
            .title { text-align: center; margin-bottom: 20px; }
            .date-range { margin-bottom: 20px; }
            .total { margin-top: 20px; font-weight: bold; }
            .negative { color: #ff4d49; }
            .positive { color: #22c55e; }
          </style>
        </head>
        <body>
          <h1 class="title">${bookingTypeFilter === 'user' ? 'User' : 'Vendor'} Booking Transactions Report</h1>
          <div class="date-range">Date Range: ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}</div>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Booking ID</th>
                <th>Vehicle Number</th>
                <th>Date</th>
                <th>Time</th>
                <th>Charges</th>
                ${bookingTypeFilter === 'user' ? '<th>GST</th><th>Handling Fee</th>' : ''}
                <th>Platform Fee</th>
                <th>Receivable</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions
                .map(
                  t => `
                <tr>
                  <td>${t.serialNo}</td>
                  <td>${t.bookingId}</td>
                  <td>${t.vehicleNumber}</td>
                  <td>${t.parkingDate}</td>
                  <td>${t.parkingTime}</td>
                  <td>${t.bookingAmount}</td>
                  ${bookingTypeFilter === 'user' ? `<td>${t.gstAmount}</td><td>${t.handlingFee}</td>` : ''}
                  <td class="negative">- ${t.releaseFee}</td>
                  <td class="positive">${t.receivable}</td>
                  <td><b>${t.totalAmount}</b></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="total">Total Receivable: ₹${getTotalReceivable().toFixed(2)}</div>
        </body>
      </html>
    `

    // Open print dialog which allows saving as PDF
    const win = window.open('', '_blank')

    win.document.write(htmlContent)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
    }, 1000)

    handleDownloadClose()
  }

  const columns = [
    { field: 'serialNo', headerName: 'S.No', width: 70 },
    { field: 'bookingId', headerName: 'Booking ID', width: 200 },
    { field: 'vehicleNumber', headerName: 'Vehicle Number', width: 140 },
    { field: 'parkingDate', headerName: 'Date', width: 120 },
    { field: 'parkingTime', headerName: 'Time', width: 100 },
    { field: 'bookingAmount', headerName: 'Charges', width: 100, align: 'right', headerAlign: 'right' },
    ...(bookingTypeFilter === 'user'
      ? [
          { field: 'gstAmount', headerName: 'GST', width: 100, align: 'right', headerAlign: 'right' },
          { field: 'handlingFee', headerName: 'Handling Fee', width: 120, align: 'right', headerAlign: 'right' }
        ]
      : []),
    {
      field: 'releaseFee',
      headerName: 'Platform Fee',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: params => (
        <Typography color='error.main' fontWeight='500'>
          - {params.value}
        </Typography>
      )
    },
    {
      field: 'receivable',
      headerName: 'Receivable',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: params => (
        <Typography color='success.main' fontWeight='600'>
          {params.value}
        </Typography>
      )
    },
    { field: 'totalAmount', headerName: 'Total Amount', width: 120, align: 'right', headerAlign: 'right' }
  ]

  return (
    <Box
      sx={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        padding: 3
      }}
    >
      <Container maxWidth="xl">
        {/* Header Row */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            mb: 4, 
            gap: 2 
          }}
        >
          <Box>
            <Typography variant='h4' fontWeight="bold" color="text.primary">
              Transactions & Bookings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track payments, receivables, and platform fees across all booking channels.
            </Typography>
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <InputLabel id="location-select-label">Location / Subunit Filter</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={selectedSubunit}
              label="Location / Subunit Filter"
              onChange={(e) => setSelectedSubunit(e.target.value)}
              sx={{ 
                borderRadius: '8px', 
                bgcolor: 'background.paper',
                '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
              }}
              startAdornment={<i className="ri-map-pin-line text-lg" style={{ color: 'var(--mui-palette-text-secondary)', marginRight: '8px' }} />}
            >
              <MenuItem value="all">All Locations (Main + Subunits)</MenuItem>
              <MenuItem value="main">Main Location Only</MenuItem>
              {subunits.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name} (Subunit)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Dashboard Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: '24px !important' }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '8px', 
                    bgcolor: 'success.lightOpacity', 
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="ri-money-rupee-circle-line text-3xl" style={{ color: 'var(--mui-palette-success-main)' }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">Total Revenue</Typography>
                  <Typography variant="h5" fontWeight="bold">₹{getTotalReceivable().toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: '24px !important' }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '8px', 
                    bgcolor: 'primary.lightOpacity', 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="ri-file-list-3-line text-3xl" style={{ color: 'var(--mui-palette-primary-main)' }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">Total Bookings</Typography>
                  <Typography variant="h5" fontWeight="bold">{filteredTransactions.length}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: '24px !important' }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '8px', 
                    bgcolor: 'info.lightOpacity', 
                    color: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="ri-calendar-line text-3xl" style={{ color: 'var(--mui-palette-info-main)' }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">Date Range</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                    {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 18px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Control Bar */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                justifyContent: 'space-between', 
                alignItems: { xs: 'stretch', md: 'center' }, 
                gap: 2, 
                mb: 4 
              }}
            >
              {/* Booking Source Toggle Buttons */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  bgcolor: 'action.hover', 
                  p: '4px', 
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  width: 'fit-content'
                }}
              >
                {['user', 'vendor'].map(type => (
                  <Button
                    key={type}
                    onClick={() => setBookingTypeFilter(type)}
                    variant={bookingTypeFilter === type ? 'contained' : 'text'}
                    color="success"
                    size="small"
                    sx={{
                      textTransform: 'capitalize',
                      px: 3,
                      py: 1,
                      borderRadius: '6px',
                      fontWeight: 600,
                      boxShadow: bookingTypeFilter === type ? '0 2px 6px rgba(34, 197, 94, 0.2)' : 'none',
                      color: bookingTypeFilter === type ? 'white' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: bookingTypeFilter === type ? 'success.main' : 'action.selected'
                      }
                    }}
                  >
                    {type === 'user' ? 'User Bookings' : 'Vendor Bookings'}
                  </Button>
                ))}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant='outlined'
                  color="secondary"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => setDateDialogOpen(true)}
                  size='small'
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 2, py: 1 }}
                >
                  Filter Dates
                </Button>
                <Button 
                  variant='outlined' 
                  color="secondary"
                  onClick={handleDownloadClick} 
                  size='small'
                  sx={{ borderRadius: '8px', textTransform: 'none', px: 2, py: 1 }}
                  startIcon={<i className="ri-download-line" />}
                >
                  Download Report
                </Button>
                <Menu anchorEl={anchorEl} open={open} onClose={handleDownloadClose}>
                  <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
                  <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
                </Menu>
              </Box>
            </Box>

            {status === 'loading' || isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : status === 'unauthenticated' ? (
              <Typography sx={{ textAlign: 'center', color: 'gray', py: 8 }}>Please login to view your transactions</Typography>
            ) : transactions.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'gray', py: 8 }}>No transactions found.</Typography>
            ) : (
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={filteredTransactions}
                  columns={columns}
                  pageSizeOptions={[5, 10, 20]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } }
                  }}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: 'action.hover', color: 'text.primary', fontWeight: 'bold' },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)}>
        <DialogTitle>Filter Transactions by Date</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: '300px' }}>
            <TextField
              label='Start Date'
              type='date'
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label='End Date'
              type='date'
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters} color='secondary'>
            Reset to Today
          </Button>
          <Button onClick={handleApplyDateFilter} color='primary' variant='contained'>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default UserBookings
