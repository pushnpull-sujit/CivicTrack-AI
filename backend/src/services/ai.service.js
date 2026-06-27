const db = require('../config/db');

// Haversine formula to compute distance in meters between two GPS coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const aiService = {
  // Analyze complaint details
  async analyzeComplaint(description, filename, latitude, longitude) {
    const textToAnalyze = `${description || ''} ${filename || ''}`.toLowerCase();
    
    // 1. Detect Category
    let category = 'Other';
    let confidence = 0.88;
    let detectedFeatures = [];

    if (textToAnalyze.includes('pothole') || textToAnalyze.includes('pit') || textToAnalyze.includes('hole') || textToAnalyze.includes('cracked asphalt')) {
      category = 'Pothole';
      detectedFeatures = ['asphalt cavitation', 'exposed subgrade', 'structural asphalt fatigue'];
    } else if (textToAnalyze.includes('streetlight') || textToAnalyze.includes('light') || textToAnalyze.includes('lamp') || textToAnalyze.includes('dark')) {
      category = 'Broken Streetlight';
      detectedFeatures = ['luminaire failure', 'wiring exposure', 'low ambient illumination'];
    } else if (textToAnalyze.includes('water') || textToAnalyze.includes('leak') || textToAnalyze.includes('pipe') || textToAnalyze.includes('flood') || textToAnalyze.includes('burst')) {
      category = 'Water Leakage';
      detectedFeatures = ['water pooling', 'hydrostatic pressure rupture', 'subsurface saturation'];
    } else if (textToAnalyze.includes('garbage') || textToAnalyze.includes('trash') || textToAnalyze.includes('dump') || textToAnalyze.includes('waste') || textToAnalyze.includes('debris')) {
      category = 'Garbage';
      detectedFeatures = ['solid waste accumulation', 'unsanitary dumping', 'biological vector attraction'];
    } else if (textToAnalyze.includes('road') || textToAnalyze.includes('crack') || textToAnalyze.includes('sidewalk') || textToAnalyze.includes('pavement')) {
      category = 'Road Damage';
      detectedFeatures = ['alligator cracking', 'structural slippage', 'pavement displacement'];
    } else {
      category = 'Other';
      detectedFeatures = ['unclassified surface anomaly'];
    }

    // 2. Estimate Severity (Low, Medium, High)
    let severity = 'Medium';
    const highSeverityKeywords = ['dangerous', 'accident', 'severe', 'major', 'flooding', 'blocked', 'hurt', 'crash', 'hazard', 'critical', 'injury', 'broken bone', 'car damage'];
    const lowSeverityKeywords = ['minor', 'small', 'tiny', 'cosmetic', 'aesthetic', 'just a bit', 'negligible'];

    const hasHighKeywords = highSeverityKeywords.some(keyword => textToAnalyze.includes(keyword));
    const hasLowKeywords = lowSeverityKeywords.some(keyword => textToAnalyze.includes(keyword));

    if (hasHighKeywords) {
      severity = 'High';
    } else if (hasLowKeywords) {
      severity = 'Low';
    }

    // 3. Detect Duplicate Complaints (same category, within 100 meters, active)
    let isDuplicate = false;
    let duplicateOf = null;
    
    if (latitude && longitude) {
      const activeComplaints = await db.complaints.find({
        category,
        status: { $ne: 'Completed' }
      });

      for (const complaint of activeComplaints) {
        const distance = getDistance(latitude, longitude, complaint.latitude, complaint.longitude);
        if (distance <= 100) { // 100 meters threshold
          isDuplicate = true;
          duplicateOf = complaint._id;
          break;
        }
      }
    }

    // 4. Automatically Assign Complaint Priority
    let priority = 'Medium';
    if (severity === 'High') {
      if (['Pothole', 'Water Leakage', 'Road Damage'].includes(category)) {
        priority = 'Critical';
      } else {
        priority = 'High';
      }
    } else if (severity === 'Medium') {
      if (['Pothole', 'Water Leakage'].includes(category)) {
        priority = 'High';
      } else {
        priority = 'Medium';
      }
    } else if (severity === 'Low') {
      priority = 'Low';
    }

    return {
      category,
      confidence,
      detectedFeatures,
      severity,
      priority,
      isDuplicate,
      duplicateOf
    };
  }
};

module.exports = aiService;
