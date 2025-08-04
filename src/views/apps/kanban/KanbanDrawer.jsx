// React Imports
import { useEffect, useState, useRef } from 'react'


// MUI Imports
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { minLength, nonEmpty, object, pipe, string } from 'valibot'


// Slice Imports
import { deleteTask } from '@/redux-store/slices/kanban'

// Component ImportPs
import CustomAvatar from '@core/components/mui/Avatar'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Data Imports
import { chipColor } from './TaskCard'

const schema = object({
  title: pipe(string(), nonEmpty('Title is required'), minLength(1))
})

const KanbanDrawer = props => {
  // Props
  const { drawerOpen, dispatch, setDrawerOpen, task, columns, setColumns } = props

  // States
  const [date, setDate] = useState(task.dueDate)
  const [badgeText, setBadgeText] = useState(task.badgeText || [])
  const [fileName, setFileName] = useState('')
  const [amount, setamount] = useState('')

  // Refs
  const fileInputRef = useRef(null)


  // Hooks
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: task.title
    },
    resolver: valibotResolver(schema)
  })


  // Handle File Upload
  const handleFileUpload = event => {
    const { files } = event.target

    if (files && files.length !== 0) {
      setFileName(files[0].name)
    }
  }


  // Close Drawer
  const handleClose = () => {
    setDrawerOpen(false)
    reset({ title: task.title })
    setBadgeText(task.badgeText || [])
    setDate(task.dueDate)
    setFileName('')
    setamount('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const vendorid = '679cbab22cd53a01b512d354'


  // Update Task
  const updateTask = async (data) => {
    try {
      const payload = {
        vendorid: task.vendorid, // Assuming vendorid is part of the task object
        charges: [
          {
            type: task.badgeText, // BadgeText may represent type
            amount: amount, // Updated amount from the form
            category: task.category || "", // Assuming category exists
          }
        ]
      };

      const response = await fetch('https://api.parkmywheels.com/vendor/charges/addparkingcharges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Charges updated successfully:", result);
        setDrawerOpen(false);
      } else {
        console.error("Error updating charges:", result.message);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setDrawerOpen(false)
    dispatch(deleteTask(task.id))

    const updatedColumns = columns.map(column => {
      return {
        ...column,
        taskIds: column.taskIds.filter(taskId => taskId !== task.id)
      }
    })

    setColumns(updatedColumns)
  }


  // To set the initial values according to the task
  useEffect(() => {
    reset({ title: task.title })
    setBadgeText(task.badgeText || [])
    setDate(task.dueDate)
  }, [task, reset])

  return (
    <div>
      <Drawer
        open={drawerOpen}
        anchor='right'
        variant='temporary'
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
        onClose={handleClose}
      >
        <div className='flex justify-between items-center pli-5 plb-4 border-be'>
          <Typography variant='h5'>Edit Charges</Typography>
          <IconButton onClick={handleClose} size='small'>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </div>
        <div className='p-6'>
          <form className='flex flex-col gap-y-5' onSubmit={handleSubmit(updateTask)}>
            <FormControl fullWidth>
              <InputLabel id='demo-multiple-chip-label'>Label</InputLabel>
              <Select
                multiple
                label='Label'
                value={badgeText || []}
                onChange={e => setBadgeText(e.target.value)}
                renderValue={selected => (
                  <div className='flex flex-wrap gap-1'>
                    {selected.map(value => (
                      <Chip
                        variant='tonal'
                        label={value}
                        key={value}
                        onMouseDown={e => e.stopPropagation()}
                        size='small'
                        onDelete={() => setBadgeText(current => current.filter(item => item !== value))}
                        color={chipColor[value]?.color}
                      />
                    ))}
                  </div>
                )}
              >
                {Object.keys(chipColor).map(chip => (
                  <MenuItem key={chip} value={chip}>
                    <Checkbox checked={badgeText && badgeText.indexOf(chip) > -1} />
                    <ListItemText primary={chip} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Controller
              name='title'
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  label='Title'
                  {...field}
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message}
                />
              )}
            />
            <div className='flex gap-4'>
              <Button variant='contained' color='primary' type='submit'>
                Update
              </Button>
              <Button variant='outlined' color='error' type='reset' onClick={handleReset}>
                Delete
              </Button>
            </div>
          </form>
        </div>
      </Drawer>
    </div>
  )
}

export default KanbanDrawer
