const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to save locally if Google Sheets credentials are not available
function saveToLocalFile(enrollmentData) {
  const filePath = path.join(__dirname, 'enrollments.json');
  let enrollments = [];

  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
      enrollments = JSON.parse(fileData);
    } catch (e) {
      console.error('Error reading local enrollments file, resetting database:', e);
    }
  }

  enrollments.push(enrollmentData);

  fs.writeFileSync(filePath, JSON.stringify(enrollments, null, 2), 'utf8');
  console.log('Saved student details locally to enrollments.json');
}

// Enrollment endpoint
app.post('/api/enroll', async (req, res) => {
  const { name, usn, branch, section, skills } = req.body;

  // Simple backend validation
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Full Name is required.' });
  }
  if (!usn || !usn.trim()) {
    return res.status(400).json({ success: false, error: 'USN is required.' });
  }
  if (!branch || !branch.trim()) {
    return res.status(400).json({ success: false, error: 'Branch is required.' });
  }
  if (!section || !section.trim()) {
    return res.status(400).json({ success: false, error: 'Section is required.' });
  }

  const enrollmentData = {
    timestamp: new Date().toLocaleString(),
    name: name.trim(),
    usn: usn.trim().toUpperCase(),
    branch: branch.trim(),
    section: section.trim().toUpperCase(),
    skills: skills ? skills.trim() : ''
  };

  // Try appending to Google Sheets via Google Apps Script Web App
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (appsScriptUrl) {
    try {
      console.log('Attempting to connect to Google Sheets via Google Apps Script...');
      
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enrollmentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log('Successfully saved to Google Sheets via Apps Script!');
        return res.status(200).json({
          success: true,
          message: 'Successfully enrolled! Details saved to Google Sheets.',
          source: 'google_sheets'
        });
      } else {
        throw new Error(result.error || 'Google Apps Script reported an error.');
      }

    } catch (error) {
      console.error('Google Sheets Integration Error, falling back to local file:', error.message);
      
      // Save locally as a fallback
      saveToLocalFile(enrollmentData);
      
      return res.status(200).json({
        success: true,
        message: 'Enrolled successfully! (Saved to local database due to Sheets integration error)',
        source: 'local_file_fallback',
        warning: error.message
      });
    }
  } else {
    // Save locally since configurations are missing
    console.warn('Google Apps Script URL configuration missing (APPS_SCRIPT_URL not set in .env). Falling back to local file.');
    
    saveToLocalFile(enrollmentData);
    
    return res.status(200).json({
      success: true,
      message: 'Enrolled successfully! (Saved to local database. Configure APPS_SCRIPT_URL in .env for Google Sheets integration)',
      source: 'local_file'
    });
  }
});
// Catch-all to serve index.html for other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`CODE & CO backend running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the website.`);
});
