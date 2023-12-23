
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Content from './Content'; // Import your Content component
import { Chatstate } from '../ChatProvider';
import { Collapse } from 'antd';

const { Panel } = Collapse;
const LargeSidebar = () => {
  const { friend, setFriend, setSelectedChat, user, setGroupAdd, groupChat, setGroupChat,newMember } = Chatstate();
  const [chats, setChats] = useState([]);
  const [userDetails, setUserDetails] = useState(user); // Assuming user details are available in the Chatstate
  const userId = localStorage.getItem("userId")

  const fetchChats = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const res = await axios.get('https://slack-clone-app-server.onrender.com/api/v1/chat', config);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setChats(res.data);
      } else {
        // Handle the case where res.data is not an array or is empty
      }
    } catch (error) {
      // Handle the error
      console.error('Error fetching chats:', error);
    }
  };

  useEffect(() => {
    fetchChats();
    setUserDetails(userId);
  }, [fetchChats]);
  useEffect(() => {
    fetchChats();
    setUserDetails(userId);
  }, [newMember]);

  const token = localStorage.getItem('token');

  const handleChatClick = (filteredUser, chat) => {
    setGroupChat(null)
    setSelectedChat(chat);
    setGroupAdd()
    setFriend(filteredUser);
  };
  const handleGroupChat = (chat) => {
    setSelectedChat(chat);
    setGroupChat(chat)
    setFriend(null);
    setGroupAdd()

  };
  const handleGroupAdd = () => {
    setGroupAdd(true)
    setGroupChat()
    setFriend()

  }
  return (
    <div className="largesidebar-wrapper">
  <div className="largesidebar-inner-wrapper">
    <div className="headline-wrapper">
      <p className="headline">Messages </p>
      <i onClick={() => { handleGroupAdd() }} className="ri-edit-2-line"></i>
    </div>
    <br />
    <br />
    <br />
    <div className="messages allmsgs">
      <h2 style={{textAlign:"center"}}>All Chats</h2>
<br/>
      <hr></hr>
      <br />
      <Collapse accordion>
            <Panel header="Groups" key="1">
              {chats &&
                chats.map((chat) => (
                  <React.Fragment key={chat.id}>
                    {chat.isGroupChat && (
                      <div className='singleMessage chatname' onClick={() => handleGroupChat(chat)}>
                        <img src={chat.pic} alt={chat.chatName} />
                        <p>{chat.chatName}</p>
                      </div>
                    )}
                  </React.Fragment>
                ))}
            </Panel>

            <Panel header="Users" key="2">
              {chats &&
                chats.map((chat) => (
                  <React.Fragment key={chat.id}>
                    {!chat.isGroupChat &&
                      chat.users &&
                      chat.users
                        .filter((user) => user._id !== userDetails)
                        .map((filteredUser) => (
                          <div className='singleMessage chatname' onClick={() => handleChatClick(filteredUser, chat)} key={filteredUser.userId}>
                            <img src={filteredUser.pic} alt={filteredUser.name} />
                            <div className="online"></div>
                            <p>{filteredUser.name}</p>
                          </div>
                        ))}
                  </React.Fragment>
                ))}
            </Panel>
          </Collapse>
      <br />
      {chats &&
            chats.map((chat) => (
              <div key={chat.id} className="singleMessage">
                {chat.isGroupChat ? ( 
                  <>
                    <div className='singleMessage chatname' onClick={() => handleGroupChat(chat)}>
                      <img src={chat.pic} />
                      <p>{chat.chatName}</p>
                    </div>
                    <br />
                  </>
                ) : (
                  chat.users &&
                  chat.users
                    .filter((user) => user._id !== userDetails)
                    .map((filteredUser) => (
                      <React.Fragment key={filteredUser.userId}>
                        <div className='singleMessage chatname'  onClick={() => handleChatClick(filteredUser, chat)}>
                          <img src={filteredUser.pic} alt={filteredUser.name} />
                          {filteredUser.status === "Online"&&<>
                          <div className="online"></div>
                          </>}
                          <p>
                            {filteredUser.name}
                          </p>
                        </div>
                        <br />
                      </React.Fragment>
                    ))
                )}
              </div>
            ))}

    </div>
  </div>
</div>

  );
};

export default LargeSidebar;
