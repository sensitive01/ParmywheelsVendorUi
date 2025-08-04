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
      const response = await axios.get(`https://api.parkmywheels.com/vendor/gethelpvendor/${activeUser.id}`)
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
