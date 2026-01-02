'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

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
import { Menu, MenuItem, Tabs, Tab, Box } from '@mui/material'

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
import BookingActionButton from './BookingActionButton'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const stsChipColor = {
  instant: { color: '#ff4d49', text: 'Instant' },
  subscription: { color: '#72e128', text: 'Subscription' },
  schedule: { color: '#fdb528', text: 'Schedule' }
}

export const statusChipColor = {
  completed: { color: 'success' },
  pending: { color: 'warning' },
  parked: { color: '#666CFF' },
  cancelled: { color: 'error' },
  approved: { color: 'info' }
}

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
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const PayableTimeTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  useEffect(() => {
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')

      return
    }

    const formatWithLeadingZero = num => String(num).padStart(2, '0')

    try {
      const [day, month, year] = parkedDate.split('-')
      const [timePart, ampm] = parkedTime.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)

      // Convert to 24-hour format if AM/PM is present
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) {
          hours += 12
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0
        }
      }

      const parkingStartTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hours, minutes || 0, 0)

      const updateElapsedTime = () => {
        const now = new Date()
        const diffMs = now - parkingStartTime

        if (diffMs < 0) {
          setElapsedTime('00:00:00')

          return
        }

        // Calculate hours, minutes, seconds
        const totalSeconds = Math.floor(diffMs / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        // Format with leading zeros
        setElapsedTime(
          `${formatWithLeadingZero(hours)}:${formatWithLeadingZero(minutes)}:${formatWithLeadingZero(seconds)}`
        )
      }

      // Initial update
      updateElapsedTime()

      // Update every second
      const timer = setInterval(updateElapsedTime, 1000)

      return () => clearInterval(timer)
    } catch (error) {
      console.error('Error in PayableTimeTimer:', error)
      setElapsedTime('00:00:00')
    }
  }, [parkedDate, parkedTime])

  return <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{elapsedTime}</Typography>
}

const columnHelper = createColumnHelper()

const isSubscription = item => {
  const sts = item.sts?.toString().toLowerCase().trim() || ''
  const type = item.subsctiptiontype?.toString().toLowerCase().trim() || ''

  return sts === 'subscription' || ['weekly', 'monthly', 'yearly'].includes(type)
}

const OrderListTable = ({ orderData }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [filteredData, setFilteredData] = useState(data)
  const [error, setError] = useState(null)
  const [sorting, setSorting] = useState([])
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const vendorId = session?.user?.id
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const onSearchChange = useCallback(val => {
    setGlobalFilter(String(val))
  }, [])

  // Function to parse date string to DateTime object
  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null

    try {
      // Check if date is in YYYY-MM-DD format
      let dateParts

      if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
        const [year, month, day] = dateStr.split('-')

        dateParts = { day, month, year }
      }

      // Otherwise assume DD-MM-YYYY format
      else if (dateStr.includes('-')) {
        const [day, month, year] = dateStr.split('-')

        dateParts = { day, month, year }
      } else {
        return null
      }

      // Parse time
      const [timePart, ampm] = timeStr.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)

      if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0
      }

      return new Date(`${dateParts.year}-${dateParts.month}-${dateParts.day}T${hours}:${minutes}:00`)
    } catch (e) {
      console.error('Error parsing date/time:', e)

      return null
    }
  }

  // Function to calculate duration between two dates
  const calculateDuration = (startDate, startTime, endDate, endTime) => {
    if (!startDate || !startTime) return 'N/A'

    try {
      const startDateTime = parseDateTime(startDate, startTime)
      const endDateTime = endDate && endTime ? parseDateTime(endDate, endTime) : new Date()

      if (!startDateTime) return 'N/A'

      const diffMs = endDateTime - startDateTime

      if (diffMs < 0) return 'N/A'

      const diffSecs = Math.floor(diffMs / 1000)
      const hours = Math.floor(diffSecs / 3600)
      const minutes = Math.floor((diffSecs % 3600) / 60)
      const seconds = diffSecs % 60

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } catch (e) {
      console.error('Error calculating duration:', e)

      return 'N/A'
    }
  }

  // Function to update booking status to Cancelled
  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`${API_URL}/vendor/updatebookingstatus/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      console.log('exit vechicle ', response)

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      return true
    } catch (error) {
      console.error('Error updating booking status:', error)

      return false
    }
  }

  // Function to check and update pending bookings
  const checkAndUpdatePendingBookings = async bookings => {
    const now = new Date()

    for (const booking of bookings) {
      try {
        // Skip if booking is not pending
        if (booking.status.toLowerCase() !== 'pending') {
          continue
        }

        // Parse scheduled date and time
        const scheduledDateTime = parseDateTime(booking.bookingDate, booking.bookingTime)

        if (!scheduledDateTime) continue

        // Check if scheduled time has passed by more than 10 minutes
        const tenMinutesAfter = new Date(scheduledDateTime.getTime() + 10 * 60 * 1000)

        if (now > tenMinutesAfter) {
          const success = await updateBookingStatus(booking._id, 'Cancelled')

          if (success) {
            console.log(`Booking ${booking._id} has been cancelled.`)
          }
        }
      } catch (e) {
        console.error(`Error processing booking ${booking._id}:`, e)
      }
    }
  }

  // Function to check and update approved bookings
  const checkAndUpdateApprovedBookings = async bookings => {
    const now = new Date()

    for (const booking of bookings) {
      try {
        // Skip if booking is not approved
        if (booking.status.toLowerCase() !== 'approved') {
          continue
        }

        // Parse scheduled date and time
        const scheduledDateTime = parseDateTime(booking.bookingDate, booking.bookingTime)

        if (!scheduledDateTime) continue

        // Check if scheduled time has passed by more than 10 minutes
        const tenMinutesAfter = new Date(scheduledDateTime.getTime() + 10 * 60 * 1000)

        if (now > tenMinutesAfter) {
          const success = await updateBookingStatus(booking._id, 'Cancelled')

          if (success) {
            console.log(`Booking ${booking._id} has been cancelled (10 minutes past the scheduled time).`)
          }
        }
      } catch (e) {
        console.error(`Error processing booking ${booking._id}:`, e)
      }
    }
  }

  // Function to refresh booking list
  const refreshBookingList = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`)
      const result = await response.json()

      if (result && result.bookings) {
        const filteredBookings = result.bookings.filter(
          booking =>
            ['pending', 'approved', 'cancelled', 'parked', 'completed'].includes(booking.status.toLowerCase()) &&
            !isSubscription(booking)
        )

        // Sort bookings by creation date (latest first)
        const sortedBookings = filteredBookings.sort((a, b) => {
          // First try to use createdAt field if it exists
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt)
          }

          // Fall back to booking date and time if createdAt doesn't exist
          try {
            const dateA = parseDateTime(a.bookingDate, a.bookingTime)
            const dateB = parseDateTime(b.bookingDate, b.bookingTime)

            return (dateB || 0) - (dateA || 0)
          } catch (e) {
            // If all else fails, sort by ID if available (assuming newer IDs are larger)
            if (a._id && b._id) {
              return b._id.localeCompare(a._id)
            }

            return 0
          }
        })

        setData(sortedBookings)

        // setFilteredData(sortedBookings) // Let the useEffect handle filtering based on current state

        return sortedBookings
      }

      return []
    } catch (error) {
      console.error('Error refreshing booking list:', error)

      return []
    }
  }

  useEffect(() => {
    if (orderData) {
      const filteredOrderData = orderData.filter(item => !isSubscription(item))

      setData(filteredOrderData)

      // Apply pending filter by default - handled by useEffect now
      // const pendingData = filteredOrderData.filter(item => item?.status?.toString().toLowerCase() === 'pending')

      // setFilteredData(pendingData)
      setLoading(false)
    }
  }, [orderData])

  const fetchData = async () => {
    if (!vendorId) return

    try {
      setLoading(true)
      setError(null)

      // First fetch the current bookings
      const currentBookings = await refreshBookingList()

      // Then check and update pending bookings
      await checkAndUpdatePendingBookings(currentBookings)

      // Then check and update approved bookings
      await checkAndUpdateApprovedBookings(currentBookings)

      // Finally refresh the list to get updated statuses
      await refreshBookingList()
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up interval to check bookings every minute
    const intervalId = setInterval(() => {
      fetchData()
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [vendorId])

  // Filter data when globalFilter or statusFilter changes
  useEffect(() => {
    const q = (globalFilter || '').toString().toLowerCase().trim()
    let result = [...data].filter(item => !isSubscription(item))

    // Apply status filter ONLY if there is no search term
    // This allows global search to find bookings across all statuses
    if (!q && statusFilter && statusFilter.toLowerCase() !== 'all') {
      const filterStatus = statusFilter.toLowerCase()

      result = result.filter(item => item.status && item.status.toString().toLowerCase() === filterStatus)
    }

    // Apply search filter if search term exists
    if (q) {
      // Prepare variations of the search term
      const queryLower = q.toLowerCase()
      const queryNoSpaces = queryLower.replace(/\s+/g, '')
      const queryNoSpecial = queryNoSpaces.replace(/[^a-z0-9]/g, '')

      result = result.filter(item => {
        // Collect all potential values to search against
        const rawValues = [
          item.personName,
          item.mobileNumber,
          item.vehicleNumber,
          item._id,
          item.bookingId,
          item.vehicleType,
          item.sts,
          item.status
        ].filter(Boolean) // Remove null/undefined

        // Add derived values (like displayed vehicle number)
        if (item.vehicleNumber) {
          rawValues.push(`#${item.vehicleNumber}`)
        }

        // Check if any value matches the query conditions
        return rawValues.some(val => {
          const valStr = String(val).toLowerCase()
          const valNoSpaces = valStr.replace(/\s+/g, '')
          const valNoSpecial = valNoSpaces.replace(/[^a-z0-9]/g, '')

          // 1. Direct substring match
          if (valStr.includes(queryLower)) return true

          // 2. Space-insensitive match (e.g. "KA 123" vs "KA123")
          if (queryNoSpaces && valNoSpaces.includes(queryNoSpaces)) return true

          // 3. Special-char insensitive match for alphanumeric search (e.g. "#KA-123" vs "KA123")
          if (queryNoSpecial.length > 2 && valNoSpecial.includes(queryNoSpecial)) return true

          return false
        })
      })
    }

    console.log('Filtered result count:', result.length)

    setFilteredData(result)
  }, [globalFilter, statusFilter, data])

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
          <div className='flex items-center gap-3'>
            <CustomAvatar src='/images/avatars/1.png' skin='light' size={34} />
            <div className='flex flex-col'>
              <Typography className='font-medium'>{row.original.personName || 'Unknown'}</Typography>
              <Typography variant='body2'>{row.original.mobileNumber || 'N/A'}</Typography>
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
        id: 'bookType',
        header: 'Booking Type',
        cell: ({ row }) => {
          const stsKey = row.original.sts?.toLowerCase()
          const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts || 'N/A' }

          return (
            <Typography
              sx={{
                color: chipData.color,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <i className='ri-circle-fill' style={{ fontSize: '10px', color: chipData.color }}></i>
              {chipData.text}
            </Typography>
          )
        }
      },
      {
        id: 'bookingDateTime',
        header: 'Booking Date & Time',
        accessorFn: row => {
          const dateTime = parseDateTime(row.bookingDate, row.bookingTime)

          return dateTime ? dateTime.getTime() : 0
        },
        sortingFn: 'basic',
        cell: ({ row }) => {
          const formatDateDisplay = dateStr => {
            if (!dateStr) return 'N/A'

            try {
              if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                return new Date(dateStr).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              } else if (dateStr.includes('-')) {
                const [day, month, year] = dateStr.split('-')

                return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              }

              return dateStr
            } catch (e) {
              console.error('Date parsing error:', e, dateStr)

              return dateStr
            }
          }

          const formatTimeDisplay = timeStr => {
            if (!timeStr) return 'N/A'

            const raw = String(timeStr).trim()

            if (/NaN/i.test(raw)) return 'N/A'

            // If already AM/PM, validate structure
            if (/(AM|PM)/i.test(raw)) {
              const match = raw.match(/^(\d{1,2}):(\d{1,2})\s*(AM|PM)$/i)

              if (!match) return 'N/A'
              const h = Number(match[1])
              const m = Number(match[2])

              if (Number.isNaN(h) || Number.isNaN(m)) return 'N/A'
              const hours12 = ((h - 1) % 12) + 1

              return `${hours12}:${m.toString().padStart(2, '0')} ${match[3].toUpperCase()}`
            }

            // Handle 24h format HH:mm
            try {
              const [hStr, mStr] = raw.split(':')
              const h = Number(hStr)
              const m = Number(mStr)

              if (Number.isNaN(h) || Number.isNaN(m)) return 'N/A'
              const period = h >= 12 ? 'PM' : 'AM'
              const hours12 = h % 12 || 12

              return `${hours12}:${m.toString().padStart(2, '0')} ${period}`
            } catch (e) {
              return 'N/A'
            }
          }

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-calendar-2-line' style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDateDisplay(row.original.bookingDate)}, ${formatTimeDisplay(row.original.bookingTime || 'N/A')}`}
            </Typography>
          )
        }
      },
      {
        id: 'parkingEntryDateTime',
        header: 'Parking Entry Date & Time',
        accessorFn: row => {
          const dateTime = parseDateTime(row.parkedDate, row.parkedTime)

          return dateTime ? dateTime.getTime() : 0
        },
        sortingFn: 'basic',
        cell: ({ row }) => {
          const formatDateDisplay = dateStr => {
            if (!dateStr) return 'N/A'

            try {
              if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                return new Date(dateStr).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              } else if (dateStr.includes('-')) {
                const [day, month, year] = dateStr.split('-')

                return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              }

              return dateStr
            } catch (e) {
              console.error('Date parsing error:', e, dateStr)

              return dateStr
            }
          }

          const formatTimeDisplay = timeStr => {
            console.log('str', timeStr)
            if (!timeStr) return 'N/A'

            const raw = String(timeStr).trim()

            if (/NaN/i.test(raw)) return 'N/A'

            // If already AM/PM, validate structure
            if (/(AM|PM)/i.test(raw)) {
              const match = raw.match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?\s*(AM|PM)$/i)

              if (!match) return 'N/A'
              const h = Number(match[1])
              const m = Number(match[2])

              if (Number.isNaN(h) || Number.isNaN(m)) return 'N/A'
              const hours12 = ((h - 1) % 12) + 1

              return `${hours12}:${m.toString().padStart(2, '0')} ${match[3].toUpperCase()}`
            }

            // Handle 24h format HH:mm[:ss]
            try {
              const parts = raw.split(':')
              const h = Number(parts[0])
              let m = parts.length > 1 ? Number(parts[1]) : 0

              if (Number.isNaN(h)) return 'N/A'
              if (Number.isNaN(m)) m = 0
              const period = h >= 12 ? 'PM' : 'AM'
              const hours12 = h % 12 || 12

              return `${hours12}:${m.toString().padStart(2, '0')} ${period}`
            } catch (e) {
              return 'N/A'
            }
          }

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-calendar-2-line' style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDateDisplay(row.original.parkedDate)}, ${formatTimeDisplay(row.original.parkedTime || 'N/A')}`}
            </Typography>
          )
        }
      },

      {
        id: 'exitVehicleDateTime',
        header: 'Parking Exit Date & Time',
        accessorFn: row => {
          const dateTime = parseDateTime(row.exitvehicledate, row.exitvehicletime)

          return dateTime ? dateTime.getTime() : 0
        },
        sortingFn: 'basic',
        cell: ({ row }) => {
          const formatDateDisplay = dateStr => {
            console.log('date', dateStr)
            if (!dateStr) return 'N/A'

            try {
              if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                return new Date(dateStr).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              } else if (dateStr.includes('-')) {
                const [day, month, year] = dateStr.split('-')

                return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              }

              return dateStr
            } catch (e) {
              console.error('Date parsing error:', e, dateStr)

              return dateStr
            }
          }

          const formatTimeDisplay = timeStr => {
            if (!timeStr) return 'N/A'

            const raw = String(timeStr).trim()

            // AM/PM with optional minutes (e.g., '7 AM', '7:NaN AM', '07:05 PM')
            const ampmMatch = raw.match(/^(\d{1,2})(?::(\d{1,2}|NaN))?\s*(AM|PM)$/i)

            if (ampmMatch) {
              let h = Number(ampmMatch[1])
              let m = Number(ampmMatch[2])

              if (Number.isNaN(h)) return 'N/A'
              if (Number.isNaN(m)) m = 0
              const hours12 = ((h - 1) % 12) + 1

              return `${hours12}:${m.toString().padStart(2, '0')} ${ampmMatch[3].toUpperCase()}`
            }

            // 24h time HH[:mm[:ss]]
            try {
              const parts = raw.split(':')
              const h = Number(parts[0])
              let m = parts.length > 1 ? Number(parts[1]) : 0

              if (Number.isNaN(h)) return 'N/A'
              if (Number.isNaN(m)) m = 0
              const period = h >= 12 ? 'PM' : 'AM'
              const hours12 = h % 12 || 12

              return `${hours12}:${m.toString().padStart(2, '0')} ${period}`
            } catch (e) {
              return 'N/A'
            }
          }

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-calendar-2-line' style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDateDisplay(row.original.exitvehicledate)}, ${formatTimeDisplay(row.original.exitvehicletime || 'N/A')}`}
            </Typography>
          )
        }
      },
      {
        id: 'payableTime',
        header: 'Payable Time',
        cell: ({ row }) => {
          // Check booking status
          const status = row.original.status?.toLowerCase()

          // Return empty for completed status
          if (status === 'completed') {
            return row.original.hour || 'N/A'
          }

          const isParked = status === 'parked'

          // Show real-time timer for PARKED status
          if (isParked) {
            return (
              <div className='flex items-center gap-2'>
                <i className='ri-time-line' style={{ fontSize: '16px', color: '#666CFF' }}></i>
                <PayableTimeTimer parkedDate={row.original.parkedDate} parkedTime={row.original.parkedTime} />
              </div>
            )
          }

          // Default case for other statuses
          return row.original.hour || 'N/A'
        }
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          const status = row.original.status?.toUpperCase()
          const isCompleted = status === 'COMPLETED'

          if (isCompleted) {
            // Use the hour field if available, otherwise calculate
            let duration = row.original.hour

            if (!duration || duration === 'N/A') {
              duration = calculateDuration(
                row.original.parkedDate,
                row.original.parkedTime,
                row.original.exitvehicledate,
                row.original.exitvehicletime
              )
            }

            return (
              <Typography sx={{ fontWeight: 500, color: '#72e128', fontFamily: 'monospace' }}>{duration}</Typography>
            )
          }

          return <Typography>N/A</Typography>
        }
      },
      {
        id: 'charges',
        header: 'Charges',
        cell: ({ row }) => <Typography>₹{Number(row.original.amount || 0).toFixed(2)}</Typography>
      },
      {
        id: 'handlingFee',
        header: 'Handling Fee',
        cell: ({ row }) => <Typography>₹{Number(row.original.handlingfee || 0).toFixed(2)}</Typography>
      },
      {
        id: 'gst',
        header: 'GST',
        cell: ({ row }) => <Typography>₹{Number(row.original.gstamout || 0).toFixed(2)}</Typography>
      },
      {
        id: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <Typography fontWeight={600}>
            ₹{Number(row.original.totalamout || row.original.amount || 0).toFixed(2)}
          </Typography>
        )
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
              variant='tonal'
              size='small'
              sx={
                chipData.color.startsWith('#')
                  ? {
                      backgroundColor: chipData.color,
                      color: 'white'
                    }
                  : {}
              }
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
                        router.push(`/pages/bookingdetails/${selectedId}`)
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
            bookingDetails={row.original}
            onUpdate={fetchData}
          />
        ),
        enableSorting: false
      }
    ],
    [router]
  )

  const table = useReactTable({
    data: useMemo(() => filteredData.filter(item => !isSubscription(item)), [filteredData]),
    columns,
    state: {
      rowSelection,

      // globalFilter, // Don't pass globalFilter to table to prevent internal re-filtering
      sorting
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,

    // onGlobalFilterChange: setGlobalFilter, // Managed manually
    onSortingChange: setSorting,

    // globalFilterFn: fuzzyFilter, // Not needed
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Kept for potential column filters, but won't affect global
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualGlobalFilter: true
  })

  const handleExport = type => {
    // Get the data you want to export (filtered or all)
    const exportData = filteredData.length > 0 || globalFilter ? filteredData : data

    // Define fields with human-readable headers
    const fieldsConfig = [
      { key: 'vehicleNumber', label: 'Vehicle Number' },
      { key: 'personName', label: 'Customer Name' },
      { key: 'mobileNumber', label: 'Mobile Number' },
      { key: 'vehicleType', label: 'Vehicle Type' },
      { key: 'bookType', label: 'Booking Type' },
      { key: 'bookingDate', label: 'Booking Date' },
      { key: 'bookingTime', label: 'Booking Time' },
      { key: 'parkingDate', label: 'Parking Entry Date' },
      { key: 'parkingTime', label: 'Parking Entry Time' },
      { key: 'exitvehicledate', label: 'Exit Date' },
      { key: 'exitvehicletime', label: 'Exit Time' },
      { key: 'hour', label: 'Duration' },
      { key: 'amount', label: 'Charges' },
      { key: 'status', label: 'Status' },
      { key: 'sts', label: 'Service Type' }
    ]

    if (type === 'excel') {
      // Convert data to CSV format
      const csvContent = [
        fieldsConfig.map(f => f.label).join(','),
        ...exportData.map(row =>
          fieldsConfig
            .map(field => {
              // Format date/time fields if needed
              let value = row[field.key]

              // Handle empty values
              if (value === undefined || value === null) {
                value = ''
              }

              // Escape quotes and wrap in quotes to handle commas
              return `"${String(value).replace(/"/g, '""')}"`
            })
            .join(',')
        )
      ].join('\n')

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.setAttribute('download', `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (type === 'pdf') {
      const printWindow = window.open('', '_blank')

      // Build HTML with better formatting
      const html = `
            <html>
              <head>
                <title>Bookings Export</title>
                <style>
                  body {font-family: Arial, sans-serif; margin: 20px; }
                  h1 {color: #333; text-align: center; }
                  table {border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 12px; }
                  th {background-color: #f2f2f2; position: sticky; top: 0; padding: 8px; text-align: left; }
                  td {border: 1px solid #ddd; padding: 6px; text-align: left; }
                  tr:nth-child(even) {background-color: #f9f9f9; }
                  .header {display: flex; justify-content: space-between; margin-bottom: 20px; }
                  .date {color: #666; }
                  .status-completed {color: green; }
                  .status-pending {color: orange; }
                  .status-cancelled {color: red; }
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
                    ${exportData
                      .map(
                        row => `
              <tr>
                ${fieldsConfig
                  .map(field => {
                    let value = row[field.key]

                    value = value !== undefined && value !== null ? value : '-'

                    // Special formatting for status
                    if (field.key === 'status') {
                      const statusClass = `status-${String(value).toLowerCase()}`

                      return `<td class="${statusClass}">${value}</td>`
                    }

                    // Format amounts with ₹ symbol
                    if (field.key === 'amount') {
                      return `<td>₹${value}</td>`
                    }

                    return `<td>${value}</td>`
                  })
                  .join('')}
              </tr>
            `
                      )
                      .join('')}
                  </tbody>
                </table>
                <script>
                  window.onload = function() {
                    setTimeout(() => {
                      window.print();
                      window.onafterprint = function () {
                        window.close();
                      };
                    }, 300);
                  };
                </script>
              </body>
            </html>
            `

      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  return (
    <Card>
      <CardHeader title='Booking Management' />
      <Divider />
      <CardContent className='flex flex-col gap-4'>
        <div className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={onSearchChange}
            placeholder='Search by Name, Vehicle, Mobile, or ID'
            className='sm:is-auto'
          />


        </div>

        {/* Status Tabs and Action Buttons */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', flex: 1 }}>
            <Tabs
              value={statusFilter}
              onChange={(e, newValue) => setStatusFilter(newValue)}
              variant='scrollable'
              scrollButtons='auto'
              aria-label='booking status tabs'
            >
              <Tab label='Pending' value='pending' />
              <Tab label='Approved' value='approved' />
              <Tab label='Parked' value='parked' />
              <Tab label='Completed' value='completed' />
              <Tab label='Cancelled' value='cancelled' />
              <Tab label='All' value='all' />
            </Tabs>
          </Box>

          <div className='flex items-center gap-3 w-full sm:w-auto'>
            <Button
              variant='outlined'
              startIcon={<i className='ri-download-line' />}
              onClick={handleMenuClick}
              className='flex-1 sm:flex-none'
            >
              Download
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
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
              className='flex-1 sm:flex-none'
            >
              New Booking
            </Button>
          </div>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        {loading ? (
          <div className='flex justify-center items-center p-8'>
            <CircularProgress />
          </div>
        ) : error ? (
          <Alert severity='error' className='m-4'>
            {error}
          </Alert>
        ) : table.getFilteredRowModel().rows.length === 0 ? (
          <Alert severity='info' className='m-4'>
            {statusFilter.toLowerCase() === 'pending' ? 'No pending bookings found' : 'No bookings found'}
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
                              'flex items-center gap-2': true,
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                            style={{
                              userSelect: 'none',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              if (header.column.getCanSort()) {
                                e.currentTarget.style.backgroundColor = '#f5f5f5'
                              }
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <span style={{ flex: 1 }}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {header.column.getCanSort() && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  flexDirection: 'column',
                                  marginLeft: '4px',
                                  opacity: header.column.getIsSorted() ? 1 : 0.3
                                }}
                              >
                                {!header.column.getIsSorted() && (
                                  <i className='ri-arrow-up-down-line' style={{ fontSize: '18px' }} />
                                )}
                                {header.column.getIsSorted() === 'asc' && (
                                  <i className='ri-arrow-up-s-line' style={{ fontSize: '20px', color: '#666CFF' }} />
                                )}
                                {header.column.getIsSorted() === 'desc' && (
                                  <i className='ri-arrow-down-s-line' style={{ fontSize: '20px', color: '#666CFF' }} />
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
          </>
        )}
      </div>
    </Card>
  )
}

export default OrderListTable
