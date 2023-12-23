import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Chatstate } from '../ChatProvider'
import { Drawer,Button,Upload, Spin,Form,Input, message } from 'antd'
import { PlusOutlined,CheckCircleOutlined,EditOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea'

const SmallSidebar = () => {

  const [UserData, SetUserData] = useState({})
  const [status, setStatus] = useState()
  const navigate = useNavigate()
  const [profilePic, setProfilePic] = useState(null)
  const [loading, setLoading] = useState(false);
  const [imgUpload, setimgUpload] = useState()
  const [Sucess, setSucess] = useState("")
  const [Error, setError] = useState("")
  const { user, friend, setFriend, selectedChat, setGroupChat, setGroupAdd } = Chatstate();
  const [Details, setDetails] = useState({})
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
  const handleLogout = async () => {
    // const token = localStorage.removeItem("token");
    // const username = localStorage.removeItem("username");
    console.log(UserData.email)
    var email = UserData.email
    try {
      const res = await axios.post('http://localhost:9000/api/v1/user/logout', {
        email: email
      });
      if (res.status === 200) {
        const token = localStorage.removeItem("token");
        const username = localStorage.removeItem("username");
        navigate("/")

      }
      console.log(res)
    } catch (error) {
      console.log(error)
    }

  }
  useEffect(() => {
    currentUser()
  }, [])
  const beforeUpload = (file) => {
    return true;
  };
  const ProfilePic = async({ file, onSuccess, onError })=>{
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
  const currentUser = async () => {
    try {
      const res = await axios.get(`http://localhost:9000/api/v1/currentUser/${userId}`);
      // console.log(res.data.User);
      SetUserData(res.data)
      console.log(res)

    } catch (error) {
      console.error('Error: ', error);
    }
  }
  const handleDashboard = () => {
    setFriend(null)
    setGroupChat(null)
    setGroupAdd(false)
  }
  const changeGroupPic = async () => {
    try {
      const res = await axios.post("http://localhost:9000/api/v1/ChangeProfile", {
        userId: userId,
        imgUrl:profilePic
      });
      console.log(res.data);
      message.success('Profile Picture Updated Sucessfully!');
      SetUserData(res.data)
      setStatus(null)
      setProfilePic(null)
      setimgUpload(null)
    } catch (error) {
      console.error('Error:', error.response.status);
      console.error('Error data:', error.response.data);
    }
  };
  const handleValues = async (e)=>{
    setDetails({...Details , [e.target.name]:e.target.value})
  }
  const ValuesSubmit = async ()=>{
    const res = await axios.post("http://localhost:9000/api/v1/editProfile",{
      userId: userId,
      Details
    })
    message.success('Details Updated Sucessfully!');
    SetUserData(res.data)
    setStatus(null)
  }
  return (
    <div className='s-sidebar-Wrapper'>
      {status === "EditDetails"&& <>
      <Drawer
            title={ UserData.name + " Details"}
            placement="right"
            closable={true}
            onClose={() => setStatus(false)}
            visible={status}
            width={550} // Set the width as per your requirement
          >
            <div className='table'>
                <table>
                  <h2 style={{textAlign:"center"}}>Edit Your Details</h2>
                  <br/>
                  <br/>

                  <tr>
                    <label>Set New Name :</label>
                    <td><Input name='name' onChange={handleValues} placeholder='Set New Name'/></td>
                  </tr>
                  <br/>
                  <tr>
                    <label>Set New Email :</label>
                    <td><Input name='email'  onChange={handleValues} placeholder='Set New Email'/></td>
                  </tr>
                  <br/>
                  <tr>
                    <label>Set New Phone Number :</label>
                    <td><Input name='phone'  onChange={handleValues} placeholder='Set New Phone Number'/></td>
                  </tr>
                  <br/>
                  <tr>
                    <label>Set New Bio :</label>
                    <td><TextArea name='intro'  onChange={handleValues} placeholder='Set New Bio'/></td>
                  </tr>
                  <br/>
                  <Button onClick={ValuesSubmit}>Done</Button>
                </table>
                </div>
                </Drawer>
                </>}
      {status === "OpenProfile"&&
      
      <Drawer
            title={ UserData.name + " Details"}
            placement="right"
            closable={true}
            onClose={() => setStatus(false)}
            visible={status}
            width={550} // Set the width as per your requirement
          >
            
            <div className='table'>
              <table>
                <h1 style={{ textAlign: "center" }}>{UserData.name + " Details"}</h1>
                <br />
                <br />
                <tr className='flex'>
                  <td><img src={UserData.pic} /></td>
                 
                  {userId  &&
                  <>
                    <EditOutlined onClick={() => setimgUpload("imgUpload")} style={{ fontSize: "40px", marginTop: "-206px", marginLeft: "-57px", padding: "12px", background: "#000", borderRadius: "50px", cursor: "pointer" }} />
                    {imgUpload === "imgUpload"&&<div style={{display:"flex", justifyContent:"center"}}>
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
                      {profilePic && <div style={{textAlign:"center"}}> <CheckCircleOutlined style={{color:"green", fontSize:"25px", textAlign:"center"}} />
                      
                      </div>}
                      {profilePic &&
                      <Button onClick={changeGroupPic}>Set Profile</Button>}
                    </Form.Item>
                      
                  </div>
                  }
                  </>
                  }
                </tr>
                <br/>
                
                <tr>
                  <label>Name : </label>
                  <td>{UserData.name}</td>
                </tr><br />
                <tr>
                  <label>Email : </label>
                  <td>{UserData.email}</td>
                </tr><br />
                <tr>
                  <label>Gender : </label>
                  <td>{UserData.Gender}</td>
                </tr><br />
                <tr>
                  <label>Phone : </label>
                  <td>{UserData.phone}</td>
                </tr><br />
                <tr>
                  <label>Bio : </label>
                  <td>{UserData.intro}</td>
                </tr><br /><br />
                <tr style={{justifyContent:"center", gap:"50px"}}><br />
                  <td>
                    <Button onClick={() => setStatus("EditDetails")}>Edit Details</Button>
                  </td>
                  <td>
                    <Button onClick={() => setStatus(false)}>Back</Button>
                  </td>
                </tr>
              </table> </div>
          </Drawer>
      }
      <div className='s-sidebar-innerWrapper'>
        <img src='https://play-lh.googleusercontent.com/mzJpTCsTW_FuR6YqOPaLHrSEVCSJuXzCljdxnCKhVZMcu6EESZBQTCHxMh8slVtnKqo' />
        <Link to="/Dashboard" onClick={() => { handleDashboard() }}>
          <div className='icon'>
            <i class="ri-home-4-fill"></i>
            <span>Home</span>
          </div>
        </Link>
        <br />
        <div className='icon' >
          <i class="ri-discuss-fill"></i>
          <span>DMs</span>
        </div><br />
        <div className='icon'>
          <i class="ri-notification-3-line"></i>
          <span>Activity</span>
        </div>
        <br />
        <div className='icon' onClick={handleLogout}>
          <i class="ri-logout-circle-fill"></i>
          <span >Logout</span>
        </div>
      <img className='profilepichover' onClick={()=>setStatus("OpenProfile")} style={{marginTop:"379px", borderRadius:"50px", objectFit:"cover", width:"70px", height:"70px"}} src={UserData.pic}/>
      </div>
    </div>
  )
}

export default SmallSidebar