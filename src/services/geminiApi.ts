import { AIAnalysis, StockQuote, FinancialMetrics, TechnicalIndicators } from '../types/stock';

export const generateAIAnalysis = async (
  quote: StockQuote,
  metrics: FinancialMetrics,
  technical: TechnicalIndicators
): Promise<AIAnalysis> => {
  // Mock AI analysis for demo - replace with actual Gemini API call
  await new Promise(resolve => setTimeout(resolve, 2000));

  const score = calculateOverallScore(metrics, technical);
  const recommendation = getRecommendation(score);
  const riskLevel = getRiskLevel(metrics, technical);

  return {
    score,
    recommendation,
    reasoning: generateReasoning(quote, metrics, score),
    pros: generatePros(metrics, technical),
    cons: generateCons(metrics, technical),
    riskLevel
  };
};

const calculateOverallScore = (metrics: FinancialMetrics, technical: TechnicalIndicators): number => {
  let score = 50; // Base score

  // Valuation scoring (25% weight)
  if (metrics.peRatio < 15) score += 6.25;
  else if (metrics.peRatio > 30) score -= 6.25;

  if (metrics.pegRatio < 1) score += 6.25;
  else if (metrics.pegRatio > 2) score -= 6.25;

  // Profitability scoring (25% weight)
  if (metrics.profitMargin > 15) score += 6.25;
  else if (metrics.profitMargin < 5) score -= 6.25;

  if (metrics.returnOnEquity > 15) score += 6.25;
  else if (metrics.returnOnEquity < 10) score -= 6.25;

  // Growth scoring (25% weight)
  if (metrics.revenueGrowth > 20) score += 6.25;
  else if (metrics.revenueGrowth < 5) score -= 6.25;

  if (metrics.earningsGrowth > 25) score += 6.25;
  else if (metrics.earningsGrowth < 10) score -= 6.25;

  // Financial health scoring (25% weight)
  if (metrics.debtToEquity < 0.5) score += 6.25;
  else if (metrics.debtToEquity > 1.5) score -= 6.25;

  if (metrics.currentRatio > 2) score += 6.25;
  else if (metrics.currentRatio < 1) score -= 6.25;

  return Math.max(0, Math.min(100, Math.round(score)));
};

const getRecommendation = (score: number): AIAnalysis['recommendation'] => {
  if (score >= 80) return 'Strong Buy';
  if (score >= 60) return 'Buy';
  if (score >= 40) return 'Hold';
  if (score >= 20) return 'Sell';
  return 'Strong Sell';
};

const getRiskLevel = (metrics: FinancialMetrics, technical: TechnicalIndicators): AIAnalysis['riskLevel'] => {
  if (technical.volatility > 40 || metrics.debtToEquity > 2) return 'High';
  if (technical.volatility > 25 || metrics.debtToEquity > 1) return 'Medium';
  return 'Low';
};

const generateReasoning = (quote: StockQuote, metrics: FinancialMetrics, score: number): string => {
  if (score >= 80) {
    return `${quote.symbol} shows exceptional fundamentals with strong profitability metrics and healthy financial position. The company demonstrates consistent growth patterns and maintains reasonable valuation levels.`;
  } else if (score >= 60) {
    return `${quote.symbol} presents a solid investment opportunity with good financial metrics and growth potential. Some areas show room for improvement but overall outlook remains positive.`;
  } else if (score >= 40) {
    return `${quote.symbol} shows mixed signals with both positive and concerning metrics. Careful monitoring is recommended before making investment decisions.`;
  } else {
    return `${quote.symbol} exhibits several concerning financial metrics that suggest caution. Multiple red flags indicate potential risks for investors.`;
  }
};

const generatePros = (metrics: FinancialMetrics, technical: TechnicalIndicators): string[] => {
  const pros: string[] = [];

  if (metrics.profitMargin > 15) pros.push('High profit margins indicate efficient operations');
  if (metrics.returnOnEquity > 15) pros.push('Strong return on equity shows effective use of shareholder capital');
  if (metrics.revenueGrowth > 20) pros.push('Robust revenue growth demonstrates market expansion');
  if (metrics.currentRatio > 2) pros.push('Strong liquidity position provides financial flexibility');
  if (metrics.peRatio < 20) pros.push('Reasonable valuation compared to earnings');

  return pros.length > 0 ? pros : ['Company maintains basic operational metrics'];
};

const generateCons = (metrics: FinancialMetrics, technical: TechnicalIndicators): string[] => {
  const cons: string[] = [];

  if (metrics.debtToEquity > 1.5) cons.push('High debt levels may pose financial risk');
  if (metrics.peRatio > 30) cons.push('Elevated valuation may limit upside potential');
  if (metrics.profitMargin < 5) cons.push('Low profit margins indicate operational challenges');
  if (technical.volatility > 40) cons.push('High price volatility increases investment risk');
  if (metrics.revenueGrowth < 5) cons.push('Slow revenue growth may indicate market challenges');

  return cons.length > 0 ? cons : ['Minor areas for potential improvement'];
};
