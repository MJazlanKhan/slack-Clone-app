import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { CloudinaryContext, Image } from 'cloudinary-react';
import { Button, DatePicker, Form, Input, InputNumber, Select, Upload, message, Alert, Spin } from 'antd';
import { Chatstate } from '../ChatProvider.js';
const { TextArea } = Input;

const Signup = () => {
    const { setUser } = Chatstate();


    const [messageApi, contextHolder] = message.useMessage();
    const [action, setAction] = useState('');
    const [loginval, setLoginval] = useState({
        status: "offline"
    });
    const [Signupval, setSignupval] = useState({});
    const [Sucess, setSucess] = useState("")
    const [Error, setError] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [SucessMessage, setSucessMessage] = useState("")
    const [loading, setLoading] = useState()

    const userToken = localStorage.getItem("token")
    useEffect(() => {
        if (userToken) {
            navigate("/Dashboard");
        }
    }, []);
    const navigate = useNavigate()
    const handleLoginValues = (e) => {
        setLoginval({ ...loginval, [e.target.name]: e.target.value });
    };

    const handleSignin = async () => {
        try {
            // Set loading to true before making the request
            setLoading("signinload");
            const updatedLoginval = { ...loginval, status: "Online" };
            const res = await axios.post('https://slack-clone-app-server.onrender.com/api/v1/user/signin', updatedLoginval);
            console.log(res.data.user);
            setUser(res.data.user);
            const successMessage = res.data.message;
            setSucessMessage(successMessage);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("username", res.data.user.name);
            localStorage.setItem("userId", res.data.user._id);

            setSucess("Sucess");
            setError("");
            navigate("/Dashboard");
        } catch (error) {
            console.error('Error: ', error);
            const errorMessage = error.response.data.message;
            setErrorMessage(errorMessage);
            setError("SignupError");
            setSucess("");  // Set Sucess to an empty string when there's an error
        } finally {
            // Set loading to false after the request is complete (whether it was successful or not)
            setLoading(false);
        }
    };

    const cloudinaryConfiguration = {
        cloudName: 'dcnam8mwd',
        apiKey: 'gNB3SUQcqpoCyWaeXDFGExjwhZM',
    };

    const customRequest = async ({ file, onSuccess, onError }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'usersimage');

            // Set loading to true before starting the upload
            setLoading("imageload");

            const response = await axios.post('https://api.cloudinary.com/v1_1/dcnam8mwd/image/upload', formData);

            // Set loading to false after the upload is complete
            setLoading(false);

            if (response.status === 200) {
                const imageURL = response.data.secure_url;
                setSignupval({ ...Signupval, ["pic"]: imageURL });
                onSuccess();
                message.success('Image uploaded successfully!');
            } else {
                onError(response.statusText);
                message.error('Image upload failed.');
            }
        } catch (error) {
            setLoading(false); // Set loading to false on upload failure

            console.error('Error uploading image: ', error);
            onError(error);
            message.error('Image upload failed.');
        }
    };



    const handleSignupValues = (e) => {
        setSignupval({ ...Signupval, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        try {
            setLoading("signupload");

            const res = await axios.post('https://slack-clone-app-server.onrender.com/api/v1/user/signup', Signupval);
            console.log(res.data);
            const successMessage = res.data.message;

            setSucessMessage(successMessage);
            setSucess("Sucess");
            setError("");  // Set Error to an empty string when there's no error
        } catch (error) {
            console.error('Error: ', error);
            const errorMessage = error.response.data.message;
            setErrorMessage(errorMessage);
            setError("SignupError");
            setSucess("");  // Set Sucess to an empty string when there's an error
        } finally {
            // Set loading to false after the request is complete (whether it was successful or not)
            setLoading(false);
        }
    };


    const beforeUpload = (file) => {
        return true;
    };

    const handleDate = (e) => {
        const date = e.$D + ' ' + e.$M + ' ' + e.$y;
        setSignupval({ ...Signupval, ['DOB']: date });
    };
    const onFinish = (values) => {
        console.log('Success:', values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <>
            <div className='signup-wrapper'>
                <div className='signup-inner-wrapper'>
                    <div className='signup-inner-wrapper'>
                        <Link to="/">
                            <img src='https://play-lh.googleusercontent.com/mzJpTCsTW_FuR6YqOPaLHrSEVCSJuXzCljdxnCKhVZMcu6EESZBQTCHxMh8slVtnKqo' />
                        </Link>
                        {action === '' && <h2>Select One Option</h2>}
                        <div className='btns'>
                            <button onClick={() => setAction('Login')}>Signin</button>
                            <button onClick={() => setAction('Signup')}>Signup</button>
                        </div>
                        {action === 'Login' && (
                            <div className='Login'>
                                <h2>Login Your Account</h2>
                                <br />
                                <Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} layout='horizontal' style={{ maxWidth: 600 }} className='form'>
                                    {Sucess === 'Sucess' && (<div className='alert'>
                                        <Alert type="sucess" className='sucess' message={`${SucessMessage}`} />
                                    </div>)}
                                    {Error === 'SignupError' && (
                                        <div className='alert'>
                                            <Alert type="error" className='error' message={`${errorMessage}`} />
                                        </div>)}
                                    <br />
                                    <Form.Item label='Email'>
                                        <Input onChange={handleLoginValues} name='email' className='bgTransparent' type='email' />
                                    </Form.Item>
                                    <Form.Item label='Password'>
                                        <Input onChange={handleLoginValues} name='password' className='bgTransparent' type='password' />
                                    </Form.Item>
                                    {loading === "signinload" &&
                                        <>
                                            <div className='loader'>
                                                <Spin size="large" />
                                                <br />
                                            </div>

                                        </>}
                                    <Form.Item className='action-btn'>
                                        <Button onClick={handleSignin}>Sign In</Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                        {action === 'Signup' && (
                            <div className='register'>
                                <h2>Register a New Account</h2>

                                <br />
                                <Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} layout='horizontal' onFinish={onFinish}
                                    onFinishFailed={onFinishFailed}
                                    autoComplete="off" style={{ maxWidth: 600 }} className='form'>
                                    {Sucess === 'Sucess' && (<div className='alert'>
                                        <Alert type="sucess" className='sucess' message={`${SucessMessage}`} />
                                    </div>)}
                                    {Error === 'SignupError' && (
                                        <div className='alert'>
                                            <Alert type="error" className='error' message={`${errorMessage}`} />
                                        </div>)}
                                    <br />
                                    <Form.Item label="Name" rules={[
                                        {
                                            required: true,
                                            message: 'Please input your name',
                                        },
                                    ]}>
                                        <Input onChange={handleSignupValues} name='name' className='bgTransparent' type='text' />
                                    </Form.Item>
                                    <Form.Item label='Email' rules={[{ required: true, message: 'Name is required' }]}>
                                        <Input onChange={handleSignupValues} name='email' className='bgTransparent' type='email' />
                                    </Form.Item>
                                    <Form.Item label='Password'>
                                        <Input onChange={handleSignupValues} rules={[{ required: true, message: 'Please input your Password!' }]} name='password' className='bgTransparent' type='password' />
                                    </Form.Item>
                                    <Form.Item label='Gender'>
                                        <Select rules={[{ required: true, message: 'Please Select a Gender!' }]} onChange={(e) => setSignupval({ ...Signupval, ['Gender']: e })}>
                                            <Select.Option value='male'>Male</Select.Option>
                                            <Select.Option value='female'>Female</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label='Date Of Birth'>
                                        <DatePicker rules={[{ required: true, message: 'Please Enter Your Date of Birth!' }]} name='DOB' onChange={handleDate} className='bgTransparent' />
                                    </Form.Item>
                                    <Form.Item label='Phone Number'>
                                        <Input onChange={handleSignupValues} name='phone' className='bgTransparent' />
                                    </Form.Item>
                                    <Form.Item label='Short Intro '>
                                        <TextArea rules={[{ required: true, message: 'Please input your Intro!' }]} onChange={handleSignupValues} name='intro' className='bgTransparent' rows={4} />
                                    </Form.Item>
                                    <Form.Item label='Profile Picture' valuePropName='fileList'>
                                        <Upload action='/upload.do' customRequest={customRequest} showUploadList={false} beforeUpload={beforeUpload} listType='picture-card'>
                                            <div>
                                                <PlusOutlined />
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                                {loading === "imageload" && <>
                                                    <Spin size="large" />
                                                </>}
                                            </div>
                                        </Upload>
                                    </Form.Item>
                                    {loading === "signupload" && <>
                                        <div className='loader'>
                                            <Spin size="large" />
                                            <br />
                                        </div></>}
                                    <Form.Item className='action-btn'>
                                        <Button type="primary" htmlType="submit" onClick={handleSignup}>Signup</Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}


export default Signup;
