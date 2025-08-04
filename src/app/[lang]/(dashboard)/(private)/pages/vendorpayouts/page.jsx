"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Snackbar,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Menu,
    MenuItem
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DataGrid } from "@mui/x-data-grid";
import { useSession } from "next-auth/react";

const VendorPayOuts = () => {
    const { data: session, status } = useSession();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dateDialogOpen, setDateDialogOpen] = useState(false);
    const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
    const [summaryData, setSummaryData] = useState({
        totalAmount: 0,
        totalReceivable: 0,
        platformFeePercentage: 0
    });

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
        const [day, month, year] = dateString.split('-');
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
            let url = `https://api.parkmywheels.com/vendor/getvendorpayouts/${vendorId}`;

            if (dateFilter && startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await axios.get(url);

            if (response.status === 200) {
                const data = response.data.data.bookings.map((item, index) => ({
                    id: item._id,
                    serialNo: index + 1,
                    bookingId: item._id,
                    bookingAmount: `₹${item.amount}`,
                    platformFee: `₹${item.platformfee}`,
                    receivable: `₹${item.receivableAmount}`,
                    bookingDate: formatDateForDisplay(item.bookingDate),
                    bookingTime: item.parkingTime,
                }));

                setTransactions(data);
                setSummaryData({
                    totalAmount: response.data.data.totalAmount,
                    totalReceivable: response.data.data.totalReceivable,
                    platformFeePercentage: response.data.data.platformFeePercentage
                });
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

    const handleDownloadClick = (event) => {
        setDownloadAnchorEl(event.currentTarget);
    };

    const handleDownloadClose = () => {
        setDownloadAnchorEl(null);
    };

    const exportToCSV = () => {
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";

        // Add headers
        const headers = [
            'S.No',
            'Booking ID',
            'Booking Date',
            'Booking Time',
            'Parking Date',
            'Parking Time',
            'Exit Date',
            'Exit Time',
            'Total Amount',
            'Platform Fee',
            'Receivable'
        ];
        csvContent += headers.join(',') + '\r\n';

        // Add data rows
        transactions.forEach(transaction => {
            const row = [
                transaction.serialNo,
                `"${transaction.bookingId}"`, // Wrap in quotes to prevent CSV injection
                transaction.bookingDate,
                transaction.bookingTime,
                transaction.parkingDate,
                transaction.parkingTime,
                transaction.exitDate,
                transaction.exitTime,
                transaction.bookingAmount,
                transaction.platformFee,
                transaction.receivable
            ];
            csvContent += row.join(',') + '\r\n';
        });

        // Add summary
        csvContent += '\r\n';
        csvContent += 'Summary\r\n';
        csvContent += `Platform Fee Percentage,${summaryData.platformFeePercentage}%\r\n`;
        csvContent += `Total Amount,₹${summaryData.totalAmount}\r\n`;
        csvContent += `Total Receivable,₹${summaryData.totalReceivable}\r\n`;

        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `VendorPayouts_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        handleDownloadClose();
    };

    const exportToPDF = () => {
        // Create a printable HTML content
        const printContent = `
      <html>
        <head>
          <title>Vendor Payouts Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #329a73; text-align: center; }
            .summary { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #329a73; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .footer { margin-top: 30px; font-size: 0.8em; }
          </style>
        </head>
        <body>
          <h1>Vendor Payouts Report</h1>
          <div class="summary">
            <p><strong>Date Range:</strong> ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}</p>
            <p><strong>Platform Fee:</strong> ${summaryData.platformFeePercentage}%</p>
            <p><strong>Total Amount:</strong> ₹${summaryData.totalAmount}</p>
            <p><strong>Total Receivable:</strong> ₹${summaryData.totalReceivable}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Booking ID</th>
                <th>Booking Date</th>
                <th>Booking Time</th>
                <th>Parking Date</th>
                <th>Parking Time</th>
                <th>Exit Date</th>
                <th>Exit Time</th>
                <th>Total Amount</th>
                <th>Platform Fee</th>
                <th>Receivable</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => `
                <tr>
                  <td>${transaction.serialNo}</td>
                  <td>${transaction.bookingId}</td>
                  <td>${transaction.bookingDate}</td>
                  <td>${transaction.bookingTime}</td>
                  <td>${transaction.parkingDate}</td>
                  <td>${transaction.parkingTime}</td>
                  <td>${transaction.exitDate}</td>
                  <td>${transaction.exitTime}</td>
                  <td>${transaction.bookingAmount}</td>
                  <td>${transaction.platformFee}</td>
                  <td>${transaction.receivable}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

        // Open a new window with the printable content
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.print();
        };

        handleDownloadClose();
    };

    const columns = [
        { field: "serialNo", headerName: "S.No", width: 80 },
        { field: "bookingId", headerName: "Booking ID", width: 220 },
        { field: "bookingDate", headerName: "Booking Date", width: 120 },
        { field: "bookingTime", headerName: "Booking Time", width: 120 },
        { field: "bookingAmount", headerName: "Total Amount", width: 120 },
        { field: "platformFee", headerName: "Platform Fee", width: 120 },
        { field: "receivable", headerName: "Receivable", width: 120 },
    ];

    return (
        <Box sx={{ backgroundColor: "#f4f4f4", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 2 }}>
            <Card sx={{ width: "100%", maxWidth: 1200, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
                        Vendor Payouts
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<CalendarMonthIcon />}
                                onClick={() => setDateDialogOpen(true)}
                                size="small"
                            >
                                Filter Dates
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleDownloadClick}
                                size="small"
                                sx={{
                                    backgroundColor: '#329a73',
                                    '&:hover': {
                                        backgroundColor: '#2a8a66',
                                    }
                                }}
                            >
                                Download Report
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                bgcolor: '#f5f5f5',
                                padding: '6px 12px',
                                borderRadius: 1,
                                border: '1px solid #e0e0e0'
                            }}>
                                <Typography variant="body2" fontWeight="bold" color="#329a73">
                                    Total Receivable: ₹{summaryData.totalReceivable || getTotalReceivable().toFixed(2)}
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

                    <Menu
                        anchorEl={downloadAnchorEl}
                        open={Boolean(downloadAnchorEl)}
                        onClose={handleDownloadClose}
                    >
                        <MenuItem onClick={exportToCSV}>Export to Excel</MenuItem>
                        <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
                    </Menu>

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

export default VendorPayOuts;
