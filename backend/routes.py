"""
Route definitions for the stock analyzer API.
Following Single Responsibility Principle - this file only handles route setup.
"""
from fastapi import FastAPI, HTTPException, Header
from datetime import datetime
from typing import Optional

from models import (
    StockAnalysisRequest,
    AIAnalysisRequest,
    StockAnalysis,
    AIAnalysisResponse,
    StockbitLoginRequest,
    StockbitAuthResponse,
    StockbitScreenerRequest,
    StockbitScreenerResponse
)
from dependencies import DependencyContainer
from handlers import StockAnalysisHandler, AIAnalysisHandler, HealthHandler
from stockbit_handlers import StockbitAuthHandler, StockbitScreenerHandler


def setup_routes(app: FastAPI, container: DependencyContainer) -> None:
    """
    Setup all application routes.

    Args:
        app: FastAPI application instance
        container: Dependency injection container
    """
    # Initialize handlers
    health_handler = HealthHandler()
    stock_handler = StockAnalysisHandler(container)
    ai_handler = AIAnalysisHandler(container)
    stockbit_auth_handler = StockbitAuthHandler()
    stockbit_screener_handler = StockbitScreenerHandler()

    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {"message": "Market Lens API is running!"}

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return health_handler.get_health_status()

    # Stock analysis endpoint
    @app.post("/api/stocks/analyze", response_model=StockAnalysis)
    async def analyze_stock_endpoint(request: StockAnalysisRequest):
        """Analyze a single stock and return comprehensive data."""
        return await stock_handler.analyze_stock(request)

    # AI analysis endpoint
    @app.post("/api/ai/analyze", response_model=AIAnalysisResponse)
    async def ai_analysis_endpoint(request: AIAnalysisRequest):
        """Get AI-powered analysis using provided prompt."""
        return await ai_handler.analyze_with_ai(request)

    # Stockbit authentication endpoint
    @app.post("/api/stockbit/auth", response_model=StockbitAuthResponse)
    async def stockbit_auth_endpoint(request: StockbitLoginRequest):
        """Authenticate with Stockbit API (proxy to bypass CORS)."""
        return await stockbit_auth_handler.authenticate(request)

    # Stockbit screener endpoint
    @app.post("/api/stockbit/screener", response_model=StockbitScreenerResponse)
    async def stockbit_screener_endpoint(
        request: StockbitScreenerRequest,
        authorization: Optional[str] = Header(None)
    ):
        """Get screener results from Stockbit API (proxy to bypass CORS)."""
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Bearer token required")

        access_token = authorization.replace("Bearer ", "")
        return await stockbit_screener_handler.get_screener_results(request, access_token)
