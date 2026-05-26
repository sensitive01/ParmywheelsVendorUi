'use client'

import { useState, useEffect } from 'react'

import { useSearchParams } from 'next/navigation'

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
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
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

  const getItemDateTime = item => {
    if (!item) return 0

    // Prefer exitdate/exittime if completed, or parkedDate/parkedTime, or parkingDate/parkingTime
    const dateStr = item.exitdate || item.parkedDate || item.parkingDate || item.bookingDate
    const timeStr = item.exittime || item.parkedTime || item.parkingTime || item.bookingTime

    if (!dateStr) return 0

    try {
      let year, month, day
      const dateParts = dateStr.split('-')

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
      const d = parseToDate(dateStr)

      return d ? d.getTime() : 0
    }
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Sort newest first using parkingDate -> bookingDate -> createdAt (and their times)
        const sorted = [...raw].sort((a, b) => {
          const ad = getItemDateTime(a)
          const bd = getItemDateTime(b)

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

        const getSubunitName = (vId) => {
          if (String(vId) === String(userId)) {
            return session?.user?.name || 'Main Location'
          }

          const sub = subunits.find(s => String(s.id) === String(vId))

          return sub ? sub.name : 'Subunit'
        }

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
          totalAmount: `₹${item.totalamout || item.amount}`,
          status: (item.status || 'PENDING').toUpperCase(),
          subunitName: getSubunitName(item.vendorid || item.vendorId || userId)
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

    const cleanAmount = val => {
      if (typeof val === 'number') return val
      if (!val) return 0

      return parseFloat(val.toString().replace(/[₹\s,]/g, '')) || 0
    }

    // 1. Grouping by Subunit and Status for Summary
    const grouping = {} // { [subunit]: { [status]: { count, amount } } }
    let grandTotalCount = 0
    let grandTotalAmount = 0

    filteredTransactions.forEach(t => {
      const sub = t.subunitName || 'Main Location'
      const status = t.status || 'PENDING'
      const amount = cleanAmount(t.totalAmount)

      if (!grouping[sub]) grouping[sub] = {}
      if (!grouping[sub][status]) grouping[sub][status] = { count: 0, amount: 0 }
      grouping[sub][status].count += 1
      grouping[sub][status].amount += amount

      grandTotalCount += 1
      grandTotalAmount += amount
    })

    // Construct Summary Sheet rows
    const summaryRows = [
      // Headers
      [
        { value: 'Subunit/Location', type: 'String', styleId: 'Header' },
        { value: 'Status', type: 'String', styleId: 'Header' },
        { value: 'Total Bookings (Completed/Other)', type: 'String', styleId: 'Header' },
        { value: 'Total Amount', type: 'String', styleId: 'Header' }
      ]
    ]

    Object.keys(grouping).forEach(sub => {
      Object.keys(grouping[sub]).forEach(status => {
        const item = grouping[sub][status]

        summaryRows.push([
          { value: sub, type: 'String' },
          { value: status, type: 'String' },
          { value: item.count, type: 'Number' },
          { value: item.amount.toFixed(2), type: 'Number' }
        ])
      })
    })

    // Add Grand Total row for summary
    summaryRows.push([
      { value: 'Grand Total', type: 'String', styleId: 'BoldText' },
      { value: '', type: 'String' },
      { value: grandTotalCount, type: 'Number', styleId: 'BoldText' },
      { value: grandTotalAmount.toFixed(2), type: 'Number', styleId: 'BoldText' }
    ])

    const sheets = [
      { name: 'Summary', rows: summaryRows }
    ]

    // 2. Generate sheets for each status
    const uniqueStatuses = [...new Set(filteredTransactions.map(t => t.status || 'PENDING'))]

    uniqueStatuses.forEach(statusName => {
      const statusBookings = filteredTransactions.filter(t => t.status === statusName)
      const rows = []

      // Headers for detail sheet
      const detailHeaders = [
        { value: 'S.No', type: 'String', styleId: 'Header' },
        { value: 'Booking ID', type: 'String', styleId: 'Header' },
        { value: 'Subunit/Location', type: 'String', styleId: 'Header' },
        { value: 'Vehicle Number', type: 'String', styleId: 'Header' },
        { value: 'Date', type: 'String', styleId: 'Header' },
        { value: 'Time', type: 'String', styleId: 'Header' },
        { value: 'Charges', type: 'String', styleId: 'Header' }
      ]

      if (bookingTypeFilter === 'user') {
        detailHeaders.push({ value: 'GST Amount', type: 'String', styleId: 'Header' })
        detailHeaders.push({ value: 'Handling Fee', type: 'String', styleId: 'Header' })
      }

      detailHeaders.push(
        { value: 'Platform Fee', type: 'String', styleId: 'Header' },
        { value: 'Receivable Amount', type: 'String', styleId: 'Header' },
        { value: 'Total Amount', type: 'String', styleId: 'Header' }
      )

      rows.push(detailHeaders)

      // Detail rows & Sum Accumulators
      let totalCharges = 0
      let totalGst = 0
      let totalHandling = 0
      let totalPlatform = 0
      let totalReceivable = 0
      let totalAmount = 0

      statusBookings.forEach((t, index) => {
        const charges = cleanAmount(t.bookingAmount)
        const gst = cleanAmount(t.gstAmount)
        const handling = cleanAmount(t.handlingFee)
        const platform = cleanAmount(t.releaseFee)
        const receivable = cleanAmount(t.receivable)
        const amt = cleanAmount(t.totalAmount)

        totalCharges += charges
        totalGst += gst
        totalHandling += handling
        totalPlatform += platform
        totalReceivable += receivable
        totalAmount += amt

        const r = [
          { value: index + 1, type: 'Number' },
          { value: t.bookingId, type: 'String' },
          { value: t.subunitName || 'Main Location', type: 'String' },
          { value: t.vehicleNumber, type: 'String' },
          { value: t.parkingDate, type: 'String' },
          { value: t.parkingTime, type: 'String' },
          { value: charges.toFixed(2), type: 'Number' }
        ]

        if (bookingTypeFilter === 'user') {
          r.push({ value: gst.toFixed(2), type: 'Number' })
          r.push({ value: handling.toFixed(2), type: 'Number' })
        }

        r.push(
          { value: `-${platform.toFixed(2)}`, type: 'Number' },
          { value: receivable.toFixed(2), type: 'Number' },
          { value: amt.toFixed(2), type: 'Number' }
        )

        rows.push(r)
      })

      // Auto-Sum / Total row for this status
      const totalRow = [
        { value: 'Total', type: 'String', styleId: 'SubHeader' },
        { value: '', type: 'String', styleId: 'SubHeader' },
        { value: '', type: 'String', styleId: 'SubHeader' },
        { value: '', type: 'String', styleId: 'SubHeader' },
        { value: '', type: 'String', styleId: 'SubHeader' },
        { value: '', type: 'String', styleId: 'SubHeader' },
        { value: totalCharges.toFixed(2), type: 'Number', styleId: 'SubHeader' }
      ]

      if (bookingTypeFilter === 'user') {
        totalRow.push({ value: totalGst.toFixed(2), type: 'Number', styleId: 'SubHeader' })
        totalRow.push({ value: totalHandling.toFixed(2), type: 'Number', styleId: 'SubHeader' })
      }

      totalRow.push(
        { value: `-${totalPlatform.toFixed(2)}`, type: 'Number', styleId: 'SubHeader' },
        { value: totalReceivable.toFixed(2), type: 'Number', styleId: 'SubHeader' },
        { value: totalAmount.toFixed(2), type: 'Number', styleId: 'SubHeader' }
      )

      rows.push(totalRow)

      sheets.push({
        name: statusName,
        rows
      })
    })

    // Generate Excel SpreadsheetML XML
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#22C55E" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BoldText">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Bold="1"/>
  </Style>
 </Styles>`

    sheets.forEach(sheet => {
      xml += `\n <Worksheet ss:Name="${sheet.name.substring(0, 31)}">`
      xml += `\n  <Table>`

      sheet.rows.forEach(row => {
        xml += `\n   <Row>`
        row.forEach(cell => {
          const type = cell.type || 'String'
          const style = cell.styleId ? ` ss:StyleID="${cell.styleId}"` : ''

          xml += `<Cell${style}><Data ss:Type="${type}">${cell.value}</Data></Cell>`
        })
        xml += `</Row>`
      })

      xml += `\n  </Table>`
      xml += `\n </Worksheet>`
    })

    xml += `\n</Workbook>`

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_report_${bookingTypeFilter}_${startDate}_to_${endDate}.xls`)
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

    const cleanAmount = val => {
      if (typeof val === 'number') return val
      if (!val) return 0

      return parseFloat(val.toString().replace(/[₹\s,]/g, '')) || 0
    }

    // 1. Grouping by Subunit and Status for Summary Table
    const grouping = {} // { [subunit]: { [status]: { count, amount } } }
    let grandTotalCount = 0
    let grandTotalAmount = 0

    filteredTransactions.forEach(t => {
      const sub = t.subunitName || 'Main Location'
      const status = t.status || 'PENDING'
      const amount = cleanAmount(t.totalAmount)

      if (!grouping[sub]) grouping[sub] = {}
      if (!grouping[sub][status]) grouping[sub][status] = { count: 0, amount: 0 }
      grouping[sub][status].count += 1
      grouping[sub][status].amount += amount

      grandTotalCount += 1
      grandTotalAmount += amount
    })

    // Construct Summary Table HTML
    let summaryHtml = `
      <h3>Location & Status Group Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Subunit/Location</th>
            <th>Booking Status</th>
            <th style="text-align: right;">Total Bookings</th>
            <th style="text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
    `

    Object.keys(grouping).forEach(sub => {
      Object.keys(grouping[sub]).forEach(status => {
        const item = grouping[sub][status]

        summaryHtml += `
          <tr>
            <td>${sub}</td>
            <td><span class="badge badge-${status.toLowerCase()}">${status}</span></td>
            <td style="text-align: right;">${item.count}</td>
            <td style="text-align: right;">₹${item.amount.toFixed(2)}</td>
          </tr>
        `
      })
    })

    summaryHtml += `
          <tr class="total-row">
            <td>Grand Total</td>
            <td></td>
            <td style="text-align: right;">${grandTotalCount}</td>
            <td style="text-align: right;">₹${grandTotalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div style="page-break-after: always;"></div>
    `

    // 2. Detailed Bookings Grouped by Status
    const uniqueStatuses = [...new Set(filteredTransactions.map(t => t.status || 'PENDING'))]
    let detailedHtml = ''

    uniqueStatuses.forEach(statusName => {
      const statusBookings = filteredTransactions.filter(t => t.status === statusName)

      let totalCharges = 0
      let totalGst = 0
      let totalHandling = 0
      let totalPlatform = 0
      let totalReceivable = 0
      let totalAmount = 0

      detailedHtml += `
        <h3>Status: ${statusName} (${statusBookings.length} Bookings)</h3>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Booking ID</th>
              <th>Location</th>
              <th>Vehicle Number</th>
              <th>Date / Time</th>
              <th style="text-align: right;">Charges</th>
              ${bookingTypeFilter === 'user' ? '<th style="text-align: right;">GST</th><th style="text-align: right;">Handling</th>' : ''}
              <th style="text-align: right;">Platform Fee</th>
              <th style="text-align: right;">Receivable</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
      `

      statusBookings.forEach((t, index) => {
        const charges = cleanAmount(t.bookingAmount)
        const gst = cleanAmount(t.gstAmount)
        const handling = cleanAmount(t.handlingFee)
        const platform = cleanAmount(t.releaseFee)
        const receivable = cleanAmount(t.receivable)
        const amt = cleanAmount(t.totalAmount)

        totalCharges += charges
        totalGst += gst
        totalHandling += handling
        totalPlatform += platform
        totalReceivable += receivable
        totalAmount += amt

        detailedHtml += `
          <tr>
            <td>${index + 1}</td>
            <td>${t.bookingId}</td>
            <td>${t.subunitName || 'Main Location'}</td>
            <td>${t.vehicleNumber}</td>
            <td>${t.parkingDate} ${t.parkingTime}</td>
            <td style="text-align: right;">₹${charges.toFixed(2)}</td>
            ${bookingTypeFilter === 'user' ? `<td style="text-align: right;">₹${gst.toFixed(2)}</td><td style="text-align: right;">₹${handling.toFixed(2)}</td>` : ''}
            <td style="text-align: right; color: #ff4d49;">- ₹${platform.toFixed(2)}</td>
            <td style="text-align: right; color: #22c55e;">₹${receivable.toFixed(2)}</td>
            <td style="text-align: right; font-weight: bold;">₹${amt.toFixed(2)}</td>
          </tr>
        `
      })

      detailedHtml += `
            <tr class="total-row">
              <td>Total</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td style="text-align: right;">₹${totalCharges.toFixed(2)}</td>
              ${bookingTypeFilter === 'user' ? `<td style="text-align: right;">₹${totalGst.toFixed(2)}</td><td style="text-align: right;">₹${totalHandling.toFixed(2)}</td>` : ''}
              <td style="text-align: right;">- ₹${totalPlatform.toFixed(2)}</td>
              <td style="text-align: right;">₹${totalReceivable.toFixed(2)}</td>
              <td style="text-align: right;">₹${totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <br/><br/>
      `
    })

    const htmlContent = `
      <html>
        <head>
          <title>${bookingTypeFilter === 'user' ? 'User' : 'Vendor'} Bookings Transactions Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 20px; }
            h1 { text-align: center; color: #1e293b; margin-bottom: 5px; }
            h3 { color: #1e293b; border-bottom: 2px solid #22c55e; padding-bottom: 6px; margin-top: 30px; }
            .date-range { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 30px; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; margin-bottom: 10px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
            th { background-color: #f8fafc; color: #475569; font-weight: 600; }
            .total-row { background-color: #f1f5f9; font-weight: bold; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .badge-completed { background-color: #dcfce7; color: #16a34a; }
            .badge-pending { background-color: #fef9c3; color: #ca8a04; }
            .badge-approved { background-color: #dbeafe; color: #2563eb; }
            .badge-parked { background-color: #f3e8ff; color: #9333ea; }
            .badge-cancelled { background-color: #fee2e2; color: #dc2626; }
          </style>
        </head>
        <body>
          <h1>${bookingTypeFilter === 'user' ? 'User' : 'Vendor'} Bookings Transactions Report</h1>
          <div class="date-range">Date Range: ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}</div>
          
          ${summaryHtml}
          ${detailedHtml}
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
        <Typography component="span" variant="body2" color='error.main' fontWeight='500'>
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
        <Typography component="span" variant="body2" color='success.main' fontWeight='600'>
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
