import React, { createContext, useContext, useState } from 'react';

// Create a context
const ChatContext = createContext();

// Create a provider component
const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [friend, setFriend] = useState(null);
  const [groupAdd, setGroupAdd] = useState()
  const [groupChat, setGroupChat] = useState(null)
  
  const [newMember, setNewMember] = useState([]);
  
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <ChatContext.Provider value={{ user, setUser,friend, setFriend, selectedChat, setSelectedChat,groupAdd, setGroupAdd,groupChat, setGroupChat,newMember, setNewMember }}>
      {children}
    </ChatContext.Provider>
  );
};

// Create a custom hook to consume the context
export const Chatstate = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('Chatstate must be used within a ChatProvider');
  }
  return context;
};
export default ChatProvider