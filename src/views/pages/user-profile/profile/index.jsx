// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import AboutOverview from './AboutOverview'
import ActivityTimeline from './ActivityTimeline'
import ConnectionsTeams from './ConnectionsTeams'
// import ProjectsTable from './ProjectsTables'
import MySpaceDetails from './MySpaceDetails'
import BusinessHoursTable from './BusinessHoursTable'


const ProfileTab = ({ data }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <AboutOverview data={data} />
      </Grid>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <ActivityTimeline />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
           <MySpaceDetails/>
          </Grid>
      </Grid>
      <Grid size={{ xs: 12 }}>
           <BusinessHoursTable/>
          </Grid>
    </Grid>
    
  )
}

export default ProfileTab
