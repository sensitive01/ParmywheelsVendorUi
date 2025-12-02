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
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

// Payable Time Timer Component
const PayableTimeTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    if (!parkedDate || !parkedTime) return;

    const calculateElapsedTime = () => {
      try {
        // Parse the parked date and time
        const [day, month, year] = parkedDate.split('-');
        let [hours, minutes] = parkedTime.split(':');
        let period = 'AM';

        // Handle 12-hour format with AM/PM if present
        if (parkedTime.includes(' ')) {
          const parts = parkedTime.split(' ');
          [hours, minutes] = parts[0].split(':');
          period = parts[1].toUpperCase();
        }

        // Convert to 24-hour format
        let hours24 = parseInt(hours, 10);
        if (period === 'PM' && hours24 < 12) hours24 += 12;
        if (period === 'AM' && hours24 === 12) hours24 = 0;

        const parkedDateTime = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1, // months are 0-indexed
          parseInt(day, 10),
          hours24,
          parseInt(minutes, 10)
        );

        const now = new Date();
        const diffMs = now - parkedDateTime;

        if (diffMs < 0) return '00:00:00';

        // Convert to hours, minutes, seconds
        const totalSeconds = Math.floor(diffMs / 1000);
        const hoursElapsed = Math.floor(totalSeconds / 3600);
        const minutesElapsed = Math.floor((totalSeconds % 3600) / 60);
        const secondsElapsed = totalSeconds % 60;

        // Format as HH:MM:SS
        const formattedTime = [
          hoursElapsed.toString().padStart(2, '0'),
          minutesElapsed.toString().padStart(2, '0'),
          secondsElapsed.toString().padStart(2, '0')
        ].join(':');

        setElapsedTime(formattedTime);
      } catch (error) {
        console.error('Error calculating elapsed time:', error);
        return '00:00:00';
      }
    };

    // Update immediately
    calculateElapsedTime();

    // Then update every second
    const interval = setInterval(calculateElapsedTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [parkedDate, parkedTime]);

  return (
    <Typography
      sx={{
        fontFamily: 'monospace',
        color: '#666CFF',
        fontWeight: 500,
        fontSize: '0.875rem'
      }}
    >
      {elapsedTime}
    </Typography>
  );
};

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
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      return new Date(dateStr)
    }
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

// Helper function to normalize values for search
const pick = (v) => {
  if (v === null || v === undefined) return '';
  return v.toString().toLowerCase().trim();
};

const calculateSubscriptionDaysLeft = (bookingDate, subscriptionType, sts) => {
  if (sts?.toLowerCase() !== 'subscription') return null

  const startDate = parseBookingDate(bookingDate)
  if (!startDate) return null

  const currentDate = new Date()
  let durationInDays = 30

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

  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + durationInDays)

  if (currentDate > endDate) return { days: 0, expired: true }

  const daysLeft = Math.floor((endDate - currentDate) / (1000 * 60 * 60 * 24))
  return { days: daysLeft, expired: false }
}

const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return ''

  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr
  }

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

const calculateTotalAmount = (amount) => {
  if (!amount) return 'N/A';
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum)) return 'N/A';

  const handlingFee = 5;
  const gst = amountNum * 0.18;
  const total = amountNum + handlingFee + gst;

  return total.toFixed(2);
};

const columnHelper = createColumnHelper()

// Stats Card Component
const StatsCard = ({ icon, count, label, iconColor }) => (
  <Card sx={{
    boxShadow: 1,
    '&:hover': { boxShadow: 2 }
  }}>
    <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h4" fontWeight="bold">{count}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
      </Box>
      <Box sx={{
        backgroundColor: '#f3f4f6',
        borderRadius: '50%',
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <i className={icon} style={{ fontSize: '22px', color: iconColor }}></i>
      </Box>
    </CardContent>
  </Card>
)

const OrderListTable = ({ orderData }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState(data)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [sorting, setSorting] = useState([])
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

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const result = await response.json()

      if (result && result.bookings) {
        const subscriptionBookings = result.bookings.filter(booking =>
          booking.sts?.toLowerCase() === 'subscription' &&
          ["pending", "approved", "cancelled", "parked", "completed"]
            .includes(booking.status.toLowerCase())
        )
        const sorted = [...subscriptionBookings].sort((a, b) => {
          const ad = a.createdAt ? new Date(a.createdAt) : 0
          const bd = b.createdAt ? new Date(b.createdAt) : 0
          return bd - ad
        })
        setData(sorted)
        setFilteredData(sorted)
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

  // Get counts for each status
  const getStatusCounts = () => {
    return {
      pending: data.filter(item => item.status?.toLowerCase() === 'pending').length,
      approved: data.filter(item => item.status?.toLowerCase() === 'approved').length,
      cancelled: data.filter(item => item.status?.toLowerCase() === 'cancelled').length,
      parked: data.filter(item => item.status?.toLowerCase() === 'parked').length,
      completed: data.filter(item => item.status?.toLowerCase() === 'completed').length,
    }
  }

  const statusCounts = getStatusCounts()

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter(item => item.status.toLowerCase() === statusFilter));
    }
  }, [statusFilter, data]);

  useEffect(() => {
    fetchData()
  }, [vendorId])

  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    try {
      let y, m, d;
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          [y, m, d] = parts.map(Number);
        } else {
          [d, m, y] = parts.map(Number);
        }
      } else {
        return null;
      }

      const raw = String(timeStr).trim();
      let hh = 0;
      let mm = 0;

      const ampm = raw.match(/^(\d{1,2})(?::(\d{1,2}|NaN))?\s*(AM|PM)$/i);
      if (ampm) {
        hh = Number(ampm[1]);
        mm = Number(ampm[2]);
        if (Number.isNaN(hh)) return null;
        if (Number.isNaN(mm)) mm = 0;
        const isPM = ampm[3].toUpperCase() === 'PM';
        if (isPM && hh !== 12) hh += 12;
        if (!isPM && hh === 12) hh = 0;
        return new Date(y, (m - 1), d, hh, mm, 0, 0);
      }

      const parts = raw.split(':');
      hh = Number(parts[0]);
      mm = parts.length > 1 ? Number(parts[1]) : 0;
      if (Number.isNaN(hh)) return null;
      if (Number.isNaN(mm)) mm = 0;

      return new Date(y, (m - 1), d, hh, mm, 0, 0);
    } catch (_) {
      return null;
    }
  };

  const calculateDuration = (startDate, startTime, endDate, endTime) => {
    const start = parseDateTime(startDate, startTime);
    const end = parseDateTime(endDate, endTime);
    if (!start || !end) return 'N/A';
    const diffMs = end - start;
    if (diffMs <= 0) return 'N/A';

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = n => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // IMPROVED SEARCH FUNCTIONALITY
  useEffect(() => {
    const q = (globalFilter || '').toString().toLowerCase().trim();

    if (!q) {
      // No search query - filter by status only
      if (statusFilter === 'all') {
        setFilteredData([...data]);
      } else {
        setFilteredData(data.filter(item =>
          item.status?.toLowerCase() === statusFilter.toLowerCase()
        ));
      }
      return;
    }

    // First filter by status
    let results = statusFilter === 'all'
      ? [...data]
      : data.filter(item => item.status?.toLowerCase() === statusFilter.toLowerCase());

    // Then filter by search query
    results = results.filter(item => {
      // Normalize and search in multiple fields
      const vehicleNumber = pick(item.vehicleNumber);
      const personName = pick(item.personName);
      const mobileNumber = pick(item.mobileNumber);
      const vehicleType = pick(item.vehicleType);
      const vendorName = pick(item.vendorName);
      const bookingId = pick(item.bookingId || item._id);
      const subscriptionType = pick(item.subsctiptiontype);

      // Remove # from vehicle number for comparison
      const cleanVehicleNumber = vehicleNumber.replace('#', '');

      // Check if query matches any field
      return (
        cleanVehicleNumber.includes(q) ||
        vehicleNumber.includes(q) ||
        personName.includes(q) ||
        mobileNumber.includes(q) ||
        vehicleType.includes(q) ||
        vendorName.includes(q) ||
        bookingId.includes(q) ||
        subscriptionType.includes(q)
      );
    });

    setFilteredData(results);
  }, [globalFilter, data, statusFilter]);

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
        ),
        enableSorting: false
      },
      {
        id: 'sno',
        header: 'S.No',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        enableSorting: false
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
              <Typography className="font-medium">
                {row.original.personName || 'Unknown'}
              </Typography>
              <Typography variant="body2">
                {row.original.mobileNumber || 'N/A'}
              </Typography>
            </div>
          </div>
        )
      },
      {
        id: 'vehicleType',
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
      },
      {
        id: 'vehicleNumber',
        header: 'Vehicle Number',
        cell: ({ row }) => (
          <Typography style={{ color: '#666cff' }}>
            {row.original.vehicleNumber ? `#${row.original.vehicleNumber}` : 'N/A'}
          </Typography>
        )
      },
      {
        id: 'subscriptionType',
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
      },
      {
        id: 'bookingDateTime',
        header: 'Booking Date & Time',
        accessorFn: (row) => {
          const dateTime = parseDateTime(row.bookingDate, row.bookingTime);
          return dateTime ? dateTime.getTime() : 0;
        },
        sortingFn: 'basic',
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
      },
      {
        id: 'parkingEntryDateTime',
        header: 'Parking Entry Date & Time',
        accessorFn: (row) => {
          const dateTime = parseDateTime(row.parkedDate, row.parkedTime);
          return dateTime ? dateTime.getTime() : 0;
        },
        sortingFn: 'basic',
        cell: ({ row }) => {
          const date = formatDateDisplay(row.original.parkedDate)
          const time = formatTimeDisplay(row.original.parkedTime)

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${date}, ${time}`}
            </Typography>
          )
        }
      },
      {
        id: 'exitDateTime',
        header: 'Exit Date & Time',
        accessorFn: (row) => {
          const dateTime = parseDateTime(row.exitvehicledate, row.exitvehicletime);
          return dateTime ? dateTime.getTime() : 0;
        },
        sortingFn: 'basic',
        cell: ({ row }) => {
          const status = row.original.status?.toUpperCase()
          const isExited = status === 'COMPLETED' || status === 'CANCELLED'

          if (!isExited || !row.original.exitvehicledate || !row.original.exitvehicletime) {
            return (
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <i className="ri-calendar-2-line" style={{ fontSize: '16px', color: '#666' }}></i>
                N/A
              </Typography>
            )
          }

          const date = formatDateDisplay(row.original.exitvehicledate)
          const time = row.original.exitvehicletime

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${date}, ${time}`}
            </Typography>
          )
        }
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          const status = row.original.status?.toUpperCase()
          const isCompleted = status === 'COMPLETED'
          const isParked = status === 'PARKED'

          // If not completed or parked, show N/A
          if (!isCompleted && !isParked) {
            return (
              <Typography sx={{ color: 'text.secondary' }}>N/A</Typography>
            )
          }

          // For parked vehicles, show live timer
          if (isParked) {
            return (
              <div className="flex items-center gap-2">
                <i className="ri-time-line" style={{ fontSize: '16px', color: '#666CFF' }}></i>
                <PayableTimeTimer
                  parkedDate={row.original.parkedDate}
                  parkedTime={row.original.parkedTime}
                />
              </div>
            )
          }

          // For completed bookings, show the stored hour or calculate it
          const hourField = row.original.hour
          if (hourField && hourField !== '00:00:00' && hourField.trim() !== '') {
            return (
              <Typography sx={{
                fontWeight: 500,
                color: '#72e128',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {hourField}
              </Typography>
            )
          }

          // Calculate duration if hour field is not available
          const calculated = calculateDuration(
            row.original.parkedDate,
            row.original.parkedTime,
            row.original.exitvehicledate,
            row.original.exitvehicletime
          )

          return (
            <Typography sx={{
              fontWeight: 500,
              color: calculated !== 'N/A' ? '#72e128' : 'text.secondary',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}>
              {calculated}
            </Typography>
          )
        }
      }
      ,
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
          const amount = parseFloat(row.original.amount) || 0
          const gst = amount * 0.18

          return <Typography>₹{gst.toFixed(2)}</Typography>
        }
      },
      {
        id: 'total',
        header: 'Total',
        cell: ({ row }) => {
          const total = calculateTotalAmount(row.original.amount)

          return <Typography sx={{ fontWeight: 500 }}>₹{total}</Typography>
        }
      },
      {
        id: 'subscriptionLeft',
        header: 'Subscription Left',
        cell: ({ row }) => {
          const dateToUse = row.original.parkingDate || row.original.bookingDate
          const subscriptionStatus = calculateSubscriptionDaysLeft(
            dateToUse,
            row.original.subsctiptiontype,
            row.original.sts
          )

          if (!subscriptionStatus) {
            return <Typography variant="body2" sx={{ color: '#666' }}>N/A</Typography>
          }

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
      },
      {
        id: 'status',
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
      },
      {
        id: 'statusAction',
        header: 'Change Status',
        cell: ({ row }) => (
          <BookingActionButton
            bookingId={row.original._id}
            currentStatus={row.original.status}
            onUpdate={fetchData}
          />
        ),
        enableSorting: false
      }
    ],
    [router, statusFilter]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter,
      sorting
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
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleExport = (type) => {
    const exportData = filteredData;

    const exportColumns = [
      { key: 'vehicleNumber', label: 'Vehicle Number' },
      { key: 'vendorName', label: 'Vendor Name' },
      { key: 'personName', label: 'Customer Name' },
      { key: 'mobileNumber', label: 'Mobile Number' },
      { key: 'vehicleType', label: 'Vehicle Type' },
      { key: 'subsctiptiontype', label: 'Subscription Type' },
      { key: 'bookingDate', label: 'Booking Date' },
      { key: 'bookingTime', label: 'Booking Time' },
      { key: 'parkedDate', label: 'Parked Date' },
      { key: 'parkedTime', label: 'Parked Time' },
      { key: 'exitvehicledate', label: 'Exit Date' },
      { key: 'exitvehicletime', label: 'Exit Time' },
      { key: 'duration', label: 'Duration' },
      { key: 'amount', label: 'Charges' },
      { key: 'handlingFee', label: 'Handling Fee' },
      { key: 'gst', label: 'GST' },
      { key: 'total', label: 'Total' },
      { key: 'subscriptionLeft', label: 'Subscription Left' },
      { key: 'status', label: 'Status' }
    ];

    if (type === 'excel') {
      const headers = exportColumns.map(col => col.label);
      const csvRows = [];

      csvRows.push(headers.join(','));

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

        const duration = row.hour || 'N/A';

        const amount = parseFloat(row.amount) || 0;
        const handlingFee = 5;
        const gst = amount * 0.18;
        const total = amount + handlingFee + gst;

        const values = [
          `"${(row.vehicleNumber || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${(row.vendorName || 'My Parking Place').toString().replace(/"/g, '""')}"`,
          `"${(row.personName || 'Unknown').toString().replace(/"/g, '""')}"`,
          `"${(row.mobileNumber || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${(row.vehicleType || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${(row.subsctiptiontype || 'Monthly').toString().replace(/"/g, '""')}"`,
          `"${(formatDateDisplay(row.bookingDate) || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${(formatTimeDisplay(row.bookingTime) || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${(formatDateDisplay(row.parkedDate) || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${(formatTimeDisplay(row.parkedTime) || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${(formatDateDisplay(row.exitvehicledate) || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${(formatTimeDisplay(row.exitvehicletime) || 'N/A').toString().replace(/"/g, '""')}"`,
          `"${duration.toString().replace(/"/g, '""')}"`,
          `"₹${amount.toFixed(2)}"`,
          `"₹${handlingFee.toFixed(2)}"`,
          `"₹${gst.toFixed(2)}"`,
          `"₹${total.toFixed(2)}"`,
          `"${daysLeftText.toString().replace(/"/g, '""')}"`,
          `"${(row.status || 'N/A').toString().replace(/"/g, '""')}"`
        ];

        csvRows.push(values.join(','));
      });

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
      const headers = exportColumns.map(col => col.label);

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

        const duration = row.status?.toLowerCase() === 'completed'
          ? calculateDuration(
            row.parkedDate,
            row.parkedTime,
            row.exitvehicledate,
            row.exitvehicletime
          )
          : 'N/A';

        const amount = parseFloat(row.amount) || 0;
        const handlingFee = 5;
        const gst = amount * 0.18;
        const total = amount + handlingFee + gst;

        return `
                    <tr>
                      <td>${row.vehicleNumber || 'N/A'}</td>
                      <td>${row.vendorName || 'My Parking Place'}</td>
                      <td>${row.personName || 'Unknown'}</td>
                      <td>${row.mobileNumber || 'N/A'}</td>
                      <td>${row.vehicleType || 'N/A'}</td>
                      <td>${row.subsctiptiontype || 'Monthly'}</td>
                      <td>${formatDateDisplay(row.bookingDate) || 'N/A'}</td>
                      <td>${formatTimeDisplay(row.bookingTime) || 'N/A'}</td>
                      <td>${formatDateDisplay(row.parkedDate) || 'N/A'}</td>
                      <td>${formatTimeDisplay(row.parkedTime) || 'N/A'}</td>
                      <td>${formatDateDisplay(row.exitvehicledate) || 'N/A'}</td>
                      <td>${formatTimeDisplay(row.exitvehicletime) || 'N/A'}</td>
                      <td>${duration}</td>
                      <td>₹${amount.toFixed(2)}</td>
                      <td>₹${handlingFee.toFixed(2)}</td>
                      <td>₹${gst.toFixed(2)}</td>
                      <td>₹${total.toFixed(2)}</td>
                      <td class="${daysLeftClass}">
                        ${daysLeft?.expired ? 'Expired' : daysLeft ? `${daysLeft.days} day${daysLeft.days !== 1 ? 's' : ''}` : 'N/A'}
                      </td>
                      <td>${row.status || 'N/A'}</td>
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

      const printWindow = window.open('', '_blank');
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }

    handleMenuClose();
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", p: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            icon="ri-time-line"
            count={statusCounts.pending}
            label="Pending"
            iconColor="#94a3b8"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            icon="ri-thumb-up-line"
            count={statusCounts.approved}
            label="Approved"
            iconColor="#22c55e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            icon="ri-close-circle-line"
            count={statusCounts.cancelled}
            label="Cancelled"
            iconColor="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            icon="ri-parking-box-line"
            count={statusCounts.parked}
            label="Parked"
            iconColor="#8b5cf6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatsCard
            icon="ri-checkbox-circle-line"
            count={statusCounts.completed}
            label="Completed"
            iconColor="#10b981"
          />
        </Grid>
      </Grid>

      {/* Main Card */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Booking Management Header */}
          <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
            Subscription Management
          </Typography>

          {/* Search and Buttons Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Bookings'
              sx={{ width: '350px' }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                startIcon={<i className='ri-download-line' />}
                onClick={handleMenuClick}
                sx={{
                  borderColor: '#22c55e',
                  color: '#22c55e',
                  '&:hover': {
                    borderColor: '#16a34a',
                    backgroundColor: '#f0fdf4'
                  }
                }}
              >
                Download
              </Button>
              <Button
                variant='contained'
                component={Link}
                href={getLocalizedUrl('/pages/subscription-booking', locale)}
                startIcon={<i className='ri-add-line' />}
                sx={{
                  backgroundColor: '#22c55e',
                  '&:hover': {
                    backgroundColor: '#16a34a'
                  }
                }}
              >
                New Subscription
              </Button>
            </Box>
          </Box>

          {/* Status Tabs - Separate Row */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 0 }}>
              {['pending', 'approved', 'parked', 'completed', 'cancelled', 'all'].map((status) => (
                <Button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  sx={{
                    textTransform: 'capitalize',
                    color: statusFilter === status ? '#22c55e' : '#64748b',
                    fontWeight: statusFilter === status ? 600 : 400,
                    borderBottom: statusFilter === status ? '2px solid #22c55e' : '2px solid transparent',
                    borderRadius: 0,
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      color: '#22c55e'
                    }
                  }}
                >
                  {status}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Download Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleExport('excel')} sx={{ gap: 2 }}>
              <i className='ri-file-excel-2-line' /> Export to Excel
            </MenuItem>
            <MenuItem onClick={() => handleExport('pdf')} sx={{ gap: 2 }}>
              <i className='ri-file-pdf-line' /> Export to PDF
            </MenuItem>
          </Menu>

          {/* Alert/Info Message */}
          {!loading && !error && table.getFilteredRowModel().rows.length === 0 && (
            <Alert
              icon={<i className="ri-information-line" style={{ fontSize: '20px' }} />}
              severity="info"
              sx={{
                mb: 3,
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                '& .MuiAlert-icon': {
                  color: '#06b6d4'
                }
              }}
            >
              {`No ${statusFilter} bookings found`}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#22c55e' }} />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Table */}
          {!loading && !error && table.getFilteredRowModel().rows.length > 0 && (
            <Box>
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id}>
                            {header.isPlaceholder ? null : (
                              <div
                                className={classnames({
                                  'flex items-center gap-2': true,
                                  'cursor-pointer select-none': header.column.getCanSort()
                                })}
                                onClick={header.column.getToggleSortingHandler()}
                                style={{
                                  userSelect: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (header.column.getCanSort()) {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                <span style={{ flex: 1 }}>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </span>
                                {header.column.getCanSort() && (
                                  <span style={{
                                    display: 'inline-flex',
                                    flexDirection: 'column',
                                    marginLeft: '4px',
                                    opacity: header.column.getIsSorted() ? 1 : 0.3
                                  }}>
                                    {!header.column.getIsSorted() && (
                                      <i className='ri-arrow-up-down-line' style={{ fontSize: '18px' }} />
                                    )}
                                    {header.column.getIsSorted() === 'asc' && (
                                      <i className='ri-arrow-up-s-line' style={{ fontSize: '20px', color: '#22c55e' }} />
                                    )}
                                    {header.column.getIsSorted() === 'desc' && (
                                      <i className='ri-arrow-down-s-line' style={{ fontSize: '20px', color: '#22c55e' }} />
                                    )}
                                  </span>
                                )}
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
              </div>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default OrderListTable
