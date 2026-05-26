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
  useTheme,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AccountBalanceWallet,
  AccessTime,
  Person,
  Receipt,
  KeyboardArrowUp,
  KeyboardArrowDown,
  LocationOn
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.parkmywheels.com';

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
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // Default to last 30 days
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedSubunit, setSelectedSubunit] = useState('all'); // 'all', 'main', or subunit ID
  const [subunits, setSubunits] = useState([]);

  const { data: session } = useSession();
  const theme = useTheme();
  const PLATFORM_FEE_PERCENTAGE = 20;

  const vendorId = session?.user?.id || '679cbab22cd53a01b512d354';

  useEffect(() => {
    if (vendorId) {
      fetchTransactions(vendorId);
    }
  }, [vendorId]);

  const fetchTransactions = async (vId) => {
    setLoading(true);
    try {
      const targetVendorId = vId || vendorId;
      // 1. Fetch main bookings
      const mainResponse = await fetch(`${API_URL}/vendor/getbookingdata/${targetVendorId}`);
      const mainData = await mainResponse.json();
      const mainBookings = mainData.bookings || [];
      mainBookings.forEach(b => {
        b.subunitName = 'Main Location';
      });

      // 2. Fetch subunits list
      let merged = [...mainBookings];
      try {
        const subRes = await fetch(`${API_URL}/vendor/subunits/${targetVendorId}`);
        const subData = await subRes.json();
        const subunitsList = subData.data || [];
        setSubunits(subunitsList);

        if (subunitsList.length > 0) {
          const subunitBookingsPromises = subunitsList.map(async (sub) => {
            try {
              const subRes = await fetch(`${API_URL}/vendor/getbookingdata/${sub.id}`);
              const subData = await subRes.json();
              const bookings = subData.bookings || [];
              bookings.forEach(b => {
                b.subunitName = sub.name;
              });
              return bookings;
            } catch (err) {
              console.error(`Error fetching bookings for subunit ${sub.name}:`, err);
              return [];
            }
          });
          const allSubunitBookings = await Promise.all(subunitBookingsPromises);
          merged = [...merged, ...allSubunitBookings.flat()];
        }
      } catch (subErr) {
        console.error('Error fetching subunits:', subErr);
      }

      // Deduplicate by invoiceid (or _id if missing)
      const uniqueInvoices = new Set();
      const uniqueBookings = [];
      merged.forEach(item => {
        const key = item.invoiceid || item._id;
        if (!uniqueInvoices.has(key)) {
          uniqueInvoices.add(key);
          uniqueBookings.push(item);
        }
      });

      // Sort by booking date descending
      const parseDateForSorting = (dateStr, timeStr) => {
        if (!dateStr) return 0;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const time = timeStr ? timeStr.split(' ')[0] : '00:00';
          let [h, m] = time.split(':').map(Number);
          if (timeStr && timeStr.toLowerCase().includes('pm') && h !== 12) h += 12;
          if (timeStr && timeStr.toLowerCase().includes('am') && h === 12) h = 0;
          return new Date(parts[2], parts[1] - 1, parts[0], h || 0, m || 0).getTime();
        }
        return new Date(dateStr).getTime();
      };

      uniqueBookings.sort((a, b) => {
        return parseDateForSorting(b.bookingDate, b.bookingTime) - parseDateForSorting(a.bookingDate, a.bookingTime);
      });

      setTransactions(uniqueBookings);
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

  const parseBookingDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
  };

  const filteredTransactions = transactions.filter(t => {
    // 1. Filter by Subunit
    if (selectedSubunit === 'main') {
      if (t.subunitName !== 'Main Location') return false;
    } else if (selectedSubunit !== 'all') {
      const selectedSubObj = subunits.find(s => String(s.id) === String(selectedSubunit));
      if (!selectedSubObj || t.subunitName !== selectedSubObj.name) return false;
    }

    // 2. Filter by Date
    if (t.bookingDate) {
      const bDate = parseBookingDate(t.bookingDate);
      bDate.setHours(0, 0, 0, 0);

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (bDate < start || bDate > end) return false;
    }

    return true;
  });

  const totalBookings = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalPayout = filteredTransactions.reduce((sum, t) => sum + calculatePayout(t.amount), 0);

  const subunitBreakdown = {};
  filteredTransactions.forEach(t => {
    const loc = t.subunitName || 'Main Location';
    if (!subunitBreakdown[loc]) {
      subunitBreakdown[loc] = { bookings: 0, amount: 0, payout: 0 };
    }
    subunitBreakdown[loc].bookings += 1;
    const amt = parseFloat(t.amount) || 0;
    subunitBreakdown[loc].amount += amt;
    subunitBreakdown[loc].payout += calculatePayout(t.amount);
  });

  const handleDownloadPdf = () => {
    const formatDisplayDate = (dateStr) => {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const breakdownRows = Object.entries(subunitBreakdown).map(([location, data]) => `
      <tr>
        <td>${location}</td>
        <td class="text-right">${data.bookings}</td>
        <td class="text-right">₹${data.amount.toFixed(2)}</td>
        <td class="text-right">₹${data.payout.toFixed(2)}</td>
      </tr>
    `).join('');

    const detailedRows = filteredTransactions.map((t, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${t.invoiceid}</td>
        <td>${t.subunitName || 'Main Location'}</td>
        <td>${t.bookingDate} ${t.bookingTime || ''}</td>
        <td>${t.hour || 'N/A'}</td>
        <td class="text-right">₹${parseFloat(t.amount || 0).toFixed(2)}</td>
        <td class="text-right">₹${(parseFloat(t.amount || 0) * PLATFORM_FEE_PERCENTAGE / 100).toFixed(2)}</td>
        <td class="text-right">₹${calculatePayout(t.amount).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Transactions & Payouts Report</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #333;
              margin: 30px;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #666cff;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            .header-title h1 {
              margin: 0;
              color: #666cff;
              font-size: 24px;
            }
            .header-title p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .date-range {
              font-size: 14px;
              color: #555;
              text-align: right;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .card {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .card-title {
              font-size: 12px;
              text-transform: uppercase;
              color: #6c757d;
              margin-bottom: 5px;
              font-weight: 600;
            }
            .card-value {
              font-size: 20px;
              font-weight: 700;
              color: #212529;
            }
            h2 {
              font-size: 16px;
              color: #495057;
              border-bottom: 1px solid #dee2e6;
              padding-bottom: 8px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #dee2e6;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f1f3f5;
              color: #495057;
              font-weight: 600;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
              background-color: #e9ecef;
            }
            @media print {
              body {
                margin: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="header-title">
              <h1>Transactions & Payouts Report</h1>
              <p>ParkMyWheels POS Smart Dashboard</p>
            </div>
            <div class="date-range">
              Report Period:<br>
              <strong>${formatDisplayDate(startDate)}</strong> to <strong>${formatDisplayDate(endDate)}</strong>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-title">Total Bookings</div>
              <div class="card-value">${totalBookings}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Gross Amount</div>
              <div class="card-value">₹${totalAmount.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Payout Receivable</div>
              <div class="card-value" style="color: #2e7d32;">₹${totalPayout.toFixed(2)}</div>
            </div>
          </div>

          <h2>Subunit Wise Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Subunit / Location</th>
                <th class="text-right">Total Bookings</th>
                <th class="text-right">Gross Revenue</th>
                <th class="text-right">Receivable Payout</th>
              </tr>
            </thead>
            <tbody>
              ${breakdownRows}
              <tr class="total-row">
                <td>Total Summary</td>
                <td class="text-right">${totalBookings}</td>
                <td class="text-right">₹${totalAmount.toFixed(2)}</td>
                <td class="text-right">₹${totalPayout.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <h2>Detailed Transactions List</h2>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Booking ID</th>
                <th>Subunit/Location</th>
                <th>Date & Time</th>
                <th>Hours</th>
                <th class="text-right">Gross Amount</th>
                <th class="text-right">Platform Fee (${PLATFORM_FEE_PERCENTAGE}%)</th>
                <th class="text-right">Receivable</th>
              </tr>
            </thead>
            <tbody>
              ${detailedRows}
              <tr class="total-row">
                <td colspan="5">Grand Total</td>
                <td class="text-right">₹${totalAmount.toFixed(2)}</td>
                <td class="text-right">₹ ${(totalAmount * PLATFORM_FEE_PERCENTAGE / 100).toFixed(2)}</td>
                <td class="text-right">₹${totalPayout.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(htmlContent);
      win.document.close();
    } else {
      alert('Pop-up blocked! Please allow pop-ups to generate PDF.');
    }
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
              Booking ID : {transaction.invoiceid.slice(-6)}
            </Typography>
            <IconButton
              onClick={() => handleCardExpand(transaction.invoiceid)}
              sx={{ transform: expandedCard === transaction.invoiceid ? 'rotate(180deg)' : 'none' }}
            >
              {expandedCard === transaction.invoiceid ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>
          <Box sx={{ mt: 2 }}>
            <motion.div
              animate={{ height: expandedCard === transaction.invoiceid ? 'auto' : 'auto' }}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between', flexWrap: 'nowrap', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                        <Receipt sx={{ mr: 1, }} />
                        <Typography>
                          Platform Fee ({PLATFORM_FEE_PERCENTAGE}%): ₹{(Number(transaction.amount) * PLATFORM_FEE_PERCENTAGE / 100).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                        <AccountBalanceWallet sx={{ mr: 1 }} />
                        <Typography>
                          Receivable: ₹{calculatePayout(transaction.amount).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                </>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  Hours: {transaction.hour}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  Location: {transaction.subunitName || 'Main Location'}
                </Typography>
              </Box>
              {expandedCard === transaction.invoiceid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}
                >
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Date: {transaction.bookingDate} {transaction.bookingTime || ''}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Vehicle: {transaction.vehicleNumber || 'N/A'} ({transaction.vehicleType || 'N/A'})
                  </Typography>
                  {transaction.personName && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Customer: {transaction.personName}
                    </Typography>
                  )}
                  {transaction.mobileNumber && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Mobile: {transaction.mobileNumber}
                    </Typography>
                  )}
                  {transaction.paymentMode && (
                    <Typography variant="body2" color="textSecondary">
                      Payment: {transaction.paymentMode} ({transaction.paymentType || 'On Entry'})
                    </Typography>
                  )}
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
      {/* Title */}
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#333' }}>
        Transactions & Payouts Report
      </Typography>

      {/* Filters Card */}
      <Card sx={{ mb: 4, p: 1, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="subunit-select-label">Location / Subunit</InputLabel>
                <Select
                  labelId="subunit-select-label"
                  value={selectedSubunit}
                  label="Location / Subunit"
                  onChange={(e) => setSelectedSubunit(e.target.value)}
                >
                  <MenuItem value="all">All Locations (Main + Subunits)</MenuItem>
                  <MenuItem value="main">Main Location</MenuItem>
                  {subunits.map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.name} (Subunit)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleDownloadPdf}
                startIcon={<Receipt />}
                sx={{
                  bgcolor: '#666cff',
                  height: 40,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#5555e0' }
                }}
              >
                Download PDF Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Auto Sum Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f4f5fa', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
              TOTAL BOOKINGS
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {totalBookings}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f4f5fa', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
              TOTAL GROSS AMOUNT
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main' }}>
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
              TOTAL PAYOUT RECEIVABLE
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
              ₹{totalPayout.toFixed(2)}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        sx={{
          mb: 2,
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
            {filteredTransactions.map(transaction => renderCard(transaction))}
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
            {filteredTransactions.map(transaction => renderCard(transaction, true))}
          </Box>
        </AnimatePresence>
      </TabPanel>
    </Box>
  );
};

export default Dashboard;
