# Market Lens

A comprehensive stock analysis application with a React frontend and Python FastAPI backend, featuring real-time stock data analysis using yfinance and AI-powered insights with Google Gemini.

## Features

- **Real-time Stock Data**: Live stock quotes, financial metrics, and technical indicators
- **Comprehensive Analysis**: P/E ratios, profitability metrics, growth analysis, and financial health indicators
- **AI-Powered Insights**: Get personalized stock analysis and recommendations using Google Gemini AI
- **Technical Indicators**: RSI, moving averages, volatility, and trend analysis
- **Stock Evaluation**: Automated scoring system with buy/sell recommendations
- **Modern UI**: Responsive design with dark/light theme support

## Project Structure

```
stock-analyzer/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main API application
│   ├── run.py              # Development server runner
│   ├── requirements.txt    # Python dependencies
│   └── env.example        # Environment variables template
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── package.json            # Frontend dependencies
└── README.md              # This file
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Google AI API key (for Gemini features)

## Setup Instructions

### 1. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env and add your Google AI API key
   ```

5. **Run the backend:**
   ```bash
   python run.py
   ```

   The API will be available at `http://localhost:8000`

### 2. Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## API Endpoints

### Stock Analysis
- `POST /api/stocks/analyze` - Get comprehensive stock analysis
- `POST /api/stocks/evaluate` - Get stock evaluation and scoring
- `GET /api/stocks/search?query={query}` - Search for stocks
- `GET /api/stocks/{symbol}/quote` - Get basic stock quote

### AI Analysis
- `POST /api/ai/analyze` - Get AI-powered stock analysis

### Health Check
- `GET /health` - API health status
- `GET /` - API root endpoint

## Stock Analysis Features

### Valuation Metrics
- P/E Ratio, Forward P/E, PEG Ratio
- Price-to-Book, Price-to-Sales
- Enterprise Value to Revenue

### Profitability Metrics
- Profit Margin, Operating Margin
- Return on Equity (ROE), Return on Assets (ROA)

### Growth Metrics
- Revenue Growth, Earnings Growth
- Quarterly Performance Analysis

### Financial Health
- Debt-to-Equity Ratio
- Current Ratio, Quick Ratio
- Cash per Share

### Technical Indicators
- RSI (Relative Strength Index)
- 50-day and 200-day Moving Averages
- Volatility Analysis
- Support and Resistance Levels

## Stock Evaluation System

The application uses a comprehensive scoring system (0-100) based on:

- **Valuation (25 points)**: P/E ratios, PEG, debt levels
- **Profitability (25 points)**: Margins, ROE, ROA
- **Growth (25 points)**: Revenue, earnings, price performance
- **Financial Health (25 points)**: Liquidity, cash position, technical indicators

### Recommendations
- 🟢 **STRONG BUY** (75-100): Excellent fundamentals and technicals
- 🟡 **BUY** (60-74): Good investment opportunity
- ⚠️ **HOLD** (40-59): Neutral, monitor for improvements
- 🔴 **WEAK SELL** (25-39): Consider reducing position
- 🔴 **STRONG SELL** (0-24): Poor fundamentals, avoid

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Google AI API Key for Gemini
GEMINI_API_KEY=your_google_ai_api_key_here

# Optional: Customize API settings
API_HOST=0.0.0.0
API_PORT=8000
```

## Development

### Backend Development
- The backend uses FastAPI with automatic API documentation
- Access interactive API docs at `http://localhost:8000/docs`
- Hot reload is enabled for development

### Frontend Development
- Built with React + TypeScript + Vite
- Uses Tailwind CSS for styling
- Includes dark/light theme toggle

## Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check if port 8000 is available
   - Verify Python dependencies are installed
   - Check environment variables

2. **Frontend can't connect to backend:**
   - Ensure backend is running on port 8000
   - Check CORS settings
   - Verify API endpoints are correct

3. **Stock data not loading:**
   - Check internet connection
   - Verify stock symbols are valid
   - Check browser console for errors

### Getting Help

- Check the browser console for frontend errors
- Check the backend terminal for API errors
- Verify all dependencies are installed correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
