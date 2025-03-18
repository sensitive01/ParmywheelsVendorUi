// // React Imports
// import { useRef, useEffect } from 'react'
// // MUI Imports
// import Typography from '@mui/material/Typography'
// import Avatar from '@mui/material/Avatar'
// import CardContent from '@mui/material/CardContent'
// // Third-party Imports
// import classnames from 'classnames'
// import PerfectScrollbar from 'react-perfect-scrollbar'
// // Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'
// // Util Imports
// import { getInitials } from '@/utils/getInitials'
// // Formats the chat data into a structured format for display.
// const formatedChatData = (chats, profileUser) => {
//   const formattedChatData = []
//   let chatMessageSenderId = chats[0] ? chats[0].senderId : profileUser.id
//   let msgGroup = {
//     senderId: chatMessageSenderId,
//     messages: []
//   }
//   chats.forEach((chat, index) => {
//     if (chatMessageSenderId === chat.senderId) {
//       msgGroup.messages.push({
//         time: chat.time,
//         message: chat.message,
//         msgStatus: chat.msgStatus
//       })
//     } else {
//       chatMessageSenderId = chat.senderId
//       formattedChatData.push(msgGroup)
//       msgGroup = {
//         senderId: chat.senderId,
//         messages: [
//           {
//             time: chat.time,
//             message: chat.message,
//             msgStatus: chat.msgStatus
//           }
//         ]
//       }
//     }
//     if (index === chats.length - 1) formattedChatData.push(msgGroup)
//   })
//   return formattedChatData
// }
// // Wrapper for the chat log to handle scrolling
// const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef, className }) => {
//   if (isBelowLgScreen) {
//     return (
//       <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
//         {children}
//       </div>
//     )
//   } else {
//     return (
//       <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
//         {children}
//       </PerfectScrollbar>
//     )
//   }
// }
// const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }) => {
//   // Props
//   const { profileUser, contacts } = chatStore
//   // Vars
//   const activeUserChat = chatStore.chats.find(chat => chat.userId === chatStore.activeUser?.id)
//   // Refs
//   const scrollRef = useRef(null)
//   // Function to scroll to bottom when new message is sent
//   const scrollToBottom = () => {
//     if (scrollRef.current) {
//       if (isBelowLgScreen) {
//         // @ts-ignore
//         scrollRef.current.scrollTop = scrollRef.current.scrollHeight
//       } else {
//         // @ts-ignore
//         scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
//       }
//     }
//   }
//   // Scroll to bottom on new message
//   useEffect(() => {
//     if (activeUserChat && activeUserChat.chat && activeUserChat.chat.length) {
//       scrollToBottom()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [chatStore])
//   return (
//     <ScrollWrapper
//       isBelowLgScreen={isBelowLgScreen}
//       scrollRef={scrollRef}
//       className='bg-[var(--mui-palette-customColors-chatBg)]'
//     >
//       <CardContent className='p-0'>
//         {activeUserChat &&
//           formatedChatData(activeUserChat.chat, profileUser).map((msgGroup, index) => {
//             const isSender = msgGroup.senderId === profileUser.id
//             return (
//               <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
//                 {!isSender ? (
//                   contacts.find(contact => contact.id === activeUserChat?.userId)?.avatar ? (
//                     <Avatar
//                       alt={contacts.find(contact => contact.id === activeUserChat?.userId)?.fullName}
//                       src={contacts.find(contact => contact.id === activeUserChat?.userId)?.avatar}
//                       className='is-8 bs-8'
//                     />
//                   ) : (
//                     <CustomAvatar
//                       color={contacts.find(contact => contact.id === activeUserChat?.userId)?.avatarColor}
//                       skin='light'
//                       size={32}
//                     >
//                       {getInitials(contacts.find(contact => contact.id === activeUserChat?.userId)?.fullName)}
//                     </CustomAvatar>
//                   )
//                 ) : profileUser.avatar ? (
//                   <Avatar alt={profileUser.fullName} src={profileUser.avatar} className='is-8 bs-8' />
//                 ) : (
//                   <CustomAvatar alt={profileUser.fullName} src={profileUser.avatar} size={32} />
//                 )}
//                 <div
//                   className={classnames('flex flex-col gap-2', {
//                     'items-end': isSender,
//                     'max-is-[65%]': !isBelowMdScreen,
//                     'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
//                     'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
//                   })}
//                 >
//                   {msgGroup.messages.map((msg, index) => (
//                     <Typography
//                       key={index}
//                       className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
//                         'bg-backgroundPaper rounded-e-lg rounded-b-lg': !isSender,
//                         'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s-lg rounded-b-lg': isSender
//                       })}
//                       style={{ wordBreak: 'break-word' }}
//                     >
//                       {msg.message}
//                     </Typography>
//                   ))}
//                   <Typography variant='body2'>activeUser?.role</Typography>
//                   {msgGroup.messages.map(
//                     (msg, index) =>
//                       index === msgGroup.messages.length - 1 &&
//                       (isSender ? (
//                         <div key={index} className='flex items-center gap-2'>
//                           {msg.msgStatus?.isSeen ? (
//                             <i className='ri-check-double-line text-success text-base' />
//                           ) : msg.msgStatus?.isDelivered ? (
//                             <i className='ri-check-double-line text-base' />
//                           ) : (
//                             msg.msgStatus?.isSent && <i className='ri-check-line text-base' />
//                           )}
//                           {index === activeUserChat.chat.length - 1 ? (
//                             <Typography variant='caption'>
//                               {new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
//                             </Typography>
//                           ) : msg.time ? (
//                             <Typography variant='caption'>
//                               {new Date(msg.time).toLocaleString('en-US', {
//                                 hour: 'numeric',
//                                 minute: 'numeric',
//                                 hour12: true
//                               })}
//                             </Typography>
//                           ) : null}
//                         </div>
//                       ) : index === activeUserChat.chat.length - 1 ? (
//                         <Typography key={index} variant='caption'>
//                           {new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
//                         </Typography>
//                       ) : msg.time ? (
//                         <Typography key={index} variant='caption'>
//                           {new Date(msg.time).toLocaleString('en-US', {
//                             hour: 'numeric',
//                             minute: 'numeric',
//                             hour12: true
//                           })}
//                         </Typography>
//                       ) : null)
//                   )}
//                 </div>
//               </div>
//             )
//           })}
//       </CardContent>
//     </ScrollWrapper>
//   )
// }
// export default ChatLog
// // // React Imports
// // import { useRef, useEffect, useState } from 'react'
// // import axios from 'axios'
// // // MUI Imports
// // import Typography from '@mui/material/Typography'
// // import Avatar from '@mui/material/Avatar'
// // import CardContent from '@mui/material/CardContent'
// // // Third-party Imports
// // import classnames from 'classnames'
// // import PerfectScrollbar from 'react-perfect-scrollbar'
// // // Component Imports
// // import CustomAvatar from '@core/components/mui/Avatar'
// // // Util Imports
// // import { getInitials } from '@/utils/getInitials'
// // // API URL
// // const API_URL = 'https://parkmywheelsapi.onrender.com/vendor/'
// // // Formats the chat data into a structured format for display.
// // const formatChatData = (chats, profileUser) => {
// //   const formattedChatData = []
// //   let chatMessageSenderId = chats[0] ? chats[0].senderId : profileUser.id
// //   let msgGroup = {
// //     senderId: chatMessageSenderId,
// //     messages: []
// //   }
// //   chats.forEach((chat, index) => {
// //     if (chatMessageSenderId === chat.senderId) {
// //       msgGroup.messages.push({
// //         time: chat.time,
// //         message: chat.message,
// //         msgStatus: chat.msgStatus
// //       })
// //     } else {
// //       chatMessageSenderId = chat.senderId
// //       formattedChatData.push(msgGroup)
// //       msgGroup = {
// //         senderId: chat.senderId,
// //         messages: [
// //           {
// //             time: chat.time,
// //             message: chat.message,
// //             msgStatus: chat.msgStatus
// //           }
// //         ]
// //       }
// //     }
// //     if (index === chats.length - 1) formattedChatData.push(msgGroup)
// //   })
// //   return formattedChatData
// // }
// // // Wrapper for the chat log to handle scrolling
// // const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef, className }) => {
// //   if (isBelowLgScreen) {
// //     return (
// //       <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
// //         {children}
// //       </div>
// //     )
// //   } else {
// //     return (
// //       <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
// //         {children}
// //       </PerfectScrollbar>
// //     )
// //   }
// // }
// // const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }) => {
// //   // Props
// //   const { profileUser, contacts } = chatStore
// //   const activeUser = chatStore.activeUser
// //   const vendorId = '679b353946ad64e8db173b93'
// //   console.log("vendorId =", vendorId);
// //   // State to store fetched chats
// //   const [chats, setChats] = useState([])
// //   // Refs
// //   const scrollRef = useRef(null)
// //   // Function to scroll to bottom when new message is sent
// //   const scrollToBottom = () => {
// //     if (scrollRef.current) {
// //       if (isBelowLgScreen) {
// //         scrollRef.current.scrollTop = scrollRef.current.scrollHeight
// //       } else {
// //         scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
// //       }
// //     }
// //   }
// //   // Fetch chat messages from API
// //   const fetchChats = async () => {
// //     if (!vendorId) return
// //     try {
// //       const response = await axios.get(`https://parkmywheelsapi.onrender.com/vendor/gethelpvendor/679b353946ad64e8db173b93`)
// //       if (response.status === 200) {
// //         setChats(response.data.helpRequests) // Update state with fetched chats
// //       }
// //     } catch (error) {
// //       console.error('Error fetching chats:', error)
// //     }
// //   }
// //   // Fetch chats when vendor ID changes
// //   useEffect(() => {
// //     if (vendorId) {
// //       fetchChats()
// //     }
// //   }, [vendorId])
// //   // Scroll to bottom when new message arrives
// //   useEffect(() => {
// //     if (chats.length) {
// //       scrollToBottom()
// //     }
// //   }, [chats])
// //   return (
// //     <ScrollWrapper
// //       isBelowLgScreen={isBelowLgScreen}
// //       scrollRef={scrollRef}
// //       className='bg-[var(--mui-palette-customColors-chatBg)]'
// //     >
// //       <CardContent className='p-0'>
// //         {chats.length > 0 ? (
// //           formatChatData(chats, profileUser).map((msgGroup, index) => {
// //             const isSender = msgGroup.senderId === profileUser.id
// //             return (
// //               <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
// //                 {!isSender ? (
// //                   contacts.find(contact => contact.id === activeUser?.id)?.avatar ? (
// //                     <Avatar
// //                       alt={contacts.find(contact => contact.id === activeUser?.id)?.fullName}
// //                       src={contacts.find(contact => contact.id === activeUser?.id)?.avatar}
// //                       className='is-8 bs-8'
// //                     />
// //                   ) : (
// //                     <CustomAvatar
// //                       color={contacts.find(contact => contact.id === activeUser?.id)?.avatarColor}
// //                       skin='light'
// //                       size={32}
// //                     >
// //                       {getInitials(contacts.find(contact => contact.id === activeUser?.id)?.fullName)}
// //                     </CustomAvatar>
// //                   )
// //                 ) : profileUser.avatar ? (
// //                   <Avatar alt={profileUser.fullName} src={profileUser.avatar} className='is-8 bs-8' />
// //                 ) : (
// //                   <CustomAvatar alt={profileUser.fullName} src={profileUser.avatar} size={32} />
// //                 )}
// //                 <div
// //                   className={classnames('flex flex-col gap-2', {
// //                     'items-end': isSender,
// //                     'max-is-[65%]': !isBelowMdScreen,
// //                     'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
// //                     'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
// //                   })}
// //                 >
// //                   {msgGroup.messages.map((msg, index) => (
// //                     <Typography
// //                       key={index}
// //                       className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
// //                         'bg-backgroundPaper rounded-e-lg rounded-b-lg': !isSender,
// //                         'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s-lg rounded-b-lg': isSender
// //                       })}
// //                       style={{ wordBreak: 'break-word' }}
// //                     >
// //                       {msg.message}
// //                     </Typography>
// //                   ))}
// //                   {msgGroup.messages.map((msg, index) =>
// //                     index === msgGroup.messages.length - 1 ? (
// //                       <div key={index} className='flex items-center gap-2'>
// //                         {msg.msgStatus?.isSeen ? (
// //                           <i className='ri-check-double-line text-success text-base' />
// //                         ) : msg.msgStatus?.isDelivered ? (
// //                           <i className='ri-check-double-line text-base' />
// //                         ) : (
// //                           msg.msgStatus?.isSent && <i className='ri-check-line text-base' />
// //                         )}
// //                         <Typography variant='caption'>
// //                           {msg.time
// //                             ? new Date(msg.time).toLocaleString('en-US', {
// //                               hour: 'numeric',
// //                               minute: 'numeric',
// //                               hour12: true
// //                             })
// //                             : new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
// //                         </Typography>
// //                       </div>
// //                     ) : null
// //                   )}
// //                 </div>
// //               </div>
// //             )
// //           })
// //         ) : (
// //           <Typography variant='body2' className='text-center p-5'>
// //             No messages yet.
// //           </Typography>
// //         )}
// //       </CardContent>
// //     </ScrollWrapper>
// //   )
// // }
// // export default ChatLog
// React Imports
// import { useEffect, useRef, useState } from 'react'
// import axios from 'axios'
// // MUI Imports
// import Typography from '@mui/material/Typography'
// import Avatar from '@mui/material/Avatar'
// import CardContent from '@mui/material/CardContent'
// // Third-party Imports
// import classnames from 'classnames'
// import PerfectScrollbar from 'react-perfect-scrollbar'
// // Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'
// // Util Imports
// import { getInitials } from '@/utils/getInitials'
// // Formats the chat data into a structured format for display.
// const formatChatData = (chats, profileUser) => {
//   const formattedChatData = []
//   let chatMessageSenderId = chats[0] ? chats[0].sender : profileUser.id
//   let msgGroup = { senderId: chatMessageSenderId, messages: [] }
//   chats.forEach((chat, index) => {
//     if (chatMessageSenderId === chat.sender) {
//       msgGroup.messages.push({ time: chat.time, message: chat.message })
//     } else {
//       chatMessageSenderId = chat.sender
//       formattedChatData.push(msgGroup)
//       msgGroup = { senderId: chat.sender, messages: [{ time: chat.time, message: chat.message }] }
//     }
//     if (index === chats.length - 1) formattedChatData.push(msgGroup)
//   })
//   return formattedChatData
// }
// // Wrapper for the chat log to handle scrolling
// const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef, className }) => {
//   if (isBelowLgScreen) {
//     return (
//       <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
//         {children}
//       </div>
//     )
//   } else {
//     return (
//       <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
//         {children}
//       </PerfectScrollbar>
//     )
//   }
// }
// const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }) => {
//   // Props
//   const { profileUser, contacts } = chatStore
//   const activeUser = chatStore.activeUser
//   // States
//   const [messages, setMessages] = useState([])
//   const [loading, setLoading] = useState(true)
//   // Refs
//   const scrollRef = useRef(null)
//   // Function to scroll to bottom when new message is sent
//   const scrollToBottom = () => {
//     if (scrollRef.current) {
//       if (isBelowLgScreen) {
//         scrollRef.current.scrollTop = scrollRef.current.scrollHeight
//       } else {
//         scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
//       }
//     }
//   }
//   // Fetch previous chat messages
//   useEffect(() => {
//     if (activeUser) {
//       fetchMessages()
//     }
//   }, [activeUser])
//   const fetchMessages = async () => {
//     try {
//       setLoading(true)
//       const response = await axios.get(`https://parkmywheelsapi.onrender.com/vendor/gethelpvendor/${activeUser.id}`)
//       const helpRequests = response.data.helpRequests || []
//       // Extract messages from chatbox arrays
//       const extractedMessages = helpRequests.flatMap(request =>
//         request.chatbox.map(chat => ({
//           sender: request.vendorid, // Assuming vendor is the sender
//           message: chat.message,
//           time: chat.time,
//           image: chat.image // In case there's an image
//         }))
//       )
//       setMessages(extractedMessages)
//     } catch (error) {
//       console.error('Error fetching messages:', error)
//     } finally {
//       setLoading(false)
//     }
//   }
//   // Scroll to bottom when messages update
//   useEffect(() => {
//     if (messages.length) {
//       scrollToBottom()
//     }
//   }, [messages])
//   return (
//     <ScrollWrapper
//       isBelowLgScreen={isBelowLgScreen}
//       scrollRef={scrollRef}
//       className='bg-[var(--mui-palette-customColors-chatBg)]'
//     >
//       <CardContent className='p-0'>
//         {loading ? (
//           <Typography className='p-5'>Loading messages...</Typography>
//         ) : messages.length === 0 ? (
//           <Typography className='p-5'>No previous messages found.</Typography>
//         ) : (
//           formatChatData(messages, profileUser).map((msgGroup, index) => {
//             const isSender = msgGroup.senderId === profileUser.id
//             return (
//               <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
//                 {!isSender ? (
//                   contacts.find(contact => contact.id === activeUser?.id)?.avatar ? (
//                     <Avatar
//                       alt={contacts.find(contact => contact.id === activeUser?.id)?.fullName}
//                       src={contacts.find(contact => contact.id === activeUser?.id)?.avatar}
//                       className='is-8 bs-8'
//                     />
//                   ) : (
//                     <CustomAvatar
//                       color={contacts.find(contact => contact.id === activeUser?.id)?.avatarColor}
//                       skin='light'
//                       size={32}
//                     >
//                       {getInitials(contacts.find(contact => contact.id === activeUser?.id)?.fullName)}
//                     </CustomAvatar>
//                   )
//                 ) : profileUser.avatar ? (
//                   <Avatar alt={profileUser.fullName} src={profileUser.avatar} className='is-8 bs-8' />
//                 ) : (
//                   <CustomAvatar alt={profileUser.fullName} src={profileUser.avatar} size={32} />
//                 )}
//                 <div
//                   className={classnames('flex flex-col gap-2', {
//                     'items-end': isSender,
//                     'max-is-[65%]': !isBelowMdScreen,
//                     'max-is-[75%]': isBelowMdScreen && !isBelowSmScreen,
//                     'max-is-[calc(100%-5.75rem)]': isBelowSmScreen
//                   })}
//                 >
//                   {msgGroup.messages.map((msg, index) => (
//                     <Typography
//                       key={index}
//                       className={classnames('whitespace-pre-wrap pli-4 plb-2 shadow-xs', {
//                         'bg-backgroundPaper rounded-e-lg rounded-b-lg': !isSender,
//                         'bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s-lg rounded-b-lg': isSender
//                       })}
//                       style={{ wordBreak: 'break-word' }}
//                     >
//                       {msg.message}
//                     </Typography>
//                   ))}
//                   {msgGroup.messages.map(
//                     (msg, index) =>
//                       index === msgGroup.messages.length - 1 && (
//                         <Typography key={index} variant='caption' className='text-gray-500'>
//                           {new Date(msg.time).toLocaleString('en-US', {
//                             hour: 'numeric',
//                             minute: 'numeric',
//                             hour12: true
//                           })}
//                         </Typography>
//                       )
//                   )}
//                 </div>
//               </div>
//             )
//           })
//         )}
//       </CardContent>
//     </ScrollWrapper>
//   )
// }
// export default ChatLog
// import { useEffect, useRef, useState } from 'react'
// import axios from 'axios'
// // MUI Imports
// import Typography from '@mui/material/Typography'
// import Avatar from '@mui/material/Avatar'
// import CardContent from '@mui/material/CardContent'
// // Third-party Imports
// import classnames from 'classnames'
// import PerfectScrollbar from 'react-perfect-scrollbar'
// // Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'
// // Util Imports
// import { getInitials } from '@/utils/getInitials'
// const formatChatData = (chats, profileUser) => {
//   const formattedChatData = []
//   let chatMessageSenderId = chats[0] ? chats[0].sender : profileUser.id
//   let msgGroup = { senderId: chatMessageSenderId, messages: [] }
//   chats.forEach((chat, index) => {
//     if (chatMessageSenderId === chat.sender) {
//       msgGroup.messages.push({ time: chat.time, message: chat.message, image: chat.image })
//     } else {
//       chatMessageSenderId = chat.sender
//       formattedChatData.push(msgGroup)
//       msgGroup = { senderId: chat.sender, messages: [{ time: chat.time, message: chat.message, image: chat.image }] }
//     }
//     if (index === chats.length - 1) formattedChatData.push(msgGroup)
//   })
//   return formattedChatData
// }
// const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef, className }) => {
//   return isBelowLgScreen ? (
//     <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
//       {children}
//     </div>
//   ) : (
//     <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
//       {children}
//     </PerfectScrollbar>
//   )
// }
// const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }) => {
//   const { profileUser, contacts } = chatStore
//   const activeUser = chatStore.activeUser
//   const [messages, setMessages] = useState([])
//   const [loading, setLoading] = useState(true)
//   const scrollRef = useRef(null)
//   const scrollToBottom = () => {
//     if (scrollRef.current) {
//       if (isBelowLgScreen) {
//         scrollRef.current.scrollTop = scrollRef.current.scrollHeight
//       } else {
//         scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
//       }
//     }
//   }
//   useEffect(() => {
//     if (activeUser) {
//       fetchMessages()
//     }
//   }, [activeUser])
//   const fetchMessages = async () => {
//     try {
//       setLoading(true)
//       const response = await axios.get(`https://parkmywheelsapi.onrender.com/vendor/gethelpvendor/${activeUser.id}`)
//       const helpRequests = response.data.helpRequests || []
//       const extractedMessages = helpRequests.flatMap(request =>
//         request.chatbox.map(chat => ({
//           sender: request.vendorid,
//           message: chat.message,
//           time: chat.time,
//           image: chat.image
//         }))
//       )
//       setMessages(extractedMessages)
//     } catch (error) {
//       console.error('Error fetching messages:', error)
//     } finally {
//       setLoading(false)
//     }
//   }
//   useEffect(() => {
//     if (messages.length) {
//       scrollToBottom()
//     }
//   }, [messages])
//   return (
//     <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={scrollRef} className='bg-[var(--mui-palette-customColors-chatBg)]'>
//       <CardContent className='p-0'>
//         {loading ? (
//           <Typography className='p-5'>Loading messages...</Typography>
//         ) : messages.length === 0 ? (
//           <Typography className='p-5'>No previous messages found.</Typography>
//         ) : (
//           formatChatData(messages, profileUser).map((msgGroup, index) => {
//             const isSender = msgGroup.senderId === profileUser.id
//             return (
//               <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
//                 {!isSender ? (
//                   contacts.find(contact => contact.id === activeUser?.id)?.avatar ? (
//                     <Avatar src={contacts.find(contact => contact.id === activeUser?.id)?.avatar} className='is-8 bs-8' />
//                   ) : (
//                     <CustomAvatar color={contacts.find(contact => contact.id === activeUser?.id)?.avatarColor} skin='light' size={32}>
//                       {getInitials(contacts.find(contact => contact.id === activeUser?.id)?.fullName)}
//                     </CustomAvatar>
//                   )
//                 ) : profileUser.avatar ? (
//                   <Avatar src={profileUser.avatar} className='is-8 bs-8' />
//                 ) : (
//                   <CustomAvatar alt={profileUser.fullName} src={profileUser.avatar} size={32} />
//                 )}
//                 <div className={classnames('flex flex-col gap-2', { 'items-end': isSender, 'max-w-[65%]': !isBelowMdScreen })}>
//                   {msgGroup.messages.map((msg, index) => (
//                     <div key={index} className='whitespace-pre-wrap pli-4 plb-2 shadow-xs'>
//                       {msg.image ? (
//                         <img src={msg.image} alt='Sent Image' className='max-w-[250px] rounded-lg' />
//                       ) : (
//                         <Typography className={classnames({ 'bg-backgroundPaper rounded-e-lg rounded-b-lg': !isSender, 'bg-primary text-white rounded-s-lg rounded-b-lg': isSender })}>
//                           {msg.message}
//                         </Typography>
//                       )}
//                     </div>
//                   ))}
//                   <Typography variant='caption' className='text-gray-500'>
//                     {new Date(msgGroup.messages[msgGroup.messages.length - 1].time).toLocaleString('en-US', {
//                       hour: 'numeric',
//                       minute: 'numeric',
//                       hour12: true
//                     })}
//                   </Typography>
//                 </div>
//               </div>
//             )
//           })
//         )}
//       </CardContent>
//     </ScrollWrapper>
//   )
// }
// export default ChatLog








import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
// MUI Imports
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'
// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
// Util Imports
import { getInitials } from '@/utils/getInitials'

const formatChatData = (chats, profileUser) => {
  const formattedChatData = []
  let chatMessageSenderId = chats[0] ? chats[0].sender : profileUser.id
  let msgGroup = { senderId: chatMessageSenderId, messages: [] }
  chats.forEach((chat, index) => {
    if (chatMessageSenderId === chat.sender) {
      msgGroup.messages.push({ time: chat.time, message: chat.message, image: chat.image })
    } else {
      chatMessageSenderId = chat.sender
      formattedChatData.push(msgGroup)
      msgGroup = { senderId: chat.sender, messages: [{ time: chat.time, message: chat.message, image: chat.image }] }
    }
    if (index === chats.length - 1) formattedChatData.push(msgGroup)
  })
  return formattedChatData
}

const ScrollWrapper = ({ children, isBelowLgScreen, scrollRef, className }) => {
  return isBelowLgScreen ? (
    <div ref={scrollRef} className={classnames('bs-full overflow-y-auto overflow-x-hidden', className)}>
      {children}
    </div>
  ) : (
    <PerfectScrollbar ref={scrollRef} options={{ wheelPropagation: false }} className={className}>
      {children}
    </PerfectScrollbar>
  )
}

const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }) => {
  const { profileUser, contacts } = chatStore
  const activeUser = chatStore.activeUser
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      if (isBelowLgScreen) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      } else {
        scrollRef.current._container.scrollTop = scrollRef.current._container.scrollHeight
      }
    }
  }

  useEffect(() => {
    if (activeUser) {
      setMessages([]) // Clear previous messages when switching users
      fetchMessages()
    } else {
      setMessages([]) // Ensure messages are cleared if no active user
    }
  }, [activeUser])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`https://parkmywheelsapi.onrender.com/vendor/gethelpvendor/${activeUser.id}`)
      const helpRequests = response.data.helpRequests || []
      const extractedMessages = helpRequests.flatMap(request =>
        request.chatbox.map(chat => ({
          sender: request.vendorid,
          message: chat.message,
          time: chat.time,
          image: chat.image
        }))
      )
      setMessages(extractedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (messages.length) {
      scrollToBottom()
    }
  }, [messages])

  return (
    <ScrollWrapper isBelowLgScreen={isBelowLgScreen} scrollRef={scrollRef} className='bg-[var(--mui-palette-customColors-chatBg)]'>
      <CardContent className='p-0'>
        {loading ? (
          <Typography className='p-5'>Loading messages...</Typography>
        ) : messages.length === 0 ? (
          <Typography className='p-5'>No previous messages found.</Typography>
        ) : (
          formatChatData(messages, profileUser).map((msgGroup, index) => {
            const isSender = msgGroup.senderId === profileUser.id
            return (
              <div key={index} className={classnames('flex gap-4 p-5', { 'flex-row-reverse': isSender })}>
                {!isSender ? (
                  contacts.find(contact => contact.id === msgGroup.senderId)?.avatar ? (
                    <Avatar src={contacts.find(contact => contact.id === msgGroup.senderId)?.avatar} className='is-8 bs-8' />
                  ) : (
                    <CustomAvatar color={contacts.find(contact => contact.id === msgGroup.senderId)?.avatarColor} skin='light' size={32}>
                      {getInitials(contacts.find(contact => contact.id === msgGroup.senderId)?.fullName)}
                    </CustomAvatar>
                  )
                ) : profileUser.avatar ? (
                  <Avatar src={profileUser.avatar} className='is-8 bs-8' />
                ) : (
                  <CustomAvatar alt={profileUser.fullName} src={profileUser.avatar} size={32} />
                )}
                <div className={classnames('flex flex-col gap-2', { 'items-end': isSender, 'max-w-[65%]': !isBelowMdScreen })}>
                  {msgGroup.messages.map((msg, index) => (
                    <div key={index} className='whitespace-pre-wrap pli-4 plb-2 shadow-xs'>
                      {msg.image ? (
                        <img src={msg.image} alt='Sent Image' className='max-w-[250px] rounded-lg' />
                      ) : (
                        <Typography className={classnames({ 'bg-backgroundPaper rounded-e-lg rounded-b-lg': !isSender, 'bg-primary text-white rounded-s-lg rounded-b-lg': isSender })}>
                          {msg.message}
                        </Typography>
                      )}
                      <Typography variant='caption' className='text-gray-500'>
                        {new Date(msg.time).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </ScrollWrapper>
  )
}

export default ChatLog
