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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { Menu, MenuItem } from '@mui/material'

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
import TableFilters from '../../products/list/TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const stsChipColor = {
  instant: { color: '#ff4d49', text: 'Instant' },
  subscription: { color: '#72e128', text: 'Subscription' },
  schedule: { color: '#fdb528', text: 'Schedule' }
};

export const statusChipColor = {
  completed: { color: 'success' },
  pending: { color: 'warning' },
  parked: { color: '#666CFF' },
  cancelled: { color: 'error' },
  approved: { color: 'info' }
};

// IMPROVED FUZZY FILTER
const fuzzyFilter = (row, columnId, value, addMeta) => {
  if (!value) return true;

  const searchValue = value.toLowerCase().trim();
  const rowData = row.original;

  // Helper function to normalize values
  const normalize = (val) => {
    if (!val) return '';
    return String(val).toLowerCase().trim();
  };

  // Search in multiple fields
  const searchableFields = [
    normalize(rowData.personName),
    normalize(rowData.mobileNumber),
    normalize(rowData.vehicleNumber),
    normalize(rowData.vehicleType),
    normalize(rowData.bookingDate),
    normalize(rowData.exitvehicledate),
    normalize(rowData.exitvehicletime),
    normalize(rowData.status),
    normalize(rowData.sts)
  ];

  return searchableFields.some(field => field.includes(searchValue));
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
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const PayableTimeTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  useEffect(() => {
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')
      return
    }

    // Parse date in DD-MM-YYYY format
    const [day, month, year] = parkedDate.split('-')

    // Parse time - handle both "05:55 PM" and "5:55 pm" formats
    const timeStr = parkedTime.trim()
    const isPM = timeStr.toUpperCase().includes('PM')
    const isAM = timeStr.toUpperCase().includes('AM')

    let hours, minutes

    if (isPM || isAM) {
      const [timePart] = timeStr.split(' ')
      const parts = timePart.split(':')
      hours = parseInt(parts[0])
      minutes = parseInt(parts[1]) || 0

      if (isPM && hours !== 12) {
        hours += 12
      } else if (isAM && hours === 12) {
        hours = 0
      }
    } else {
      const parts = timeStr.split(':')
      hours = parseInt(parts[0])
      minutes = parseInt(parts[1]) || 0
    }

    const parkingStartTime = new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)

    const timer = setInterval(() => {
      const now = new Date()
      const diffMs = now - parkingStartTime

      if (diffMs < 0) {
        setElapsedTime('00:00:00')
        return
      }

      const diffSecs = Math.floor(diffMs / 1000)
      const hrs = Math.floor(diffSecs / 3600)
      const mins = Math.floor((diffSecs % 3600) / 60)
      const secs = diffSecs % 60

      setElapsedTime(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [parkedDate, parkedTime])

  return (
    <Typography sx={{ fontFamily: 'monospace', fontWeight: 500, color: '#666CFF' }}>
      {elapsedTime}
    </Typography>
  )
}

const columnHelper = createColumnHelper()

const OrderListTable = ({ orderData }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState(data)
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

  // Function to parse date string to DateTime object
  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    try {
      // Parse date (DD-MM-YYYY format)
      const [day, month, year] = dateStr.split('-');

      // Parse time - handle both formats
      const timeStrTrim = timeStr.trim()
      const isPM = timeStrTrim.toUpperCase().includes('PM')
      const isAM = timeStrTrim.toUpperCase().includes('AM')

      let hours, minutes

      if (isPM || isAM) {
        const [timePart] = timeStrTrim.split(' ')
        const parts = timePart.split(':')
        hours = parseInt(parts[0])
        minutes = parseInt(parts[1]) || 0

        if (isPM && hours !== 12) {
          hours += 12
        } else if (isAM && hours === 12) {
          hours = 0
        }
      } else {
        const parts = timeStrTrim.split(':')
        hours = parseInt(parts[0])
        minutes = parseInt(parts[1]) || 0
      }

      return new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
    } catch (e) {
      console.error("Error parsing date/time:", e);
      return null;
    }
  };

  // Function to calculate duration between two dates
  const calculateDuration = (startDate, startTime, endDate, endTime) => {
    if (!startDate || !startTime || !endDate || !endTime) return 'N/A';

    try {
      const startDateTime = parseDateTime(startDate, startTime);
      const endDateTime = parseDateTime(endDate, endTime);

      if (!startDateTime || !endDateTime) return 'N/A';

      const diffMs = endDateTime - startDateTime;
      if (diffMs < 0) return 'N/A';

      const diffSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } catch (e) {
      console.error("Error calculating duration:", e);
      return 'N/A';
    }
  };

  // Function to calculate total amount with GST and handling fee
  const calculateTotalAmount = (amount) => {
    if (!amount) return 'N/A';
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 'N/A';

    const handlingFee = 5;
    const gst = amountNum * 0.18;
    const total = amountNum + handlingFee + gst;

    return total.toFixed(2);
  };

  // Function to update booking status to Cancelled
  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`${API_URL}/vendor/updatebookingstatus/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  };

  // Function to check and update pending bookings
  const checkAndUpdatePendingBookings = async (bookings) => {
    const now = new Date();

    for (const booking of bookings) {
      try {
        if (booking.status.toLowerCase() !== 'pending') {
          continue;
        }

        const scheduledDateTime = parseDateTime(booking.bookingDate, booking.bookingTime);
        if (!scheduledDateTime) continue;

        const tenMinutesAfter = new Date(scheduledDateTime.getTime() + 10 * 60 * 1000);

        if (now > tenMinutesAfter) {
          const success = await updateBookingStatus(booking._id, 'Cancelled');
          if (success) {
            console.log(`Booking ${booking._id} has been cancelled.`);
          }
        }
      } catch (e) {
        console.error(`Error processing booking ${booking._id}:`, e);
      }
    }
  };

  // Function to check and update approved bookings
  const checkAndUpdateApprovedBookings = async (bookings) => {
    const now = new Date();

    for (const booking of bookings) {
      try {
        if (booking.status.toLowerCase() !== 'approved') {
          continue;
        }

        const scheduledDateTime = parseDateTime(booking.bookingDate, booking.bookingTime);
        if (!scheduledDateTime) continue;

        const tenMinutesAfter = new Date(scheduledDateTime.getTime() + 10 * 60 * 1000);

        if (now > tenMinutesAfter) {
          const success = await updateBookingStatus(booking._id, 'Cancelled');
          if (success) {
            console.log(`Booking ${booking._id} has been cancelled.`);
          }
        }
      } catch (e) {
        console.error(`Error processing booking ${booking._id}:`, e);
      }
    }
  };

  // Function to refresh booking list
  const refreshBookingList = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`);
      const result = await response.json();

      if (result && result.bookings) {
        const sortedBookings = sortBookingsByDate(result.bookings);
        setData(sortedBookings);
        setFilteredData(sortedBookings);
        return sortedBookings;
      }
      return [];
    } catch (error) {
      console.error('Error refreshing booking list:', error);
      return [];
    }
  };

  // Function to sort bookings by date (newest first)
  const sortBookingsByDate = (bookings) => {
    return bookings.sort((a, b) => {
      const dateA = parseDateTime(a.bookingDate, a.bookingTime)?.getTime() || 0;
      const dateB = parseDateTime(b.bookingDate, b.bookingTime)?.getTime() || 0;
      return dateB - dateA;
    });
  };

  useEffect(() => {
    if (!vendorId) return;

    const fetchDataAndCheckBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`);
        const result = await response.json();

        if (result && result.bookings) {
          await checkAndUpdatePendingBookings(result.bookings);
          await checkAndUpdateApprovedBookings(result.bookings);
          const updatedBookings = await refreshBookingList();
          setData(updatedBookings);
          setFilteredData(updatedBookings);
        } else {
          setData([]);
          setFilteredData([]);
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndCheckBookings();

    const intervalId = setInterval(() => {
      fetchDataAndCheckBookings();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [vendorId]);

  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(data);
    }
  }, [data]);

  // FORMAT TIME DISPLAY FUNCTION
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return 'N/A';

    try {
      const timeStrTrim = timeStr.trim()
      const isPM = timeStrTrim.toUpperCase().includes('PM')
      const isAM = timeStrTrim.toUpperCase().includes('AM')

      if (isPM || isAM) {
        // Already in 12-hour format, just standardize it
        const [timePart, period] = timeStrTrim.split(' ')
        const [hours, minutes] = timePart.split(':')
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')} ${period.toUpperCase()}`
      }

      // If in 24-hour format, convert to 12-hour
      const parts = timeStrTrim.split(':')
      let hours = parseInt(parts[0])
      const minutes = parts[1] || '00'

      const period = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12

      return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')} ${period}`
    } catch (e) {
      console.error("Time formatting error:", e, timeStr);
      return timeStr;
    }
  };

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
      {
        id: 'sno',
        header: 'S.No',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <CustomAvatar skin='light' color='primary'>
              {getInitials(row.original.personName || 'N/A')}
            </CustomAvatar>
            <div className="flex flex-col">
              <Typography className="font-medium">{row.original.personName || 'Unknown'}</Typography>
              <Typography variant="body2">{row.original.mobileNumber || 'N/A'}</Typography>
            </div>
          </div>
        )
      },
      {
        id: 'vehicleType',
        header: 'Vehicle Type',
        cell: ({ row }) => {
          const vehicleType = row.original.vehicleType?.toLowerCase();
          const vehicleIcons = {
            car: { icon: 'ri-car-fill', color: '#ff4d49' },
            bike: { icon: 'ri-motorbike-fill', color: '#72e128' },
            default: { icon: 'ri-roadster-fill', color: '#282a42' }
          };
          const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default;

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {row.original.vehicleType || 'N/A'}
            </Typography>
          );
        }
      },
      {
        id: 'vehicleNumber',
        header: 'Vehicle Number',
        cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vehicleNumber || 'N/A'}</Typography>
      },
      {
        id: 'bookType',
        header: 'Booking Type',
        cell: ({ row }) => {
          const stsKey = row.original.sts?.toLowerCase();
          const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts || 'N/A' };

          return (
            <Typography
              sx={{ color: chipData.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <i className="ri-circle-fill" style={{ fontSize: '10px', color: chipData.color }}></i>
              {chipData.text}
            </Typography>
          );
        }
      },
      {
        id: 'bookingDateTime',
        header: 'Booking Date & Time',
        cell: ({ row }) => {
          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${row.original.bookingDate || 'N/A'}, ${formatTimeDisplay(row.original.bookingTime)}`}
            </Typography>
          );
        }
      },
      {
        id: 'parkingEntryDateTime',
        header: 'Parking Entry Date & Time',
        cell: ({ row }) => {
          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${row.original.parkedDate || 'N/A'}, ${formatTimeDisplay(row.original.parkedTime)}`}
            </Typography>
          );
        }
      },
      {
        id: 'exitVehicleDateTime',
        header: 'Parking Exit Date & Time',
        cell: ({ row }) => {
          return (
            <Typography sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <i
                className="ri-calendar-2-line"
                style={{
                  fontSize: '16px',
                  color: '#666'
                }}
              />
              {`${row.original.exitvehicledate || 'N/A'}, ${formatTimeDisplay(row.original.exitvehicletime)}`}
            </Typography>
          );
        }
      },
      {
        id: 'payableTime',
        header: 'Payable Time',
        cell: ({ row }) => {
          const status = row.original.status?.toUpperCase();
          const isParked = status === 'PARKED';

          if (isParked) {
            return (
              <div className="flex items-center gap-2">
                <i className="ri-time-line" style={{ fontSize: '16px', color: '#666CFF' }}></i>
                <PayableTimeTimer
                  parkedDate={row.original.parkedDate}
                  parkedTime={row.original.parkedTime}
                />
              </div>
            );
          }

          return <Typography>N/A</Typography>;
        }
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          const status = row.original.status?.toUpperCase();
          const isCompleted = status === 'COMPLETED';

          if (isCompleted) {
            // Use the hour field if available, otherwise calculate
            let duration = row.original.hour;

            if (!duration || duration === 'N/A') {
              duration = calculateDuration(
                row.original.parkedDate,
                row.original.parkedTime,
                row.original.exitvehicledate,
                row.original.exitvehicletime
              );
            }

            return (
              <Typography sx={{ fontWeight: 500, color: '#72e128', fontFamily: 'monospace' }}>
                {duration}
              </Typography>
            );
          }

          return <Typography>N/A</Typography>;
        }
      },
      {
        id: 'charges',
        header: 'Charges',
        cell: ({ row }) => <Typography>₹{row.original.amount || '0'}</Typography>
      },
      {
        id: 'handlingFee',
        header: 'Handling Fee',
        cell: () => <Typography>₹5.00</Typography>
      },
      {
        id: 'gst',
        header: 'GST',
        cell: ({ row }) => {
          const amount = parseFloat(row.original.amount) || 0;
          const gst = amount * 0.18;
          return <Typography>₹{gst.toFixed(2)}</Typography>;
        }
      },
      {
        id: 'total',
        header: 'Total',
        cell: ({ row }) => {
          const total = calculateTotalAmount(row.original.amount);
          return <Typography sx={{ fontWeight: 500 }}>₹{total}</Typography>;
        }
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusKey = row.original.status?.toLowerCase();
          const chipData = statusChipColor[statusKey] || { color: 'default' };

          return (
            <Chip
              label={row.original.status || 'N/A'}
              variant="tonal"
              size="small"
              sx={chipData.color.startsWith('#') ? { backgroundColor: chipData.color, color: 'white' } : {}}
              color={!chipData.color.startsWith('#') ? chipData.color : undefined}
            />
          );
        }
      },
      {
        id: 'action',
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
                      const selectedId = row.original._id;
                      if (selectedId) {
                        router.push(`/pages/bookingdetails/${selectedId}`);
                      }
                    }
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    [router]
  );

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
  });

  const handleExport = (type) => {
    const exportData = filteredData.length > 0 || globalFilter ? filteredData : data;

    const fieldsConfig = [
      { key: 'vehicleNumber', label: 'Vehicle Number' },
      { key: 'bookType', label: 'Booking Type' },
      { key: 'bookingDate', label: 'Booking Date' },
      { key: 'bookingTime', label: 'Booking Time' },
      { key: 'parkedDate', label: 'Parked Date' },
      { key: 'parkedTime', label: 'Parked Time' },
      { key: 'exitvehicledate', label: 'Exit Date' },
      { key: 'exitvehicletime', label: 'Exit Time' },
      { key: 'personName', label: 'Person Name' },
      { key: 'mobileNumber', label: 'Mobile Number' },
      { key: 'vehicleType', label: 'Vehicle Type' },
      { key: 'sts', label: 'Service Type' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount' },
      { key: 'hour', label: 'Duration' }
    ];

    if (type === 'excel') {
      const csvContent = [
        fieldsConfig.map(f => f.label).join(','),
        ...exportData.map(row =>
          fieldsConfig.map(field =>
            JSON.stringify(row[field.key] ?? '')
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } else if (type === 'pdf') {
      const printWindow = window.open('', '_blank');

      const html = `
        <html>
          <head>
            <title>Bookings Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th { background-color: #f2f2f2; position: sticky; top: 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .date { color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Bookings Export</h1>
              <div class="date">Generated: ${new Date().toLocaleString()}</div>
            </div>
            <table>
              <thead>
                <tr>
                  ${fieldsConfig.map(field => `<th>${field.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${exportData.map(row => `
                  <tr>
                    ${fieldsConfig.map(field => {
                      const value = row[field.key];
                      return `<td>${value !== undefined && value !== null ? value : '-'}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    }

    handleMenuClose();
  };

  return (
    <Card>
      <CardHeader title='Filters' />
      <TableFilters setData={setFilteredData} bookingData={data} />
      <Divider />
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Order'
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
              onClick={() => {
                handleExport('excel')
                handleMenuClose()
              }}
              sx={{ gap: 2 }}
            >
              <i className='ri-file-excel-2-line' /> Export to Excel
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExport('pdf')
                handleMenuClose()
              }}
              sx={{ gap: 2 }}
            >
              <i className='ri-file-pdf-line' /> Export to PDF
            </MenuItem>
          </Menu>
          <Button
            variant='contained'
            component={Link}
            href={getLocalizedUrl('/pages/wizard-examples/property-listing', locale)}
            startIcon={<i className='ri-add-line' />}
            className='max-sm:is-full is-auto'
          >
            New Booking
          </Button>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
          </div>
        ) : table.getFilteredRowModel().rows.length === 0 ? (
          <Alert severity="info" className="m-4">
            No bookings found
          </Alert>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
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
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default OrderListTable
