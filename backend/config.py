"""
Configuration module for the stock analyzer API.
Following Single Responsibility Principle - this file only handles configuration.
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()


class Config:
    """Application configuration."""
    
    # API Configuration
    TITLE = "Market Lens API"
    DESCRIPTION = "A comprehensive stock analysis API using yfinance and Google AI"
    VERSION = "1.0.0"
    
    # CORS Configuration
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
    
    # AI Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = "gemini-2.5-flash"
    
    # Rate Limiting
    YFINANCE_DELAY = 1.0  # seconds
    
    @classmethod
    def configure_ai(cls):
        """Configure Google AI with API key."""
        if cls.GEMINI_API_KEY:
            genai.configure(api_key=cls.GEMINI_API_KEY)
        else:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
