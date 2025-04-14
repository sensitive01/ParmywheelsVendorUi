'use client'

// React Imports
import { useEffect, useState } from 'react'

import axios from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'

// API Config
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'


// Styled Timeline component
const Timeline = styled(MuiTimeline)({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': { display: 'none' },
    '& .MuiTimelineContent-root:last-child': { paddingBottom: 0 },
    '&:nth-last-child(2) .MuiTimelineConnector-root': {
      backgroundColor: 'transparent',
      borderInlineStart: '1px dashed var(--mui-palette-divider)'
    },
    '& .MuiTimelineConnector-root': {
      backgroundColor: 'var(--mui-palette-primary-main)'
    }
  }
})

const ShippingActivity = ({ orderId }) => {
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) return // ✅ Prevents API call if no orderId

    const fetchTimeline = async () => {
      try {
        const response = await axios.get(`${API_URL}/vendor/getbookingtimeline/${orderId}`)

        if (response.data && response.data.timeline) {
          setTimeline(response.data.timeline) // ✅ Store timeline data
        } else {
          setError('No timeline data available')
        }
      } catch (error) {
        console.error('Error fetching booking timeline:', error)
        setError('Failed to load timeline')
      } finally {
        setLoading(false) // ✅ Stop loading after API call
      }
    }

    fetchTimeline()
  }, [orderId])
  
return (
    <Card>
      <CardHeader title='Parking Timeline Activity' />
      <CardContent>
        {loading ? (
          <Typography>Loading timeline...</Typography>
        ) : error ? (
          <Typography color='error'>{error}</Typography>
        ) : (
          <Timeline>
            {/* Order Placed */}
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color='primary' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                  <Typography color='text.primary' className='font-medium'>
                    Order was placed (Booking ID: #{orderId})
                  </Typography>
                  <Typography variant='caption'>
                    {timeline?.bookingDate || 'N/A'} {timeline?.bookingTime || ''}
                  </Typography>
                </div>
                <Typography className='mbe-2'>Your order has been placed successfully</Typography>
              </TimelineContent>
            </TimelineItem>
            {/* Approved */}
            {timeline?.approvedDate && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                    <Typography color='text.primary' className='font-medium'>Approved</Typography>
                    <Typography variant='caption'>{timeline.approvedDate} {timeline.approvedTime}</Typography>
                  </div>
                  <Typography className='mbe-2'>Booking was approved</Typography>
                </TimelineContent>
              </TimelineItem>
            )}
            {/* Parked */}
            {timeline?.parkedDate && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                    <Typography color='text.primary' className='font-medium'>Parked</Typography>
                    <Typography variant='caption'>{timeline.parkedDate} {timeline.parkedTime}</Typography>
                  </div>
                  <Typography className='mbe-2'>Vehicle parked successfully</Typography>
                </TimelineContent>
              </TimelineItem>
            )}
            {/* Exited */}
            {timeline?.exitDate && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='primary' />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                    <Typography color='text.primary' className='font-medium'>Exited</Typography>
                    <Typography variant='caption'>{timeline.exitDate} {timeline.exitTime}</Typography>
                  </div>
                  <Typography className='mbe-2'>Booking completed, vehicle exited</Typography>
                </TimelineContent>
              </TimelineItem>
            )}
            {/* Cancelled */}
            {timeline?.cancelledDate && !timeline?.exitDate && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color='error' />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography color='text.primary' className='font-medium'>Cancelled</Typography>
                  <Typography variant='caption'>{timeline.cancelledDate} {timeline.cancelledTime}</Typography>
                  <Typography className='mbe-2'>Booking was cancelled</Typography>
                </TimelineContent>
              </TimelineItem>
            )}
          </Timeline>
        )}
      </CardContent>
    </Card>
  )
}

export default ShippingActivity
