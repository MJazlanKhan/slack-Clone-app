import { Route, Routes } from "react-router-dom"
import Home from "./MyComponents/Pages/Home";
import Signup from "./MyComponents/Pages/Signup";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Signup />} />
        <Route path='/Dashboard' element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
