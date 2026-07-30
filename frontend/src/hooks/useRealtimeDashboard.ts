import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '../services/firebase';
import type { StoredPrediction, StoredNotification, StoredCase } from '../services/firebase';
import type { BlockedTransaction } from '../types';

export interface DashboardStats {
  totalTransactions: number;
  approved: number;
  blocked: number;
  fraudDetected: number;
  pendingReview: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  avgConfidence: number;
  avgRiskScore: number;
  moneyProtected: number;
  moneyLostPrevented: number;
  throughput: number;
  activeAlerts: number;
  criticalAlerts: number;
}

export const useRealtimeDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    approved: 0,
    blocked: 0,
    fraudDetected: 0,
    pendingReview: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgConfidence: 0,
    avgRiskScore: 0,
    moneyProtected: 0,
    moneyLostPrevented: 0,
    throughput: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<StoredPrediction[]>([]);
  const [recentBlocked, setRecentBlocked] = useState<BlockedTransaction[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<StoredNotification[]>([]);
  const [isLive, setIsLive] = useState(false);

  // Subscribe to predictions
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToBlockedTransactions((blocked) => {
      setRecentBlocked(blocked.slice(0, 20));
    }, 20);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToNotifications((notifs) => {
      setRecentNotifications(notifs.slice(0, 10));
    }, 10);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const updateStats = useCallback((predictions: any[]) => {
    const total = predictions.length;
    const fraud = predictions.filter(p => p.prediction === 'Fraud').length;
    const blocked = predictions.filter(p => p.cancelled).length;
    const high = predictions.filter(p => p.risk_level === 'High').length;
    const medium = predictions.filter(p => p.risk_level === 'Medium').length;
    const low = predictions.filter(p => p.risk_level === 'Low').length;

    const avgConf = total > 0 ? predictions.reduce((s, p) => s + (p.confidence || 0), 0) / total : 0;
    const avgRisk = total > 0 ? predictions.reduce((s, p) => s + (p.risk_score || 0), 0) / total : 0;
    const totalAmount = predictions.reduce((s, p) => s + (p.amount || 0), 0);
    const blockedAmount = predictions.filter(p => p.cancelled).reduce((s, p) => s + (p.amount || 0), 0);

    setStats({
      totalTransactions: total,
      approved: total - fraud,
      blocked,
      fraudDetected: fraud,
      pendingReview: medium,
      highRisk: high,
      mediumRisk: medium,
      lowRisk: low,
      avgConfidence: avgConf,
      avgRiskScore: avgRisk,
      moneyProtected: totalAmount,
      moneyLostPrevented: blockedAmount,
      throughput: total,
      activeAlerts: high,
      criticalAlerts: high,
    });
  }, []);

  return {
    stats,
    recentTransactions,
    recentBlocked,
    recentNotifications,
    isLive,
    setIsLive,
    updateStats,
  };
};

export default useRealtimeDashboard;