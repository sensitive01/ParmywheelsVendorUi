"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DataGrid } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";

const VehicleBookingTransactions = () => {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };
  const getTotalReceivable = () => {
    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.receivable.replace("₹", "")) || 0;
      return total + amount;
    }, 0);
  };
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchTransactions(session.user.id, true);
    } else if (status === "unauthenticated") {
      setSnackbar({
        open: true,
        message: "Please login to view your transactions",
        severity: "warning",
      });
    }
  }, [status, session]);
  const fetchTransactions = async (vendorId, dateFilter = false) => {
    if (!vendorId) return;

    setIsLoading(true);
    try {
      let url = `https://parkmywheelsapi.onrender.com/vendor/fetchbookingtransaction/${vendorId}`;
      if (dateFilter && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get(url);

      if (response.status === 200) {
        const data = response.data.data.bookings.map((item, index) => ({
          id: item._id,
          serialNo: index + 1,
          // bookingDate: new Date(item.bookingDate).toLocaleDateString(),
          bookingId: item._id,
          bookingAmount: `₹${item.amount}`,
          // vehicleType: item.vehicleType,
          platformFee: `₹${item.platformfee}`,
          receivable: `₹${item.receivableAmount}`,
        }));

        setTransactions(data);
      } else {
        setSnackbar({
          open: true,
          message: "Error fetching transactions: " + response.statusText,
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching transactions: " + error.message,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleApplyDateFilter = () => {
    if (session?.user?.id) {
      fetchTransactions(session.user.id, true);
    }
    setDateDialogOpen(false);
  };
  const handleClearFilters = () => {
    const currentDate = getCurrentDate();
    setStartDate(currentDate);
    setEndDate(currentDate);
    if (session?.user?.id) {
      fetchTransactions(session.user.id, true);
    }
    setDateDialogOpen(false);
  };

  const columns = [
    { field: "serialNo", headerName: "S.No", width: 80 },
    { field: "bookingId", headerName: "Booking ID", width: 220 },
    { field: "bookingAmount", headerName: "Total Amount", width: 150 },
    { field: "platformFee", headerName: "Platform Fee", width: 150 },
    { field: "receivable", headerName: "Receivable", width: 150 },
    // { field: "bookingDate", headerName: "Booking Date", width: 150 },
    // { field: "vehicleType", headerName: "Vehicle Type", width: 150 },
  ];

  return (
    <Box sx={{ backgroundColor: "#f4f4f4", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 900, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
            Booking Transactions 
            {/* {session?.user?.id && (
              <Typography component="span" color="text.secondary" fontSize="0.8em">
                {` (Vendor: ${session.user.id.substr(0, 8)}...)`}
              </Typography>
            )} */}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<CalendarMonthIcon />}
              onClick={() => setDateDialogOpen(true)}
              size="small"
            >
              Filter Dates
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                bgcolor: '#f5f5f5', 
                padding: '6px 12px', 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="body2" fontWeight="bold" color="#329a73">
                  Total: ₹{getTotalReceivable().toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ 
                bgcolor: '#f0f8ff', 
                padding: '6px 12px', 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="body2" fontWeight="medium" color="#1976d2">
                  {`${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {status === "loading" || isLoading ? (
            <Typography sx={{ textAlign: "center", color: "gray" }}>Loading transactions...</Typography>
          ) : status === "unauthenticated" ? (
            <Typography sx={{ textAlign: "center", color: "gray" }}>Please login to view your transactions</Typography>
          ) : transactions.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "gray" }}>No transactions found.</Typography>
          ) : (
            <DataGrid 
              rows={transactions} 
              columns={columns}
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#329a73", color: "black" },
                mb: 2,
                borderRadius: 2,
              }}
            />
          )}
          <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)}>
            <DialogTitle>Filter Transactions by Date</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: '300px' }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClearFilters} color="secondary">
                Reset to Today
              </Button>
              <Button onClick={handleApplyDateFilter} color="primary" variant="contained">
                Apply
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert 
              onClose={() => setSnackbar({ ...snackbar, open: false })} 
              severity={snackbar.severity} 
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VehicleBookingTransactions;
