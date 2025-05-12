// 'use client'

// // React Imports
// import { useEffect, useState } from 'react'

// import { useSession } from 'next-auth/react'
// import axios from 'axios'

// // MUI Imports
// import { useMediaQuery } from '@mui/material'

// // Redux Imports
// import { useDispatch, useSelector } from 'react-redux'

// import { setFetchedEvents,  filterCalendarLabel, filterAllCalendarLabels } from '@/redux-store/slices/calendar'

// // Component Imports
// import Calendar from './Calendar'
// import SidebarLeft from './SidebarLeft'
// import AddEventSidebar from './AddEventSidebar'


// // CalendarColors Object
// const calendarsColor = {
//   Marketing: 'primary',
//     Sales: 'error',
//   // Finance: 'warning',
//   Product: 'success',
//   // Operations: 'info'
// }

// const AppCalendar = () => {
//   const dispatch = useDispatch()
//   const calendarStore = useSelector(state => state.calendarReducer)
//   const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))
//   const [calendarApi, setCalendarApi] = useState(null)
//   const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
//   const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false)
//   const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
//   const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)
//   const [selectedDate, setSelectedDate] = useState(new Date()) // ✅ Store selected date

//   const handleDateClick = (info) => {
//     setSelectedDate(new Date(info.dateStr)) // ✅ Set clicked date
//     handleAddEventSidebarToggle() // ✅ Open sidebar
//   }

//   const API_URL = process.env.NEXT_PUBLIC_API_URL

//   // Session for vendor details
//   const { data: session } = useSession()
//   const vendorId = session?.user?.id

//   console.log('vendorid===', vendorId);
//   useEffect(() => {
//     const fetchMeetings = async () => {
//       try {
//         if (!vendorId) {
//           console.warn("Vendor ID not available yet."); // ✅ Debugging
          
// return
//         }

//         console.log("Fetching meetings for vendor:", vendorId); // ✅ Debugging

//         const response = await axios.get(`${API_URL}/vendor/fetchmeeting/${vendorId}`);

//         if (response.data.meetings) {
//           const events = response.data.meetings.map(meeting => {
//             let startTime = new Date(meeting.callbackTime);

//             if (isNaN(startTime.getTime())) {
//               startTime = new Date(meeting.callbackTime.replace(/-/g, '/'));
//             }

//             const eventDetails = {
//               id: meeting._id,
//               title: meeting.name,
//               start: startTime.toISOString(),
//               end: new Date(startTime.getTime() + 60 * 60 * 1000).toISOString(),
//               allDay: false,
//               extendedProps: {
//                 calendar: meeting.department || "ETC",
//                 email: meeting.email,
//                 mobile: meeting.mobile,
//                 description: meeting.businessURL || "",
//                 vendorId: meeting.vendorId
//               }
//             };

//             console.log("Fetched Event:", eventDetails); // ✅ Debugging

//             return eventDetails;
//           });

//           dispatch(setFetchedEvents(events));
//         }
//       } catch (error) {
//         console.error("Error fetching meetings:", error);
//       }
//     };

//     if (vendorId) {
//       fetchMeetings();
//     }
//   }, [dispatch, vendorId]); // ✅ Re-run only when `vendorId` is available


//   return (
//     <>
//       <SidebarLeft
//         mdAbove={mdAbove}
//         dispatch={dispatch}
//         calendarApi={calendarApi}
//         calendarStore={calendarStore}
//         calendarsColor={calendarsColor}
//         leftSidebarOpen={leftSidebarOpen}
//         handleLeftSidebarToggle={handleLeftSidebarToggle}
//         handleAddEventSidebarToggle={handleAddEventSidebarToggle}
//       />
//       <div className='p-5 flex-grow overflow-visible bg-backgroundPaper rounded'>
//         <Calendar
//           dispatch={dispatch}
//           calendarApi={calendarApi}
//           calendarStore={calendarStore}
//           setCalendarApi={setCalendarApi}
//           calendarsColor={calendarsColor}
//           handleLeftSidebarToggle={handleLeftSidebarToggle}
//           handleAddEventSidebarToggle={handleAddEventSidebarToggle}
//           handleDateClick={handleDateClick} // ✅ Pass to Calendar
//         />
//       </div>
//       <AddEventSidebar
//         dispatch={dispatch}
//         calendarApi={calendarApi}
//         calendarStore={calendarStore}
//         addEventSidebarOpen={addEventSidebarOpen}
//         handleAddEventSidebarToggle={handleAddEventSidebarToggle}
//         selectedDate={selectedDate} // ✅ Pass selected date
//       />
//     </>
//   )
// }

// export default AppCalendar
'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

// MUI Imports
import { useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Paper from '@mui/material/Paper'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { setFetchedEvents, filterCalendarLabel, filterAllCalendarLabels } from '@/redux-store/slices/calendar'

// Component Imports
import Calendar from './Calendar'
import SidebarLeft from './SidebarLeft'
import AddEventSidebar from './AddEventSidebar'

// CalendarColors Object
const calendarsColor = {
  Marketing: 'primary',
  Sales: 'error',
  Product: 'success',
}

const AppCalendar = () => {
  const dispatch = useDispatch()
  const calendarStore = useSelector(state => state.calendarReducer)
  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))
  const [calendarApi, setCalendarApi] = useState(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false)
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Meetings state
  const [meetings, setMeetings] = useState([])
  const [meetingsLoading, setMeetingsLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // Session for vendor details
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  const fetchMeetings = async () => {
    if (!vendorId) return;
    
    setMeetingsLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/vendor/fetchmeeting/${vendorId}`);
      if (response.data?.meetings) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const renderMeetings = () => {
    if (meetingsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }
    
    if (!meetings || meetings.length === 0) {
      return <Alert severity="info" sx={{ mt: 2 }}>No meeting requests found</Alert>;
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Meeting Requests</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Mobile</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting._id}>
                  <TableCell>{meeting.name || 'N/A'}</TableCell>
                  <TableCell>{meeting.email || 'N/A'}</TableCell>
                  <TableCell>{meeting.mobile || 'N/A'}</TableCell>
                  <TableCell>{new Date(meeting.callbackTime).toLocaleString() || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  useEffect(() => {
    const fetchCalendarMeetings = async () => {
      try {
        if (!vendorId) {
          console.warn("Vendor ID not available yet.");
          return
        }

        console.log("Fetching meetings for vendor:", vendorId);

        const response = await axios.get(`${API_URL}/vendor/fetchmeeting/${vendorId}`);

        if (response.data.meetings) {
          const events = response.data.meetings.map(meeting => {
            let startTime = new Date(meeting.callbackTime);

            if (isNaN(startTime.getTime())) {
              startTime = new Date(meeting.callbackTime.replace(/-/g, '/'));
            }

            const eventDetails = {
              id: meeting._id,
              title: meeting.name,
              start: startTime.toISOString(),
              end: new Date(startTime.getTime() + 60 * 60 * 1000).toISOString(),
              allDay: false,
              extendedProps: {
                calendar: meeting.department || "ETC",
                email: meeting.email,
                mobile: meeting.mobile,
                description: meeting.businessURL || "",
                vendorId: meeting.vendorId
              }
            };

            console.log("Fetched Event:", eventDetails);

            return eventDetails;
          });

          dispatch(setFetchedEvents(events));
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    if (vendorId) {
      fetchCalendarMeetings();
      fetchMeetings();
    }
  }, [dispatch, vendorId]);

  const handleDateClick = (info) => {
    setSelectedDate(new Date(info.dateStr))
    handleAddEventSidebarToggle()
  }

  return (
    <>
      <SidebarLeft
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={calendarStore}
        calendarsColor={calendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
      <div className='p-5 flex-grow overflow-visible bg-backgroundPaper rounded'>
        <Calendar
          dispatch={dispatch}
          calendarApi={calendarApi}
          calendarStore={calendarStore}
          setCalendarApi={setCalendarApi}
          calendarsColor={calendarsColor}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          handleDateClick={handleDateClick}
        />
        {/* Render meetings table below the calendar */}
        {renderMeetings()}
      </div>
      <AddEventSidebar
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={calendarStore}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        selectedDate={selectedDate}
      />
    </>
  )
}

export default AppCalendar
