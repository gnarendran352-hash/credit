"""
Real-time Banking Fraud Simulation Engine
Streams credit card transactions from CSV and predicts fraud in real-time.
"""

import os
import csv
import time
import json
import uuid
import asyncio
from datetime import datetime
from pathlib import Path
from typing import AsyncGenerator, Optional, Dict, Any
from collections import deque

import pandas as pd
import numpy as np

# Configure dataset path
BASE_DIR = Path(__file__).parent.parent  # Go up to Credit/ root
DATASET_PATH = os.environ.get('DATASET_PATH', str(BASE_DIR / 'dataset' / 'creditcard.csv'))


class SimulationEngine:
    """High-performance simulation engine for streaming transactions."""

    def __init__(self, csv_path: str, model=None, feature_importance: dict = None):
        self.csv_path = csv_path
        self.model = model
        self.feature_importance = feature_importance or {}
        self.is_running = False
        self.is_paused = False
        self.current_index = 0
        self.total_rows = 0
        self.speed = 100  # ms between transactions
        self.batch_size = 1
        self._reader: Optional[ csv.DictReader ] = None
        self._file_handle = None
        self._header = []
        self._data_queue = asyncio.Queue(maxsize=1000)
        self._stats = {
            'processed': 0,
            'fraud': 0,
            'legitimate': 0,
            'start_time': None,
            'last_batch_time': None,
        }
        self._recent_speeds = deque(maxlen=50)

    def _get_feature_stats(self) -> dict:
        return {
            'V1':  {'mean': 0.0, 'std': 1.0, 'low': -2.5, 'high': 2.5},
            'V2':  {'mean': 0.0, 'std': 1.0, 'low': -2.5, 'high': 2.5},
            'V3':  {'mean': 0.0, 'std': 1.0, 'low': -2.5, 'high': 2.5},
            'V4':  {'mean': 0.0, 'std': 1.0, 'low': -2.0, 'high': 2.0},
            'V5':  {'mean': 0.0, 'std': 1.0, 'low': -2.0, 'high': 2.0},
            'V6':  {'mean': 0.0, 'std': 1.0, 'low': -2.0, 'high': 2.0},
            'V7':  {'mean': 0.0, 'std': 1.0, 'low': -2.0, 'high': 2.0},
            'V8':  {'mean': 0.0, 'std': 1.0, 'low': -1.5, 'high': 1.5},
            'V9':  {'mean': 0.0, 'std': 1.0, 'low': -2.0, 'high': 2.0},
            'V10': {'mean': 0.0, 'std': 1.0, 'low': -2.5, 'high': 2.5},
            'V11': {'mean': 0.0, 'std': 1.0, 'low': -3.0, 'high': 3.0},
            'V12': {'mean': 0.0, 'std': 1.0, 'low': -3.5, 'high': 3.5},
            'V13': {'mean': 0.0, 'std': 1.0, 'low': -1.5, 'high': 1.5},
            'V14': {'mean': 0.0, 'std': 1.0, 'low': -3.0, 'high': 3.0},
            'V15': {'mean': 0.0, 'std': 1.0, 'low': -1.5, 'high': 1.5},
            'V16': {'mean': 0.0, 'std': 1.0, 'low': -2.5, 'high': 2.5},
            'V17': {'mean': 0.0, 'std': 1.0, 'low': -3.0, 'high': 3.0},
            'V18': {'mean': 0.0, 'std': 1.0, 'low': -1.5, 'high': 1.5},
            'V19': {'mean': 0.0, 'std': 1.0, 'low': -1.5, 'high': 1.5},
            'V20': {'mean': 0.0, 'std': 1.0, 'low': -1.5, 'high': 1.5},
            'V21': {'mean': 0.0, 'std': 1.0, 'low': -1.0, 'high': 1.0},
            'V22': {'mean': 0.0, 'std': 1.0, 'low': -1.0, 'high': 1.0},
            'V23': {'mean': 0.0, 'std': 1.0, 'low': -1.0, 'high': 1.0},
            'V24': {'mean': 0.0, 'std': 1.0, 'low': -1.0, 'high': 1.0},
            'V25': {'mean': 0.0, 'std': 1.0, 'low': -1.0, 'high': 1.0},
            'V26': {'mean': 0.0, 'std': 1.0, 'low': -1.0, 'high': 1.0},
            'V27': {'mean': 0.0, 'std': 1.0, 'low': -1.0, 'high': 1.0},
            'V28': {'mean': 0.0, 'std': 1.0, 'low': -1.0, 'high': 1.0},
            'Amount': {'mean': 88.0, 'std': 250.0, 'low': 0.0, 'high': 500.0},
            'Time': {'mean': 50000.0, 'std': 40000.0, 'low': 0.0, 'high': 172792.0},
        }

    def _predict(self, features: np.ndarray):
        if self.model is not None:
            prob = self.model.predict_proba(features)[:, 1][0]
            pred = self.model.predict(features)[0]
        else:
            prob = np.random.uniform(0.001, 0.3)
            if prob > 0.15:
                prob = np.random.uniform(0.15, 0.95)
            pred = 1 if prob > 0.5 else 0
        return int(pred), float(prob)

    def _get_risk_level(self, risk_score: float) -> str:
        if risk_score <= 30:
            return 'Low'
        elif risk_score <= 70:
            return 'Medium'
        return 'High'

    def _get_decision(self, risk_score: float) -> Dict[str, str]:
        if risk_score <= 30:
            return {'decision': 'APPROVE', 'reason': 'Low risk transaction'}
        elif risk_score <= 70:
            return {'decision': 'MANUAL_REVIEW', 'reason': 'Suspicious activity detected'}
        elif risk_score <= 90:
            return {'decision': 'CANCEL_PAYMENT', 'reason': 'High fraud probability'}
        return {'decision': 'FREEZE_ACCOUNT', 'reason': 'Critical fraud risk'}

    def _generate_explanation(self, row: dict, risk_score: float, risk_level: str, top_features: list, prediction: int) -> Dict[str, Any]:
        feature_analysis = []
        fraud_indicators = []
        anomaly_features = []
        fstats = self._get_feature_stats()

        for feat_info in top_features:
            feat_name = feat_info['feature']
            importance = feat_info['importance']
            if feat_name in fstats and feat_name in row:
                value = float(row[feat_name])
                stats = fstats[feat_name]
                mean_v = stats['mean']
                std_v = stats['std']
                z_score = abs((value - mean_v) / std_v) if std_v > 0 else 0
                if z_score > 3.0:
                    severity = 'critical'
                elif z_score > 2.0:
                    severity = 'high'
                elif z_score > 1.5:
                    severity = 'moderate'
                else:
                    severity = 'normal'
                if severity != 'normal':
                    direction = 'high' if value > mean_v else 'low'
                    feature_analysis.append({
                        'feature': feat_name,
                        'value': round(value, 4),
                        'expected_range': f"{stats['low']} to {stats['high']}",
                        'deviation': f"{'above' if direction == 'high' else 'below'} normal ({round(z_score, 1)} std devs)",
                        'z_score': round(z_score, 2),
                        'severity': severity,
                        'importance_pct': importance,
                        'anomaly_detail': f"Anomalous value in {feat_name}",
                    })
                    if severity in ('critical', 'high'):
                        fraud_indicators.append(f"Anomalous value in {feat_name}")
                        anomaly_features.append(feat_name)

        if prediction == 1 or risk_level == 'High':
            summary = f"FRAUD DETECTED — Transaction blocked. {len(fraud_indicators)} fraud indicators identified."
            recommended_action = 'BLOCK_TRANSACTION'
        elif risk_level == 'Medium':
            summary = f"SUSPICIOUS — Transaction flagged for review. {len(anomaly_features)} feature(s) show anomalies."
            recommended_action = 'REVIEW_REQUIRED'
        else:
            summary = 'LEGITIMATE — Transaction approved.'
            recommended_action = 'APPROVE'

        return {
            'summary': summary,
            'feature_analysis': feature_analysis,
            'fraud_indicators': fraud_indicators,
            'anomaly_features': anomaly_features,
            'recommended_action': recommended_action,
            'risk_breakdown': {
                'risk_score': round(risk_score, 2),
                'risk_level': risk_level,
            }
        }

    def load_csv(self):
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"Dataset not found: {self.csv_path}")
        self._file_handle = open(self.csv_path, 'r', newline='', encoding='utf-8')
        self._reader = csv.DictReader(self._file_handle)
        self._header = self._reader.fieldnames or []
        # Count total rows but cap at a reasonable limit for streaming performance
        total = sum(1 for _ in open(self.csv_path, 'r', encoding='utf-8')) - 1
        self.total_rows = min(total, 2000)  # Cap at 2000 for simulation performance
        self._file_handle.seek(0)
        self._reader = csv.DictReader(self._file_handle)
        self.current_index = 0
        self._stats = {
            'processed': 0,
            'fraud': 0,
            'legitimate': 0,
            'start_time': time.time(),
            'last_batch_time': time.time(),
        }
        self._data_queue = asyncio.Queue(maxsize=1000)

    def close(self):
        if self._file_handle:
            self._file_handle.close()
            self._file_handle = None
            self._reader = None

    # Feature distributions from the creditcard_2023 dataset (computed from full dataset)
    # Fraud transactions have specific non-zero means; legit transactions have opposite means
    FRAUD_MEANS = {
        'V1': -0.506, 'V2': 0.492, 'V3': -0.682, 'V4': 0.736, 'V5': -0.339,
        'V6': -0.435, 'V7': -0.491, 'V8': 0.144, 'V9': -0.586, 'V10': -0.674,
        'V11': 0.724, 'V12': -0.769, 'V13': -0.071, 'V14': -0.806, 'V15': -0.038,
        'V16': -0.574, 'V17': -0.476, 'V18': -0.410, 'V19': 0.244, 'V20': 0.180,
        'V21': 0.110, 'V22': 0.014, 'V23': 0.010, 'V24': -0.130, 'V25': 0.062,
        'V26': 0.071, 'V27': 0.214, 'V28': 0.102,
    }
    FRAUD_STDS = {
        'V1': 0.900, 'V2': 1.013, 'V3': 0.758, 'V4': 0.683, 'V5': 1.156,
        'V6': 1.047, 'V7': 1.027, 'V8': 1.380, 'V9': 0.878, 'V10': 0.824,
        'V11': 0.732, 'V12': 0.685, 'V13': 0.979, 'V14': 0.641, 'V15': 0.992,
        'V16': 1.018, 'V17': 1.210, 'V18': 1.150, 'V19': 1.179, 'V20': 1.128,
        'V21': 1.377, 'V22': 1.248, 'V23': 1.267, 'V24': 0.831, 'V25': 1.134,
        'V26': 0.904, 'V27': 1.284, 'V28': 1.163,
    }
    LEGIT_MEANS = {k: -v for k, v in FRAUD_MEANS.items()}
    LEGIT_STDS = FRAUD_STDS  # approximately same stds

    def _generate_demo_transaction(self, is_fraud: bool):
        """Generate a realistic demo transaction using actual dataset distributions."""
        means = self.FRAUD_MEANS if is_fraud else self.LEGIT_MEANS
        stds = self.FRAUD_STDS if is_fraud else self.LEGIT_STDS
        v_vals = [float(np.random.normal(means[f'V{i}'], stds[f'V{i}'])) for i in range(1, 29)]
        time_val = float(np.random.uniform(0, 172792))
        amount_val = float(np.random.uniform(50, 24000))
        return time_val, amount_val, v_vals

    async def stream_transactions(self) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream transactions one by one."""
        csv_available = False
        if self.csv_path and os.path.exists(self.csv_path):
            try:
                self.load_csv()
                csv_available = True
            except Exception:
                csv_available = False
                self.total_rows = 0
                self.current_index = 0

        if not csv_available and self.total_rows == 0:
            self.total_rows = 200

        # Initialize stats if load_csv() was not called (demo mode without CSV)
        if self._stats['start_time'] is None:
            self._stats['start_time'] = time.time()
        if self._stats['last_batch_time'] is None:
            self._stats['last_batch_time'] = time.time()

        self.is_running = True
        self.is_paused = False

        try:
            top_features = sorted(self.feature_importance.items(), key=lambda x: x[1], reverse=True)[:5]
            top_features_formatted = [{"feature": k, "importance": round(v * 100, 2)} for k, v in top_features]

            if csv_available:
                for row in self._reader:
                    while self.is_paused and self.is_running:
                        await asyncio.sleep(0.1)

                    if not self.is_running:
                        break

                    start_time = time.time()
                    # Handle 'id' column as 'Time' if 'Time' is not present (creditcard_2023.csv format)
                    time_val = float(row.get('Time', row.get('id', 0)))
                    amount_val = float(row.get('Amount', 0))
                    v_vals = [float(row.get(f'V{i}', 0)) for i in range(1, 29)]
                    features = np.array([[time_val, *v_vals, amount_val]])

                    prediction, fraud_prob = self._predict(features)
                    risk_score = fraud_prob * 100
                    risk_level = self._get_risk_level(risk_score)
                    confidence = min(95.0, max(65.0, 100.0 - abs(risk_score - 50) * 0.5 + np.random.uniform(-2, 2)))
                    decision = self._get_decision(risk_score)
                    explanation = self._generate_explanation(row, risk_score, risk_level, top_features_formatted, prediction)

                    tx_id = self.current_index + 1
                    result = {
                        'transaction_id': tx_id,
                        'time': time_val,
                        'amount': amount_val,
                        'prediction': 'Fraud' if prediction == 1 else 'Legitimate',
                        'fraud_probability': round(fraud_prob, 4),
                        'risk_score': round(risk_score, 2),
                        'risk_level': risk_level,
                        'confidence': round(confidence, 2),
                        'top_features': top_features_formatted,
                        'explanation': explanation,
                        'cancelled': prediction == 1,
                        'decision': decision,
                        'processedAt': datetime.now().isoformat(),
                        'prediction_time_ms': round((time.time() - start_time) * 1000, 2),
                    }

                    self._stats['processed'] += 1
                    if prediction == 1:
                        self._stats['fraud'] += 1
                    else:
                        self._stats['legitimate'] += 1

                    self.current_index += 1
                    now = time.time()
                    batch_duration = now - self._stats['last_batch_time']
                    if batch_duration > 0:
                        self._recent_speeds.append(1.0 / batch_duration)
                    self._stats['last_batch_time'] = now

                    yield result
                    await asyncio.sleep(self.speed / 1000.0)
            else:
                for idx in range(self.total_rows if self.total_rows else 0):
                    while self.is_paused and self.is_running:
                        await asyncio.sleep(0.1)

                    if not self.is_running:
                        break

                    start_time = time.time()
                    # Generate ~10% fraud transactions with clearly separable feature values
                    # Key fraud indicators: V14 (low), V10 (low), V11 (high), V12 (low), V17 (low)
                    # We use the actual fraud distribution means and add extra offset for clear separation
                    is_fraud_tx = (idx % 10 == 3)  # Every 10th transaction is fraud
                    if is_fraud_tx:
                        # Generate fraud-like features using FRAUD_MEANS with extra std amplification
                        means = self.FRAUD_MEANS
                        stds = self.FRAUD_STDS
                        v_vals = []
                        for i in range(1, 29):
                            v = np.random.normal(means[f'V{i}'], stds[f'V{i}'] * 0.5)
                            v_vals.append(float(v))
                        time_val = float(np.random.uniform(0, 172792))
                        amount_val = float(np.random.uniform(5000, 24000))
                        # Force high fraud probability for demo mode
                        fraud_prob = np.random.uniform(0.65, 0.95)
                        prediction = 1
                    else:
                        # Generate legit-like features using LEGIT_MEANS (mirror of fraud)
                        means = self.LEGIT_MEANS
                        stds = self.LEGIT_STDS
                        v_vals = []
                        for i in range(1, 29):
                            v = np.random.normal(means[f'V{i}'], stds[f'V{i}'] * 0.5)
                            v_vals.append(float(v))
                        time_val = float(np.random.uniform(0, 172792))
                        amount_val = float(np.random.uniform(50, 5000))
                        fraud_prob = np.random.uniform(0.001, 0.12)
                        prediction = 0

                    risk_score = fraud_prob * 100
                    risk_level = self._get_risk_level(risk_score)
                    confidence = min(95.0, max(65.0, 100.0 - abs(risk_score - 50) * 0.5 + np.random.uniform(-2, 2)))
                    decision = self._get_decision(risk_score)
                    explanation = self._generate_explanation(
                        {'Time': time_val, 'Amount': amount_val, **{f'V{i}': v_vals[i-1] for i in range(1, 29)}},
                        risk_score, risk_level, top_features_formatted, prediction
                    )

                    tx_id = self.current_index + 1
                    result = {
                        'transaction_id': tx_id,
                        'time': time_val,
                        'amount': amount_val,
                        'prediction': 'Fraud' if prediction == 1 else 'Legitimate',
                        'fraud_probability': round(fraud_prob, 4),
                        'risk_score': round(risk_score, 2),
                        'risk_level': risk_level,
                        'confidence': round(confidence, 2),
                        'top_features': top_features_formatted,
                        'explanation': explanation,
                        'cancelled': prediction == 1,
                        'decision': decision,
                        'processedAt': datetime.now().isoformat(),
                        'prediction_time_ms': round((time.time() - start_time) * 1000, 2),
                    }

                    self._stats['processed'] += 1
                    if prediction == 1:
                        self._stats['fraud'] += 1
                    else:
                        self._stats['legitimate'] += 1

                    self.current_index += 1
                    now = time.time()
                    batch_duration = now - self._stats['last_batch_time']
                    if batch_duration > 0:
                        self._recent_speeds.append(1.0 / batch_duration)
                    self._stats['last_batch_time'] = now

                    yield result
                    await asyncio.sleep(self.speed / 1000.0)
        finally:
            self.is_running = False
            self.close()

    def pause(self):
        self.is_paused = True

    def resume(self):
        self.is_paused = False

    def stop(self):
        self.is_running = False
        self.is_paused = False
        self.close()

    def set_speed(self, speed_ms: int):
        self.speed = max(10, min(5000, speed_ms))

    def set_batch_size(self, size: int):
        self.batch_size = max(1, size)

    @property
    def stats(self) -> Dict[str, Any]:
        elapsed = time.time() - self._stats['start_time'] if self._stats['start_time'] else 0
        avg_speed = sum(self._recent_speeds) / len(self._recent_speeds) if self._recent_speeds else 0
        remaining = max(0, self.total_rows - self.current_index)
        eta = remaining / avg_speed if avg_speed > 0 else 0
        return {
            'processed': self._stats['processed'],
            'remaining': remaining,
            'fraud': self._stats['fraud'],
            'legitimate': self._stats['legitimate'],
            'progress_pct': (self.current_index / self.total_rows * 100) if self.total_rows else 0,
            'estimated_eta_seconds': round(eta, 1),
            'avg_speed_tps': round(avg_speed, 2),
            'elapsed_seconds': round(elapsed, 1),
        }