// 'use client'

// // React Imports
// import { useState, useEffect, useMemo } from 'react'

// import Link from 'next/link'

// import { useParams , useRouter } from 'next/navigation'

// import { useSession } from 'next-auth/react'

// // Next Imports


// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import Checkbox from '@mui/material/Checkbox'
// import Chip from '@mui/material/Chip'
// import TablePagination from '@mui/material/TablePagination'
// import TextField from '@mui/material/TextField'
// import CardHeader from '@mui/material/CardHeader'
// import Divider from '@mui/material/Divider'

// // Third-party Imports
// import classnames from 'classnames'
// import { rankItem } from '@tanstack/match-sorter-utils'
// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
//   getFilteredRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFacetedMinMaxValues,
//   getPaginationRowModel,
//   getSortedRowModel
// } from '@tanstack/react-table'


// // Component Imports
// import Alert from '@mui/material/Alert';

// import TableFilters from '../../products/list/TableFilters'
// import CustomAvatar from '@core/components/mui/Avatar'
// import OptionMenu from '@core/components/option-menu'

// // Util Imports
// import { getInitials } from '@/utils/getInitials'
// import { getLocalizedUrl } from '@/utils/i18n'


//  // ✅ Import Next.js router

// const API_URL = process.env.NEXT_PUBLIC_API_URL


// // Style Imports
// import tableStyles from '@core/styles/table.module.css'


// import BookingActionButton from './BookingActionButton'

// export const stsChipColor = {
//   instant: { color: '#ff4d49', text: 'Instant' },       // Blue
//   subscription: { color: '#72e128', text: 'Subscription' }, // Green
//   schedule: { color: '#fdb528', text: 'Schedule' }      // Yellow
// };
// export const statusChipColor = {
//   completed: { color: 'success' },
//   pending: { color: 'warning' },
//   parked: { color: '#666CFF' },
//   cancelled: { color: 'error' },
//   approved: { color: 'info' }
// };

// const fuzzyFilter = (row, columnId, value, addMeta) => {
//   const itemRank = rankItem(row.getValue(columnId), value)

//   addMeta({
//     itemRank
//   })
  
// return itemRank.passed
// }

// const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
//   const [value, setValue] = useState(initialValue)

//   useEffect(() => {
//     setValue(initialValue)
//   }, [initialValue])
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       onChange(value)
//     }, debounce)

    
// return () => clearTimeout(timeout)
//   }, [value])
  
// return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
// }

// const columnHelper = createColumnHelper()

// const OrderListTable = ({ orderData }) => {
//   const [rowSelection, setRowSelection] = useState({})
//   const [data, setData] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [globalFilter, setGlobalFilter] = useState('')
//   const [filteredData, setFilteredData] = useState(data)
//   const { lang: locale } = useParams()
//   const paypal = '/images/apps/ecommerce/paypal.png'
//   const mastercard = '/images/apps/ecommerce/mastercard.png'
//   const { data: session } = useSession()
//   const router = useRouter(); // ✅ Initialize router
//   const vendorId = session?.user?.id

//   useEffect(() => {
//     if (!vendorId) return;
  
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`);
//         const result = await response.json();
  
//         if (result && result.bookings) {
//           // ✅ Filter bookings with only relevant statuses
//           const filteredBookings = result.bookings.filter(booking =>
//             ["pending", "approved", "cancelled", "parked"].includes(booking.status.toLowerCase()) // Ensure case-insensitive match
//           );
  
//           setData(filteredBookings); // ✅ Store the filtered data
//           setFilteredData(filteredBookings);
//         } else {
//           setData([]);
//           setFilteredData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching vendor data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchData();
//   }, [vendorId]);
  
//   const columns = useMemo(
//     () => [
//       {
//         id: 'select',
//         header: ({ table }) => (
//           <Checkbox
//             checked={table.getIsAllRowsSelected()}
//             indeterminate={table.getIsSomeRowsSelected()}
//             onChange={table.getToggleAllRowsSelectedHandler()}
//           />
//         ),
//         cell: ({ row }) => (
//           <Checkbox
//             checked={row.getIsSelected()}
//             disabled={!row.getCanSelect()}
//             indeterminate={row.getIsSomeSelected()}
//             onChange={row.getToggleSelectedHandler()}
//           />
//         )
//       },
//       columnHelper.accessor('vehicleNumber', {
//         header: 'Vehicle Number',
//         cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vehicleNumber}</Typography>
//       }),
//       columnHelper.accessor('bookingDate', {
//         header: 'Booking Date & Time',
//         cell: ({ row }) => {
//           const formatDate = (dateStr) => {
//             if (!dateStr) return 'Invalid Date'; // Handle missing values
//             const [day, month, year] = dateStr.split('-'); // Extract day, month, year
//             const formattedDate = new Date(`${year}-${month}-${day}`).toDateString(); // Convert and format

            
// return formattedDate; // Example Output: "Sat Feb 08 2025"
//           };

          
// return (
//             <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <i className="ri-calendar-2-line text-[26px]" style={{ fontSize: '16px', color: '#666' }}></i>
//               {`${formatDate(row.original.bookingDate)}, ${row.original.bookingTime}`}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('customerName', {
//         header: 'Customer',
//         cell: ({ row }) => (
//           <div className="flex items-center gap-3">
//             {/* Static Avatar Image */}
//             <img
//               src="https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png"
//               alt="Customer Avatar"
//               className="w-8 h-8 rounded-full"
//             />
//             {/* Customer Details */}
//             <div className="flex flex-col">
//               <Typography className="font-medium">{row.original.personName}</Typography>
//               <Typography variant="body2">{row.original.mobileNumber}</Typography>
//             </div>
//           </div>
//         )
//       }),
//       columnHelper.accessor('sts', {
//         header: 'Booking Type',
//         cell: ({ row }) => {
//           const stsKey = row.original.sts?.toLowerCase(); // Convert to lowercase for case insensitivity
//           const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts }; // Default text color

          
// return (
//             <Typography
//               sx={{ color: chipData.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}
//             >
//               <i className="ri-circle-fill" style={{ fontSize: '10px', color: chipData.color }}></i>
//               {chipData.text}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('status', {
//         header: 'Status',
//         cell: ({ row }) => {
//           const statusKey = row.original.status?.toLowerCase(); // Case-insensitive lookup
//           const chipData = statusChipColor[statusKey] || { color: 'default' };

          
// return (
//             <Chip
//               label={row.original.status}
//               variant="tonal"
//               size="small"
//               sx={chipData.color.startsWith('#') ? { backgroundColor: chipData.color, color: 'white' } : {}}
//               color={!chipData.color.startsWith('#') ? chipData.color : undefined} // Use predefined MUI colors if available
//             />
//           );
//         }
//       }),
//       columnHelper.accessor('vehicleType', {
//         header: 'Vehicle Type',
//         cell: ({ row }) => {
//           const vehicleType = row.original.vehicleType?.toLowerCase(); // Case-insensitive match

//           const vehicleIcons = {
//             car: { icon: 'ri-car-fill', color: '#ff4d49' }, // Blue for Car
//             bike: { icon: 'ri-motorbike-fill', color: '#72e128' }, // Green for Bike
//             default: { icon: 'ri-roadster-fill', color: '#282a42' } // Grey for Others
//           };

//           const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default;

          
// return (
//             <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <i className={icon} style={{ fontSize: '16px', color }}></i>
//               {row.original.vehicleType}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('action', {
//         header: 'Actions',
//         cell: ({ row }) => (
//           <div className='flex items-center'>
//             <OptionMenu
//               iconButtonProps={{ size: 'medium' }}
//               iconClassName='text-[22px]'
//               options={[
//                 {
//                   text: 'View',
//                   icon: 'ri-eye-line',
//                   menuItemProps: {
//                     onClick: () => {
//                       const selectedId = row.original._id;

//                       if (selectedId) {
//                         console.log('Navigating to Order Details:', selectedId); // ✅ Debugging
//                         router.push(`/apps/ecommerce/orders/details/${selectedId}`); // ✅ Navigate with Next.js
//                       } else {
//                         console.error('⚠️ Booking ID is undefined!');
//                       }
//                     }
//                   }
//                 },
//                 {
//                   text: 'Delete',
//                   icon: 'ri-delete-bin-7-line text-[22px]',
//                   menuItemProps: {
//                     onClick: async () => {
//                       try {
//                         const selectedId = row.original._id;

//                         if (!selectedId) {
//                           console.error('⚠️ Booking ID is missing!');
                          
// return;
//                         }

//                         console.log('Attempting to delete Booking ID:', selectedId);

//                         // ✅ Show confirmation alert before deleting
//                         const isConfirmed = window.confirm("Are you sure you want to delete this booking?");

//                         if (!isConfirmed) {
//                           console.log('Deletion cancelled');
                          
// return;
//                         }


//                         // ✅ Call API to delete the booking
//                         const response = await fetch(`${API_URL}/vendor/deletebooking/${selectedId}`, {
//                           method: 'DELETE'
//                         });

//                         if (!response.ok) {
//                           throw new Error('Failed to delete booking');
//                         }

//                         console.log('✅ Booking Deleted:', selectedId);

//                         // ✅ Update the table after deletion
//                         setData(prevData => prevData.filter(booking => booking._id !== selectedId));
//                       } catch (error) {
//                         console.error('Error deleting booking:', error);
//                       }
//                     },
//                     className: 'flex items-center gap-2 pli-4'
//                   }
//                 }
//               ]}
//             />
//           </div>
//         ),
//         enableSorting: false
//       }),
//       columnHelper.accessor('statusAction', {
//         header: 'Change Status',
//         cell: ({ row }) => (
//           <BookingActionButton
//             bookingId={row.original._id}
//             currentStatus={row.original.status}
//             onUpdate={() => fetchData()}
//           />
//         ),
//         enableSorting: false
//       })
//     ],
//     [data, filteredData]
//   );

//   const table = useReactTable({
//     data: filteredData.length > 0 || globalFilter ? filteredData : data, // ✅ Fix applied here
//     columns,
//     filterFns: {
//       fuzzy: fuzzyFilter
//     },
//     state: {
//       rowSelection,
//       globalFilter
//     },
//     initialState: {
//       pagination: {
//         pageSize: 10
//       }
//     },
//     enableRowSelection: true,
//     globalFilterFn: fuzzyFilter,
//     onRowSelectionChange: setRowSelection,
//     onGlobalFilterChange: setGlobalFilter,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues()
//   });

//   const getAvatar = params => {
//     const { avatar, customer } = params

//     if (avatar) {
//       return <CustomAvatar src={avatar} skin='light' size={34} />
//     } else {
//       return (
//         <CustomAvatar skin='light' size={34}>
//           {getInitials(customer)}
//         </CustomAvatar>
//       )
//     }
//   }

  
// return (
//     <Card>
//       <CardHeader title='Request Management' />
//       {/* <TableFilters setData={setFilteredData} bookingData={data} /> */}
//       <Divider />
//       <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
//         <DebouncedInput
//           value={globalFilter ?? ''}
//           onChange={value => setGlobalFilter(String(value))}
//           placeholder='Search Order'
//           className='sm:is-auto'
//         />
//         {/* <Button variant='outlined' color='secondary' startIcon={<i className='ri-upload-2-line' />}>
//           Export
//         </Button> */}
//         <Button
//           variant='contained'
//           component={Link}
//           href={getLocalizedUrl('/pages/wizard-examples/property-listing', locale)}
//           startIcon={<i className='ri-add-line' />}
//           className='max-sm:is-full is-auto'
//         >
//           New Booking
//         </Button>
//       </CardContent>
//       <div className='overflow-x-auto'>
//         <table className={tableStyles.table}>
//           <thead>
//             {table.getHeaderGroups().map(headerGroup => (
//               <tr key={headerGroup.id}>
//                 {headerGroup.headers.map(header => (
//                   <th key={header.id}>
//                     {header.isPlaceholder ? null : (
//                       <>
//                         <div
//                           className={classnames({
//                             'flex items-center': header.column.getIsSorted(),
//                             'cursor-pointer select-none': header.column.getCanSort()
//                           })}
//                           onClick={header.column.getToggleSortingHandler()}
//                         >
//                           {flexRender(header.column.columnDef.header, header.getContext())}
//                           {{
//                             asc: <i className='ri-arrow-up-s-line text-xl' />,
//                             desc: <i className='ri-arrow-down-s-line text-xl' />
//                           }[header.column.getIsSorted()] ?? null}
//                         </div>
//                       </>
//                     )}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           {table.getFilteredRowModel().rows.length === 0 ? (
//             <tbody>
//               <tr>
//                 <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
//                   No data available
//                 </td>
//               </tr>
//             </tbody>
//           ) : (
//             <tbody>
//               {table
//                 .getRowModel()
//                 .rows.slice(0, table.getState().pagination.pageSize)
//                 .map(row => {
//                   return (
//                     <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
//                       {row.getVisibleCells().map(cell => (
//                         <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
//                       ))}
//                     </tr>
//                   )
//                 })}
//             </tbody>
//           )}
//         </table>
//       </div>
//       <TablePagination
//         rowsPerPageOptions={[10, 25, 50, 100]}
//         component='div'
//         className='border-bs'
//         count={table.getFilteredRowModel().rows.length}
//         rowsPerPage={table.getState().pagination.pageSize}
//         page={table.getState().pagination.pageIndex}
//         SelectProps={{
//           inputProps: { 'aria-label': 'rows per page' }
//         }}
//         onPageChange={(_, page) => {
//           table.setPageIndex(page)
//         }}
//         onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
//       />
//     </Card>
//   )
// }

// export default OrderListTable


// 'use client'

// // React Imports
// import { useState, useEffect, useMemo } from 'react'
// import Link from 'next/link'
// import { useParams, useRouter } from 'next/navigation'
// import { useSession } from 'next-auth/react'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import Typography from '@mui/material/Typography'
// import Checkbox from '@mui/material/Checkbox'
// import Chip from '@mui/material/Chip'
// import TablePagination from '@mui/material/TablePagination'
// import TextField from '@mui/material/TextField'
// import CardHeader from '@mui/material/CardHeader'
// import Divider from '@mui/material/Divider'
// import Alert from '@mui/material/Alert'

// // Third-party Imports
// import classnames from 'classnames'
// import { rankItem } from '@tanstack/match-sorter-utils'
// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
//   getFilteredRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFacetedMinMaxValues,
//   getPaginationRowModel,
//   getSortedRowModel
// } from '@tanstack/react-table'

// // Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'
// import OptionMenu from '@core/components/option-menu'
// import BookingActionButton from './BookingActionButton'

// // Util Imports
// import { getInitials } from '@/utils/getInitials'
// import { getLocalizedUrl } from '@/utils/i18n'

// // Styles Imports
// import tableStyles from '@core/styles/table.module.css'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// export const stsChipColor = {
//   instant: { color: '#ff4d49', text: 'Instant' },       // Blue
//   subscription: { color: '#72e128', text: 'Subscription' }, // Green
//   schedule: { color: '#fdb528', text: 'Schedule' }      // Yellow
// };

// export const statusChipColor = {
//   completed: { color: 'success' },
//   pending: { color: 'warning' },
//   parked: { color: '#666CFF' },
//   cancelled: { color: 'error' },
//   approved: { color: 'info' }
// };

// const fuzzyFilter = (row, columnId, value, addMeta) => {
//   const itemRank = rankItem(row.getValue(columnId), value)
//   addMeta({ itemRank })
//   return itemRank.passed
// }

// const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
//   const [value, setValue] = useState(initialValue)

//   useEffect(() => {
//     setValue(initialValue)
//   }, [initialValue])
  
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       onChange(value)
//     }, debounce)
    
//     return () => clearTimeout(timeout)
//   }, [value])
  
//   return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
// }

// const columnHelper = createColumnHelper()

// const OrderListTable = ({ orderData }) => {
//   const [rowSelection, setRowSelection] = useState({})
//   const [data, setData] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [globalFilter, setGlobalFilter] = useState('')
//   const [filteredData, setFilteredData] = useState(data)
//   const { lang: locale } = useParams()
//   const { data: session } = useSession()
//   const router = useRouter()
//   const vendorId = session?.user?.id

//   // Function to fetch data that can be called after status updates
//   const fetchData = async () => {
//     if (!vendorId) return;

//     try {
//       setLoading(true);
//       const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${vendorId}`);
//       const result = await response.json();

//       if (result && result.bookings) {
//         // Filter bookings with only relevant statuses (case-insensitive)
//         const filteredBookings = result.bookings.filter(booking =>
//           ["pending", "approved", "cancelled", "parked", "completed"].includes(booking.status.toLowerCase())
//         );

//         setData(filteredBookings);
//         setFilteredData(filteredBookings);
//       } else {
//         setData([]);
//         setFilteredData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching vendor data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!vendorId) return;
//     fetchData();
//   }, [vendorId]);
  
//   const columns = useMemo(
//     () => [
//       {
//         id: 'select',
//         header: ({ table }) => (
//           <Checkbox
//             checked={table.getIsAllRowsSelected()}
//             indeterminate={table.getIsSomeRowsSelected()}
//             onChange={table.getToggleAllRowsSelectedHandler()}
//           />
//         ),
//         cell: ({ row }) => (
//           <Checkbox
//             checked={row.getIsSelected()}
//             disabled={!row.getCanSelect()}
//             indeterminate={row.getIsSomeSelected()}
//             onChange={row.getToggleSelectedHandler()}
//           />
//         )
//       },
//       columnHelper.accessor('vehicleNumber', {
//         header: 'Vehicle Number',
//         cell: ({ row }) => <Typography style={{ color: '#666cff' }}>#{row.original.vehicleNumber}</Typography>
//       }),
//       columnHelper.accessor('bookingDate', {
//         header: 'Booking Date & Time',
//         cell: ({ row }) => {
//           const formatDate = (dateStr) => {
//             if (!dateStr) return 'Invalid Date'; // Handle missing values
//             const [day, month, year] = dateStr.split('-'); // Extract day, month, year
//             const formattedDate = new Date(`${year}-${month}-${day}`).toDateString(); // Convert and format
//             return formattedDate; // Example Output: "Sat Feb 08 2025"
//           };

//           return (
//             <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <i className="ri-calendar-2-line text-[26px]" style={{ fontSize: '16px', color: '#666' }}></i>
//               {`${formatDate(row.original.bookingDate)}, ${row.original.bookingTime}`}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('customerName', {
//         header: 'Customer',
//         cell: ({ row }) => (
//           <div className="flex items-center gap-3">
//             {/* Static Avatar Image */}
//             <img
//               src="https://demos.pixinvent.com/materialize-nextjs-admin-template/demo-1/images/avatars/1.png"
//               alt="Customer Avatar"
//               className="w-8 h-8 rounded-full"
//             />
//             {/* Customer Details */}
//             <div className="flex flex-col">
//               <Typography className="font-medium">{row.original.personName}</Typography>
//               <Typography variant="body2">{row.original.mobileNumber}</Typography>
//             </div>
//           </div>
//         )
//       }),
//       columnHelper.accessor('sts', {
//         header: 'Booking Type',
//         cell: ({ row }) => {
//           const stsKey = row.original.sts?.toLowerCase(); // Convert to lowercase for case insensitivity
//           const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts }; // Default text color

//           return (
//             <Typography
//               sx={{ color: chipData.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}
//             >
//               <i className="ri-circle-fill" style={{ fontSize: '10px', color: chipData.color }}></i>
//               {chipData.text}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('status', {
//         header: 'Status',
//         cell: ({ row }) => {
//           const statusKey = row.original.status?.toLowerCase(); // Case-insensitive lookup
//           const chipData = statusChipColor[statusKey] || { color: 'default' };

//           return (
//             <Chip
//               label={row.original.status}
//               variant="tonal"
//               size="small"
//               sx={chipData.color.startsWith('#') ? { backgroundColor: chipData.color, color: 'white' } : {}}
//               color={!chipData.color.startsWith('#') ? chipData.color : undefined} // Use predefined MUI colors if available
//             />
//           );
//         }
//       }),
//       columnHelper.accessor('vehicleType', {
//         header: 'Vehicle Type',
//         cell: ({ row }) => {
//           const vehicleType = row.original.vehicleType?.toLowerCase(); // Case-insensitive match

//           const vehicleIcons = {
//             car: { icon: 'ri-car-fill', color: '#ff4d49' }, // Blue for Car
//             bike: { icon: 'ri-motorbike-fill', color: '#72e128' }, // Green for Bike
//             default: { icon: 'ri-roadster-fill', color: '#282a42' } // Grey for Others
//           };

//           const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default;

//           return (
//             <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <i className={icon} style={{ fontSize: '16px', color }}></i>
//               {row.original.vehicleType}
//             </Typography>
//           );
//         }
//       }),
//       columnHelper.accessor('action', {
//         header: 'Actions',
//         cell: ({ row }) => (
//           <div className='flex items-center'>
//             <OptionMenu
//               iconButtonProps={{ size: 'medium' }}
//               iconClassName='text-[22px]'
//               options={[
//                 {
//                   text: 'View',
//                   icon: 'ri-eye-line',
//                   menuItemProps: {
//                     onClick: () => {
//                       const selectedId = row.original._id;

//                       if (selectedId) {
//                         console.log('Navigating to Order Details:', selectedId);
//                         router.push(`/apps/ecommerce/orders/details/${selectedId}`);
//                       } else {
//                         console.error('⚠️ Booking ID is undefined!');
//                       }
//                     }
//                   }
//                 },
//                 {
//                   text: 'Delete',
//                   icon: 'ri-delete-bin-7-line text-[22px]',
//                   menuItemProps: {
//                     onClick: async () => {
//                       try {
//                         const selectedId = row.original._id;

//                         if (!selectedId) {
//                           console.error('⚠️ Booking ID is missing!');
//                           return;
//                         }

//                         console.log('Attempting to delete Booking ID:', selectedId);

//                         // Show confirmation alert before deleting
//                         const isConfirmed = window.confirm("Are you sure you want to delete this booking?");

//                         if (!isConfirmed) {
//                           console.log('Deletion cancelled');
//                           return;
//                         }

//                         // Call API to delete the booking
//                         const response = await fetch(`${API_URL}/vendor/deletebooking/${selectedId}`, {
//                           method: 'DELETE'
//                         });

//                         if (!response.ok) {
//                           throw new Error('Failed to delete booking');
//                         }

//                         console.log('✅ Booking Deleted:', selectedId);

//                         // Update the table after deletion
//                         setData(prevData => prevData.filter(booking => booking._id !== selectedId));
//                       } catch (error) {
//                         console.error('Error deleting booking:', error);
//                       }
//                     },
//                     className: 'flex items-center gap-2 pli-4'
//                   }
//                 }
//               ]}
//             />
//           </div>
//         ),
//         enableSorting: false
//       }),
//       columnHelper.accessor('statusAction', {
//         header: 'Change Status',
//         cell: ({ row }) => (
//           <BookingActionButton
//             bookingId={row.original._id}
//             currentStatus={row.original.status}
//             onUpdate={fetchData}  // Pass the fetchData function to refresh data after status update
//           />
//         ),
//         enableSorting: false
//       })
//     ],
//     [router]
//   );

//   const table = useReactTable({
//     data: filteredData.length > 0 || globalFilter ? filteredData : data,
//     columns,
//     filterFns: {
//       fuzzy: fuzzyFilter
//     },
//     state: {
//       rowSelection,
//       globalFilter
//     },
//     initialState: {
//       pagination: {
//         pageSize: 10
//       }
//     },
//     enableRowSelection: true,
//     globalFilterFn: fuzzyFilter,
//     onRowSelectionChange: setRowSelection,
//     onGlobalFilterChange: setGlobalFilter,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues()
//   });

//   const getAvatar = params => {
//     const { avatar, customer } = params

//     if (avatar) {
//       return <CustomAvatar src={avatar} skin='light' size={34} />
//     } else {
//       return (
//         <CustomAvatar skin='light' size={34}>
//           {getInitials(customer)}
//         </CustomAvatar>
//       )
//     }
//   }

//   return (
//     <Card>
//       <CardHeader title='Request Management' />
//       <Divider />
//       <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
//         <DebouncedInput
//           value={globalFilter ?? ''}
//           onChange={value => setGlobalFilter(String(value))}
//           placeholder='Search Order'
//           className='sm:is-auto'
//         />
//         <Button
//           variant='contained'
//           component={Link}
//           href={getLocalizedUrl('/pages/wizard-examples/property-listing', locale)}
//           startIcon={<i className='ri-add-line' />}
//           className='max-sm:is-full is-auto'
//         >
//           New Booking
//         </Button>
//       </CardContent>
//       <div className='overflow-x-auto'>
//         {loading ? (
//           <div className="p-8 text-center">
//             <Typography>Loading bookings data...</Typography>
//           </div>
//         ) : (
//           <table className={tableStyles.table}>
//             <thead>
//               {table.getHeaderGroups().map(headerGroup => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map(header => (
//                     <th key={header.id}>
//                       {header.isPlaceholder ? null : (
//                         <>
//                           <div
//                             className={classnames({
//                               'flex items-center': header.column.getIsSorted(),
//                               'cursor-pointer select-none': header.column.getCanSort()
//                             })}
//                             onClick={header.column.getToggleSortingHandler()}
//                           >
//                             {flexRender(header.column.columnDef.header, header.getContext())}
//                             {{
//                               asc: <i className='ri-arrow-up-s-line text-xl' />,
//                               desc: <i className='ri-arrow-down-s-line text-xl' />
//                             }[header.column.getIsSorted()] ?? null}
//                           </div>
//                         </>
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             {table.getFilteredRowModel().rows.length === 0 ? (
//               <tbody>
//                 <tr>
//                   <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
//                     No data available
//                   </td>
//                 </tr>
//               </tbody>
//             ) : (
//               <tbody>
//                 {table
//                   .getRowModel()
//                   .rows.slice(0, table.getState().pagination.pageSize)
//                   .map(row => {
//                     return (
//                       <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
//                         {row.getVisibleCells().map(cell => (
//                           <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
//                         ))}
//                       </tr>
//                     )
//                   })}
//               </tbody>
//             )}
//           </table>
//         )}
//       </div>
//       <TablePagination
//         rowsPerPageOptions={[10, 25, 50, 100]}
//         component='div'
//         className='border-bs'
//         count={table.getFilteredRowModel().rows.length}
//         rowsPerPage={table.getState().pagination.pageSize}
//         page={table.getState().pagination.pageIndex}
//         SelectProps={{
//           inputProps: { 'aria-label': 'rows per page' }
//         }}
//         onPageChange={(_, page) => {
//           table.setPageIndex(page)
//         }}
//         onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
//       />
//     </Card>
//   )
// }

// export default OrderListTable



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
        const filteredBookings = result.bookings.filter(booking => 
          ["pending", "approved", "cancelled", "parked", "completed"]
            .includes(booking.status.toLowerCase())
        )
        setData(filteredBookings)
        setFilteredData(filteredBookings)
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
          const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A'
            const [day, month, year] = dateStr.split('-')
            return new Date(`${year}-${month}-${day}`).toLocaleDateString()
          }

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calendar-2-line text-[26px]" style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDate(row.original.bookingDate)}, ${row.original.bookingTime || 'N/A'}`}
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
      columnHelper.accessor('sts', {
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
              <i className="ri-circle-fill" style={{ fontSize: '10px', color: chipData.color }}></i>
              {chipData.text}
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

  return (
    <Card>
      <CardHeader title='Booking Management' />
      <Divider />
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Bookings'
          className='sm:is-auto'
        />
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
        ) : error ? (
          <Alert severity="error" className="m-4">
            {error}
          </Alert>
        ) : table.getFilteredRowModel().rows.length === 0 ? (
          <Alert severity="info" className="m-4">
            No bookings found
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
