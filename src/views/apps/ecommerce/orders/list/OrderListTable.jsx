'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

import Link from 'next/link'

import { useParams , useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// Next Imports


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
import Alert from '@mui/material/Alert'

import TableFilters from '../../products/list/TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'


 // ✅ Import Next.js router

const API_URL = process.env.NEXT_PUBLIC_API_URL


// Style Imports
import tableStyles from '@core/styles/table.module.css'


export const stsChipColor = {
  instant: { color: '#ff4d49', text: 'Instant' },       // Blue
  subscription: { color: '#72e128', text: 'Subscription' }, // Green
  schedule: { color: '#fdb528', text: 'Schedule' }      // Yellow
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

  addMeta({
    itemRank
  })
  
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

// Custom Timer component for the Payable Time column
const PayableTimeTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  
  useEffect(() => {
    // Return early if no parking date or time
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')
      return
    }
    
    // Parse the parking date and time
    const [day, month, year] = parkedDate.split('-')
    const [timePart, ampm] = parkedTime.split(' ')
    let [hours, minutes] = timePart.split(':')
    
    // Convert to 24-hour format
    if (ampm && ampm.toUpperCase() === 'PM' && hours !== '12') {
      hours = parseInt(hours) + 12
    } else if (ampm && ampm.toUpperCase() === 'AM' && hours === '12') {
      hours = '00'
    }
    
    // Create parking start date object
    const parkingStartTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)
    
    // Update timer every second
    const timer = setInterval(() => {
      const now = new Date()
      const diffMs = now - parkingStartTime
      
      // Don't show negative time
      if (diffMs < 0) {
        setElapsedTime('00:00:00')
        return
      }
      
      // Convert milliseconds to hours, minutes, seconds
      const diffSecs = Math.floor(diffMs / 1000)
      const hours = Math.floor(diffSecs / 3600)
      const minutes = Math.floor((diffSecs % 3600) / 60)
      const seconds = diffSecs % 60
      
      // Format with leading zeros
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
  const paypal = '/images/apps/ecommerce/paypal.png'
  const mastercard = '/images/apps/ecommerce/mastercard.png'
  const { data: session } = useSession()
  const router = useRouter(); // ✅ Initialize router
  const vendorId = session?.user?.id

  useEffect(() => {
    if (!vendorId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`)
        const result = await response.json()

        if (result && result.bookings) {
          setData(result.bookings) // ✅ Set full data
          setFilteredData(result.bookings) // ✅ Set initial filtered data to full data
        } else {
          setData([])
          setFilteredData([])
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error)
      } finally {
        setLoading(false)
      }
    }

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
        cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vehicleNumber || 'N/A'}</Typography>
      }),
      columnHelper.accessor('bookingDate', {
        header: 'Booking Date & Time',
        cell: ({ row }) => {
          const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A'; // Better fallback than 'Invalid Date'
            
            try {
              // Check if date is in YYYY-MM-DD format
              if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                return new Date(dateStr).toDateString();
              }
              // Otherwise assume DD-MM-YYYY format
              else if (dateStr.includes('-')) {
                const [day, month, year] = dateStr.split('-');
                // Make sure all parts exist before creating Date
                if (day && month && year) {
                  return new Date(`${year}-${month}-${day}`).toDateString();
                }
              }
              
              // If we can't parse it, just return the original string
              return dateStr;
            } catch (e) {
              console.error("Date parsing error:", e, dateStr);
              return dateStr; // Return original if parsing fails
            }
          };
      
          // Format time display
          const formatTimeDisplay = (timeStr) => {
            if (!timeStr) return 'N/A';
            return timeStr; // Keep the original time format
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
      //     // Show timer only if status is PARKED
      //     const isParked = row.original.status && row.original.status.toLowerCase() === 'parked';
          
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
          
      //     return <Typography>--:--:--</Typography>;
      //   }
      // }),
      
            columnHelper.accessor('payableTime', {
              header: 'Payable Time',
              cell: ({ row }) => {
                // Check booking status
                const status = row.original.status?.toLowerCase()
                const isParked = status === 'parked'
                const isCompleted = status === 'completed'
                
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
                
                // Show total time for COMPLETED status using exit vehicle data
                if (isCompleted && row.original.exitvehicledate && row.original.exitvehicletime) {
                  // Calculate and format the total parking duration
                  const calculateTotalTime = () => {
                    try {
                      // Parse the parking start time
                      const [startDay, startMonth, startYear] = row.original.parkedDate.split('-')
                      const [startTimePart, startAmpm] = row.original.parkedTime.split(' ')
                      let [startHours, startMinutes] = startTimePart.split(':').map(Number)
                      
                      // Convert to 24-hour format if needed
                      if (startAmpm && startAmpm.toUpperCase() === 'PM' && startHours !== 12) {
                        startHours += 12
                      } else if (startAmpm && startAmpm.toUpperCase() === 'AM' && startHours === 12) {
                        startHours = 0
                      }
                      
                      // Create start date object
                      const startTime = new Date(`${startYear}-${startMonth}-${startDay}T${startHours}:${startMinutes}:00`)
                      
                      // Parse the exit vehicle time
                      const [endDay, endMonth, endYear] = row.original.exitvehicledate.split('-')
                      const [endTimePart, endAmpm] = row.original.exitvehicletime.split(' ')
                      let [endHours, endMinutes] = endTimePart.split(':').map(Number)
                      
                      // Convert to 24-hour format if needed
                      if (endAmpm && endAmpm.toUpperCase() === 'PM' && endHours !== 12) {
                        endHours += 12
                      } else if (endAmpm && endAmpm.toUpperCase() === 'AM' && endHours === 12) {
                        endHours = 0
                      }
                      
                      // Create end date object
                      const endTime = new Date(`${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:00`)
                      
                      // Calculate difference in milliseconds
                      const diffMs = endTime - startTime
                      
                      // Convert to days, hours, minutes
                      const diffSecs = Math.floor(diffMs / 1000)
                      const days = Math.floor(diffSecs / (3600 * 24))
                      const hours = Math.floor((diffSecs % (3600 * 24)) / 3600)
                      const minutes = Math.floor((diffSecs % 3600) / 60)
                      
                      // Format the output
                      if (days > 0) {
                        return `${days}d ${hours}h ${minutes}m`
                      } else {
                        return `${hours}h ${minutes}m`
                      }
                    } catch (e) {
                      console.error("Error calculating total time:", e)
                      return 'N/A'
                    }
                  }
                  
                  return (
                    <div className="flex items-center gap-2">
                      <i className="ri-time-line" style={{ fontSize: '16px', color: '#72e128' }}></i>
                      <Typography sx={{ fontWeight: 500, color: '#72e128' }}>
                        {calculateTotalTime()}
                      </Typography>
                    </div>
                  )
                }
                
                // Default case for other statuses
                return <Typography>--:--:--</Typography>
              }
            }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {/* Static Avatar Image */}
            <img
              src="https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png"
              alt="Customer Avatar"
              className="w-8 h-8 rounded-full"
            />
            {/* Customer Details */}
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
          const stsKey = row.original.sts?.toLowerCase(); // Convert to lowercase for case insensitivity
          const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts || 'N/A' }; // Default text color

          
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
          const statusKey = row.original.status?.toLowerCase(); // Case-insensitive lookup
          const chipData = statusChipColor[statusKey] || { color: 'default' };

          
return (
            <Chip
              label={row.original.status || 'N/A'}
              variant="tonal"
              size="small"
              sx={chipData.color.startsWith('#') ? { backgroundColor: chipData.color, color: 'white' } : {}}
              color={!chipData.color.startsWith('#') ? chipData.color : undefined} // Use predefined MUI colors if available
            />
          );
        }
      }),
      columnHelper.accessor('vehicleType', {
        header: 'Vehicle Type',
        cell: ({ row }) => {
          const vehicleType = row.original.vehicleType?.toLowerCase(); // Case-insensitive match

          const vehicleIcons = {
            car: { icon: 'ri-car-fill', color: '#ff4d49' }, // Blue for Car
            bike: { icon: 'ri-motorbike-fill', color: '#72e128' }, // Green for Bike
            default: { icon: 'ri-roadster-fill', color: '#282a42' } // Grey for Others
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
                        console.log('Navigating to Order Details:', selectedId); // ✅ Debugging
                        router.push(`/pages/bookingdetails/${selectedId}`); // ✅ Navigate with Next.js
                      } else {
                        console.error('⚠️ Booking ID is undefined!');
                      }
                    }
                  }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line text-[22px]',
                  menuItemProps: {
                    onClick: async () => {
                      try {
                        const selectedId = row.original._id;

                        if (!selectedId) {
                          console.error('⚠️ Booking ID is missing!');
                          
return;
                        }

                        console.log('Attempting to delete Booking ID:', selectedId);

                        // ✅ Show confirmation alert before deleting
                        const isConfirmed = window.confirm("Are you sure you want to delete this booking?");

                        if (!isConfirmed) {
                          console.log('Deletion cancelled');
                          
return;
                        }


                        // ✅ Call API to delete the booking
                        const response = await fetch(`${API_URL}/vendor/deletebooking/${selectedId}`, {
                          method: 'DELETE'
                        });

                        if (!response.ok) {
                          throw new Error('Failed to delete booking');
                        }

                        console.log('✅ Booking Deleted:', selectedId);

                        // ✅ Update the table after deletion
                        setData(prevData => prevData.filter(booking => booking._id !== selectedId));
                        setFilteredData(prevData => prevData.filter(booking => booking._id !== selectedId));
                      } catch (error) {
                        console.error('Error deleting booking:', error);
                      }
                    },
                    className: 'flex items-center gap-2 pli-4'
                  }
                }
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
    data: filteredData.length > 0 || globalFilter ? filteredData : data, // ✅ Fix applied here
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

  const getAvatar = params => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(customer)}
        </CustomAvatar>
      )
    }
  }

  
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
        {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />}>
          Export
        </Button> */}
        <Button
          variant='contained'
          component={Link}
          href={getLocalizedUrl('/pages/wizard-examples/property-listing', locale)}
          startIcon={<i className='ri-add-line' />}
          className='max-sm:is-full is-auto'
        >
          New Booking
        </Button>
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
