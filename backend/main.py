"""
Main entry point for the stock analyzer API.
Following SOLID principles with clean separation of concerns.
This file only contains the application entry point.
"""
from app_factory import AppFactory

# Create application using factory pattern
app = AppFactory.create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
