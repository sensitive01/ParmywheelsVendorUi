// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Avatar from '@mui/material/Avatar'
// import Typography from '@mui/material/Typography'
// // Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'
// import EditUserInfo from '@components/dialogs/edit-user-info'
// import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
// // Util Imports
// import { getInitials } from '@/utils/getInitials'
// const getAvatar = params => {
//   const { avatar, customer } = params
//   if (avatar) {
//     return <Avatar src={avatar} />
//   } else {
//     return <Avatar>{getInitials(customer)}</Avatar>
//   }
// }
// // Vars
// const userData = {
//   firstName: 'Gabrielle',
//   lastName: 'Feyer',
//   userName: '@gabriellefeyer',
//   billingEmail: 'gfeyer0@nyu.edu',
//   status: 'active',
//   role: 'Customer',
//   taxId: 'Tax-8894',
//   contact: '+1 (234) 464-0600',
//   language: ['English'],
//   country: 'France',
//   useAsBillingAddress: true
// }
// const CustomerDetails = ({ orderData }) => {
//   // Vars
//   const typographyProps = (children, color, className) => ({
//     children,
//     color,
//     className
//   })
//   return (
//     <Card>
//       <CardContent className='flex flex-col gap-6'>
//         <Typography variant='h5'>Customer details</Typography>
//         <div className='flex items-center gap-3'>
//           {getAvatar({ avatar: orderData?.avatar ?? '', customer: orderData?.customer ?? '' })}
//           <div className='flex flex-col'>
//             <Typography color='text.primary' className='font-medium'>
//               {orderData?.customer}
//             </Typography>
//             <Typography>Customer ID: #47389</Typography>
//           </div>
//         </div>
//         <div className='flex items-center gap-3'>
//           <CustomAvatar skin='light' color='success' size={40}>
//             <i className='ri-shopping-cart-2-line' />
//           </CustomAvatar>
//           <Typography color='text.primary' className='font-medium'>
//             12 Orders
//           </Typography>
//         </div>
//         <div className='flex flex-col gap-1'>
//           <div className='flex justify-between items-center'>
//             <Typography color='text.primary' className='font-medium'>
//               Contact info
//             </Typography>
//             <OpenDialogOnElementClick
//               element={Typography}
//               elementProps={typographyProps('Edit', 'primary', 'cursor-pointer font-medium')}
//               dialog={EditUserInfo}
//               dialogProps={{ data: userData }}
//             />
//           </div>
//           <Typography>Email: {orderData?.email}</Typography>
//           <Typography>Mobile: +1 (609) 972-22-22</Typography>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
// export default CustomerDetails



'use client'

// React Imports
import { useEffect, useState } from 'react'

import axios from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAvatar = params => {
  const { avatar, customer } = params

  
return avatar ? <Avatar src={avatar} /> : <Avatar>{getInitials(customer)}</Avatar>
}

const CustomerDetails = ({ orderId }) => {
  const [customerData, setCustomerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) return

    const fetchCustomerDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/vendor/getbooking/${orderId}`)

        if (response.data && response.data.booking) {
          setCustomerData(response.data.booking)
        } else {
          setError('No customer data found')
        }
      } catch (error) {
        console.error('Error fetching customer details:', error)
        setError('Failed to load customer details')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerDetails()
  }, [orderId])

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <Typography variant='h5'>Customer details</Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color='error'>{error}</Typography>
        ) : (
          <>
            {/* Customer Name & Avatar */}
            <div className='flex items-center gap-3'>
              {getAvatar({ avatar: '', customer: customerData?.personName ?? 'Unknown' })}
              <div className='flex flex-col'>
                <Typography color='text.primary' className='font-medium'>
                  {customerData?.personName || 'N/A'}
                </Typography>
                <Typography>Customer ID: #{customerData?._id?.slice(-6) || 'N/A'}</Typography>
              </div>
            </div>

            {/* Contact & Payment Info */}
            <div className='flex flex-col gap-1'>
              <div className='flex justify-between items-center'>
                <Typography color='text.primary' className='font-medium'>Contact info</Typography>
                
              </div>
              <Typography>Mobile: {customerData?.mobileNumber || 'N/A'}</Typography>
              <Typography>
                Paid Amount: ₹{customerData?.amount || '0'} for {customerData?.hour || '0'} hours
              </Typography>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default CustomerDetails
