// 'use client'

// // MUI Imports
// import Card from '@mui/material/Card'
// import Divider from '@mui/material/Divider'
// import Typography from '@mui/material/Typography'
// import CardContent from '@mui/material/CardContent'
// import MuiLinearProgress from '@mui/material/LinearProgress'
// import { styled } from '@mui/material/styles'

// // Components Imports
// import CustomAvatar from '@core/components/mui/Avatar'

// // Styled Components
// const LinearProgress = styled(MuiLinearProgress)(() => ({
//   '&.MuiLinearProgress-colorWarning': { backgroundColor: 'var(--mui-palette-primary-main)' },
//   '& .MuiLinearProgress-bar': {
//     borderStartEndRadius: 0,
//     borderEndEndRadius: 0
//   }
// }))

// const TotalVisits = () => {
//   return (
//     <Card>
//       <CardContent className='flex justify-between items-start'>
//         <div className='flex flex-col'>
//           <Typography>Total Visits</Typography>
//           <Typography variant='h4'>42.5k</Typography>
//         </div>
//         <div className='flex items-center text-success'>
//           <Typography color='success.main'>+18.2%</Typography>
//           <i className='ri-arrow-up-s-line text-xl'></i>
//         </div>
//       </CardContent>
//       <CardContent className='flex flex-col gap-[1.3125rem]'>
//         <div className='flex items-center justify-between'>
//           <div className='flex flex-col gap-2'>
//             <div className='flex items-center gap-x-2'>
//               <CustomAvatar size={24} variant='rounded' skin='light' className='rounded-md' color='warning'>
//                 <i className='ri-pie-chart-2-line text-base' />
//               </CustomAvatar>
//               <Typography>Order</Typography>
//             </div>
//             <Typography variant='h4'>23.5%</Typography>
//             <Typography>2,890</Typography>
//           </div>
//           <Divider flexItem orientation='vertical' sx={{ '& .MuiDivider-wrapper': { p: 0, py: 2 } }}>
//             <CustomAvatar skin='light' color='secondary' size={28} className='bg-actionSelected'>
//               <Typography variant='body2'>VS</Typography>
//             </CustomAvatar>
//           </Divider>
//           <div className='flex flex-col items-end gap-2'>
//             <div className='flex items-center gap-x-2'>
//               <Typography>Visits</Typography>
//               <CustomAvatar size={24} variant='rounded' skin='light' className='rounded-md' color='primary'>
//                 <i className='ri-mac-line text-base' />
//               </CustomAvatar>
//             </div>
//             <Typography variant='h4'>23.5%</Typography>
//             <Typography>2,890</Typography>
//           </div>
//         </div>
//         <LinearProgress value={26} color='warning' variant='determinate' className='bs-2' />
//       </CardContent>
//     </Card>
//   )
// }

// export default TotalVisits
// StatisticsClient.jsx
'use client'

import Grid from '@mui/material/Grid2'
import { Box, Typography, Paper, Fade, Zoom } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}))

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  textAlign: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '4px',
    background: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius
  }
}))

const StatisticsClient = ({ children }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={1000}>
        <PageHeader>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time insights and detailed statistics
          </Typography>
        </PageHeader>
      </Fade>

      <Zoom in timeout={800}>
        <Grid container spacing={6}>
          <Grid xs={12}>
            <StyledPaper elevation={3}>
              {children}
            </StyledPaper>
          </Grid>
        </Grid>
      </Zoom>

      <Box sx={{ mt: 6 }}>
        <Fade in timeout={1200}>
          <Grid container spacing={3}>
            {['Today', 'This Week', 'This Month'].map((period, index) => (
              <Grid xs={12} md={4} key={period}>
                <StyledPaper 
                  elevation={2}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    animation: `fadeIn 0.5s ease-out ${index * 0.2}s`
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {period}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quick summary for {period.toLowerCase()}
                  </Typography>
                </StyledPaper>
              </Grid>
            ))}
          </Grid>
        </Fade>
      </Box>
    </Box>
  )
}

export default StatisticsClient
