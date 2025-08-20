"""
Business logic services for stock analysis.
Following Single Responsibility Principle and Dependency Inversion Principle.
"""
import time
from typing import Dict, Any, List
import yfinance as yf
import pandas as pd
import numpy as np
import google.generativeai as genai
from abc import ABC, abstractmethod

from utils import DataCleaner, StockDataFormatter, PromptGenerator
from models import AIAnalysisResponse


class IStockDataProvider(ABC):
    """Interface for stock data providers (Dependency Inversion Principle)."""
    
    @abstractmethod
    def get_stock_info(self, ticker: str) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    def get_historical_data(self, ticker: str, period: str) -> pd.DataFrame:
        pass
    
    @abstractmethod
    def get_financials(self, ticker: str) -> Dict[str, pd.DataFrame]:
        pass


class YFinanceDataProvider(IStockDataProvider):
    """Yahoo Finance implementation of stock data provider."""
    
    def __init__(self, delay: float = 1.0):
        self.delay = delay
    
    def get_stock_info(self, ticker: str) -> Dict[str, Any]:
        """Get basic stock information."""
        try:
            stock = yf.Ticker(ticker)
            time.sleep(self.delay)  # Rate limiting
            return stock.info
        except Exception as e:
            print(f"Warning: Could not fetch stock info for {ticker}: {e}")
            return {}
    
    def get_historical_data(self, ticker: str, period: str) -> pd.DataFrame:
        """Get historical price data."""
        try:
            stock = yf.Ticker(ticker)
            return stock.history(period=period)
        except Exception as e:
            print(f"Warning: Could not fetch historical data for {ticker}: {e}")
            return pd.DataFrame()
    
    def get_financials(self, ticker: str) -> Dict[str, pd.DataFrame]:
        """Get financial statements."""
        try:
            stock = yf.Ticker(ticker)
            return {
                'financials': stock.financials,
                'balance_sheet': stock.balance_sheet,
                'cashflow': stock.cashflow
            }
        except Exception as e:
            print(f"Warning: Could not fetch financial statements for {ticker}: {e}")
            return {
                'financials': pd.DataFrame(),
                'balance_sheet': pd.DataFrame(),
                'cashflow': pd.DataFrame()
            }


class IAIProvider(ABC):
    """Interface for AI providers (Dependency Inversion Principle)."""
    
    @abstractmethod
    def generate_analysis(self, prompt: str) -> str:
        pass


class GeminiAIProvider(IAIProvider):
    """Google Gemini implementation of AI provider."""
    
    def __init__(self, model_name: str = 'gemini-2.5-flash'):
        self.model_name = model_name
    
    def generate_analysis(self, prompt: str) -> str:
        """Generate AI analysis using Gemini."""
        model = genai.GenerativeModel(self.model_name)
        response = model.generate_content(prompt)
        return response.text


class StockAnalysisService:
    """Service for comprehensive stock analysis (Single Responsibility Principle)."""
    
    def __init__(self, data_provider: IStockDataProvider):
        self.data_provider = data_provider
        self.data_cleaner = DataCleaner()
        self.data_formatter = StockDataFormatter()
    
    def analyze_stock(self, ticker: str) -> Dict[str, Any]:
        """
        Comprehensive stock analysis using the provided data source.
        Returns key metrics to determine if a stock is good or not.
        """
        # Get basic stock info
        info = self.data_provider.get_stock_info(ticker)
        
        # Get historical data
        hist = self.data_provider.get_historical_data(ticker, "1y")
        
        # Get financial statements
        financials_data = self.data_provider.get_financials(ticker)
        financials = financials_data['financials']
        balance_sheet = financials_data['balance_sheet']
        cashflow = financials_data['cashflow']
        
        analysis = {}
        
        # Extract basic info
        analysis.update(self._extract_basic_info(info, ticker))
        
        # Extract financial metrics
        analysis.update(self._extract_financial_metrics(info))
        
        # Extract financial statement data
        analysis.update(self._extract_financial_statements(financials, balance_sheet, cashflow))
        
        # Extract technical indicators
        if not hist.empty:
            analysis.update(self._extract_technical_indicators(hist, info))
        
        return analysis
    
    def _extract_basic_info(self, info: Dict[str, Any], ticker: str) -> Dict[str, Any]:
        """Extract basic stock information."""
        return {
            'ticker': ticker,
            'company_name': info.get('longName', 'N/A'),
            'sector': info.get('sector', 'N/A'),
            'industry': info.get('industry', 'N/A'),
            'current_price': info.get('currentPrice', 0),
            'market_cap': info.get('marketCap', 0),
        }
    
    def _extract_financial_metrics(self, info: Dict[str, Any]) -> Dict[str, Any]:
        """Extract financial metrics from stock info."""
        return {
            # Valuation metrics
            'pe_ratio': info.get('trailingPE', None),
            'forward_pe': info.get('forwardPE', None),
            'peg_ratio': info.get('pegRatio', None),
            'price_to_book': info.get('priceToBook', None),
            'price_to_sales': info.get('priceToSalesTrailing12Months', None),
            'enterprise_value_revenue': info.get('enterpriseToRevenue', None),
            'price_to_cashflow': info.get('priceToCashflow', None),
            'ev_to_ebitda': info.get('enterpriseToEbitda', None),
            'enterprise_value': info.get('enterpriseValue', None),
            
            # Profitability metrics
            'profit_margin': info.get('profitMargins', None),
            'operating_margin': info.get('operatingMargins', None),
            'return_on_equity': info.get('returnOnEquity', None),
            'return_on_assets': info.get('returnOnAssets', None),
            
            # Growth metrics
            'revenue_growth': info.get('revenueGrowth', None),
            'earnings_growth': info.get('earningsGrowth', None),
            'earnings_quarterly_growth': info.get('earningsQuarterlyGrowth', None),
            
            # Financial health metrics
            'debt_to_equity': info.get('debtToEquity', None),
            'current_ratio': info.get('currentRatio', None),
            'quick_ratio': info.get('quickRatio', None),
            'cash_per_share': info.get('totalCashPerShare', None),
            
            # Dividend metrics
            'dividend_yield': info.get('dividendYield', None),
            'payout_ratio': info.get('payoutRatio', None),
            'dividend_rate': info.get('dividendRate', None),
            
            # Per-share metrics
            'eps_ttm': info.get('trailingEps', None),
            'eps_forward': info.get('forwardEps', None),
            'book_value_per_share': info.get('bookValue', None),
            'revenue_per_share': info.get('revenuePerShare', None),
            
            # Company financials
            'total_revenue': info.get('totalRevenue', None),
            'gross_profits': info.get('grossProfits', None),
            'ebitda': info.get('ebitda', None),
            'net_income': info.get('netIncomeToCommon', None),
            'total_cash': info.get('totalCash', None),
            'total_assets': info.get('totalAssets', None),
            'total_liabilities': info.get('totalLiabilities', None),
            'total_debt': info.get('totalDebt', None),
            'total_equity': info.get('totalEquity', None),
            'working_capital': info.get('workingCapital', None),
            
            # Cash flow metrics
            'operating_cash_flow': info.get('operatingCashflow', None),
            'investing_cash_flow': info.get('investingCashflow', None),
            'financing_cash_flow': info.get('financingCashflow', None),
            'capital_expenditure': info.get('capitalExpenditure', None),
            'free_cash_flow': info.get('freeCashflow', None),
            
            # Market data
            'shares_outstanding': info.get('sharesOutstanding', None),
            'free_float': info.get('floatShares', None),
            'shares_short': info.get('sharesShort', None),
            'short_ratio': info.get('shortRatio', None),
            
            # Analyst data
            'analyst_recommendation': info.get('recommendationKey', None),
            'target_price': info.get('targetMeanPrice', None),
            'num_analyst_opinions': info.get('numberOfAnalystOpinions', None),
        }
    
    def _extract_financial_statements(self, financials: pd.DataFrame, 
                                    balance_sheet: pd.DataFrame, 
                                    cashflow: pd.DataFrame) -> Dict[str, Any]:
        """Extract data from financial statements."""
        result = {}
        
        # Process income statement
        if not financials.empty:
            try:
                latest_financials = financials.iloc[:, 0]
                result.update({
                    'revenue_ttm': latest_financials.get('Total Revenue'),
                    'gross_profit_ttm': latest_financials.get('Gross Profit'),
                    'ebitda_ttm': latest_financials.get('EBITDA'),
                    'net_income_ttm': latest_financials.get('Net Income'),
                })
                
                # Calculate EPS if possible
                if result.get('net_income_ttm') and result.get('shares_outstanding'):
                    result['eps_annualized'] = result['net_income_ttm'] / result['shares_outstanding']
            except Exception as e:
                print(f"Warning: Could not process income statement: {e}")
        
        # Process balance sheet
        if not balance_sheet.empty:
            try:
                latest_balance = balance_sheet.iloc[:, 0]
                result.update({
                    'cash_balance': latest_balance.get('Cash And Cash Equivalents'),
                    'total_assets_bs': latest_balance.get('Total Assets'),
                    'total_liabilities_bs': latest_balance.get('Total Liabilities'),
                    'total_debt_bs': latest_balance.get('Total Debt'),
                    'total_equity_bs': latest_balance.get('Total Stockholder Equity'),
                })
                
                # Calculate working capital
                current_assets = latest_balance.get('Total Current Assets', 0)
                current_liabilities = latest_balance.get('Total Current Liabilities', 0)
                if current_assets and current_liabilities:
                    result['working_capital_calc'] = current_assets - current_liabilities
            except Exception as e:
                print(f"Warning: Could not process balance sheet: {e}")
        
        # Process cash flow statement
        if not cashflow.empty:
            try:
                ttm_cashflow = cashflow.sum(axis=1)
                result.update({
                    'operating_cf_ttm': ttm_cashflow.get('Operating Cash Flow'),
                    'investing_cf_ttm': ttm_cashflow.get('Investing Cash Flow'),
                    'financing_cf_ttm': ttm_cashflow.get('Financing Cash Flow'),
                    'capex_ttm': ttm_cashflow.get('Capital Expenditure'),
                    'free_cf_ttm': ttm_cashflow.get('Free Cash Flow'),
                })
            except Exception as e:
                print(f"Warning: Could not process cash flow statement: {e}")
        
        return result
    
    def _extract_technical_indicators(self, hist: pd.DataFrame, info: Dict[str, Any]) -> Dict[str, Any]:
        """Extract technical indicators from historical data."""
        current_price = hist['Close'].iloc[-1]
        
        # Moving averages
        ma_50 = hist['Close'].rolling(window=50).mean().iloc[-1] if len(hist) >= 50 else None
        ma_200 = hist['Close'].rolling(window=200).mean().iloc[-1] if len(hist) >= 200 else None
        
        # Price performance
        high_52w = info.get('fiftyTwoWeekHigh', hist['High'].max())
        low_52w = info.get('fiftyTwoWeekLow', hist['Low'].min())
        price_change_1y = ((current_price - hist['Close'].iloc[0]) / hist['Close'].iloc[0]) * 100
        
        # Volatility
        returns = hist['Close'].pct_change().dropna()
        volatility = returns.std() * np.sqrt(252) * 100  # Annualized
        
        # RSI calculation
        rsi = None
        if len(hist) >= 14:
            delta = hist['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs.iloc[-1]))
        
        return {
            'ma_50': ma_50,
            'ma_200': ma_200,
            '52_week_high': high_52w,
            '52_week_low': low_52w,
            'price_change_1y': price_change_1y,
            'volatility': volatility,
            'avg_volume': hist['Volume'].mean(),
            'rsi': rsi,
        }
    
    def get_formatted_analysis(self, ticker: str) -> Dict[str, Any]:
        """Get analysis data formatted for API response."""
        analysis = self.analyze_stock(ticker)
        formatted_data = self.data_formatter.format_stock_data(analysis, ticker)
        
        # Add prompt for AI analysis
        prompt = PromptGenerator.generate_analysis_prompt(analysis, ticker)
        formatted_data['prompt'] = prompt
        
        # Clean data for JSON serialization
        return self.data_cleaner.clean_data_for_json(formatted_data)


class AIAnalysisService:
    """Service for AI-powered stock analysis (Single Responsibility Principle)."""
    
    def __init__(self, ai_provider: IAIProvider, stock_service: StockAnalysisService):
        self.ai_provider = ai_provider
        self.stock_service = stock_service
    
    def analyze_stock_with_ai(self, symbol: str, question: str = None) -> AIAnalysisResponse:
        """Get AI-powered analysis of a stock."""
        # Get stock data for context
        analysis = self.stock_service.analyze_stock(symbol)
        
        # Generate prompt
        prompt = PromptGenerator.generate_analysis_prompt(analysis, symbol)
        
        # Get AI response
        ai_text = self.ai_provider.generate_analysis(prompt)
        
        # Extract recommendations
        recommendations = self._extract_recommendations(ai_text)
        
        return AIAnalysisResponse(
            analysis=ai_text,
            recommendations=recommendations
        )
    
    def _extract_recommendations(self, ai_text: str) -> List[str]:
        """Extract trading recommendations from AI text."""
        recommendations = []
        text_lower = ai_text.lower()
        
        if "buy" in text_lower or "beli" in text_lower:
            recommendations.append("Consider buying based on AI analysis")
        if "sell" in text_lower or "jual" in text_lower:
            recommendations.append("Consider selling based on AI analysis")
        if "hold" in text_lower or "tahan" in text_lower:
            recommendations.append("Consider holding based on AI analysis")
        
        return recommendations
