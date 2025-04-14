'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'


// Components Imports
import axios from 'axios'

import { useSession } from 'next-auth/react'

import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'


// Vars
const Sales = () => {
  const [data, setData] = useState([
    { stats: '0', color: 'success', title: 'Available Slots', icon: 'ri-database-2-line' },
    { stats: '0', color: 'warning', title: 'Car Slots', icon: 'ri-car-line' },
    { stats: '0', color: 'info', title: 'Bike Slots', icon: 'ri-motorbike-line' },
    { stats: '0', color: 'primary', title: 'Other Slots', icon: 'ri-user-star-line' }
  ])

 const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession()
  const vendorid = session?.user?.id

  useEffect(() => {
    if (!vendorid) return // Prevent API call if vendorid is undefined

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/vendor/availableslots/${vendorid}`)
        const { totalCount, Cars, Bikes, Others } = response.data

        setData([
          { stats: totalCount, color: 'success', title: 'Available Slots', icon: 'ri-database-2-line' },
          { stats: Cars, color: 'warning', title: 'Car Slots', icon: 'ri-car-line' },
          { stats: Bikes, color: 'info', title: 'Bike Slots', icon: 'ri-motorbike-line' },
          { stats: Others, color: 'primary', title: 'Other Slots', icon: 'ri-user-star-line' }
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [vendorid])
  
return (
    <Card>
      <CardHeader
        title='Available Slots'

        // action={<OptionMenu options={['Refresh', 'Share', 'Update']} />}
        subheader={
          <div className='flex items-center gap-2'>
            <span>Total {data[0].stats} Slots </span>
          </div>
        }
      />
      <CardContent>
        <div className='flex flex-wrap justify-between gap-4'>
          {data.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color={item.color}>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{item.stats}</Typography>
                <Typography>{item.title}</Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default Sales
