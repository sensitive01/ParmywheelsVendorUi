import Grid from '@mui/material/Grid2'
import ValetDriverListTable from '@views/apps/parking/valet-drivers/list/ValetDriverListTable'

const ValetDriversPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} size={12}>
        <ValetDriverListTable />
      </Grid>
    </Grid>
  )
}

export default ValetDriversPage
