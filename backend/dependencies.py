"""
Dependency injection container for the stock analyzer API.
Following Dependency Inversion Principle - dependencies are injected, not hardcoded.
"""
from services import (
    StockAnalysisService, 
    AIAnalysisService, 
    YFinanceDataProvider, 
    GeminiAIProvider
)
from config import Config


class DependencyContainer:
    """Container for managing dependencies."""
    
    def __init__(self):
        self._stock_data_provider = None
        self._ai_provider = None
        self._stock_service = None
        self._ai_service = None
    
    @property
    def stock_data_provider(self) -> YFinanceDataProvider:
        """Get or create stock data provider."""
        if self._stock_data_provider is None:
            self._stock_data_provider = YFinanceDataProvider(delay=Config.YFINANCE_DELAY)
        return self._stock_data_provider
    
    @property
    def ai_provider(self) -> GeminiAIProvider:
        """Get or create AI provider."""
        if self._ai_provider is None:
            self._ai_provider = GeminiAIProvider(Config.GEMINI_MODEL)
        return self._ai_provider
    
    @property
    def stock_service(self) -> StockAnalysisService:
        """Get or create stock analysis service."""
        if self._stock_service is None:
            self._stock_service = StockAnalysisService(self.stock_data_provider)
        return self._stock_service
    
    @property
    def ai_service(self) -> AIAnalysisService:
        """Get or create AI analysis service."""
        if self._ai_service is None:
            self._ai_service = AIAnalysisService(self.ai_provider, self.stock_service)
        return self._ai_service


# Global container instance
container = DependencyContainer()
