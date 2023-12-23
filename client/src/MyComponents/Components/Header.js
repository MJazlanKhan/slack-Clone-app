import React, { useState, useEffect } from 'react';
import './Pages.css';
import 'remixicon/fonts/remixicon.css';
import Input from 'antd/es/input/Input';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Chatstate } from '../ChatProvider';
import { Spin } from 'antd';


const Header = () => {
  const { newMember, setNewMember } = Chatstate();

  const [searchWord, setSearchWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

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

  const handleInputChange = (e) => {
    setSearchWord(e.target.value);
  };
  const handleChat=async(user)=>{
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      setLoading("userload")
      const response = await axios.post(`https://slackapp-yjrk.onrender.com/api/v1/chat/${user._id}` , user._id , config);
      console.log(response.data);
      setNewMember(response.data)
      setLoading(false)
      setSearchWord('')
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const searchUsers = async () => {
    try {
      const response = await axios.get(`https://slackapp-yjrk.onrender.com/api/v1/search?word=${searchWord}`,{
        headers: {
          'user-id': userId 
        }
      });
      setSearchResults(response.data.users || []);
      console.log(response.data.users);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="headerWrapper">
      <div className="searchBar">
       <div className='searchBarbox'>
       <Input type="text"
          placeholder="Search users"
          value={searchWord}
          onChange={handleInputChange}/>
        {searchResults.length > 0 && (
          <ul className="searchResults">
            {searchResults.map((user, index) => (
              <li onClick={()=>handleChat(user)} key={index}><img src={user.pic}/>{user.name}</li>
              ))}
              {loading === "userload" &&<>
              <Spin/>
              </>}
          </ul>
        )}
       </div>
        
      <SearchOutlined style={{color:"#fff"}} />
      </div>
    </div>
  );
};

export default Header;
