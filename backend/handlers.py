"""
Request handlers for the stock analyzer API.
Following Single Responsibility Principle - each handler has one responsibility.
"""
from fastapi import HTTPException
from datetime import datetime

from models import (
    StockAnalysisRequest,
    AIAnalysisRequest,
    StockAnalysis,
    AIAnalysisResponse
)
from dependencies import DependencyContainer


class HealthHandler:
    """Handler for health check operations."""

    def get_health_status(self) -> dict:
        """Get application health status."""
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat()
        }


class StockAnalysisHandler:
    """Handler for stock analysis operations."""

    def __init__(self, container: DependencyContainer):
        """
        Initialize handler with dependency container.

        Args:
            container: Dependency injection container
        """
        self.container = container

    async def analyze_stock(self, request: StockAnalysisRequest) -> StockAnalysis:
        """
        Analyze a stock and return comprehensive data.

        Args:
            request: Stock analysis request

        Returns:
            StockAnalysis: Comprehensive stock analysis data

        Raises:
            HTTPException: If analysis fails
        """
        try:
            stock_service = self.container.stock_service
            result = stock_service.get_formatted_analysis(request.symbol)
            return result
        except Exception as e:
            print(f"Error analyzing stock {request.symbol}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to analyze stock {request.symbol}: {str(e)}"
            )


class AIAnalysisHandler:
    """Handler for AI analysis operations."""

    def __init__(self, container: DependencyContainer):
        """
        Initialize handler with dependency container.

        Args:
            container: Dependency injection container
        """
        self.container = container

    async def analyze_stock_with_ai(self, request: AIAnalysisRequest) -> AIAnalysisResponse:
        """
        Get AI-powered analysis of a stock.

        Args:
            request: AI analysis request

        Returns:
            AIAnalysisResponse: AI analysis result

        Raises:
            HTTPException: If AI analysis fails
        """
        try:
            ai_service = self.container.ai_service
            result = ai_service.analyze_stock_with_ai(request.symbol, request.question)
            return result
        except Exception as e:
            print(f"Error in AI analysis for {request.symbol}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get AI analysis for {request.symbol}: {str(e)}"
            )
