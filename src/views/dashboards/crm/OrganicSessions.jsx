

'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import OptionMenu from '@core/components/option-menu'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const OrganicSessions = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const [parkingData, setParkingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user?.id) return
        
        const response = await axios.get(`${API_URL}/vendor/getchargesdata/${session.user.id}`)
        setParkingData(response.data.vendor)
      } catch (error) {
        console.error('Error fetching parking data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  // Calculate all charge amounts
  const calculateCharges = () => {
    if (!parkingData) return null

    const result = {
      Car: { total: 0, minimum: 0, additional: 0, fullDay: 0, monthly: 0 },
      Bike: { total: 0, minimum: 0, additional: 0, fullDay: 0, monthly: 0 },
      Others: { total: 0, minimum: 0, additional: 0, fullDay: 0, monthly: 0 }
    }

    parkingData.charges.forEach(charge => {
      const amount = parseInt(charge.amount || 0)
      const category = charge.category

      if (!result[category]) return

      result[category].total += amount

      if (charge.type.includes('0 to') || charge.type.includes('Minimum')) {
        result[category].minimum += amount
      } else if (charge.type.includes('Additional')) {
        result[category].additional += amount
      } else if (charge.type.includes('Full day') || charge.type.includes('24 hour')) {
        result[category].fullDay += amount
      } else if (charge.type.includes('Monthly')) {
        result[category].monthly += amount
      }
    })

    return result
  }

  const chargeData = calculateCharges()

  // Original chart options
  const options = {
    chart: {
      sparkline: { enabled: true }
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main
    ],
    grid: {
      padding: {
        bottom: -30
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '15px',
      offsetY: 5,
      itemMargin: {
        horizontal: 28,
        vertical: 6
      },
      labels: {
        colors: 'var(--mui-palette-text-secondary)'
      },
      markers: {
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 4 : -1,
        width: 10,
        height: 10
      }
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: { width: 4, lineCap: 'round', colors: ['var(--mui-palette-background-paper)'] },
    labels: ['Car', 'Bike', 'Others'],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        endAngle: 130,
        startAngle: -130,
        customScale: 0.9,
        donut: {
          size: '83%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.9375rem',
              color: 'var(--mui-palette-text-secondary)'
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '1.75rem',
              formatter: value => `₹${value}`,
              color: 'var(--mui-palette-text-primary)'
            },
            total: {
              show: true,
              label: 'Total Amount',
              fontSize: '1rem',
              color: 'var(--mui-palette-text-secondary)',
              formatter: value => `₹${value.globals.seriesTotals.reduce((total, num) => total + num)}`
            }
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Slot Charges" />
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (!parkingData || !chargeData) {
    return (
      <Card>
        <CardHeader title="Slot Charges" />
        <CardContent>
          <Typography>No parking data available</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Slot Charges"
        action={<OptionMenu options={['Refresh Data']} onItemClick={() => window.location.reload()} />}
      />
      <CardContent>
        {/* Main Donut Chart */}
        <AppReactApexCharts 
          type='donut' 
          height={300} 
          width='100%' 
          options={options} 
          series={[
            chargeData.Car.total,
            chargeData.Bike.total,
            chargeData.Others.total
          ]} 
        />

        {/* Breakdown Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Charge Breakdown
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Car Breakdown */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip label="Car" color="primary" size="small" sx={{ mr: 2 }} />
              <Typography variant="body2">Total: ₹{chargeData.Car.total}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip 
                label={`Minimum: ₹${chargeData.Car.minimum}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Additional: ₹${chargeData.Car.additional}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Full Day: ₹${chargeData.Car.fullDay}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Monthly: ₹${chargeData.Car.monthly}`} 
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Box>

          {/* Bike Breakdown */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip label="Bike" color="secondary" size="small" sx={{ mr: 2 }} />
              <Typography variant="body2">Total: ₹{chargeData.Bike.total}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip 
                label={`Minimum: ₹${chargeData.Bike.minimum}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Additional: ₹${chargeData.Bike.additional}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Full Day: ₹${chargeData.Bike.fullDay}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Monthly: ₹${chargeData.Bike.monthly}`} 
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Box>

          {/* Others Breakdown */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip label="Others" color="success" size="small" sx={{ mr: 2 }} />
              <Typography variant="body2">Total: ₹{chargeData.Others.total}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip 
                label={`Minimum: ₹${chargeData.Others.minimum}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Additional: ₹${chargeData.Others.additional}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Full Day: ₹${chargeData.Others.fullDay}`} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                label={`Monthly: ₹${chargeData.Others.monthly}`} 
                variant="outlined" 
                size="small" 
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default OrganicSessions
