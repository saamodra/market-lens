import React, { useState } from 'react';
import { Lightbulb, Copy, Check } from 'lucide-react';
import { AIAnalysis } from '../types/stock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AIAnalysisCard.css';

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
  isLoading?: boolean;
}

export function AIAnalysisCard({ analysis, isLoading }: AIAnalysisCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    if (!analysis.prompt) return;

    try {
      await navigator.clipboard.writeText(analysis.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-20 w-full"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-16 w-full"></div>
      </div>
    );
  }

  return (
    <div>
      {/* AI Prompt */}
      {analysis.prompt && (
        <div className="mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center text-sm font-medium text-blue-700 dark:text-blue-300">
                <Lightbulb className="w-4 h-4 mr-2 text-blue-500" />
                AI Prompt Used
              </h4>
              <button
                onClick={handleCopyPrompt}
                disabled={!analysis.prompt}
                className="flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy prompt to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raw AI Analysis */}
      <div className="mb-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            Analisis AI
          </h4>
          <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysis.analysis}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rekomendasi Utama
          </h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
