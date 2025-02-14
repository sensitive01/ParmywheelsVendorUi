// 'use client'
// import { useEffect, useRef } from 'react'
// import { useSession } from 'next-auth/react'
// // MUI Imports
// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import TimelineItem from '@mui/lab/TimelineItem'
// import TimelineSeparator from '@mui/lab/TimelineSeparator'
// import TimelineConnector from '@mui/lab/TimelineConnector'
// import TimelineContent from '@mui/lab/TimelineContent'
// import TimelineDot from '@mui/lab/TimelineDot'
// import { styled } from '@mui/material/styles'
// import MuiTimeline from '@mui/lab/Timeline'
// // Google Maps API Key
// const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
// // Styled Components
// const Timeline = styled(MuiTimeline)({
//   '& .MuiTimelineItem-root': {
//     '&:before': {
//       display: 'none'
//     }
//   }
// })
// const ActivityTimeline = () => {
//   const { data: session } = useSession()
//   const user = session?.user
//   const mapRef = useRef(null)
//   const markerRef = useRef(null)
//   useEffect(() => {
//     if (user?.address && window.google) {
//       initMap(user.address)
//     } else if (user?.address) {
//       const script = document.createElement('script')
//       script.src = `https://maps.gomaps.pro/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
//       script.async = true
//       script.onload = () => initMap(user.address)
//       document.body.appendChild(script)
//     }
//   }, [user?.address])
//   const initMap = address => {
//     const geocoder = new window.google.maps.Geocoder()
//     const map = new window.google.maps.Map(mapRef.current, { zoom: 15 })
//     geocoder.geocode({ address }, (results, status) => {
//       if (status === 'OK' && results[0]?.geometry?.location) {
//         const location = results[0].geometry.location
//         map.setCenter(location)
//         markerRef.current = new window.google.maps.Marker({ position: location, map })
//       }
//     })
//   }
//   return (
//     <Card>
//       <CardHeader
//         title='Activity Timeline'
//         avatar={<i className='ri-map-pin-line' />}
//         titleTypographyProps={{ variant: 'h5' }}
//       />
//       <CardContent>
//         <Timeline>
//           {/* Address Map Timeline */}
//           {user?.address && (
//             <TimelineItem>
//               <TimelineSeparator>
//                 <TimelineDot color='primary' />
//                 <TimelineConnector />
//               </TimelineSeparator>
//               <TimelineContent>
//                 <div className='flex items-center justify-between flex-wrap gap-x-4 mbe-2.5'>
//                   <Typography className='font-medium' color='text.primary'>
//                     Registered Address
//                   </Typography>
//                   <Typography variant='caption'>At Registration</Typography>
//                 </div>
//                 <Typography className='mbe-2'>{user.address}</Typography>
//                 <div ref={mapRef} style={{ width: '100%', height: '300px', marginTop: '10px' }}></div>
//               </TimelineContent>
//             </TimelineItem>
//           )}
//         </Timeline>
//       </CardContent>
//     </Card>
//   )
// }
// export default ActivityTimeline



'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Styled Components
const Timeline = styled(MuiTimeline)({
  '& .MuiTimelineItem-root': {
    '&:before': {
      display: 'none'
    }
  }
})

const ActivityTimeline = () => {
  const { data: session } = useSession()
  const user = session?.user
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (user?.address && GOOGLE_MAPS_API_KEY) {
      if (!window.google || !window.google.maps) {
        const script = document.createElement('script')
      script.src = `https://maps.gomaps.pro/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
script.async = true
        script.onload = () => setMapLoaded(true)
        document.body.appendChild(script)
      } else {
        setMapLoaded(true)
      }
    }
  }, [user?.address])

  useEffect(() => {
    if (mapLoaded && user?.address) {
      initMap(user.address)
    }
  }, [mapLoaded, user?.address])

  const initMap = address => {
    const geocoder = new window.google.maps.Geocoder()
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat: 0, lng: 0 }
    })

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]?.geometry?.location) {
        const location = results[0].geometry.location
        map.setCenter(location)

        if (markerRef.current) {
          markerRef.current.setMap(null) // Remove existing marker
        }

        markerRef.current = new window.google.maps.Marker({
          position: location,
          map,
          title: 'Registered Address'
        })
      } else {
        console.error('Geocoding failed:', status)
      }
    })
  }

  return (
    <Card>
      <CardHeader
        title='Activity Timeline'
        avatar={<i className='ri-map-pin-line' />}
        titleTypographyProps={{ variant: 'h5' }}
      />
      <CardContent>
        <Timeline>
          {/* Address Map Timeline */}
          {user?.address && (
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color='primary' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <div className='flex items-center justify-between flex-wrap gap-x-4 mbe-2.5'>
                  <Typography className='font-medium' color='text.primary'>
                    Registered Address
                  </Typography>
                  <Typography variant='caption'>At Registration</Typography>
                </div>
                <Typography className='mbe-2'>{user.address}</Typography>
                <div ref={mapRef} style={{ width: '100%', height: '300px', marginTop: '10px' }}></div>
              </TimelineContent>
            </TimelineItem>
          )}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default ActivityTimeline
