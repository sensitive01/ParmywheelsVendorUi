'use client'

// React Imports
import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'
import axios from 'axios'

// MUI Imports
import { useMediaQuery } from '@mui/material'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'

import { setFetchedEvents,  filterCalendarLabel, filterAllCalendarLabels } from '@/redux-store/slices/calendar'

// Component Imports
import Calendar from './Calendar'
import SidebarLeft from './SidebarLeft'
import AddEventSidebar from './AddEventSidebar'


// CalendarColors Object
const calendarsColor = {
  Sales: 'error',
  Marketing: 'primary',
  Finance: 'warning',
  Product: 'success',
  Operations: 'info'
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
  const [selectedDate, setSelectedDate] = useState(new Date()) // ✅ Store selected date

  const handleDateClick = (info) => {
    setSelectedDate(new Date(info.dateStr)) // ✅ Set clicked date
    handleAddEventSidebarToggle() // ✅ Open sidebar
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // Session for vendor details
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  console.log('vendorid===', vendorId);
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        if (!vendorId) {
          console.warn("Vendor ID not available yet."); // ✅ Debugging
          
return
        }

        console.log("Fetching meetings for vendor:", vendorId); // ✅ Debugging

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

            console.log("Fetched Event:", eventDetails); // ✅ Debugging

            return eventDetails;
          });

          dispatch(setFetchedEvents(events));
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    if (vendorId) {
      fetchMeetings();
    }
  }, [dispatch, vendorId]); // ✅ Re-run only when `vendorId` is available


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
          handleDateClick={handleDateClick} // ✅ Pass to Calendar
        />
      </div>
      <AddEventSidebar
        dispatch={dispatch}
        calendarApi={calendarApi}
        calendarStore={calendarStore}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        selectedDate={selectedDate} // ✅ Pass selected date
      />
    </>
  )
}

export default AppCalendar
