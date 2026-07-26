import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import FileUpload from '../components/batch/FileUpload';
import CSVPreview from '../components/batch/CSVPreview';
import BatchSummaryCards from '../components/batch/BatchSummaryCards';
import BatchResultsTable from '../components/batch/BatchResultsTable';
import BatchCharts from '../components/batch/BatchCharts';
import ExportButtons from '../components/batch/ExportButtons';
import useBatchPrediction from '../hooks/useBatchPrediction';

const BatchPredict: React.FC = () => {
  const { user } = useAuth();
  const { state, setFile, clearFile, predict, getResultFull } = useBatchPrediction(user?.uid);

  const {
    file,
    csvPreview,
    summary,
    loading,
    progress,
    error,
  } = state;

  const hasClassColumn = csvPreview?.hasClassColumn ?? false;
  const accuracy = summary?.accuracy;

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        // Error will be cleared on next action
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleClear = () => {
    clearFile();
  };

  const handlePredict = async () => {
    await predict();
  };

  const handleRetry = () => {
    clearFile();
  };

  const resultFull = getResultFull();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">Batch Prediction</h1>
        <p className="text-white/40 mt-1">
          Upload a CSV file with credit card transactions for bulk fraud prediction
        </p>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-400">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-500/30 transition-all"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Upload Section */}
      {!resultFull && (
        <GlassCard gradient>
          <h2 className="text-xl font-semibold text-white mb-4">Upload CSV File</h2>
          <FileUpload
            onFileSelected={handleFileSelected}
            onClear={handleClear}
            file={file}
            loading={loading}
          />

          {/* Predict Button */}
          {file && csvPreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              {!csvPreview.isValid && (
                <div className="mb-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  CSV has validation errors. You can still proceed, but results may be incomplete.
                </div>
              )}
              <button
                onClick={handlePredict}
                disabled={loading || !csvPreview.isValid}
                className={`
                  w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3
                  ${loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : csvPreview.isValid
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/25'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing... {Math.round(progress)}%</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Predict Transactions</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </GlassCard>
      )}

      {/* CSV Preview */}
      {csvPreview && !resultFull && (
        <CSVPreview data={csvPreview} />
      )}

      {/* Loading Progress */}
      {loading && (
        <GlassCard gradient>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Processing Predictions</h3>
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-sm text-white/40">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Sending file to backend API...</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Results Section */}
      {resultFull && (
        <AnimatePresence mode="wait">
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Summary Cards */}
            <BatchSummaryCards
              summary={resultFull.summary}
              hasClassColumn={hasClassColumn}
              accuracy={accuracy}
            />

            {/* Warning Banner if fraud detected */}
            {resultFull.summary.fraud_count > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-400 text-lg">
                      {resultFull.summary.fraud_count} Fraudulent Transactions Detected
                    </p>
                    <p className="text-sm text-red-300">
                      {resultFull.predictions.filter(p => p.risk_level === 'High').length} high-risk transactions require immediate review.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Animation if no fraud */}
            {resultFull.summary.fraud_count === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-6xl mb-2"
                >
                  🎉
                </motion.div>
                <h3 className="text-xl font-bold text-emerald-400 mb-1">
                  No Fraud Detected!
                </h3>
                <p className="text-emerald-300">
                  All {resultFull.summary.total_transactions} transactions are legitimate.
                </p>
              </motion.div>
            )}

            {/* Charts */}
            <BatchCharts predictions={resultFull.predictions} />

            {/* Results Table */}
            <BatchResultsTable
              predictions={resultFull.predictions}
              hasClassColumn={hasClassColumn}
            />

            {/* Export Buttons */}
            <GlassCard gradient>
              <h3 className="text-lg font-semibold text-white mb-4">Export Results</h3>
              <ExportButtons
                predictions={resultFull.predictions}
                summary={resultFull.summary}
                fileName={file?.name || 'batch_predictions'}
              />
            </GlassCard>

            {/* New Prediction Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              New Batch Prediction
            </motion.button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default BatchPredict;
