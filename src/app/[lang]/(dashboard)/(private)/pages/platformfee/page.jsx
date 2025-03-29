'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { useParams } from 'next/navigation';

const ParentComponent = () => {
  const { vendorId } = useParams(); // Get vendorId from URL
  console.log("Vendor ID from URL:", vendorId);

  return <VehicleBookingTransactions vendorId={vendorId} />;
};


const VehicleBookingTransactions = ({ vendorId }) => {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  
  // Date state with string format for direct input
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    if (!vendorId) {
      console.error("Vendor ID is missing");
      setSnackbar({
        open: true,
        message: "Vendor ID is missing",
        severity: "error",
      });
      return;
    }
  
    fetchTransactions();
  }, [vendorId]);
  
  

  const fetchTransactions = async () => {
    if (!vendorId) return; // Prevents making the request if vendorId is missing
  
    setIsLoading(true);
    try {
      const response = await axios.get(`https://parkmywheelsapi.onrender.com/vendor/fetchbookingtransaction/${vendorId}`);
  
      if (response.status === 200) {
        const data = response.data.data.bookings;
        
        const processedTransactions = data.map(item => ({
          id: item._id,
          bookingDate: item.bookingDate,
          bookingTime: item.parkingTime,
          bookingId: item._id,
          bookingAmount: item.amount.toString(),
          vehicleType: item.vehicleType,
          platformFee: item.platformfee.toString(),
          receivable: item.receivableAmount.toString(),
        }));
  
        setTransactions(processedTransactions);
      } else {
        setSnackbar({
          open: true,
          message: "Error fetching transactions",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error fetching transactions",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleApplyDateFilter = () => {
    setDateDialogOpen(false)
  }

  // Convert date string to Date object (dd-mm-yyyy format)
  const parseDate = (dateString) => {
    if (!dateString) return null
    const [day, month, year] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // Function to get filtered transactions based on date range
  const getFilteredTransactions = () => {
    if (!startDate || !endDate) return transactions
    
    const startDateObj = parseDate(startDate)
    const endDateObj = parseDate(endDate)
    
    if (!startDateObj || !endDateObj) return transactions
    
    return transactions.filter(transaction => {
      const bookingDateObj = parseDate(transaction.bookingDate)
      if (!bookingDateObj) return false
      
      // Adjust the end date to include the entire day
      const adjustedEndDate = new Date(endDateObj)
      adjustedEndDate.setHours(23, 59, 59, 999)
      
      return bookingDateObj >= startDateObj && bookingDateObj <= adjustedEndDate
    })
  }

  // Calculate total receivable amount
  const getTotalReceivable = () => {
    return getFilteredTransactions().reduce((sum, transaction) => {
      return sum + parseFloat(transaction.receivable)
    }, 0)
  }

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'S.No', width: 80, valueGetter: (params) => params.api.getRowIndex(params.id) + 1 },
    { field: 'bookingId', headerName: 'Booking ID', width: 220 },
    { 
      field: 'bookingAmount', 
      headerName: 'Total Amount', 
      width: 150,
      valueGetter: (params) => `₹${params.value}`
    },
    { 
      field: 'platformFee', 
      headerName: 'Platform Fee', 
      width: 150,
      valueGetter: (params) => `₹${params.value}`
    },
    { 
      field: 'receivable', 
      headerName: 'Receivable', 
      width: 150,
      valueGetter: (params) => `₹${params.value}`
    },
    { 
      field: 'bookingDate', 
      headerName: 'Booking Date', 
      width: 150
    },
    { 
      field: 'vehicleType', 
      headerName: 'Vehicle Type', 
      width: 150
    }
  ]

  // Get filtered transactions
  const filteredData = getFilteredTransactions()

  return (
    <Box sx={{ backgroundColor: '#f4f4f4', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 900, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
            Booking Transactions
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<CalendarMonthIcon />}
                onClick={() => setDateDialogOpen(true)}
              >
                {startDate && endDate 
                  ? `${startDate} to ${endDate}` 
                  : 'Select Date Range'}
              </Button>
              
              <Box sx={{ 
                bgcolor: '#f5f5f5', 
                padding: '8px 16px', 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="body1" fontWeight="bold" color="#329a73">
                  Total: ₹{getTotalReceivable().toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <DataGrid 
            rows={filteredData} 
            columns={columns} 
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            loading={isLoading}
            disableSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#329a73',
                color: 'white'
              },
              mb: 2
            }}
          />
          
          {/* Simple Date Range Dialog */}
          <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)}>
            <DialogTitle>Select Date Range</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2, minWidth: '300px' }}>
                <TextField
                  label="Start Date (DD-MM-YYYY)"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  placeholder="DD-MM-YYYY"
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date (DD-MM-YYYY)"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  placeholder="DD-MM-YYYY"
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleApplyDateFilter} variant="contained" sx={{ mt: 2, borderRadius: 2, py: 1.5 }}>
                Apply
              </Button>
            </DialogActions>
          </Dialog>
          
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
              severity={snackbar.severity} 
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  )
}

export default VehicleBookingTransactions
