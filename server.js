const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
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

// SMTP Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send confirmation email
async function sendConfirmationEmail(name, email, usn, branch, section, skills) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured (SMTP_USER/SMTP_PASS missing). Skipping confirmation email.');
    return;
  }

  const emailFrom = process.env.EMAIL_FROM || '"CODE & CO" <codeandco2026@gmail.com>';
  const skillsHtml = skills ? `<tr><td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px; font-weight: bold;">Skills</td><td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px;">${skills}</td></tr>` : '';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to CODE & CO</title>
  <style>
    body {
      background-color: #121417;
      color: #FAFAFA;
      font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
      padding: 40px 20px;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1B1F23;
      border: 2px solid #FAFAFA;
      padding: 40px;
      box-shadow: 6px 6px 0px 0px #40916C;
    }
    .logo-container {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #FAFAFA;
      padding-bottom: 20px;
    }
    .logo-text {
      font-family: 'Space Grotesk', -apple-system, sans-serif;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #FAFAFA;
    }
    .logo-amp {
      color: #40916C;
    }
    h1 {
      font-family: 'Space Grotesk', -apple-system, sans-serif;
      font-size: 24px;
      text-transform: uppercase;
      margin-top: 0;
      color: #FAFAFA;
      letter-spacing: -1px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #CED4DA;
    }
    .highlight {
      color: #52B788;
      font-weight: bold;
    }
    .btn {
      display: inline-block;
      background-color: #40916C;
      color: #FAFAFA !important;
      text-decoration: none;
      font-weight: bold;
      padding: 12px 24px;
      border: 2px solid #FAFAFA;
      box-shadow: 3px 3px 0px 0px #FAFAFA;
      margin-top: 20px;
      text-transform: uppercase;
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid rgba(250, 250, 250, 0.08);
      font-size: 11px;
      color: #CED4DA;
      text-align: center;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .details-table th, .details-table td {
      border: 1px solid rgba(250, 250, 250, 0.15);
      padding: 10px;
      text-align: left;
      font-size: 13px;
    }
    .details-table th {
      background-color: #121417;
      color: #40916C;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div class="logo-text">CODE <span class="logo-amp">&amp;</span> CO</div>
    </div>
    <h1>Thank you for registering!</h1>
    <p>Hey <span class="highlight">${name}</span>,</p>
    <p>Your enrollment has been successfully received by the <strong>CODE &amp; CO</strong> club. We are excited to have you join our build-first, project-driven community at SSIT.</p>
    
    <p>Here are the details we received:</p>
    <table class="details-table">
      <thead>
        <tr>
          <th style="width: 30%;">Field</th>
          <th>Submitted Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px; font-weight: bold;">Name</td>
          <td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px;">${name}</td>
        </tr>
        <tr>
          <td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px; font-weight: bold;">USN</td>
          <td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px;">${usn}</td>
        </tr>
        <tr>
          <td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px; font-weight: bold;">Branch</td>
          <td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px;">${branch}</td>
        </tr>
        <tr>
          <td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px; font-weight: bold;">Section</td>
          <td style="border: 1px solid rgba(250, 250, 250, 0.15); padding: 10px;">${section}</td>
        </tr>
        ${skillsHtml}
      </tbody>
    </table>

    <p>What's next? We bypass dry theory to focus on team collaborations, hackathons, open source contributions, and peer-led product cycles. Stay tuned for our upcoming onboarding session and project matching cycles!</p>
    
    <div style="text-align: center;">
      <a href="http://localhost:3000" class="btn">Visit Website</a>
    </div>

    <div class="footer">
      <p>&copy; 2026 CODE &amp; CO Club. All rights reserved.</p>
      <p>SSIT Campus, Tumkur</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: 'Confirmation: Welcome to CODE & CO! ⚡',
      html: emailHtml,
    };

    console.log(`Sending confirmation email to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent: ${info.messageId}`);
  } catch (error) {
    console.error(`Failed to send confirmation email to ${email}:`, error.message);
  }
}

// Enrollment endpoint
app.post('/api/enroll', async (req, res) => {
  const { name, usn, branch, section, email, skills } = req.body;

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
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Email Address is required.' });
  }
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  const enrollmentData = {
    timestamp: new Date().toLocaleString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    usn: usn.trim().toUpperCase(),
    branch: branch.trim(),
    section: section.trim().toUpperCase(),
    skills: skills ? skills.trim() : ''
  };

  // Kick off sending confirmation email in the background
  sendConfirmationEmail(
    enrollmentData.name,
    enrollmentData.email,
    enrollmentData.usn,
    enrollmentData.branch,
    enrollmentData.section,
    enrollmentData.skills
  );

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
          message: 'Registration successful',
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
        message: 'Registration successful',
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
      message: 'Registration successful',
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
