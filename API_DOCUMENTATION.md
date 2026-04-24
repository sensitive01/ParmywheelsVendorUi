# ParkMyWheels API Documentation
**Base Domain**: `https://api.parkmywheels.com`
**Test Vendor ID**: `692fdba34c5876256efb4428`

---

### 1. Vendor Profile & Dashboard
| Feature | Method | Full URL |
| :--- | :--- | :--- |
| **Vendor Data** | `GET` | `https://api.parkmywheels.com/vendor/fetch-vendor-data?id=692fdba34c5876256efb4428` |
| **Toggle States** | `GET` | `https://api.parkmywheels.com/vendor/get-toggle-states/692fdba34c5876256efb4428` |
| **Enable/Disable Features**| `GET` | `https://api.parkmywheels.com/vendor/fetchenable/692fdba34c5876256efb4428` |
| **Business Hours** | `GET` | `https://api.parkmywheels.com/vendor/fetchbusinesshours/692fdba34c5876256efb4428` |
| **Vendor Profile** | `GET` | `https://api.parkmywheels.com/vendor/getvendor/692fdba34c5876256efb4428` |

### 2. Parking Slots & Statistics
| Feature | Method | Full URL |
| :--- | :--- | :--- |
| **Total Slots** | `GET` | `https://api.parkmywheels.com/vendor/fetchcategories/692fdba34c5876256efb4428` |
| **Parked Slots** | `GET` | `https://api.parkmywheels.com/vendor/fetchbookedslot/692fdba34c5876256efb4428` |
| **Available Slots** | `GET` | `https://api.parkmywheels.com/vendor/fetchavailableslote/692fdba34c5876256efb4428` |
| **Real-time Availability** | `GET` | `https://api.parkmywheels.com/vendor/availableslots/692fdba34c5876256efb4428` |

### 3. Charges & Pricing
| Feature | Method | Full URL |
| :--- | :--- | :--- |
| **All Charges** | `GET` | `https://api.parkmywheels.com/vendor/getchargesdata/692fdba34c5876256efb4428` |
| **Full Day Charges** | `GET` | `https://api.parkmywheels.com/vendor/getfullday/692fdba34c5876256efb4428` |
| **Min Charge (Car)** | `GET` | `https://api.parkmywheels.com/vendor/fetchminimuncharge/692fdba34c5876256efb4428/Car` |
| **Add Charge (Car)** | `GET` | `https://api.parkmywheels.com/vendor/fetchaddcharge/692fdba34c5876256efb4428/Car` |
| **Monthly Charge (Car)** | `GET` | `https://api.parkmywheels.com/vendor/fetchmonthlycharge/692fdba34c5876256efb4428/Car` |

### 4. Amenities & Services
| Feature | Method | Full URL |
| :--- | :--- | :--- |
| **Amenities Data** | `GET` | `https://api.parkmywheels.com/vendor/getamenitiesdata/692fdba34c5876256efb4428` |

### 5. Bookings & Transactions
| Feature | Method | Full URL |
| :--- | :--- | :--- |
| **Create Booking** | `POST` | `https://api.parkmywheels.com/vendor/vendorcreatebooking` |
| **Active Subscriptions** | `GET` | `https://api.parkmywheels.com/vendor/fetchsubscription/692fdba34c5876256efb4428` |
| **Transactions** | `GET` | `https://api.parkmywheels.com/vendor/transactions/692fdba34c5876256efb4428` |
| **Bookings List** | `GET` | `https://api.parkmywheels.com/apps/ecommerce/products/list` |

---
*Note: Replace `692fdba34c5876256efb4428` with any other Vendor ID as needed.*
