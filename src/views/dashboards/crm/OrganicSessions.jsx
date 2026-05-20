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
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import OptionMenu from '@core/components/option-menu'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const OrganicSessions = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [slotView, setSlotView] = useState('total') // 'total', 'parked', 'available'
  const [slotsData, setSlotsData] = useState({
    total: { count: 0, car: 0, bike: 0, others: 0 },
    available: { count: 0, car: 0, bike: 0, others: 0 },
    parked: { count: 0, car: 0, bike: 0, others: 0 }
  })
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const mapSlots = (res) => {
    if (!res || !res.data) return { count: 0, car: 0, bike: 0, others: 0 }
    const data = res.data

    // Handle flat structure (like in availableslots)
    if (data.Cars !== undefined || data.Bikes !== undefined) {
      return {
        count: Number(data.totalCount) || 0,
        car: Number(data.Cars || data.Car) || 0,
        bike: Number(data.Bikes || data.Bike) || 0,
        others: Number(data.Others || data.Other) || 0
      }
    }

    // Handle nested categories structure
    return {
      count: Number(data.totalCount) || 0,
      car: Number(data.categories?.find(c => c.name === 'Car' || c.type === 'Car' || c.name === 'Cars')?.count) || 0,
      bike: Number(data.categories?.find(c => c.name === 'Bike' || c.type === 'Bike' || c.name === 'Bikes')?.count) || 0,
      others: Number(data.categories?.find(c => c.name === 'Others' || c.type === 'Others' || c.name === 'Other')?.count) || 0
    }
  }

  // Load cached slots data on mount to eliminate initial delay
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('pmw_vendor_slots_cache')
      if (cached) {
        try {
          setSlotsData(JSON.parse(cached))
          setLoading(false)
        } catch (e) {
          // ignore cache read error
        }
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.user?.id) return
        
        // Fetch vendor details (total slots configuration) and available slots
        const [vendorRes, availableRes] = await Promise.allSettled([
          axios.get(`${API_URL}/vendor/fetch-vendor-data?id=${session.user.id}`),
          axios.get(`${API_URL}/vendor/availableslots/${session.user.id}`)
        ])

        let totalData = { count: 0, car: 0, bike: 0, others: 0 }
        if (vendorRes.status === 'fulfilled' && vendorRes.value?.data) {
          const vData = vendorRes.value.data.data || vendorRes.value.data.vendor || vendorRes.value.data
          if (vData.parkingEntries) {
            totalData = {
              count: vData.parkingEntries.reduce((acc, curr) => acc + Number(curr.count), 0),
              car: Number(vData.parkingEntries.find(p => p.type === 'Cars' || p.type === 'Car')?.count) || 0,
              bike: Number(vData.parkingEntries.find(p => p.type === 'Bikes' || p.type === 'Bike')?.count) || 0,
              others: Number(vData.parkingEntries.find(p => p.type === 'Others' || p.type === 'Other')?.count) || 0
            }
          }
        }

        const availableData = availableRes.status === 'fulfilled' ? mapSlots(availableRes.value) : { count: 0, car: 0, bike: 0, others: 0 }

        const calculatedParked = {
          count: Math.max(0, totalData.count - availableData.count),
          car: Math.max(0, totalData.car - availableData.car),
          bike: Math.max(0, totalData.bike - availableData.bike),
          others: Math.max(0, totalData.others - availableData.others)
        }

        const updatedSlotsData = {
          total: totalData,
          available: availableData,
          parked: calculatedParked
        }

        setSlotsData(updatedSlotsData)
        if (typeof window !== 'undefined') {
          localStorage.setItem('pmw_vendor_slots_cache', JSON.stringify(updatedSlotsData))
        }
      } catch (error) {
        console.error('Error fetching parking slots data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, API_URL])

  const currentSeries = [
    slotView === 'total' ? slotsData.total.car : slotView === 'parked' ? slotsData.parked.car : slotsData.available.car,
    slotView === 'total' ? slotsData.total.bike : slotView === 'parked' ? slotsData.parked.bike : slotsData.available.bike,
    slotView === 'total' ? slotsData.total.others : slotView === 'parked' ? slotsData.parked.others : slotsData.available.others
  ]

  // Chart options adapted for slot counts
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
              formatter: value => `${value}`,
              color: 'var(--mui-palette-text-primary)'
            },
            total: {
              show: true,
              label: slotView.charAt(0).toUpperCase() + slotView.slice(1),
              fontSize: '1rem',
              color: 'var(--mui-palette-text-secondary)',
              formatter: value => `${value.globals.seriesTotals.reduce((total, num) => total + num)}`
            }
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Parking Slots" />
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Parking Slots"
        action={<OptionMenu options={['Refresh Data']} onItemClick={() => window.location.reload()} />}
      />
      <CardContent>
        {/* Segmented Control / Toggle Buttons for Slot Views */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ToggleButtonGroup
            value={slotView}
            exclusive
            onChange={(e, newView) => {
              if (newView !== null) {
                setSlotView(newView)
              }
            }}
            aria-label="slot view selector"
            size="small"
            color="primary"
          >
            <ToggleButton value="total" sx={{ px: 4 }} aria-label="total slots">
              Total
            </ToggleButton>
            <ToggleButton value="parked" sx={{ px: 4 }} aria-label="parked slots">
              Parked
            </ToggleButton>
            <ToggleButton value="available" sx={{ px: 4 }} aria-label="available slots">
              Available
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Main Donut Chart */}
        <AppReactApexCharts 
          type='donut' 
          height={300} 
          width='100%' 
          options={options} 
          series={currentSeries} 
        />

        {/* Breakdown Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Slots Breakdown
          </Typography>
          <Divider sx={{ mb: 4 }} />

          {/* Car Breakdown */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip label="Car" color="primary" size="small" sx={{ mr: 2, fontWeight: 600 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Slots: {slotsData.total.car}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip 
                label={`Available: ${slotsData.available.car}`} 
                color="success"
                variant="outlined" 
                size="small" 
                sx={{ fontWeight: 500 }}
              />
              <Chip 
                label={`Parked: ${slotsData.parked.car}`} 
                color="warning"
                variant="outlined" 
                size="small" 
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Box>

          {/* Bike Breakdown */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip label="Bike" color="secondary" size="small" sx={{ mr: 2, fontWeight: 600 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Slots: {slotsData.total.bike}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip 
                label={`Available: ${slotsData.available.bike}`} 
                color="success"
                variant="outlined" 
                size="small" 
                sx={{ fontWeight: 500 }}
              />
              <Chip 
                label={`Parked: ${slotsData.parked.bike}`} 
                color="warning"
                variant="outlined" 
                size="small" 
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Box>

          {/* Others Breakdown */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip label="Others" color="success" size="small" sx={{ mr: 2, fontWeight: 600 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Slots: {slotsData.total.others}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip 
                label={`Available: ${slotsData.available.others}`} 
                color="success"
                variant="outlined" 
                size="small" 
                sx={{ fontWeight: 500 }}
              />
              <Chip 
                label={`Parked: ${slotsData.parked.others}`} 
                color="warning"
                variant="outlined" 
                size="small" 
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default OrganicSessions
