"""
Stockbit API service for handling authentication and screener requests.
Acts as a proxy to bypass CORS restrictions.
"""
import requests
import json
from typing import Dict, Any
from fastapi import HTTPException


class StockbitService:
    """Service for interacting with Stockbit API."""

    STOCKBIT_API_BASE = 'https://exodus.stockbit.com'
    STOCKBIT_AUTH_BASE = 'https://stockbit.com/api'

    @classmethod
    def authenticate(cls, username: str, password: str, verification_token: str, recaptcha_version: str) -> Dict[str, Any]:
        """
        Authenticate with Stockbit API.

        Args:
            username: User email
            password: User password
            verification_token: Verification token
            recaptcha_version: Recaptcha version

        Returns:
            Authentication response from Stockbit

        Raises:
            HTTPException: If authentication fails
        """
        try:
            headers = {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/json',
                'origin': 'https://stockbit.com',
                'referer': 'https://stockbit.com/login',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
            }

            payload = {
                "username": username,
                "password": password,
                "verificationToken": verification_token,
                "recaptchaVersion": recaptcha_version
            }

            response = requests.post(
                f"{cls.STOCKBIT_AUTH_BASE}/login/email",
                headers=headers,
                json=payload,
                timeout=30
            )

            if not response.ok:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Stockbit authentication failed: {response.status_code} {response.text}"
                )

            return response.json()

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to connect to Stockbit API: {str(e)}"
            )
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Invalid response from Stockbit API: {str(e)}"
            )

    @classmethod
    def get_screener_results(cls, template_id: str, access_token: str) -> Dict[str, Any]:
        """
        Get screener results from Stockbit API.

        Args:
            template_id: Screener template ID
            access_token: Bearer token for authentication

        Returns:
            Screener results from Stockbit

        Raises:
            HTTPException: If request fails
        """
        try:
            headers = {
                'accept': 'application/json',
                'accept-language': 'en-US,en;q=0.9',
                'authorization': f'Bearer {access_token}',
                'origin': 'https://stockbit.com',
                'referer': 'https://stockbit.com/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
            }

            url = f"{cls.STOCKBIT_API_BASE}/screener/templates/{template_id}?type=TEMPLATE_TYPE_CUSTOM"

            response = requests.get(
                url,
                headers=headers,
                timeout=30
            )

            if not response.ok:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Stockbit screener request failed: {response.status_code} {response.text}"
                )

            return response.json()

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to connect to Stockbit API: {str(e)}"
            )
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Invalid response from Stockbit API: {str(e)}"
            )
