import React,{useEffect} from 'react'
import Header from '../Components/Header'
import SmallSidebar from '../Components/SmallSidebar'
import LargeSidebar from '../Components/LargeSidebar'
import Content from '../Components/Content'
import './Style.css'
import { useNavigate } from 'react-router-dom'
const Home = () => {
  const userToken = localStorage.getItem("token")
  
  const navigate = useNavigate()
  useEffect(() => {
    if (!userToken) {
      navigate("/");
    }
  }, [userToken]);
  return (
    <>
    <div>
        <div className='homewrapper'>
            <Header/>
            <div className='innerWrapper'>
            <SmallSidebar/>
            <LargeSidebar/>
            <Content/>
            </div>
        </div>
    </div>
    </>
  )
}

export default Home