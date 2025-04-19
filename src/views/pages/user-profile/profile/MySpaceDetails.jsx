'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const MySpaceDetails = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL 
  const { data: session, status } = useSession()
  const vendorid = session?.user?.id

  const [vendorData, setVendorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVendorData = async () => {
      if (status !== 'authenticated' || !vendorid) {
        setLoading(false)
        return
      }

      try {
        console.log(`Fetching data from: ${API_URL}/vendor/fetch-vendor-data?id=${vendorid}`)
        const response = await axios.get(`${API_URL}/vendor/fetch-vendor-data?id=${vendorid}`)
        console.log('API Response:', response.data)
        
        if (response.data?.data) {
          setVendorData(response.data.data)
        }
      } catch (err) {
        console.error('API Error:', err)
        setError(err.response?.data?.message || 'Failed to fetch vendor data')
      } finally {
        setLoading(false)
      }
    }

    fetchVendorData()
  }, [status, vendorid])

  if (loading) {
    return (
      <Card sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{ mt: 6 }}>
        <CardHeader title="My Space Details" />
        <CardContent>
          <Typography color="error">{error}</Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Vendor ID: {vendorid}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const parkingData = {
    Bikes: 0,
    Cars: 0,
    Others: 0
  }

  if (vendorData?.parkingEntries) {
    vendorData.parkingEntries.forEach(entry => {
      if (entry.type === 'Cars') {
        parkingData.Cars = entry.count
      } else if (entry.type === 'Bikes') {
        parkingData.Bikes = entry.count
      } else if (entry.type === 'Others') {
        parkingData.Others = entry.count
      }
    })
  }
  

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader title="My Space Details" />
      <CardContent>
        <Grid container spacing={2}>
          {['Bikes', 'Cars', 'Others'].map((type, index) => (
            <Grid item xs={4} key={index}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography color="primary" sx={{ mb: 1 }}>
                  {type}
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {parkingData[type]}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default MySpaceDetails

