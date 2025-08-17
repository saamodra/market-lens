from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import google.generativeai as genai
import os
from dotenv import load_dotenv
import math

# Load environment variables
load_dotenv()

# Configure Google AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(
    title="Market Lens API",
    description="A comprehensive stock analysis API using yfinance and Google AI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class StockAnalysisRequest(BaseModel):
    symbol: str

class AIAnalysisRequest(BaseModel):
    symbol: str
    question: str

class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float
    volume: int
    marketCap: float
    high52Week: float
    low52Week: float
    sector: str
    industry: str
    currency: str

class FinancialMetrics(BaseModel):
    peRatio: Optional[float]
    forwardPE: Optional[float]
    pegRatio: Optional[float]
    priceToBook: Optional[float]
    priceToSales: Optional[float]
    evToRevenue: Optional[float]
    profitMargin: Optional[float]
    operatingMargin: Optional[float]
    grossMargin: Optional[float]
    returnOnEquity: Optional[float]
    returnOnAssets: Optional[float]
    revenueGrowth: Optional[float]
    earningsGrowth: Optional[float]
    debtToEquity: Optional[float]
    currentRatio: Optional[float]
    quickRatio: Optional[float]
    cashPerShare: Optional[float]
    dividendYield: Optional[float]
    dividendRate: Optional[float]
    payoutRatio: Optional[float]

class TechnicalIndicators(BaseModel):
    rsi: Optional[float]
    movingAverage50: Optional[float]
    movingAverage200: Optional[float]
    volatility: Optional[float]
    supportLevel: Optional[float]
    resistanceLevel: Optional[float]

class PriceData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockAnalysis(BaseModel):
    quote: StockQuote
    metrics: FinancialMetrics
    technical: TechnicalIndicators
    priceHistory: List[PriceData]

class StockEvaluation(BaseModel):
    score: float
    recommendation: str
    positiveFactors: List[str]
    redFlags: List[str]

class AIAnalysisResponse(BaseModel):
    analysis: str
    recommendations: List[str]

def analyze_stock(ticker: str) -> Dict[str, Any]:
    """
    Comprehensive stock analysis using yfinance data
    Returns key metrics to determine if a stock is good or not
    """
    try:
        # Create ticker object
        stock = yf.Ticker(ticker)

        # Add delay to avoid rate limiting
        import time
        time.sleep(1.0)  # Increased delay to avoid rate limiting

        # Get stock info (fundamental data)
        try:
            info = stock.info
        except Exception as e:
            print(f"Warning: Could not fetch stock info for {ticker}: {e}")
            info = {}

        # Get historical data (1 year)
        try:
            hist = stock.history(period="1y")
        except Exception as e:
            print(f"Warning: Could not fetch historical data for {ticker}: {e}")
            hist = pd.DataFrame()

        # Get financial statements
        try:
            financials = stock.financials
            balance_sheet = stock.balance_sheet
            cashflow = stock.cashflow
        except Exception as e:
            print(f"Warning: Could not fetch financial statements for {ticker}: {e}")
            financials = pd.DataFrame()
            balance_sheet = pd.DataFrame()
            cashflow = pd.DataFrame()

        analysis = {}

        # === BASIC STOCK INFO ===
        analysis['ticker'] = ticker
        analysis['company_name'] = info.get('longName', 'N/A')
        analysis['sector'] = info.get('sector', 'N/A')
        analysis['industry'] = info.get('industry', 'N/A')
        analysis['current_price'] = info.get('currentPrice', 0)
        analysis['market_cap'] = info.get('marketCap', 0)

        # === VALUATION METRICS ===
        analysis['pe_ratio'] = info.get('trailingPE', None)
        analysis['forward_pe'] = info.get('forwardPE', None)
        analysis['peg_ratio'] = info.get('pegRatio', None)
        analysis['price_to_book'] = info.get('priceToBook', None)
        analysis['price_to_sales'] = info.get('priceToSalesTrailing12Months', None)
        analysis['enterprise_value_revenue'] = info.get('enterpriseToRevenue', None)

        # === PROFITABILITY METRICS ===
        analysis['profit_margin'] = info.get('profitMargins', None)
        analysis['operating_margin'] = info.get('operatingMargins', None)
        analysis['return_on_equity'] = info.get('returnOnEquity', None)
        analysis['return_on_assets'] = info.get('returnOnAssets', None)

        # === GROWTH METRICS ===
        analysis['revenue_growth'] = info.get('revenueGrowth', None)
        analysis['earnings_growth'] = info.get('earningsGrowth', None)
        analysis['earnings_quarterly_growth'] = info.get('earningsQuarterlyGrowth', None)

        # === FINANCIAL HEALTH METRICS ===
        analysis['debt_to_equity'] = info.get('debtToEquity', None)
        analysis['current_ratio'] = info.get('currentRatio', None)
        analysis['quick_ratio'] = info.get('quickRatio', None)
        analysis['cash_per_share'] = info.get('totalCashPerShare', None)

        # === DIVIDEND METRICS ===
        analysis['dividend_yield'] = info.get('dividendYield', None)
        analysis['payout_ratio'] = info.get('payoutRatio', None)
        analysis['dividend_rate'] = info.get('dividendRate', None)

        # === ADDITIONAL VALUATION METRICS ===
        analysis['price_to_cashflow'] = info.get('priceToCashflow', None)
        analysis['ev_to_ebitda'] = info.get('enterpriseToEbitda', None)
        analysis['enterprise_value'] = info.get('enterpriseValue', None)
        analysis['shares_outstanding'] = info.get('sharesOutstanding', None)
        analysis['free_float'] = info.get('floatShares', None)
        analysis['shares_short'] = info.get('sharesShort', None)
        analysis['short_ratio'] = info.get('shortRatio', None)

        # === EARNINGS METRICS ===
        analysis['eps_ttm'] = info.get('trailingEps', None)
        analysis['eps_forward'] = info.get('forwardEps', None)
        analysis['eps_annualized'] = info.get('trailingEps', None)  # Will be calculated from financials
        analysis['book_value_per_share'] = info.get('bookValue', None)
        analysis['free_cash_flow_per_share'] = info.get('freeCashflow', None)

        # === REVENUE & SALES METRICS ===
        analysis['revenue_per_share'] = info.get('revenuePerShare', None)
        analysis['total_revenue'] = info.get('totalRevenue', None)
        analysis['gross_profits'] = info.get('grossProfits', None)
        analysis['ebitda'] = info.get('ebitda', None)
        analysis['ebit'] = info.get('ebit', None)
        analysis['net_income'] = info.get('netIncomeToCommon', None)

        # === BALANCE SHEET METRICS ===
        analysis['total_cash'] = info.get('totalCash', None)
        analysis['total_assets'] = info.get('totalAssets', None)
        analysis['total_liabilities'] = info.get('totalLiabilities', None)
        analysis['total_debt'] = info.get('totalDebt', None)
        analysis['total_equity'] = info.get('totalEquity', None)
        analysis['working_capital'] = info.get('workingCapital', None)

        # === CASH FLOW METRICS ===
        analysis['operating_cash_flow'] = info.get('operatingCashflow', None)
        analysis['investing_cash_flow'] = info.get('investingCashflow', None)
        analysis['financing_cash_flow'] = info.get('financingCashflow', None)
        analysis['capital_expenditure'] = info.get('capitalExpenditure', None)
        analysis['free_cash_flow'] = info.get('freeCashflow', None)

        # === ANALYST RECOMMENDATIONS ===
        analysis['analyst_recommendation'] = info.get('recommendationKey', None)
        analysis['target_price'] = info.get('targetMeanPrice', None)
        analysis['num_analyst_opinions'] = info.get('numberOfAnalystOpinions', None)

        # === EXTRACT DATA FROM FINANCIAL STATEMENTS ===
        if not financials.empty:
            try:
                # Get most recent financial data
                latest_financials = financials.iloc[:, 0]  # Most recent quarter
                ttm_financials = financials.sum(axis=1)   # Trailing 12 months

                # Income Statement
                analysis['revenue_ttm'] = latest_financials.get('Total Revenue', analysis.get('total_revenue'))
                analysis['gross_profit_ttm'] = latest_financials.get('Gross Profit', analysis.get('gross_profits'))
                analysis['ebitda_ttm'] = latest_financials.get('EBITDA', analysis.get('ebitda'))
                analysis['net_income_ttm'] = latest_financials.get('Net Income', analysis.get('net_income'))

                # Calculate EPS from financials if available
                if analysis['net_income_ttm'] and analysis.get('shares_outstanding'):
                    analysis['eps_annualized'] = analysis['net_income_ttm'] / analysis['shares_outstanding']
            except Exception as e:
                print(f"Warning: Could not process financials for {ticker}: {e}")

        if not balance_sheet.empty:
            try:
                latest_balance = balance_sheet.iloc[:, 0]  # Most recent quarter

                # Balance Sheet
                analysis['cash_balance'] = latest_balance.get('Cash And Cash Equivalents', analysis.get('total_cash'))
                analysis['total_assets_bs'] = latest_balance.get('Total Assets', analysis.get('total_assets'))
                analysis['total_liabilities_bs'] = latest_balance.get('Total Liabilities', analysis.get('total_liabilities'))
                analysis['total_debt_bs'] = latest_balance.get('Total Debt', analysis.get('total_debt'))
                analysis['total_equity_bs'] = latest_balance.get('Total Stockholder Equity', analysis.get('total_equity'))

                # Calculate working capital
                current_assets = latest_balance.get('Total Current Assets', 0)
                current_liabilities = latest_balance.get('Total Current Liabilities', 0)
                if current_assets and current_liabilities:
                    analysis['working_capital_calc'] = current_assets - current_liabilities
            except Exception as e:
                print(f"Warning: Could not process balance sheet for {ticker}: {e}")

        if not cashflow.empty:
            try:
                latest_cashflow = cashflow.iloc[:, 0]  # Most recent quarter
                ttm_cashflow = cashflow.sum(axis=1)   # Trailing 12 months

                # Cash Flow Statement
                analysis['operating_cf_ttm'] = ttm_cashflow.get('Operating Cash Flow', analysis.get('operating_cash_flow'))
                analysis['investing_cf_ttm'] = ttm_cashflow.get('Investing Cash Flow', analysis.get('investing_cash_flow'))
                analysis['financing_cf_ttm'] = ttm_cashflow.get('Financing Cash Flow', analysis.get('financing_cash_flow'))
                analysis['capex_ttm'] = ttm_cashflow.get('Capital Expenditure', analysis.get('capital_expenditure'))
                analysis['free_cf_ttm'] = ttm_cashflow.get('Free Cash Flow', analysis.get('free_cash_flow'))
            except Exception as e:
                print(f"Warning: Could not process cash flow for {ticker}: {e}")

        # === TECHNICAL INDICATORS ===
        if not hist.empty:
            current_price = hist['Close'].iloc[-1]

            # Moving averages
            analysis['ma_50'] = hist['Close'].rolling(window=50).mean().iloc[-1]
            analysis['ma_200'] = hist['Close'].rolling(window=200).mean().iloc[-1]

            # Price performance
            analysis['52_week_high'] = info.get('fiftyTwoWeekHigh', hist['High'].max())
            analysis['52_week_low'] = info.get('fiftyTwoWeekLow', hist['Low'].min())
            analysis['price_change_1y'] = ((current_price - hist['Close'].iloc[0]) / hist['Close'].iloc[0]) * 100

            # Volatility (standard deviation of returns)
            returns = hist['Close'].pct_change().dropna()
            analysis['volatility'] = returns.std() * np.sqrt(252) * 100  # Annualized

            # Average volume
            analysis['avg_volume'] = hist['Volume'].mean()

            # RSI calculation (simple 14-day)
            delta = hist['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            analysis['rsi'] = 100 - (100 / (1 + rs.iloc[-1]))

        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing stock {ticker}: {str(e)}")

def evaluate_stock(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluate if a stock is good based on key metrics
    Returns a score and recommendations
    """
    score = 0
    max_score = 100
    recommendations = []
    red_flags = []

    # === VALUATION SCORING (25 points) ===
    pe_ratio = analysis.get('pe_ratio')
    if pe_ratio:
        if pe_ratio < 15:
            score += 8
            recommendations.append("✅ Good P/E ratio (undervalued)")
        elif pe_ratio < 25:
            score += 5
            recommendations.append("⚠️ Moderate P/E ratio")
        else:
            score += 0
            red_flags.append("🔴 High P/E ratio (potentially overvalued)")

    peg_ratio = analysis.get('peg_ratio')
    if peg_ratio:
        if peg_ratio < 1:
            score += 8
            recommendations.append("✅ Excellent PEG ratio")
        elif peg_ratio < 2:
            score += 5
        else:
            red_flags.append("🔴 High PEG ratio")

    pb_ratio = analysis.get('price_to_book')
    if pb_ratio:
        if pb_ratio < 3:
            score += 5
        elif pb_ratio > 5:
            red_flags.append("🔴 High Price-to-Book ratio")

    debt_equity = analysis.get('debt_to_equity')
    if debt_equity:
        if debt_equity < 0.3:
            score += 4
            recommendations.append("✅ Low debt levels")
        elif debt_equity > 1:
            red_flags.append("🔴 High debt-to-equity ratio")

    # === PROFITABILITY SCORING (25 points) ===
    profit_margin = analysis.get('profit_margin')
    if profit_margin:
        if profit_margin > 0.2:
            score += 10
            recommendations.append("✅ Excellent profit margins")
        elif profit_margin > 0.1:
            score += 7
        elif profit_margin > 0.05:
            score += 4
        else:
            red_flags.append("🔴 Low profit margins")

    roe = analysis.get('return_on_equity')
    if roe:
        if roe > 0.15:
            score += 8
            recommendations.append("✅ Strong ROE")
        elif roe > 0.1:
            score += 5
        elif roe < 0:
            red_flags.append("🔴 Negative ROE")

    operating_margin = analysis.get('operating_margin')
    if operating_margin:
        if operating_margin > 0.2:
            score += 7
        elif operating_margin < 0:
            red_flags.append("🔴 Negative operating margin")

    # === GROWTH SCORING (25 points) ===
    revenue_growth = analysis.get('revenue_growth')
    if revenue_growth:
        if revenue_growth > 0.2:
            score += 10
            recommendations.append("✅ Strong revenue growth")
        elif revenue_growth > 0.1:
            score += 7
        elif revenue_growth > 0.05:
            score += 4
        elif revenue_growth < 0:
            red_flags.append("🔴 Declining revenue")

    earnings_growth = analysis.get('earnings_growth')
    if earnings_growth:
        if earnings_growth > 0.2:
            score += 10
        elif earnings_growth > 0.1:
            score += 7
        elif earnings_growth < 0:
            red_flags.append("🔴 Declining earnings")

    price_change_1y = analysis.get('price_change_1y')
    if price_change_1y:
        if price_change_1y > 20:
            score += 5
        elif price_change_1y < -20:
            red_flags.append("🔴 Poor 1-year performance")

    # === FINANCIAL HEALTH SCORING (25 points) ===
    current_ratio = analysis.get('current_ratio')
    if current_ratio:
        if current_ratio > 2:
            score += 8
            recommendations.append("✅ Strong liquidity")
        elif current_ratio > 1:
            score += 5
        else:
            red_flags.append("🔴 Poor liquidity")

    cash_per_share = analysis.get('cash_per_share')
    if cash_per_share and cash_per_share > 5:
        score += 5
        recommendations.append("✅ Strong cash position")

    # Technical indicators
    rsi = analysis.get('rsi')
    if rsi:
        if 30 <= rsi <= 70:
            score += 5
        elif rsi < 30:
            recommendations.append("⚠️ Oversold (potential buying opportunity)")
        elif rsi > 70:
            recommendations.append("⚠️ Overbought (potential selling signal)")

    ma_50 = analysis.get('ma_50')
    ma_200 = analysis.get('ma_200')
    current_price = analysis.get('current_price')
    if ma_50 and ma_200 and current_price:
        if current_price > ma_50 > ma_200:
            score += 7
            recommendations.append("✅ Strong uptrend (Golden Cross)")
        elif current_price < ma_50 < ma_200:
            red_flags.append("🔴 Strong downtrend (Death Cross)")

    # Calculate final score as percentage
    final_score = (score / max_score) * 100

    # Overall recommendation
    if final_score >= 75:
        overall = "🟢 STRONG BUY"
    elif final_score >= 60:
        overall = "🟡 BUY"
    elif final_score >= 40:
        overall = "⚠️ HOLD"
    elif final_score >= 25:
        overall = "🔴 WEAK SELL"
    else:
        overall = "🔴 STRONG SELL"

    return {
        'score': final_score,
        'recommendation': overall,
        'positive_factors': recommendations,
        'red_flags': red_flags
    }

def clean_data_for_json(data):
    """Recursively clean data to make it JSON compliant"""
    if isinstance(data, dict):
        return {key: clean_data_for_json(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [clean_data_for_json(item) for item in data]
    elif isinstance(data, (np.float64, np.float32)):
        # Convert numpy floats to regular Python floats
        if np.isnan(data):
            return None  # or 0, or "NaN" as string
        elif np.isinf(data):
            return None  # or handle infinity as needed
        else:
            return float(data)
    elif isinstance(data, (np.int64, np.int32)):
        return int(data)
    elif isinstance(data, float):
        # Handle regular Python floats that might be NaN or inf
        if math.isnan(data):
            return None
        elif math.isinf(data):
            return None
        else:
            return data
    else:
        return data

def format_stock_data(analysis: Dict[str, Any], ticker: str) -> Dict[str, Any]:
    """Format the analysis data to match the frontend expectations"""

    # Get current price and calculate change
    current_price = analysis.get('current_price', 0)

    # Get historical data for price change calculation
    stock = yf.Ticker(ticker)
    hist = stock.history(period="5d")

    if not hist.empty and len(hist) > 1:
        prev_close = hist['Close'].iloc[-2]
        change = current_price - prev_close
        change_percent = (change / prev_close) * 100
    else:
        change = 0
        change_percent = 0

    # Get currency information from yfinance
    stock = yf.Ticker(ticker)
    info = stock.info
    currency = info.get('currency', 'USD')  # Default to USD if not available

    # Format quote data
    quote = {
        "symbol": ticker.upper(),
        "name": analysis.get('company_name', f'{ticker.upper()} Corporation'),
        "price": current_price,
        "change": change,
        "changePercent": change_percent,
        "volume": int(analysis.get('avg_volume', 0)),
        "marketCap": analysis.get('market_cap', 0),
        "high52Week": analysis.get('52_week_high', 0),
        "low52Week": analysis.get('52_week_low', 0),
        "sector": analysis.get('sector', 'N/A'),
        "industry": analysis.get('industry', 'N/A'),
        "currency": currency
    }

    # Format financial metrics
    metrics = {
        "peRatio": analysis.get('pe_ratio'),
        "forwardPE": analysis.get('forward_pe'),
        "pegRatio": analysis.get('peg_ratio'),
        "priceToBook": analysis.get('price_to_book'),
        "priceToSales": analysis.get('price_to_sales'),
        "evToRevenue": analysis.get('enterprise_value_revenue'),
        "profitMargin": analysis.get('profit_margin'),
        "operatingMargin": analysis.get('operating_margin'),
        "grossMargin": None,  # Not available in yfinance
        "returnOnEquity": analysis.get('return_on_equity'),
        "returnOnAssets": analysis.get('return_on_assets'),
        "revenueGrowth": analysis.get('revenue_growth'),
        "earningsGrowth": analysis.get('earnings_growth'),
        "debtToEquity": analysis.get('debt_to_equity'),
        "currentRatio": analysis.get('current_ratio'),
        "quickRatio": analysis.get('quick_ratio'),
        "cashPerShare": analysis.get('cash_per_share'),
        "dividendYield": analysis.get('dividend_yield'),
        "dividendRate": analysis.get('dividend_rate'),
        "payoutRatio": analysis.get('payout_ratio')
    }

    # Format technical indicators
    technical = {
        "rsi": analysis.get('rsi'),
        "movingAverage50": analysis.get('ma_50'),
        "movingAverage200": analysis.get('ma_200'),
        "volatility": analysis.get('volatility'),
        "supportLevel": analysis.get('52_week_low', 0) * 0.9,  # Estimate
        "resistanceLevel": analysis.get('52_week_high', 0) * 1.1  # Estimate
    }

    # Get price history
    hist_1y = stock.history(period="1y")
    price_history = []

    if not hist_1y.empty:
        for date, row in hist_1y.iterrows():
            price_history.append({
                "date": date.strftime('%Y-%m-%d'),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })

    return {
        "quote": quote,
        "metrics": metrics,
        "technical": technical,
        "priceHistory": price_history
    }

@app.get("/")
async def root():
    return {"message": "Market Lens API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/stocks/analyze", response_model=StockAnalysis)
async def analyze_stock_endpoint(request: StockAnalysisRequest):
    """Analyze a single stock and return comprehensive data"""
    try:
        analysis = analyze_stock(request.symbol)
        formatted_data = format_stock_data(analysis, request.symbol)
        formatted_data = clean_data_for_json(formatted_data)
        return formatted_data
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stocks/evaluate", response_model=StockEvaluation)
async def evaluate_stock_endpoint(request: StockAnalysisRequest):
    """Evaluate a stock and return scoring and recommendations"""
    try:
        analysis = analyze_stock(request.symbol)
        evaluation = evaluate_stock(analysis)
        return StockEvaluation(
            score=evaluation['score'],
            recommendation=evaluation['recommendation'],
            positiveFactors=evaluation['positive_factors'],
            redFlags=evaluation['red_flags']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stocks/search")
async def search_stocks(query: str):
    """Search for stocks by symbol or company name"""
    try:
        # This is a simple search - in production you might want to use a more sophisticated search
        # For now, we'll return some common stocks that match the query
        common_stocks = [
            'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
            'WIRG.JK', 'BBCA.JK', 'ASII.JK', 'TLKM.JK', 'UNVR.JK', 'BMRI.JK'
        ]

        results = [stock for stock in common_stocks if query.upper() in stock.upper()]
        return {"results": results[:10]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/analyze", response_model=AIAnalysisResponse)
async def ai_analysis_endpoint(request: AIAnalysisRequest):
    """Get AI-powered analysis of a stock"""
    try:
        # Get stock data for context
        analysis = analyze_stock(request.symbol)

        # Create context for AI
        context = f"""
        Kamu adalah analis saham profesional.
        Aku akan memberikan data saham dalam format JSON hasil dari yfinance.

        Tugasmu adalah menyusun **ringkasan analisis saham** dengan struktur berikut:
        1. **Valuasi**
        * Bandingkan metrik valuasi (PER, PBV, EV/EBITDA) dengan standar umum.
        * Sebutkan apakah saham tergolong **murah, sedang, atau mahal**.
        2. **Tren Kinerja Keuangan**
        * Uraikan pertumbuhan pendapatan, laba, margin usaha, dan margin bersih.
        * Tulis dalam format angka ribuan (contoh: 1,234B, 125M).
        3. **Posisi Neraca**
        * Analisis likuiditas (Current Ratio, Quick Ratio, kas).
        * Komentari rasio utang (Debt to Equity).
        * Simpulkan apakah neraca **sehat atau tidak**.
        4. **Arus Kas**
        * Tinjau arus kas operasi, investasi, dan pendanaan.
        * Sebutkan apakah arus kas secara umum **positif atau negatif**.
        5. **Momentum Perdagangan**
        * Gunakan data teknikal (harga sekarang, range 52M, RSI, volume, volatilitas).
        * Sebutkan potensi **gap up atau gap down** dalam jangka pendek.
        6. **Rekomendasi Trading**
        * Akhiri dengan rekomendasi singkat untuk strategi **“beli sore – jual pagi”**.
        * Gunakan bahasa Indonesia yang ringkas, profesional, dan mudah dipahami trader.

        Gunakan gaya analisis yang ringkas, jelas, dengan bullet point bila perlu.

        Berikut adalah data JSON-nya:
        {{
          "symbol": "{request.symbol}",
          "company_name": "{analysis.get('company_name', 'N/A')}",
          "current_price": {analysis.get('current_price', 0)},
          "market_cap": {analysis.get('market_cap', 0)},

          "valuation": {{
            "pe_ratio": {analysis.get('pe_ratio', 'N/A')},
            "forward_pe": {analysis.get('forward_pe', 'N/A')},
            "price_to_book": {analysis.get('price_to_book', 'N/A')},
            "price_to_sales": {analysis.get('price_to_sales', 'N/A')},
            "price_to_cashflow": {analysis.get('price_to_cashflow', 'N/A')},
            "ev_to_ebitda": {analysis.get('ev_to_ebitda', 'N/A')},
            "enterprise_value": {analysis.get('enterprise_value', 'N/A')}
          }},

          "per_share": {{
            "eps_ttm": {analysis.get('eps_ttm', 'N/A')},
            "eps_forward": {analysis.get('eps_forward', 'N/A')},
            "eps_annualized": {analysis.get('eps_annualized', 'N/A')},
            "revenue_per_share": {analysis.get('revenue_per_share', 'N/A')},
            "cash_per_share": {analysis.get('cash_per_share', 'N/A')},
            "book_value_per_share": {analysis.get('book_value_per_share', 'N/A')},
            "free_cash_flow_per_share": {analysis.get('free_cash_flow_per_share', 'N/A')}
          }},

          "solvency": {{
            "current_ratio": {analysis.get('current_ratio', 'N/A')},
            "quick_ratio": {analysis.get('quick_ratio', 'N/A')},
            "debt_to_equity": {analysis.get('debt_to_equity', 'N/A')}
          }},

          "profitability": {{
            "profit_margin": {analysis.get('profit_margin', 'N/A')},
            "operating_margin": {analysis.get('operating_margin', 'N/A')},
            "return_on_equity": {analysis.get('return_on_equity', 'N/A')},
            "return_on_assets": {analysis.get('return_on_assets', 'N/A')}
          }},

          "income_statement": {{
            "revenue": {analysis.get('revenue_ttm', analysis.get('total_revenue', 'N/A'))},
            "gross_profit": {analysis.get('gross_profit_ttm', analysis.get('gross_profits', 'N/A'))},
            "ebitda": {analysis.get('ebitda_ttm', analysis.get('ebitda', 'N/A'))},
            "net_income": {analysis.get('net_income_ttm', analysis.get('net_income', 'N/A'))}
          }},

          "balance_sheet": {{
            "cash": {analysis.get('cash_balance', analysis.get('total_cash', 'N/A'))},
            "total_assets": {analysis.get('total_assets_bs', analysis.get('total_assets', 'N/A'))},
            "total_liabilities": {analysis.get('total_liabilities_bs', analysis.get('total_liabilities', 'N/A'))},
            "total_debt": {analysis.get('total_debt_bs', analysis.get('total_debt', 'N/A'))},
            "total_equity": {analysis.get('total_equity_bs', analysis.get('total_equity', 'N/A'))},
            "working_capital": {analysis.get('working_capital_calc', analysis.get('working_capital', 'N/A'))}
          }},

          "cash_flow": {{
            "operating_cash_flow": {analysis.get('operating_cf_ttm', analysis.get('operating_cash_flow', 'N/A'))},
            "investing_cash_flow": {analysis.get('investing_cf_ttm', analysis.get('investing_cash_flow', 'N/A'))},
            "financing_cash_flow": {analysis.get('financing_cf_ttm', analysis.get('financing_cash_flow', 'N/A'))},
            "capital_expenditure": {analysis.get('capex_ttm', analysis.get('capital_expenditure', 'N/A'))},
            "free_cash_flow": {analysis.get('free_cf_ttm', analysis.get('free_cash_flow', 'N/A'))}
          }},

          "market_data": {{
            "shares_outstanding": {analysis.get('shares_outstanding', 'N/A')},
            "free_float": {analysis.get('free_float', 'N/A')},
            "shares_short": {analysis.get('shares_short', 'N/A')},
            "short_ratio": {analysis.get('short_ratio', 'N/A')}
          }},

          "technical": {{
            "52_week_high": {analysis.get('52_week_high', 0)},
            "52_week_low": {analysis.get('52_week_low', 0)},
            "avg_volume": {analysis.get('avg_volume', 0)},
            "volatility": {analysis.get('volatility', 'N/A')},
            "ma_50": {analysis.get('ma_50', 'N/A')},
            "ma_200": {analysis.get('ma_200', 'N/A')},
            "rsi": {analysis.get('rsi', 'N/A')}
          }},

          "growth": {{
            "revenue_growth": {analysis.get('revenue_growth', 'N/A')},
            "earnings_growth": {analysis.get('earnings_growth', 'N/A')}
          }}
        }}
        """

        # Generate AI response
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(context)

        # Parse AI response
        ai_text = response.text

        # Extract recommendations
        recommendations = []
        if "buy" in ai_text.lower():
            recommendations.append("Consider buying based on AI analysis")
        if "sell" in ai_text.lower():
            recommendations.append("Consider selling based on AI analysis")
        if "hold" in ai_text.lower():
            recommendations.append("Consider holding based on AI analysis")

        return AIAnalysisResponse(
            analysis=ai_text,
            recommendations=recommendations
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stocks/{symbol}/quote")
async def get_stock_quote(symbol: str):
    """Get basic stock quote information"""
    try:
        stock = yf.Ticker(symbol)
        info = stock.info

        quote = {
            "symbol": symbol.upper(),
            "name": info.get('longName', f'{symbol.upper()} Corporation'),
            "price": info.get('currentPrice', 0),
            "change": 0,  # Would need to calculate from historical data
            "changePercent": 0,
            "volume": info.get('volume', 0),
            "marketCap": info.get('marketCap', 0),
            "high52Week": info.get('fiftyTwoWeekHigh', 0),
            "low52Week": info.get('fiftyTwoWeekLow', 0),
            "sector": info.get('sector', 'N/A'),
            "industry": info.get('industry', 'N/A'),
            "currency": info.get('currency', 'USD')
        }

        return quote
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
