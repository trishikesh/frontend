"use client";

import { useState, useEffect } from "react";
import { FiMenu, FiSearch, FiSettings } from "react-icons/fi";
import { AiOutlineBell } from "react-icons/ai";
import { MdDashboard, MdCampaign, MdWidgets, MdSupport } from "react-icons/md";

export default function Dashboard({ isAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [slideOpen, setSlideOpen] = useState(false);

  const [sosRequests, setSosRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://disasterpulse.divinedevelopers.tech/api/emergency/getemergency');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if data exists and is in expected format
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received from API');
        }

        // Convert the object to an array if needed
        let emergencies = [];
        if (Array.isArray(data)) {
          emergencies = data;
        } else if (data.data && Array.isArray(data.data)) {
          emergencies = data.data;
        } else {
          // If it's a single object, wrap it in an array
          emergencies = [data];
        }

        // Transform the data
        const transformedData = emergencies.map((emergency, index) => ({
          id: emergency._id || `emergency-${index}`,
          type: emergency.disasterType || 'unknown',
          userName: emergency.user?.name || 'Anonymous User',
          priority: emergency.priority || 'medium',
          time: emergency.createdAt ? new Date(emergency.createdAt).toLocaleString() : 'Recently',
          location: emergency.location?.coordinates 
            ? `${emergency.location.coordinates[1]?.toFixed(4) || 0}° N, ${emergency.location.coordinates[0]?.toFixed(4) || 0}° E`
            : 'Location not available'
        }));
        
        setSosRequests(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching emergency data:', err);
        setError(err.message);
        // Set fallback data
        setSosRequests([{
          id: 'fallback-1',
          type: 'earthquake',
          userName: 'System User',
          priority: 'high',
          time: 'Just now',
          location: 'Unknown location'
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmergencyData();
  }, []);

  const handleBroadcast = (sosId) => {
    const request = sosRequests.find(req => req.id === sosId);
    console.log(`Broadcasting SOS: ${sosId}`);
    alert(`Broadcasting emergency alert for ${request.userName}'s ${request.type} SOS`);
  };

  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'report123',
      type: 'report',
      title: 'Earthquake Report - Kathmandu',
      details: 'Submitted 30 mins ago • Magnitude 6.2',
      priority: 'high'
    },
    {
      id: 'volunteer456',
      type: 'volunteer',
      title: 'New Volunteer - John Doe',
      details: 'Medical background • Awaiting verification',
      priority: 'medium'
    },
    {
      id: 'resource789',
      type: 'resource',
      title: 'Resource Request - Tents',
      details: '50 units needed • Flood relief camp',
      priority: 'high'
    },
    {
      id: 'resource789',
      type: 'resource',
      title: 'Resource Request - Tents',
      details: '50 units needed • Flood relief camp',
      priority: 'high'
    }
  ]);
  
  const handleApproval = (action, id) => {
    console.log(`${action} item ${id}`);
    setPendingApprovals(pendingApprovals.filter(item => item.id !== id));
    alert(`Request ${id} has been ${action}d`);
  };

  const notifications = [
    {
      id: 1,
      title: "System Update",
      message: "New admin features have been added",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      title: "New Reports",
      message: "5 new emergency reports need review",
      time: "1 day ago",
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const markAsRead = (id) => {
    console.log(`Marking notification ${id} as read`);
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
            {sidebarOpen && <h2 className="text-xl font-bold ml-3">DisasterHub</h2>}
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              <li className="flex items-center p-3 rounded-lg bg-indigo-900/30 border border-indigo-800/50">
                <MdDashboard className="mr-3 text-indigo-400" />
                {sidebarOpen && <span>Dashboard</span>}
              </li>
              <li className="flex items-center p-3 rounded-lg hover:bg-gray-700/50 border border-transparent hover:border-gray-600 transition-colors">
                <MdCampaign className="mr-3 text-indigo-400" />
                {sidebarOpen && <span>Emergency Reports</span>}
              </li>
              <li className="flex items-center p-3 rounded-lg hover:bg-gray-700/50 border border-transparent hover:border-gray-600 transition-colors">
                <MdWidgets className="mr-3 text-indigo-400" />
                {sidebarOpen && <span>Resources</span>}
              </li>
              <li className="flex items-center p-3 rounded-lg hover:bg-gray-700/50 border border-transparent hover:border-gray-600 transition-colors">
                <MdSupport className="mr-3 text-indigo-400" />
                {sidebarOpen && <span>Support</span>}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-9 gap-6">
          {/* Middle Column - Admin Content */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Search Bar with Notification and Settings Icons */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search reports, users, and resources..."
                />
              </div>
              
              <div className="relative">
                <button 
                  onClick={toggleNotifications}
                  className="p-2 rounded-full hover:bg-gray-700 relative"
                >
                  <AiOutlineBell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
              
              <button className="p-2 rounded-full hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* SOS Requests Section */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-white">SOS Requests</h2>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">
                  View All
                </button>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-40 ">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 "></div>
                </div>
              ) : error ? (
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-800/50 text-center">
                  <p className="text-red-300">Error loading emergency data: {error}</p>
                  <p className="text-gray-400 text-sm mt-2">Showing fallback data</p>
                </div>
              ) : sosRequests.length === 0 ? (
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <p className="text-gray-400">No active emergency requests found</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[420px] overflow-y-auto hover:scrollbar-thin pr-2 transition-all duration-300 scrollbar-hidden">
                  {sosRequests.map((request) => (
                    <div key={request.id} className={`bg-gray-700/50 p-4 rounded-lg border-l-4 ${
                      request.priority === 'critical' ? 'border-red-500' : 
                      request.priority === 'high' ? 'border-yellow-500' : 'border-orange-500'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {request.priority === 'critical' ? '🚨 ' : '⚠️ '}
                            Emergency SOS - {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">User: {request.userName} • {request.time} • Priority: {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}</p>
                          <p className="text-xs text-gray-300 mt-2">Location: {request.location}</p>
                        </div>
                        <button 
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                          onClick={() => handleBroadcast(request.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                          </svg>
                          Broadcast
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Approvals Section */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-white">Pending Approvals</h2>
                <span className="text-xs bg-red-900 text-red-200 px-3 py-1 rounded-full">
                  {pendingApprovals.length} Urgent
                </span>
              </div>
              <div className="space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className={`bg-gray-700/50 p-4 rounded-lg border-l-4 ${
                    approval.priority === 'high' ? 'border-red-500' : 'border-yellow-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-white">{approval.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{approval.details}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 bg-green-600 hover:bg-green-700 rounded-full"
                          onClick={() => handleApproval('approve', approval.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
                          onClick={() => handleApproval('reject', approval.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Admin Tools */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Admin Stats */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
              <h2 className="text-xl font-semibold text-white mb-5">Admin Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-400">24</p>
                  <p className="text-xs text-gray-400">Pending Reports</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">156</p>
                  <p className="text-xs text-gray-400">Resolved Today</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-400">8</p>
                  <p className="text-xs text-gray-400">Active Disasters</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">3</p>
                  <p className="text-xs text-gray-400">Critical Alerts</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors duration-200">
                  Send Alerts
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors duration-200">
                  Allocate Resources
                </button>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-medium transition-colors duration-200">
                  Generate Report
                </button>
              </div>
            </div>

            {/* Admin Broadcast */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Send Broadcast</h2>
              <textarea
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-3"
                placeholder="Emergency message..."
                rows="3"
              ></textarea>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8a1 1 0 10-2 0v4a1 1 0 102 0V8zm-1 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Send Emergency Alert
              </button>
              <p className="text-xs text-gray-400 mt-3">This will notify all users in your region</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}