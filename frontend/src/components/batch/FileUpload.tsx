import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import type { CSVPreviewData } from '../../types/batchTypes';
import { parseCSVPreview } from '../../services/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelected: (file: File, preview: CSVPreviewData) => void;
  onClear: () => void;
  file: File | null;
  loading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected, onClear, file, loading }) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndProcess = useCallback(async (selectedFile: File) => {
    setError(null);

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are allowed');
      toast.error('Only .csv files are allowed');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      toast.error('File size exceeds 10MB limit');
      return;
    }

    try {
      const preview = await parseCSVPreview(selectedFile);
      onFileSelected(selectedFile, preview);
      toast.success(`File loaded: ${selectedFile.name} (${preview.totalRows} rows)`);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file');
      toast.error(err.message || 'Failed to parse CSV file');
    }
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndProcess(droppedFile);
    }
  }, [validateAndProcess]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndProcess(selectedFile);
    }
  }, [validateAndProcess]);

  const handleRemove = useCallback(() => {
    onClear();
    setError(null);
  }, [onClear]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="csv-upload"
        disabled={loading}
      />
      <label htmlFor="csv-upload" className="cursor-pointer">
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
            ${dragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
              : 'border-white/20 hover:border-white/30 hover:bg-white/5'
            }
            ${loading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <AnimatePresence>
            {dragging && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-blue-400 animate-bounce" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!file ? (
            <>
              <motion.div
                animate={{ y: dragging ? -10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Upload CSV File</h3>
                <p className="text-sm text-white/50 mb-4">
                  Drag & drop your CSV file here or click to browse
                </p>
                <p className="text-xs text-white/30">
                  Required columns: Time, Amount, V1-V28
                </p>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium truncate">{file.name}</p>
                <p className="text-sm text-white/40">{formatFileSize(file.size)}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </label>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {file && !loading && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRemove}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
          Remove file
        </motion.button>
      )}
    </div>
  );
};

export default FileUpload;
