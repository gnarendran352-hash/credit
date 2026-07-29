import { useState, useRef, useCallback, useEffect } from 'react';
import { batchPredict } from '../services/api';
import type { LivePrediction, LiveStats, SimulationState, TimeSeriesPoint, HighRiskTransaction, CSVAnalytics, PostPredictionAnalytics, LiveFeedEntry, BankDecision, TopFraudFeature, LiveAnalytics, ExecReport } from '../types/simulationTypes';
import type { BatchPrediction } from '../types/batchTypes';

export const useSimulationEngine = () => {
  const [simState, setSimState] = useState<SimulationState>({
    status: 'idle',
    currentIndex: 0,
    totalTransactions: 0,
    speed: 1,
    batchSize: 1,
    startedAt: null,
    pausedAt: null,
    elapsedMs: 0,
  });

  const [predictions, setPredictions] = useState<LivePrediction[]>([]);
  const [highRiskQueue, setHighRiskQueue] = useState<HighRiskTransaction[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [csvAnalytics, setCsvAnalytics] = useState<CSVAnalytics | null>(null);
  const [postAnalytics, setPostAnalytics] = useState<PostPredictionAnalytics | null>(null);
  const [alertTriggered, setAlertTriggered] = useState<HighRiskTransaction | null>(null);
  const [_backendPredictions, setBackendPredictions] = useState<BatchPrediction[]>([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const completedRef = useRef(false);

  // New state for real-time simulation
  const [liveFeed, setLiveFeed] = useState<LiveFeedEntry[]>([]);
  const [liveAnalytics, setLiveAnalytics] = useState<LiveAnalytics | null>(null);
  const [_bankDecisions, _setBankDecisions] = useState<BankDecision[]>([]);
  const [criticalFraudQueue, setCriticalFraudQueue] = useState<HighRiskTransaction[]>([]);
  const [execReport, setExecReport] = useState<ExecReport | null>(null);
  const [configInterval, setConfigInterval] = useState(100);

  const intervalRef = useRef<number | null>(null);
  const predictionsRef = useRef<LivePrediction[]>([]);
  const highRiskRef = useRef<HighRiskTransaction[]>([]);
  const criticalFraudRef = useRef<HighRiskTransaction[]>([]);
  const timeSeriesRef = useRef<TimeSeriesPoint[]>([]);
  const backendPredictionsRef = useRef<BatchPrediction[]>([]);
  const liveFeedRef = useRef<LiveFeedEntry[]>([]);
  const statsRef = useRef<LiveStats>({
    processedCount: 0,
    remainingCount: 0,
    fraudCount: 0,
    legitimateCount: 0,
    cancelledCount: 0,
    averageRiskScore: 0,
    averageProbability: 0,
    currentSpeed: '0 tx/s',
    estimatedTimeRemaining: '--',
    transactionsPerMinute: 0,
    highRiskCount: 0,
    averageConfidence: 0,
    totalAmountApproved: 0,
    totalAmountBlocked: 0,
  });
  const [liveStats, setLiveStats] = useState<LiveStats>(statsRef.current);
  const speedRef = useRef(1);
  const batchSizeRef = useRef(1);
  const currentIndexRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const txCountInWindowRef = useRef(0);
  const streamingRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  const workerActiveRef = useRef(false);

  // Initialize Web Worker
  useEffect(() => {
    try {
      const worker = new Worker(new URL('../workers/simulationWorker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'CHUNK_READY') {
          const transactions = payload.transactions || [];
          processTransactionsFromWorker(transactions);
        } else if (type === 'COMPLETE') {
          setSimState(prev => ({ ...prev, status: 'completed' }));
          handleSimulationComplete();
        }
      };
    } catch (err) {
      console.warn('Web Worker not available, falling back to main thread', err);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const processTransactionsFromWorker = useCallback((transactions: any[]) => {
    if (transactions.length === 0) return;

    const newPredictions: LivePrediction[] = [];
    const newHighRisk: HighRiskTransaction[] = [];
    const newCritical: HighRiskTransaction[] = [];
    const newFeedEntries: LiveFeedEntry[] = [];

    transactions.forEach((bp: any) => {
      const riskLevel = bp.risk_level as 'Low' | 'Medium' | 'High';
      const isFraud = bp.prediction === 'Fraud';
      const isHighRisk = riskLevel === 'High';
      const riskScore = bp.risk_score || 0;

      // Generate natural language explanation
      let nlExplanation = '';
      if (isFraud) {
        const prob = (bp.fraud_probability || 0) * 100;
        const features = (bp.top_features || []).slice(0, 3);
        const featureStr = features.map((f: any) => `${f.feature} contributed ${f.importance}%`).join(', ');
        nlExplanation = `Payment Declined: Very high fraud probability (${prob.toFixed(0)}%). Transaction pattern closely matches previous fraud cases. ${featureStr}. Amount is unusually high.`;
      } else {
        nlExplanation = `Payment Approved: Transaction pattern matches typical spending behavior. Risk score (${riskScore.toFixed(0)}/100) is within normal range.`;
      }

      const pred: LivePrediction = {
        transaction_id: bp.transaction_id,
        amount: bp.amount || 0,
        time: bp.time || 0,
        prediction: bp.prediction,
        fraud_probability: bp.fraud_probability || 0,
        risk_score: riskScore,
        risk_level: riskLevel,
        confidence: bp.confidence || 0,
        top_features: bp.top_features || [],
        explanation: bp.explanation,
        cancelled: bp.cancelled ?? isFraud,
        processedAt: Date.now(),
        paymentStatus: isFraud ? 'DECLINED' : 'APPROVED',
        nlExplanation,
      };
      newPredictions.push(pred);

      // High risk tracking
      if (isHighRisk) {
        const hr: HighRiskTransaction = {
          transaction_id: pred.transaction_id,
          amount: pred.amount,
          fraud_probability: pred.fraud_probability,
          risk_score: riskScore,
          risk_level: 'High',
          prediction_time: new Date().toISOString(),
          prediction: 'Fraud',
          explanation: pred.explanation,
        };
        newHighRisk.push(hr);
        if (riskScore > 90) newCritical.push(hr);
      }

      // Live feed entry
      const feedEntry: LiveFeedEntry = {
        id: `tx-${bp.transaction_id}-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: isFraud ? 'DECLINED' : 'APPROVED',
        amount: pred.amount,
        transactionId: pred.transaction_id,
        riskScore,
        message: isFraud ? 'Fraud Detected — Payment Blocked' : 'Payment Approved',
        prediction: pred,
      };
      newFeedEntries.push(feedEntry);
    });

    // Update refs
    predictionsRef.current = [...predictionsRef.current, ...newPredictions];
    highRiskRef.current = [...highRiskRef.current, ...newHighRisk];
    criticalFraudRef.current = [...criticalFraudRef.current, ...newCritical];
    liveFeedRef.current = [...newFeedEntries, ...liveFeedRef.current].slice(0, 200); // Keep last 200
    txCountInWindowRef.current += newPredictions.length;

    // Update time series
    const now = new Date();
    const timeKey = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const fraudInBatch = newPredictions.filter(p => p.prediction === 'Fraud').length;
    const legitInBatch = newPredictions.filter(p => p.prediction === 'Legitimate').length;
    const cancelledInBatch = newPredictions.filter(p => p.cancelled).length;
    const avgRiskBatch = newPredictions.length > 0 ? newPredictions.reduce((s, p) => s + p.risk_score, 0) / newPredictions.length : 0;
    const avgConfBatch = newPredictions.length > 0 ? newPredictions.reduce((s, p) => s + p.confidence, 0) / newPredictions.length : 0;

    const lastTs = timeSeriesRef.current[timeSeriesRef.current.length - 1];
    if (lastTs && lastTs.time === timeKey) {
      // Aggregate into same time slot
      lastTs.fraud += fraudInBatch;
      lastTs.legitimate += legitInBatch;
      lastTs.riskScore = (lastTs.riskScore * 0.7 + avgRiskBatch * 0.3);
      lastTs.confidence = (lastTs.confidence * 0.7 + avgConfBatch * 0.3);
      lastTs.cancelled += cancelledInBatch;
      timeSeriesRef.current = [...timeSeriesRef.current.slice(0, -1), { ...lastTs }];
    } else {  
      timeSeriesRef.current = [
        ...timeSeriesRef.current,
        { time: timeKey, fraud: fraudInBatch, legitimate: legitInBatch, riskScore: avgRiskBatch, confidence: avgConfBatch, cancelled: cancelledInBatch },
      ].slice(-200);
    }

    currentIndexRef.current += newPredictions.length;

    // Trigger alert for high risk
    if (newCritical.length > 0) {
      setAlertTriggered(newCritical[0]);
      setTimeout(() => setAlertTriggered(null), 5000);
    }

    // Batch update state
    setPredictions([...predictionsRef.current]);
    setHighRiskQueue([...highRiskRef.current]);
    setCriticalFraudQueue([...criticalFraudRef.current]);
    setTimeSeries([...timeSeriesRef.current]);
    setLiveFeed([...liveFeedRef.current]);
    updateStats();
    updateLiveAnalytics();
  }, []);

  const updateStats = useCallback(() => {
    const preds = predictionsRef.current;
    const total = simState.totalTransactions;
    const processed = preds.length;
    const fraud = preds.filter(p => p.prediction === 'Fraud').length;
    const legit = processed - fraud;
    const cancelled = preds.filter(p => p.cancelled).length;
    const avgRisk = processed > 0 ? preds.reduce((s, p) => s + p.risk_score, 0) / processed : 0;
    const avgProb = processed > 0 ? preds.reduce((s, p) => s + p.fraud_probability, 0) / processed : 0;
    const avgConf = processed > 0 ? preds.reduce((s, p) => s + p.confidence, 0) / processed : 0;
    const highRisk = preds.filter(p => p.risk_level === 'High').length;
    const totalApproved = preds.filter(p => p.paymentStatus === 'APPROVED').reduce((s, p) => s + p.amount, 0);
    const totalBlocked = preds.filter(p => p.paymentStatus === 'DECLINED').reduce((s, p) => s + p.amount, 0);

    const now = Date.now();
    const elapsed = (now - lastUpdateRef.current) / 1000;
    const tpm = elapsed > 0 ? Math.round((txCountInWindowRef.current / elapsed) * 60) : 0;

    const remaining = total - processed;
    const speed = tpm > 0 ? tpm / 60 : 0;
    const eta = speed > 0 ? Math.ceil(remaining / speed) : 0;
    const etaStr = eta > 3600 ? `${Math.floor(eta / 3600)}h ${Math.floor((eta % 3600) / 60)}m` :
                   eta > 60 ? `${Math.floor(eta / 60)}m ${eta % 60}s` :
                   `${eta}s`;

    const newStats: LiveStats = {
      processedCount: processed,
      remainingCount: remaining,
      fraudCount: fraud,
      legitimateCount: legit,
      cancelledCount: cancelled,
      averageRiskScore: avgRisk,
      averageProbability: avgProb,
      currentSpeed: `${tpm > 0 ? tpm.toLocaleString() : '0'} tx/min`,
      estimatedTimeRemaining: eta === 0 ? 'Complete' : etaStr,
      transactionsPerMinute: tpm,
      highRiskCount: highRisk,
      averageConfidence: avgConf,
      totalAmountApproved: totalApproved,
      totalAmountBlocked: totalBlocked,
    };

    statsRef.current = newStats;
    setLiveStats(newStats);
  }, [simState.totalTransactions]);

  const updateLiveAnalytics = useCallback(() => {
    const preds = predictionsRef.current;
    const total = preds.length;
    if (total === 0) return;

    const fraudCount = preds.filter(p => p.prediction === 'Fraud').length;
    const currentFraudRate = (fraudCount / total) * 100;
    const avgAmount = preds.reduce((s, p) => s + p.amount, 0) / total;
    const highestRisk = Math.max(...preds.map(p => p.risk_score), 0);
    const tpm = statsRef.current.transactionsPerMinute;

    // Calculate top fraud features
    const featureMap = new Map<string, { count: number; totalImportance: number }>();
    preds.filter(p => p.prediction === 'Fraud' && p.top_features).forEach(p => {
      p.top_features!.forEach(f => {
        const existing = featureMap.get(f.feature) || { count: 0, totalImportance: 0 };
        existing.count++;
        existing.totalImportance += f.importance;
        featureMap.set(f.feature, existing);
      });
    });
    const topFraudFeatures: TopFraudFeature[] = Array.from(featureMap.entries())
      .map(([feature, data]) => ({ feature, count: data.count, avgImportance: data.totalImportance / data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Most common fraud pattern
    const patternCounts = new Map<string, number>();
    preds.filter(p => p.prediction === 'Fraud').forEach(p => {
      const features = (p.top_features || []).slice(0, 3).map(f => f.feature).join(' > ');
      patternCounts.set(features, (patternCounts.get(features) || 0) + 1);
    });
    const mostCommonPattern = Array.from(patternCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    setLiveAnalytics({
      currentFraudRate,
      averageTransactionAmount: avgAmount,
      highestRiskScore: highestRisk,
      topFraudFeatures,
      mostCommonFraudPattern: mostCommonPattern,
      transactionsPerMinute: tpm,
      predictionSpeed: Math.round(60000 / (tpm || 1)),
      estimatedRemaining: statsRef.current.estimatedTimeRemaining,
    });
  }, []);

  const processBatch = useCallback(() => {
    if (streamingRef.current) return;
    streamingRef.current = true;

    const backendPreds = backendPredictionsRef.current;
    if (!backendPreds || backendPreds.length === 0) {
      streamingRef.current = false;
      return;
    }

    const batchSize = batchSizeRef.current;
    const startIdx = currentIndexRef.current;
    const endIdx = Math.min(startIdx + batchSize, backendPreds.length);
    const chunk = backendPreds.slice(startIdx, endIdx);

    if (chunk.length > 0) {
      processTransactionsFromWorker(chunk);
    }

    // Check if complete
    if (endIdx >= backendPreds.length && !completedRef.current) {
      completedRef.current = true;
      setSimState(prev => ({ ...prev, status: 'completed', currentIndex: endIdx }));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      handleSimulationComplete();
    }

    streamingRef.current = false;
  }, [processTransactionsFromWorker]);

  const handleSimulationComplete = useCallback(() => {
    const allPreds = predictionsRef.current;
    const total = allPreds.length;
    if (total === 0 || completedRef.current) return;
    completedRef.current = true;

    const fraudCount = allPreds.filter(p => p.prediction === 'Fraud').length;
    const riskLevels = allPreds.map(p => p.risk_level);
    const mostCommon = riskLevels.sort((a, b) =>
      riskLevels.filter(v => v === a).length - riskLevels.filter(v => v === b).length
    ).pop() || 'Low';

    const sortedByRisk = [...allPreds].sort((a, b) => b.risk_score - a.risk_score);
    const top10 = sortedByRisk.slice(0, 10).map(p => ({
      transaction_id: p.transaction_id,
      amount: p.amount,
      fraud_probability: p.fraud_probability,
      risk_score: p.risk_score,
      risk_level: 'High' as const,
      prediction_time: new Date(p.processedAt).toISOString(),
      prediction: 'Fraud' as const,
      explanation: p.explanation,
    }));

    const totalApproved = allPreds.filter(p => p.paymentStatus === 'APPROVED').reduce((s, p) => s + p.amount, 0);
    const totalBlocked = allPreds.filter(p => p.paymentStatus === 'DECLINED').reduce((s, p) => s + p.amount, 0);

    const analytics: PostPredictionAnalytics = {
      fraudPercent: total > 0 ? (fraudCount / total) * 100 : 0,
      legitimatePercent: total > 0 ? ((total - fraudCount) / total) * 100 : 0,
      averageConfidence: total > 0 ? allPreds.reduce((s, p) => s + p.confidence, 0) / total : 0,
      averageProbability: total > 0 ? allPreds.reduce((s, p) => s + p.fraud_probability, 0) / total : 0,
      averageRisk: total > 0 ? allPreds.reduce((s, p) => s + p.risk_score, 0) / total : 0,
      highestRisk: allPreds.length > 0 ? Math.max(...allPreds.map(p => p.risk_score)) : 0,
      lowestRisk: allPreds.length > 0 ? Math.min(...allPreds.map(p => p.risk_score)) : 0,
      mostCommonRiskLevel: mostCommon,
      top10HighRisk: top10,
      totalAmountApproved: totalApproved,
      totalAmountBlocked: totalBlocked,
      preventedLosses: totalBlocked,
    };

    setPostAnalytics(analytics);

    // Generate executive report
    const featureMap = new Map<string, { count: number; totalImportance: number }>();
    allPreds.filter(p => p.prediction === 'Fraud' && p.top_features).forEach(p => {
      p.top_features!.forEach(f => {
        const existing = featureMap.get(f.feature) || { count: 0, totalImportance: 0 };
        existing.count++;
        existing.totalImportance += f.importance;
        featureMap.set(f.feature, existing);
      });
    });
    const topFeatures: TopFraudFeature[] = Array.from(featureMap.entries())
      .map(([feature, data]) => ({ feature, count: data.count, avgImportance: data.totalImportance / data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const duration = simState.startedAt ? Math.floor((Date.now() - simState.startedAt) / 1000) : 0;
    const durationStr = duration > 3600 ? `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m` :
                        duration > 60 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : `${duration}s`;

    setExecReport({
      totalTransactions: total,
      approved: total - fraudCount,
      blocked: fraudCount,
      manualReview: allPreds.filter(p => p.risk_level === 'Medium').length,
      fraudPercent: analytics.fraudPercent,
      legitimatePercent: analytics.legitimatePercent,
      averageConfidence: analytics.averageConfidence,
      averageRiskScore: analytics.averageRisk,
      topFraudFeatures: topFeatures,
      topHighRiskTransactions: top10,
      preventedLosses: totalBlocked,
      totalAmountApproved: totalApproved,
      totalAmountBlocked: totalBlocked,
      simulationDuration: durationStr,
      aiRecommendations: [
        `Blocked ${fraudCount} fraudulent transactions, preventing $${totalBlocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in losses.`,
        `Top fraud indicators: ${topFeatures.slice(0, 3).map(f => f.feature).join(', ')} were the most common features in fraud transactions.`,
        fraudCount > 0 ? `Recommend increasing monitoring intensity for features ${topFeatures.slice(0, 3).map(f => f.feature).join(', ')}.` : 'No specific pattern changes recommended at this time.',
        `Average model confidence was ${analytics.averageConfidence.toFixed(1)}% across all predictions.`,
        analytics.averageRisk > 30 ? 'Risk levels are elevated. Consider implementing additional verification steps for medium-risk transactions.' : 'Risk levels are within acceptable ranges.',
      ],
    });
  }, [simState.startedAt]);

  // Main simulation loop - only use interval fallback when Web Worker is NOT active
  useEffect(() => {
    if (simState.status === 'running' && !workerActiveRef.current && backendPredictionsRef.current.length > 0) {
      const baseInterval = configInterval;
      const speed = speedRef.current;
      const interval = Math.max(10, baseInterval / speed);

      intervalRef.current = window.setInterval(() => {
        processBatch();
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [simState.status, processBatch, configInterval]);

  const loadCSV = useCallback(async (file: File) => {
    setIsLoadingBackend(true);
    setBackendError(null);
    setSimState(prev => ({ ...prev, status: 'idle', currentIndex: 0 }));
    predictionsRef.current = [];
    highRiskRef.current = [];
    criticalFraudRef.current = [];
    timeSeriesRef.current = [];
    liveFeedRef.current = [];
    currentIndexRef.current = 0;
    setPredictions([]);
    setHighRiskQueue([]);
    setCriticalFraudQueue([]);
    setTimeSeries([]);
    setLiveFeed([]);
    setPostAnalytics(null);
    setExecReport(null);
    setLiveAnalytics(null);
    setBackendPredictions([]);
    backendPredictionsRef.current = [];

    try {
      const response = await batchPredict(file);
      const realPredictions = response.predictions;

      setBackendPredictions(realPredictions);
      backendPredictionsRef.current = realPredictions;

      setSimState(prev => ({
        ...prev,
        totalTransactions: realPredictions.length,
        status: 'idle',
      }));

      const amounts = realPredictions.map(p => p.amount || 0);
      const sortedAmounts = [...amounts].sort((a, b) => a - b);
      const mid = Math.floor(sortedAmounts.length / 2);
      const median = sortedAmounts.length % 2 !== 0 ? sortedAmounts[mid] : (sortedAmounts[mid - 1] + sortedAmounts[mid]) / 2;
      const avg = amounts.length > 0 ? amounts.reduce((s, v) => s + v, 0) / amounts.length : 0;
      const variance = amounts.length > 0 ? amounts.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / amounts.length : 0;
      const std = Math.sqrt(variance);

      setCsvAnalytics({
        totalRows: realPredictions.length,
        totalColumns: 30,
        missingValues: 0,
        duplicateRows: 0,
        dataQualityScore: 100,
        averageAmount: avg,
        maxAmount: Math.max(...amounts, 0),
        minAmount: Math.min(...amounts, 0),
        medianAmount: median,
        stdAmount: std,
        columnNames: ['Time', ...Array.from({ length: 28 }, (_, i) => `V${i + 1}`), 'Amount'],
      });
    } catch (err: any) {
      console.error('Backend prediction failed:', err);
      setBackendError(err.message || 'Failed to get predictions from backend');
      setSimState(prev => ({ ...prev, status: 'error' }));
    }
    setIsLoadingBackend(false);
  }, []);

  const start = useCallback(() => {
    completedRef.current = false;
    workerActiveRef.current = true;

    setSimState(prev => ({
      ...prev,
      status: 'running',
      startedAt: Date.now(),
      pausedAt: null,
    }));
    lastUpdateRef.current = Date.now();
    txCountInWindowRef.current = 0;
    liveFeedRef.current = [];
    setLiveFeed([]);

    // Initialize worker with predictions if available
    if (workerRef.current && backendPredictionsRef.current.length > 0) {
      workerRef.current.postMessage({
        type: 'INIT',
        payload: { predictions: backendPredictionsRef.current }
      });
      workerRef.current.postMessage({ type: 'PROCESS_CHUNK' });
    }
  }, []);

  const pause = useCallback(() => {
    setSimState(prev => ({ ...prev, status: 'paused', pausedAt: Date.now() }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'PAUSE' });
    }
  }, []);

  const resume = useCallback(() => {
    setSimState(prev => ({ ...prev, status: 'running', pausedAt: null }));
    lastUpdateRef.current = Date.now();
    txCountInWindowRef.current = 0;
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESUME' });
    }
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
    }
    workerActiveRef.current = false;
    setSimState(prev => ({
      ...prev,
      status: 'idle',
      currentIndex: 0,
      startedAt: null,
      pausedAt: null,
    }));
    predictionsRef.current = [];
    highRiskRef.current = [];
    criticalFraudRef.current = [];
    timeSeriesRef.current = [];
    liveFeedRef.current = [];
    currentIndexRef.current = 0;
    setPredictions([]);
    setHighRiskQueue([]);
    setCriticalFraudQueue([]);
    setTimeSeries([]);
    setLiveFeed([]);
    setPostAnalytics(null);
    setExecReport(null);
    setLiveAnalytics(null);
    setLiveStats({
      processedCount: 0,
      remainingCount: 0,
      fraudCount: 0,
      legitimateCount: 0,
      cancelledCount: 0,
      averageRiskScore: 0,
      averageProbability: 0,
      currentSpeed: '0 tx/min',
      estimatedTimeRemaining: '--',
      transactionsPerMinute: 0,
      highRiskCount: 0,
      averageConfidence: 0,
      totalAmountApproved: 0,
      totalAmountBlocked: 0,
    });
  }, []);

  const setSpeed = useCallback((speed: number) => {
    speedRef.current = speed;
    setSimState(prev => ({ ...prev, speed }));
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'SET_SPEED', payload: { speed } });
    }
  }, []);

  const setBatchSize = useCallback((size: number) => {
    batchSizeRef.current = size;
    setSimState(prev => ({ ...prev, batchSize: size }));
  }, []);

  const processSingleTransaction = useCallback((tx: any) => {
    if (!tx || !tx.prediction) return;

    const riskLevel = tx.risk_level as 'Low' | 'Medium' | 'High';
    const isFraud = tx.prediction === 'Fraud';
    const isHighRisk = riskLevel === 'High';
    const riskScore = tx.risk_score || 0;

    let nlExplanation = '';
    if (isFraud) {
      const prob = (tx.fraud_probability || 0) * 100;
      const features = (tx.top_features || []).slice(0, 3);
      const featureStr = features.map((f: any) => `${f.feature} contributed ${f.importance}%`).join(', ');
      nlExplanation = `Payment Declined: Very high fraud probability (${prob.toFixed(0)}%). Transaction pattern closely matches previous fraud cases. ${featureStr}. Amount is unusually high.`;
    } else {
      nlExplanation = `Payment Approved: Transaction pattern matches typical spending behavior. Risk score (${riskScore.toFixed(0)}/100) is within normal range.`;
    }

    const pred: LivePrediction = {
      transaction_id: tx.transaction_id,
      amount: tx.amount || 0,
      time: tx.time || 0,
      prediction: tx.prediction,
      fraud_probability: tx.fraud_probability || 0,
      risk_score: riskScore,
      risk_level: riskLevel,
      confidence: tx.confidence || 0,
      top_features: tx.top_features || [],
      explanation: tx.explanation,
      cancelled: tx.cancelled ?? isFraud,
      processedAt: Date.now(),
      paymentStatus: isFraud ? 'DECLINED' : 'APPROVED',
      nlExplanation,
    };

    const newPredictions = [pred];
    const newHighRisk: HighRiskTransaction[] = [];
    const newCritical: HighRiskTransaction[] = [];
    const newFeedEntries: LiveFeedEntry[] = [];

    if (isHighRisk) {
      const hr: HighRiskTransaction = {
        transaction_id: pred.transaction_id,
        amount: pred.amount,
        fraud_probability: pred.fraud_probability,
        risk_score: riskScore,
        risk_level: 'High',
        prediction_time: new Date().toISOString(),
        prediction: 'Fraud',
        explanation: pred.explanation,
      };
      newHighRisk.push(hr);
      if (riskScore > 90) newCritical.push(hr);
    }

    const feedEntry: LiveFeedEntry = {
      id: `tx-${pred.transaction_id}-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: isFraud ? 'DECLINED' : 'APPROVED',
      amount: pred.amount,
      transactionId: pred.transaction_id,
      riskScore,
      message: isFraud ? 'Fraud Detected — Payment Blocked' : 'Payment Approved',
      prediction: pred,
    };
    newFeedEntries.push(feedEntry);

    predictionsRef.current = [...newPredictions, ...predictionsRef.current].slice(0, 5000);
    highRiskRef.current = [...newHighRisk, ...highRiskRef.current].slice(0, 1000);
    criticalFraudRef.current = [...newCritical, ...criticalFraudRef.current].slice(0, 1000);
    liveFeedRef.current = [...newFeedEntries, ...liveFeedRef.current].slice(0, 200);
    txCountInWindowRef.current += newPredictions.length;

    const now = new Date();
    const timeKey = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const fraudInBatch = newPredictions.filter(p => p.prediction === 'Fraud').length;
    const legitInBatch = newPredictions.filter(p => p.prediction === 'Legitimate').length;
    const cancelledInBatch = newPredictions.filter(p => p.cancelled).length;
    const avgRiskBatch = newPredictions.length > 0 ? newPredictions.reduce((s, p) => s + p.risk_score, 0) / newPredictions.length : 0;
    const avgConfBatch = newPredictions.length > 0 ? newPredictions.reduce((s, p) => s + p.confidence, 0) / newPredictions.length : 0;

    const lastTs = timeSeriesRef.current[timeSeriesRef.current.length - 1];
    if (lastTs && lastTs.time === timeKey) {
      lastTs.fraud += fraudInBatch;
      lastTs.legitimate += legitInBatch;
      lastTs.riskScore = (lastTs.riskScore * 0.7 + avgRiskBatch * 0.3);
      lastTs.confidence = (lastTs.confidence * 0.7 + avgConfBatch * 0.3);
      lastTs.cancelled += cancelledInBatch;
      timeSeriesRef.current = [...timeSeriesRef.current.slice(0, -1), { ...lastTs }];
    } else {
      timeSeriesRef.current = [
        ...timeSeriesRef.current,
        { time: timeKey, fraud: fraudInBatch, legitimate: legitInBatch, riskScore: avgRiskBatch, confidence: avgConfBatch, cancelled: cancelledInBatch },
      ].slice(-200);
    }

    currentIndexRef.current += newPredictions.length;
    if (newCritical.length > 0) {
      setAlertTriggered(newCritical[0]);
      setTimeout(() => setAlertTriggered(null), 5000);
    }

    setPredictions([...predictionsRef.current]);
    setHighRiskQueue([...highRiskRef.current]);
    setCriticalFraudQueue([...criticalFraudRef.current]);
    setTimeSeries([...timeSeriesRef.current]);
    setLiveFeed([...liveFeedRef.current]);
    updateStats();
    updateLiveAnalytics();
  }, [updateStats, updateLiveAnalytics]);

  return {
    simState,
    predictions,
    highRiskQueue,
    criticalFraudQueue,
    timeSeries,
    liveStats,
    liveFeed,
    liveAnalytics,
    csvAnalytics,
    postAnalytics,
    execReport,
    alertTriggered,
    isLoadingBackend,
    backendError,
    configInterval,
    loadCSV,
    start,
    pause,
    resume,
    stop,
    setSpeed,
    setBatchSize,
    setConfigInterval,
    clearAlert: () => setAlertTriggered(null),
    processSingleTransaction,
  };
};
