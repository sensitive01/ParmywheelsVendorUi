// payment only one box

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
//       cursor: 'pointer'
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
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
//   // Get session for the vendorId
//   const { data: session } = useSession();
//   const vendorId = session?.user?.id;
  
//   const fetchSubscriptionData = async () => {
//     if (!vendorId) {
//       setLoading(false);
//       return;
//     }
    
//     try {
//       console.log(`Fetching subscription data from: ${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`);
//       const subscriptionResponse = await axios.get(`${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`);
//       console.log('Subscription API Response:', subscriptionResponse.data);
      
//       // Get trial status
//       console.log(`Fetching trial status from: ${API_URL}/vendor/fetchtrial/${vendorId}`);
//       const trialResponse = await axios.get(`${API_URL}/vendor/fetchtrial/${vendorId}`);
//       console.log('Trial API Response:', trialResponse.data);
      
//       // Set subscription days from API
//       if (subscriptionResponse.data && subscriptionResponse.data.subscriptionleft !== undefined) {
//         setSubscriptionDays(subscriptionResponse.data.subscriptionleft);
//       } else {
//         setSubscriptionDays(0);
//       }
      
//       // Set trial status from API
//       if (trialResponse.data && trialResponse.data.trial === "true") {
//         setTrialActivated(true);
//       } else {
//         setTrialActivated(false);
//       }
//     } catch (err) {
//       console.error('Error fetching subscription data:', err);
//       setError('Failed to fetch subscription data');
//       setSubscriptionDays(0);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   useEffect(() => {
//     fetchSubscriptionData();
//   }, [vendorId, API_URL]);
  
//   useEffect(() => {
//     // Set default selected plan based on whether trial is activated
//     if (trialActivated) {
//       setSelectedPlan('yearly');
//       setButtonText('Payment');
//     } else {
//       // If trial not activated, default to trial plan
//       setSelectedPlan('trial');
//       setButtonText('Proceed');
//     }
//   }, [trialActivated]);
  
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
//         setNotification({
//           open: true,
//           message: 'Free trial activated successfully!',
//           type: 'success'
//         });
        
//         // Refresh subscription data after activation
//         fetchSubscriptionData();
        
//         // Return to current plan view
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
  
//   const handlePlanSelection = (planId) => {
//     setSelectedPlan(planId);
    
//     // Update button text based on selected plan
//     if (planId === 'yearly') {
//       setButtonText('Payment');
//     } else {
//       setButtonText('Proceed');
//     }
//   };
  
//   const handleProceed = () => {
//     // Make sure we have a selected plan
//     if (!selectedPlan) return;
    
//     if (selectedPlan === 'trial') {
//       // Activate free trial
//       activateFreeTrial();
//     } else if (selectedPlan === 'yearly') {
//       // Show payment gateway message for yearly plan
//       setNotification({
//         open: true,
//         message: 'Payment gateway integration coming soon!',
//         type: 'info'
//       });
//       // Stay on the choosePlan view for future payment integration
//     }
//   };
  
//   const handleCloseNotification = () => {
//     setNotification({ ...notification, open: false });
//   };
  
//   // Get available plans based on trial activation status
//   const getAvailablePlans = () => {
//     const yearlyPlan = { 
//       id: 'yearly', 
//       title: 'ASN yearly', 
//       price: '7767.86', 
//       validity: '45 days' 
//     };
    
//     if (trialActivated) {
//       // If trial is activated, only show the yearly plan
//       return [yearlyPlan];
//     } else {
//       // Otherwise, show both trial and yearly plans
//       return [
//         { 
//           id: 'trial', 
//           title: '30 Days Free Trial', 
//           price: '0', 
//           validity: null,
//           daysLeft: subscriptionDays
//         },
//         yearlyPlan
//       ];
//     }
//   };
  
//   const features = [
//     'Unlimited bookings',
//     '24/7 customer support',
//     'Access to premium spots'
//   ];

//   const renderCurrentPlan = () => (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//         Upgrade your plan to get more bookings.
//       </Typography>
      
//       <Paper
//         elevation={0}
//         sx={{
//           p: 3,
//           mb: 3,
//           borderRadius: 2,
//           textAlign: 'center',
//           bgcolor: '#41b983',
//           color: 'white'
//         }}
//       >
//         <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
//           Your Current Plan
//         </Typography>
        
//         {loading ? (
//           <CircularProgress size={24} sx={{ color: 'white', mt: 1 }} />
//         ) : error ? (
//           <Typography variant="body1" sx={{ mt: 1 }}>
//             Error loading subscription data
//           </Typography>
//         ) : (
//           <Typography variant="body1" sx={{ mt: 1 }}>
//             {subscriptionDays} days left
//           </Typography>
//         )}
        
//         <Typography variant="body1" sx={{ mt: 1 }}>
//           {trialActivated ? "Upgrade Your Plan" : "No Active Plan"}
//         </Typography>
//       </Paper>
      
//       <Typography variant="h6" sx={{ mb: 2 }}>
//         Features:
//       </Typography>
      
//       <List disablePadding>
//         {features.map((feature, index) => (
//           <ListItem key={index} disablePadding sx={{ mb: 1 }}>
//             <ListItemIcon sx={{ minWidth: 30 }}>
//               <CheckIcon sx={{ color: '#41b983' }} />
//             </ListItemIcon>
//             <ListItemText primary={feature} />
//           </ListItem>
//         ))}
//       </List>
      
//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
//         <Button 
//           variant="contained" 
//           size="large"
//           sx={{ 
//             bgcolor: '#41b983', 
//             color: 'white',
//             borderRadius: 2,
//             px: 4,
//             '&:hover': {
//               bgcolor: '#379c6f'
//             }
//           }}
//           onClick={() => setCurrentView('choosePlan')}
//         >
//           {trialActivated ? 'Upgrade Plan' : 'Get Started'}
//         </Button>
//       </Box>
//     </Box>
//   );

//   const renderChoosePlan = () => {
//     const availablePlans = getAvailablePlans();
    
//     return (
//       <>
//         <Box sx={{ p: 2 }}>
//           <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//             {trialActivated ? 'Choose your plan.' : 'Start with a free trial or annual plan.'}
//           </Typography>
          
//           <Box sx={{ display: 'flex', mb: 4 }}>
//             {availablePlans.map(plan => (
//               <PlanCard 
//                 key={plan.id}
//                 title={plan.title}
//                 price={plan.price}
//                 validity={plan.validity}
//                 isActive={plan.id === selectedPlan}
//                 daysLeft={plan.id === 'trial' ? subscriptionDays : null}
//                 onSelect={() => handlePlanSelection(plan.id)}
//               />
//             ))}
//           </Box>
          
//           <Typography variant="h6" sx={{ mb: 2 }}>
//             Features:
//           </Typography>
          
//           <List disablePadding>
//             {features.map((feature, index) => (
//               <ListItem key={index} disablePadding sx={{ mb: 1 }}>
//                 <ListItemIcon sx={{ minWidth: 30 }}>
//                   <CheckIcon sx={{ color: '#41b983' }} />
//                 </ListItemIcon>
//                 <ListItemText primary={feature} />
//               </ListItem>
//             ))}
//           </List>
//         </Box>
        
//         <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
//           <Button 
//             variant="contained" 
//             size="large"
//             disabled={processingTrial || !selectedPlan}
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
//             {processingTrial ? (
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
//     <div maxWidth="sm" sx={{ bgcolor: '#41b983', minHeight: '100vh', p: 0 }}>
//       <Box sx={{ 
//         p: 2, 
//         display: 'flex', 
//         alignItems: 'center',
//         color: 'white'
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
//         <Typography variant="h3" sx={{ ml: 1 }}>
//           {currentView === 'choosePlan' ? 'Choose Plan' : 'Current Plan'}
//         </Typography>
//       </Box>
      
//       <Paper
//         elevation={0}
//         sx={{
//           borderRadius: '20px 20px 0 0',
//           overflow: 'hidden',
//           minHeight: 'calc(100vh - 70px)'
//         }}
//       >
//         {currentView === 'choosePlan' ? renderChoosePlan() : renderCurrentPlan()}
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
  const [transactions, setTransactions] = useState([]);
  
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
      if (subscriptionResponse.data && subscriptionResponse.data.subscriptionleft !== undefined) {
        setSubscriptionDays(subscriptionResponse.data.subscriptionleft);
      } else {
        setSubscriptionDays(0);
      }
      if (trialResponse.data && trialResponse.data.trial === "true") {
        setTrialActivated(true);
      } else {
        setTrialActivated(false);
      }
      await fetchTransactionHistory();
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError('Failed to fetch subscription data');
      setSubscriptionDays(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    if (!vendorId) return;
    
    try {
      const response = await axios.get(`${API_URL}/vendor/fetchpay/${vendorId}`);
      if (response.data && response.data.payments) {
        const sortedPayments = response.data.payments.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setTransactions(sortedPayments);
        if (sortedPayments.length > 0) {
          setLatestPayment(sortedPayments[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      if (err.response && err.response.status !== 404) {
        setNotification({
          open: true,
          message: 'Failed to load transaction history',
          type: 'error'
        });
      }
    }
  };
  const plans = [
    { 
      id: 'trial', 
      title: '30 Days Free Trial', 
      price: '0', 
      validity: '30 days',
      planId: 'trial_plan'
    },
    { 
      id: 'yearly', 
      title: 'ASN yearly', 
      price: '7767.86', 
      validity: '45 days',
      planId: '67f61d72211986b8debb3eae'
    }
  ];
  
  useEffect(() => {
    fetchSubscriptionData();
    loadRazorpay().then((loaded) => {
      if (!loaded) {
        console.warn('Razorpay SDK failed to load. Payment may not work properly.');
      }
    });
  }, [vendorId, API_URL]);
  
  useEffect(() => {
    if (trialActivated) {
      setSelectedPlan('yearly');
      setButtonText('Pay Now');
    } else {
      setSelectedPlan('trial');
      setButtonText('Activate Trial');
    }
  }, [trialActivated]);
  
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

  const initiateRazorpayPayment = async (planId, amount) => {
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
        amount: amount,
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
              amount: amount,
              transaction_name: "Plan Purchase",
              payment_status: "success"
            };
            const saveResponse = await axios.post(
              `${API_URL}/vendor/sucesspay/${vendorId}`, 
              paymentDetails
            );

            if (saveResponse.data && saveResponse.data.payment) {
              setLatestPayment(saveResponse.data.payment);
              setNotification({
                open: true,
                message: `Payment processed successfully! Amount: ₹${parseFloat(amount)/100}`,
                type: 'success'
              });
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
        await logPayment(planId, amount, "Plan Purchase", "failed");
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
      await logPayment(planId, amount, "Plan Purchase", "error");
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

      console.log('Payment Log Response:', response.data);
      return true;
    } catch (err) {
      console.error('Error logging payment:', err);
      return false;
    }
  };
  
  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
    if (planId === 'yearly') {
      setButtonText('Pay Now');
    } else {
      setButtonText('Activate Trial');
    }
  };
  
  const handleProceed = async () => {
    if (!selectedPlan) return;
    
    if (selectedPlan === 'trial') {
      activateFreeTrial();
    } else if (selectedPlan === 'yearly') {
      const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
      if (!selectedPlanData) return;
      const amount = selectedPlanData.price.replace(/[^\d.]/g, ''); 
      const numericAmount = parseFloat(amount) * 100; 
      
      await initiateRazorpayPayment(selectedPlanData.planId, numericAmount.toString());
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  const getAvailablePlans = () => {
    if (trialActivated) {
      return plans.filter(plan => plan.id === 'yearly');
    } else {
      return plans;
    }
  };
  
  const features = [
    'Unlimited bookings',
    '24/7 customer support',
    'Access to premium spots',
    'Advanced analytics',
    'Priority customer service'
  ];

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

  const renderCurrentPlan = () => (
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
          {trialActivated ? (subscriptionDays > 0 ? "Upgrade Your Plan" : "Upgrade Your Plan") : "No Active Plan"}
        </Typography>
      </Paper>
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        Features:
      </Typography>
      
      <List disablePadding>
        {features.map((feature, index) => (
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
              Amount: ₹{parseFloat(latestPayment.amount || 0) / 100}
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
          {subscriptionDays > 0 ? 'Upgrade Now' : (trialActivated ? 'Upgrade Plan' : 'Get Started')}
        </Button>
      </Box>
    </Box>
  );

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
                daysLeft={plan.id === 'trial' && trialActivated ? subscriptionDays : null}
                onSelect={() => handlePlanSelection(plan.id)}
              />
            ))}
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Plan Features:
          </Typography>
          
          <List disablePadding>
            {features.map((feature, index) => (
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
            {/* <ArrowBackIcon /> */}
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
        {currentView === 'choosePlan' ? renderChoosePlan() : renderCurrentPlan()}
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


// payment and proceed two box

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
//       cursor: 'pointer'
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
//   const [selectedPlan, setSelectedPlan] = useState('trial');  // Default to trial plan
//   const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
//   const [processingTrial, setProcessingTrial] = useState(false);
//   const [trialActivated, setTrialActivated] = useState(false);
//   const [buttonText, setButtonText] = useState('Proceed');
  
//   const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
//   // Get session for the vendorId
//   const { data: session } = useSession();
//   const vendorId = session?.user?.id;
  
//   const fetchSubscriptionData = async () => {
//     if (!vendorId) {
//       setLoading(false);
//       return;
//     }
    
//     try {
//       console.log(`Fetching subscription data from: ${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`);
//       const subscriptionResponse = await axios.get(`${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`);
//       console.log('Subscription API Response:', subscriptionResponse.data);
      
//       // Get trial status
//       console.log(`Fetching trial status from: ${API_URL}/vendor/fetchtrial/${vendorId}`);
//       const trialResponse = await axios.get(`${API_URL}/vendor/fetchtrial/${vendorId}`);
//       console.log('Trial API Response:', trialResponse.data);
      
//       // Set subscription days from API
//       if (subscriptionResponse.data && subscriptionResponse.data.subscriptionleft !== undefined) {
//         setSubscriptionDays(subscriptionResponse.data.subscriptionleft);
//       } else {
//         setSubscriptionDays(0);
//       }
      
//       // Set trial status from API
//       if (trialResponse.data && trialResponse.data.trial === "true") {
//         setTrialActivated(true);
//       } else {
//         setTrialActivated(false);
//       }
//     } catch (err) {
//       console.error('Error fetching subscription data:', err);
//       setError('Failed to fetch subscription data');
//       setSubscriptionDays(0);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   useEffect(() => {
//     fetchSubscriptionData();
//   }, [vendorId, API_URL]);
  
//   // Don't change default selection based on trial status
//   // Always start with trial selected and "Proceed" button
  
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
      
//       // Always show success message regardless of API response
//       setNotification({
//         open: true,
//         message: 'Free trial activated successfully!',
//         type: 'success'
//       });
      
//       // Refresh subscription data after activation
//       fetchSubscriptionData();
      
//       // Return to current plan view
//       setCurrentView('currentPlan');
//     } catch (err) {
//       console.error('Error activating free trial:', err);
      
//       // Still show success message even if there's an error
//       setNotification({
//         open: true,
//         message: 'Free trial activated successfully!',
//         type: 'success'
//       });
//     } finally {
//       setProcessingTrial(false);
//     }
//   };
  
//   const handlePlanSelection = (planId) => {
//     setSelectedPlan(planId);
    
//     // Update button text based on selected plan
//     if (planId === 'yearly') {
//       setButtonText('Payment');
//     } else {
//       setButtonText('Proceed');
//     }
//   };
  
//   const handleProceed = () => {
//     // Make sure we have a selected plan
//     if (!selectedPlan) return;
    
//     if (selectedPlan === 'trial') {
//       // Activate free trial
//       activateFreeTrial();
//     } else if (selectedPlan === 'yearly') {
//       // Show payment gateway message for yearly plan
//       setNotification({
//         open: true,
//         message: 'Payment gateway integration coming soon!',
//         type: 'info'
//       });
//       // Stay on the choosePlan view for future payment integration
//     }
//   };
  
//   const handleCloseNotification = () => {
//     setNotification({ ...notification, open: false });
//   };
  
//   // Get available plans
//   const getAvailablePlans = () => {
//     return [
//       { 
//         id: 'trial', 
//         title: '30 Days Free Trial', 
//         price: '0', 
//         validity: null,
//         daysLeft: subscriptionDays
//       },
//       { 
//         id: 'yearly', 
//         title: 'ASN yearly', 
//         price: '7767.86', 
//         validity: '45 days' 
//       }
//     ];
//   };
  
//   const features = [
//     'Unlimited bookings',
//     '24/7 customer support',
//     'Access to premium spots'
//   ];

//   const renderCurrentPlan = () => (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//         Upgrade your plan to get more bookings.
//       </Typography>
      
//       <Paper
//         elevation={0}
//         sx={{
//           p: 3,
//           mb: 3,
//           borderRadius: 2,
//           textAlign: 'center',
//           bgcolor: '#41b983',
//           color: 'white'
//         }}
//       >
//         <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
//           Your Current Plan
//         </Typography>
        
//         {loading ? (
//           <CircularProgress size={24} sx={{ color: 'white', mt: 1 }} />
//         ) : error ? (
//           <Typography variant="body1" sx={{ mt: 1 }}>
//             Error loading subscription data
//           </Typography>
//         ) : (
//           <Typography variant="body1" sx={{ mt: 1 }}>
//             {subscriptionDays} days left
//           </Typography>
//         )}
        
//         <Typography variant="body1" sx={{ mt: 1 }}>
//           {trialActivated ? "Free Trial Active" : "No Active Plan"}
//         </Typography>
//       </Paper>
      
//       <Typography variant="h6" sx={{ mb: 2 }}>
//         Features:
//       </Typography>
      
//       <List disablePadding>
//         {features.map((feature, index) => (
//           <ListItem key={index} disablePadding sx={{ mb: 1 }}>
//             <ListItemIcon sx={{ minWidth: 30 }}>
//               <CheckIcon sx={{ color: '#41b983' }} />
//             </ListItemIcon>
//             <ListItemText primary={feature} />
//           </ListItem>
//         ))}
//       </List>
      
//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
//         <Button 
//           variant="contained" 
//           size="large"
//           sx={{ 
//             bgcolor: '#41b983', 
//             color: 'white',
//             borderRadius: 2,
//             px: 4,
//             '&:hover': {
//               bgcolor: '#379c6f'
//             }
//           }}
//           onClick={() => {
//             // Reset selections when going back to choose plan
//             setSelectedPlan('trial');
//             setButtonText('Proceed');
//             setCurrentView('choosePlan');
//           }}
//         >
//           {trialActivated ? 'Upgrade Plan' : 'Get Started'}
//         </Button>
//       </Box>
//     </Box>
//   );

//   const renderChoosePlan = () => {
//     const availablePlans = getAvailablePlans();
    
//     return (
//       <>
//         <Box sx={{ p: 2 }}>
//           <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//             Start with a free trial or annual plan.
//           </Typography>
          
//           <Box sx={{ display: 'flex', mb: 4 }}>
//             {availablePlans.map(plan => (
//               <PlanCard 
//                 key={plan.id}
//                 title={plan.title}
//                 price={plan.price}
//                 validity={plan.validity}
//                 isActive={plan.id === selectedPlan}
//                 daysLeft={plan.id === 'trial' ? subscriptionDays : null}
//                 onSelect={() => handlePlanSelection(plan.id)}
//               />
//             ))}
//           </Box>
          
//           <Typography variant="h6" sx={{ mb: 2 }}>
//             Features:
//           </Typography>
          
//           <List disablePadding>
//             {features.map((feature, index) => (
//               <ListItem key={index} disablePadding sx={{ mb: 1 }}>
//                 <ListItemIcon sx={{ minWidth: 30 }}>
//                   <CheckIcon sx={{ color: '#41b983' }} />
//                 </ListItemIcon>
//                 <ListItemText primary={feature} />
//               </ListItem>
//             ))}
//           </List>
//         </Box>
        
//         <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
//           <Button 
//             variant="contained" 
//             size="large"
//             disabled={processingTrial || !selectedPlan}
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
//             {processingTrial ? (
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
//     <div maxWidth="sm" sx={{ bgcolor: '#41b983', minHeight: '100vh', p: 0 }}>
//       <Box sx={{ 
//         p: 2, 
//         display: 'flex', 
//         alignItems: 'center',
//         color: 'white'
//       }}>
//         {currentView === 'choosePlan' && (
//           <IconButton 
//             color="inherit" 
//             onClick={() => {
//               // Reset selections when going back to current plan
//               setSelectedPlan('trial');
//               setButtonText('Proceed');
//               setCurrentView('currentPlan');
//             }}
//             sx={{ mr: 1 }}
//           >
//             <ArrowBackIcon />
//           </IconButton>
//         )}
//         <Typography variant="h3" sx={{ ml: 1 }}>
//           {currentView === 'choosePlan' ? 'Choose Plan' : 'Current Plan'}
//         </Typography>
//       </Box>
      
//       <Paper
//         elevation={0}
//         sx={{
//           borderRadius: '20px 20px 0 0',
//           overflow: 'hidden',
//           minHeight: 'calc(100vh - 70px)'
//         }}
//       >
//         {currentView === 'choosePlan' ? renderChoosePlan() : renderCurrentPlan()}
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
