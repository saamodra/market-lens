import React from 'react';
import { Lightbulb } from 'lucide-react';
import { AIAnalysis } from '../types/stock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AIAnalysisCard.css';

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
  isLoading?: boolean;
}

export function AIAnalysisCard({ analysis, isLoading }: AIAnalysisCardProps) {
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

      {/* Raw AI Analysis */}
      <div className="mb-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
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
          <ul className="space-y-2">
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
