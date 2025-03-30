import React, { useState } from "react";

const Signup = ({ onClose, showLogin }) => {
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    username: "",
    role: "user"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password || !formData.username) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      
      const userExists = users.some(user => user.email === formData.email);
      if (userExists) {
        setError("Email already in use");
        setLoading(false);
        return;
      }

      const userRole = formData.email === 'admin123@gmail.com' ? 'admin' : formData.role;

      const newUser = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        role: userRole,
        createdAt: new Date().toISOString(),
        id: Date.now().toString()
      };

      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (userRole === 'admin') {
          window.location.href = './login';
          
        } else {
          window.location.href = '/login';
        }
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Sign up</h2>
        <p className="subtitle">Create a new account</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success ? (
        <div className="success-message">
          Account created! Redirecting...
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password (min 6 chars)"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                minLength="6"
                required
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

          <button 
            type="submit" 
            className="primary-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
      )}

      <p className="auth-footer">
        Already have an account?{" "}
        <button className="text-btn" onClick={showLogin}>
          Log in
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

        .success-message {
          color: #52c41a;
          background: #f6ffed;
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #b7eb8f;
          text-align: center;
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

export default Signup;