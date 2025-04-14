// 'use client'
// // React Imports
// import { useState } from 'react'
// // MUI Imports
// import Card from '@mui/material/Card'
// import CardHeader from '@mui/material/CardHeader'
// import CardContent from '@mui/material/CardContent'
// import Button from '@mui/material/Button'
// import IconButton from '@mui/material/IconButton'
// import List from '@mui/material/List'
// import ListItem from '@mui/material/ListItem'
// import Typography from '@mui/material/Typography'
// import { styled } from '@mui/material/styles'
// // Third-party Imports
// import { useDropzone } from 'react-dropzone'
// // Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'
// // Styled Component Imports
// import AppReactDropzone from '@/libs/styles/AppReactDropzone'
// // Styled Dropzone Component
// const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
//   '& .dropzone': {
//     minHeight: 'unset',
//     padding: theme.spacing(12),
//     [theme.breakpoints.down('sm')]: {
//       paddingInline: theme.spacing(5)
//     },
//     '&+.MuiList-root .MuiListItem-root .file-name': {
//       fontWeight: theme.typography.body1.fontWeight
//     }
//   }
// }))
// const ProductImage = ({ onChange }) => {
//   // State to store uploaded files
//   const [files, setFiles] = useState([])
//   // Hooks for handling file uploads
//   const { getRootProps, getInputProps } = useDropzone({
//     accept: 'image/*', // Only allow image files
//     onDrop: acceptedFiles => {
//       setFiles(acceptedFiles)
//       if (onChange) {
//         onChange(acceptedFiles[0]) // Pass the first image file to the parent component
//       }
//     }
//   })
//   // Render image preview
//   const renderFilePreview = file => {
//     return file.type.startsWith('image') ? (
//       <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
//     ) : (
//       <i className='ri-file-text-line' />
//     )
//   }
//   // Remove a single file
//   const handleRemoveFile = file => {
//     const filteredFiles = files.filter(i => i.name !== file.name)
//     setFiles(filteredFiles)
//     if (onChange && filteredFiles.length === 0) {
//       onChange(null) // Reset image in parent component when removed
//     }
//   }
//   // Remove all files
//   const handleRemoveAllFiles = () => {
//     setFiles([])
//     if (onChange) {
//       onChange(null) // Reset image in parent component
//     }
//   }
//   return (
//     <Dropzone>
//       <Card>
//         <CardHeader title='Product Image' />
//         <CardContent>
//           <div {...getRootProps({ className: 'dropzone' })}>
//             <input {...getInputProps()} />
//             <div className='flex items-center flex-col gap-2 text-center'>
//               <CustomAvatar variant='rounded' skin='light' color='secondary'>
//                 <i className='ri-upload-2-line' />
//               </CustomAvatar>
//               <Typography variant='h4'>Drag and Drop Your Image Here</Typography>
//               <Typography color='text.disabled'>or</Typography>
//               <Button variant='outlined' size='small'>
//                 Browse Image
//               </Button>
//             </div>
//           </div>
//           {files.length > 0 && (
//             <>
//               <List>
//                 {files.map(file => (
//                   <ListItem key={file.name} className='pis-4 plb-3'>
//                     <div className='file-details'>
//                       <div className='file-preview'>{renderFilePreview(file)}</div>
//                       <div>
//                         <Typography className='file-name font-medium' color='text.primary'>
//                           {file.name}
//                         </Typography>
//                         <Typography className='file-size' variant='body2'>
//                           {(file.size / 1024).toFixed(1)} KB
//                         </Typography>
//                       </div>
//                     </div>
//                     <IconButton onClick={() => handleRemoveFile(file)}>
//                       <i className='ri-close-line text-xl' />
//                     </IconButton>
//                   </ListItem>
//                 ))}
//               </List>
//               <div className='buttons'>
//                 <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
//                   Remove All
//                 </Button>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </Dropzone>
//   )
// }
// export default ProductImage
'use client'

// React Imports
import { useState } from 'react'


// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useDropzone } from 'react-dropzone'


// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'


// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

const ProductImage = ({ onChange }) => {
  // State to store uploaded files
  const [files, setFiles] = useState([])


  // Hooks for handling file uploads
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*', // Only allow image files
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles)

      if (onChange) {
        onChange(acceptedFiles[0]) // Pass the first image file to the parent component
      }
    }
  })


  // Render image preview
  const renderFilePreview = file => {
    return file.type.startsWith('image') ? (
      <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
    ) : (
      <i className='ri-file-text-line' />
    )
  }


  // Remove a single file
  const handleRemoveFile = file => {
    const filteredFiles = files.filter(i => i.name !== file.name)

    setFiles(filteredFiles)

    if (onChange && filteredFiles.length === 0) {
      onChange(null) // Reset image in parent component when removed
    }
  }


  // Remove all files
  const handleRemoveAllFiles = () => {
    setFiles([])

    if (onChange) {
      onChange(null) // Reset image in parent component
    }
  }

  
return (
    <Dropzone>
      <Card>
        <CardHeader title='Product Image' />
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className='flex items-center flex-col gap-2 text-center'>
              <CustomAvatar variant='rounded' skin='light' color='secondary'>
                <i className='ri-upload-2-line' />
              </CustomAvatar>
              <Typography variant='h4'>Drag and Drop Your Image Here</Typography>
              <Typography color='text.disabled'>or</Typography>
              <Button variant='outlined' size='small'>
                Browse Image
              </Button>
            </div>
          </div>
          {files.length > 0 && (
            <>
              <List>
                {files.map(file => (
                  <ListItem key={file.name} className='pis-4 plb-3'>
                    <div className='file-details'>
                      <div className='file-preview'>{renderFilePreview(file)}</div>
                      <div>
                        <Typography className='file-name font-medium' color='text.primary'>
                          {file.name}
                        </Typography>
                        <Typography className='file-size' variant='body2'>
                          {(file.size / 1024).toFixed(1)} KB
                        </Typography>
                      </div>
                    </div>
                    <IconButton onClick={() => handleRemoveFile(file)}>
                      <i className='ri-close-line text-xl' />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              <div className='buttons'>
                <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                  Remove All
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default ProductImage
