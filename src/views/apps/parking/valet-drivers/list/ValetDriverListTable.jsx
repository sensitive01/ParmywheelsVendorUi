'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Icons
import AddLineIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const ValetDriverListTable = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState(null)
  const [vendorId, setVendorId] = useState(null)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    licenseNumber: '',
    status: 'active'
  })
  const [proofFile, setProofFile] = useState(null)

  useEffect(() => {
    const id = localStorage.getItem('vendorId') || 'some-vendor-id-from-session'
    setVendorId(id)
    if (id) {
      fetchDrivers(id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchDrivers = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/vendor/valet-drivers/${id}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data || [])
      } else {
        console.error("Failed to fetch drivers")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setEditMode(false)
    setSelectedDriverId(null)
    setFormData({ firstName: '', lastName: '', phone: '', email: '', licenseNumber: '', status: 'active' })
    setProofFile(null)
    setOpen(true)
  }

  const handleEdit = (driver) => {
    setEditMode(true)
    setSelectedDriverId(driver._id)
    setFormData({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      phone: driver.phone || '',
      email: driver.email || '',
      licenseNumber: driver.licenseNumber || '',
      status: driver.status || 'active'
    })
    setProofFile(null)
    setOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    setOpen(false)
    setFormData({ firstName: '', lastName: '', phone: '', email: '', licenseNumber: '', status: 'active' })
    setProofFile(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        e.target.value = null
        return
      }
      setProofFile(file)
    }
  }

  const handleSave = async () => {
    if (!vendorId) return;

    const form = new FormData()
    form.append('vendorId', vendorId)
    form.append('firstName', formData.firstName)
    form.append('lastName', formData.lastName)
    form.append('phone', formData.phone)
    form.append('email', formData.email)
    form.append('licenseNumber', formData.licenseNumber)
    
    // Status is only updated when in edit mode
    if (editMode) {
      form.append('status', formData.status)
    } else {
      form.append('status', 'active')
    }

    if (proofFile) {
      form.append('proof', proofFile)
    }

    try {
      let res;
      if (editMode) {
        res = await fetch(`${API_URL}/vendor/valet-driver/${selectedDriverId}`, {
          method: 'PUT',
          body: form
        })
      } else {
        res = await fetch(`${API_URL}/vendor/valet-driver`, {
          method: 'POST',
          body: form
        })
      }
      
      if (res.ok) {
        handleClose()
        fetchDrivers(vendorId)
      } else {
        console.error("Failed to save driver")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (driverId) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return
    try {
      const res = await fetch(`${API_URL}/vendor/valet-driver/${driverId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchDrivers(vendorId)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card>
      <CardHeader 
        title='Valet Drivers' 
        action={
          <Button variant='contained' onClick={handleOpen} startIcon={<AddLineIcon />}>
            Add Driver
          </Button>
        }
      />
      <Divider />
      <div className='overflow-x-auto p-4'>
        {loading ? (
          <Typography>Loading drivers...</Typography>
        ) : (
          <table className='min-w-full text-left border-collapse'>
            <thead>
              <tr className='border-b'>
                <th className='p-3'>S.No</th>
                <th className='p-3'>Name</th>
                <th className='p-3'>Phone</th>
                <th className='p-3'>Email</th>
                <th className='p-3'>License No.</th>
                <th className='p-3'>Proof</th>
                <th className='p-3'>Status</th>
                <th className='p-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className='p-3 text-center'>No valet drivers found.</td>
                </tr>
              ) : (
                data.map((driver, index) => (
                  <tr key={driver._id} className='border-b hover:bg-gray-50'>
                    <td className='p-3'>{index + 1}</td>
                    <td className='p-3'>{driver.firstName} {driver.lastName}</td>
                    <td className='p-3'>{driver.phone}</td>
                    <td className='p-3'>{driver.email || '-'}</td>
                    <td className='p-3'>{driver.licenseNumber || '-'}</td>
                    <td className='p-3'>
                      {driver.proofUrl ? (
                        <a href={driver.proofUrl} target='_blank' rel='noopener noreferrer' className='text-blue-500 flex items-center'>
                          <InsertDriveFileOutlinedIcon fontSize='small' className='mr-1' /> View
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className='p-3'>
                      <Chip label={driver.status} color={driver.status === 'active' ? 'success' : 'default'} size='small' />
                    </td>
                    <td className='p-3'>
                      <IconButton onClick={() => handleEdit(driver)} color='primary'>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(driver._id)} color='error'>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editMode ? 'Edit Valet Driver' : 'Add Valet Driver'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='First Name' 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Last Name' 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Phone' 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Email' 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} size={{xs: 12}}>
              <TextField 
                fullWidth 
                label='License Number' 
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} size={{xs: 12}}>
              <Typography variant='caption' className='mb-1 block'>Proof Document (Max 5MB)</Typography>
              <TextField 
                fullWidth 
                type="file"
                inputProps={{ accept: "image/*,application/pdf" }}
                onChange={handleFileChange}
              />
            </Grid>
            {editMode && (
              <Grid item xs={12} size={{xs: 12}}>
                <TextField 
                  select
                  fullWidth 
                  label='Status' 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='inactive'>Inactive</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleSave}>{editMode ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ValetDriverListTable
