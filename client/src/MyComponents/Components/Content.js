import React, { useState, useEffect, useRef } from 'react';
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import FroalaEditor from 'react-froala-wysiwyg';
import axios from 'axios';
import { Chatstate } from '../ChatProvider.js';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Table, Form, Upload, Spin, message, Alert, Drawer, Popconfirm } from 'antd';
import Input from 'antd/es/input/Input';
import Header from './Header.js';
import { PlusOutlined, CheckCircleOutlined, UserDeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import io from "socket.io-client"
import { Link } from "react-router-dom"

const ENDPOINT = "http://localhost:9000";
var socket, selectedChatCompare;
const Content = () => {

  const { user, friend, selectedChat, groupAdd, setGroupAdd, groupChat, setGroupChat, setFriend } = Chatstate();
  const [chatData, setChatData] = useState("");
  const [typing, setTyping] = useState()
  const [isTyping, setisTyping] = useState()
  const [imgUpload, setimgUpload] = useState()
  const [profilePic, setProfilePic] = useState(null)
  const [details, setDetails] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem("userId")
  const [searchWord, setSearchWord] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [groupChatName, setgroupChatName] = useState();
  const [status, setStatus] = useState(false);
  const [action, setAction] = useState(false);
  const [pic, setPic] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [Sucess, setSucess] = useState("")
  const [Error, setError] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [SucessMessage, setSucessMessage] = useState("")
  const [socketConnected, setSocketConnected] = useState(false)
  useEffect(() => {
    selectedChatCompare = selectedChat
    loadMessage();
  }, [selectedChat]);

  const loadMessage = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      // Set loading to true before making the request
      setLoading("loadingMessages");

      const res = await axios.get(`http://localhost:9000/api/v1/message/${selectedChat._id}`, config);
      if (res) {
        console.log(selectedChat._id)
        setLoading(false);

        setMessages(res.data);
        socket.emit('join chat', selectedChat._id)

      }
      // console.log(res)
    } catch (error) {
      // Set loading to false on request failure
      setLoading(false);

      console.error('Error loading messages:', error);
    }
  };
  const [messageApi, contextHolder] = message.useMessage();
  const editorRef = useRef(null);
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", userId);
    socket.on('connection', () => { setSocketConnected(true) })
    socket.on('typing', () => setisTyping(false))
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchWord.trim() !== '') {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300); // Adjust the delay according to your needs

    return () => clearTimeout(delayDebounceFn);
  }, [searchWord]);


  useEffect(() => {
    if (selectedChat) {
      setChatData((prevChatData) => {
        const updatedChatData = { ...prevChatData, ...selectedChat };
        return updatedChatData;
      });

      setDetails((prevDetails) => ({
        ...prevDetails,
        chatId: selectedChat._id,
      }));
    }
  }, [selectedChat]);
  useEffect(() => {
    socket.on('messageReceived', (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        // Notification
        console.log("not set")
      } else {
        setMessages([...messages, newMessageReceived])
        console.log('sett')
      }
    });
  }, [messages]);
  const messagesContainerRef = useRef();

  useEffect(() => {
    // Scroll to the bottom when component mounts or when messages change
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleMessage = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      // Set loading to true before making the request
      setLoading("loadmsg");

      // Send a message with content and image URL
      const res = await axios.post(`http://localhost:9000/api/v1/message`, {
        content: details.content,
        chatId: details.chatId,
        imageUrl: imageUrl,
      }, config);

      // Reset loading state to false after the request is complete
      setLoading(false);

      // Load updated messages
      loadMessage();
      socket.emit('new message', res)

      setDetails({
        ...details,
        content: '', // Reset content to an empty string
      });
      editorRef.current.clear();
      setImageUrl();
    } catch (error) {
      // Reset loading state to false on request failure
      setLoading(false);

      console.error('Error sending message:', error);
    } finally {
      setLoading(false)
    }
  };

  const handleContent = (e) => {
    setDetails({ ...details, ["content"]: e })
  }

  const searchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/api/v1/search?word=${searchWord}`, {
        headers: {
          'user-id': userId
        }
      });
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleInputChange = (e) => {
    setSearchWord(e.target.value);
  };


  const handleChat = async (user) => {
    if (!groupUsers.includes(user._id)) {
      setGroupUsers([...groupUsers, user._id]);
    }

  }
  const ChatNameHandler = (e) => {
    setgroupChatName(e.target.value)
  }
  const submitData = async () => {
    setSucess(null)
    setError(null)
    setLoading("DataLoading")
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.post('http://localhost:9000/api/v1/group', {
        name: groupChatName, // Provide a name for the group chat
        users: JSON.stringify(groupUsers),
        pic: pic
      }, config);
      console.log(response.data.message)
      const sucessMessage = response.data.message;
      message.success('Group Created Sucessfully!');
      // setSucess(sucessMessage)
      setGroupChat()
      setFriend()
      setGroupAdd(false)
    setLoading(null)


    } catch (error) {
      console.error(error.response.data.message);
      const msgError = error.response.data.message;
      message.error('Group Creation Failed! Please Fill All Details');

      // setError(msgError)
    }
  }
  const handleProfile = () => {
    setStatus(true)
  }
  const cloudinaryConfiguration = {
    cloudName: 'dcnam8mwd',
    apiKey: 'gNB3SUQcqpoCyWaeXDFGExjwhZM',
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      // Set loading to true before starting the upload
      setLoading("picload");

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'usersimage');

      const response = await axios.post('https://api.cloudinary.com/v1_1/dcnam8mwd/image/upload', formData);

      // Set loading to false after the upload is complete
      setLoading(false);

      if (response.status === 200) {
        const imageURL = response.data.secure_url;
        setPic(imageURL);
        // setSucess("PicSucess")
      message.success('Picture Uploaded Sucessfully!');

        setError(null)

      } else {
        setSucess(null)
        // setError("PicError")
      message.error('Picture Uploading Failed!');

        onError(response.statusText);
      }
    } catch (error) {

      // Set loading to false on upload failure
      setLoading(false);

      console.error('Error uploading image: ', error);
      onError(error);
    }
  };

  const messagePic = async ({ file, onSuccess, onError }) => {
    try {
      // Set loading to true before starting the upload
      setLoading("messagePic");

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'usersimage');

      const response = await axios.post('https://api.cloudinary.com/v1_1/dcnam8mwd/image/upload', formData);

      // Set loading to false after the upload is complete
      setLoading(false);

      if (response.status === 200) {
        const imageURL = response.data.secure_url;

        // Set the image URL in the state
        setImageUrl(imageURL);
        setLoading(false);
        onSuccess();
        message.success('Image uploaded successfully!');
      } else {
        onError(response.statusText);
        message.error('Image upload failed.');
      }
    } catch (error) {
      // Set loading to false on upload failure
      setLoading(false);

      console.error('Error uploading image: ', error);
      onError(error);
      message.error('Image upload failed.');
    }
  };

  const handleGroupProfile = () => {
    setStatus("GroupProfileShow")
  }

  const beforeUpload = (file) => {
    return true;
  };
  const ProfilePic = async ({ file, onSuccess, onError }) => {
    try {
      // Set loading to true before starting the upload
      setLoading("imageload");

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'usersimage');

      const response = await axios.post('https://api.cloudinary.com/v1_1/dcnam8mwd/image/upload', formData);

      // Set loading to false after the upload is complete
      setLoading(false);

      if (response.status === 200) {
        const imageURL = response.data.secure_url;
        // setPic(imageURL);
        setProfilePic(imageURL)
        setError(null)

      } else {
        setSucess(null)
        setError("PicError")
        onError(response.statusText);
      }
    } catch (error) {

      // Set loading to false on upload failure
      setLoading(false);

      console.error('Error uploading image: ', error);
      onError(error);
    }
  }
  const changeGroupPic = async () => {
    console.log("id " + groupChat._id)
    try {
      const res = await axios.post("http://localhost:9000/api/v1/groupPic", {
        groupChatid: groupChat._id,
        imgUrl: profilePic
      });
      console.log(res);
      message.success('Profile Picture Updated Sucessfully!');
      setGroupChat(res.data)
      setStatus(null)
      setProfilePic(null)
      setimgUpload(null)
    } catch (error) {
      console.error('Error:', error.response.status);
      console.error('Error data:', error.response.data);
    }
  };

  const cancel = () => {
    console.log("cancelled")
  }
  const confirm = async (id) => {
    console.log("Confirmed" + id)
    const res = await axios.put("http://localhost:9000/api/v1/groupremove", {
      chatId: groupChat._id,
      userId: id
    })
    console.log(res)
    setGroupChat(res.data)
    message.success('User Removed Sucessfully!');

    setStatus(null)
  }
  const addUser = async () => {
    console.log(groupUsers)
    setLoading("adduser")
    try {
      const res = await axios.put("http://localhost:9000/api/v1/groupadd", {
        chatId: groupChat._id,
        userId: groupUsers
      })
      console.log(res.data)
      message.success('User Added Sucessfully!');
      setStatus(null)
      setAction(null)
      setGroupChat(res.data)
    setLoading(null)
    } catch (error) {
      console.log(error.response.data)
      setError(error.response.data)

    }
  }
  return (
    <>
      <div className="content-wrapper">
        <hr />
        
        {groupAdd === true &&
          <><div className='center'>
            {Sucess === "Successfully Created" && (<div className='alert'>
              <Alert type="sucess" className='sucess' message={Sucess} />
            </div>)}
            {Error === 'Please Fill all The Details' && (
              <div className='alert'>
                <Alert type="error" className='error' message={Error} />
              </div>)}
            {Error === 'Please Select Atleast 2 Users' && (
              <div className='alert'>
                <Alert type="error" className='error' message={Error} />
              </div>)}
            {Sucess === 'PicSucess' && (<div className='alert'>
              <Alert type="sucess" className='sucess' message="Image Uploaded Sucessfully" />
            </div>)}
            {Error === 'PicError' && (
              <div className='alert'>
                <Alert type="error" className='error' message="Image Uploaded Failed" />
              </div>)}
            {Sucess === 'PicSucess' && (<div className='alert'>
              <Alert type="sucess" className='sucess' message="Image Uploaded Sucessfully" />
            </div>)}
            {Error === 'PicError' && (
              <div className='alert'>
                <Alert type="error" className='error' message="Image Uploaded Failed" />
              </div>)}
            <div className='box'>
              <h2>Make a New Group!!</h2><br /><br />
              <Input placeholder='Enter Chat Name Here!!' onChange={ChatNameHandler} type='text' /><br /><br />
              <div className="searchBar">
                <div className='searchBarbox'>
                  <Input type="text"
                    placeholder="Search users"
                    value={searchWord}
                    onChange={handleInputChange} />
                  {searchResults.length > 0 && (
                    <ul className="searchResults">
                      {searchResults.map((user, index) => (
                        <li key={user._id} onClick={() => handleChat(user)}>
                          <img src={user.pic} alt={user.name} />
                          {user.name}
                          {groupUsers.includes(user._id) && (
                            <i className="ri-checkbox-circle-line"></i>
                          )}
                        </li>
                      ))

                      }


                    </ul>
                  )}
                </div>

                <SearchOutlined style={{ color: "#fff" }} />
              </div><br />
              <Upload action='/upload.do' customRequest={customRequest} showUploadList={false} beforeUpload={beforeUpload} listType='picture-card'>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                  {loading === "picload" && <>
                    <Spin />
                  </>}
                </div>
              </Upload>
              <br />
              <Button onClick={submitData}>Enter</Button><br />
              {loading === "DataLoading" && <>
              <Spin/>
              </>}
            </div>
          </div>
          </>
        }
        {!friend && !groupChat && !groupAdd && <>
          <div className='center'>
            <img src='https://play-lh.googleusercontent.com/mzJpTCsTW_FuR6YqOPaLHrSEVCSJuXzCljdxnCKhVZMcu6EESZBQTCHxMh8slVtnKqo' />

            <h1>Welcome TO Slack App</h1>

          </div>
        </>}
        {status === false && friend && <>
          <br />
          <div className='profiledetails'>
            <img className='circle' src={friend.pic} alt={friend.name} />
            {friend.status === "Online" && <>
              <div className='online detailsonline'></div>
            </>}
            <p onClick={handleProfile} className='name'>{friend.name}</p>
            <div className='name status'>
              <p>{"(" + friend.status + ")"}</p>
            </div>
          </div>
          <br />
          <hr />
          <div className='messages' ref={messagesContainerRef}>
            
            {console.log(messages)}
            {messages.length === 0 && <h1 style={{ color: "#fff", textAlign: "center" }}>Start new Chat</h1>}
            {messages.map((message) => (

              <div key={message._id} className={message.sender._id === userId ? 'sent-message' : 'received-message'}>
                {message.sender._id === userId && (
                  <div className='singleMessage flexend'>
                    {message.imageUrl && (
                      <Link to={message.imageUrl} target="_blank">
                        <img src={message.imageUrl} className='msgimg' alt="Image" /></Link>
                    )}
                    {message.content && (
                      <p dangerouslySetInnerHTML={{ __html: message.content }}></p>
                    )}


                    <img src={message.sender.pic} />
                  </div>
                )}
                {message.sender._id !== userId && (
                  <div className='singleMessage'>
                    <img src={message.sender.pic} />
                    {message.imageUrl && (
                      <Link to={message.imageUrl} target="_blank">
                        <img src={message.imageUrl} className='msgimg' alt="Image" /></Link>
                    )}<br />
                    <br />
                    {message.content && (
                      <p dangerouslySetInnerHTML={{ __html: message.content }}></p>
                    )}

                  </div>
                )}
              </div>
            ))}

          </div>
          <div className='editor'>
            <div className='editorItems'>
              <div className='inner'>
                <Upload
                  action='/upload.do'
                  customRequest={messagePic}
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                >
                  <i className="ri-image-add-fill"></i>
                  {loading === "messagePic" && <>
                    <div className='loader'>
                      <Spin />
                    </div>
                  </>}
                </Upload>
                <i onClick={handleMessage} className="ri-send-plane-2-fill"></i>
                {loading === "loadmsg" && (
                  <div className='loader'>
                    <Spin />
                  </div>
                )}
              </div>
            </div>
            <FroalaEditor
              config={{
                pluginsEnabled: ['charCounter'],
                charCounterCount: true,
                charCounterMax: 15,
                theme: 'dark',
              }}
              onModelChange={handleContent}
              model={details.content}
              style={{color:"#fff"}}
            />
          </div>
        </>
        }
        {status === true && (
          <Drawer
            title={friend.name + " Details"}
            placement="right"
            closable={true}
            onClose={() => setStatus(false)}
            visible={status}
            width={550} // Set the width as per your requirement
          >
            <div className='table'>
              <table>
                <tr className='flex'>
                  <td><img src={friend.pic} /></td>
                </tr><br /><br />
                <tr>
                  <label>Name : </label>
                  <td>{friend.name}</td>
                </tr><br />
                <tr>
                  <label>email : </label>
                  <td>{friend.email}</td>
                </tr><br />
                <tr>
                  <label>Phone : </label>
                  <td>{friend.phone}</td>
                </tr><br />
                <tr>
                  <label>Date Of Birth : </label>
                  <td>{friend.DOB}</td>
                </tr><br />
                <tr>
                  <label>Bio : </label>
                  <td>{friend.intro}</td>
                </tr><br />
                <tr>
                  <td colSpan="2">
                    <Button onClick={() => setStatus(false)}>Back</Button>
                  </td>
                </tr>
              </table>
            </div>
          </Drawer>
        )}
        {status === "GroupProfileShow" && (
          
          <Drawer
            title={groupChat.chatName + " Details"}
            placement="right"
            closable={true}
            onClose={() => setStatus(false)}
            visible={status}
            width={550}
          >
            <div className='table'>
            {Error === 'User already in chat' && (
              <div className='alert'>
                <Alert type="error" className='error' message={Error} />
              </div>)}
              <table>
                <h1 style={{ textAlign: "center" }}>{groupChat.chatName + " Details"}</h1>
                <br />
                <br />
                <tr className='flex'>
                  <td><img src={groupChat.pic} /></td>

                  {userId === groupChat.groupAdmin._id &&
                    <>
                      <EditOutlined onClick={() => setimgUpload("imgUpload")} style={{ fontSize: "40px", marginTop: "-206px", marginLeft: "-57px", padding: "12px", background: "#000", borderRadius: "50px", cursor: "pointer" }} />
                      {imgUpload === "imgUpload" && <div style={{ display: "flex", justifyContent: "center" }}>
                        <Form.Item label='Profile Picture' valuePropName='fileList'>
                          <Upload action='/upload.do' customRequest={ProfilePic} showUploadList={false} beforeUpload={beforeUpload} listType='picture-card'>
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>Upload</div>
                              {loading === "imageload" && <>
                                <Spin size="large" />
                              </>}
                            </div>
                          </Upload>
                          {profilePic && <div style={{ textAlign: "center" }}> <CheckCircleOutlined style={{ color: "green", fontSize: "25px", textAlign: "center" }} />

                          </div>}
                          {profilePic &&
                            <Button onClick={changeGroupPic}>Set Profile</Button>}
                        </Form.Item>

                      </div>
                      }
                    </>
                  }
                </tr><br /><br />
                <tr>
                  <label>Group Admin : </label>
                  <td>{groupChat.groupAdmin.name}</td>
                </tr><br />
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <h2>All Members : </h2>{userId === groupChat.groupAdmin._id && <UserAddOutlined onClick={() => setAction("newMember")} style={{ cursor: "pointer", fontSize: "30px", color: "green" }} />} 
                </div>
                {action === "newMember" && <>
                  {console.log(groupUsers)}
                  <div className="searchBar" style={{ width: "100%" }}>
                    <div className='searchBarbox'>
                      <Input type="text"
                        placeholder="Search users"
                        value={searchWord}
                        onChange={handleInputChange} />
                      {searchResults.length > 0 && (
                        <ul className="searchResults">
                          {searchResults.map((user, index) => (
                            <li key={user._id} onClick={() => handleChat(user)}>
                              <img src={user.pic} alt={user.name} />
                              {user.name}
                              {groupUsers.includes(user._id) && (
                                <i className="ri-checkbox-circle-line"></i>
                              )}
                            </li>
                          ))

                          }


                        </ul>
                      )}
                    </div></div><Button style={{marginRight:"10px"}} onClick={addUser}>Add </Button>{loading ==="adduser"&&<Spin/>}
                </>}
                <br />
                {groupChat.users.map((user) => (
                  <tr >
                    <td style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>{user.name}
                      <Popconfirm
                        title="Delete the task"
                        description="Are you sure to delete this task?"
                        onConfirm={() => confirm(user._id)}
                        onCancel={cancel}
                        okText="Yes"
                        cancelText="No"
                      >
                        {userId === groupChat.groupAdmin._id && <>
                        
                        <UserDeleteOutlined style={{ cursor: "pointer", fontSize: "30px", color: "red" }} />
                        </>}
                      </Popconfirm>
                    </td> <br /></tr>
                ))}
                <tr><br /><br />
                  <td >
                    <br />
                    <Button onClick={() => setStatus(false)}>Back</Button>
                  </td>
                </tr>


              </table>
            </div>
          </Drawer>
        )}
        {groupChat && <>

          <br />
          <div className='profiledetails'>
            <img className='circle' src={groupChat.pic} alt={groupChat.chatName} />
            <p className='name' onClick={handleGroupProfile}>{groupChat.chatName}</p>
          </div>
          <br />
          <hr />
          <div className='messages' ref={messagesContainerRef}>
            {loading === "loadingMessages" && <>

              <div className='loader'>
                <Spin size="large" />
              </div>
            </>}
            {messages.length === 0 && <> <br /> <h1 style={{ color: "#fff", textAlign: "center" }}>Start new Chat</h1></>}
            {messages.map((message) => (
              <div key={message._id} className={message.sender._id === userId ? 'sent-message' : 'received-message'}>
                {message.sender._id === userId && (
                  <div className='singleMessage flexend'>
                    {message.imageUrl && (
                      <Link to={message.imageUrl} target="_blank">
                        <img src={message.imageUrl} className='msgimg' alt="Image" /></Link>
                    )}
                    {message.content && (
                      <p dangerouslySetInnerHTML={{ __html: message.content }}></p>
                    )}


                    <img src={message.sender.pic} />
                  </div>
                )}
                {message.sender._id !== userId && (
                  <div className='singleMessage'>
                    <img src={message.sender.pic} />
                    {message.imageUrl && (
                      <Link to={message.imageUrl} target="_blank">
                        <img src={message.imageUrl} className='msgimg' alt="Image" /></Link>
                    )}<br />
                    {message.content && (
                      <p dangerouslySetInnerHTML={{ __html: message.content }}></p>
                    )}

                  </div>
                )}
              </div>
            ))}

          </div>
          <div className='editor'>
            <div className='editorItems'>
              <div className='inner'>
                <Upload
                  action='/upload.do'
                  customRequest={messagePic}
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                >
                  <i className="ri-image-add-fill"></i>
                  {loading === "messagePic" && <>
                    <div className='loader'>
                      <Spin />
                    </div>
                  </>}

                </Upload>

                <i onClick={handleMessage} className="ri-send-plane-2-fill"></i>
              </div>
              {loading === "MessageLoad" && <>
                <div className='loader'>
                  <Spin />
                </div>
              </>}
            </div>
            <FroalaEditor
            
              config={{
                pluginsEnabled: ['charCounter'],
                charCounterCount: true,
                charCounterMax: 15,
                theme: 'dark',
              }}
              onModelChange={handleContent}
              ref={editorRef}
              model={details.content}
            />
          </div>
        </>

        }


      </div>
    </>
  );
};

export default Content;
