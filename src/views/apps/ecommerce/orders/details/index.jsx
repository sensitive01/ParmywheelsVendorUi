
'use client'

// React Imports
import { useParams } from 'next/navigation'


// MUI Imports
import Grid from '@mui/material/Grid2'


// Component Imports
import ShippingActivity from './ShippingActivityCard'
import CustomerDetails from './CustomerDetailsCard'

const OrderDetails = () => {
  const { id } = useParams() // ✅ Get order ID from URL

  
return (
    <Grid container spacing={6}>
    <Grid size={{ xs: 12, md: 8 }}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
        <ShippingActivity orderId={id} /> {/* ✅ Pass `id` to `ShippingActivity` */}
        </Grid>
      </Grid>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
        <CustomerDetails orderId={id} />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
  )
}

export default OrderDetails
