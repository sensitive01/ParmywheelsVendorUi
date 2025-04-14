// MUI Imports
import Grid from '@mui/material/Grid2'


// Components Imports
import Test from '@views/pages/widget-examples/statistics/Test'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const Statistics = async () => {
  // Vars
  const serverMode = await getServerMode()

  
return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, }}>
        <Test />
      </Grid>
    </Grid>
  )
}

export default Statistics
