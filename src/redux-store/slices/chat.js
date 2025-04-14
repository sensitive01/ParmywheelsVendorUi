// // Third-party Imports
// import { createSlice } from '@reduxjs/toolkit'
// // Data Imports
// import { db } from '@/fake-db/apps/chat'
// export const chatSlice = createSlice({
//   name: 'chat',
//   initialState: db,
//   reducers: {
//     getActiveUserData: (state, action) => {
//       const activeUser = state.contacts.find(user => user.id === action.payload)
//       const chat = state.chats.find(chat => chat.userId === action.payload)
//       if (chat && chat.unseenMsgs > 0) {
//         chat.unseenMsgs = 0
//       }
//       if (activeUser) {
//         state.activeUser = activeUser
//       }
//     },
//     addNewChat: (state, action) => {
//       const { id } = action.payload
//       state.contacts.find(contact => {
//         if (contact.id === id && !state.chats.find(chat => chat.userId === contact.id)) {
//           state.chats.unshift({
//             id: state.chats.length + 1,
//             userId: contact.id,
//             unseenMsgs: 0,
//             chat: []
//           })
//         }
//       })
//     },
//     setUserStatus: (state, action) => {
//       state.profileUser = {
//         ...state.profileUser,
//         status: action.payload.status
//       }
//     },
//     sendMsg: (state, action) => {
//       const { msg } = action.payload
//       const existingChat = state.chats.find(chat => chat.userId === state.activeUser?.id)
//       if (existingChat) {
//         existingChat.chat.push({
//           message: msg,
//           time: new Date(),
//           senderId: state.profileUser.id,
//           msgStatus: {
//             isSent: true,
//             isDelivered: false,
//             isSeen: false
//           }
//         })
//         // Remove the chat from its current position
//         state.chats = state.chats.filter(chat => chat.userId !== state.activeUser?.id)
//         // Add the chat back to the beginning of the array
//         state.chats.unshift(existingChat)
//       }
//     }
//   }
// })
// export const { getActiveUserData, addNewChat, setUserStatus, sendMsg } = chatSlice.actions
// export default chatSlice.reducer
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// const API_URL = process.env.NEXT_PUBLIC_API_URL
// // Async Thunk: Send Message to Vendor and create support request
// export const sendMessageToVendor = createAsyncThunk(
//   'chat/sendMessageToVendor',
//   async (messageData, { rejectWithValue }) => {
//     try {
//       const { vendorid, description } = messageData;
//       // Call the API to create the vendor help and support request
//       const response = await fetch(`${API_URL}/vendor/createhelpvendor`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           vendorid,
//           description, // Use 'description' instead of 'message'
//         }),
//       })
//       const result = await response.json()
//       if (!response.ok) {
//         throw new Error(result.message || 'Failed to send message')
//       }
//       return result.helpRequest
//     } catch (error) {
//       return rejectWithValue(error.message)
//     }
//   }
// )
// // Async Thunk: Fetch Vendor Contacts
// export const fetchVendors = createAsyncThunk('chat/fetchVendors', async (_, { rejectWithValue }) => {
//   try {
//     const response = await fetch(`${API_URL}/vendor/fetch-all-vendor-data`)
//     const result = await response.json()
//     if (!response.ok) {
//       throw new Error(result.message || 'Failed to fetch vendors')
//     }
//     // Extract only name, email (contact), and vendor ID
//     return result.data.map(vendor => ({
//       id: vendor._id,
//       fullName: vendor.vendorName,
//       email: vendor.contacts.length > 0 ? vendor.contacts[0].mobile : 'N/A',
//       avatar: vendor.image || '/default-avatar.png',
//       status: 'online', // Default status
//       role: 'Vendor'
//     }))
//   } catch (error) {
//     return rejectWithValue(error.message)
//   }
// })
// export const chatSlice = createSlice({
//   name: 'chat',
//   initialState: {
//     contacts: [],
//     chats: [],
//     activeUser: null,
//     profileUser: {},
//     status: 'idle',
//     error: null,
//   },
//   reducers: {
//     getActiveUserData: (state, action) => {
//       const activeUser = state.contacts.find(user => user.id === action.payload)
//       const chat = state.chats.find(chat => chat.userId === action.payload)
//       if (chat && chat.unseenMsgs > 0) {
//         chat.unseenMsgs = 0
//       }
//       if (activeUser) {
//         state.activeUser = activeUser
//       }
//     },
//     addNewChat: (state, action) => {
//       const { id } = action.payload
//       state.contacts.find(contact => {
//         if (contact.id === id && !state.chats.find(chat => chat.userId === contact.id)) {
//           state.chats.unshift({
//             id: state.chats.length + 1,
//             userId: contact.id,
//             unseenMsgs: 0,
//             chat: []
//           })
//         }
//       })
//     },
//     setUserStatus: (state, action) => {
//       state.profileUser = {
//         ...state.profileUser,
//         status: action.payload.status
//       }
//     },
//     sendMsg: (state, action) => {
//       const { msg } = action.payload
//       const existingChat = state.chats.find(chat => chat.userId === state.activeUser?.id)
//       if (existingChat) {
//         existingChat.chat.push({
//           message: msg,
//           time: new Date(),
//           senderId: state.profileUser.id,
//           msgStatus: {
//             isSent: true,
//             isDelivered: false,
//             isSeen: false
//           }
//         })
//         // Remove the chat from its current position
//         state.chats = state.chats.filter(chat => chat.userId !== state.activeUser?.id)
//         // Add the chat back to the beginning of the array
//         state.chats.unshift(existingChat)
//       }
//     }
//   },
//   extraReducers: builder => {
//     builder
//       .addCase(fetchVendors.pending, state => {
//         state.status = 'loading'
//       })
//       .addCase(fetchVendors.fulfilled, (state, action) => {
//         state.status = 'succeeded'
//         state.contacts = action.payload // Store fetched vendors as contacts
//       })
//       .addCase(fetchVendors.rejected, (state, action) => {
//         state.status = 'failed'
//         state.error = action.payload
//       })
//       .addCase(sendMessageToVendor.pending, state => {
//         state.status = 'loading'
//       })
//       .addCase(sendMessageToVendor.fulfilled, (state, action) => {
//         state.status = 'succeeded'
//         // Optionally handle the help request data here
//         console.log(action.payload)  // You can add this to the state if needed
//       })
//       .addCase(sendMessageToVendor.rejected, (state, action) => {
//         state.status = 'failed'
//         state.error = action.payload
//       })
//   }
// })
// export const { getActiveUserData, addNewChat, setUserStatus, sendMsg } = chatSlice.actions
// export default chatSlice.reducer
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_URL = process.env.NEXT_PUBLIC_API_URL


// Async Thunk: Create Vendor Help Support Request
export const sendMessageToVendor = createAsyncThunk(
  'chat/sendMessageToVendor',
  async (requestData, { rejectWithValue }) => {
    try {
      const { vendorid, description, vendoractive = true, chatbox = [] } = requestData;

      const response = await fetch(`${API_URL}/vendor/createhelpvendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorid,
          description,
          vendoractive,
          chatbox: chatbox.map(chat => ({
            vendorid: chat.vendorid,
            message: chat.message,
            image: chat.image || null,
            time: chat.time || new Date().toLocaleTimeString(),
          }))
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create help request');
      }

      
return result.helpRequest;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk: Fetch Vendor Contacts
export const fetchVendors = createAsyncThunk('chat/fetchVendors', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/vendor/fetch-all-vendor-data`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch vendors');
    }

    
return result.data.map(vendor => ({
      id: vendor._id,
      fullName: vendor.vendorName,
      email: vendor.contacts.length > 0 ? vendor.contacts[0].mobile : 'N/A',
      avatar: vendor.image || '/default-avatar.png',
      status: 'online',
      role: 'Vendor'
    }));
  } catch (error) {
    return rejectWithValue(error.message);
  }
});
export const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    contacts: [],
    chats: [],
    activeUser: null,
    profileUser: {},
    status: 'idle',
    error: null,
  },
  reducers: {
    getActiveUserData: (state, action) => {
      const activeUser = state.contacts.find(user => user.id === action.payload);
      const chat = state.chats.find(chat => chat.userId === action.payload);

      if (chat && chat.unseenMsgs > 0) {
        chat.unseenMsgs = 0;
      }

      if (activeUser) {
        state.activeUser = activeUser;
      }
    },
    addNewChat: (state, action) => {
      const { id } = action.payload;

      state.contacts.find(contact => {
        if (contact.id === id && !state.chats.find(chat => chat.userId === contact.id)) {
          state.chats.unshift({
            id: state.chats.length + 1,
            userId: contact.id,
            unseenMsgs: 0,
            chat: []
          });
        }
      });
    },
    setUserStatus: (state, action) => {
      state.profileUser = {
        ...state.profileUser,
        status: action.payload.status
      };
    },
    sendMsg: (state, action) => {
      const { msg } = action.payload;
      const existingChat = state.chats.find(chat => chat.userId === state.activeUser?.id);

      if (existingChat) {
        existingChat.chat.push({
          message: msg,
          time: new Date(),
          senderId: state.profileUser.id,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        });
        state.chats = state.chats.filter(chat => chat.userId !== state.activeUser?.id);
        state.chats.unshift(existingChat);
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchVendors.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.contacts = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(sendMessageToVendor.pending, state => {
        state.status = 'loading';
      })
      .addCase(sendMessageToVendor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log(action.payload);
      })
      .addCase(sendMessageToVendor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});
export const { getActiveUserData, addNewChat, setUserStatus, sendMsg } = chatSlice.actions;
export default chatSlice.reducer;
