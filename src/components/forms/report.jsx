"use client";

import { useState } from "react";

export default function DisasterReportForm({ onClose }) {
  const disasters = [
    "Earthquake", "Flood", "Tsunami", "Cyclone", "Landslide",
    "Wildfire", "Drought", "Volcanic Eruption", "Tornado", "Heatwave"
  ];

  const locations = [
    "Delhi, Delhi", "Mumbai, Maharashtra", "Bangalore, Karnataka", "Kolkata, West Bengal",
    "Chennai, Tamil Nadu", "Hyderabad, Telangana", "Pune, Maharashtra", "Ahmedabad, Gujarat",
    "Jaipur, Rajasthan", "Lucknow, Uttar Pradesh"
  ];

  const magnitudes = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
  const margins = ["low", "medium", "high"];

  const [formData, setFormData] = useState({
    disasterType: "",
    magnitude: "",
    marginOfDisaster: "medium",
    location: "",
    description: "",
    imageUrl: "",
    proof: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const reportData = {
        disasterType: formData.disasterType.toLowerCase(),
        marginOfDisaster: formData.marginOfDisaster,
        location: formData.location,
        imageUrl: formData.imageUrl || "https://via.placeholder.com/300",
        proof: formData.proof || "https://via.placeholder.com/300",
        timestamp: new Date().toISOString(),
        description: formData.description,
        accuracy: Math.floor(Math.random() * 30) + 70,
        status: "not_verified"
      };

      const response = await fetch("https://disasterpulse.divinedevelopers.tech/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-white">
              Disaster Report
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Disaster Type */}
            <div>
              <label htmlFor="disasterType" className="block text-sm font-medium text-gray-300">
                Disaster Type
              </label>
              <select
                id="disasterType"
                name="disasterType"
                value={formData.disasterType}
                onChange={(e) => setFormData({...formData, disasterType: e.target.value})}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
                required
              >
                <option value="">Select a disaster type</option>
                {disasters.map((disaster) => (
                  <option key={disaster} value={disaster}>{disaster}</option>
                ))}
              </select>
            </div>

            {/* Magnitude and Margin */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="magnitude" className="block text-sm font-medium text-gray-300">
                  Magnitude (1-10)
                </label>
                <input
                  type="number"
                  id="magnitude"
                  name="magnitude"
                  min="1"
                  max="10"
                  value={formData.magnitude}
                  onChange={(e) => setFormData({...formData, magnitude: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-3 py-2 bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
                />
              </div>
              <div>
                <label htmlFor="marginOfDisaster" className="block text-sm font-medium text-gray-300">
                  Severity
                </label>
                <select
                  id="marginOfDisaster"
                  name="marginOfDisaster"
                  value={formData.marginOfDisaster}
                  onChange={(e) => setFormData({...formData, marginOfDisaster: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
                >
                  {margins.map((margin) => (
                    <option key={margin} value={margin}>{margin.charAt(0).toUpperCase() + margin.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                list="location-options"
                className="mt-1 block w-full pl-3 pr-3 py-2 bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
                required
              />
              <datalist id="location-options">
                {locations.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>

            {/* Image URLs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-3 py-2 bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label htmlFor="proof" className="block text-sm font-medium text-gray-300">
                  Proof URL (Optional)
                </label>
                <input
                  type="url"
                  id="proof"
                  name="proof"
                  value={formData.proof}
                  onChange={(e) => setFormData({...formData, proof: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-3 py-2 bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
                  placeholder="https://example.com/proof.jpg"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full pl-3 pr-3 py-2 bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
                required
              />
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-3 bg-red-900/50 text-red-200 text-sm rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-900/50 text-green-200 text-sm rounded-md">
                Report submitted successfully!
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}