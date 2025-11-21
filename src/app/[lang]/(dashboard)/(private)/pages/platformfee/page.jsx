"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DataGrid } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";

const VehicleBookingTransactions = () => {
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [useDateFilter, setUseDateFilter] = useState(true);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDateNDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getDateNDaysAgo(14));
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

  // Parse date strings in formats: YYYY-MM-DD, DD-MM-YYYY, or ISO
  const parseToDate = (str) => {
    if (!str) return null;
    if (str.includes('T')) return new Date(str);
    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(str);
      } else {
        // DD-MM-YYYY
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}`);
      }
    }
    return null;
  };

  // Decide which date field to use for filtering
  const getItemDate = (item) => item.parkingDate || item.bookingDate || item.createdAt || null;

  const getTotalReceivable = () => {
    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.receivable.replace("₹", "")) || 0;
      return total + amount;
    }, 0);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchTransactions(session.user.id, useDateFilter);
    } else if (status === "unauthenticated") {
      setSnackbar({
        open: true,
        message: "Please login to view your transactions",
        severity: "warning",
      });
    }
  }, [status, session, useDateFilter]);

  const fetchTransactions = async (vendorId, dateFilter = false) => {
    if (!vendorId) return;

    setIsLoading(true);

    try {
      let url = `${NEXT_PUBLIC_API_URL}/vendor/fetchbookingtransaction/${vendorId}`;

      if (dateFilter && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get(url);

      if (response.status === 200) {
        const raw = response.data?.data?.bookings || [];
        console.log("raw", raw.length)

        // Apply client-side filtering if dateFilter is true
        let filtered = raw;
        if (dateFilter && startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filtered = raw.filter(item => {
            const d = parseToDate(getItemDate(item));
            return d && d >= start && d <= end;
          });
        }

        // Sort newest first using parkingDate -> bookingDate -> createdAt
        filtered.sort((a, b) => {
          const ad = parseToDate(getItemDate(a)) || 0
          const bd = parseToDate(getItemDate(b)) || 0
          return bd - ad
        })

        const data = filtered.map((item, index) => ({
          id: item._id,
          serialNo: index + 1,
          bookingId: item._id,
          parkingDate: item.parkingDate || "N/A",
          parkingTime: item.parkingTime || "N/A",
          bookingAmount: `₹${item.amount}`,
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
      setUseDateFilter(true);
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

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadClose = () => {
    setAnchorEl(null);
  };

  const exportToExcel = () => {
    if (transactions.length === 0) {
      setSnackbar({
        open: true,
        message: "No data to export",
        severity: "warning",
      });
      return;
    }

    // Create CSV content
    const headers = ["S.No", "Booking ID", "Date", "Time", "Amount", "Platform Fee", "Receivable"];
    const rows = transactions.map(t => [
      t.serialNo,
      t.bookingId,
      t.parkingDate,
      t.parkingTime,
      t.bookingAmount,
      t.platformFee,
      t.receivable
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleDownloadClose();
  };

  const exportToPDF = () => {
    if (transactions.length === 0) {
      setSnackbar({
        open: true,
        message: "No data to export",
        severity: "warning",
      });
      return;
    }

    // Create a simple HTML table for PDF
    const htmlContent = `
  <html>
    <head>
      <title>Transactions Report</title>
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .title { text-align: center; margin-bottom: 20px; }
        .date-range { margin-bottom: 20px; }
        .total { margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1 class="title">Booking Transactions Report</h1>
      <div class="date-range">Date Range: ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}</div>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Booking ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Amount</th>
            <th>Platform Fee</th>
            <th>Receivable</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr>
              <td>${t.serialNo}</td>
              <td>${t.bookingId}</td>
              <td>${t.parkingDate}</td>
              <td>${t.parkingTime}</td>
              <td>${t.bookingAmount}</td>
              <td>${t.platformFee}</td>
              <td>${t.receivable}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total">Total Receivable: ₹${getTotalReceivable().toFixed(2)}</div>
    </body>
  </html>
`;

    // Open print dialog which allows saving as PDF
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 1000);

    handleDownloadClose();
  };

  const columns = [
    { field: "serialNo", headerName: "S.No", width: 90 },
    { field: "bookingId", headerName: "Booking ID", flex: 1, minWidth: 200 },
    { field: "parkingDate", headerName: "Date", flex: 0.6, minWidth: 120 },
    { field: "parkingTime", headerName: "Time", flex: 0.5, minWidth: 110 },
    { field: "bookingAmount", headerName: "Amount", flex: 0.6, minWidth: 140 },
    { field: "platformFee", headerName: "Platform Fee", flex: 0.6, minWidth: 140 },
    { field: "receivable", headerName: "Receivable", flex: 0.6, minWidth: 140 },
  ];

  return (
    <Box sx={{ backgroundColor: "#f4f4f4", minHeight: "100vh", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: '100%', mx: 'auto',  boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
            Booking Transactions
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CalendarMonthIcon />}
                onClick={() => setDateDialogOpen(true)}
                size="small"
              >
                Filter Dates
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (session?.user?.id) {
                    setUseDateFilter(false);
                    fetchTransactions(session.user.id, false);
                  }
                }}
                size="small"
              >
                Show All
              </Button>
              <Button
                variant="outlined"
                onClick={handleDownloadClick}
                size="small"
              >
                Download
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleDownloadClose}
              >
                <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
                <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
              </Menu>
            </Box>
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
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
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
