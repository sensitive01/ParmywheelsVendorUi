'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import { useSearchParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

// Third-party Imports
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, parse, isValid, isAfter, isBefore, isSameDay } from 'date-fns'

const TransactionsPage = () => {
  // Session
  const { data: session } = useSession()
  const vendorId = session?.user?.id
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'user' ? 1 : 0

  // Stats
  const [activeTab, setActiveTab] = useState(initialTab) // 0: Vendor, 1: User

  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab === 'user') setActiveTab(1)
    else if (tab === 'vendor') setActiveTab(0)
  }, [searchParams])

  // Actually Flutter code: 0 = Vendor Bookings, 1 = User Bookings.
  // We will stick to: 0 = Vendor Bookings, 1 = User Bookings.

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [userTransactions, setUserTransactions] = useState([])
  const [vendorTransactions, setVendorTransactions] = useState([]) // Non-user transactions

  // Date Filter
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)))
  const [endDate, setEndDate] = useState(new Date())

  useEffect(() => {
    if (vendorId) {
      fetchTransactions()
    }
  }, [vendorId])

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)

    try {
      const [userRes, vendorRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/userbookingtrans/${vendorId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/nonuserbookings/${vendorId}`)
      ])

      const userData = await userRes.json()
      const vendorData = await vendorRes.json()

      if (userData.success && Array.isArray(userData.data)) {
        setUserTransactions(userData.data)
      } else {
        setUserTransactions([])
      }

      if (vendorData.success && Array.isArray(vendorData.data)) {
        setVendorTransactions(vendorData.data)
      } else {
        setVendorTransactions([])
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  // Sort State
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })

  const handleSort = key => {
    let direction = 'asc'

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }

    setSortConfig({ key, direction })
  }

  // Helper date parser
  const parseTransactionDate = dateStr => {
    if (!dateStr || dateStr === 'N/A') return null

    // Try standard ISO first if it matches
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return new Date(dateStr)
    }

    const formats = ['dd-MM-yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy']

    for (const fmt of formats) {
      const d = parse(dateStr, fmt, new Date())

      if (isValid(d)) {
        return d
      }
    }

    return null
  }

  // Filter Logic
  const getFilteredTransactions = isUserBooking => {
    const data = isUserBooking ? userTransactions : vendorTransactions

    // 1. Filter by Date Range
    const filtered =
      !startDate || !endDate
        ? data
        : data.filter(item => {
            const dateStr = item.parkingDate || item.bookingDate
            const parsedDate = parseTransactionDate(dateStr)

            if (!parsedDate) return false

            // Normalize to start of day
            const check = new Date(parsedDate)

            check.setHours(0, 0, 0, 0)
            const start = new Date(startDate)

            start.setHours(0, 0, 0, 0)
            const end = new Date(endDate)

            end.setHours(0, 0, 0, 0)

            return check >= start && check <= end
          })

    // 2. Sort Logic
    return filtered.sort((a, b) => {
      // Default Sort (createdAt desc) if no specific sort key or if key is 'createdAt'
      if (sortConfig.key === 'createdAt') {
        const dir = sortConfig.direction === 'asc' ? 1 : -1

        // Priority 1: CreatedAt
        if (a.createdAt && b.createdAt) {
          const dateA = new Date(a.createdAt)
          const dateB = new Date(b.createdAt)

          if (dateA.getTime() !== dateB.getTime()) {
            return (dateA - dateB) * dir
          }
        }

        // Priority 2: Parking Date (Fallback if createdAt missing or equal)
        const parkA = parseTransactionDate(a.parkingDate || a.bookingDate)
        const parkB = parseTransactionDate(b.parkingDate || b.bookingDate)

        if (parkA && parkB && parkA.getTime() !== parkB.getTime()) {
          return (parkA - parkB) * dir
        }

        // Priority 3: Exit Date (Fallback)
        const exitA = parseTransactionDate(a.exitdate)
        const exitB = parseTransactionDate(b.exitdate)

        if (exitA && exitB) {
          return (exitA - exitB) * dir
        }

        return 0
      }

      if (sortConfig.key === 'parkingDate') {
        const dateA = parseTransactionDate(a.parkingDate || a.bookingDate)
        const dateB = parseTransactionDate(b.parkingDate || b.bookingDate)

        if (!dateA || !dateB) return 0

        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      }

      if (sortConfig.key === 'exitDate') {
        const dateA = parseTransactionDate(a.exitdate)
        const dateB = parseTransactionDate(b.exitdate)

        if (!dateA || !dateB) return 0

        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      }

      return 0
    })
  }

  // Totals
  const calculateTotals = isUserBooking => {
    const data = getFilteredTransactions(isUserBooking)

    // Helper
    const sum = field => data.reduce((acc, curr) => acc + (parseFloat(curr[field] || 0) || 0), 0)

    return {
      totalAmount: sum('totalamout'),
      platformFee: sum('releasefee'),
      receivable: sum('recievableamount'),
      gst: sum('gstamout'),
      vendorTotal: sum('amount')
    }
  }

  const exportToCSV = () => {
    const isUserBooking = activeTab === 1
    const data = getFilteredTransactions(isUserBooking)

    if (!data.length) return

    const headers = isUserBooking
      ? [
          'S.No',
          'Vehicle Number',
          'Parking Date',
          'Parking Time',
          'Exit Date',
          'Exit Time',
          'Charges',
          'GST',
          'Handling Fee',
          'Total Amount',
          'Platform Fee',
          'Receivable'
        ]
      : [
          'S.No',
          'Vehicle Number',
          'Parking Date',
          'Parking Time',
          'Exit Date',
          'Exit Time',
          'Amount',
          'Platform Fee',
          'Receivable'
        ]

    const rows = data.map((item, index) => {
      if (isUserBooking) {
        return [
          index + 1,
          item.vehiclenumber,
          item.parkingDate,
          item.parkingTime,
          item.exitdate, // Flutter matches exitdate
          item.exittime,
          item.amount, // Charges
          item.gstamout,
          item.handlingfee,
          item.totalamout,
          item.releasefee,
          item.recievableamount
        ]
      } else {
        return [
          index + 1,
          item.vehiclenumber, // Flutter uses vehiclenumber for vendor too in table
          item.parkingDate,
          item.parkingTime,
          item.exitdate,
          item.exittime,
          item.amount,
          item.releasefee,
          item.recievableamount
        ]
      }
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val !== undefined ? val : ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', `transactions_${isUserBooking ? 'user' : 'vendor'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totals = calculateTotals(activeTab === 1)
  const currentData = getFilteredTransactions(activeTab === 1)
  const isUser = activeTab === 1

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container justifyContent='space-between' alignItems='center' spacing={2}>
              <Grid item>
                <Typography variant='h5'>Booking Transactions</Typography>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    customInput={<TextField size='small' label='Start Date' />}
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    customInput={<TextField size='small' label='End Date' />}
                  />
                  <Button
                    variant='outlined'
                    onClick={() => {
                      setStartDate(null)
                      setEndDate(null)
                    }}
                  >
                    Clear
                  </Button>
                  <Button variant='contained' startIcon={<i className='ri-download-line' />} onClick={exportToCSV}>
                    Export
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item>
                  <Button variant={activeTab === 0 ? 'contained' : 'outlined'} onClick={() => setActiveTab(0)}>
                    Vendor Bookings
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant={activeTab === 1 ? 'contained' : 'outlined'} onClick={() => setActiveTab(1)}>
                    User Bookings
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Totals Section */}
            <Box sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Grid container spacing={4} justifyContent='space-around'>
                <Grid item>
                  <Typography variant='caption' color='text.secondary'>
                    Total Amount
                  </Typography>
                  <Typography variant='h6' color='primary.main'>
                    ₹{isUser ? totals.totalAmount?.toFixed(2) : totals.vendorTotal?.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption' color='text.secondary'>
                    Platform Fee
                  </Typography>
                  <Typography variant='h6' color='error.main'>
                    ₹{totals.platformFee?.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption' color='text.secondary'>
                    Total Receivable
                  </Typography>
                  <Typography variant='h6' color='success.main'>
                    ₹{totals.receivable?.toFixed(2)}
                  </Typography>
                </Grid>
                {isUser && (
                  <Grid item>
                    <Typography variant='caption' color='text.secondary'>
                      Total GST
                    </Typography>
                    <Typography variant='h6' color='info.main'>
                      ₹{totals.gst?.toFixed(2)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity='error'>{error}</Alert>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
                <Table size='small'>
                  <TableHead sx={{ bgcolor: 'secondary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white' }}>S.No</TableCell>
                      <TableCell sx={{ color: 'white' }}>Vehicle Number</TableCell>

                      {/* Sortable Parking Date */}
                      <TableCell
                        sx={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('parkingDate')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Parking Date
                          {sortConfig.key === 'parkingDate' && (
                            <i
                              className={sortConfig.direction === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                            />
                          )}
                          {sortConfig.key !== 'parkingDate' && (
                            <i className='ri-arrow-up-down-line' style={{ opacity: 0.5, fontSize: '0.8em' }} />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: 'white' }}>Parking Time</TableCell>

                      {/* Sortable Exit Date */}
                      <TableCell
                        sx={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('exitDate')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          Exit Date
                          {sortConfig.key === 'exitDate' && (
                            <i
                              className={sortConfig.direction === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                            />
                          )}
                          {sortConfig.key !== 'exitDate' && (
                            <i className='ri-arrow-up-down-line' style={{ opacity: 0.5, fontSize: '0.8em' }} />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: 'white' }}>Exit Time</TableCell>
                      {isUser ? (
                        <>
                          <TableCell sx={{ color: 'white' }}>Charges</TableCell>
                          <TableCell sx={{ color: 'white' }}>GST</TableCell>
                          <TableCell sx={{ color: 'white' }}>Handling Fee</TableCell>
                          <TableCell sx={{ color: 'white' }}>Total</TableCell>
                        </>
                      ) : (
                        <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                      )}
                      <TableCell sx={{ color: 'white' }}>Platform Fee</TableCell>
                      <TableCell sx={{ color: 'white' }}>Receivable</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentData.length > 0 ? (
                      currentData.map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.vehiclenumber}</TableCell>
                          <TableCell>{row.parkingDate}</TableCell>
                          <TableCell>{row.parkingTime}</TableCell>
                          <TableCell>{row.exitdate}</TableCell>
                          <TableCell>{row.exittime}</TableCell>
                          {isUser ? (
                            <>
                              <TableCell>₹{row.amount}</TableCell>
                              <TableCell>₹{row.gstamout}</TableCell>
                              <TableCell>₹{row.handlingfee}</TableCell>
                              <TableCell>₹{row.totalamout}</TableCell>
                            </>
                          ) : (
                            <TableCell>₹{row.amount}</TableCell>
                          )}
                          <TableCell sx={{ color: 'error.main' }}>₹{row.releasefee}</TableCell>
                          <TableCell sx={{ color: 'success.main' }}>₹{row.recievableamount}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isUser ? 12 : 9} align='center'>
                          <Typography sx={{ py: 4, color: 'text.secondary' }}>No transactions found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TransactionsPage
