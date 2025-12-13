'use client'

import { useState, useEffect } from 'react'

import axios from 'axios'
import { useSession } from 'next-auth/react'
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
  Alert,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'

const loadRazorpay = () => {
  return new Promise(resolve => {
    if (window.Razorpay) {
      resolve(true)

      return
    }

    const script = document.createElement('script')

    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true

    script.onload = () => {
      resolve(true)
    }

    script.onerror = () => {
      console.error('Failed to load Razorpay SDK')
      resolve(false)
    }

    document.body.appendChild(script)
  })
}

const PlanCard = ({ title, price, validity, isActive, onSelect }) => (
  <Card
    elevation={isActive ? 8 : 1}
    sx={{
      height: '100%',
      borderRadius: 4,
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: isActive ? '2px solid #41b983' : '1px solid #e0e0e0',
      bgcolor: isActive ? '#f0fdf4' : 'white',
      position: 'relative',
      overflow: 'visible',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        borderColor: '#41b983'
      }
    }}
    onClick={onSelect}
  >
    {isActive && (
      <Box
        sx={{
          position: 'absolute',
          top: -12,
          right: 20,
          bgcolor: '#41b983',
          color: 'white',
          px: 1.5,
          py: 0.5,
          borderRadius: 10,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(65, 185, 131, 0.3)'
        }}
      >
        SELECTED
      </Box>
    )}
    <CardContent sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h6' sx={{ color: isActive ? '#2d3748' : '#718096', mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>

      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
        <Typography variant='h3' sx={{ fontWeight: 800, color: '#2d3748' }}>
          ₹{price}
        </Typography>
        {/* <Typography variant="subtitle1" sx={{ color: '#718096', ml: 1 }}>/ {validity}</Typography> */}
      </Box>

      <Chip
        label={`Validity: ${validity}`}
        size='small'
        sx={{
          alignSelf: 'center',
          bgcolor: isActive ? '#c6f6d5' : '#edf2f7',
          color: isActive ? '#22543d' : '#4a5568',
          fontWeight: 500
        }}
      />
    </CardContent>
  </Card>
)

const SubscriptionPlan = () => {
  const [currentView, setCurrentView] = useState('currentPlan')
  const [subscriptionDays, setSubscriptionDays] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' })
  const [processingTrial, setProcessingTrial] = useState(false)
  const [trialActivated, setTrialActivated] = useState(false)
  const [buttonText, setButtonText] = useState('Proceed')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [latestPayment, setLatestPayment] = useState(null)
  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session } = useSession()
  const vendorId = session?.user?.id

  const fetchSubscriptionData = async () => {
    if (!vendorId) {
      setLoading(false)

      return
    }

    try {
      setLoading(true)
      console.log(`Fetching subscription data from: ${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`)
      const subscriptionResponse = await axios.get(`${API_URL}/vendor/fetchsubscriptionleft/${vendorId}`)

      console.log('Subscription API Response:', subscriptionResponse.data)

      console.log(`Fetching trial status from: ${API_URL}/vendor/fetchtrial/${vendorId}`)
      const trialResponse = await axios.get(`${API_URL}/vendor/fetchtrial/${vendorId}`)

      console.log('Trial API Response:', trialResponse.data)

      console.log(`Fetching plans from: ${API_URL}/admin/getvendorplan`)
      const plansResponse = await axios.get(`${API_URL}/admin/getvendorplan/${vendorId}`)

      console.log('Plans API Response:', plansResponse.data)

      if (subscriptionResponse.data && subscriptionResponse.data.subscriptionleft !== undefined) {
        setSubscriptionDays(subscriptionResponse.data.subscriptionleft)
      } else {
        setSubscriptionDays(0)
      }

      if (trialResponse.data && trialResponse.data.trial === 'true') {
        setTrialActivated(true)

        // If the backend doesn't provide trial details, we might want to handle this differently
        // or expect the backend to include the trial plan in the 'plans' list or specific API.
        // For now, removing the hardcoded full details as requested.
        setActivePlan({
          id: 'trial',
          title: 'Free Trial',
          price: '0',
          validity: '30 days',
          planId: 'trial_plan',
          features: [] // No hardcoded features
        })
      } else {
        setTrialActivated(false)
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
        }))

        setPlans(formattedPlans)
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err)
      setError('Failed to fetch subscription data')
      setSubscriptionDays(0)
    } finally {
      setLoading(false)
    }
  }

  const activateFreeTrial = async () => {
    if (!vendorId) {
      setNotification({
        open: true,
        message: 'User session not found. Please log in again.',
        type: 'error'
      })

      return
    }

    setProcessingTrial(true)

    try {
      console.log(`Activating free trial for: ${API_URL}/vendor/freetrial/${vendorId}`)
      const response = await axios.put(`${API_URL}/vendor/freetrial/${vendorId}`)

      console.log('Free Trial Activation Response:', response.data)

      if (response.data && response.data.message) {
        await logPayment('trial_plan', '0', 'Free Trial Activation', 'success')

        setNotification({
          open: true,
          message: 'Free trial activated successfully!',
          type: 'success'
        })

        setTrialActivated(true)
        setSubscriptionDays(30)
        setActivePlan({
          id: 'trial',
          title: 'Free Trial',
          price: '0',
          validity: '30 days',
          planId: 'trial_plan',
          features: []
        })

        fetchSubscriptionData()
        setCurrentView('currentPlan')
      }
    } catch (err) {
      console.error('Error activating free trial:', err)
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to activate free trial',
        type: 'error'
      })
    } finally {
      setProcessingTrial(false)
    }
  }

  const initiateRazorpayPayment = async (planId, amountInPaisa) => {
    if (!vendorId) {
      setNotification({
        open: true,
        message: 'User session not found. Please log in again.',
        type: 'error'
      })

      return false
    }

    setProcessingPayment(true)

    try {
      const razorpayLoaded = await loadRazorpay()

      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay SDK')
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
        handler: async function (response) {
          try {
            const paymentDetails = {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id || `order_${Date.now()}`,
              signature: response.razorpay_signature || '',
              plan_id: planId,
              amount: (amountInPaisa / 100).toString(), // Store in rupees in database
              transaction_name: 'Plan Purchase',
              payment_status: 'success'
            }

            const saveResponse = await axios.post(`${API_URL}/vendor/sucesspay/${vendorId}`, paymentDetails)

            console.log('success pay', saveResponse)

            if (saveResponse.data && saveResponse.data.payment) {
              setLatestPayment(saveResponse.data.payment)

              const selectedPlanData = plans.find(plan => plan.planId === planId)
              let daysToAdd = 0

              if (selectedPlanData) {
                const validityMatch = selectedPlanData.validity.match(/^(\d+)/)

                if (validityMatch && validityMatch[1]) {
                  daysToAdd = parseInt(validityMatch[1])
                }
              }

              if (daysToAdd > 0) {
                try {
                  const addDaysResponse = await axios.post(`${API_URL}/vendor/addExtraDays/${vendorId}`, {
                    extraDays: daysToAdd
                  })

                  console.log('Add extra days response:', addDaysResponse.data)

                  if (addDaysResponse.data && addDaysResponse.data.vendorDetails) {
                    setSubscriptionDays(parseInt(addDaysResponse.data.vendorDetails.subscriptionleft))
                  }
                } catch (addDaysErr) {
                  console.error('Error adding extra days:', addDaysErr)
                }
              }

              setNotification({
                open: true,
                message: `Payment processed successfully! Amount: ₹${amountInPaisa / 100}`,
                type: 'success'
              })

              const newActivePlan = plans.find(plan => plan.planId === planId)

              if (newActivePlan) {
                setActivePlan(newActivePlan)
              }

              fetchSubscriptionData()
              setCurrentView('currentPlan')
            }
          } catch (err) {
            console.error('Error saving payment:', err)
            setNotification({
              open: true,
              message: 'Payment completed but failed to save. Please contact support.',
              type: 'warning'
            })
          } finally {
            setProcessingPayment(false)
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false)
            console.log('Payment window dismissed')
          }
        }
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', async function (response) {
        console.error('Payment failed:', response.error)

        await logPayment(planId, (amountInPaisa / 100).toString(), 'Plan Purchase', 'failed')

        setNotification({
          open: true,
          message: `Payment failed: ${response.error.description}`,
          type: 'error'
        })
        setProcessingPayment(false)
      })

      rzp.open()

      return true
    } catch (err) {
      console.error('Error processing payment:', err)
      await logPayment(planId, (amountInPaisa / 100).toString(), 'Plan Purchase', 'error')
      setNotification({
        open: true,
        message: err.message || 'Payment failed. Please try again.',
        type: 'error'
      })
      setProcessingPayment(false)

      return false
    }
  }

  const logPayment = async (planId, amount, transactionName, status) => {
    try {
      const paymentLogData = {
        payment_id: status === 'success' ? `manual_${Date.now()}` : '',
        order_id: status === 'success' ? `manual_${Date.now()}` : '',
        plan_id: planId,
        amount: amount,
        transaction_name: transactionName,
        payment_status: status
      }

      const response = await axios.post(`${API_URL}/vendor/log/${vendorId}`, paymentLogData)

      console.log('payment log', response)

      console.log('Payment Log Response:', response.data)

      return true
    } catch (err) {
      console.error('Error logging payment:', err)

      return false
    }
  }

  const handlePlanSelection = planId => {
    setSelectedPlan(planId)

    if (planId === 'trial') {
      setButtonText('Activate Trial')
    } else {
      setButtonText('Pay Now')
    }
  }

  const handleProceed = async () => {
    if (!selectedPlan) return

    if (selectedPlan === 'trial') {
      activateFreeTrial()
    } else {
      const selectedPlanData = plans.find(plan => plan.id === selectedPlan)

      if (!selectedPlanData) return

      // Use the pre-calculated amountInPaisa
      await initiateRazorpayPayment(selectedPlanData.planId, selectedPlanData.amountInPaisa)
    }
  }

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  const getAvailablePlans = () => {
    return trialActivated ? plans.filter(plan => plan.id !== 'trial') : plans
  }

  useEffect(() => {
    fetchSubscriptionData()
    loadRazorpay().then(loaded => {
      if (!loaded) {
        console.warn('Razorpay SDK failed to load. Payment may not work properly.')
      }
    })
  }, [vendorId, API_URL])

  useEffect(() => {
    if (plans.length > 0) {
      if (trialActivated && plans.some(plan => plan.id !== 'trial')) {
        const nonTrialPlan = plans.find(plan => plan.id !== 'trial')

        if (nonTrialPlan) {
          setSelectedPlan(nonTrialPlan.id)
          setButtonText('Pay Now')
        }
      } else {
        const trialPlan = plans.find(plan => plan.id === 'trial')

        if (trialPlan) {
          setSelectedPlan('trial')
          setButtonText('Activate Trial')
        } else if (plans.length > 0) {
          setSelectedPlan(plans[0].id)
          setButtonText('Pay Now')
        }
      }
    }
  }, [plans, trialActivated])

  const formatDate = dateString => {
    const date = new Date(dateString)

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const renderCurrentPlan = () => {
    const currentFeatures = activePlan?.features || []

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
          {subscriptionDays > 0 ? 'Your subscription is active.' : 'Upgrade your plan to get more bookings.'}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            textAlign: 'center',
            background: subscriptionDays > 0 ? 'linear-gradient(135deg, #41b983 0%, #369a6e 100%)' : '#f8f9fa',
            color: subscriptionDays > 0 ? 'white' : 'text.primary',
            boxShadow: subscriptionDays > 0 ? '0 10px 20px rgba(65, 185, 131, 0.3)' : 'none',
            border: subscriptionDays > 0 ? 'none' : '1px dashed #cbd5e0'
          }}
        >
          <Typography variant='h6' component='div' sx={{ fontWeight: 600, opacity: 0.9 }}>
            Your Current Plan
          </Typography>

          {loading ? (
            <CircularProgress size={24} sx={{ color: subscriptionDays > 0 ? 'white' : '#41b983', mt: 2 }} />
          ) : error ? (
            <Typography variant='body1' sx={{ mt: 2 }}>
              Error loading subscription data
            </Typography>
          ) : (
            <Typography variant='h2' sx={{ mt: 2, mb: 1, fontWeight: 800 }}>
              {subscriptionDays}{' '}
              <Typography component='span' variant='h5' sx={{ opacity: 0.8 }}>
                days left
              </Typography>
            </Typography>
          )}

          <Typography variant='body1' sx={{ mt: 2, opacity: 0.9, fontWeight: 500 }}>
            {subscriptionDays > 0 ? 'Need to extend?' : 'No active plan'}
          </Typography>

          {subscriptionDays <= 0 && (
            <Button
              variant='contained'
              sx={{ mt: 3, bgcolor: '#41b983', '&:hover': { bgcolor: '#369a6e' } }}
              onClick={() => setCurrentView('choosePlan')}
            >
              Get Started
            </Button>
          )}
        </Paper>

        <Typography variant='h6' sx={{ mb: 2 }}>
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
            <Typography variant='h6' sx={{ mb: 2 }}>
              Latest Transaction
            </Typography>

            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                {latestPayment.transactionName || 'Plan Purchase'}
              </Typography>
              <Typography variant='body2'>
                Status:{' '}
                <span style={{ color: latestPayment.paymentStatus === 'success' ? '#41b983' : '#f44336' }}>
                  {latestPayment.paymentStatus || 'Unknown'}
                </span>
              </Typography>
              <Typography variant='body2'>Amount: ₹{latestPayment.amount || '0'}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Date: {latestPayment.createdAt ? formatDate(latestPayment.createdAt) : 'Unknown'}
              </Typography>
            </Paper>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant='contained'
            size='large'
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
    )
  }

  const renderChoosePlan = () => {
    const availablePlans = getAvailablePlans()

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
          {trialActivated ? 'Select the best plan for you.' : 'Start with a free trial or monthly plan.'}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 6 }}>
          {availablePlans.map(plan => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <PlanCard
                title={plan.title}
                price={plan.price}
                validity={plan.validity}
                isActive={plan.id === selectedPlan}
                onSelect={() => handlePlanSelection(plan.id)}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mb: 4 }}>
          <Typography variant='h6' sx={{ mb: 2, fontWeight: 700, color: '#2d3748' }}>
            {selectedPlan ? 'Included Features:' : 'Plan Features:'}
          </Typography>

          <Grid container spacing={2}>
            {selectedPlan &&
              availablePlans
                .find(p => p.id === selectedPlan)
                ?.features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                       <CheckIcon sx={{ color: '#41b983', mr: 2 }} />
                       <Typography variant="body1">{feature}</Typography>
                    </Box>
                  </Grid>
                ))}
          </Grid>
        </Box>

        <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 6,
              borderRadius: 4,
              bgcolor: '#f8f9fa',
              border: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Typography variant='body2' color='text.secondary' sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#718096', mr: 1 }} />
              All payments are processed securely by Razorpay
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#718096', mr: 1 }} />
              Your payment information is never stored on our servers
            </Typography>
            {subscriptionDays > 0 && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1, fontWeight: 'bold', color: '#2d3748', display: 'flex', alignItems: 'center' }}>
                 <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#41b983', mr: 1 }} />
                 Your existing subscription ({subscriptionDays} days) will be extended
              </Typography>
            )}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, alignItems: 'center' }}>
          <Button
            variant='outlined'
            onClick={() => setCurrentView('currentPlan')}
            sx={{
              borderColor: '#cbd5e0',
              color: '#718096',
              borderRadius: 30,
              px: 4,
              py: 1,
              '&:hover': {
                borderColor: '#a0aec0',
                bgcolor: '#f7fafc',
                color: '#4a5568'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            size='large'
            disabled={processingTrial || processingPayment || !selectedPlan}
            sx={{
              bgcolor: '#41b983',
              color: 'white',
              borderRadius: 30,
              px: 6,
              py: 1.5,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(65, 185, 131, 0.4)',
              '&:hover': {
                 bgcolor: '#369a6e',
                 transform: 'translateY(-2px)',
                 boxShadow: '0 6px 20px rgba(65, 185, 131, 0.6)'
              },
              '&.Mui-disabled': {
                bgcolor: '#a0aec0',
                color: 'white'
              }
            }}
            onClick={handleProceed}
          >
            {processingTrial || processingPayment ? <CircularProgress size={24} sx={{ color: 'white' }} /> : buttonText}
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <div style={{ margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          bgcolor: '#41b983',
          color: 'white',
          borderRadius: '0 0 16px 16px'
        }}
      >
        {currentView === 'choosePlan' && (
          <IconButton color='inherit' onClick={() => setCurrentView('currentPlan')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant='h3' sx={{ ml: currentView === 'choosePlan' ? 0 : 1 }}>
          {currentView === 'choosePlan' ? 'Choose Plan' : 'Subscription'}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            minHeight: '80vh',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress size={50} sx={{ color: '#41b983' }} />
            </Box>
          ) : currentView === 'choosePlan' ? (
            renderChoosePlan()
          ) : (
            renderCurrentPlan()
          )}
        </Paper>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default SubscriptionPlan
