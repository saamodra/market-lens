"""
Pydantic models for the stock analyzer API.
Following Single Responsibility Principle - this file only contains data models.
"""
from pydantic import BaseModel
from typing import List, Optional


# Request Models
class StockAnalysisRequest(BaseModel):
    symbol: str


class AIAnalysisRequest(BaseModel):
    prompt: str
    question: Optional[str] = None


# Response Models
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
    prompt: str


class StockEvaluation(BaseModel):
    score: float
    recommendation: str
    positiveFactors: List[str]
    redFlags: List[str]


class AIAnalysisResponse(BaseModel):
    analysis: str
    recommendations: List[str]


# Stockbit Models
class StockbitLoginRequest(BaseModel):
    username: str
    password: str
    verificationToken: str
    recaptchaVersion: str


class StockbitAuthResponse(BaseModel):
    message: str
    data: dict


class StockbitScreenerRequest(BaseModel):
    templateId: Optional[str] = "4848138"


class StockbitScreenerResponse(BaseModel):
    data: dict
    message: str
