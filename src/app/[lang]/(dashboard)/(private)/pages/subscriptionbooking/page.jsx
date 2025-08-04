'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import BookingActionButton from '@/views/apps/ecommerce/products/list/BookingActionButton'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const stsChipColor = {
  instant: { color: '#ff4d49', text: 'Instant' },
  subscription: { color: '#72e128', text: 'Subscription' },
  schedule: { color: '#fdb528', text: 'Scheduled' }
};

export const statusChipColor = {
  completed: { color: 'success' },
  pending: { color: 'warning' },
  parked: { color: '#666CFF' },
  cancelled: { color: 'error' },
  approved: { color: 'info' }
};

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const parseBookingDate = (dateStr) => {
  if (!dateStr) return null

  try {
    // If date is in YYYY-MM-DD format
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      return new Date(dateStr)
    }
    // If date is in DD-MM-YYYY format
    else if (dateStr.includes('-')) {
      const [day, month, year] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    return null
  } catch (e) {
    console.error("Error parsing date:", e, dateStr)
    return null
  }
}

// Function to calculate subscription days left
const calculateSubscriptionDaysLeft = (bookingDate, subscriptionType, sts) => {
  // If the booking type is not subscription, return null
  if (sts?.toLowerCase() !== 'subscription') return null

  // Parse the booking date
  const startDate = parseBookingDate(bookingDate)
  if (!startDate) return null

  const currentDate = new Date()

  // Default to monthly if subscriptionType is empty but booking is subscription type
  let durationInDays = 30 // Default to monthly (30 days)

  if (subscriptionType) {
    switch (subscriptionType.toLowerCase()) {
      case 'weekly':
        durationInDays = 7
        break
      case 'monthly':
        durationInDays = 30
        break
      case 'yearly':
        durationInDays = 365
        break
    }
  }

  // Calculate subscription end date
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + durationInDays)

  // If subscription has ended
  if (currentDate > endDate) return { days: 0, expired: true }

  // Calculate days remaining - using floor instead of ceil to fix the issue
  const daysLeft = Math.floor((endDate - currentDate) / (1000 * 60 * 60 * 24))
  return { days: daysLeft, expired: false }
}

// Format time from 24h to 12h format with AM/PM
const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return ''

  // If already in 12-hour format (contains AM/PM), return as-is
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr
  }

  // Convert 24-hour format to 12-hour
  try {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  } catch (e) {
    return timeStr
  }
}

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return 'N/A'

  try {
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
    else if (dateStr.includes('-')) {
      const [day, month, year] = dateStr.split('-')
      return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }

    return dateStr
  } catch (e) {
    console.error("Date parsing error:", e, dateStr)
    return dateStr
  }
}

const columnHelper = createColumnHelper()

const OrderListTable = ({ orderData }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState(data)
  const [error, setError] = useState(null)
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const vendorId = session?.user?.id
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const fetchData = async () => {
    if (!vendorId) return;

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`)
      console.log("response", response)

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const result = await response.json()

      if (result && result.bookings) {
        // Filter to only include subscription bookings
        const subscriptionBookings = result.bookings.filter(booking =>
          booking.sts?.toLowerCase() === 'subscription' &&
          ["pending", "approved", "cancelled", "parked", "completed"]
            .includes(booking.status.toLowerCase())
        )
        setData(subscriptionBookings)
        setFilteredData(subscriptionBookings)
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [vendorId])

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('vehicleNumber', {
        header: 'Vehicle Number',
        cell: ({ row }) => (
          <Typography style={{ color: '#666cff' }}>
            {row.original.vehicleNumber ? `#${row.original.vehicleNumber}` : 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('bookingDate', {
        header: 'Booking Date & Time',
        cell: ({ row }) => {
          const date = formatDateDisplay(row.original.bookingDate)
          const time = formatTimeDisplay(row.original.bookingTime)

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${date}, ${time}`}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <CustomAvatar src="/images/avatars/1.png" skin='light' size={34} />
            <div className="flex flex-col">
              <Typography className="font-medium">
                {row.original.personName || 'Unknown'}
              </Typography>
              <Typography variant="body2">
                {row.original.mobileNumber || 'N/A'}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('subscriptionType', {
        header: 'Subscription Type',
        cell: ({ row }) => {
          const subscriptionType = row.original.subsctiptiontype || 'Monthly'
          const subscriptionIcons = {
            weekly: { icon: 'ri-calendar-2-line', color: '#fdb528' },
            monthly: { icon: 'ri-calendar-check-line', color: '#72e128' },
            yearly: { icon: 'ri-calendar-event-line', color: '#666CFF' },
            default: { icon: 'ri-calendar-line', color: '#282a42' }
          }

          const { icon, color } = subscriptionIcons[subscriptionType.toLowerCase()] || subscriptionIcons.default

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {subscriptionType}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('subscriptionLeft', {
        header: 'Subscription Left',
        cell: ({ row }) => {
          // Calculate days left
          const dateToUse = row.original.parkingDate || row.original.bookingDate
          const subscriptionStatus = calculateSubscriptionDaysLeft(
            dateToUse,
            row.original.subsctiptiontype,
            row.original.sts
          )

          // If subscription information is missing
          if (!subscriptionStatus) {
            return <Typography variant="body2" sx={{ color: '#666' }}>N/A</Typography>
          }

          // If subscription expired
          if (subscriptionStatus.expired) {
            return (
              <Typography sx={{
                color: '#ff4d49',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <i className="ri-time-line" style={{ fontSize: '16px', color: '#ff4d49' }}></i>
                Expired
              </Typography>
            )
          }

          // Set color based on days left
          const daysLeft = subscriptionStatus.days
          const color = daysLeft === 0 ? '#ff4d49' :
            daysLeft <= 3 ? '#fdb528' : '#72e128'

          return (
            <Typography sx={{
              color,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <i className="ri-time-line" style={{ fontSize: '16px', color }}></i>
              {`${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const statusKey = row.original.status?.toLowerCase()
          const chipData = statusChipColor[statusKey] || { color: 'default' }

          return (
            <Chip
              label={row.original.status || 'N/A'}
              variant="tonal"
              size="small"
              sx={chipData.color.startsWith('#') ? {
                backgroundColor: chipData.color,
                color: 'white'
              } : {}}
              color={!chipData.color.startsWith('#') ? chipData.color : undefined}
            />
          )
        }
      }),
      columnHelper.accessor('vehicleType', {
        header: 'Vehicle Type',
        cell: ({ row }) => {
          const vehicleType = row.original.vehicleType?.toLowerCase()
          const vehicleIcons = {
            car: { icon: 'ri-car-fill', color: '#ff4d49' },
            bike: { icon: 'ri-motorbike-fill', color: '#72e128' },
            default: { icon: 'ri-roadster-fill', color: '#282a42' }
          }

          const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {row.original.vehicleType || 'N/A'}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-[22px]'
              options={[
                {
                  text: 'View',
                  icon: 'ri-eye-line',
                  menuItemProps: {
                    onClick: () => {
                      const selectedId = row.original._id
                      if (selectedId) {
                        router.push(`/apps/ecommerce/orders/details/${selectedId}`)
                      }
                    }
                  }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line',
                  menuItemProps: {
                    onClick: async () => {
                      try {
                        const selectedId = row.original._id
                        if (!selectedId) return

                        const isConfirmed = window.confirm("Are you sure you want to delete this booking?")
                        if (!isConfirmed) return

                        const response = await fetch(`${API_URL}/vendor/deletebooking/${selectedId}`, {
                          method: 'DELETE'
                        })

                        if (!response.ok) {
                          throw new Error('Failed to delete booking')
                        }

                        setData(prev => prev.filter(booking => booking._id !== selectedId))
                        setFilteredData(prev => prev.filter(booking => booking._id !== selectedId))
                      } catch (error) {
                        console.error('Error deleting booking:', error)
                      }
                    }
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('statusAction', {
        header: 'Change Status',
        cell: ({ row }) => (
          <BookingActionButton
            bookingId={row.original._id}
            currentStatus={row.original.status}
            onUpdate={fetchData}
          />
        ),
        enableSorting: false
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: filteredData.length > 0 || globalFilter ? filteredData : data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

// const handleExport = (type) => {
//   const exportData = filteredData.length > 0 || globalFilter ? filteredData : data;

//   if (type === 'excel') {
//     // ... (keep existing excel export code)
//   } else if (type === 'pdf') {
//     // Create HTML content with all required fields
//     const headers = [
//       'Vehicle Number',
   
//       'Booking Date',
//       'Booking Time',
//       'Parked Date',
//       'Parked Time',
//       'Exit Date',
//       'Exit Time',
//       'Customer Name',
//       'Mobile Number',
//       'Vehicle Type',
//       'Service Type',
//       'Status',
//       'Amount',
//       'Duration',
//       'Subscription Type',
//       'Days Left'
//     ];

//     const htmlContent = `
//       <html>
//         <head>
//           <title>Subscription Bookings</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 20px; }
//             h1 { color: #666cff; text-align: center; margin-bottom: 20px; }
//             table { border-collapse: collapse; width: 100%; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #f2f2f2; }
//             .expired { color: #ff4d49; }
//             .warning { color: #fdb528; }
//             .good { color: #72e128; }
//             @media print {
//               @page { 
//                 size: landscape; 
//                 margin: 10mm;
//               }
//               table { 
//                 font-size: 8pt;
//                 width: 100% !important;
//               }
//               th, td {
//                 padding: 4px !important;
//               }
//             }
//           </style>
//         </head>
//         <body>
//           <h1>Subscription Bookings</h1>
//           <table>
//             <thead>
//               <tr>
//                 ${headers.map(header => `<th>${header}</th>`).join('')}
//               </tr>
//             </thead>
//             <tbody>
//               ${exportData.map(row => {
//                 const daysLeft = calculateSubscriptionDaysLeft(
//                   row.parkingDate || row.bookingDate,
//                   row.subsctiptiontype,
//                   row.sts
//                 );
//                 const daysLeftClass = daysLeft?.expired 
//                   ? 'expired' 
//                   : daysLeft?.days <= 3 
//                     ? 'warning' 
//                     : 'good';
                
//                 return `
//                   <tr>
//                     <td>${row.vehicleNumber || 'N/A'}</td>
               
//                     <td>${formatDateDisplay(row.bookingDate) || 'N/A'}</td>
//                     <td>${formatTimeDisplay(row.bookingTime) || 'N/A'}</td>
//                     <td>${formatDateDisplay(row.parkedDate) || 'N/A'}</td>
//                     <td>${formatTimeDisplay(row.parkedTime) || 'N/A'}</td>
//                     <td>${formatDateDisplay(row.exitvehicledate) || 'N/A'}</td>
//                     <td>${formatTimeDisplay(row.exitvehicletime) || 'N/A'}</td>
//                     <td>${row.personName || 'Unknown'}</td>
//                     <td>${row.mobileNumber || 'N/A'}</td>
//                     <td>${row.vehicleType || 'N/A'}</td>
//                     <td>${row.sts || 'N/A'}</td>
//                     <td>${row.status || 'N/A'}</td>
//                     <td>${row.amount ? '₹' + row.amount : 'N/A'}</td>
//                     <td>${row.hour || 'N/A'}</td>
//                     <td>${row.subsctiptiontype || 'Monthly'}</td>
//                     <td class="${daysLeftClass}">
//                       ${daysLeft?.expired ? 'Expired' : daysLeft ? `${daysLeft.days} day${daysLeft.days !== 1 ? 's' : ''}` : 'N/A'}
//                     </td>
//                   </tr>
//                 `;
//               }).join('')}
//             </tbody>
//           </table>
//           <script>
//             // Automatically trigger print when the page loads
//             window.onload = function() {
//               setTimeout(function() {
//                 window.print();
//                 setTimeout(function() {
//                   window.close();
//                 }, 100);
//               }, 500); // Increased timeout to ensure all content loads
//             };
//           </script>
//         </body>
//       </html>
//     `;

//     // Open a new window with the HTML content
//     const printWindow = window.open('', '_blank');
//     printWindow.document.open();
//     printWindow.document.write(htmlContent);
//     printWindow.document.close();
//   }

//   handleMenuClose();
// };

const handleExport = (type) => {
  const exportData = filteredData.length > 0 || globalFilter ? filteredData : data;

  if (type === 'excel') {
    // Create CSV content for Excel
    const headers = [
      'Vehicle Number',
      'Booking Date',
      'Booking Time',
      'Parked Date',
      'Parked Time',
      'Exit Date',
      'Exit Time',
      'Customer Name',
      'Mobile Number',
      'Vehicle Type',
      'Service Type',
      'Status',
      'Amount',
      'Duration',
      'Subscription Type',
      'Days Left'
    ];

    // Convert data to CSV rows
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add data rows
    exportData.forEach(row => {
      const daysLeft = calculateSubscriptionDaysLeft(
        row.parkingDate || row.bookingDate,
        row.subsctiptiontype,
        row.sts
      );
      
      const daysLeftText = daysLeft?.expired 
        ? 'Expired' 
        : daysLeft 
          ? `${daysLeft.days} day${daysLeft.days !== 1 ? 's' : ''}`
          : 'N/A';
      
      const values = [
        `"${(row.vehicleNumber || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(formatDateDisplay(row.bookingDate) || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(formatTimeDisplay(row.bookingTime) || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(formatDateDisplay(row.parkedDate) || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(formatTimeDisplay(row.parkedTime) || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(formatDateDisplay(row.exitvehicledate) || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(formatTimeDisplay(row.exitvehicletime) || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(row.personName || 'Unknown').toString().replace(/"/g, '""')}"`,
        `"${(row.mobileNumber || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(row.vehicleType || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(row.sts || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(row.status || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(row.amount ? '₹' + row.amount : 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(row.hour || 'N/A').toString().replace(/"/g, '""')}"`,
        `"${(row.subsctiptiontype || 'Monthly').toString().replace(/"/g, '""')}"`,
        `"${daysLeftText.toString().replace(/"/g, '""')}"`
      ];
      
      csvRows.push(values.join(','));
    });

    // Create and download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Subscription_Bookings.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } else if (type === 'pdf') {
    // Create HTML content for PDF
    const headers = [
      'Vehicle Number',
      'Booking Date',
      'Booking Time',
      'Parked Date',
      'Parked Time',
      'Exit Date',
      'Exit Time',
      'Customer Name',
      'Mobile Number',
      'Vehicle Type',
      'Service Type',
      'Status',
      'Amount',
      'Duration',
      'Subscription Type',
      'Days Left'
    ];

    const htmlContent = `
      <html>
        <head>
          <title>Subscription Bookings</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #666cff; text-align: center; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .expired { color: #ff4d49; }
            .warning { color: #fdb528; }
            .good { color: #72e128; }
            @media print {
              @page { 
                size: landscape; 
                margin: 10mm;
              }
              table { 
                font-size: 8pt;
                width: 100% !important;
              }
              th, td {
                padding: 4px !important;
              }
            }
          </style>
        </head>
        <body>
          <h1>Subscription Bookings</h1>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${exportData.map(row => {
                const daysLeft = calculateSubscriptionDaysLeft(
                  row.parkingDate || row.bookingDate,
                  row.subsctiptiontype,
                  row.sts
                );
                const daysLeftClass = daysLeft?.expired 
                  ? 'expired' 
                  : daysLeft?.days <= 3 
                    ? 'warning' 
                    : 'good';
                
                return `
                  <tr>
                    <td>${row.vehicleNumber || 'N/A'}</td>
                    <td>${formatDateDisplay(row.bookingDate) || 'N/A'}</td>
                    <td>${formatTimeDisplay(row.bookingTime) || 'N/A'}</td>
                    <td>${formatDateDisplay(row.parkedDate) || 'N/A'}</td>
                    <td>${formatTimeDisplay(row.parkedTime) || 'N/A'}</td>
                    <td>${formatDateDisplay(row.exitvehicledate) || 'N/A'}</td>
                    <td>${formatTimeDisplay(row.exitvehicletime) || 'N/A'}</td>
                    <td>${row.personName || 'Unknown'}</td>
                    <td>${row.mobileNumber || 'N/A'}</td>
                    <td>${row.vehicleType || 'N/A'}</td>
                    <td>${row.sts || 'N/A'}</td>
                    <td>${row.status || 'N/A'}</td>
                    <td>${row.amount ? '₹' + row.amount : 'N/A'}</td>
                    <td>${row.hour || 'N/A'}</td>
                    <td>${row.subsctiptiontype || 'Monthly'}</td>
                    <td class="${daysLeftClass}">
                      ${daysLeft?.expired ? 'Expired' : daysLeft ? `${daysLeft.days} day${daysLeft.days !== 1 ? 's' : ''}` : 'N/A'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }, 500);
            };
          </script>
          
        </body>
      </html>
    `;

    // Open print dialog for PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  handleMenuClose();
};
  return (
    <Card>
      <CardHeader title='Subscription Bookings' />
      <Divider />
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Subscription Bookings'
          className='sm:is-auto'
        />
        <div className='flex items-center gap-4 max-sm:is-full'>
          <Button
            variant='outlined'
            className='max-sm:is-full is-auto'
            startIcon={<i className='ri-download-line' />}
            onClick={handleMenuClick}
          >
            Download
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => handleExport('excel')}
              sx={{ gap: 2 }}
            >
              <i className='ri-file-excel-2-line' /> Export to Excel
            </MenuItem>
            <MenuItem
              onClick={() => handleExport('pdf')}
              sx={{ gap: 2 }}
            >
              <i className='ri-file-pdf-line' /> Export to PDF
            </MenuItem>
          </Menu>
          <Button
            variant='contained'
            component={Link}
            href={getLocalizedUrl('/pages/subscription-booking', locale)}
            startIcon={<i className='ri-add-line' />}
            className='max-sm:is-full is-auto'
          >
            New Subscription
          </Button>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
          </div>
        ) : error ? (
          <Alert severity="error" className="m-4">
            {error}
          </Alert>
        ) : table.getFilteredRowModel().rows.length === 0 ? (
          <Alert severity="info" className="m-4">
            No subscription bookings found
          </Alert>
        ) : (
          <>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='ri-arrow-up-s-line text-xl' />,
                              desc: <i className='ri-arrow-down-s-line text-xl' />
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component='div'
              className='border-bs'
              count={table.getFilteredRowModel().rows.length}
              rowsPerPage={table.getState().pagination.pageSize}
              page={table.getState().pagination.pageIndex}
              onPageChange={(_, page) => table.setPageIndex(page)}
              onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            />
          </>
        )}
      </div>
    </Card>
  )
}

export default OrderListTable
