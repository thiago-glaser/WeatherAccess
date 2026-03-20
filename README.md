# Weather Access 🌩️

### Real-time Weather Monitoring Dashboard

**Weather Access** is a premium, high-performance weather monitoring application built with **Next.js**. It provides a sleek, modern interface for tracking atmospheric data from both indoor and outdoor stations in real-time.

![Weather Dashboard Premium UI](file:///C:/Users/thiag/.gemini/antigravity/brain/7ba41f12-6070-4d8c-9aef-28e3121e2648/weather_access_premium_design_1773983477706.png)

## 🚀 Key Features

- **Live Monitoring**: Real-time display of external and internal temperatures with automatic background refreshes.
- **Premium Design**: High-end glassmorphism aesthetic with responsive layouts, dynamic gradients, and smooth animations.
- **Automation**: Integrated background sync service that fetches the latest data from weather devices every 20 seconds.
- **Oracle Integration**: Robust connection to Oracle Database (Local or Cloud) via Sequelize ORM.
- **Manual Sync**: Instant database update control via the "Sync Now" interface.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router & Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Oracle Database](https://www.oracle.com/database/) (Local / Cloud via Autonomous DB)
- **ORM**: [Sequelize](https://sequelize.org/)
- **Runtime**: [Node.js](https://nodejs.org/)

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18.x or later
- Oracle Database access (Local or Cloud)
- Oracle Instant Client (if required for your local environment)

### 2. Environment Setup
Create a `.env` file in the root directory and configure the variables:

```env
# Oracle Connection
ORACLE_USER=...
ORACLE_PASSWORD=...
ORACLE_CONNECTION_STRING=...

# Cloud DB Options
USE_CLOUD_DB=true
CLOUD_ORACLE_USER=...
CLOUD_ORACLE_PASSWORD=...
CLOUD_ORACLE_CONNECTION_STRING=...
CLOUD_ORACLE_WALLET_DIR=./oracle_wallet
CLOUD_ORACLE_WALLET_PASSWORD=...

# API Keys
APPLICATION_KEY=...
API_KEY=...
MAC=...
ECOWITT_API_URL=https://api.ecowitt.net/api/v3/device/real_time
```

### 3. Installation
Install the project dependencies:

```bash
npm install
```

### 4. Running Locally
Run the development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🧪 Development & Testing

- **Database Test**: Use the utility script to verify the connection and see the latest records:
  ```bash
  npx tsx tmp/test_db.ts
  ```
- **Sync Service**: The `instrumentation.ts` handles automated background syncing without manual intervention during development.

## 📂 Project Structure

- `src/app/page.tsx`: Main premium dashboard UI.
- `src/app/api/weather/current/route.ts`: API endpoint for real-time station data.
- `src/lib/models/station.ts`: Sequelize model for weather entries.
- `src/lib/weather-service.ts`: Core logic for fetching and saving data from the Ecowitt API.
- `src/instrumentation.ts`: Background worker registration.

---
*Built with ❤️ for real-time atmospheric tracking.*
