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

    const [day, month, year] = parkedDate.split('-')
    const [timePart, ampm] = parkedTime.split(' ')
    let [hours, minutes] = timePart.split(':')

    if (ampm && ampm.toUpperCase() === 'PM' && hours !== '12') {
      hours = parseInt(hours) + 12
    } else if (ampm && ampm.toUpperCase() === 'AM' && hours === '12') {
      hours = '00'
    }

    const parkingStartTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)

    const timer = setInterval(() => {
      const now = new Date()
      const diffMs = now - parkingStartTime

      if (diffMs < 0) {
        setElapsedTime('00:00:00')
        return
      }

      const diffSecs = Math.floor(diffMs / 1000)
      const hours = Math.floor(diffSecs / 3600)
      const minutes = Math.floor((diffSecs % 3600) / 60)
      const seconds = diffSecs % 60

      const formattedHours = hours.toString().padStart(2, '0')
      const formattedMinutes = minutes.toString().padStart(2, '0')
      const formattedSeconds = seconds.toString().padStart(2, '0')

      setElapsedTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [parkedDate, parkedTime])

  return (
    <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
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
      // Check if date is in YYYY-MM-DD format
      let dateParts;
      if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
        const [year, month, day] = dateStr.split('-');
        dateParts = { day, month, year };
      }
      // Otherwise assume DD-MM-YYYY format
      else if (dateStr.includes('-')) {
        const [day, month, year] = dateStr.split('-');
        dateParts = { day, month, year };
      } else {
        return null;
      }

      // Parse time
      const [timePart, ampm] = timeStr.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }

      return new Date(`${dateParts.year}-${dateParts.month}-${dateParts.day}T${hours}:${minutes}:00`);
    } catch (e) {
      console.error("Error parsing date/time:", e);
      return null;
    }
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
        // Skip if booking is not pending
        if (booking.status.toLowerCase() !== 'pending') {
          console.log(`Skipping booking ${booking._id} as it is not pending.`);
          continue;
        }

        // Parse scheduled date and time
        const scheduledDateTime = parseDateTime(booking.bookingDate, booking.bookingTime);
        if (!scheduledDateTime) continue;

        console.log('Current Time:', now);
        console.log('Scheduled Time:', scheduledDateTime);

        // Check if scheduled time has passed by more than 10 minutes
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
        // Skip if booking is not approved
        if (booking.status.toLowerCase() !== 'approved') {
          console.log(`Skipping booking ${booking._id} as it is not approved.`);
          continue;
        }

        // Parse scheduled date and time
        const scheduledDateTime = parseDateTime(booking.bookingDate, booking.bookingTime);
        if (!scheduledDateTime) continue;

        // Check if scheduled time has passed by more than 10 minutes
        const tenMinutesAfter = new Date(scheduledDateTime.getTime() + 10 * 60 * 1000);

        if (now > tenMinutesAfter) {
          const success = await updateBookingStatus(booking._id, 'Cancelled');
          if (success) {
            console.log(`Booking ${booking._id} has been cancelled (10 minutes past the scheduled time).`);
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
        console.log('Booking list refreshed with', sortedBookings.length, 'bookings.');
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

      return dateB - dateA; // Descending order (newest first)
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
          // First check and update pending bookings
          await checkAndUpdatePendingBookings(result.bookings);

          // Then check and update approved bookings
          await checkAndUpdateApprovedBookings(result.bookings);

          // Finally refresh the list to get updated statuses
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

    // Set up interval to check bookings every minute
    const intervalId = setInterval(() => {
      fetchDataAndCheckBookings();
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [vendorId]);

  // Update the filtered data when data changes
  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(data);
    }
  }, [data]);

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
        cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vehicleNumber || 'N/A'}</Typography>
      }),
      columnHelper.accessor('bookingDate', {
        header: 'Booking Date & Time',
        cell: ({ row }) => {
          const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';

            try {
              if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                return new Date(dateStr).toDateString();
              }
              else if (dateStr.includes('-')) {
                const [day, month, year] = dateStr.split('-');
                if (day && month && year) {
                  return new Date(`${year}-${month}-${day}`).toDateString();
                }
              }
              return dateStr;
            } catch (e) {
              console.error("Date parsing error:", e, dateStr);
              return dateStr;
            }
          };

          const formatTimeDisplay = (timeStr) => {
            if (!timeStr) return 'N/A';
            return timeStr;
          };

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDate(row.original.bookingDate)}, ${formatTimeDisplay(row.original.bookingTime)}`}
            </Typography>
          );
        }
      }),
      // columnHelper.accessor('payableTime', {
      //   header: 'Payable Time',
      //   cell: ({ row }) => {
      //     const status = row.original.status?.toLowerCase();
      //     const isParked = status === 'parked';
      //     const isCompleted = status === 'completed';

      //     if (isParked) {
      //       return (
      //         <div className="flex items-center gap-2">
      //           <i className="ri-time-line" style={{ fontSize: '16px', color: '#666CFF' }}></i>
      //           <PayableTimeTimer 
      //             parkedDate={row.original.parkedDate}
      //             parkedTime={row.original.parkedTime}
      //           />
      //         </div>
      //       );
      //     }

      //     if (isCompleted && row.original.exitvehicledate && row.original.exitvehicletime) {
      //       const calculateTotalTime = () => {
      //         try {
      //           const [startDay, startMonth, startYear] = row.original.parkedDate.split('-');
      //           const [startTimePart, startAmpm] = row.original.parkedTime.split(' ');
      //           let [startHours, startMinutes] = startTimePart.split(':').map(Number);

      //           if (startAmpm && startAmpm.toUpperCase() === 'PM' && startHours !== 12) {
      //             startHours += 12;
      //           } else if (startAmpm && startAmpm.toUpperCase() === 'AM' && startHours === '12') {
      //             startHours = 0;
      //           }

      //           const startTime = new Date(`${startYear}-${startMonth}-${startDay}T${startHours}:${startMinutes}:00`);

      //           const [endDay, endMonth, endYear] = row.original.exitvehicledate.split('-');
      //           const [endTimePart, endAmpm] = row.original.exitvehicletime.split(' ');
      //           let [endHours, endMinutes] = endTimePart.split(':').map(Number);

      //           if (endAmpm && endAmpm.toUpperCase() === 'PM' && endHours !== 12) {
      //             endHours += 12;
      //           } else if (endAmpm && endAmpm.toUpperCase() === 'AM' && endHours === '12') {
      //             endHours = 0;
      //           }

      //           const endTime = new Date(`${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:00`);
      //           const diffMs = endTime - startTime;
      //           const diffSecs = Math.floor(diffMs / 1000);
      //           const days = Math.floor(diffSecs / (3600 * 24));
      //           const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
      //           const minutes = Math.floor((diffSecs % 3600) / 60);

      //           if (days > 0) {
      //             return `${days}d ${hours}h ${minutes}m`;
      //           } else {
      //             return `${hours}h ${minutes}m`;
      //           }
      //         } catch (e) {
      //           console.error("Error calculating total time:", e);
      //           return 'N/A';
      //         }
      //       };

      //       return (
      //         <div className="flex items-center gap-2">
      //           <i className="ri-time-line" style={{ fontSize: '16px', color: '#72e128' }}></i>
      //           <Typography sx={{ fontWeight: 500, color: '#72e128' }}>
      //             {calculateTotalTime()}
      //           </Typography>
      //         </div>
      //       );
      //     }

      //     return <Typography>--:--:--</Typography>;
      //   }
      // }),

      columnHelper.accessor('payableTime', {
        header: 'Payable Time',
        cell: ({ row }) => {
          // Check booking status
          const status = row.original.status?.toLowerCase()

          // Return empty for completed status
          if (status === 'completed') {
            return null
          }

          const isParked = status === 'parked'

          // Show real-time timer for PARKED status
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

          // Default case for other statuses
          return null
        }
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src="https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png"
              alt="Customer Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col">
              <Typography className="font-medium">{row.original.personName || 'Unknown'}</Typography>
              <Typography variant="body2">{row.original.mobileNumber || 'N/A'}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('sts', {
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
      }),
      columnHelper.accessor('status', {
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
      }),
      columnHelper.accessor('vehicleType', {
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
                      const selectedId = row.original._id;
                      if (selectedId) {
                        router.push(`/pages/bookingdetails/${selectedId}`);
                      }
                    }
                  }
                },
                // {
                //   text: 'Delete',
                //   icon: 'ri-delete-bin-7-line text-[22px]',
                //   menuItemProps: {
                //     onClick: async () => {
                //       try {
                //         const selectedId = row.original._id;
                //         if (!selectedId) return;

                //         const isConfirmed = window.confirm("Are you sure you want to delete this booking?");
                //         if (!isConfirmed) return;

                //         const response = await fetch(`${API_URL}/vendor/deletebooking/${selectedId}`, {
                //           method: 'DELETE'
                //         });

                //         if (!response.ok) throw new Error('Failed to delete booking');

                //         setData(prevData => prevData.filter(booking => booking._id !== selectedId));
                //         setFilteredData(prevData => prevData.filter(booking => booking._id !== selectedId));
                //       } catch (error) {
                //         console.error('Error deleting booking:', error);
                //       }
                //     }
                //   }
                // }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
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
  // const handleExport = (type) => {
  //   // Get the data you want to export (filtered or all)
  //   const exportData = filteredData.length > 0 || globalFilter ? filteredData : data;

  //   if (type === 'excel') {
  //     // Convert data to CSV format
  //     const headers = Object.keys(exportData[0] || {});
  //     const csvContent = [
  //       headers.join(','),
  //       ...exportData.map(row =>
  //         headers.map(fieldName =>
  //           JSON.stringify(row[fieldName] || '')
  //         ).join(',')
  //       )
  //     ].join('\n');

  //     // Create download link
  //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', `bookings_${new Date().toISOString().slice(0, 10)}.csv`);
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  //   } else if (type === 'pdf') {
  //     // For PDF, we'll create a simple HTML table and print it
  //     const printWindow = window.open('', '_blank');
  //     const html = `
  //     <html>
  //       <head>
  //         <title>Bookings Export</title>
  //         <style>
  //           table { border-collapse: collapse; width: 100%; }
  //           th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  //           th { background-color: #f2f2f2; }
  //         </style>
  //       </head>
  //       <body>
  //         <h1>Bookings Export</h1>
  //         <table>
  //           <thead>
  //             <tr>
  //               ${Object.keys(exportData[0] || {}).map(key =>
  //       `<th>${key}</th>`
  //     ).join('')}
  //             </tr>
  //           </thead>
  //           <tbody>
  //             ${exportData.map(row => `
  //               <tr>
  //                 ${Object.values(row).map(value =>
  //       `<td>${value || ''}</td>`
  //     ).join('')}
  //               </tr>
  //             `).join('')}
  //           </tbody>
  //         </table>
  //         <script>
  //           // Automatically trigger print and close after a delay
  //           setTimeout(() => {
  //             window.print();
  //             setTimeout(() => window.close(), 500);
  //           }, 200);
  //         </script>
  //       </body>
  //     </html>
  //   `;

  //     printWindow.document.open();
  //     printWindow.document.write(html);
  //     printWindow.document.close();
  //   }
  // };
  const handleExport = (type) => {
  // Get the data you want to export (filtered or all)
  const exportData = filteredData.length > 0 || globalFilter ? filteredData : data;

  // Define fields with human-readable headers
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
    // Convert data to CSV format
    const csvContent = [
      fieldsConfig.map(f => f.label).join(','),
      ...exportData.map(row =>
        fieldsConfig.map(field =>
          JSON.stringify(row[field.key] ?? '')
        ).join(',')
      )
    ].join('\n');

    // Create download link
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
    
    // Build HTML with better formatting
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
                  // Handle empty values and format if needed
                  return `<td>${value !== undefined && value !== null ? value : '-'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          // Wait for content to load before printing
          window.onload = function() {
            setTimeout(() => {
              window.print();
              // Don't close immediately to allow print dialog to appear
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
