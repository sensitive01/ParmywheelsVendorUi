import { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'

// MUI Imports
import {
  Box,
  Drawer,
  Select,
  Button,
  MenuItem,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl
} from '@mui/material'

// Third-party Imports
import { useForm } from 'react-hook-form'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useSelector, useDispatch } from 'react-redux'

import { selectedEvent } from '@/redux-store/slices/calendar'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL

const AddEventSidebar = props => {
  // Props
  const { addEventSidebarOpen, handleAddEventSidebarToggle, onMeetingCreated } = props

  // Session for vendor details
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  // States
  const [meetingDetails, setMeetingDetails] = useState({
    name: '',
    department: '',
    email: '',
    mobile: '',
    businessURL: '',
    callbackTime: new Date()
  })

  const dispatch = useDispatch()
  const calendarStore = useSelector(state => state.calendarReducer)
  const { selectedEvent: eventToEdit } = calendarStore

  useEffect(() => {
    if (eventToEdit) {
      setMeetingDetails({
        name: eventToEdit.title || '',
        department: eventToEdit.extendedProps?.calendar || '',
        email: eventToEdit.extendedProps?.email || '',
        mobile: eventToEdit.extendedProps?.mobile || '',
        businessURL: eventToEdit.extendedProps?.description || '',
        callbackTime: eventToEdit.start ? new Date(eventToEdit.start) : new Date()
      })
    } else {
      setMeetingDetails({
        name: '',
        department: '',
        email: '',
        mobile: '',
        businessURL: '',
        callbackTime: new Date()
      })
    }
  }, [eventToEdit])

  // React Hook Form
  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm()

  // Format date to dd/MM/yyyy HH:mm
  const formatDate = date => {
    const pad = num => num.toString().padStart(2, '0')

    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  // Validate mobile number
  const validateMobile = mobile => {
    const regex = /^\d{10}$/

    return regex.test(mobile)
  }

  // Handle form submission
  // Handle form submission
  const onSubmit = async () => {
    if (!vendorId) {
      alert('Vendor not logged in')

      return
    }

    // Validate mobile number
    if (!validateMobile(meetingDetails.mobile)) {
      setError('mobile', {
        type: 'manual',
        message: 'Mobile number must be exactly 10 digits'
      })

      return
    }

    clearErrors('mobile')

    const meetingData = {
      name: meetingDetails.name,
      department: meetingDetails.department,
      email: meetingDetails.email,
      mobile: meetingDetails.mobile,
      businessURL: meetingDetails.businessURL,
      callbackTime: formatDate(meetingDetails.callbackTime),
      vendorId
    }

    try {
      const isUpdate = !!eventToEdit?.id

      const url = isUpdate ? `${API_URL}/vendor/updatemeeting/${eventToEdit.id}` : `${API_URL}/vendor/createmeeting`

      const method = isUpdate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData)
      })

      const result = await response.json()

      if (response.ok) {
        alert(isUpdate ? 'Meeting updated successfully!' : 'Meeting created successfully!')
        if (onMeetingCreated) onMeetingCreated()
        handleAddEventSidebarToggle()
      } else {
        alert(result.message || (isUpdate ? 'Failed to update meeting' : 'Failed to create meeting'))
      }
    } catch (error) {
      console.error('Error saving meeting:', error)
      alert('Something went wrong!')
    }
  }

  const handleDelete = async () => {
    if (!eventToEdit?.id) return

    if (!window.confirm('Are you sure you want to delete this meeting?')) return

    try {
      const response = await fetch(`${API_URL}/vendor/deletemeeting/${eventToEdit.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Meeting deleted successfully!')
        if (onMeetingCreated) onMeetingCreated()
        handleAddEventSidebarToggle()
      } else {
        alert('Failed to delete meeting')
      }
    } catch (error) {
      console.error('Error deleting meeting:', error)
      alert('Something went wrong!')
    }
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleAddEventSidebarToggle}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', 400] } }}
    >
      <Box className='flex justify-between items-center sidebar-header pli-5 plb-4 border-be'>
        <Typography variant='h5'>{eventToEdit?.id ? 'Update Meeting' : 'Schedule a Meeting'}</Typography>
        <IconButton size='small' onClick={handleAddEventSidebarToggle}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </Box>
      <PerfectScrollbar>
        <Box className='sidebar-body p-5'>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <FormControl fullWidth className='mbe-5'>
              <TextField
                label='Name'
                value={meetingDetails.name}
                onChange={e => setMeetingDetails({ ...meetingDetails, name: e.target.value })}
                required
              />
            </FormControl>
            <FormControl fullWidth className='mbe-5'>
              <InputLabel id='department-label'>Department</InputLabel>
              <Select
                labelId='department-label'
                value={meetingDetails.department}
                onChange={e => setMeetingDetails({ ...meetingDetails, department: e.target.value })}
                required
              >
                <MenuItem value='Marketing'>Marketing</MenuItem>
                <MenuItem value='Sales'>Sales</MenuItem>
                <MenuItem value='Product'>Product</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth className='mbe-5'>
              <TextField
                label='Email'
                type='email'
                value={meetingDetails.email}
                onChange={e => setMeetingDetails({ ...meetingDetails, email: e.target.value })}
                required
              />
            </FormControl>
            <FormControl fullWidth className='mbe-5'>
              <TextField
                label='Mobile'
                value={meetingDetails.mobile}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)

                  setMeetingDetails({ ...meetingDetails, mobile: value })
                  if (value.length === 10) clearErrors('mobile')
                }}
                error={!!errors.mobile}
                helperText={errors.mobile?.message}
                required
              />
            </FormControl>
            <FormControl fullWidth className='mbe-5'>
              <TextField
                label='Business URL'
                value={meetingDetails.businessURL}
                onChange={e => setMeetingDetails({ ...meetingDetails, businessURL: e.target.value })}
              />
            </FormControl>
            <div className='mbe-5'>
              <AppReactDatepicker
                selected={meetingDetails.callbackTime}
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={15}
                dateFormat='dd/MM/yyyy HH:mm'
                customInput={<TextField fullWidth label='Callback Time' />}
                onChange={date => setMeetingDetails({ ...meetingDetails, callbackTime: date })}
              />
            </div>
            <div className='flex gap-4'>
              <Button type='submit' variant='contained' fullWidth>
                {eventToEdit?.id ? 'Update' : 'Schedule'}
              </Button>
              {eventToEdit?.id && (
                <Button variant='outlined' color='error' fullWidth onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
          </form>
        </Box>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AddEventSidebar
