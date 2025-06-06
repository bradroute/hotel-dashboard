Hotel Dashboard (Frontend)
A React-based dashboard for hotel staff to view, acknowledge, and complete guest requests in real time. This UI fetches data from the hotel-ops-api backend and displays requests in a sortable, filterable table. Staff can click “Acknowledge” to send a confirmation SMS (via Telnyx) and “Complete” to mark requests done.

Live Demo
Dashboard:
https://hotel-dashboard-<your-deployment>.vercel.app

Table of Contents
1.Features
2.Tech Stack
3.Installation & Local Development
4.Environment Variables
5.Project Structure
6.Available Scripts
7.Dashboard Usage
8.Seeding Sample Data
9.Deployment
10.Troubleshooting
11.License

Features

Request List
-Displays all incoming requests in reverse‐chronological order.
-Columns: Created At (Central Time), From (guest phone), Department, Priority (color‐coded), Message, Acknowledge, Complete.

Filters
-“Show Active Only” checkbox hides completed requests.
-Department dropdown filters requests by department (populated dynamically from fetched data).

Acknowledge & Complete
-Clicking Acknowledge sends a confirmation SMS to the guest via Telnyx, marks acknowledged = true in Supabase, and disables that button.
-Clicking Complete marks completed = true in Supabase and disables that button.

Auto‐Refresh
-The table refreshes automatically every 60 seconds to show new requests as they arrive.

Empty & Error States
-Displays a friendly “No unresolved requests right now 🎉” when there are no pending requests.
-Shows an error banner if the API fetch fails.

Login Protection
-A simple password‐gate: staff must enter the dashboard password (set in env vars) before seeing requests.

Accessibility & Responsiveness
-Focus outlines for keyboard navigation.
-Responsive table that scrolls horizontally on narrow viewports.
-Accessible badge labels and aria-labels for buttons.

Tech Stack
React (v18)
React Router (v6) for client‐side routing
CSS Modules for scoped styling
Fetch API for HTTP requests
Jest + React Testing Library for unit tests
Vercel for continuous deployment
Installation & Local Development

Clone the repo
bash
git clone https://github.com/<your-org>/hotel-dashboard.git
cd hotel-dashboard

Install dependencies
bash
npm ci

Create a .env file
Copy .env.example to .env and fill in the required values (see Environment Variables below).

Run in development mode
bash
npm run dev

Opens http://localhost:3000 by default.
Any code changes hot‐reload.

Run tests
bash
npm test

Environment Variables
Create a file named .env in the project root. Here are the variables your app expects:
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DASHBOARD_PASSWORD=your_dashboard_password_here
REACT_APP_API_URL – The base URL of your backend API (e.g., http://localhost:3001 in dev, or https://hotel-ops-api-1.onrender.com in prod).

REACT_APP_DASHBOARD_PASSWORD – A simple text password to gate the dashboard (staff must enter this to view).

Note: Every variable prefixed with REACT_APP_ will be embedded in the frontend bundle at build time.

Project Structure
dashboard/
├── .github/                   # GitHub Actions workflows
├── .vercel/                   # Vercel deployment config (optional)
├── public/                    # Static public files (favicon, index.html)
├── src/
│   ├── components/
│   │   ├── FiltersBar.jsx     # Checkbox + Department dropdown
│   │   ├── RequestsTable.jsx  # Table layout and header
│   │   ├── RequestRow.jsx     # Single row with buttons
│   │   └── (other shared components)
│   ├── pages/
│   │   └── LoginPage.jsx      # Simple password‐gate
│   ├── styles/
│   │   └── Dashboard.module.css  # Scoped CSS for dashboard UI
│   ├── utils/
│   │   └── api.js             # `getRequests`, `acknowledgeRequest`, `completeRequest`
│   ├── App.js                 # Router + nav links + global layout
│   ├── Dashboard.jsx          # Main dashboard page
│   ├── Analytics.jsx          # (Stub or live metrics page)
│   ├── index.js               # ReactDOM.render
│   └── setupTests.js          # Jest setup
├── .env.example               # Example environment variables
├── package.json
└── README.md                  # This file
Available Scripts
npm run dev
Runs the app in development mode (hot‐reload).
Open http://localhost:3000 to view it in the browser.

npm test
Runs unit tests using Jest + React Testing Library.

npm run build
Builds the production bundle to the build/ folder.

npm run lint
(If configured) Runs ESLint on all source files.

Dashboard Usage
1.Visit the URL (e.g., http://localhost:3000 or your Vercel domain).
2.Enter Password
On first load, you’ll see a “Hotel Crosby Staff Login” page.
Enter the password defined by REACT_APP_DASHBOARD_PASSWORD.
3.View Requests
The table will list all current requests from the backend.
Columns: Created At (Central Time), From, Department, Priority, Message, Acknowledge, Complete.
4.Filter
Use “Show Active Only” to hide all requests where completed = true.
Use the Department dropdown to limit to a single department.
5.Acknowledge
Click Acknowledge → sends a confirmation SMS to the guest → marks acknowledged = true in Supabase.
The button becomes a green checkmark once clicked.
6.Complete
Click Complete → marks completed = true in Supabase.
The button becomes a green checkmark once clicked.
7.Auto‐Refresh
The table will automatically reload every 60 seconds. To manually refresh, you can also reload the page.

Seeding Sample Data
To populate Supabase with dummy requests (for demo without SMS):
1.Log into your Supabase dashboard.
2.Navigate to Table Editor → HotelCrosbyRequests → Insert Row.
3.Fill in:
from → +16513469559
message → "Test request for front desk"
department → "Front Desk"
priority → "Normal"
telnyx_id → a random UUID (can be generated)
(leave acknowledged, completed as false)
4.Click Save.
Your new row should immediately appear in the dashboard (if your REACT_APP_API_URL is pointing to that same Supabase instance).

Deployment
Vercel (Frontend)
1.Connect your GitHub repo to Vercel.
2.In Vercel Dashboard → Project Settings → Environment Variables, add:
REACT_APP_API_URL → e.g., https://hotel-ops-api-1.onrender.com
REACT_APP_DASHBOARD_PASSWORD → same password you use locally
Push to main (or master) branch. Vercel will automatically build and deploy.

Troubleshooting
“Incorrect Password” on login
Double‐check REACT_APP_DASHBOARD_PASSWORD in your .env (locally) or Vercel env settings (in prod).

“Failed to fetch” error in the dashboard
Ensure your backend’s REACT_APP_API_URL is correct and CORS is enabled on the API.

Buttons not clickable / no data shown
Check browser console for network errors (404 or CORS).
Verify that Supabase has at least one row in HotelCrosbyRequests.

License
This project is licensed under the MIT License. See the LICENSE file for details.