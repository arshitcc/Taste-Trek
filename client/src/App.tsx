import { Outlet } from "react-router-dom";
import Navbar from "./components/home/Navbar";

function App() {
  return (
    <>
      <Navbar/>
      <Outlet />
    </>
  );
}

export default App
