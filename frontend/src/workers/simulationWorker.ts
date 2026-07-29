// Web Worker for processing transaction chunks without blocking the UI
// Handles CSV parsing, chunk management, and batch processing

interface WorkerMessage {
  type: 'INIT' | 'PROCESS_CHUNK' | 'SET_SPEED' | 'PAUSE' | 'RESUME' | 'STOP';
  payload?: any;
}

let predictions: any[] = [];
let currentIndex = 0;
let speed = 1;
let isPaused = false;
let isRunning = false;
let timerId: number | null = null;

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      predictions = payload.predictions || [];
      currentIndex = 0;
      isPaused = false;
      isRunning = false;
      self.postMessage({ type: 'STATS', payload: { total: predictions.length, remaining: predictions.length } });
      break;

    case 'PROCESS_CHUNK':
      if (!isRunning) {
        isRunning = true;
        isPaused = false;
        processLoop();
      }
      break;

    case 'SET_SPEED':
      speed = payload.speed;
      break;

    case 'PAUSE':
      isPaused = true;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      break;

    case 'RESUME':
      if (isRunning && isPaused) {
        isPaused = false;
        processLoop();
      }
      break;

    case 'STOP':
      isRunning = false;
      isPaused = false;
      currentIndex = 0;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      break;
  }
};

function processLoop() {
  if (!isRunning || isPaused) return;

  const batchSize = Math.max(1, Math.floor(speed));
  const endIdx = Math.min(currentIndex + batchSize, predictions.length);

  if (currentIndex >= predictions.length) {
    self.postMessage({ type: 'COMPLETE', payload: { totalProcessed: predictions.length } });
    isRunning = false;
    return;
  }

  const chunk = predictions.slice(currentIndex, endIdx);
  currentIndex = endIdx;

  self.postMessage({
    type: 'CHUNK_READY',
    payload: {
      transactions: chunk,
      currentIndex,
      total: predictions.length,
      remaining: predictions.length - currentIndex,
      progress: (currentIndex / predictions.length) * 100,
    }
  });

  // Adaptive timing based on speed: at speed 1, 100ms per chunk; at speed 10, 10ms per chunk
  const interval = Math.max(5, 100 / speed);
  timerId = self.setTimeout(() => processLoop(), interval);
}

export {};
