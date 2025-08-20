"""
Route definitions for the stock analyzer API.
Following Single Responsibility Principle - this file only handles route setup.
"""
from fastapi import FastAPI, HTTPException
from datetime import datetime

from models import (
    StockAnalysisRequest,
    AIAnalysisRequest,
    StockAnalysis,
    AIAnalysisResponse
)
from dependencies import DependencyContainer
from handlers import StockAnalysisHandler, AIAnalysisHandler, HealthHandler


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
        """Get AI-powered analysis of a stock."""
        return await ai_handler.analyze_stock_with_ai(request)
