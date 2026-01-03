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
  MenuItem
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { DataGrid } from '@mui/x-data-grid'
import { useSession } from 'next-auth/react'

const UserBookings = () => {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
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

  const getTotalReceivable = () => {
    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.receivable.replace('₹', '')) || 0

      return total + amount
    }, 0)
  }

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
  }, [status, session])

  const fetchTransactions = async userId => {
    setIsLoading(true)

    try {
      const response = await axios.get(`https://api.parkmywheels.com/vendor/userbookingtrans/${userId}`)

      if (response.status === 200) {
        const raw = response.data.data || []

        // Sort newest first using parkingDate -> bookingDate -> createdAt
        const sorted = [...raw].sort((a, b) => {
          const ad = parseToDate(getItemDate(a)) || 0
          const bd = parseToDate(getItemDate(b)) || 0

          return bd - ad
        })

        const data = sorted.map((item, index) => ({
          id: item._id,
          serialNo: index + 1,
          bookingId: item._id,
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
    // Since the API doesn't support date filtering, we'll filter client-side
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
    fetchTransactions() // Refetch all data
    setDateDialogOpen(false)
  }

  const handleDownloadClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDownloadClose = () => {
    setAnchorEl(null)
  }

  const exportToExcel = () => {
    if (transactions.length === 0) {
      setSnackbar({
        open: true,
        message: 'No data to export',
        severity: 'warning'
      })

      return
    }

    // Create CSV content
    const headers = [
      'S.No',
      'Booking ID',
      'Vehicle Number',
      ' Date',
      ' Time',
      'Charges',
      'GST Amount',
      'Handling Fee',
      'Release Fee',
      'Receivable Amount',
      'Payable Amount',
      'Total Amount'
    ]

    const rows = transactions.map(t => [
      t.serialNo,
      t.bookingId,
      t.vehicleNumber,
      t.parkingDate,
      t.parkingTime,
      t.bookingAmount,
      t.gstAmount,
      t.handlingFee,
      t.releaseFee,
      t.receivable,
      t.totalAmount
    ])

    let csvContent =
      'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')

    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `transactions_${startDate}_to_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    handleDownloadClose()
  }

  const exportToPDF = () => {
    if (transactions.length === 0) {
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
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .title { text-align: center; margin-bottom: 20px; }
            .date-range { margin-bottom: 20px; }
            .total { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1 class="title">Booking Transactions Report</h1>
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
                <th>GST</th>
                <th>Handling Fee</th>
                <th>platform Fee</th>
                <th>Receivable</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactions
                .map(
                  t => `
                <tr>
                  <td>${t.serialNo}</td>
                  <td>${t.bookingId}</td>
                  <td>${t.vehicleNumber}</td>
                  <td>${t.parkingDate}</td>
                  <td>${t.parkingTime}</td>
                  <td>${t.bookingAmount}</td>
                    <td>${t.gstAmount}</td>
                  <td>${t.handlingFee}</td>
                  <td>${t.releaseFee}</td>
                  <td>${t.receivable}</td>
                  <td>${t.totalAmount}</td>
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

    // { field: "bookingDate", headerName: "Booking Date", width: 120 },
    { field: 'parkingDate', headerName: 'Date', width: 120 },
    { field: 'parkingTime', headerName: 'Time', width: 100 },
    { field: 'bookingAmount', headerName: 'Charges', width: 100 },
    { field: 'gstAmount', headerName: 'GST', width: 100 },
    { field: 'handlingFee', headerName: 'Handling Fee', width: 120 },
    { field: 'totalAmount', headerName: 'Total Amount', width: 120 },
    { field: 'releaseFee', headerName: 'Platform Fee', width: 120 },
    { field: 'receivable', headerName: 'Receivable', width: 120 }

    // { field: "payableAmount", headerName: "Payable", width: 120 },
  ]

  return (
    <Box
      sx={{
        backgroundColor: '#f4f4f4',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 1400, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant='h5' component='h1' sx={{ mb: 3, textAlign: 'center' }}>
            User Booking Transactions
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='outlined'
                startIcon={<CalendarMonthIcon />}
                onClick={() => setDateDialogOpen(true)}
                size='small'
              >
                Filter Dates
              </Button>
              <Button variant='outlined' onClick={handleDownloadClick} size='small'>
                Download
              </Button>
              <Menu anchorEl={anchorEl} open={open} onClose={handleDownloadClose}>
                <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
                <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
              </Menu>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: '#f5f5f5',
                  padding: '6px 12px',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography variant='body2' fontWeight='bold' color='#329a73'>
                  Total: ₹{getTotalReceivable().toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: '#f0f8ff',
                  padding: '6px 12px',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography variant='body2' fontWeight='medium' color='#1976d2'>
                  {`${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`}
                </Typography>
              </Box>
            </Box>
          </Box>

          {status === 'loading' || isLoading ? (
            <Typography sx={{ textAlign: 'center', color: 'gray' }}>Loading transactions...</Typography>
          ) : status === 'unauthenticated' ? (
            <Typography sx={{ textAlign: 'center', color: 'gray' }}>Please login to view your transactions</Typography>
          ) : transactions.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: 'gray' }}>No transactions found.</Typography>
          ) : (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={transactions}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#329a73', color: 'black' },
                  borderRadius: 2
                }}
              />
            </Box>
          )}

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
        </CardContent>
      </Card>
    </Box>
  )
}

export default UserBookings
