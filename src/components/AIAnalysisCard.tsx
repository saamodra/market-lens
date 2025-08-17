import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { AIAnalysis } from '../types/stock';
import { ProgressBar } from './ProgressBar';

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
  isLoading?: boolean;
}

export function AIAnalysisCard({ analysis, isLoading }: AIAnalysisCardProps) {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Buy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Buy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'Hold': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Sell': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'Strong Sell': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Brain className="w-6 h-6 text-blue-500 mr-2 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Analysis
          </h3>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-20 w-full"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-16 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <Brain className="w-6 h-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Analysis
        </h3>
      </div>

      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Investment Score
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.score}/100
          </span>
        </div>
        <ProgressBar
          value={analysis.score}
          max={100}
          className="mb-2"
          showValue={false}
        />
        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(analysis.recommendation)}`}>
          {analysis.recommendation}
        </div>
      </div>

      {/* Risk Level */}
      <div className="mb-4 flex items-center">
        <Shield className="w-4 h-4 mr-2" />
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Risk Level:</span>
        <span className={`text-sm font-medium ${getRiskColor(analysis.riskLevel)}`}>
          {analysis.riskLevel}
        </span>
      </div>

      {/* Reasoning */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {analysis.reasoning}
        </p>
      </div>

      {/* Pros and Cons */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="flex items-center text-sm font-medium text-green-600 dark:text-green-400 mb-2">
            <TrendingUp className="w-4 h-4 mr-1" />
            Strengths
          </h4>
          <ul className="space-y-1">
            {analysis.pros.map((pro, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-green-500 mr-1">•</span>
                {pro}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="flex items-center text-sm font-medium text-red-600 dark:text-red-400 mb-2">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Concerns
          </h4>
          <ul className="space-y-1">
            {analysis.cons.map((con, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-red-500 mr-1">•</span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}