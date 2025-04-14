// import { useState } from "react";
// import axios from "axios";
// import Button from "@mui/material/Button";
// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogTitle from "@mui/material/DialogTitle";
// import TextField from "@mui/material/TextField";

// const API_URL = "https://parkmywheelsapi.onrender.com/vendor";

// const BookingActionButton = ({ bookingId, currentStatus, onUpdate }) => {
//     const [status, setStatus] = useState(currentStatus);
//     const [loading, setLoading] = useState(false);
//     const [openDialog, setOpenDialog] = useState(false);
//     const [amount, setAmount] = useState("");
//     const [hour, setHour] = useState("");

//     // Function to handle API calls
//     const handleApiCall = async () => {
//         setLoading(true);
//         try {
//             let url = "";
//             let newStatus = status;

//             if (status === "Pending") {
//                 url = `${API_URL}/approvebooking/${bookingId}`;
//                 newStatus = "Approved";
//             } else if (status === "Approved") {
//                 url = `${API_URL}/allowparking/${bookingId}`;
//                 newStatus = "Parked";
//             } else if (status === "Cancelled") {
//                 return; // No action after cancellation
//             }

//             if (url) {
//                 const response = await axios.put(url);
//                 if (response.data.success) {
//                     setStatus(newStatus);
//                     onUpdate(); // Refresh table
//                 }
//             }
//         } catch (error) {
//             console.error("API Error:", error);
//         }
//         setLoading(false);
//     };

//     // Function to handle exit with amount & hours
//     const handleExit = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.put(`${API_URL}/exitvehicle/${bookingId}`, { amount, hour });

//             if (response.data.success) {
//                 setStatus("Completed"); // ✅ Final step, disable the button
//                 onUpdate(); // Refresh table
//             }
//         } catch (error) {
//             console.error("Exit API Error:", error);
//         }
//         setLoading(false);
//         setOpenDialog(false);
//     };

//     // Get button properties dynamically
//     const getButtonProps = () => {
//         if (status === "Pending") return { label: "Approve", color: "primary", onClick: handleApiCall };
//         if (status === "Approved") return { label: "Allow Parking", color: "success", onClick: handleApiCall };
//         if (status === "Parked") return { label: "Exit Vehicle", color: "warning", onClick: () => setOpenDialog(true) };
//         if (status === "Cancelled" || status === "Completed") return { label: status, color: "secondary", disabled: true };

//         // ✅ Default fallback to prevent `undefined` errors
//         return { label: "Unknown Status", color: "default", disabled: true };
//     };

//     const buttonProps = getButtonProps();

//     return (
//         <div>
//             <Button variant="contained" color={buttonProps.color} onClick={buttonProps.onClick} disabled={buttonProps.disabled || loading}>
//                 {buttonProps.label}
//             </Button>

//             {/* Exit Dialog Form */}
//             <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
//                 <DialogTitle>Exit Vehicle - Enter Details</DialogTitle>
//                 <DialogContent>
//                     <TextField label="Amount" fullWidth margin="dense" value={amount} onChange={(e) => setAmount(e.target.value)} />
//                     <TextField label="Hour" fullWidth margin="dense" value={hour} onChange={(e) => setHour(e.target.value)} />
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//                     <Button onClick={handleExit} color="primary" disabled={loading || status === "Completed"}>
//                         Submit
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// };

// export default BookingActionButton;

import { useState } from "react";

import axios from "axios";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

const API_URL = "https://parkmywheelsapi.onrender.com/vendor";

const BookingActionButton = ({ bookingId, currentStatus, onUpdate }) => {
    const [status, setStatus] = useState(currentStatus);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [amount, setAmount] = useState("");
    const [hour, setHour] = useState("");
    const [exitDisabled, setExitDisabled] = useState(false); // ✅ New state to disable Exit button

    // Function to handle API calls
    const handleApiCall = async () => {
        setLoading(true);

        try {
            let url = "";
            let newStatus = status;

            if (status === "Pending") {
                url = `${API_URL}/approvebooking/${bookingId}`;
                newStatus = "Approved";
            } else if (status === "Approved") {
                url = `${API_URL}/allowparking/${bookingId}`;
                newStatus = "Parked";
            } else if (status === "Cancelled") {
                return; // No action after cancellation
            }

            if (url) {
                const response = await axios.put(url);

                if (response.data.success) {
                    setStatus(newStatus);
                    onUpdate(); // Refresh table
                }
            }
        } catch (error) {
            console.error("API Error:", error);
        }

        setLoading(false);
    };

    // Function to handle exit with amount & hours
    const handleExit = async () => {
        setLoading(true);

        try {
            const response = await axios.put(`${API_URL}/exitvehicle/${bookingId}`, { amount, hour });

            if (response.data.success) {
                setStatus("Completed"); // ✅ Final step, disable the button
                setExitDisabled(true); // ✅ Disable Exit button after submission
                onUpdate(); // Refresh table
            }
        } catch (error) {
            console.error("Exit API Error:", error);
        }

        setLoading(false);
        setOpenDialog(false);
    };

    // Get button properties dynamically
    const getButtonProps = () => {
        if (status === "Pending") return { label: "Approve", color: "primary", onClick: handleApiCall };
        if (status === "Approved") return { label: "Allow Parking", color: "success", onClick: handleApiCall };
        if (status === "Parked") return { label: "Exit Vehicle", color: "warning", onClick: () => setOpenDialog(true), disabled: exitDisabled }; // ✅ Exit button disabled after submission
        if (status === "Cancelled" || status === "Completed") return { label: status, color: "secondary", disabled: true };

        // ✅ Default fallback to prevent `undefined` errors
        return { label: "Unknown Status", color: "default", disabled: true };
    };

    const buttonProps = getButtonProps();

    return (
        <div>
            <Button variant="contained" color={buttonProps.color} onClick={buttonProps.onClick} disabled={buttonProps.disabled || loading}>
                {buttonProps.label}
            </Button>

            {/* Exit Dialog Form */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Exit Vehicle - Enter Details</DialogTitle>
                <DialogContent>
                    <TextField label="Amount" fullWidth margin="dense" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <TextField label="Hour" fullWidth margin="dense" value={hour} onChange={(e) => setHour(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleExit} color="primary" disabled={loading || exitDisabled}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default BookingActionButton;
