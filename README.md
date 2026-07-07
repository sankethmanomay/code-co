# CODE & CO Single-Page Website

A modern, responsive coding club website for **CODE & CO**, featuring a minimal tech aesthetic, pixel-art styling, a light/dark mode theme toggle, responsive grids, micro-animations, and a functional backend that saves student enrollments directly to a Google Sheet (with a local JSON file fallback).

## Features
- **Visual Design**: Sleek dot-pattern background, wide monospace typography (Space Grotesk & JetBrains Mono), custom glitched pixel-art "C" logo.
- **Theme Switcher**: Fully functional light/dark mode toggle.
- **Interactive Forms**: Smooth focus indicators, custom feedback styling, and floating success/error toast notifications.
- **Google Sheets Integration**: Automatically appends new registrations to a Google Sheet spreadsheet via service account authentication.
- **Local Fallback**: Saves data to a local `enrollments.json` file if credentials or configurations are missing, ensuring it works out-of-the-box.

---

## Setup Instructions

### 1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 2. Google Sheets Integration Setup (Optional but recommended)
To save form details to Google Sheets, follow these steps:

1. **Create a Google Cloud Project & Enable Sheets API**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project.
   - Search for **Google Sheets API** in the API Library and click **Enable**.

2. **Create a Service Account**:
   - Go to **IAM & Admin > Service Accounts**.
   - Click **Create Service Account**, fill in details, and click **Create and Continue**.
   - Grant no roles (leave empty) and click **Done**.

3. **Generate service account keys**:
   - Click on your newly created service account.
   - Navigate to the **Keys** tab.
   - Click **Add Key > Create New Key**, select **JSON**, and click **Create**.
   - Download the file, rename it to `credentials.json`, and place it in the root directory of this project (`E:\code&co\credentials.json`).

4. **Prepare the Google Sheet**:
   - Create a new Google Sheet.
   - In the first row, add the headers exactly like this:
     `Timestamp` | `Full Name` | `USN` | `Branch` | `Section` | `Skills`
   - Copy the spreadsheet ID from the sheet's URL. The ID is the long string of characters between `/d/` and `/edit` (e.g., `1a2b3c4d5e6f...`).
   - Share your spreadsheet with the service account email (found in your `credentials.json` under `client_email`) and give it **Editor** permissions.

5. **Configure environment variables**:
   - Copy `.env.example` to a new file named `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and set:
     - `PORT=3000`
     - `SPREADSHEET_ID=your_actual_google_sheet_id_here`
     - `GOOGLE_APPLICATION_CREDENTIALS=credentials.json`

---

## Running the Application

To run the application locally:

```bash
# Start backend and serve frontend
npm start
```

Visit the website at [http://localhost:3000](http://localhost:3000).

- **Testing Google Sheets**: If everything is configured, submitting the form will add a new row to your Google Sheet.
- **Testing Local Fallback**: If no service credentials or sheets are configured, the form details will write to a file named `enrollments.json` in the root of the project directory.
