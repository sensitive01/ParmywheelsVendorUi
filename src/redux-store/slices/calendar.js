// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'


// Initial State
const initialState = {
  events: [], // Start with an empty array as events will be fetched from API
  filteredEvents: [],
  selectedEvent: null,
  selectedCalendars: ['Sales', 'Marketing', 'Finance', 'Product', 'Operations', 'ETC']
}


// Function to filter events based on selected calendars
const filterEventsUsingCheckbox = (events, selectedCalendars) => {
  return events.filter(event => selectedCalendars.includes(event.extendedProps?.calendar))
}

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState: initialState,
  reducers: {
    // This will be used to reset filtered events to show all events
    filterEvents: state => {
      state.filteredEvents = state.events
    },

    // Action for adding a single event (from API or manually created)
    addEvent: (state, action) => {
      const newEvent = {
        id: `${parseInt(state.events[state.events.length - 1]?.id ?? '') + 1}`, // Auto-generate ID
        title: action.payload.title,  // Meeting title
        start: action.payload.start,  // Meeting start time
        end: action.payload.end,      // Meeting end time
        allDay: action.payload.allDay ?? false, // Adjust if the meeting is all-day
        extendedProps: {
          calendar: action.payload.calendar, // Calendar category (e.g., Business, Personal)
          description: action.payload.description, // Meeting description
          guests: action.payload.guests || [] // Optional list of guests
        }
      };


      // Add the new event to the events array
      state.events.push(newEvent);
    },

    // Action for updating an existing event
    updateEvent: (state, action) => {
      state.events = state.events.map(event => {
        if (action.payload._def && event.id === action.payload._def.publicId) {
          return {
            id: event.id,
            url: action.payload._def.url,
            title: action.payload._def.title,
            allDay: action.payload._def.allDay,
            end: action.payload._instance.range.end,
            start: action.payload._instance.range.start,
            extendedProps: action.payload._def.extendedProps
          }
        } else if (event.id === action.payload.id) {
          return action.payload
        } else {
          return event
        }
      });
    },

    // Action for deleting an event
    deleteEvent: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload)
    },

    // Action for selecting an event (likely for viewing/editing)
    selectedEvent: (state, action) => {
      state.selectedEvent = action.payload
    },

    // Action for toggling calendar labels (e.g., Personal, Business, etc.)
    filterCalendarLabel: (state, action) => {
      const index = state.selectedCalendars.indexOf(action.payload)

      if (index !== -1) {
        state.selectedCalendars.splice(index, 1)
      } else {
        state.selectedCalendars.push(action.payload)
      }

      // Apply the selected filters to events
      state.events = state.selectedCalendars.length > 0
        ? filterEventsUsingCheckbox(state.filteredEvents, state.selectedCalendars)
        : [];
    },

    // Action to filter all calendar labels (either show all or none)
    filterAllCalendarLabels: (state, action) => {
      state.selectedCalendars = action.payload
        ? ['Sales', 'Marketing', 'Finance', 'Product', 'Operations', 'ETC']
        : [];
      state.events = action.payload
        ? [...state.filteredEvents]
        : [];
    },

    // Action to set the fetched events from API to the store
    setFetchedEvents: (state, action) => {
      state.events = action.payload;
      state.filteredEvents = action.payload;
      state.events = state.selectedCalendars.length > 0
        ? filterEventsUsingCheckbox(action.payload, state.selectedCalendars)
        : action.payload;
    }
  }
});

// Export actions
export const {
  filterEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  selectedEvent,
  filterCalendarLabel,
  filterAllCalendarLabels,
  setFetchedEvents // This action should be included here
} = calendarSlice.actions;

// Export reducer
export default calendarSlice.reducer;
