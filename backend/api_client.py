#!/usr/bin/env python3
"""
Simple API client for testing the Market Lens API
"""

import requests
import json
import time

class StockAnalyzerClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"

    def health_check(self):
        """Check API health"""
        try:
            response = requests.get(f"{self.base_url}/health")
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, {"error": str(e)}

    def search_stocks(self, query):
        """Search for stocks"""
        try:
            response = requests.get(f"{self.api_base}/stocks/search?query={query}")
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, {"error": str(e)}

    def analyze_stock(self, symbol):
        """Analyze a stock"""
        try:
            response = requests.post(
                f"{self.api_base}/stocks/analyze",
                json={"symbol": symbol}
            )
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, {"error": str(e)}

    def evaluate_stock(self, symbol):
        """Evaluate a stock"""
        try:
            response = requests.post(
                f"{self.api_base}/stocks/evaluate",
                json={"symbol": symbol}
            )
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, {"error": str(e)}

    def get_stock_quote(self, symbol):
        """Get stock quote"""
        try:
            response = requests.get(f"{self.api_base}/stocks/{symbol}/quote")
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, {"error": str(e)}

    def ai_analysis(self, symbol, question):
        """Get AI analysis"""
        try:
            response = requests.post(
                f"{self.api_base}/ai/analyze",
                json={"symbol": symbol, "question": question}
            )
            return response.status_code == 200, response.json()
        except Exception as e:
            return False, {"error": str(e)}

def interactive_test():
    """Interactive testing mode"""
    client = StockAnalyzerClient()

    print("🚀 Market Lens API Client")
    print("=" * 40)

    # Check health first
    print("\n🔍 Checking API health...")
    success, data = client.health_check()
    if success:
        print("✅ API is healthy!")
        print(f"   Status: {data}")
    else:
        print("❌ API is not responding!")
        print(f"   Error: {data}")
        return

    while True:
        print("\n" + "=" * 40)
        print("Choose an option:")
        print("1. Search stocks")
        print("2. Analyze stock")
        print("3. Evaluate stock")
        print("4. Get stock quote")
        print("5. AI analysis")
        print("6. Exit")

        choice = input("\nEnter your choice (1-6): ").strip()

        if choice == "1":
            query = input("Enter search query: ").strip()
            success, data = client.search_stocks(query)
            if success:
                print(f"✅ Search results: {data.get('results', [])}")
            else:
                print(f"❌ Search failed: {data}")

        elif choice == "2":
            symbol = input("Enter stock symbol: ").strip().upper()
            success, data = client.analyze_stock(symbol)
            if success:
                quote = data.get('quote', {})
                print(f"✅ Analysis complete!")
                print(f"   Company: {quote.get('name', 'N/A')}")
                print(f"   Price: ${quote.get('price', 'N/A')}")
                print(f"   Sector: {quote.get('sector', 'N/A')}")
            else:
                print(f"❌ Analysis failed: {data}")

        elif choice == "3":
            symbol = input("Enter stock symbol: ").strip().upper()
            success, data = client.evaluate_stock(symbol)
            if success:
                print(f"✅ Evaluation complete!")
                print(f"   Score: {data.get('score', 'N/A')}/100")
                print(f"   Recommendation: {data.get('recommendation', 'N/A')}")
            else:
                print(f"❌ Evaluation failed: {data}")

        elif choice == "4":
            symbol = input("Enter stock symbol: ").strip().upper()
            success, data = client.get_stock_quote(symbol)
            if success:
                print(f"✅ Quote retrieved!")
                print(f"   Company: {data.get('name', 'N/A')}")
                print(f"   Price: ${data.get('price', 'N/A')}")
                print(f"   Market Cap: ${data.get('marketCap', 'N/A'):,}" if data.get('marketCap') else "   Market Cap: N/A")
            else:
                print(f"❌ Quote failed: {data}")

        elif choice == "5":
            symbol = input("Enter stock symbol: ").strip().upper()
            question = input("Enter your question: ").strip()
            success, data = client.ai_analysis(symbol, question)
            if success:
                print(f"✅ AI analysis complete!")
                print(f"   Analysis: {data.get('analysis', 'N/A')[:200]}...")
                print(f"   Recommendations: {data.get('recommendations', [])}")
            else:
                print(f"❌ AI analysis failed: {data}")

        elif choice == "6":
            print("👋 Goodbye!")
            break

        else:
            print("❌ Invalid choice. Please enter 1-6.")

        # Add delay to avoid rate limiting
        time.sleep(1)

if __name__ == "__main__":
    interactive_test()
