"""
Application factory following SOLID principles.
Separates concerns for app creation, configuration, and dependency management.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import Config
from dependencies import DependencyContainer
from routes import setup_routes


class AppFactory:
    """Factory class for creating FastAPI application instances (Factory Pattern)."""

    @staticmethod
    def create_app() -> FastAPI:
        """
        Create and configure FastAPI application.

        Returns:
            FastAPI: Configured application instance
        """
        # Initialize configuration
        Config.configure_ai()

        # Create FastAPI instance
        app = FastAPI(
            title=Config.TITLE,
            description=Config.DESCRIPTION,
            version=Config.VERSION
        )

        # Configure middleware
        AppFactory._configure_middleware(app)

        # Setup routes
        container = DependencyContainer()
        setup_routes(app, container)

        return app

    @staticmethod
    def _configure_middleware(app: FastAPI) -> None:
        """Configure application middleware."""
        app.add_middleware(
            CORSMiddleware,
            allow_origins=Config.CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
