import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Login = ({ onClose, showSignup }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Predefined admin credentials
  const ADMIN_CREDENTIALS = {
    email: "admin123@gmail.com",
    password: "1234",
    role: "admin",
    username: "Admin",
    id: "admin-001"
  };

  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const { email, role } = JSON.parse(rememberedUser);
      setFormData(prev => ({
        ...prev,
        email,
        role,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
   

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      // Check if admin credentials are being used
      if (formData.email === ADMIN_CREDENTIALS.email && 
          formData.password === ADMIN_CREDENTIALS.password) {
        
        // Override role to admin regardless of what was selected
        const adminUser = {
          ...ADMIN_CREDENTIALS,
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(adminUser));

        if (formData.rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify({
            email: adminUser.email,
            role: adminUser.role
          }));
        }

        alert("Successfully logged in as Admin!");
        router.push("/admin");
        setLoading(false);
        return;
      }

      // Regular user authentication
    
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => 
        u.email === formData.email && 
        u.password === formData.password &&
        u.role === formData.role
      );

      if (!user) {
        setError("Invalid credentials or role");
        setLoading(false);
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(user));

      if (formData.rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          email: user.email,
          role: user.role
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      alert(`Successfully logged in as ${user.role === 'admin' ? 'Admin' : 'User'}!`);
      router.push(user.role === "admin" ? "/admin-dashboard" : "/user");
      
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Log In</h2>
        <p className="subtitle">Access your account</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your email"
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-input-container">
            <input 
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group remember-me">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>

        <button 
          type="submit" 
          className="primary-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Logging in...
            </>
          ) : (
            "Log in"
          )}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account?{" "}
        <button className="text-btn" onClick={showSignup}>
          Sign up
        </button>
      </p>

      <style jsx>{`
        .auth-container {
          width: 100%;
          max-width: 400px;
          padding: 30px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #666;
          font-size: 14px;
        }

        .error-message {
          color: #ff4d4f;
          background: #fff1f0;
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #ffccc7;
        }

        .auth-form {
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          border-color: #3d7eff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(61, 126, 255, 0.1);
        }

        .password-input-container {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .remember-me {
          display: flex;
          align-items: center;
        }

        .remember-me input {
          margin-right: 8px;
        }

        .primary-btn {
          width: 100%;
          padding: 14px;
          background-color: #3d7eff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .primary-btn:hover {
          background-color: #2c6ae5;
        }

        .primary-btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer {
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        .text-btn {
          background: none;
          border: none;
          color: #3d7eff;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }

        .text-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;