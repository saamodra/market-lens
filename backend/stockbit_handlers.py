"""
Handlers for Stockbit API endpoints.
Following Single Responsibility Principle - handlers only handle HTTP requests/responses.
"""
from fastapi import HTTPException
from models import (
    StockbitLoginRequest,
    StockbitAuthResponse,
    StockbitScreenerRequest,
    StockbitScreenerResponse
)
from stockbit_service import StockbitService


class StockbitAuthHandler:
    """Handler for Stockbit authentication endpoints."""

    def __init__(self):
        self.stockbit_service = StockbitService()

    async def authenticate(self, request: StockbitLoginRequest) -> StockbitAuthResponse:
        """
        Handle Stockbit authentication request.

        Args:
            request: Authentication request data

        Returns:
            Authentication response
        """
        try:
            response_data = self.stockbit_service.authenticate(
                username=request.username,
                password=request.password,
                verification_token=request.verificationToken,
                recaptcha_version=request.recaptchaVersion
            )

            return StockbitAuthResponse(
                message=response_data.get("message", "Authentication successful"),
                data=response_data.get("data", {})
            )

        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


class StockbitScreenerHandler:
    """Handler for Stockbit screener endpoints."""

    def __init__(self):
        self.stockbit_service = StockbitService()

    async def get_screener_results(
        self,
        request: StockbitScreenerRequest,
        access_token: str
    ) -> StockbitScreenerResponse:
        """
        Handle screener results request.

        Args:
            request: Screener request data
            access_token: Bearer token for authentication

        Returns:
            Screener results response
        """
        try:
            response_data = self.stockbit_service.get_screener_results(
                template_id=request.templateId,
                access_token=access_token
            )

            return StockbitScreenerResponse(
                data=response_data.get("data", {}),
                message=response_data.get("message", "Screener results retrieved successfully")
            )

        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Failed to get screener results: {str(e)}")
