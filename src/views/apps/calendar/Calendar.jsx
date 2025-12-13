import { useEffect, useRef } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import 'bootstrap-icons/font/bootstrap-icons.css'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// Redux Imports
import { useSelector, useDispatch } from 'react-redux'

import { filterEvents, selectedEvent, updateEvent } from '@/redux-store/slices/calendar'

const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    description: ''
  }
}

const Calendar = props => {
  // Props
  const { setCalendarApi, calendarsColor, handleAddEventSidebarToggle, handleLeftSidebarToggle } = props

  // Refs
  const calendarRef = useRef()

  // Hooks
  const theme = useTheme()
  const dispatch = useDispatch()

  // Get Events from Redux Store
  const calendarStore = useSelector(state => state.calendarReducer)
  const { events } = calendarStore

  useEffect(() => {
    if (!events.length) {
      console.warn('No events fetched yet. Check API response.')
    } else {
      console.log('Fetched Events:', events) // ✅ Debugging
    }

    if (calendarRef.current && !calendarRef.current.getApi()) {
      setCalendarApi(calendarRef.current.getApi())
    }
  }, [events])

  const parseDateString = dateString => {
    if (!dateString) return null
    if (dateString instanceof Date) return dateString // Return Date objects as-is

    // If it's a string that's already in ISO format
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) return date

    return null // Return null for invalid dates
  }

  // Debug: Log the raw events before processing
  console.log('Raw events from Redux:', events)

  // Process events to ensure dates are in correct format
  const processedEvents = events.map(event => {
    const processedEvent = {
      ...event,
      start: parseDateString(event.start) || event.start,
      end: parseDateString(event.end) || event.end,
      extendedProps: {
        ...event.extendedProps
        // Add any additional processing for extended props if needed
      }
    }

    // Debug: Log each processed event
    console.log('Processed event:', {
      id: processedEvent.id,
      title: processedEvent.title,
      start: processedEvent.start,
      end: processedEvent.end,
      allDay: processedEvent.allDay,
      extendedProps: processedEvent.extendedProps
    })

    return processedEvent
  })

  // Debug: Log the final processed events array
  console.log('Processed events array:', processedEvents)

  // FullCalendar Options
  const calendarOptions = {
    events: processedEvents,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'sidebarToggle, prev, next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    views: {
      week: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },
    editable: true,
    eventResizableFromStart: true,
    dragScroll: true,
    dayMaxEvents: 2,
    navLinks: true,

    // ✅ Show full details only in list & day views
    eventContent: function (arg) {
      const { event, view } = arg

      if (view.type === 'dayGridMonth') {
        // ✅ Show only title in Month View
        return { html: `<strong>${event.title}</strong>` }
      } else if (view.type === 'timeGridDay' || view.type === 'listMonth') {
        // ✅ Show full details in Day & List Views
        return {
          html: `
            <div>
              <strong>${event.title}</strong><br>
              <small>Email: ${event.extendedProps.email || 'N/A'}</small><br>
              <small>Mobile: ${event.extendedProps.mobile || 'N/A'}</small><br>
              <small>Description: ${event.extendedProps.description || 'N/A'}</small>
            </div>
          `
        }
      } else {
        // ✅ Default: Show title for all other views
        return { html: `<strong>${event.title}</strong>` }
      }
    },
    eventClassNames({ event: calendarEvent }) {
      const colorName = calendarsColor[calendarEvent.extendedProps.calendar]

      return [`event-bg-${colorName}`]
    },
    eventClick({ event: clickedEvent, jsEvent }) {
      jsEvent.preventDefault()

      // ✅ Extract plain object to avoid circular reference issues in Redux
      const eventDetails = {
        id: clickedEvent.id,
        title: clickedEvent.title,
        start: clickedEvent.start,
        end: clickedEvent.end,
        allDay: clickedEvent.allDay,
        extendedProps: clickedEvent.extendedProps
      }

      console.log('Clicked Event Details:', eventDetails)

      dispatch(selectedEvent(eventDetails))
      handleAddEventSidebarToggle()
    },
    customButtons: {
      sidebarToggle: {
        icon: 'bi bi-list',
        click() {
          handleLeftSidebarToggle()
        }
      }
    },
    dateClick(info) {
      const ev = {
        ...blankEvent,
        start: info.dateStr, // ✅ Use the clicked date
        end: info.dateStr, // ✅ Ensure the end date is also set
        allDay: true
      }

      console.log('Clicked Date:', info.dateStr) // ✅ Debugging
      dispatch(selectedEvent(ev))
      handleAddEventSidebarToggle()
    },
    eventDrop({ event: droppedEvent }) {
      dispatch(updateEvent(droppedEvent))
      dispatch(filterEvents())
    },
    eventResize({ event: resizedEvent }) {
      dispatch(updateEvent(resizedEvent))
      dispatch(filterEvents())
    },
    ref: calendarRef,
    direction: theme.direction
  }

  return <FullCalendar {...calendarOptions} />
}

export default Calendar
