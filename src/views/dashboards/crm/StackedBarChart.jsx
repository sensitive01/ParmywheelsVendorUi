'use client'

import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import CalendarMonth from '@mui/icons-material/CalendarMonth'

const MeetingCountCard = () => {
  // Hooks
  const { data: session } = useSession()
  const vendorId = session?.user?.id
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  
  // State for meeting count
  const [meetingCount, setMeetingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch meeting count
  useEffect(() => {
    const fetchMeetingCount = async () => {
      if (!vendorId) return
      
      setLoading(true)
      try {
        const response = await axios.get(`${API_URL}/vendor/fetchmeeting/${vendorId}`)
        if (response.data?.meetings) {
          setMeetingCount(response.data.meetings.length)
        }
      } catch (error) {
        console.error('Error fetching meetings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeetingCount()
  }, [vendorId])

  return (
    <Card sx={{ 
      minWidth: 200, 
      maxWidth: 200,
      height: 196, 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
    }}>
      <CardContent sx={{ 
        padding: '12px !important',
        '&:last-child': { paddingBottom: '12px', marginTop: '10px' } 
      }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <CalendarMonth color="primary" fontSize="small" />
          <Typography variant="caption" color="text.secondary">
            Meetings
          </Typography>
        </Box>
        <Box>
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <Typography variant="h5" component="div">
              {meetingCount}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default MeetingCountCard
