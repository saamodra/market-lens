import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Key, Eye, EyeOff, ExternalLink, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import StockbitAPI from '../services/stockbitApi';

interface StockbitTokenInputProps {
  onTokenSet?: () => void;
}

export const StockbitTokenInput: React.FC<StockbitTokenInputProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tokenInfo = StockbitAPI.getTokenInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Please enter a valid token');
      return;
    }

    setIsLoading(true);
    try {
      // Store the token
      StockbitAPI.setManualToken(token.trim());
      toast.success('Token saved successfully!');
      setToken('');
      onTokenSet?.();
    } catch (error) {
      toast.error('Failed to save token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearToken = () => {
    StockbitAPI.clearToken();
    toast.success('Token cleared');
    onTokenSet?.();
  };


  const formatExpiryDate = (expiresAt?: string): string => {
    if (!expiresAt) return 'Unknown';
    try {
      const date = new Date(expiresAt);
      const now = new Date();
      const isExpired = date < now;

      return `${date.toLocaleString()} ${isExpired ? '(Expired)' : ''}`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <Key className="w-5 h-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Stockbit Authentication
        </h3>
      </div>

      {/* Current Token Status */}
      {tokenInfo.hasToken ? (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Token Active {tokenInfo.isManual ? '(Manual)' : '(Auto)'}
                </p>
                {tokenInfo.expiresAt && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Expires: {formatExpiryDate(tokenInfo.expiresAt)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClearToken}
              className="flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              No valid token found. Please provide a Stockbit bearer token.
            </p>
          </div>
        </div>
      )}


      {/* Manual Instructions */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Manual Method - How to get your Stockbit token:
        </h4>
        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>1. Open <a href="https://stockbit.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800 dark:hover:text-blue-200">Stockbit.com</a> and login</li>
          <li>2. Open Developer Tools (F12) → Network tab</li>
          <li>3. Navigate to any page (like screener)</li>
          <li>4. Look for API requests and copy the "Authorization: Bearer ..." header</li>
          <li>5. Paste the token (without "Bearer ") below</li>
        </ol>
        <div className="mt-3">
          <a
            href="https://stockbit.com/screener"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open Stockbit Screener
          </a>
        </div>
      </div>

      {/* Token Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bearer Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6IjU3MDc0NjI3..."
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showToken ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || !token.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Token'}
          </button>
          {token && (
            <button
              type="button"
              onClick={() => setToken('')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-md transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
