'use client'

// Next Imports
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const DonutChart = () => {
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
  // Hooks
  const theme = useTheme()
  const { data: session, status } = useSession()
  const [transactionCount, setTransactionCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch transaction count for current year only
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchTransactionCount = async () => {
        try {
          setIsLoading(true)
          const currentYear = new Date().getFullYear()
          const startDate = `${currentYear}-01-01`
          const endDate = `${currentYear}-12-31`
          const url = `${NEXT_PUBLIC_API_URL}/vendor/fetchbookingtransaction/${session.user.id}?startDate=${startDate}&endDate=${endDate}`
          
          const response = await axios.get(url)
          // Get the count of bookings from the response
          setTransactionCount(response.data.data.bookings.length)
        } catch (err) {
          setError(err.message)
          console.error('Error fetching transaction count:', err)
        } finally {
          setIsLoading(false)
        }
      }

      fetchTransactionCount()
    }
  }, [status, session])

  // Simple donut chart showing just the current count
  const options = {
    legend: { show: false },
    stroke: { width: 5, colors: ['var(--mui-palette-background-paper)'] },
    colors: ['var(--mui-palette-primary-main)'],
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: false },
            total: {
              show: true,
              label: 'Transactions',
              fontSize: '1rem',
              color: 'var(--mui-palette-text-secondary)',
              formatter: () => `${transactionCount}`
            },
            value: {
              offsetY: 6,
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--mui-palette-text-primary)'
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          chart: { height: 165 }
        }
      }
    ]
  }

  if (error) {
    return (
      <Card className='bs-full'>
        <CardContent>
          <Typography color='error'>Error loading transaction datas</Typography>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className='bs-full'>
        <CardContent className='flex items-center justify-center' style={{ height: '200px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ 
      minWidth: 200, 
      maxWidth: 200,
      height: 196, 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
    }}>
      <CardContent className='pbe-0'>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>{transactionCount}</Typography>
        </div>
        <Typography variant='subtitle1'>Total Platform Fees</Typography>
        <AppReactApexCharts 
          type='donut' 
          height={127} 
          width='100%' 
          options={options} 
          series={[transactionCount]} 
        />
      </CardContent>
    </Card>
    
  )
}

export default DonutChart
