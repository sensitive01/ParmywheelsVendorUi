import { redirect } from 'next/navigation'

import OrderDetails from '@views/apps/ecommerce/orders/details'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const OrderDetailsPage = async ({ params }) => {
  const { id } = params // ✅ Get order ID from URL

  console.log('🔍 Received ID in OrderDetailsPage:', id) // ✅ Debugging

  if (!id) {
    console.log('⚠️ No ID found, redirecting to /not-found')
    redirect('/not-found')
  }

  try {
    console.log(`🛠 Fetching Order Details from: ${API_URL}/vendor/getbookingtimeline/${id}`)

    const response = await fetch(`${API_URL}/vendor/getbookingtimeline/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' // ✅ Prevent caching issues
    })

    console.log(`🔄 API Response Status: ${response.status}`) 

    if (!response.ok) {
      console.log(`🚨 API call failed with status: ${response.status}, redirecting to /not-found`)
      redirect('/not-found')
    }

    const data = await response.json()

    console.log('✅ API Data:', data) 

    const orderData = data?.timeline

    if (!orderData) {
      console.log('⚠️ No timeline data found, redirecting to /not-found')
      redirect('/not-found')
    }

    return <OrderDetails orderData={orderData} order={id} /> 
  } catch (error) {
    console.error('🚨 Error fetching order details:', error)
    redirect('/not-found')
  }
}

export default OrderDetailsPage


