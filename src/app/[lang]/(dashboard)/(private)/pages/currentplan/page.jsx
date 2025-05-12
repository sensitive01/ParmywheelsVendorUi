// 'use client';

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useSession } from 'next-auth/react';
// import {
//   Box,
//   Typography,
//   Button,
//   Paper,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   IconButton,
//   CircularProgress,
//   Snackbar,
//   Alert
// } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import CheckIcon from '@mui/icons-material/Check';

// const loadRazorpay = () => {
//   return new Promise((resolve) => {
//     if (window.Razorpay) {
//       resolve(true);
//       return;
//     }
    
//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.async = true;
//     script.onload = () => {
//       resolve(true);
//     };
//     script.onerror = () => {
//       console.error('Failed to load Razorpay SDK');
//       resolve(false);
//     };
//     document.body.appendChild(script);
//   });
// };

// const PlanCard = ({ title, price, validity, isActive, onSelect, daysLeft }) => (
//   <Paper
//     elevation={0}
//     sx={{
//       p: 2,
//       height: '100%',
//       borderRadius: 2,
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       textAlign: 'center',
//       bgcolor: isActive ? '#41b983' : '#f5f5f5',
//       color: isActive ? 'white' : 'inherit',
//       minWidth: 150,
//       mr: 1,
//       cursor: 'pointer',
//       transition: 'all 0.3s ease',
//       '&:hover': {
//         transform: 'translateY(-5px)',
//         boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
//       }
//     }}
//     onClick={onSelect}
//   >
//     <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
//       {title}
//     </Typography>
//     {validity && (
//       <Typography variant="body2" sx={{ mb: 1 }}>
//         Validity: {validity}
//       </Typography>
//     )}
//     <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
//       ₹{price}
//     </Typography>
//     {daysLeft !== null && (
//       <Typography variant="body2">
//         Days left: {daysLeft}
//       </Typography>
//     )}
//   </Paper>
// );

// const SubscriptionPlan = () => {
//   const [currentView, setCurrentView] = useState('currentPlan');
//   const [subscriptionDays, setSubscriptionDays] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
//   const [processingTrial, setProcessingTrial] = useState(false);
//   const [trialActivated, setTrialActivated] = useState(false);
//   const [buttonText, setButtonText] = useState('Proceed');
//   const [processingPayment, setProcessingPayment] = useState(false);
//   const [latestPayment, setLatestPayment] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [activePlan, setActivePlan] = useState(null);
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;
//   const { data: session } = useSession();
//   const vendorId = session?.user?.id;
  
//   const fetchSubscriptionData = async () => {
//     if (!vendorId) {
//       setLoading(false);
//       return;
//     }
    
//     try {
//       setLoading(true);
//       console.log(`Fetching subscription data from: ${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`);
//       const subscriptionResponse = await axios.get(`${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`);
//       console.log('Subscription API Response:', subscriptionResponse.data);
      
//       console.log(`Fetching trial status from: ${API_URL}/vendor/fetchtrial/${vendorId}`);
//       const trialResponse = await axios.get(`${API_URL}/vendor/fetchtrial/${vendorId}`);
//       console.log('Trial API Response:', trialResponse.data);
      
//       console.log(`Fetching plans from: ${API_URL}/admin/getvendorplan`);
//       const plansResponse = await axios.get(`${API_URL}/admin/getvendorplan`);
//       console.log('Plans API Response:', plansResponse.data);
      
//       if (subscriptionResponse.data && subscriptionResponse.data.subscriptionleft !== undefined) {
//         setSubscriptionDays(subscriptionResponse.data.subscriptionleft);
//       } else {
//         setSubscriptionDays(0);
//       }
      
//       if (trialResponse.data && trialResponse.data.trial === "true") {
//         setTrialActivated(true);
//         // Set active plan to trial if trial is activated
//         setActivePlan({
//           id: 'trial',
//           title: '30 Days Free Trial',
//           price: '0',
//           validity: '30 days',
//           planId: 'trial_plan',
//           features: [
//             'Unlimited bookings',
//             '24/7 customer support',
//             'Access to premium spots'
//           ]
//         });
//       } else {
//         setTrialActivated(false);
//       }
      
//       if (plansResponse.data && plansResponse.data.plans) {
//         // Transform the data to match our component structure
//         const formattedPlans = plansResponse.data.plans.map(plan => ({
//           id: plan._id,
//           title: plan.planName,
//           price: (parseInt(plan.amount) / 100).toString(), // Convert from paisa to rupees
//           validity: `${plan.validity} days`,
//           planId: plan._id,
//           features: plan.features || []
//         }));
        
//         // Add trial plan at the beginning ONLY if the user hasn't used their trial
//         if (!trialActivated) {
//           formattedPlans.unshift({
//             id: 'trial',
//             title: '30 Days Free Trial',
//             price: '0',
//             validity: '30 days',
//             planId: 'trial_plan',
//             features: [
//               'Unlimited bookings',
//               '24/7 customer support',
//               'Access to premium spots'
//             ]
//           });
//         }
        
//         setPlans(formattedPlans);
//       }
      
//       // Fetch the latest payment for display
//       // try {
//       //   const latestPaymentResponse = await axios.get(`${API_URL}/vendor/fetchpaylast/${vendorId}`);
//       //   if (latestPaymentResponse.data && latestPaymentResponse.data.payment) {
//       //     setLatestPayment(latestPaymentResponse.data.payment);
//       //   }
//       // } catch (err) {
//       //   console.log('No payment history found or error fetching it');
//       // }
      
//     } catch (err) {
//       console.error('Error fetching subscription data:', err);
//       setError('Failed to fetch subscription data');
//       setSubscriptionDays(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const activateFreeTrial = async () => {
//     if (!vendorId) {
//       setNotification({
//         open: true,
//         message: 'User session not found. Please log in again.',
//         type: 'error'
//       });
//       return;
//     }
    
//     setProcessingTrial(true);
    
//     try {
//       console.log(`Activating free trial for: ${API_URL}/vendor/freetrial/${vendorId}`);
//       const response = await axios.put(`${API_URL}/vendor/freetrial/${vendorId}`);
      
//       console.log('Free Trial Activation Response:', response.data);
      
//       if (response.data && response.data.message) {
//         await logPayment('trial_plan', '0', 'Free Trial Activation', 'success');
        
//         setNotification({
//           open: true,
//           message: 'Free trial activated successfully!',
//           type: 'success'
//         });
        
//         // Set trial as activated immediately without waiting for refetch
//         setTrialActivated(true);
        
//         // Update subscription days
//         setSubscriptionDays(30);
        
//         // Set active plan to trial
//         setActivePlan({
//           id: 'trial',
//           title: '30 Days Free Trial',
//           price: '0',
//           validity: '30 days',
//           planId: 'trial_plan',
//           features: [
//             'Unlimited bookings',
//             '24/7 customer support',
//             'Access to premium spots'
//           ]
//         });
        
//         fetchSubscriptionData();
//         setCurrentView('currentPlan');
//       }
//     } catch (err) {
//       console.error('Error activating free trial:', err);
//       setNotification({
//         open: true,
//         message: err.response?.data?.message || 'Failed to activate free trial',
//         type: 'error'
//       });
//     } finally {
//       setProcessingTrial(false);
//     }
//   };

//   const initiateRazorpayPayment = async (planId, amount) => {
//     if (!vendorId) {
//       setNotification({
//         open: true,
//         message: 'User session not found. Please log in again.',
//         type: 'error'
//       });
//       return false;
//     }

//     setProcessingPayment(true);

//     try {
//       const razorpayLoaded = await loadRazorpay();
//       if (!razorpayLoaded) {
//         throw new Error('Failed to load Razorpay SDK');
//       }
      
//       const options = {
//         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//         amount: amount,
//         currency: 'INR',
//         name: 'ASN Subscription',
//         description: 'Payment for subscription plan',
//         image: '/logo.png',
//         prefill: {
//           name: session?.user?.name || '',
//           email: session?.user?.email || '',
//           contact: session?.user?.phone || ''
//         },
//         notes: {
//           planId: planId,
//           vendorId: vendorId
//         },
//         theme: {
//           color: '#41b983'
//         },
//         handler: async function(response) {
//           try {
//             // Modified to match the backend API structure
//             const paymentDetails = {
//               payment_id: response.razorpay_payment_id,
//               order_id: response.razorpay_order_id || `order_${Date.now()}`,
//               signature: response.razorpay_signature || '',
//               plan_id: planId,
//               amount: amount,
//               transaction_name: "Plan Purchase",
//               payment_status: "success"
//             };
            
//             // Use the sucesspay endpoint as specified in your backend
//             const saveResponse = await axios.post(
//               `${API_URL}/vendor/sucesspay/${vendorId}`, 
//               paymentDetails
//             );
//             console.log("success pay", saveResponse);

//             if (saveResponse.data && saveResponse.data.payment) {
//               setLatestPayment(saveResponse.data.payment);
              
//               // Find the selected plan to get validity days
//               const selectedPlanData = plans.find(plan => plan.planId === planId);
//               let daysToAdd = 0;
              
//               if (selectedPlanData) {
//                 // Extract the number of days from validity (e.g., "30 days" -> 30)
//                 const validityMatch = selectedPlanData.validity.match(/^(\d+)/);
//                 if (validityMatch && validityMatch[1]) {
//                   daysToAdd = parseInt(validityMatch[1]);
//                 }
//               }
              
//               // Call the addExtraDays endpoint to add the plan's days to current subscription
//               if (daysToAdd > 0) {
//                 try {
//                   const addDaysResponse = await axios.post(
//                     `${API_URL}/vendor/addExtraDays/${vendorId}`,
//                     { extraDays: daysToAdd }
//                   );
                  
//                   console.log("Add extra days response:", addDaysResponse.data);
                  
//                   if (addDaysResponse.data && addDaysResponse.data.vendorDetails) {
//                     // Update subscription days directly from the response
//                     setSubscriptionDays(parseInt(addDaysResponse.data.vendorDetails.subscriptionleft));
//                   }
//                 } catch (addDaysErr) {
//                   console.error("Error adding extra days:", addDaysErr);
//                   // Still continue as the payment was successful
//                 }
//               }
              
//               setNotification({
//                 open: true,
//                 message: `Payment processed successfully! Amount: ₹${parseFloat(amount)/100}`,
//                 type: 'success'
//               });
              
//               // Update active plan
//               const newActivePlan = plans.find(plan => plan.planId === planId);
//               if (newActivePlan) {
//                 setActivePlan(newActivePlan);
//               }
              
//               fetchSubscriptionData();
//               setCurrentView('currentPlan');
//             }
//           } catch (err) {
//             console.error('Error saving payment:', err);
//             setNotification({
//               open: true,
//               message: 'Payment completed but failed to save. Please contact support.',
//               type: 'warning'
//             });
//           } finally {
//             setProcessingPayment(false);
//           }
//         },
//         modal: {
//           ondismiss: function() {
//             setProcessingPayment(false);
//             console.log('Payment window dismissed');
//           }
//         }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.on('payment.failed', async function(response) {
//         console.error('Payment failed:', response.error);
        
//         // Log the failed payment using the log endpoint
//         await logPayment(planId, amount, "Plan Purchase", "failed");
        
//         setNotification({
//           open: true,
//           message: `Payment failed: ${response.error.description}`,
//           type: 'error'
//         });
//         setProcessingPayment(false);
//       });

//       rzp.open();
//       return true;
//     } catch (err) {
//       console.error('Error processing payment:', err);
//       await logPayment(planId, amount, "Plan Purchase", "error");
//       setNotification({
//         open: true,
//         message: err.message || 'Payment failed. Please try again.',
//         type: 'error'
//       });
//       setProcessingPayment(false);
//       return false;
//     }
//   };

//   const logPayment = async (planId, amount, transactionName, status) => {
//     try {
//       // Structure the payment log data according to your backend API
//       const paymentLogData = {
//         payment_id: status === "success" ? `manual_${Date.now()}` : "",
//         order_id: status === "success" ? `manual_${Date.now()}` : "",
//         plan_id: planId,
//         amount: amount,
//         transaction_name: transactionName,
//         payment_status: status
//       };

//       // Use the log endpoint as specified in your backend
//       const response = await axios.post(
//         `${API_URL}/vendor/log/${vendorId}`, 
//         paymentLogData
//       );
//       console.log("payment log", response);

//       console.log('Payment Log Response:', response.data);
//       return true;
//     } catch (err) {
//       console.error('Error logging payment:', err);
//       return false;
//     }
//   };
  
//   const handlePlanSelection = (planId) => {
//     setSelectedPlan(planId);
//     if (planId === 'trial') {
//       setButtonText('Activate Trial');
//     } else {
//       setButtonText('Pay Now');
//     }
//   };
  
//   const handleProceed = async () => {
//     if (!selectedPlan) return;
    
//     if (selectedPlan === 'trial') {
//       activateFreeTrial();
//     } else {
//       const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
//       if (!selectedPlanData) return;
      
//       // Convert price to paisa (multiply by 100) as Razorpay expects amount in paisa
//       const numericAmount = parseFloat(selectedPlanData.price) * 100; 
      
//       await initiateRazorpayPayment(selectedPlanData.planId, numericAmount.toString());
//     }
//   };
  
//   const handleCloseNotification = () => {
//     setNotification({ ...notification, open: false });
//   };

//   const getAvailablePlans = () => {
//     // Only return plans that aren't trial if trial is already activated
//     return trialActivated ? plans.filter(plan => plan.id !== 'trial') : plans;
//   };
  
//   useEffect(() => {
//     fetchSubscriptionData();
//     loadRazorpay().then((loaded) => {
//       if (!loaded) {
//         console.warn('Razorpay SDK failed to load. Payment may not work properly.');
//       }
//     });
//   }, [vendorId, API_URL]);
  
//   useEffect(() => {
//     // Set default selected plan based on trial status
//     if (plans.length > 0) {
//       if (trialActivated && plans.some(plan => plan.id !== 'trial')) {
//         // If trial is activated, select the first non-trial plan
//         const nonTrialPlan = plans.find(plan => plan.id !== 'trial');
//         if (nonTrialPlan) {
//           setSelectedPlan(nonTrialPlan.id);
//           setButtonText('Pay Now');
//         }
//       } else {
//         // If trial is not activated, select the trial plan if available
//         const trialPlan = plans.find(plan => plan.id === 'trial');
//         if (trialPlan) {
//           setSelectedPlan('trial');
//           setButtonText('Activate Trial');
//         } else if (plans.length > 0) {
//           // Otherwise select the first available plan
//           setSelectedPlan(plans[0].id);
//           setButtonText('Pay Now');
//         }
//       }
//     }
//   }, [plans, trialActivated]);

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     }).format(date);
//   };

//   const renderCurrentPlan = () => {
//     // Get features from active plan or trial plan if activated
//     const currentFeatures = activePlan?.features || [
//       'Unlimited bookings',
//       '24/7 customer support',
//       'Access to premium spots'
//     ];
    
//     return (
//       <Box sx={{ p: 2 }}>
//         <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//           {subscriptionDays > 0 ? 'Your subscription is active.' : 'Upgrade your plan to get more bookings.'}
//         </Typography>
        
//         <Paper
//           elevation={0}
//           sx={{
//             p: 3,
//             mb: 3,
//             borderRadius: 2,
//             textAlign: 'center',
//             bgcolor: subscriptionDays > 0 ? '#41b983' : '#f5f5f5',
//             color: subscriptionDays > 0 ? 'white' : 'text.primary'
//           }}
//         >
//           <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
//             Your Current Plan
//           </Typography>
          
//           {loading ? (
//             <CircularProgress size={24} sx={{ color: subscriptionDays > 0 ? 'white' : '#41b983', mt: 1 }} />
//           ) : error ? (
//             <Typography variant="body1" sx={{ mt: 1 }}>
//               Error loading subscription data
//             </Typography>
//           ) : (
//             <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
//               {subscriptionDays} days left
//             </Typography>
//           )}
          
//           <Typography variant="body1" sx={{ mt: 1 }}>
//             {subscriptionDays > 0 ? "Upgrade Your Plan" : "Get Started"}
//           </Typography>
//         </Paper>
        
//         <Typography variant="h6" sx={{ mb: 2 }}>
//           Plan Features:
//         </Typography>
        
//         <List disablePadding>
//           {currentFeatures.map((feature, index) => (
//             <ListItem key={index} disablePadding sx={{ mb: 1 }}>
//               <ListItemIcon sx={{ minWidth: 30 }}>
//                 <CheckIcon sx={{ color: '#41b983' }} />
//               </ListItemIcon>
//               <ListItemText primary={feature} />
//             </ListItem>
//           ))}
//         </List>
        
//         {latestPayment && (
//           <Box sx={{ mt: 3 }}>
//             <Typography variant="h6" sx={{ mb: 2 }}>
//               Latest Transaction
//             </Typography>
            
//             <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                 {latestPayment.transactionName || 'Plan Purchase'}
//               </Typography>
//               <Typography variant="body2">
//                 Status: <span style={{ color: latestPayment.paymentStatus === 'success' ? '#41b983' : '#f44336' }}>
//                   {latestPayment.paymentStatus || 'Unknown'}
//                 </span>
//               </Typography>
//               <Typography variant="body2">
//                 Amount: ₹{parseFloat(latestPayment.amount || 0) / 100}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Date: {latestPayment.createdAt ? formatDate(latestPayment.createdAt) : 'Unknown'}
//               </Typography>
//             </Paper>
//           </Box>
//         )}
        
//         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
//           <Button 
//             variant="contained" 
//             size="large"
//             sx={{ 
//               bgcolor: '#41b983', 
//               color: 'white',
//               borderRadius: 2,
//               px: 4,
//               '&:hover': {
//                 bgcolor: '#379c6f'
//               }
//             }}
//             onClick={() => setCurrentView('choosePlan')}
//           >
//             {subscriptionDays > 0 ? 'Upgrade Now' : 'Get Started'}
//           </Button>
//         </Box>
//       </Box>
//     );
//   };

//   const renderChoosePlan = () => {
//     const availablePlans = getAvailablePlans();
    
//     return (
//       <>
//         <Box sx={{ p: 2 }}>
//           <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//             {trialActivated ? 'Choose your plan.' : 'Start with a free trial or annual plan.'}
//           </Typography>
          
//           <Box sx={{ display: 'flex', mb: 4, overflowX: 'auto', pb: 1 }}>
//             {availablePlans.map(plan => (
//               <PlanCard 
//                 key={plan.id}
//                 title={plan.title}
//                 price={plan.price}
//                 validity={plan.validity}
//                 isActive={plan.id === selectedPlan}
//                 daysLeft={null}
//                 onSelect={() => handlePlanSelection(plan.id)}
//               />
//             ))}
//           </Box>
          
//           <Typography variant="h6" sx={{ mb: 2 }}>
//             Plan Features:
//           </Typography>
          
//           <List disablePadding>
//             {selectedPlan && availablePlans.find(p => p.id === selectedPlan)?.features.map((feature, index) => (
//               <ListItem key={index} disablePadding sx={{ mb: 1 }}>
//                 <ListItemIcon sx={{ minWidth: 30 }}>
//                   <CheckIcon sx={{ color: '#41b983' }} />
//                 </ListItemIcon>
//                 <ListItemText primary={feature} />
//               </ListItem>
//             ))}
//           </List>

//           <Paper 
//             elevation={0} 
//             sx={{ 
//               p: 2, 
//               mt: 3, 
//               borderRadius: 2, 
//               bgcolor: '#f8f9fa',
//               border: '1px solid #e0e0e0'
//             }}
//           >
//             <Typography variant="body2" color="text.secondary">
//               • All payments are processed securely by Razorpay
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               • Your payment information is never stored on our servers
//             </Typography>
//             {subscriptionDays > 0 && (
//               <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
//                 • Your existing subscription ({subscriptionDays} days) will be extended with the new plan days
//               </Typography>
//             )}
//           </Paper>
//         </Box>
        
//         <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
//           <Button
//             variant="outlined"
//             onClick={() => setCurrentView('currentPlan')}
//             sx={{
//               borderColor: '#41b983',
//               color: '#41b983',
//               borderRadius: 2,
//               '&:hover': {
//                 borderColor: '#379c6f',
//                 bgcolor: 'rgba(65, 185, 131, 0.04)'
//               }
//             }}
//           >
//             Cancel
//           </Button>
//           <Button 
//             variant="contained" 
//             size="large"
//             disabled={processingTrial || processingPayment || !selectedPlan}
//             sx={{ 
//               bgcolor: '#41b983', 
//               color: 'white',
//               borderRadius: 2,
//               px: 4,
//               '&:hover': {
//                 bgcolor: '#379c6f'
//               }
//             }}
//             onClick={handleProceed}
//           >
//             {processingTrial || processingPayment ? (
//               <CircularProgress size={24} sx={{ color: 'white' }} />
//             ) : (
//               buttonText
//             )}
//           </Button>
//         </Box>
//       </>
//     );
//   };

//   return (
//     <div style={{ margin: "0 auto", background: '#fff', minHeight: '100vh' }}>
//       <Box sx={{ 
//         p: 2, 
//         display: 'flex', 
//         alignItems: 'center',
//         bgcolor: '#41b983',
//         color: 'white',
//         borderRadius: '0 0 16px 16px'
//       }}>
//         {currentView === 'choosePlan' && (
//           <IconButton 
//             color="inherit" 
//             onClick={() => setCurrentView('currentPlan')}
//             sx={{ mr: 1 }}
//           >
//             <ArrowBackIcon />
//           </IconButton>
//         )}
//         <Typography variant="h3" sx={{ ml: currentView === 'choosePlan' ? 0 : 1 }}>
//           {currentView === 'choosePlan' ? 'Choose Plan' : 'Subscription'}
//         </Typography>
//       </Box>
      
//       <Paper
//         elevation={0}
//         sx={{
//           borderRadius: '20px',
//           overflow: 'hidden',
//           minHeight: 'calc(100vh - 70px)',
//           m: 2,
//           mt: 0
//         }}
//       >
//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//             <CircularProgress size={50} sx={{ color: '#41b983' }} />
//           </Box>
//         ) : (
//           currentView === 'choosePlan' ? renderChoosePlan() : renderCurrentPlan()
//         )}
//       </Paper>
      
//       <Snackbar 
//         open={notification.open} 
//         autoHideDuration={6000} 
//         onClose={handleCloseNotification}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert 
//           onClose={handleCloseNotification} 
//           severity={notification.type} 
//           sx={{ width: '100%' }}
//         >
//           {notification.message}
//         </Alert>
//       </Snackbar>
//     </div>
//   );
// };

// export default SubscriptionPlan;



'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const PlanCard = ({ title, price, validity, isActive, onSelect, daysLeft }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      height: '100%',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      bgcolor: isActive ? '#41b983' : '#f5f5f5',
      color: isActive ? 'white' : 'inherit',
      minWidth: 150,
      mr: 1,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }
    }}
    onClick={onSelect}
  >
    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
      {title}
    </Typography>
    {validity && (
      <Typography variant="body2" sx={{ mb: 1 }}>
        Validity: {validity}
      </Typography>
    )}
    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
      ₹{price}
    </Typography>
    {daysLeft !== null && (
      <Typography variant="body2">
        Days left: {daysLeft}
      </Typography>
    )}
  </Paper>
);

const SubscriptionPlan = () => {
  const [currentView, setCurrentView] = useState('currentPlan');
  const [subscriptionDays, setSubscriptionDays] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [processingTrial, setProcessingTrial] = useState(false);
  const [trialActivated, setTrialActivated] = useState(false);
  const [buttonText, setButtonText] = useState('Proceed');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [latestPayment, setLatestPayment] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { data: session } = useSession();
  const vendorId = session?.user?.id;
  
  const fetchSubscriptionData = async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching subscription data from: ${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`);
      const subscriptionResponse = await axios.get(`${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`);
      console.log('Subscription API Response:', subscriptionResponse.data);
      
      console.log(`Fetching trial status from: ${API_URL}/vendor/fetchtrial/${vendorId}`);
      const trialResponse = await axios.get(`${API_URL}/vendor/fetchtrial/${vendorId}`);
      console.log('Trial API Response:', trialResponse.data);
      
      console.log(`Fetching plans from: ${API_URL}/admin/getvendorplan`);
      const plansResponse = await axios.get(`${API_URL}/admin/getvendorplan`);
      console.log('Plans API Response:', plansResponse.data);
      
      if (subscriptionResponse.data && subscriptionResponse.data.subscriptionleft !== undefined) {
        setSubscriptionDays(subscriptionResponse.data.subscriptionleft);
      } else {
        setSubscriptionDays(0);
      }
      
      if (trialResponse.data && trialResponse.data.trial === "true") {
        setTrialActivated(true);
        setActivePlan({
          id: 'trial',
          title: '30 Days Free Trial',
          price: '0',
          validity: '30 days',
          planId: 'trial_plan',
          features: [
            'Unlimited bookings',
            '24/7 customer support',
            'Access to premium spots'
          ]
        });
      } else {
        setTrialActivated(false);
      }
      
      if (plansResponse.data && plansResponse.data.plans) {
        const formattedPlans = plansResponse.data.plans.map(plan => ({
          id: plan._id,
          title: plan.planName,
          price: plan.amount.toString(), // Display as rupees directly
          validity: `${plan.validity} days`,
          planId: plan._id,
          features: plan.features || [],
          amountInPaisa: parseInt(plan.amount) * 100 // Convert to paisa for Razorpay
        }));
        
        if (!trialActivated) {
          formattedPlans.unshift({
            id: 'trial',
            title: '30 Days Free Trial',
            price: '0',
            validity: '30 days',
            planId: 'trial_plan',
            features: [
              'Unlimited bookings',
              '24/7 customer support',
              'Access to premium spots'
            ],
            amountInPaisa: 0
          });
        }
        
        setPlans(formattedPlans);
      }
      
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError('Failed to fetch subscription data');
      setSubscriptionDays(0);
    } finally {
      setLoading(false);
    }
  };

  const activateFreeTrial = async () => {
    if (!vendorId) {
      setNotification({
        open: true,
        message: 'User session not found. Please log in again.',
        type: 'error'
      });
      return;
    }
    
    setProcessingTrial(true);
    
    try {
      console.log(`Activating free trial for: ${API_URL}/vendor/freetrial/${vendorId}`);
      const response = await axios.put(`${API_URL}/vendor/freetrial/${vendorId}`);
      
      console.log('Free Trial Activation Response:', response.data);
      
      if (response.data && response.data.message) {
        await logPayment('trial_plan', '0', 'Free Trial Activation', 'success');
        
        setNotification({
          open: true,
          message: 'Free trial activated successfully!',
          type: 'success'
        });
        
        setTrialActivated(true);
        setSubscriptionDays(30);
        setActivePlan({
          id: 'trial',
          title: '30 Days Free Trial',
          price: '0',
          validity: '30 days',
          planId: 'trial_plan',
          features: [
            'Unlimited bookings',
            '24/7 customer support',
            'Access to premium spots'
          ]
        });
        
        fetchSubscriptionData();
        setCurrentView('currentPlan');
      }
    } catch (err) {
      console.error('Error activating free trial:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to activate free trial',
        type: 'error'
      });
    } finally {
      setProcessingTrial(false);
    }
  };

  const initiateRazorpayPayment = async (planId, amountInPaisa) => {
    if (!vendorId) {
      setNotification({
        open: true,
        message: 'User session not found. Please log in again.',
        type: 'error'
      });
      return false;
    }

    setProcessingPayment(true);

    try {
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaisa,
        currency: 'INR',
        name: 'ASN Subscription',
        description: 'Payment for subscription plan',
        image: '/logo.png',
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          contact: session?.user?.phone || ''
        },
        notes: {
          planId: planId,
          vendorId: vendorId
        },
        theme: {
          color: '#41b983'
        },
        handler: async function(response) {
          try {
            const paymentDetails = {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id || `order_${Date.now()}`,
              signature: response.razorpay_signature || '',
              plan_id: planId,
              amount: (amountInPaisa / 100).toString(), // Store in rupees in database
              transaction_name: "Plan Purchase",
              payment_status: "success"
            };
            
            const saveResponse = await axios.post(
              `${API_URL}/vendor/sucesspay/${vendorId}`, 
              paymentDetails
            );
            console.log("success pay", saveResponse);

            if (saveResponse.data && saveResponse.data.payment) {
              setLatestPayment(saveResponse.data.payment);
              
              const selectedPlanData = plans.find(plan => plan.planId === planId);
              let daysToAdd = 0;
              
              if (selectedPlanData) {
                const validityMatch = selectedPlanData.validity.match(/^(\d+)/);
                if (validityMatch && validityMatch[1]) {
                  daysToAdd = parseInt(validityMatch[1]);
                }
              }
              
              if (daysToAdd > 0) {
                try {
                  const addDaysResponse = await axios.post(
                    `${API_URL}/vendor/addExtraDays/${vendorId}`,
                    { extraDays: daysToAdd }
                  );
                  
                  console.log("Add extra days response:", addDaysResponse.data);
                  
                  if (addDaysResponse.data && addDaysResponse.data.vendorDetails) {
                    setSubscriptionDays(parseInt(addDaysResponse.data.vendorDetails.subscriptionleft));
                  }
                } catch (addDaysErr) {
                  console.error("Error adding extra days:", addDaysErr);
                }
              }
              
              setNotification({
                open: true,
                message: `Payment processed successfully! Amount: ₹${amountInPaisa / 100}`,
                type: 'success'
              });
              
              const newActivePlan = plans.find(plan => plan.planId === planId);
              if (newActivePlan) {
                setActivePlan(newActivePlan);
              }
              
              fetchSubscriptionData();
              setCurrentView('currentPlan');
            }
          } catch (err) {
            console.error('Error saving payment:', err);
            setNotification({
              open: true,
              message: 'Payment completed but failed to save. Please contact support.',
              type: 'warning'
            });
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            console.log('Payment window dismissed');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function(response) {
        console.error('Payment failed:', response.error);
        
        await logPayment(planId, (amountInPaisa / 100).toString(), "Plan Purchase", "failed");
        
        setNotification({
          open: true,
          message: `Payment failed: ${response.error.description}`,
          type: 'error'
        });
        setProcessingPayment(false);
      });

      rzp.open();
      return true;
    } catch (err) {
      console.error('Error processing payment:', err);
      await logPayment(planId, (amountInPaisa / 100).toString(), "Plan Purchase", "error");
      setNotification({
        open: true,
        message: err.message || 'Payment failed. Please try again.',
        type: 'error'
      });
      setProcessingPayment(false);
      return false;
    }
  };

  const logPayment = async (planId, amount, transactionName, status) => {
    try {
      const paymentLogData = {
        payment_id: status === "success" ? `manual_${Date.now()}` : "",
        order_id: status === "success" ? `manual_${Date.now()}` : "",
        plan_id: planId,
        amount: amount,
        transaction_name: transactionName,
        payment_status: status
      };

      const response = await axios.post(
        `${API_URL}/vendor/log/${vendorId}`, 
        paymentLogData
      );
      console.log("payment log", response);

      console.log('Payment Log Response:', response.data);
      return true;
    } catch (err) {
      console.error('Error logging payment:', err);
      return false;
    }
  };
  
  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
    if (planId === 'trial') {
      setButtonText('Activate Trial');
    } else {
      setButtonText('Pay Now');
    }
  };
  
  const handleProceed = async () => {
    if (!selectedPlan) return;
    
    if (selectedPlan === 'trial') {
      activateFreeTrial();
    } else {
      const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
      if (!selectedPlanData) return;
      
      // Use the pre-calculated amountInPaisa
      await initiateRazorpayPayment(selectedPlanData.planId, selectedPlanData.amountInPaisa);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getAvailablePlans = () => {
    return trialActivated ? plans.filter(plan => plan.id !== 'trial') : plans;
  };
  
  useEffect(() => {
    fetchSubscriptionData();
    loadRazorpay().then((loaded) => {
      if (!loaded) {
        console.warn('Razorpay SDK failed to load. Payment may not work properly.');
      }
    });
  }, [vendorId, API_URL]);
  
  useEffect(() => {
    if (plans.length > 0) {
      if (trialActivated && plans.some(plan => plan.id !== 'trial')) {
        const nonTrialPlan = plans.find(plan => plan.id !== 'trial');
        if (nonTrialPlan) {
          setSelectedPlan(nonTrialPlan.id);
          setButtonText('Pay Now');
        }
      } else {
        const trialPlan = plans.find(plan => plan.id === 'trial');
        if (trialPlan) {
          setSelectedPlan('trial');
          setButtonText('Activate Trial');
        } else if (plans.length > 0) {
          setSelectedPlan(plans[0].id);
          setButtonText('Pay Now');
        }
      }
    }
  }, [plans, trialActivated]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderCurrentPlan = () => {
    const currentFeatures = activePlan?.features || [
      'Unlimited bookings',
      '24/7 customer support',
      'Access to premium spots'
    ];
    
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {subscriptionDays > 0 ? 'Your subscription is active.' : 'Upgrade your plan to get more bookings.'}
        </Typography>
        
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: subscriptionDays > 0 ? '#41b983' : '#f5f5f5',
            color: subscriptionDays > 0 ? 'white' : 'text.primary'
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Your Current Plan
          </Typography>
          
          {loading ? (
            <CircularProgress size={24} sx={{ color: subscriptionDays > 0 ? 'white' : '#41b983', mt: 1 }} />
          ) : error ? (
            <Typography variant="body1" sx={{ mt: 1 }}>
              Error loading subscription data
            </Typography>
          ) : (
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              {subscriptionDays} days left
            </Typography>
          )}
          
          <Typography variant="body1" sx={{ mt: 1 }}>
            {subscriptionDays > 0 ? "Upgrade Your Plan" : "Get Started"}
          </Typography>
        </Paper>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          Plan Features:
        </Typography>
        
        <List disablePadding>
          {currentFeatures.map((feature, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 1 }}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <CheckIcon sx={{ color: '#41b983' }} />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>
        
        {latestPayment && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Latest Transaction
            </Typography>
            
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {latestPayment.transactionName || 'Plan Purchase'}
              </Typography>
              <Typography variant="body2">
                Status: <span style={{ color: latestPayment.paymentStatus === 'success' ? '#41b983' : '#f44336' }}>
                  {latestPayment.paymentStatus || 'Unknown'}
                </span>
              </Typography>
              <Typography variant="body2">
                Amount: ₹{latestPayment.amount || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {latestPayment.createdAt ? formatDate(latestPayment.createdAt) : 'Unknown'}
              </Typography>
            </Paper>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              bgcolor: '#41b983', 
              color: 'white',
              borderRadius: 2,
              px: 4,
              '&:hover': {
                bgcolor: '#379c6f'
              }
            }}
            onClick={() => setCurrentView('choosePlan')}
          >
            {subscriptionDays > 0 ? 'Upgrade Now' : 'Get Started'}
          </Button>
        </Box>
      </Box>
    );
  };

  const renderChoosePlan = () => {
    const availablePlans = getAvailablePlans();
    
    return (
      <>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {trialActivated ? 'Choose your plan.' : 'Start with a free trial or annual plan.'}
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 4, overflowX: 'auto', pb: 1 }}>
            {availablePlans.map(plan => (
              <PlanCard 
                key={plan.id}
                title={plan.title}
                price={plan.price}
                validity={plan.validity}
                isActive={plan.id === selectedPlan}
                daysLeft={null}
                onSelect={() => handlePlanSelection(plan.id)}
              />
            ))}
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Plan Features:
          </Typography>
          
          <List disablePadding>
            {selectedPlan && availablePlans.find(p => p.id === selectedPlan)?.features.map((feature, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckIcon sx={{ color: '#41b983' }} />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mt: 3, 
              borderRadius: 2, 
              bgcolor: '#f8f9fa',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              • All payments are processed securely by Razorpay
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Your payment information is never stored on our servers
            </Typography>
            {subscriptionDays > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                • Your existing subscription ({subscriptionDays} days) will be extended with the new plan days
              </Typography>
            )}
          </Paper>
        </Box>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentView('currentPlan')}
            sx={{
              borderColor: '#41b983',
              color: '#41b983',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#379c6f',
                bgcolor: 'rgba(65, 185, 131, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            size="large"
            disabled={processingTrial || processingPayment || !selectedPlan}
            sx={{ 
              bgcolor: '#41b983', 
              color: 'white',
              borderRadius: 2,
              px: 4,
              '&:hover': {
                bgcolor: '#379c6f'
              }
            }}
            onClick={handleProceed}
          >
            {processingTrial || processingPayment ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              buttonText
            )}
          </Button>
        </Box>
      </>
    );
  };

  return (
    <div style={{ margin: "0 auto", background: '#fff', minHeight: '100vh' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        bgcolor: '#41b983',
        color: 'white',
        borderRadius: '0 0 16px 16px'
      }}>
        {currentView === 'choosePlan' && (
          <IconButton 
            color="inherit" 
            onClick={() => setCurrentView('currentPlan')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h3" sx={{ ml: currentView === 'choosePlan' ? 0 : 1 }}>
          {currentView === 'choosePlan' ? 'Choose Plan' : 'Subscription'}
        </Typography>
      </Box>
      
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          minHeight: 'calc(100vh - 70px)',
          m: 2,
          mt: 0
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress size={50} sx={{ color: '#41b983' }} />
          </Box>
        ) : (
          currentView === 'choosePlan' ? renderChoosePlan() : renderCurrentPlan()
        )}
      </Paper>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SubscriptionPlan;
