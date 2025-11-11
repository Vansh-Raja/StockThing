# Stock Portfolio Tracker

A simple portfolio website for tracking Indian stock market investments with family/group portfolio support.

## Features

- **Transaction Management**: Add buy/sell transactions with date/time tracking
- **Portfolio Dashboard**: Combined view of all family holdings with account breakdowns
- **Capital Gains Statement**: Track realized gains/losses with export functionality
- **Family/Group Support**: Manage multiple accounts within a family portfolio

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Flask + Python (planned)
- **Database**: SQLite (planned)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
StockThing/
├── frontend/          # React frontend application
├── backend/           # Flask backend (planned)
├── plan.md           # Project plan
└── AGENTS.md         # Codebase guidelines
```

## Development

This is currently an MVP frontend with mock data. The mock data structure is designed to be SQLite-compatible for easy backend integration.

## Future Enhancements

- Backend integration with Flask
- Real-time stock prices via yfinance
- User authentication
- Database persistence
- Advanced analytics and charts

