"use client";

import React, { useState, useEffect } from "react";
import DisasterReportForm from "../../components/forms/report";
import ArticleForm from "../../components/forms/article";
import dynamic from 'next/dynamic';


const DisasterMap = dynamic(() => import('../../components/forms/map/Disastermap'), {
  ssr: false, // Disable server-side rendering for the map
  loading: () => <div className="h-full w-full bg-gray-700 rounded-lg flex items-center justify-center">Loading map...</div>
});

const processReportData = (apiData) => {
  // Extract the predictions array from the API response
  const reports = apiData.predictions || [];
  
  return reports.map(report => ({
    id: report._id,
    title: report.text || "Untitled Report",
    source: report.source || "Unknown Source",
    time: report.time || "Time not specified",
    description: report.description?.trim() || "No description available",
    isDisaster: report.is_disaster === "yes" ? "confirmed" : "unverified",
    isVerified: report.fact_checker_verified || false,
    factVerdict: report.fact_verdict || "Not checked",
    factConfidence: report.fact_confidence,
    by: report.by || "AI System",
    rawData: report,
    upvotes: 0,  // Initialize votes to 0
    downvotes: 0,
    userVote: null // Keep original data for the popup
  }));
};


export default function LandingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emergencyExpanded, setEmergencyExpanded] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [location, setLocation] = useState(null); // Added location state
  const [priority, setPriority] = useState("medium"); // Added priority state
  const [isSending, setIsSending] = useState(false); // Added sending state
  const [showReportForm, setShowReportForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [disasterType, setDisasterType] = useState("");
  const [showMapView, setShowMapView] = useState(false);
  const [disasterReports, setDisasterReports] = useState([]);
const [loadingReports, setLoadingReports] = useState(false);
const [errorReports, setErrorReports] = useState(null);
const [selectedReport, setSelectedReport] = useState(null);

const handleUpvote = (reportId) => {
  setDisasterReports(prevReports => 
    prevReports.map(report => {
      if (report.id !== reportId) return report;
      
      // If already upvoted, remove the vote
      if (report.userVote === 'up') {
        return {
          ...report,
          upvotes: report.upvotes - 1,
          userVote: null
        };
      }
      
      // If downvoted, switch to upvote
      const wasDownvoted = report.userVote === 'down';
      return {
        ...report,
        upvotes: report.upvotes + 1,
        downvotes: wasDownvoted ? report.downvotes - 1 : report.downvotes,
        userVote: 'up'
      };
    })
  );
};

const handleDownvote = (reportId) => {
  setDisasterReports(prevReports => 
    prevReports.map(report => {
      if (report.id !== reportId) return report;
      
      // If already downvoted, remove the vote
      if (report.userVote === 'down') {
        return {
          ...report,
          downvotes: report.downvotes - 1,
          userVote: null
        };
      }
      
      // If upvoted, switch to downvote
      const wasUpvoted = report.userVote === 'up';
      return {
        ...report,
        downvotes: report.downvotes + 1,
        upvotes: wasUpvoted ? report.upvotes - 1 : report.upvotes,
        userVote: 'down'
      };
    })
  );
};

const openArticleForm = (report) => {
  setSelectedReport(report);
  setShowArticleForm(true);
  document.body.style.overflow = 'hidden';
};

const closeArticleForm = () => {
  setSelectedReport(null);
  setShowArticleForm(false);
  document.body.style.overflow = 'auto';
};

// In your fetchDisasterReports function, add validation:
const fetchDisasterReports = async () => {
  setLoadingReports(true);
  setErrorReports(null);
  
  try {
    console.log("Starting API request to fetch disaster reports...");
    const response = await fetch('https://fact-checker-e7lx.onrender.com/getus');
    
    console.log("API response received. Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server returned error:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`Server error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API response data:", JSON.stringify(data, null, 2)); // Pretty-print JSON
    
    if (!data) {
      console.error("Received empty data from server");
      throw new Error("No data received from server");
    }

    console.log("Processing raw API data...");
    const processedReports = processReportData(data);
    console.log("Processed reports:", processedReports);
    
    setDisasterReports(processedReports);
    console.log("Disaster reports successfully updated in state");
    
  } catch (error) {
    console.error("Failed to load reports:", {
      error: error,
      message: error.message,
      stack: error.stack
    });
    setErrorReports(error.message);
    
    console.log("Falling back to mock data...");
    const mockReports = getMockDisasterReports();
    console.log("Mock reports to be used:", mockReports);
    setDisasterReports(mockReports);
  } finally {
    console.log("API request completed");
    setLoadingReports(false);
  }
};


const getMockDisasterReports = () => {
  return processReportData({
    predictions: [
      {
        _id: "mock1",
        text: "Flood Warning - Northern Regions",
        source: "National Weather Service",
        time: new Date().toISOString(),
        description: "Rising water levels detected in northern regions",
        is_disaster: "yes",
        fact_checker_verified: true,
        fact_verdict: "Not checked",
        by: "ai"
      },
      {
        _id: "mock2",
        text: "Wildfire Alert",
        source: "Forest Service",
        time: new Date(Date.now() - 3600000).toISOString(),
        description: "Fire spreading in western territories",
        is_disaster: "no idea",
        fact_checker_verified: false,
        fact_verdict: "False",
        fact_confidence: 0.85,
        by: "ai"
      }
    ]
  });
};

const formatDateTime = (timeString) => {
  try {
    const date = new Date(timeString);
    return isNaN(date) ? timeString : date.toLocaleString();
  } catch {
    return timeString || "Time not specified";
  }
};

const determineDisasterStatus = (status) => {
  if (status === "yes") return "confirmed";
  if (status === "no") return "false alarm";
  return "unverified"; // handles "no idea" and other cases
};

useEffect(() => {
  fetchDisasterReports();
  
  // Optional: Set up polling to refresh reports periodically
  const intervalId = setInterval(fetchDisasterReports, 300000); // 5 minutes
  
  return () => clearInterval(intervalId);
}, []);
  
// Add these functions:

const toggleMapView = () => {
  setShowMapView(!showMapView);
};
  // Fetch user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setLocationError("Unable to retrieve your location");
          console.error("Geolocation error:", err);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
    }
  }, []);
  const handleSendSOS = async () => {
    // Validate required fields
    if (!location) {
      setLocationError("Location not available");
      return;
    }
    if (!disasterType) {
      alert("Please select a disaster type");
      return;
    }
  
    setIsSending(true);
  
    // Prepare payload in GeoJSON Point format
    const emergencyData = {
      disasterType,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat] // Note: GeoJSON uses [longitude, latitude]
      },
      priority
    };
  
    try {
      const API_URL = 'https://disasterpulse.divinedevelopers.tech/api/emergency/sendemergency';
      
      console.log("Sending payload:", emergencyData); // Debug log
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication if required:
          // 'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(emergencyData),
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
  
      const result = await response.json();
      alert(`Emergency reported successfully! ID: ${result.id || 'N/A'}`);
  
    } catch (error) {
      console.error("API Error:", error);
      
      let errorMessage = "Failed to send emergency alert. ";
      if (error.name === 'AbortError') {
        errorMessage += "Request timed out. Please check your connection.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage += "Network error. Please check your internet connection.";
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      
      // Optional: Save for retry later
      saveForRetry(emergencyData);
      
    } finally {
      setIsSending(false);
    }
  };
  
  // Optional retry functionality
  const saveForRetry = (data) => {
    const pending = JSON.parse(localStorage.getItem('pendingEmergencies') || []);
    pending.push(data);
    localStorage.setItem('pendingEmergencies', JSON.stringify(pending));
  };


  // Add this temporary test function to your component
// const testAPIEndpoint = async () => {
//   try {
//     const response = await fetch('https://disasterpulse.divinedevelopers.tech/api/emergency/sendemergency', {
//       method: 'POST', // Preflight request
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//     console.log("API Connection Test:", response);
//     alert(`API is ${response.ok ? "reachable" : "not responding properly"}`);
//   } catch (error) {
//     console.error("API Connection Test Failed:", error);
//     alert("API endpoint is unreachable. Check console for details.");
//   }
// };

// Call this temporarily to test connectivity
// testAPIEndpoint();

  const notifications = [
    {
      id: 1,
      title: "System Update",
      message: "New safety features have been added to the platform",
      time: "10 minutes ago",
      read: false
    },
    {
      id: 2,
      title: "Emergency Drill",
      message: "Monthly emergency drill scheduled for tomorrow at 10 AM",
      time: "2 hours ago",
      read: false
    },
    {
      id: 3,
      title: "Weather Alert",
      message: "High wind warning for your area tomorrow afternoon",
      time: "1 day ago",
      read: true
    },
    {
      id: 4,
      title: "New Message",
      message: "You have received a new message from the safety team",
      time: "2 days ago",
      read: true
    }
  ];

  const safetyResources = [
    {
      id: 1,
      title: "Earthquake Safety",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Earthquake Safety Measures</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Drop, Cover, and Hold On:</strong> Get down on your hands and knees, cover your head and neck, and hold on to sturdy furniture.</li>
            <li><strong>Stay Indoors:</strong> Avoid doorways and windows. Move to an interior wall or under sturdy furniture.</li>
            <li><strong>If Outside:</strong> Move to an open area away from buildings, trees, and power lines.</li>
            <li><strong>If Driving:</strong> Pull over to a safe location and stay in your vehicle until shaking stops.</li>
            <li><strong>After Shaking Stops:</strong> Check for injuries and damage. Be prepared for aftershocks.</li>
          </ul>
        </div>
      )
    },
    {
      id: 2,
      title: "Flood Safety",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Flood Safety Measures</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Move to Higher Ground:</strong> Immediately evacuate to higher ground if flooding is imminent.</li>
            <li><strong>Avoid Walking Through Water:</strong> Just 6 inches of moving water can knock you down.</li>
            <li><strong>Turn Off Utilities:</strong> Shut off electricity, gas, and water if instructed to do so.</li>
            <li><strong>Do Not Drive Through Floodwater:</strong> Most flood deaths occur in vehicles.</li>
            <li><strong>Stay Informed:</strong> Monitor weather reports and emergency broadcasts.</li>
          </ul>
        </div>
      )
    },
    {
      id: 3,
      title: "Wildfire Safety",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Wildfire Safety Measures</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Create Defensible Space:</strong> Clear flammable vegetation at least 30 feet around your home.</li>
            <li><strong>Prepare an Emergency Kit:</strong> Include N95 masks, goggles, and a battery-powered radio.</li>
            <li><strong>Evacuate Early:</strong> Don't wait for mandatory evacuation orders if you feel threatened.</li>
            <li><strong>Close Up Your Home:</strong> Shut all windows, doors, and vents before leaving.</li>
            <li><strong>Stay Low if Caught:</strong> Find a body of water or area with little vegetation if trapped.</li>
          </ul>
        </div>
      )
    },
    {
      id: 4,
      title: "Hurricane Safety",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Hurricane Safety Measures</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Prepare an Emergency Kit:</strong> Include food, water, medications, and important documents.</li>
            <li><strong>Protect Windows:</strong> Install storm shutters or board up windows with plywood.</li>
            <li><strong>Know Your Evacuation Route:</strong> Identify multiple routes to higher ground.</li>
            <li><strong>Stay Indoors:</strong> During the storm, stay in an interior room away from windows.</li>
            <li><strong>Avoid Floodwaters:</strong> They may be electrically charged or contaminated.</li>
          </ul>
        </div>
      )
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    // In a real app, you would update the notification status in your backend
    console.log(`Marking notification ${id} as read`);
  };

  const handleResourceClick = (resource) => {
    setActiveResource(resource);
    setSlideOpen(true);
  };

  const closeSlide = () => {
    setSlideOpen(false);
    setTimeout(() => setActiveResource(null), 300);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  // Function to open the report form dialog

const openReportForm = () => {
  setShowReportForm(true);
  document.body.style.overflow = 'hidden';
};

const closeReportForm = () => {
  setShowReportForm(false);
  document.body.style.overflow = 'auto';
};


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex relative overflow-hidden">
      {/* Collapsible Sidebar */}
      <div className={`${sidebarOpen ? 'w-70' : 'w-20'} bg-gray-800 transition-all duration-300 flex-shrink-0 relative z-20`}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 bg-gray-700 hover:bg-gray-600 rounded-full p-2 z-10"
        >
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            {sidebarOpen && <h2 className="text-xl font-bold ml-3">AlertSystem</h2>}
          </div>

          {/* Profile Card - Updated to show icon when collapsed */}
          <div className="mb-6">
            {sidebarOpen ? (
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-900/50 flex items-center justify-center mb-4 border-2 border-indigo-500">
                    <span className="text-3xl font-medium text-indigo-300">MR</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Mriganka Rajkhowa</h2>
                  <p className="text-sm text-indigo-300">@MriRaj123</p>
                </div>
                
                <div className="space-y-4 border-t border-gray-700 pt-5 mt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Today's Date</span>
                    <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Safety Points</span>
                    <span className="text-sm font-medium text-indigo-400">120</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center p-4">
                <div className="w-12 h-12 p-4 rounded-full bg-indigo-900/50 flex items-center justify-center border-2 border-indigo-500">
                  <span className="text-l font-medium text-indigo-300">MR</span>
                </div>
              </div>
            )}
          </div>

          {/* Safety Resources - Visible when sidebar open */}
          {sidebarOpen && (
            <div className="mb-6 px-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Safety Guides</h3>
              <div className="grid grid-cols-2 gap-3">
                {safetyResources.map(resource => (
                  <div
                    key={resource.id}
                    onClick={() => handleResourceClick(resource)}
                    className="safety-card p-3 rounded-lg border border-gray-700 cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-10 h-10 bg-indigo-900/20 rounded-full flex items-center justify-center mb-2">
                      {React.cloneElement(resource.icon, { className: "h-5 w-5 text-indigo-400" })}
                    </div>
                    <span className="text-xs text-center text-gray-300">{resource.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Button - Visible when sidebar closed */}
          {!sidebarOpen && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center">
              <button 
                onClick={toggleMapView}
                className="p-2 bg-indigo-900/30 rounded-full border border-indigo-800/50 hover:bg-indigo-800/50 transition-colors"
                title={showMapView ? 'Hide Map' : 'Show Map'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Safety Resources Icon - Visible when sidebar closed */}
          {!sidebarOpen && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button 
                onClick={() => setEmergencyExpanded(!emergencyExpanded)}
                className="p-2 bg-indigo-900/30 rounded-full border border-indigo-800/50 hover:bg-indigo-800/50 transition-colors"
                title="Safety Resources"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {sidebarOpen && (
            <div className="mt-4 px-4">
              <button
                onClick={toggleMapView}
                className="w-full flex items-center justify-center gap-2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {showMapView ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          )}


                {/* Centered Resource Modal */}
                {activeResource && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
                    <div className="resource-modal bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-indigo-900/20 p-2 rounded-lg">
                              {activeResource.icon}
                            </div>
                            <h2 className="text-xl font-bold">{activeResource.title}</h2>
                          </div>
                          <button 
                            onClick={closeSlide}
                            className="p-1 rounded-full hover:bg-gray-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="prose prose-invert max-w-none">
                          {activeResource.content}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-700">
                          <h3 className="font-medium mb-3">Emergency Contacts</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { name: 'Local Emergency', number: '911' },
                              { name: 'Disaster Helpline', number: '1-800-985-5990' },
                              { name: 'Red Cross', number: '1-800-RED-CROSS' },
                              { name: 'Weather Service', number: '1-800-WX-BRIEF' }
                            ].map((contact, i) => (
                              <div key={i} className="safety-card p-3 rounded-lg">
                                <p className="text-xs text-gray-400">{contact.name}</p>
                                <p className="text-indigo-400 font-medium">{contact.number}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-9 gap-6">
                {/* Middle Column - Critical Alerts and Information */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  {/* Search Bar with Notification and Logout Icons */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Search alerts, news, and resources..."
                      />
                    </div>
                    
                    {/* Notification Icon */}
                    <div className="relative">
                      <button 
                        onClick={toggleNotifications}
                        className="p-2 rounded-full hover:bg-gray-700 relative"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      
                      {/* Notification Dropdown */}
                      {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                          <div className="p-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Notifications</h3>
                          </div>
                          <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto scrollbar-hide">
                            {notifications.map((notification) => (
                              <div 
                                key={notification.id} 
                                className={`p-4 hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-gray-700/50' : ''}`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 border-t border-gray-700 text-center">
                            <button className="text-xs text-indigo-400 hover:text-indigo-300">
                              View All Notifications
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Logout Icon */}
                    <button className="p-2 rounded-full hover:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-end">
                </div>

                {showMapView ? (
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-1 min-h-[500px]">
                    {location ? (
                      <DisasterMap userLocation={[location.lat, location.lng]} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        {locationError || "Loading location..."}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Critical Alerts Section */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-semibold text-white">Critical Alerts</h2>
                        <span className="text-xs bg-red-900 text-red-200 px-3 py-1 rounded-full">1 Active</span>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-red-500">
                          <p className="text-sm font-medium text-white">Earthquake Detected - Nepal Region</p>
                          <p className="text-xs text-gray-400 mt-1">Today at 14:50 UTC • Magnitude 4.6 • 50km depth</p>
                        </div>
                      </div>
                    </div>

                    {/* Active Disaster Reports */}
                    {/* Active Disaster Reports */}
<div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
  {/* Header - remains fixed */}
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-xl font-semibold text-white">Disaster Reports</h2>
    <span className="text-xs bg-yellow-900 text-yellow-200 px-3 py-1 rounded-full">
      {disasterReports.length} Reports
    </span>
  </div>

  {/* Loading and Error States */}
  {loadingReports && (
    <div className="flex justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
    </div>
  )}

  {errorReports && (
    <div className="mb-4 p-3 bg-red-900/20 text-red-300 text-sm rounded-lg">
      Error loading reports: {errorReports}
    </div>
  )}

  {/* Scrollable Reports Container */}
  <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 scrollbar-hidden">
    <div className="space-y-4 pr-2">
      {disasterReports.map((report) => {
        // Determine verification status from fact_verdict
        const isVerified = report.rawData.fact_verdict === "Verified";
        const isFalse = report.rawData.fact_verdict === "False";
        const isNotChecked = report.rawData.fact_verdict === "Not checked";

        return (
          <div 
            key={report.id}
            className={`bg-gray-700/50 p-4 rounded-lg border-l-4 ${
              report.isDisaster === "confirmed" ? "border-red-500" : "border-yellow-500"
            } hover:bg-gray-700 transition-colors`}
            onClick={() => {openArticleForm(report)}}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-white">{report.title}</h3>
              <div className="flex gap-2">
                {isVerified && (
                  <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
                {isFalse && (
                  <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-full">
                    False
                  </span>
                )}
                {isNotChecked && (
                  <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-full">
                    Unverified
                  </span>
                )}
                {report.rawData.fact_confidence && (
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">
                    {Math.round(report.rawData.fact_confidence)}%
                  </span>
                )}
              </div>
            </div>
            <div className="mt-1 flex justify-between items-center">
              <span className="text-xs text-gray-400">{report.source}</span>
              <span className="text-xs text-gray-400">{report.time}</span>
            </div>

            {/* Voting buttons row */}
            <div className="mt-3 flex items-center gap-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpvote(report.id);
                }}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                  report.userVote === 'up' 
                    ? 'bg-green-900/50 text-green-300' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 15l7-7 7 7" 
                  />
                </svg>
                {report.upvotes || 0}
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownvote(report.id);
                }}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                  report.userVote === 'down' 
                    ? 'bg-red-900/50 text-red-300' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
                {report.downvotes || 0}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>

</div>
              </>
            )}
          </div>
                {/* Right Column - Leaderboard and Notifications */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  {/* Leaderboard */}
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                    <h2 className="text-xl font-semibold text-white mb-5">Safety Leaderboard</h2>
                    <div className="space-y-2">
                      {[
                        { name: 'Alex C.', points: 450, highlight: true },
                        { name: 'Sam R.', points: 380 },
                        { name: 'Taylor M.', points: 290 },
                        { name: 'Jordan P.', points: 210 }
                      ].map((user, index) => (
                        <div key={index} className="bg-gray-700/50 p-2 rounded-lg border-l-4 border-red-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium ${user.highlight ? 'text-indigo-400' : 'text-gray-300'}`}>
                                {index + 1}. {user.name}
                              </span>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${user.highlight ? 'bg-indigo-900/30 text-indigo-300' : 'bg-gray-700 text-gray-400'}`}>
                              {user.points} pts
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Button Box */}
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                    <h2 className="text-lg font-semibold text-white mb-4">Report Emergency</h2>
                    <button 
                      onClick={openReportForm} 
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8a1 1 0 10-2 0v4a1 1 0 102 0V8zm-1 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Lodge Emergency Report
                    </button>
                    <p className="text-xs text-gray-400 mt-3">This will send emergency report to the authorities</p>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                    <h2 className="text-lg font-semibold text-white mb-4">Emergency</h2>

                    {/* Disaster Type Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Disaster Type
                      </label>
                      <select
                        value={disasterType}
                        onChange={(e) => setDisasterType(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Disaster Type</option>
                        <option value="earthquake">Earthquake</option>
                        <option value="flood">Flood</option>
                        <option value="wildfire">Wildfire</option>
                        <option value="hurricane">Hurricane</option>
                        <option value="medical">Medical Emergency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    {/* Location Display */}
                    <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-300">Location:</span>
                        {location ? (
                          <span className="text-indigo-300">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </span>
                        ) : locationError ? (
                          <span className="text-red-400 text-xs">{locationError}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">Fetching location...</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Priority Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Emergency Priority
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "low", label: "Low", color: "bg-yellow-600 hover:bg-yellow-700" },
                          { value: "medium", label: "Medium", color: "bg-orange-600 hover:bg-orange-700" },
                          { value: "high", label: "High", color: "bg-red-600 hover:bg-red-700" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setPriority(option.value)}
                            className={`py-2 px-3 rounded-md text-white text-sm font-medium transition-colors ${option.color} ${priority === option.value ? 'ring-2 ring-white' : ''}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* SOS Button */}
                    <button
                      onClick={handleSendSOS}
                      disabled={isSending || !location || !disasterType}
                      className={`w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${(isSending || !location || !disasterType) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8a1 1 0 10-2 0v4a1 1 0 102 0V8zm-1 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          Send SOS Alert
                        </>
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-400 mt-3">
                      {location 
                        ? "This will notify emergency services with your location and priority level"
                        : "Enable location services to send emergency alerts"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disaster Report Form Modal */}
            {showReportForm && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  {/* Background overlay */}
                  <div 
                    className="fixed inset-0 transition-opacity" 
                    aria-hidden="true"
                    onClick={closeReportForm}
                  >
                    <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                  </div>

                  {/* Modal container */}
                  <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <DisasterReportForm onClose={closeReportForm} />
                  </div>
                </div>
              </div>
            )}
            {showArticleForm && (
        <ArticleForm 
          articleData={selectedReport} 
          onClose={closeArticleForm} 
        />
      )}

    </div>
  );
}


