import { useRef, useState, useEffect } from 'react'


// MUI Imports
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'


// Slice Imports
import { sendMessageToVendor } from '@/redux-store/slices/chat'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'


// Emoji Picker Component
const EmojiPicker = ({ onChange, isBelowSmScreen, openEmojiPicker, setOpenEmojiPicker, anchorRef }) => {
  return (
    <Popper open={openEmojiPicker} transition disablePortal placement='top-start' className='z-[12]' anchorEl={anchorRef.current}>
      {({ TransitionProps, placement }) => (
        <Fade {...TransitionProps} style={{ transformOrigin: placement === 'top-start' ? 'right top' : 'left top' }}>
          <Paper>
            <ClickAwayListener onClickAway={() => setOpenEmojiPicker(false)}>
              <span>
                <Picker
                  emojiSize={18}
                  theme='light'
                  data={data}
                  maxFrequentRows={1}
                  onEmojiSelect={emoji => {
                    onChange(emoji.native)
                    setOpenEmojiPicker(false)
                  }}
                  {...(isBelowSmScreen && { perLine: 8 })}
                />
              </span>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  )
}

const SendMsgForm = ({ dispatch, activeUser, isBelowSmScreen, messageInputRef }) => {
  // States
  const [msg, setMsg] = useState('')
  const [image, setImage] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false)

  // Refs
  const anchorRef = useRef(null)
  const open = Boolean(anchorEl)

  const handleToggle = () => {
    setOpenEmojiPicker(prevOpen => !prevOpen)
  }

  const handleClick = event => {
    setAnchorEl(prev => (prev ? null : event.currentTarget))
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSendMsg = event => {
    event.preventDefault()

    if (msg.trim() !== '' || image) {
      dispatch(
        sendMessageToVendor({
          vendorid: activeUser.id,
          description: msg || 'Image Sent',
          vendoractive: true,
          chatbox: [
            {
              vendorid: activeUser.id,
              message: msg || 'Image Sent',
              image: image, // Send image if available
              time: new Date().toISOString(), // ISO format for consistency
            }
          ]
        })
      )
      setMsg('')
      setImage(null) // Reset image after sending
    }
  }

  const handleFileUpload = event => {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setImage(reader.result) // Store image as base64
      }

      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null) // Remove selected image
  }

  const handleInputEndAdornment = () => {
    return (
      <div className='flex items-center gap-1'>
        {isBelowSmScreen ? (
          <>
            <IconButton id='option-menu' aria-haspopup='true' {...(open && { 'aria-expanded': true, 'aria-controls': 'share-menu' })} onClick={handleClick} ref={anchorRef}>
              <i className='ri-more-2-line text-textPrimary' />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={() => { handleToggle(); handleClose() }}>
                <i className='ri-emotion-happy-line text-textPrimary' />
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <i className='ri-mic-line text-textPrimary' />
              </MenuItem>
              <MenuItem onClick={handleClose} className='p-0'>
                <label htmlFor='upload-img' className='plb-2 pli-5'>
                  <i className='ri-attachment-2 text-textPrimary' />
                  <input hidden type='file' id='upload-img' onChange={handleFileUpload} />
                </label>
              </MenuItem>
            </Menu>
            <EmojiPicker anchorRef={anchorRef} openEmojiPicker={openEmojiPicker} setOpenEmojiPicker={setOpenEmojiPicker} isBelowSmScreen={isBelowSmScreen} onChange={value => setMsg(msg + value)} />
          </>
        ) : (
          <>
            <IconButton ref={anchorRef} size='small' onClick={handleToggle}>
              <i className='ri-emotion-happy-line text-textPrimary' />
            </IconButton>
            <EmojiPicker anchorRef={anchorRef} openEmojiPicker={openEmojiPicker} setOpenEmojiPicker={setOpenEmojiPicker} isBelowSmScreen={isBelowSmScreen} onChange={value => setMsg(msg + value)} />
            <IconButton size='small'>
              <i className='ri-mic-line text-textPrimary' />
            </IconButton>
            <IconButton size='small' component='label' htmlFor='upload-img'>
              <i className='ri-attachment-2 text-textPrimary' />
              <input hidden type='file' id='upload-img' onChange={handleFileUpload} />
            </IconButton>
          </>
        )}
        {isBelowSmScreen ? (
          <CustomIconButton variant='contained' color='primary' type='submit'>
            <i className='ri-send-plane-line' />
          </CustomIconButton>
        ) : (
          <Button variant='contained' color='primary' type='submit' endIcon={<i className='ri-send-plane-line' />}>
            Send
          </Button>
        )}
      </div>
    )
  }

  useEffect(() => {
    setMsg('')
    setImage(null)
  }, [activeUser.id])
  
return (
    <form autoComplete='off' onSubmit={handleSendMsg} className='bg-[var(--mui-palette-customColors-chatBg)]'>
      {image && (
        <div className='p-3 flex items-center gap-2 bg-gray-200 rounded-lg'>
          <img src={image} alt='Preview' className='h-20 w-20 object-cover rounded-md' />
          <IconButton onClick={handleRemoveImage} size='small' className='text-red-500'>
            <i className='ri-close-circle-line' />
          </IconButton>
        </div>
      )}
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder='Type a message'
        value={msg}
        className='p-5'
        onChange={e => setMsg(e.target.value)}
        sx={{
          '& fieldset': { border: '0' },
          '& .MuiOutlinedInput-root': {
            background: 'var(--mui-palette-background-paper)',
            borderRadius: 'var(--mui-shape-customBorderRadius-lg)',
            boxShadow: 'var(--mui-customShadows-xs)',
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMsg(e)
          }
        }}
        size='small'
        inputRef={messageInputRef}
        slotProps={{
          input: { endAdornment: handleInputEndAdornment() }
        }}
      />
    </form>
  )
}

export default SendMsgForm
