'use client'

// React Imports
import { useEffect, useState, useCallback } from 'react'
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

  // Fetch meetings for table
  const fetchMeetings = useCallback(async () => {
    if (!vendorId) return;

    setMeetingsLoading(true);

    try {
      const response = await axios.get(`${API_URL}/vendor/fetchmeeting/${vendorId}`);
      console.log('Fetched meetings for table:', response.data);
      if (response.data?.meetings) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setMeetingsLoading(false);
    }
  }, [vendorId, API_URL]);


  const fetchCalendarMeetings = useCallback(async () => {
    try {
      if (!vendorId) {
        console.warn("Vendor ID not available yet.");
        return;
      }

      console.log("Fetching meetings for vendor:", vendorId);
      const response = await axios.get(`${API_URL}/vendor/fetchmeeting/${vendorId}`);

      if (response.data.meetings) {
        const events = response.data.meetings.map(meeting => {
          // Parse the date from DD/MM/YYYY HH:mm format
          const [datePart, timePart] = meeting.callbackTime.split(' ');
          const [day, month, year] = datePart.split('/');
          const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];

          // Create a proper Date object (month is 0-indexed in JavaScript)
          const startTime = new Date(year, month - 1, day, hours, minutes);

          // Validate the date
          if (isNaN(startTime.getTime())) {
            console.error('Invalid date for meeting:', meeting);
            return null;
          }

          const eventDetails = {
            id: meeting._id,
            title: meeting.name,
            start: startTime,  // Use the Date object directly
            end: new Date(startTime.getTime() + 60 * 60 * 1000), // 1 hour later
            allDay: false,
            extendedProps: {
              calendar: meeting.department || "ETC",
              email: meeting.email,
              mobile: meeting.mobile,
              description: meeting.businessURL || "",
              vendorId: meeting.vendorId
            }
          };

          console.log("Processed Event:", eventDetails);
          return eventDetails;
        }).filter(Boolean); // Filter out any null events from invalid dates

        console.log("Dispatching events to Redux:", events);
        dispatch(setFetchedEvents(events));
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  }, [vendorId, API_URL, dispatch]);

  // Function to refresh data after creating a new meeting
  const handleMeetingCreated = useCallback(async () => {
    console.log('Refreshing data after meeting creation...');
    await Promise.all([
      fetchCalendarMeetings(),
      fetchMeetings()
    ]);
  }, [fetchCalendarMeetings, fetchMeetings]);

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
                  <TableCell>{meeting.callbackTime || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // Initial data fetch
  useEffect(() => {
    if (vendorId) {
      console.log('Initial data fetch for vendorId:', vendorId);
      fetchCalendarMeetings();
      fetchMeetings();
    }
  }, [vendorId, fetchCalendarMeetings, fetchMeetings]);

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
        onMeetingCreated={handleMeetingCreated}
      />
    </>
  )
}

export default AppCalendar
