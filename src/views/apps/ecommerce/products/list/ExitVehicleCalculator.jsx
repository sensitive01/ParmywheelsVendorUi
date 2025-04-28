// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react';
// import { 
//   Button, 
//   DialogTitle, 
//   DialogContent, 
//   DialogActions, 
//   TextField,
//   Alert,
//   CircularProgress,
//   Typography,
//   Box,
//   Divider,
//   Card,
//   CardContent,
//   Stack,
//   Grid
// } from '@mui/material'

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// const ExitVehicleCalculator = ({ 
//   bookingId, 
//   vehicleType = 'Car', 
//   bookType = 'Hourly',
//   bookingDetails = null,
//   onClose, 
//   onSuccess 
// }) => {
//   const { data: session } = useSession();
//   const vendorId = session?.user?.id;
  
//   const [loading, setLoading] = useState(false)
//   const [fetchingCharges, setFetchingCharges] = useState(true)
//   const [fetchingBookingDetails, setFetchingBookingDetails] = useState(false)
//   const [hours, setHours] = useState(0)
//   const [amount, setAmount] = useState(0)
//   const [chargesData, setChargesData] = useState(null)
//   const [error, setError] = useState('')
//   const [calculationDetails, setCalculationDetails] = useState(null)
//   const [bookingData, setBookingData] = useState(bookingDetails || null)
  
//   // Determine if booking is 24 Hours type
//   const is24Hours = bookingData?.bookType === '24 Hours' || bookType === '24 Hours'
  
//   // Fetch booking details if not provided
//   useEffect(() => {
//     const getBookingDetails = async () => {
//       if (bookingDetails) {
//         setBookingData(bookingDetails)
//         return
//       }
      
//       if (!bookingId) return
      
//       try {
//         setFetchingBookingDetails(true)
//         console.log(`Fetching booking details for ID: ${bookingId}`)
        
//         const response = await fetch(`${API_URL}/vendor/getbookingdetails/${bookingId}`)
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch booking details')
//         }
        
//         const data = await response.json()
        
//         if (!data || !data.booking) {
//           throw new Error('Invalid booking data received')
//         }
        
//         console.log('Received booking details:', data.booking)
//         setBookingData(data.booking)
//       } catch (err) {
//         console.error('Error fetching booking details:', err)
//         setError('Failed to fetch booking details: ' + (err.message || ''))
//       } finally {
//         setFetchingBookingDetails(false)
//       }
//     }
    
//     if (!bookingDetails && bookingId) {
//       getBookingDetails()
//     }
//   }, [bookingId, bookingDetails])

//   // Calculate hours between parking time and current time
//   useEffect(() => {
//     const calculateDuration = () => {
//       try {
//         // Get parking date and time from bookingData if available
//         const parkingDate = bookingData?.parkedDate
//         const parkingTime = bookingData?.parkedTime
        
//         console.log('Calculating duration with:', { parkingDate, parkingTime });
        
//         // Validate parking date and time
//         if (!parkingDate || !parkingTime) {
//           console.error('Missing parking data:', { parkingDate, parkingTime });
//           throw new Error('Parking date or time not available')
//         }
        
//         // Parse date in DD-MM-YYYY format
//         const [day, month, year] = parkingDate.split('-').map(Number)
        
//         // Parse time (12:14 PM)
//         let [time, period] = parkingTime.split(' ')
//         let [hours, minutes] = time.split(':').map(Number)
        
//         // Convert to 24-hour format
//         if (period === 'PM' && hours < 12) {
//           hours += 12
//         } else if (period === 'AM' && hours === 12) {
//           hours = 0
//         }
        
//         // Create parking datetime
//         const parkingDateTime = new Date(year, month - 1, day, hours, minutes)
//         const currentDateTime = new Date()
        
//         console.log('Parking date time:', parkingDateTime);
//         console.log('Current date time:', currentDateTime);
        
//         // Calculate difference in milliseconds
//         const diffMs = currentDateTime - parkingDateTime
        
//         // Handle calculation differently based on booking type
//         if (is24Hours) {
//           // For 24 Hours booking type, calculate in days (rounded up)
//           const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
//           const calculatedDays = Math.max(1, diffDays)
//           console.log('Calculated days (24 Hours booking):', calculatedDays);
//           setHours(calculatedDays)
//           return calculatedDays
//         } else {
//           // For Hourly booking type, calculate in hours (rounded up)
//           const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
//           const calculatedHours = Math.max(1, diffHours)
//           console.log('Calculated hours (Hourly booking):', calculatedHours);
//           setHours(calculatedHours)
//           return calculatedHours
//         }
//       } catch (err) {
//         console.error('Error calculating duration:', err)
//         setError('Failed to calculate parking duration. Using default value.')
//         setHours(1)
//         return 1
//       }
//     }
    
//     // Only calculate if we have booking data with parking times
//     if (bookingData?.parkedDate && bookingData?.parkedTime) {
//       const calculatedDuration = calculateDuration()
      
//       // If we already have charge data, calculate amount
//       if (chargesData) {
//         calculateAmount(calculatedDuration, chargesData)
//       }
//     }
//   }, [bookingData, chargesData, is24Hours])

//   // Fetch charges data
//   useEffect(() => {
//     const fetchCharges = async () => {
//       try {
//         if (!vendorId) {
//           console.log('Waiting for vendorId...');
//           return;
//         }

//         setFetchingCharges(true)
//         setError('')

//         console.log(`Fetching charges for vendor: ${vendorId}`);
//         const response = await fetch(`${API_URL}/vendor/getchargesdata/${vendorId}`)
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch charges data')
//         }

//         const data = await response.json()
//         console.log('Received charges data:', data);
        
//         if (!data?.vendor?.charges) {
//           throw new Error('Invalid charges data format')
//         }

//         setChargesData(data.vendor)
//         // Don't calculate amount here, it will be triggered by the hours useEffect
//       } catch (err) {
//         console.error('Error fetching charges:', err)
//         setError(err.message || 'Failed to fetch parking charges data')
//       } finally {
//         setFetchingCharges(false)
//       }
//     }

//     fetchCharges()
//   }, [vendorId])

//   // Calculate amount based on hours and charges data
//   const calculateAmount = (hoursValue, charges = chargesData) => {
//     if (!charges || !charges.charges || !charges.charges.length) {
//       console.warn('No charges data available');
//       return;
//     }

//     try {
//       // Get vehicle type from booking data if available
//       const effectiveVehicleType = bookingData?.vehicleType || vehicleType
      
//       console.log('Calculating amount for:', { 
//         hoursValue, 
//         vehicleType: effectiveVehicleType, 
//         is24Hours
//       });
      
//       // Find relevant charges for the vehicle type (case insensitive)
//       const relevantCharges = charges.charges.filter(charge => 
//         charge.category.toLowerCase() === effectiveVehicleType.toLowerCase()
//       )

//       if (relevantCharges.length === 0) {
//         throw new Error(`No charges found for ${effectiveVehicleType}`)
//       }

//       console.log('Relevant charges:', relevantCharges);

//       let calculatedAmount = 0
//       let details = {}

//       if (is24Hours) {
//         // Find the best matching full day charge (case insensitive)
//         const fullDayCharge = relevantCharges.find(charge => 
//           charge.type.toLowerCase().includes('full day') || 
//           charge.type.toLowerCase().includes('24 hour')
//         )
        
//         if (!fullDayCharge) {
//           throw new Error(`Full day charge not found for ${effectiveVehicleType}`)
//         }
        
//         const days = hoursValue // Already calculated in days for 24 Hours booking type
//         calculatedAmount = Number(fullDayCharge.amount) * days
        
//         details = {
//           rateType: "Full day",
//           baseRate: Number(fullDayCharge.amount),
//           days: days,
//           calculation: `${fullDayCharge.amount} × ${days} day(s) = ${calculatedAmount}`
//         }
        
//         console.log('24-hour calculation details:', details);
//       } else {
//         // Find base and additional charges (case insensitive)
//         const baseCharge = relevantCharges.find(charge => 
//           charge.type.toLowerCase().includes('0 to 1') || 
//           charge.type.toLowerCase().includes('first hour') ||
//           charge.type.toLowerCase().includes('minimum')
//         )
        
//         const additionalCharge = relevantCharges.find(charge => 
//           charge.type.toLowerCase().includes('additional') || 
//           charge.type.toLowerCase().includes('extra hour')
//         )
        
//         if (!baseCharge) {
//           throw new Error(`Base charge not found for ${effectiveVehicleType}`)
//         }
        
//         // First hour
//         calculatedAmount = Number(baseCharge.amount)
        
//         // Additional hours (use base charge if additional not found)
//         const additionalRate = additionalCharge ? Number(additionalCharge.amount) : Number(baseCharge.amount)
        
//         if (hoursValue > 1) {
//           calculatedAmount += additionalRate * (hoursValue - 1)
//         }
        
//         details = {
//           rateType: "Hourly",
//           baseRate: Number(baseCharge.amount),
//           additionalRate: additionalRate,
//           totalHours: hoursValue,
//           calculation: hoursValue > 1 ? 
//             `${baseCharge.amount} (first hour) + ${additionalRate} × ${hoursValue - 1} (additional hours) = ${calculatedAmount}` :
//             `${baseCharge.amount} (first hour) = ${calculatedAmount}`
//         }
        
//         console.log('Hourly calculation details:', details);
//       }

//       setAmount(calculatedAmount)
//       setCalculationDetails(details)
//       setError('')
//     } catch (err) {
//       console.error('Error calculating amount:', err)
//       setError(err.message || 'Failed to calculate amount')
//       setAmount(0)
//     }
//   }

//   const handleHoursChange = (e) => {
//     const value = Math.max(1, parseInt(e.target.value) || 1)
//     setHours(value)
//     if (chargesData) {
//       calculateAmount(value, chargesData)
//     }
//   }

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     return dateStr; // Already in DD-MM-YYYY format
//   }

//   // const formatTime = (timeStr) => {
//   //   if (!timeStr) return 'N/A';
//   //   return timeStr; // Already in hh:mm AM/PM format
//   // }

//   const formatTime = (timeStr) => {
//     if (!timeStr) return 'N/A';
    
//     // Convert from "hh:mm AM/PM" to 24-hour format for display
//     let [time, period] = timeStr.split(' ');
//     let [hours, minutes] = time.split(':').map(Number);
    
//     // Convert to 24-hour format
//     if (period === 'PM' && hours < 12) {
//       hours += 12;
//     } else if (period === 'AM' && hours === 12) {
//       hours = 0;
//     }
    
//     // Format as HH:MM
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//   }

//   const handleSubmit = async () => {
//     if (!bookingId || !amount || !hours) {
//       setError('Booking ID, amount and hours are required')
//       return
//     }
  
//     setLoading(true)
//     setError('')
    
//     try {
//       console.log('Submitting exit data:', {
//         bookingId,
//         amount,
//         hour: hours,  // Changed from 'hours' to 'hour' to match backend
//         is24Hours,
//         vendorId
//       });
      
//       const response = await fetch(`${API_URL}/vendor/exitvehicle/${bookingId}`, {
//         method: 'PUT',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session?.accessToken}`
//         },
//         body: JSON.stringify({
//           amount,
//           hour: hours,  // Changed from 'hours' to 'hour'
//           is24Hours,
//           vendorId
//         })
//       })
      
//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || 'Failed to update booking status')
//       }

//       const data = await response.json()
//       onSuccess?.(data.message || 'Vehicle exit processed successfully')
//       onClose?.()
//     } catch (err) {
//       console.error('Error processing exit:', err)
//       setError(err.message || 'Failed to process vehicle exit')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const isLoading = fetchingCharges || fetchingBookingDetails || loading

//   return (
//     <Box>
//       <DialogTitle>
//         Calculate Exit Charges
//         <Typography variant="subtitle2" color="text.secondary">
//           Booking ID: {bookingId}
//         </Typography>
//       </DialogTitle>
      
//       <DialogContent>
//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
//             {error}
//           </Alert>
//         )}
        
//         {isLoading && !error ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//             <CircularProgress />
//             <Typography variant="body2" sx={{ ml: 2 }}>
//               {fetchingBookingDetails ? 'Loading booking details...' : 
//                fetchingCharges ? 'Loading charges data...' : 'Processing...'}
//             </Typography>
//           </Box>
//         ) : (
//           <>
//             <Card variant="outlined" sx={{ mb: 3 }}>
//               <CardContent>
//                 <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//                   Vehicle Type: {bookingData?.vehicleType || vehicleType}
//                 </Typography>
//                 <Typography variant="subtitle1" color="text.secondary" gutterBottom>
//                   Booking Type: {bookingData?.bookType || bookType}
//                 </Typography>
//                 <Divider sx={{ my: 1 }} />
//                 <Typography variant="subtitle1" color="text.secondary">
//                   Parked Since: {formatDate(bookingData?.parkedDate)} at {formatTime(bookingData?.parkedTime)}
//                 </Typography>
//               </CardContent>
//             </Card>
//             <Grid container spacing={3}>
//   <Grid item xs={12}>
//     <TextField
//       fullWidth
//       label={is24Hours ? "Number of Days" : "Number of Hours"}
//       type="number"
//       value={hours}
//       InputProps={{ 
//         readOnly: true,
//         inputProps: { min: 1 }
//       }}
//       disabled={isLoading}
//       required
//     />
//   </Grid>
// </Grid>
            
//             {calculationDetails && (
//               <Card sx={{ mt: 3, backgroundColor: '#f9f9f9' }}>
//                 <CardContent>
//                   <Typography variant="subtitle1" gutterBottom>
//                     Calculation Details
//                   </Typography>
//                   <Divider sx={{ mb: 2 }} />
//                   <Stack spacing={1}>
//                     <Typography variant="body2">
//                       <strong>Rate Type:</strong> {calculationDetails.rateType}
//                     </Typography>
//                     {is24Hours ? (
//                       <>
//                         <Typography variant="body2">
//                           <strong>Full Day Rate:</strong> ₹{calculationDetails.baseRate}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Number of Days:</strong> {calculationDetails.days}
//                         </Typography>
//                       </>
//                     ) : (
//                       <>
//                         <Typography variant="body2">
//                           <strong>First Hour Rate:</strong> ₹{calculationDetails.baseRate}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Additional Hour Rate:</strong> ₹{calculationDetails.additionalRate}
//                         </Typography>
//                         <Typography variant="body2">
//                           <strong>Total Hours:</strong> {calculationDetails.totalHours}
//                         </Typography>
//                       </>
//                     )}
//                     <Divider sx={{ my: 1 }} />
//                     <Typography variant="body2">
//                       <strong>Calculation:</strong> {calculationDetails.calculation}
//                     </Typography>
//                   </Stack>
//                 </CardContent>
//               </Card>
//             )}
            
//             <Box sx={{ mt: 3, mb: 2 }}>
//               <Typography variant="h6" color="primary" gutterBottom>
//                 Final Amount
//               </Typography>
//               <Typography variant="h4" fontWeight="bold">
//                 ₹{amount.toFixed(2)}
//               </Typography>
//             </Box>
//           </>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button 
//           onClick={onClose} 
//           disabled={loading}
//           color="secondary"
//         >
//           Cancel
//         </Button>
//         <Button 
//           onClick={handleSubmit} 
//           variant="contained" 
//           color="primary"
//           disabled={isLoading || !vendorId}
//           startIcon={loading ? <CircularProgress size={20} /> : null}
//         >
//           {loading ? 'Processing...' : 'Confirm Exit'}
//         </Button>
//       </DialogActions>
//     </Box>
//   )
// }

// export default ExitVehicleCalculator



'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import { 
  Button, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Divider,
  Card,
  CardContent,
  Stack,
  Grid
} from '@mui/material'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Timer component for displaying elapsed time
const ParkedTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  
  useEffect(() => {
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')
      return
    }
    
    try {
      // Parse the parked date (DD-MM-YYYY)
      const [day, month, year] = parkedDate.split('-')
      
      // Parse the parked time (hh:mm AM/PM)
      const [timePart, ampm] = parkedTime.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)
      
      // Convert to 24-hour format
      if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0
      }
      
      const parkingStartTime = new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`)
      
      const timer = setInterval(() => {
        const now = new Date()
        const diffMs = now - parkingStartTime
        
        // Convert milliseconds to hours, minutes, seconds
        const diffSecs = Math.floor(diffMs / 1000)
        const hours = Math.floor(diffSecs / 3600)
        const minutes = Math.floor((diffSecs % 3600) / 60)
        const seconds = diffSecs % 60
        
        // Format with leading zeros
        const formattedHours = hours.toString().padStart(2, '0')
        const formattedMinutes = minutes.toString().padStart(2, '0')
        const formattedSeconds = seconds.toString().padStart(2, '0')
        
        setElapsedTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
      }, 1000)
      
      return () => clearInterval(timer)
    } catch (error) {
      console.error("Error setting up timer:", error)
      setElapsedTime('00:00:00')
    }
  }, [parkedDate, parkedTime])
  
  return (
    <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 500, color: 'text.secondary' }}>
      ({elapsedTime})
    </Typography>
  )
}

const ExitVehicleCalculator = ({ 
  bookingId, 
  vehicleType = 'Car', 
  bookType = 'Hourly',
  bookingDetails = null,
  onClose, 
  onSuccess 
}) => {
  const { data: session } = useSession();
  const vendorId = session?.user?.id;
  
  const [loading, setLoading] = useState(false)
  const [fetchingCharges, setFetchingCharges] = useState(true)
  const [fetchingBookingDetails, setFetchingBookingDetails] = useState(false)
  const [hours, setHours] = useState(0)
  const [amount, setAmount] = useState(0)
  const [chargesData, setChargesData] = useState(null)
  const [error, setError] = useState('')
  const [calculationDetails, setCalculationDetails] = useState(null)
  const [bookingData, setBookingData] = useState(bookingDetails || null)
  
  // Determine if booking is 24 Hours type
  const is24Hours = bookingData?.bookType === '24 Hours' || bookType === '24 Hours'
  
  // Fetch booking details if not provided
  useEffect(() => {
    const getBookingDetails = async () => {
      if (bookingDetails) {
        setBookingData(bookingDetails)
        return
      }
      
      if (!bookingId) return
      
      try {
        setFetchingBookingDetails(true)
        console.log(`Fetching booking details for ID: ${bookingId}`)
        
        const response = await fetch(`${API_URL}/vendor/getbookingdetails/${bookingId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        
        const data = await response.json()
        
        if (!data || !data.booking) {
          throw new Error('Invalid booking data received')
        }
        
        console.log('Received booking details:', data.booking)
        setBookingData(data.booking)
      } catch (err) {
        console.error('Error fetching booking details:', err)
        setError('Failed to fetch booking details: ' + (err.message || ''))
      } finally {
        setFetchingBookingDetails(false)
      }
    }
    
    if (!bookingDetails && bookingId) {
      getBookingDetails()
    }
  }, [bookingId, bookingDetails])

  // Calculate hours between parking time and current time
  useEffect(() => {
    const calculateDuration = () => {
      try {
        // Get parking date and time from bookingData if available
        const parkingDate = bookingData?.parkedDate
        const parkingTime = bookingData?.parkedTime
        
        console.log('Calculating duration with:', { parkingDate, parkingTime });
        
        // Validate parking date and time
        if (!parkingDate || !parkingTime) {
          console.error('Missing parking data:', { parkingDate, parkingTime });
          throw new Error('Parking date or time not available')
        }
        
        // Parse date in DD-MM-YYYY format
        const [day, month, year] = parkingDate.split('-').map(Number)
        
        // Parse time (12:14 PM)
        let [time, period] = parkingTime.split(' ')
        let [hours, minutes] = time.split(':').map(Number)
        
        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) {
          hours += 12
        } else if (period === 'AM' && hours === 12) {
          hours = 0
        }
        
        // Create parking datetime
        const parkingDateTime = new Date(year, month - 1, day, hours, minutes)
        const currentDateTime = new Date()
        
        console.log('Parking date time:', parkingDateTime);
        console.log('Current date time:', currentDateTime);
        
        // Calculate difference in milliseconds
        const diffMs = currentDateTime - parkingDateTime
        
        // Handle calculation differently based on booking type
        if (is24Hours) {
          // For 24 Hours booking type, calculate in days (rounded up)
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
          const calculatedDays = Math.max(1, diffDays)
          console.log('Calculated days (24 Hours booking):', calculatedDays);
          setHours(calculatedDays)
          return calculatedDays
        } else {
          // For Hourly booking type, calculate in hours (rounded up)
          const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
          const calculatedHours = Math.max(1, diffHours)
          console.log('Calculated hours (Hourly booking):', calculatedHours);
          setHours(calculatedHours)
          return calculatedHours
        }
      } catch (err) {
        console.error('Error calculating duration:', err)
        setError('Failed to calculate parking duration. Using default value.')
        setHours(1)
        return 1
      }
    }
    
    // Only calculate if we have booking data with parking times
    if (bookingData?.parkedDate && bookingData?.parkedTime) {
      const calculatedDuration = calculateDuration()
      
      // If we already have charge data, calculate amount
      if (chargesData) {
        calculateAmount(calculatedDuration, chargesData)
      }
    }
  }, [bookingData, chargesData, is24Hours])

  // Fetch charges data
  useEffect(() => {
    const fetchCharges = async () => {
      try {
        if (!vendorId) {
          console.log('Waiting for vendorId...');
          return;
        }

        setFetchingCharges(true)
        setError('')

        console.log(`Fetching charges for vendor: ${vendorId}`);
        const response = await fetch(`${API_URL}/vendor/getchargesdata/${vendorId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch charges data')
        }

        const data = await response.json()
        console.log('Received charges data:', data);
        
        if (!data?.vendor?.charges) {
          throw new Error('Invalid charges data format')
        }

        setChargesData(data.vendor)
        // Don't calculate amount here, it will be triggered by the hours useEffect
      } catch (err) {
        console.error('Error fetching charges:', err)
        setError(err.message || 'Failed to fetch parking charges data')
      } finally {
        setFetchingCharges(false)
      }
    }

    fetchCharges()
  }, [vendorId])

  // Calculate amount based on hours and charges data
  const calculateAmount = (hoursValue, charges = chargesData) => {
    if (!charges || !charges.charges || !charges.charges.length) {
      console.warn('No charges data available');
      return;
    }

    try {
      // Get vehicle type from booking data if available
      const effectiveVehicleType = bookingData?.vehicleType || vehicleType
      
      console.log('Calculating amount for:', { 
        hoursValue, 
        vehicleType: effectiveVehicleType, 
        is24Hours
      });
      
      // Find relevant charges for the vehicle type (case insensitive)
      const relevantCharges = charges.charges.filter(charge => 
        charge.category.toLowerCase() === effectiveVehicleType.toLowerCase()
      )

      if (relevantCharges.length === 0) {
        throw new Error(`No charges found for ${effectiveVehicleType}`)
      }

      console.log('Relevant charges:', relevantCharges);

      let calculatedAmount = 0
      let details = {}

      if (is24Hours) {
        // Find the best matching full day charge (case insensitive)
        const fullDayCharge = relevantCharges.find(charge => 
          charge.type.toLowerCase().includes('full day') || 
          charge.type.toLowerCase().includes('24 hour')
        )
        
        if (!fullDayCharge) {
          throw new Error(`Full day charge not found for ${effectiveVehicleType}`)
        }
        
        const days = hoursValue // Already calculated in days for 24 Hours booking type
        calculatedAmount = Number(fullDayCharge.amount) * days
        
        details = {
          rateType: "Full day",
          baseRate: Number(fullDayCharge.amount),
          days: days,
          calculation: `${fullDayCharge.amount} × ${days} day(s) = ${calculatedAmount}`
        }
        
        console.log('24-hour calculation details:', details);
      } else {
        // Find base and additional charges (case insensitive)
        const baseCharge = relevantCharges.find(charge => 
          charge.type.toLowerCase().includes('0 to 1') || 
          charge.type.toLowerCase().includes('first hour') ||
          charge.type.toLowerCase().includes('minimum')
        )
        
        const additionalCharge = relevantCharges.find(charge => 
          charge.type.toLowerCase().includes('additional') || 
          charge.type.toLowerCase().includes('extra hour')
        )
        
        if (!baseCharge) {
          throw new Error(`Base charge not found for ${effectiveVehicleType}`)
        }
        
        // First hour
        calculatedAmount = Number(baseCharge.amount)
        
        // Additional hours (use base charge if additional not found)
        const additionalRate = additionalCharge ? Number(additionalCharge.amount) : Number(baseCharge.amount)
        
        if (hoursValue > 1) {
          calculatedAmount += additionalRate * (hoursValue - 1)
        }
        
        details = {
          rateType: "Hourly",
          baseRate: Number(baseCharge.amount),
          additionalRate: additionalRate,
          totalHours: hoursValue,
          calculation: hoursValue > 1 ? 
            `${baseCharge.amount} (first hour) + ${additionalRate} × ${hoursValue - 1} (additional hours) = ${calculatedAmount}` :
            `${baseCharge.amount} (first hour) = ${calculatedAmount}`
        }
        
        console.log('Hourly calculation details:', details);
      }

      setAmount(calculatedAmount)
      setCalculationDetails(details)
      setError('')
    } catch (err) {
      console.error('Error calculating amount:', err)
      setError(err.message || 'Failed to calculate amount')
      setAmount(0)
    }
  }

  const handleHoursChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1)
    setHours(value)
    if (chargesData) {
      calculateAmount(value, chargesData)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr; // Already in DD-MM-YYYY format
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    
    // Convert from "hh:mm AM/PM" to 24-hour format for display
    let [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    // Format as HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const handleSubmit = async () => {
    if (!bookingId || !amount || !hours) {
      setError('Booking ID, amount and hours are required')
      return
    }
  
    setLoading(true)
    setError('')
    
    try {
      console.log('Submitting exit data:', {
        bookingId,
        amount,
        hour: hours,  // Changed from 'hours' to 'hour' to match backend
        is24Hours,
        vendorId
      });
      
      const response = await fetch(`${API_URL}/vendor/exitvehicle/${bookingId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          amount,
          hour: hours,  // Changed from 'hours' to 'hour'
          is24Hours,
          vendorId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update booking status')
      }

      const data = await response.json()
      onSuccess?.(data.message || 'Vehicle exit processed successfully')
      onClose?.()
    } catch (err) {
      console.error('Error processing exit:', err)
      setError(err.message || 'Failed to process vehicle exit')
    } finally {
      setLoading(false)
    }
  }

  const isLoading = fetchingCharges || fetchingBookingDetails || loading

  return (
    <Box>
      <DialogTitle>
        Calculate Exit Charges
        <Typography variant="subtitle2" color="text.secondary">
          Booking ID: {bookingId}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {isLoading && !error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              {fetchingBookingDetails ? 'Loading booking details...' : 
               fetchingCharges ? 'Loading charges data...' : 'Processing...'}
            </Typography>
          </Box>
        ) : (
          <>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Vehicle Type: {bookingData?.vehicleType || vehicleType}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Booking Type: {bookingData?.bookType || bookType}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  Parked Since: {formatDate(bookingData?.parkedDate)} at {formatTime(bookingData?.parkedTime)}{' '}
                  {bookingData?.parkedDate && bookingData?.parkedTime && (
                    <ParkedTimer 
                      parkedDate={bookingData.parkedDate} 
                      parkedTime={bookingData.parkedTime} 
                    />
                  )}
                </Typography>
              </CardContent>
            </Card>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={is24Hours ? "Number of Days" : "Number of Hours"}
                  type="number"
                  value={hours}
                  InputProps={{ 
                    readOnly: true,
                    inputProps: { min: 1 }
                  }}
                  disabled={isLoading}
                  required
                />
              </Grid>
            </Grid>
            
            {calculationDetails && (
              <Card sx={{ mt: 3, backgroundColor: '#f9f9f9' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Calculation Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Rate Type:</strong> {calculationDetails.rateType}
                    </Typography>
                    {is24Hours ? (
                      <>
                        <Typography variant="body2">
                          <strong>Full Day Rate:</strong> ₹{calculationDetails.baseRate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Number of Days:</strong> {calculationDetails.days}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="body2">
                          <strong>First Hour Rate:</strong> ₹{calculationDetails.baseRate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Additional Hour Rate:</strong> ₹{calculationDetails.additionalRate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Total Hours:</strong> {calculationDetails.totalHours}
                        </Typography>
                      </>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>Calculation:</strong> {calculationDetails.calculation}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Final Amount
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ₹{amount.toFixed(2)}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          color="secondary"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={isLoading || !vendorId}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : 'Confirm Exit'}
        </Button>
      </DialogActions>
    </Box>
  )
}

export default ExitVehicleCalculator
