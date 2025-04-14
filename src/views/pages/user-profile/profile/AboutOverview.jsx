'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useSession } from 'next-auth/react'

const renderList = list => {
  return (
    list?.length > 0 &&
    list.map((item, index) => {
      const value =
        typeof item.value === 'object'
          ? Object.values(item.value).join(' | ') // Convert object to string format
          : String(item.value || 'N/A') // Convert primitive values safely

      
return (
        <div key={index} className='flex items-center gap-2'>
          <i className={item.icon} />
          <div className='flex items-center flex-wrap gap-2'>
            <Typography className='font-medium'>
              {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
            </Typography>
            <Typography>{value}</Typography>
          </div>
        </div>
      )
    })
  )
}

const renderTeams = teams => {
  return (
    teams?.length > 0 &&
    teams.map((item, index) => {
      const value =
        typeof item.value === 'object'
          ? Object.values(item.value).join(' | ') // Convert object to string format
          : String(item.value || 'N/A')

      
return (
        <div key={index} className='flex items-center flex-wrap gap-2'>
          <Typography className='font-medium'>
            {item.property.charAt(0).toUpperCase() + item.property.slice(1)}
          </Typography>
          <Typography>{value}</Typography>
        </div>
      )
    })
  )
}

const AboutOverview = () => {
  const { data: session } = useSession()
  const user = session?.user

  const data = user
    ? {
      about: [
        { property: 'Name', value: user.name, icon: 'ri-user-line' },
        { property: 'Address', value: user.address, icon: 'ri-map-pin-line' },
        { property: 'Latitude', value: user.latitude, icon: 'ri-map-2-line' },
        { property: 'Longitude', value: user.longitude, icon: 'ri-map-2-line' }
      ],
      contacts: user.contacts?.map(contact => ({
        property: contact.name,
        value: `Mobile: ${contact.mobile}`, // Format properly
        icon: 'ri-phone-line'
      })) || [],
      teams: user.parkingEntries?.map(entry => ({
        property: entry.type,
        value: `Count: ${entry.count}`, // Format properly
        icon: 'ri-car-line'
      })) || [],
      overview: [
        { property: 'Vendor ID', value: user.id, icon: 'ri-id-card-line' },
        { property: 'Vendor Name', value: user.name, icon: 'ri-user-star-line' }
      ]
    }
    : {}

  
return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                About
              </Typography>
              {data?.about && renderList(data.about)}
            </div>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Contacts
              </Typography>
              {data?.contacts && renderList(data.contacts)}
            </div>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Parking Entries
              </Typography>
              {data?.teams && renderTeams(data.teams)}
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div className='flex flex-col gap-4'>
              <Typography className='uppercase' variant='body2' color='text.disabled'>
                Overview
              </Typography>
              {data?.overview && renderList(data.overview)}
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AboutOverview
