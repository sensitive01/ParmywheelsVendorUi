'use client'
import React, { useState, useEffect } from 'react';

import {
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AccountBalanceWallet,
  AccessTime,
  Person,
  Receipt,
  KeyboardArrowUp,
  KeyboardArrowDown
} from '@mui/icons-material';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const Dashboard = () => {
  const [value, setValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const theme = useTheme();
  const PLATFORM_FEE_PERCENTAGE = 20;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('https://api.parkmywheels.com/vendor/getbookingdata/679cbab22cd53a01b512d354');
      const data = await response.json();

      if (data && Array.isArray(data.bookings)) {
        setTransactions(data.bookings); // ✅ Set only the 'bookings' array
      } else {
        setTransactions([]); // ✅ Prevents mapping error
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const calculatePayout = (amount) => {
    const platformFee = (Number(amount) * PLATFORM_FEE_PERCENTAGE) / 100;


    return Number(amount) - platformFee;
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCardExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderCard = (transaction, isPayout = false) => (
    <motion.div
      key={transaction._id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card
        sx={{
          m: 1,
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              Booking ID: {transaction._id.slice(-6)}
            </Typography>
            <IconButton
              onClick={() => handleCardExpand(transaction._id)}
              sx={{ transform: expandedCard === transaction._id ? 'rotate(180deg)' : 'none' }}
            >
              {expandedCard === transaction._id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>
          <Box sx={{ mt: 2 }}>
            <motion.div
              animate={{ height: expandedCard === transaction._id ? 'auto' : 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  Amount: ₹{transaction.amount}
                </Typography>
              </Box>
              {isPayout && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'error.main' }}>
                    <Receipt sx={{ mr: 1 }} />
                    <Typography>
                      Platform Fee ({PLATFORM_FEE_PERCENTAGE}%): ₹{(Number(transaction.amount) * PLATFORM_FEE_PERCENTAGE / 100).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'success.main' }}>
                    <AccountBalanceWallet sx={{ mr: 1 }} />
                    <Typography>
                      Receivable: ₹{calculatePayout(transaction.amount).toFixed(2)}
                    </Typography>
                  </Box>
                </>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  Hours: {transaction.hour}
                </Typography>
              </Box>
              {expandedCard === transaction._id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >

                  <Typography variant="body2" color="textSecondary">
                    Date: {transaction.bookingDate}
                  </Typography>
                </motion.div>
              )}
            </motion.div>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );


  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        sx={{
          '& .MuiTab-root': {
            fontSize: '1.1rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)'
            }
          }
        }}
      >
        <Tab label="Transactions" />
        <Tab label="Payouts" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <AnimatePresence>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2
          }}>
            {transactions.map(transaction => renderCard(transaction))}
          </Box>
        </AnimatePresence>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AnimatePresence>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2
          }}>
            {transactions.map(transaction => renderCard(transaction, true))}
          </Box>
        </AnimatePresence>
      </TabPanel>
    </Box>
  );
};

export default Dashboard;
