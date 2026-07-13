'use client'
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import AuthLogsTable from './AuthLogsTable';
import ActivityLogsTable from './ActivityLogsTable';

const SystemAuditLogs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <ShieldIcon color="primary" sx={{ fontSize: 36 }} />
        <Box>
          <Typography variant="h4" fontWeight="bold">System Audit Logs</Typography>
          <Typography variant="body2" color="text.secondary">Monitor and track all events and activities across the platform</Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
        >
          <Tab label="Authentication Logs" sx={{ fontWeight: 'bold' }} />
          <Tab label="Activity Logs" sx={{ fontWeight: 'bold' }} />
        </Tabs>
      </Paper>

      <Box>
        {activeTab === 0 && <AuthLogsTable />}
        {activeTab === 1 && <ActivityLogsTable />}
      </Box>
    </Box>
  );
};

export default SystemAuditLogs;
