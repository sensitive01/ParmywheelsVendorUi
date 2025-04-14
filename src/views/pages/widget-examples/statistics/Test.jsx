'use client'

// MUI Imports
import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid2'
import { Box, Tab, Tabs, Paper, useTheme, alpha } from '@mui/material'


// Component Imports
import WeeklySalesBg from '@views/pages/widget-examples/statistics/WeeklySalesBg'
import Sales from '@views/pages/widget-examples/statistics/Sales'
import LiveVisitors from '@views/pages/widget-examples/statistics/LiveVisitors'
import Pricing from '@views/pages/pricing'
import KanbanBoard from '@views/apps/kanban/KanbanBoard'


// Custom TabPanel component with enhanced animations
const TabPanel = ({ children, value, index, ...other }) => {
  const theme = useTheme()

  
return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
      style={{
        width: '100%',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: value === index ? 1 : 0,
        transform: `translateY(${value === index ? 0 : 20}px)`,
        position: 'relative',
        height: value === index ? 'auto' : 0,
        overflow: 'hidden'
      }}
    >
      {value === index && (
        <Box
          sx={{
            p: 3,
            width: '100%',
            animation: value === index ? 'fadeIn 0.6s ease-out' : 'none',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          {children}
        </Box>
      )}
    </div>
  )
}

const Statistics = () => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [serverMode, setServerMode] = useState(null)

  useEffect(() => {
    const fetchServerMode = async () => {
      try {
        const mode = await fetch('/api/server-mode').then(res => res.json())

        setServerMode(mode)
      } catch (error) {
        console.error('Error fetching server mode:', error)
      }
    }

    fetchServerMode()
  }, [])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  
return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[6]
        }
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.8)})`
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="statistics tabs"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              transition: 'all 0.3s ease-in-out',
              minHeight: 56,
              fontSize: '1rem',
              fontWeight: 500,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main
              },
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                fontWeight: 600,
                transition: 'all 0.3s ease-in-out'
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          <Tab
            label="Statistics Overview"
            sx={{
              '&.Mui-selected': {
                transform: 'scale(1.05)'
              }
            }}
          />
          <Tab
            label="Kanban Board"
            sx={{
              '&.Mui-selected': {
                transform: 'scale(1.05)'
              }
            }}
          />
          <Tab
            label="Pricing"
            sx={{
              '&.Mui-selected': {
                transform: 'scale(1.05)'
              }
            }}
          />
        </Tabs>
      </Box>
      {/* Statistics Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={6}>
          <Grid xs={12} md={4}>
            <LiveVisitors />
          </Grid>
          <Grid xs={12} md={4}>
            <Sales serverMode={serverMode} />
          </Grid>
          <Grid xs={12} md={4}>
            <WeeklySalesBg />
          </Grid>
        </Grid>
      </TabPanel>
      {/* Kanban Board Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{
          width: '100%',
          minHeight: '70vh',
          '& > div': {
            width: '100%',
            height: '100%',
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              '0%': {
                opacity: 0,
                transform: 'translateX(-20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            }
          }
        }}>
          <KanbanBoard />
        </Box>
      </TabPanel>
      {/* Pricing Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container>
          <Grid xs={12}>
            <Pricing />
          </Grid>
        </Grid>
      </TabPanel>
    </Paper>
  )
}

export default Statistics
