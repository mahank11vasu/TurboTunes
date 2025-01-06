import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserProvider from "./context/UserContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import LoginRegister from "./pages/LoginRegister";
import AdminPage from "./pages/AdminPage";
import MechanicPage from "./pages/MechanicPage";
import CustomerPage from "./pages/CustomerPage";
import EditProfile from "./components/common/EditProfile";
import BookService from "./components/customer/BookService";
import "./App.css";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          {/* Navbar will always be visible */}
          <Navbar />
          
          {/* Main content area */}
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Add other pages here as you develop them */}
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<div>404: Page Not Found</div>} />
              <Route path="/auth" element={<LoginRegister />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/mechanic" element={<MechanicPage />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/book-service" element={<BookService />} />
              <Route path="*" element={<div>404: Page Not Found</div>} />
            </Routes>
          </div>

          {/* Footer will always be visible */}
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
