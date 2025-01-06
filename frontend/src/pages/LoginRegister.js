import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/LoginRegister.css";
import { UserContext } from "../context/UserContext";

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [userIdForVerification, setUserIdForVerification] = useState(null);
  const [otp, setOtp] = useState("");
  const { login } = useContext(UserContext); // Use login method from context
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    dob: "",
    profile_picture: "",
    gender: "",
    state_id: "",
    city_id: "",
    role_id: "",
    street_address: "", // New field
  });

  const navigate = useNavigate();

  // Fetch states and roles dynamically
  useEffect(() => {
    axios
      .get("http://localhost/turbotunes/backend/api/states.php?action=fetch")
      .then((response) => setStates(response.data))
      .catch((error) => console.error("Error fetching states:", error));

    axios
      .get("http://localhost/turbotunes/backend/api/roles.php?action=fetch")
      .then((response) =>
        setRoles(response.data.filter((role) => role.role_name !== "Admin")) // Exclude "Admin"
      )
      .catch((error) => console.error("Error fetching roles:", error));
  }, []);

  // Handle state change
  const handleStateChange = (stateId) => {
    setSelectedState(stateId);
    setCities([]);
    setSelectedCity("");
    setUserData({ ...userData, state_id: stateId, city_id: "" });

    if (stateId) {
      axios
        .get(`http://localhost/turbotunes/backend/api/cities.php?action=fetchByState&state_id=${stateId}`)
        .then((response) => setCities(response.data))
        .catch((error) => console.error("Error fetching cities:", error));
    }
  };

  // Handle city change
  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    setUserData({ ...userData, city_id: cityId });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Toggle Login and Register Forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setShowOTPVerification(false); // Reset OTP step if toggling forms
  };

  // Handle registration
  const handleRegister = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost/turbotunes/backend/api/login_register.php?action=register", userData)
      .then((response) => {
        setUserIdForVerification(response.data.user_id);
        setShowOTPVerification(true); // Show OTP verification form
      })
      .catch((error) => {
        console.error("Error during registration:", error);
        alert(error.response?.data?.error || "Registration failed!");
      });
  };

  // Handle OTP verification
  const handleVerifyOTP = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost/turbotunes/backend/api/login_register.php?action=verify", {
        user_id: userIdForVerification,
        otp,
      })
      .then((response) => {
        const data = response.data;
        if (data.success) {
          alert(data.message || "Account verified successfully!");
          setShowOTPVerification(false); // Reset OTP step
          setIsLogin(true); // Redirect to login form
        } else {
          alert(data.error || "Verification failed!");
        }
      })
      .catch((error) => {
        console.error("Error during OTP verification:", error);
        alert(error.response?.data?.error || "Invalid OTP or an error occurred.");
      });
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost/turbotunes/backend/api/login_register.php?action=login", {
        email: userData.email,
        password: userData.password,
      })
      .then((response) => {
        const { user_id, name, email, role } = response.data;
        const user = { user_id, name, email, role };
        login(user); // Update user context
        navigate("/"); // Redirect to home
      })
      .catch((error) => {
        console.error("Error during login:", error);
        alert(error.response?.data?.error || "Invalid credentials!");
      });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {showOTPVerification ? (
          // OTP Verification Form
          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <h2>Verify OTP</h2>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the OTP sent to your email"
                required
              />
            </div>
            <button type="submit" className="auth-submit">
              Verify OTP
            </button>
          </form>
        ) : isLogin ? (
          // Login Form
          <form className="auth-form" onSubmit={handleLogin}>
            <h2>Login</h2>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="auth-submit">
              Login
            </button>
          </form>
        ) : (
          // Registration Form
          <form className="auth-form" onSubmit={handleRegister}>
            <h2>Register</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                placeholder="Enter your contact number"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" onChange={handleInputChange} required>
                <option value="">--Select Gender--</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                name="role_id"
                onChange={(e) => setUserData({ ...userData, role_id: e.target.value })}
                required
              >
                <option value="">--Select Role--</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>State</label>
              <select
                name="state_id"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                required
              >
                <option value="">--Select State--</option>
                {states.map((state) => (
                  <option key={state.state_id} value={state.state_id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <textarea
                name="street_address"
                placeholder="Enter your street address"
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label>City</label>
              <select
                name="city_id"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                required
              >
                <option value="">--Select City--</option>
                {cities.map((city) => (
                  <option key={city.city_id} value={city.city_id}>
                    {city.city_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Profile Picture</label>
              <input
                type="file"
                name="profile_picture"
                onChange={(e) =>
                  setUserData({ ...userData, profile_picture: e.target.files[0] })
                }
              />
            </div>
            <button type="submit" className="auth-submit">
              Register
            </button>
          </form>
        )}

        <div className="toggle-buttons">
          <button
            className={`toggle-btn ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
