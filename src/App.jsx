import "./App.css";
import {
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/home/Home"
import Appointment from "./pages/appointment/Appointment"
import Report from "./pages/report/Report"
import Vaccination from "./pages/vaccination/Vaccination"
import Customer from "./pages/customer/Customer"
import Animal from "./pages/animal/Animal"
import Doctor from "./pages/doctor/Doctor"
import Navbar from "./components/Navbar/Navbar"

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* randevu */}
        <Route path="/appointment" element={<Appointment />} />
        {/* rapor */}
        <Route path="/report" element={<Report />} />
        <Route path="/vaccination" element={<Vaccination />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/animal" element={<Animal />} />
        <Route path="/doctor" element={<Doctor />} />
      </Routes>
    </>
  );
}

export default App;

