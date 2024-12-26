import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

// List of countries
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", 
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", 
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", 
  "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", 
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", 
  "Eswatini (fmr. \"Swaziland\")", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", 
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", 
  "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", 
  "Iraq", "Ireland", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Korea (North)", "Korea (South)", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", 
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", 
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", 
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", 
  "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", 
  "Niger", "Nigeria", "North Macedonia (formerly Macedonia)", "Norway", "Oman", "Pakistan", "Palau", 
  "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", 
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", 
  "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", 
  "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", 
  "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", 
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", 
  "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    password: "",
  });
  
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ""
  });
  
  const navigate = useNavigate();

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    let message = "";

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        message = "Very Weak";
        break;
      case 2:
        message = "Weak";
        break;
      case 3:
        message = "Moderate";
        break;
      case 4:
        message = "Strong";
        break;
      case 5:
        message = "Very Strong";
        break;
      default:
        message = "";
    }

    return { score, message };
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (value.length < 2) {
          return `${name === "firstName" ? "First" : "Last"} name must be at least 2 characters long`;
        }
        if (value.length > 50) {
          return `${name === "firstName" ? "First" : "Last"} name must be less than 50 characters`;
        }
        if (!/^[A-Za-z\s]+$/.test(value)) {
          return "Only letters and spaces are allowed";
        }
        return "";

      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        // Check for common disposable email domains
        const disposableDomains = ['tempmail.com', 'throwaway.com'];
        const domain = value.split('@')[1];
        if (disposableDomains.includes(domain)) {
          return "Please use a non-disposable email address";
        }
        // Check for valid domain format
        if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
          return "Please enter a valid email domain";
        }
        return "";

      case "country":
        if (!COUNTRIES.includes(value)) {
          return "Please select a valid country";
        }
        return "";

      case "password":
        const requirements = [];
        if (value.length < 8) {
          requirements.push("at least 8 characters");
        }
        if (!/[A-Z]/.test(value)) {
          requirements.push("one uppercase letter");
        }
        if (!/[a-z]/.test(value)) {
          requirements.push("one lowercase letter");
        }
        if (!/[0-9]/.test(value)) {
          requirements.push("one number");
        }
        if (!/[!@#$%^&*]/.test(value)) {
          requirements.push("one special character (!@#$%^&*)");
        }
        return requirements.length > 0 
          ? `Password must contain ${requirements.join(", ")}`
          : "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));

    // Update password strength if password field changes
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    // If there are any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await api.post("/users/register", form);
      alert("User registered successfully!");
      navigate("/login");
    } catch (error) {
      if (error.response?.data?.error) {
        setErrors(prev => ({ ...prev, email: error.response.data.error }));
      } else {
        setErrors(prev => ({ ...prev, submit: "Registration failed. Please try again." }));
      }
      console.error("Registration error:", error);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 1: return "#dc3545"; // Very Weak - Red
      case 2: return "#ffc107"; // Weak - Yellow
      case 3: return "#fd7e14"; // Moderate - Orange
      case 4: return "#20c997"; // Strong - Teal
      case 5: return "#198754"; // Very Strong - Green
      default: return "#dc3545"; // Default - Red
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Register</h2>
        
        <div className="form-group">
          <input
            className={`input-field ${errors.firstName ? 'error' : ''}`}
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <input
            className={`input-field ${errors.lastName ? 'error' : ''}`}
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <input
            className={`input-field ${errors.email ? 'error' : ''}`}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <select
            className={`input-field ${errors.country ? 'error' : ''}`}
            name="country"
            value={form.country}
            onChange={handleChange}
            required
          >
            <option value="">Select Country</option>
            {COUNTRIES.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && <span className="error-message">{errors.country}</span>}
        </div>

        <div className="form-group">
          <div className="password-input-wrapper">
            <input
              className={`input-field ${errors.password ? 'error' : ''}`}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {form.password && (
            <div className="password-strength">
              <div 
                className="strength-bar" 
                style={{ 
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}
              />
              <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                {passwordStrength.message}
              </span>
            </div>
          )}
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        {errors.submit && <p className="error-message">{errors.submit}</p>}
        
        <button className="submit-button" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;