'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'
import {  Box,  Card,  CardContent,  Typography,  Button,  TextField,  FormControl,  InputLabel,  Select,  MenuItem,  Alert,  Paper,  Fade,  Grow,  Tabs,  Tab,  useMediaQuery,  useTheme,  CircularProgress,} from '@mui/material';
import { styled } from '@mui/material/styles';
import {  Add as AddIcon,  Edit as EditIcon,  Save as SaveIcon,  Close as CloseIcon,  AccessTime as ClockIcon,} from '@mui/icons-material';
const categories = ['Car', 'Bike', 'Others'];
const labels = ['Minimum Charges', 'Full Day', 'Additional Hour', 'Monthly'];
const typesByLabel = {
  'Minimum Charges': ['0 to 1 hours', '0 to 2 hours', '0 to 3 hours', '0 to 4 hour'],
  'Additional Hour': ['Additional 0 to 1 hours', 'Additional 0 to 2 hours', 'Additional 0 to 3 hours', '0 to 4 hour'],
  'Full Day': ['Full Day'],
  'Monthly': ['Monthly'],
};
// Styled components remain the same...
// Styled components with responsive design
const KanbanColumn = styled(Paper)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    transform: 'none',
    '&:hover': {
      transform: 'none',
    },
  },
}));
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[8],
  },
  [theme.breakpoints.down('sm')]: {
    '&:hover': {
      transform: 'scale(1.01)',
    },
  },
}));
const RateDisplay = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center',
  transform: 'translateZ(0)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
    backgroundColor: theme.palette.primary.main,
    '& .MuiTypography-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  [theme.breakpoints.down('sm')]: {
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
}));
const KanbanContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    <Fade in={value === index}>
      <Box sx={{ pt: 3 }}>
        {children}
      </Box>
    </Fade>
  </div>
);
const ParkingChargesKanban = ({ }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [charges, setCharges] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editStates, setEditStates] = useState({});
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession()
  // const vendorId = '679cbab22cd53a01b512d354'
  const vendorId = session?.user?.id
  useEffect(() => {
    fetchCharges();
  }, [vendorId]);
  // [Previous imports and styled components remain the same...]
  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/vendor/getchargesdata/${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch charges');
      const { vendor } = await response.json(); // Destructure vendor from response
      console.log('Vendor data:', vendor); // Debug log
      const chargesMap = {};
      // Process the charges data from vendor.charges
      vendor.charges.forEach(charge => {
        // Determine the label based on the type
        let label;
        if (charge.type.includes('Additional')) {
          label = 'Additional Hour';
        } else if (charge.type.includes('Full Day')) {
          label = 'Full Day';
        } else if (charge.type.includes('Monthly')) {
          label = 'Monthly';
        } else {
          label = 'Minimum Charges';
        }
        // Create a key using category and label
        const key = `${charge.category}-${label}`;
        console.log('Processing charge:', key, charge); // Debug log
        chargesMap[key] = {
          ...charge,
          label
        };
      });
      console.log('Processed charges map:', chargesMap); // Debug log
      setCharges(chargesMap);
    } catch (err) {
      console.error('Error fetching charges:', err); // Debug log
      setError('Failed to load charges data');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  // [Rest of the component code remains the same...]
  const handleSave = async (category, label, type, amount) => {
    try {
      if (!type || !amount) {
        throw new Error('Please enter both type and amount');
      }
      // Generate a charge ID
      const chargeid = `${category}-${label}`.toLowerCase();
      const chargeData = {
        type,
        amount,
        category,
        chargeid
      };
      // Format payload to match API expectations
      const payload = {
        vendorid: vendorId, // Changed from vendorId to vendorid to match API
        charges: [chargeData]
      };
      const response = await fetch(`${API_URL}/vendor/addparkingcharges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save charges');
      }
      // Refresh charges after saving
      await fetchCharges();
      setEditStates(prev => ({
        ...prev,
        [`${category}-${label}`]: false
      }));
      setSuccess('Charge saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };
  const ChargeCard = ({ category, label }) => {
    const [formData, setFormData] = useState({
      type: charges[`${category}-${label}`]?.type || '',
      amount: charges[`${category}-${label}`]?.amount || ''
    });
    useEffect(() => {
      // Update form data when charges change
      setFormData({
        type: charges[`${category}-${label}`]?.type || '',
        amount: charges[`${category}-${label}`]?.amount || ''
      });
    }, [charges, category, label]);
    const isEditing = editStates[`${category}-${label}`];
    const hasValue = `${category}-${label}` in charges;
    const charge = charges[`${category}-${label}`];
    return (
      <Grow in={true} timeout={300}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {label}
            </Typography>
            <Fade in={true} timeout={500}>
              <Box>
                {isEditing ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Duration</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        label="Duration"
                        startAdornment={<ClockIcon sx={{ mr: 1 }} />}
                      >
                        {typesByLabel[label].map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      InputProps={{
                        startAdornment: '₹',
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={() => {
                          setEditStates(prev => ({
                            ...prev,
                            [`${category}-${label}`]: false
                          }));
                          setFormData({
                            type: charges[`${category}-${label}`]?.type || '',
                            amount: charges[`${category}-${label}`]?.amount || ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSave(category, label, formData.type, formData.amount)}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : hasValue ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <RateDisplay>
                      <Typography variant="h4" color="primary.main" gutterBottom>
                        ₹{charge.amount}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ClockIcon sx={{ mr: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          {charge.type}
                        </Typography>
                      </Box>
                    </RateDisplay>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditStates(prev => ({
                        ...prev,
                        [`${category}-${label}`]: true
                      }))}
                    >
                      Edit Rate
                    </Button>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setEditStates(prev => ({
                      ...prev,
                      [`${category}-${label}`]: true
                    }))}
                  >
                    Set Rate
                  </Button>
                )}
              </Box>
            </Fade>
          </CardContent>
        </StyledCard>
      </Grow>
    );
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Parking Charges Management
      </Typography>
      {isMobile ? (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              aria-label="parking categories"
            >
              {categories.map((category) => (
                <Tab key={category} label={category} />
              ))}
            </Tabs>
          </Box>
          {categories.map((category, index) => (
            <TabPanel key={category} value={activeTab} index={index}>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                {labels.map(label => (
                  <ChargeCard key={label} category={category} label={label} />
                ))}
              </Box>
            </TabPanel>
          ))}
        </Box>
      ) : (
        <KanbanContainer>
          {categories.map((category) => (
            <KanbanColumn key={category} elevation={2} sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {category}
              </Typography>
              {labels.map(label => (
                <ChargeCard key={label} category={category} label={label} />
              ))}
            </KanbanColumn>
          ))}
        </KanbanContainer>
      )}
      <Box sx={{ mt: 3 }}>
        <Fade in={!!error}>
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Fade>
        <Fade in={!!success}>
          <Box>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};
export default ParkingChargesKanban;
