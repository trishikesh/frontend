"use client";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useState } from "react";
import Login from "../components/authentication/login";
import Signup from "../components/authentication/signup";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="container">
      {/* Glassy Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="logo" width={160} height={120} />
        </div>
        <div className="nav-buttons">
          <button
            className="auth-btn login-btn"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
          <button
            className="auth-btn signup-btn"
            onClick={() => setShowSignup(true)}
          >
            Signup
          </button>
        </div>
      </nav>

      {/* Login Popup */}
      {showLogin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowLogin(false)}>
              &times;
            </button>
            <Login
              onClose={() => setShowLogin(false)}
              showSignup={() => {
                setShowLogin(false);
                setShowSignup(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Signup Popup */}
      {showSignup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowSignup(false)}>
              &times;
            </button>
            <Signup
              onClose={() => setShowSignup(false)}
              showLogin={() => {
                setShowSignup(false);
                setShowLogin(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Hero Carousel - Starts immediately under navbar */}
      <div className="hero">
        <Carousel
          autoPlay
          infiniteLoop
          interval={3000}
          showThumbs={false}
          showStatus={false}
          showArrows={false}
        >
          <div className="carousel-item">
            <img
              src="/images/carousel1.png"
              alt="Slide 1"
              className="carousel-img"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/images/carousel2.png"
              alt="Slide 2"
              className="carousel-img"
            />
          </div>
          <div className="carousel-item">
            <img
              src="/images/carousel3.png"
              alt="Slide 3"
              className="carousel-img"
            />
          </div>
        </Carousel>
      </div>

      {/* Content Sections */}
      <section className="section">
        <h2 className="section-title">About Us</h2>
        <div className="section-content">
          <img src="/images/about.png" alt="About Us" className="info-img" />
          <p className="section-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in
            dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.
          </p>
        </div>
      </section>

      <section className="section bg-light">
        <h2 className="section-title">Our Vision</h2>
        <div className="section-content">
          <p className="section-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in
            dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.
          </p>
          <img
            src="/images/ourvision.png"
            alt="Our Vision"
            className="info-img"
          />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Our Services</h2>
        <div className="service-boxes">
          <div className="service-box">
            <h3>Real-Time Disaster Mapping with AI-Driven Heatmaps</h3>
          </div>
          <div className="service-box">
            <h3>Verified Disaster & Relief Center Data with Live Updates</h3>
          </div>
          <div className="service-box">
            <h3>
              Intelligent Disaster News Aggregation for Actionable Insights
            </h3>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Divine Sorcerers. All rights reserved.
        </p>
      </footer>

      {/* CSS Styling */}
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
          background-color: #f8fafc;
          color: #1e293b;
        }

        .container {
          min-height: 100vh;
          padding-top: 80px; /* This matches navbar height */
        }

        /* Navbar - Elegant Glass Effect */
        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          height: 80px; /* Fixed height */
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 5%;
          background: rgba(255, 255, 255, 0.38);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 1000;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
        }

        .hero {
          margin-top: -80px; /* Pulls content up to meet navbar */
          padding-top: 0px; /* Ensures content starts below navbar */
        }

        .logo img {
          object-fit: contain;
        }

        .nav-buttons {
          display: flex;
          gap: 1rem;
        }

        .auth-btn {
          padding: 0.6rem 1.5rem;
          border-radius: 2rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 0.95rem;
        }

        .login-btn {
          background: transparent;
          color: #1e40af;
          border: 1px solid #1e40af;
        }

        .signup-btn {
          background: #1e40af;
          color: white;
        }

        .auth-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background-color: white;
          padding: 2rem;
          border-radius: 1rem;
          width: 90%;
          max-width: 450px;
          position: relative;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          color: #1e293b;
        }

        .carousel-item {
          width: 100%;
          height: calc(100vh - 80px);
          min-height: 600px;
        }

        .carousel-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Sections */
        .section {
          padding: 5rem 5%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .bg-light {
          background: #f0f4f8;
        }

        .section-title {
          font-size: 2.25rem;
          font-weight: 600;
          margin-bottom: 3rem;
          color: #1e293b;
          text-align: center;
          position: relative;
        }

        .section-title:after {
          content: "";
          position: absolute;
          width: 80px;
          height: 4px;
          bottom: -1rem;
          left: 50%;
          transform: translateX(-50%);
          background: #1e40af;
          border-radius: 2px;
        }

        .section-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4rem;
          margin: 0 auto;
        }

        .reverse {
          flex-direction: row-reverse;
        }

        .info-img {
          width: 100%;
          max-width: 450px;
          border-radius: 1rem;
          box-shadow: 0 15px 30px rgba(30, 64, 175, 0.1);
        }

        .section-text {
          font-size: 1.1rem;
          color: #334155;
          max-width: 500px;
          line-height: 1.8;
        }

        /* Services */
        .service-boxes {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .service-box {
          flex: 1;
          min-width: 280px;
          max-width: 350px;
          padding: 2rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 5px 15px rgba(30, 64, 175, 0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .service-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(30, 64, 175, 0.1);
          border-color: #bfdbfe;
        }

        .service-box h3 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #1e293b;
          font-weight: 600;
        }

        /* Footer */
        .footer {
          text-align: center;
          padding: 2rem;
          background: #1e40af;
          color: white;
          margin-top: 3rem;
        }

        .footer p {
          font-size: 0.9rem;
          color: #e0f2fe;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
          }

          .logo img {
            width: 120px;
            height: auto;
          }

          .section {
            padding: 3rem 1.5rem;
          }

          .section-content {
            flex-direction: column;
            gap: 2rem;
          }

          .reverse {
            flex-direction: column;
          }

          .section-text {
            text-align: center;
          }

          .carousel-item {
            height: 60vh;
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  );
}
