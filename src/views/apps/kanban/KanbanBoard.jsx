'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import {
  Box, Card, CardContent, Typography, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Alert, Paper, Fade, Grow, Tabs, Tab,
  useMediaQuery, useTheme, CircularProgress, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon, Edit as EditIcon, Save as SaveIcon,
  Close as CloseIcon, AccessTime as ClockIcon,
  DirectionsCar as CarIcon,
  TwoWheeler as BikeIcon,
  Category as OthersIcon
} from '@mui/icons-material';

const categories = ['Car', 'Bike', 'Others'];
const labels = ['Minimum Charges', 'Full Day', 'Additional Hour', 'Monthly'];

const typesByLabel = {
  'Minimum Charges': ['0 to 1 hour', '0 to 2 hours', '0 to 3 hours', '0 to 4 hours'],
  'Additional Hour': ['Additional 1 hour', 'Additional 2 hours', 'Additional 3 hours', 'Additional 4 hours'],
  'Full Day': ['Full day'],
  'Monthly': ['Monthly'],
};

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

// Helper function to map category name to slot property
const categoryToSlotProperty = {
  'Car': 'Cars',
  'Bike': 'Bikes',
  'Others': 'Others'
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  switch(category) {
    case 'Car': return <CarIcon />;
    case 'Bike': return <BikeIcon />;
    case 'Others': return <OthersIcon />;
    default: return null;
  }
};

// Helper function to get charge ID based on category and label
const getChargeIdForNewEntry = (category, label) => {
  // Simple mapping to assign single letter IDs like the backend expects
  const idMap = {
    'Car-Minimum Charges': 'A',
    'Car-Additional Hour': 'B',
    'Car-Full Day': 'C',
    'Car-Monthly': 'D',
    'Bike-Minimum Charges': 'E',
    'Bike-Additional Hour': 'F',
    'Bike-Full Day': 'G',
    'Bike-Monthly': 'H',
    'Others-Minimum Charges': 'I',
    'Others-Additional Hour': 'J',
    'Others-Full Day': 'K',
    'Others-Monthly': 'L'
  };
  
  const key = `${category}-${label}`;
  return idMap[key] || key.substring(0, 1).toUpperCase(); // Fallback to first letter capitalized
};

const ParkingChargesKanban = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [charges, setCharges] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editStates, setEditStates] = useState({});
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [availableSlots, setAvailableSlots] = useState({
    Cars: 0,
    Bikes: 0,
    Others: 0
  });
  const [availableCategories, setAvailableCategories] = useState([]);

  const vendorId = session?.user?.id;

  useEffect(() => {
    if (vendorId) {
      console.log('VendorID is available, fetching data:', vendorId);
      fetchCharges();
      fetchAvailableSlots();
    } else {
      console.log('No vendorId available yet');
    }
  }, [vendorId]);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      console.log(`Fetching charges from: ${API_URL}/vendor/getchargesdata/${vendorId}`);
      
      const response = await axios.get(`${API_URL}/vendor/getchargesdata/${vendorId}`);
      console.log('Charges API response:', response.data);

      if (!response.data || !response.data.vendor) {
        throw new Error('Invalid response format');
      }
      
      const { vendor } = response.data;
      const chargesMap = {};

      vendor.charges.forEach(charge => {
        let label;
        
        // Case-insensitive type matching
        const typeLC = charge.type.toLowerCase();
        
        if (typeLC.includes('additional')) {
          label = 'Additional Hour';
        } else if (typeLC.includes('full day') || typeLC.includes('full day')) {
          label = 'Full Day';
        } else if (typeLC.includes('monthly')) {
          label = 'Monthly';
        } else {
          label = 'Minimum Charges';
        }

        // Create a key using category and label
        const key = `${charge.category}-${label}`;
        chargesMap[key] = {
          ...charge,
          label
        };
      });
      
      console.log('Mapped charges:', chargesMap);
      setCharges(chargesMap);
    } catch (err) {
      console.error('Error fetching charges:', err);
      setError(`Failed to load charges data: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      console.log(`Fetching available slots from: ${API_URL}/vendor/availableslots/${vendorId}`);
      const response = await axios.get(`${API_URL}/vendor/availableslots/${vendorId}`);
      console.log('Slots API response:', response.data);
      
      const { Cars = 0, Bikes = 0, Others = 0 } = response.data;
      
      setAvailableSlots({ Cars, Bikes, Others });
      
      // Create array of available categories
      const available = [];
      if (Cars > 0) available.push('Car');
      if (Bikes > 0) available.push('Bike');
      if (Others > 0) available.push('Others');
      
      setAvailableCategories(available);
      
      // If active tab is no longer available, switch to first available tab
      if (available.length > 0 && !available.includes(categories[activeTab])) {
        const firstAvailableIndex = categories.findIndex(cat => available.includes(cat));
        if (firstAvailableIndex !== -1) {
          setActiveTab(firstAvailableIndex);
        }
      }
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError(`Failed to load available slots: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSave = async (category, label, type, amount) => {
    try {
      if (!type || !amount) {
        throw new Error('Please enter both type and amount');
      }

      // Check if the category has available slots
      const slotProperty = categoryToSlotProperty[category];
      if (!slotProperty || availableSlots[slotProperty] <= 0) {
        throw new Error(`Cannot set charges for ${category} as there are no available slots`);
      }

      // Get existing charge or generate a new ID
      const existingCharge = charges[`${category}-${label}`];
      const chargeid = existingCharge?.chargeid || getChargeIdForNewEntry(category, label);

      const chargeData = {
        type,
        amount,
        category,
        chargeid
      };

      console.log('Sending charge data:', chargeData);

      // Format payload to match API expectations
      const payload = {
        vendorid: vendorId,
        charges: [chargeData]
      };

      const response = await axios.post(`${API_URL}/vendor/addparkingcharges`, payload);
      console.log('Save API response:', response.data);

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
      setError(err.response?.data?.message || err.message || 'Failed to save charges');
      setTimeout(() => setError(''), 5000);
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

    // Check if category has available slots
    const slotProperty = categoryToSlotProperty[category];
    const hasAvailableSlots = slotProperty && availableSlots[slotProperty] > 0;

    if (!hasAvailableSlots && !hasValue) {
      return (
        <Grow in={true} timeout={300}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {label}
              </Typography>
              <Alert severity="info" sx={{ mt: 1 }}>
                No {category} slots available. Cannot set charges.
              </Alert>
            </CardContent>
          </StyledCard>
        </Grow>
      );
    }

    const handleTypeChange = (e) => {
      setFormData({ ...formData, type: e.target.value });
    };

    const handleAmountChange = (e) => {
      setFormData({ ...formData, amount: e.target.value });
    };

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
                        onChange={handleTypeChange}
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
                      onChange={handleAmountChange}
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
                      disabled={!hasAvailableSlots}
                    >
                      Edit Rate
                    </Button>
                    {!hasAvailableSlots && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        No {category} slots available. Cannot edit charges.
                      </Alert>
                    )}
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
                    disabled={!hasAvailableSlots}
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
      
      {/* Slots information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Available Slots
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<CarIcon />} 
            label={`Cars: ${availableSlots.Cars}`} 
            color={availableSlots.Cars > 0 ? "success" : "default"} 
            variant="outlined" 
          />
          <Chip 
            icon={<BikeIcon />} 
            label={`Bikes: ${availableSlots.Bikes}`} 
            color={availableSlots.Bikes > 0 ? "success" : "default"} 
            variant="outlined" 
          />
          <Chip 
            icon={<OthersIcon />} 
            label={`Others: ${availableSlots.Others}`} 
            color={availableSlots.Others > 0 ? "success" : "default"} 
            variant="outlined" 
          />
        </Box>
      </Box>
      
      {/* Error and success alerts */}
      <Box sx={{ mb: 3 }}>
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
      
      {isMobile ? (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              aria-label="parking categories"
            >
              {categories.map((category, index) => (
                <Tab 
                  key={category} 
                  label={category} 
                  icon={getCategoryIcon(category)}
                  iconPosition="start"
                  disabled={!availableCategories.includes(category)}
                />
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                {getCategoryIcon(category)}
                <Typography variant="h6">
                  {category}
                </Typography>
                <Chip 
                  size="small"
                  label={`${availableSlots[categoryToSlotProperty[category]]} slots`}
                  color={availableSlots[categoryToSlotProperty[category]] > 0 ? "success" : "error"}
                  sx={{ ml: 1 }}
                />
              </Box>
              {labels.map(label => (
                <ChargeCard key={label} category={category} label={label} />
              ))}
            </KanbanColumn>
          ))}
        </KanbanContainer>
      )}
    </Box>
  );
};

export default ParkingChargesKanban;
