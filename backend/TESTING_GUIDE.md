# 🧪 Stock Analyzer API Testing Guide

## 📋 Available Testing Tools

### 1. **API Endpoint Tests** (`test_api.py`)
Test all API endpoints with HTTP requests.

```bash
python test_api.py
```

### 2. **Function Debug Tests** (`debug_functions.py`)
Test individual functions without HTTP requests.

```bash
python debug_functions.py
python debug_functions.py analyze
python debug_functions.py evaluate
```

### 3. **Data Flow Debug** (`debug_data.py`)
Debug data flow and check results.

```bash
python debug_data.py AAPL
python debug_data.py GOOGL
```

### 4. **Interactive API Client** (`api_client.py`)
Interactive testing client.

```bash
python api_client.py
```

### 5. **Load Testing** (`load_test.py`)
Performance testing.

```bash
python load_test.py
```

### 6. **Test Runner** (`run_tests.py`)
Run all tests in sequence.

```bash
python run_tests.py
```

## 🚀 Quick Start

1. **Start API**: `cd backend && python run.py`
2. **Run Tests**: `python debug_functions.py`
3. **Test API**: `python test_api.py`

## 🔍 Debugging

- **Empty Data**: Use `debug_functions.py analyze`
- **API Issues**: Use `test_api.py`
- **Rate Limiting**: Check delays in `main.py`
- **Data Problems**: Use `debug_data.py`

## 📊 Success Indicators

- ✅ Functions return data with expected keys
- ✅ API responds with 200 status
- ✅ Response times < 5 seconds
- ✅ Success rate > 90%

## 🛠️ Custom Testing

Add new test cases in the test files or create your own scripts using the existing functions as examples.
