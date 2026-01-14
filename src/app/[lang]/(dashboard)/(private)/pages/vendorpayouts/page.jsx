'use client'

import { useState, useEffect, useMemo } from 'react'

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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import { useSession } from 'next-auth/react'

const VendorPayOuts = () => {
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [viewMoreDialogOpen, setViewMoreDialogOpen] = useState(false)
  const [selectedSettlement, setSelectedSettlement] = useState(null)
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [summaryData, setSummaryData] = useState({
    totalParkingAmount: 0,
    totalPlatformFee: 0,
    totalReceivable: 0
  })

  const getCurrentDate = () => {
    const today = new Date()

    return today.toISOString().split('T')[0]
  }

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

  const handleSort = key => {
    let direction = 'asc'

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }

    setSortConfig({ key, direction })
  }

  const parseDateTimeHelper = (dateStr, timeStr) => {
    if (!dateStr) return null
    let date = new Date()

    // Parse Date
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      date = new Date(dateStr)
    } else if (dateStr.match(/^\d{2}-\d{2}-\d{4}/)) {
      const [day, month, year] = dateStr.split('-')

      date = new Date(`${year}-${month}-${day}`)
    } else {
      date = new Date(dateStr)
    }

    // Parse Time if present (e.g., "7:17 AM")
    if (timeStr) {
      const [time, period] = timeStr.split(' ')

      if (time && period) {
        let [hours, minutes] = time.split(':')

        hours = parseInt(hours)
        minutes = parseInt(minutes)

        if (period.toUpperCase() === 'PM' && hours < 12) hours += 12
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0

        date.setHours(hours, minutes, 0, 0)
      }
    } else {
      date.setHours(0, 0, 0, 0)
    }

    return date
  }

  const sortedTransactions = useMemo(() => {
    let sortableItems = [...transactions]

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = parseDateTimeHelper(a.date, a.time)
          const dateB = parseDateTimeHelper(b.date, b.time)

          if (!dateA || !dateB) return 0

          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
        }

        return 0
      })
    }

    return sortableItems
  }, [transactions, sortConfig])

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const formatDateForDisplay = dateString => {
    if (!dateString) return ''

    // If already in DD-MM-YYYY format
    if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
      return dateString
    }

    // If in YYYY-MM-DD format, convert to DD-MM-YYYY
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }

  const formatTimeForDisplay = timeString => {
    if (!timeString) return ''

    // Clean up input string
    let cleanTime = timeString.trim()

    // If already has AM/PM, normalize it
    if (cleanTime.match(/am|pm/i)) {
      // Extract parts: digits and am/pm
      const match = cleanTime.match(/(\d{1,2}:\d{2})\s*(am|pm)/i)

      if (match) {
        return `${match[1]} ${match[2].toUpperCase()}`
      }

      return cleanTime.toUpperCase()
    }

    // If time is in HH:MM:SS format (24h), convert to 12-hour format
    if (cleanTime.includes(':')) {
      const parts = cleanTime.split(':')
      let hours = parseInt(parts[0])
      const minutes = parts[1]
      const period = hours >= 12 ? 'PM' : 'AM'

      hours = hours % 12 || 12

      return `${hours}:${minutes} ${period}`
    }

    return cleanTime
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchTransactions(session.user.id, true)
    } else if (status === 'unauthenticated') {
      setSnackbar({
        open: true,
        message: 'Please login to view your transactions',
        severity: 'warning'
      })
    }
  }, [status, session])

  const fetchTransactions = async (vendorId, dateFilter = false) => {
    if (!vendorId) return

    setIsLoading(true)

    try {
      let url = `${NEXT_PUBLIC_API_URL}/vendor/fetchsettlement/${vendorId}`

      if (dateFilter && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`
      }

      const response = await axios.get(url)

      if (response.status === 200) {
        // Handle case when no settlements found
        if (!response.data.data || response.data.data.length === 0) {
          setTransactions([])

          setSummaryData({
            totalParkingAmount: '0.00',
            totalPlatformFee: '0.00',
            totalReceivable: '0.00'
          })
          setSnackbar({
            open: true,
            message: 'No settlement records found for this vendor',
            severity: 'info'
          })

          return
        }

        let settlements = response.data.data

        // Helper to parse dates (handles DD-MM-YYYY and YYYY-MM-DD)
        const parseSettlementDate = dateStr => {
          if (!dateStr) return null

          // If ISO format YYYY-MM-DD
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
            return new Date(dateStr)
          }

          // If DD-MM-YYYY
          if (dateStr.match(/^\d{2}-\d{2}-\d{4}/)) {
            const [day, month, year] = dateStr.split('-')

            return new Date(`${year}-${month}-${day}`)
          }

          return new Date(dateStr)
        }

        // Client-side filtering to ensure accuracy
        if (dateFilter && startDate && endDate) {
          const start = new Date(startDate)

          start.setHours(0, 0, 0, 0)
          const end = new Date(endDate)

          end.setHours(0, 0, 0, 0)

          settlements = settlements.filter(item => {
            const itemDate = parseSettlementDate(item.date)

            if (!itemDate || isNaN(itemDate.getTime())) return false
            itemDate.setHours(0, 0, 0, 0)

            return itemDate >= start && itemDate <= end
          })
        }

        const data = settlements.map((item, index) => ({
          id: item._id,
          serialNo: index + 1,
          settlementId: item.settlementid || item._id,
          orderId: item.orderid,
          date: item.date,
          time: item.time,
          parkingAmount: `₹${parseFloat(item.parkingamout || 0).toFixed(2)}`,
          platformFee: `₹${parseFloat(item.platformfee || 0).toFixed(2)}`,
          receivable: `₹${parseFloat(item.payableammout || 0).toFixed(2)}`,
          status: item.status || 'pending',
          bookings: item.bookings || [],
          gst: item.gst,
          tds: item.tds,
          bookingTotal: item.bookingtotal
        }))

        setTransactions(data)

        // Calculate summary
        const totalParkingAmount = settlements.reduce((sum, item) => sum + parseFloat(item.parkingamout || 0), 0)

        const totalPlatformFee = settlements.reduce((sum, item) => sum + parseFloat(item.platformfee || 0), 0)

        const totalReceivable = settlements.reduce((sum, item) => sum + parseFloat(item.payableammout || 0), 0)

        setSummaryData({
          totalParkingAmount: totalParkingAmount.toFixed(2),
          totalPlatformFee: totalPlatformFee.toFixed(2),
          totalReceivable: totalReceivable.toFixed(2)
        })
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)

      // Handle 404 - No settlements found
      if (error.response && error.response.status === 404) {
        setTransactions([])

        setSummaryData({
          totalParkingAmount: '0.00',
          totalPlatformFee: '0.00',
          totalReceivable: '0.00'
        })
        setSnackbar({
          open: true,
          message: 'No settlement records found for this vendor',
          severity: 'info'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyDateFilter = () => {
    if (session?.user?.id) {
      fetchTransactions(session.user.id, true)
    }

    setDateDialogOpen(false)
  }

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')

    if (session?.user?.id) {
      fetchTransactions(session.user.id, true)
    }

    setDateDialogOpen(false)
  }

  const handleViewMore = settlement => {
    setSelectedSettlement(settlement)
    setViewMoreDialogOpen(true)
  }

  const handleDownloadClick = event => {
    setDownloadAnchorEl(event.currentTarget)
  }

  const handleDownloadClose = () => {
    setDownloadAnchorEl(null)
  }

  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'

    // Add headers
    const headers = [
      'S.No',
      'Settlement ID',
      'Order ID',
      'Date',
      'Time',
      'Parking Amount',
      'Platform Fee',
      'Receivable',
      'Status'
    ]

    csvContent += headers.join(',') + '\r\n'

    // Add data rows
    transactions.forEach(transaction => {
      const row = [
        transaction.serialNo,
        `"${transaction.settlementId}"`,
        `"${transaction.orderId}"`,
        formatDateForDisplay(transaction.date),
        formatTimeForDisplay(transaction.time),
        transaction.parkingAmount,
        transaction.platformFee,
        transaction.receivable,
        transaction.status
      ]

      csvContent += row.join(',') + '\r\n'
    })

    // Add summary
    csvContent += '\r\n'
    csvContent += 'Summary\r\n'
    csvContent += `Total Parking Amount,₹${summaryData.totalParkingAmount}\r\n`
    csvContent += `Total Platform Fee,₹${summaryData.totalPlatformFee}\r\n`
    csvContent += `Total Receivable,₹${summaryData.totalReceivable}\r\n`

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')

    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `VendorPayouts_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    handleDownloadClose()
  }

  const exportToPDF = () => {
    const printContent = `
            <html>
                <head>
                    <title>Vendor Payouts Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #329a73; text-align: center; }
                        .summary {
                            margin-bottom: 20px;
                            background-color: #f5f5f5;
                            padding: 15px;
                            border-radius: 5px;
                        }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #329a73; color: white; padding: 10px; text-align: left; }
                        td { padding: 10px; border-bottom: 1px solid #ddd; }
                        .footer { margin-top: 30px; font-size: 0.8em; text-align: center; }
                        .status-settled { color: #329a73; font-weight: bold; }
                        .status-pending { color: #ff9800; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Vendor Payouts Report</h1>
                    <div class="summary">
                        <p><strong>Date Range:</strong> ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}</p>
                        <p><strong>Total Parking Amount:</strong> ₹${summaryData.totalParkingAmount}</p>
                        <p><strong>Total Platform Fee:</strong> ₹${summaryData.totalPlatformFee}</p>
                        <p><strong>Total Receivable:</strong> ₹${summaryData.totalReceivable}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Settlement ID</th>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Parking Amount</th>
                                <th>Platform Fee</th>
                                <th>Receivable</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions
                              .map(
                                transaction => `
                                <tr>
                                    <td>${transaction.serialNo}</td>
                                    <td>${transaction.settlementId}</td>
                                    <td>${transaction.orderId}</td>
                                    <td>${formatDateForDisplay(transaction.date)}</td>
                                    <td>${formatTimeForDisplay(transaction.time)}</td>
                                    <td>${transaction.parkingAmount}</td>
                                    <td>${transaction.platformFee}</td>
                                    <td>${transaction.receivable}</td>
                                    <td class="status-${transaction.status}">${transaction.status.toUpperCase()}</td>
                                </tr>
                            `
                              )
                              .join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                </body>
            </html>
        `

    const printWindow = window.open('', '_blank')

    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
    }

    handleDownloadClose()
  }

  return (
    <Box sx={{ backgroundColor: '#f4f4f4', minHeight: '100vh', padding: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 1400, margin: '0 auto', boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant='h5' component='h1' sx={{ mb: 3, fontWeight: 600, color: '#329a73' }}>
            Vendor Payouts & Settlements
          </Typography>

          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
            <Card sx={{ bgcolor: '#e8f5e9', p: 2, boxShadow: 1 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Total Parking Amount
              </Typography>
              <Typography variant='h5' sx={{ color: '#2e7d32', fontWeight: 600 }}>
                ₹{summaryData.totalParkingAmount}
              </Typography>
            </Card>
            <Card sx={{ bgcolor: '#fff3e0', p: 2, boxShadow: 1 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Total Platform Fee
              </Typography>
              <Typography variant='h5' sx={{ color: '#e65100', fontWeight: 600 }}>
                ₹{summaryData.totalPlatformFee}
              </Typography>
            </Card>
            <Card sx={{ bgcolor: '#e3f2fd', p: 2, boxShadow: 1 }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Total Receivable
              </Typography>
              <Typography variant='h5' sx={{ color: '#1565c0', fontWeight: 600 }}>
                ₹{summaryData.totalReceivable}
              </Typography>
            </Card>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                startIcon={<CalendarMonthIcon />}
                onClick={() => setDateDialogOpen(true)}
                sx={{
                  borderColor: '#329a73',
                  color: '#329a73',
                  '&:hover': {
                    borderColor: '#2a8a66',
                    backgroundColor: '#f0fdf4'
                  }
                }}
              >
                Filter Dates
              </Button>
              <Button
                variant='contained'
                onClick={handleDownloadClick}
                sx={{
                  backgroundColor: '#329a73',
                  '&:hover': {
                    backgroundColor: '#2a8a66'
                  }
                }}
              >
                Download Report
              </Button>
            </Box>
            <Box
              sx={{
                bgcolor: '#f0f8ff',
                padding: '8px 16px',
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant='body2' fontWeight='medium' color='#1976d2'>
                {startDate && endDate
                  ? `${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`
                  : 'All Dates'}
              </Typography>
            </Box>
          </Box>

          {status === 'loading' || isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#329a73' }} />
            </Box>
          ) : status === 'unauthenticated' ? (
            <Alert severity='warning'>Please login to view your transactions</Alert>
          ) : transactions.length === 0 ? (
            <Alert severity='info'>No transactions found for the selected date range.</Alert>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 2, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#329a73' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>S.No</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>
                        Settlement ID
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>
                        Order ID
                      </TableCell>
                      <TableCell
                        sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem', cursor: 'pointer' }}
                        onClick={() => handleSort('date')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Date
                          {sortConfig.key === 'date' && (
                            <i
                              className={sortConfig.direction === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                              style={{ fontSize: '1.2em' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>Time</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>
                        Parking Amount
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>
                        Platform Fee
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>
                        Receivable
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600, py: 2, fontSize: '0.95rem' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(transaction => (
                      <TableRow
                        key={transaction.id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>{transaction.serialNo}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {transaction.settlementId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#1976d2' }}>
                            {transaction.orderId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>{formatDateForDisplay(transaction.date)}</TableCell>
                        <TableCell sx={{ py: 2 }}>{formatTimeForDisplay(transaction.time)}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography sx={{ fontWeight: 500, color: '#329a73' }}>
                            {transaction.parkingAmount}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography sx={{ color: '#ff9800' }}>{transaction.platformFee}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography sx={{ fontWeight: 600, color: '#2e7d32' }}>{transaction.receivable}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={transaction.status.toUpperCase()}
                            size='small'
                            color={transaction.status.toLowerCase() === 'settled' ? 'success' : 'warning'}
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <IconButton color='primary' onClick={() => handleViewMore(transaction)} size='small'>
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component='div'
                count={transactions.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50]}
                sx={{
                  '.MuiTablePagination-toolbar': {
                    backgroundColor: '#fafafa'
                  }
                }}
              />
            </>
          )}

          {/* Date Filter Dialog */}
          <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)}>
            <DialogTitle>Filter Transactions by Date</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: '350px' }}>
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
              <Button onClick={() => setDateDialogOpen(false)} color='secondary'>
                Cancel
              </Button>
              <Button onClick={handleClearFilters} color='secondary'>
                Clear Filter
              </Button>
              <Button
                onClick={handleApplyDateFilter}
                variant='contained'
                sx={{
                  backgroundColor: '#329a73',
                  '&:hover': {
                    backgroundColor: '#2a8a66'
                  }
                }}
              >
                Apply
              </Button>
            </DialogActions>
          </Dialog>

          {/* View More Dialog */}
          <Dialog open={viewMoreDialogOpen} onClose={() => setViewMoreDialogOpen(false)} maxWidth='lg' fullWidth>
            <DialogTitle
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}
            >
              <Typography variant='h6' sx={{ color: '#329a73', fontWeight: 600 }}>
                Settlement Details
              </Typography>
              <IconButton onClick={() => setViewMoreDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {selectedSettlement && (
                <Box>
                  {/* Settlement Summary */}
                  <Card sx={{ mb: 3, bgcolor: '#f9fafb', boxShadow: 1 }}>
                    <CardContent>
                      <Typography variant='h6' gutterBottom sx={{ color: '#329a73', mb: 2 }}>
                        Settlement Summary
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                        <Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Settlement ID
                          </Typography>
                          <Typography variant='body1' fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                            {selectedSettlement.settlementId}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Order ID
                          </Typography>
                          <Typography
                            variant='body1'
                            fontWeight={500}
                            sx={{ fontFamily: 'monospace', color: '#1976d2' }}
                          >
                            {selectedSettlement.orderId}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Date & Time
                          </Typography>
                          <Typography variant='body1' fontWeight={500}>
                            {formatDateForDisplay(selectedSettlement.date)} at{' '}
                            {formatTimeForDisplay(selectedSettlement.time)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Status
                          </Typography>
                          <Chip
                            label={selectedSettlement.status.toUpperCase()}
                            size='small'
                            color={selectedSettlement.status.toLowerCase() === 'settled' ? 'success' : 'warning'}
                          />
                        </Box>
                        <Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Parking Amount
                          </Typography>
                          <Typography variant='h6' sx={{ color: '#329a73', fontWeight: 600 }}>
                            {selectedSettlement.parkingAmount}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Platform Fee
                          </Typography>
                          <Typography variant='h6' sx={{ color: '#ff9800', fontWeight: 600 }}>
                            {selectedSettlement.platformFee}
                          </Typography>
                        </Box>
                        <Box sx={{ gridColumn: 'span 2' }}>
                          <Typography variant='body2' color='text.secondary' gutterBottom>
                            Total Receivable
                          </Typography>
                          <Typography variant='h5' sx={{ color: '#2e7d32', fontWeight: 700 }}>
                            {selectedSettlement.receivable}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Bookings Table */}
                  {selectedSettlement.bookings && selectedSettlement.bookings.length > 0 && (
                    <>
                      <Typography variant='h6' gutterBottom sx={{ color: '#329a73', mb: 2 }}>
                        Associated Bookings ({selectedSettlement.bookings.length})
                      </Typography>
                      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                        <Table size='small'>
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#329a73' }}>
                              <TableCell sx={{ color: 'white', fontWeight: 600 }}>S.No</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Booking ID</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vehicle</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Parking Date</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Parking Time</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Exit Date</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Exit Time</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedSettlement.bookings.map((booking, index) => (
                              <TableRow key={booking._id} hover>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                    {booking._id}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant='body2' fontWeight={500}>
                                      {booking.vehicleType} - {booking.vehicleNumber}
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary'>
                                      {booking.vendorName}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{formatDateForDisplay(booking.parkingDate)}</TableCell>
                                <TableCell>{formatTimeForDisplay(booking.parkingTime)}</TableCell>
                                <TableCell>{formatDateForDisplay(booking.exitvehicledate)}</TableCell>
                                <TableCell>{formatTimeForDisplay(booking.exitvehicletime)}</TableCell>
                                <TableCell>
                                  <Typography fontWeight={500} sx={{ color: '#329a73' }}>
                                    ₹{parseFloat(booking.amount || 0).toFixed(2)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
          </Dialog>

          {/* Download Menu */}
          <Menu anchorEl={downloadAnchorEl} open={Boolean(downloadAnchorEl)} onClose={handleDownloadClose}>
            <MenuItem onClick={exportToCSV}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='ri-file-excel-line' style={{ fontSize: '18px' }} />
                Export to Excel
              </Box>
            </MenuItem>
            <MenuItem onClick={exportToPDF}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='ri-file-pdf-line' style={{ fontSize: '18px' }} />
                Export to PDF
              </Box>
            </MenuItem>
          </Menu>

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
        </CardContent>
      </Card>
    </Box>
  )
}

export default VendorPayOuts
