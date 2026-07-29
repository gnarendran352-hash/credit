# Credit Card Fraud Detection Dashboard
## Complete Project Structure & Features

---

## 📁 PROJECT STRUCTURE

```
Credit/
├── backend/
│   ├── app.py                          # FastAPI backend server
│   ├── requirements.txt                # Python dependencies
│   ├── render.yaml                     # Render deployment config
│   └── credit_card_fraud_model.pkl     # Trained ML model
│
├── frontend/
│   ├── public/                         # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── batch/                  # Batch prediction components
│   │   │   │   ├── BatchCharts.tsx           # 8 animated charts
│   │   │   │   ├── BatchSummaryCards.tsx     # Animated metric cards
│   │   │   │   ├── BatchResultsTable.tsx     # Interactive results table
│   │   │   │   ├── CSVPreview.tsx            # CSV file preview
│   │   │   │   ├── ExportButtons.tsx         # Export functionality
│   │   │   │   ├── FileUpload.tsx            # Drag & drop upload
│   │   │   │   └── TransactionDetailsModal.tsx # Transaction details modal
│   │   │   ├── charts/                 # Chart components
│   │   │   ├── layout/                 # Layout components
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── ui/                     # Reusable UI components
│   │   │       ├── GlassCard.tsx           # Glassmorphism card
│   │   │       └── AnimatedBackground.tsx  # Animated background
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx         # Authentication context
│   │   │   └── ThemeContext.tsx        # Theme context
│   │   ├── hooks/
│   │   │   └── useBatchPrediction.ts   # Batch prediction logic
│   │   ├── pages/
│   │   │   ├── BatchPredict.tsx        # Main batch prediction page
│   │   │   ├── Dashboard.tsx           # Dashboard page
│   │   │   ├── Analytics.tsx           # Analytics page
│   │   │   ├── ModelEvaluation.tsx     # Model metrics page
│   │   │   ├── Predict.tsx             # Single prediction page
│   │   │   ├── Landing.tsx             # Landing page
│   │   │   ├── Login.tsx               # Login page
│   │   │   ├── History.tsx             # Prediction history
│   │   │   ├── Reports.tsx             # Reports page
│   │   │   ├── Profile.tsx             # User profile
│   │   │   ├── Settings.tsx            # Settings page
│   │   │   └── NotFound.tsx            # 404 page
│   │   ├── services/
│   │   │   └── api.ts                  # API service layer
│   │   ├── types/
│   │   │   ├── batchTypes.ts           # Batch prediction types
│   │   │   └── index.ts                # General types
│   │   ├── firebase/
│   │   │   └── config.ts               # Firebase configuration
│   │   ├── App.tsx                     # Main app component
│   │   ├── main.tsx                    # Entry point
│   │   └── index.css                   # Global styles
│   ├── firebase.json                   # Firebase config
│   ├── firestore.rules                 # Firestore security rules
│   ├── firestore.indexes.json          # Firestore indexes
│   ├── package.json                    # Dependencies
│   └── vite.config.ts                  # Vite configuration
│
└── README.md
```

---

## 🎯 CORE FEATURES

### 1. CSV Upload & Validation
- **Drag & Drop Zone**: Large animated upload area
- **File Validation**: 
  - CSV format validation
  - File size limit (10MB)
  - Column validation (Time, V1-V28, Amount)
  - Missing required columns detection
- **CSV Preview**:
  - Shows first 10 rows
  - File statistics: total rows, columns, missing values, duplicates
  - Column information table with types and missing counts
  - Class column detection indicator

### 2. Batch Prediction Processing
- **Automatic Class Column Detection**:
  - Case 1: CSV without Class column → Predict all rows
  - Case 2: CSV with Class column → Predict and evaluate accuracy
- **Per-Transaction Predictions**:
  - Prediction (Fraud/Legitimate)
  - Fraud Probability (0-100%)
  - Risk Score (0-100)
  - Risk Level (Low/Medium/High)
  - Confidence Score (65-99%)
  - Top 5 Important Features
  - AI-generated Explanation
- **Performance Metrics** (when Class exists):
  - Accuracy
  - Precision
  - Recall
  - F1 Score
  - ROC AUC
  - Confusion Matrix

### 3. Analytics Dashboard

#### Summary Cards (7-8 animated cards)
1. Total Transactions
2. Fraudulent Count
3. Legitimate Count
4. Average Fraud Probability
5. Highest Risk Score
6. Lowest Risk Score
7. Average Risk Score
8. Processing Time
9. Prediction Accuracy (when Class exists)

#### Charts (8 animated visualizations)
1. **Fraud vs Legitimate** - Pie Chart
2. **Risk Level Distribution** - Horizontal Bar Chart
3. **Fraud Probability Distribution** - Histogram
4. **Top 10 High-Risk Transactions** - Horizontal Bar Chart
5. **Prediction Timeline** - Area Chart (first 50 transactions)
6. **Average Risk Score** - Gauge Chart
7. **Confidence Distribution** - Bar Chart
8. **Amount Distribution** - (available in data)

### 4. Interactive Results Table
- **Columns**: Transaction ID, Amount, Prediction, Fraud Probability, Risk Score, Risk Level, Confidence, Actions
- **Features**:
  - Sortable columns (click headers)
  - Search by Transaction ID, Risk Level, Prediction
  - Filter: All, High Risk, Medium Risk, Low Risk, Fraud, Legitimate
  - Pagination (20 rows per page)
  - High-risk row highlighting
  - View Details button for each transaction

### 5. Transaction Details Modal
- **Prediction Result Card**:
  - Risk level badge
  - Prediction status with icon
  - Confidence, probability, risk score
  - Transaction amount
- **Top Important Features**:
  - Feature names with importance bars
  - Percentage values
- **AI Explanation**:
  - Natural language explanation of prediction
  - Context-aware based on risk level
- **Actual vs Predicted** (when Class exists):
  - Side-by-side comparison
  - Correct/incorrect indicator

### 6. Export Functionality
- **Download CSV**: All predictions with original columns + prediction columns
- **Export High Risk Only**: CSV with only high-risk transactions
- **Download Report**: Text-based summary report

### 7. Firestore Integration
- **Auto-save** batch predictions to Firestore
- **Collection**: `batch_predictions`
- **Saved Data**:
  - User ID
  - File name
  - Upload timestamp
  - Total records
  - Fraud count
  - Average risk score
  - Prediction summary
  - First 100 predictions

### 8. UI/UX Features
- **Glassmorphism Design**: Frosted glass effect cards
- **Animated Backgrounds**: Subtle animated gradients
- **Smooth Animations**: Framer Motion transitions
- **Responsive Design**: Mobile, tablet, desktop
- **Dark Mode**: Premium dark theme with gradients
- **Loading States**: Progress bars, spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback

---

## 🔧 TECHNOLOGY STACK

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations
- **Recharts**: Data visualization
- **Lucide React**: Icons
- **React Hot Toast**: Notifications
- **Firebase**: Authentication & Firestore
- **Vite**: Build tool

### Backend
- **FastAPI**: Web framework
- **Python 3.9+**: Runtime
- **Pandas**: CSV processing
- **NumPy**: Numerical operations
- **Scikit-learn**: ML metrics
- **Joblib**: Model loading
- **Uvicorn**: ASGI server

### ML/AI
- **Model**: RandomForestClassifier (credit_card_fraud_model.pkl)
- **Features**: 30 features (Time, V1-V28, Amount)
- **Output**: Binary classification with probabilities

---

## 🌐 API ENDPOINTS

### Backend (FastAPI - Port 8000)

#### `POST /batch_predict`
- **Purpose**: Batch prediction on CSV file
- **Input**: Multipart form data with CSV file
- **Output**: JSON with summary and predictions
- **Response Structure**:
  ```json
  {
    "summary": {
      "total_transactions": 2500,
      "fraud_count": 126,
      "legitimate_count": 2374,
      "average_probability": 0.22,
      "average_risk_score": 45.5,
      "highest_risk_score": 98.2,
      "lowest_risk_score": 2.1,
      "processing_time": "2.4 sec",
      "has_class_column": true,
      "accuracy": 99.1,
      "precision": 0.94,
      "recall": 0.85,
      "f1_score": 0.89,
      "roc_auc": 0.98,
      "confusion_matrix": {
        "true_negatives": 56864,
        "false_positives": 12,
        "false_negatives": 42,
        "true_positives": 85
      }
    },
    "predictions": [
      {
        "transaction_id": 1,
        "prediction": "Fraud",
        "fraud_probability": 0.98,
        "risk_score": 98.2,
        "risk_level": "High",
        "confidence": 96.5,
        "amount": 1234.56,
        "time": 123456.0,
        "top_features": [...],
        "explanation": "...",
        "actual_class": 1,
        "is_correct": true
      }
    ]
  }
  ```

#### `POST /predict`
- **Purpose**: Single transaction prediction
- **Input**: JSON with transaction features
- **Output**: Prediction result with explanation

#### `GET /model_metrics`
- **Purpose**: Get model performance metrics
- **Output**: Accuracy, precision, recall, F1, ROC AUC, confusion matrix

#### `GET /feature_importance`
- **Purpose**: Get feature importance rankings
- **Output**: Sorted list of features by importance

#### `GET /health`
- **Purpose**: Health check endpoint
- **Output**: Service status and model availability

---

## 🎨 DESIGN SYSTEM

### Colors
- **Primary**: Blue to Purple gradients
- **Fraud**: Red (#ef4444)
- **Legitimate**: Emerald (#10b981)
- **Warning**: Yellow (#eab308)
- **Background**: Dark (#0a0a1f)
- **Glass**: White with 5-10% opacity

### Typography
- **Headings**: Bold, white
- **Body**: Regular, white/60-80% opacity
- **Small**: Text-xs, white/40% opacity

### Spacing
- **Cards**: p-6 padding
- **Gaps**: gap-4 to gap-6
- **Border Radius**: rounded-2xl to rounded-3xl

### Effects
- **Glassmorphism**: backdrop-blur-xl, bg-white/5, border-white/10
- **Shadows**: shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
- **Gradients**: bg-gradient-to-br from-white/[0.08] to-white/[0.02]

---

## 🚀 DEPLOYMENT

### Frontend
- **Platform**: Firebase Hosting
- **URL**: https://credit-cardii.web.app
- **Build**: Vite production build
- **Deploy**: `firebase deploy --only hosting`

### Backend
- **Platform**: Render (configured in render.yaml)
- **URL**: https://credit-cardii.onrender.com
- **Port**: 8000

### Database
- **Firestore**: Real-time database for predictions
- **Collection**: batch_predictions
- **Security**: Authenticated users only

---

## 📊 DATA FLOW

1. **User uploads CSV** → FileUpload component
2. **Parse & Validate** → parseCSVPreview() in api.ts
3. **Preview displayed** → CSVPreview component
4. **User clicks Predict** → predict() in useBatchPrediction hook
5. **Upload to backend** → POST /batch_predict
6. **Backend processes**:
   - Read CSV with Pandas
   - Detect Class column
   - Run ML model on each row
   - Calculate metrics if Class exists
   - Return predictions
7. **Frontend processes response** → batchPredict() in api.ts
8. **Display results**:
   - BatchSummaryCards (animated counters)
   - BatchCharts (8 visualizations)
   - BatchResultsTable (sortable, filterable)
9. **Save to Firestore** → useBatchPrediction hook
10. **Export options** → ExportButtons component

---

## 🎯 KEY FEATURES HIGHLIGHTS

### ✨ Unique Features
1. **Automatic Class Column Detection**: Works with or without ground truth
2. **Comprehensive Evaluation Metrics**: Full classification metrics when Class exists
3. **AI Explanations**: Natural language explanations for each prediction
4. **Feature Importance**: Top 5 features per transaction
5. **Animated Charts**: 8 beautiful, animated visualizations
6. **Glassmorphism UI**: Modern, premium design
7. **Animated Counters**: Smooth number animations on summary cards
8. **Transaction Details Modal**: Deep dive into individual predictions
9. **Firestore Integration**: Automatic saving of prediction history
10. **Responsive Design**: Works on all device sizes

### 🔒 Security
- Firebase Authentication required
- Firestore security rules enforce user-only access
- CORS configured for specific origins
- Input validation on frontend and backend

### ⚡ Performance
- Frontend: Vite optimized build (456KB gzipped)
- Backend: Async FastAPI endpoints
- Model: Cached after first load
- Charts: Animated with efficient rendering

---

## 📝 USAGE INSTRUCTIONS

1. **Navigate to**: https://credit-cardii.web.app
2. **Login** with Firebase authentication
3. **Go to Batch Predict** page
4. **Upload CSV** with columns: Time, V1-V28, Amount
5. **Review preview** showing file stats
6. **Click Predict Transactions**
7. **View results**:
   - Summary cards with key metrics
   - 8 animated charts
   - Detailed results table
8. **Click View** on any transaction for details
9. **Export** results as CSV or report
10. **Results auto-saved** to Firestore

---

## 🎉 COMPLETED

✅ Full-stack implementation
✅ Backend API with ML model integration
✅ Premium frontend with glassmorphism design
✅ 8 animated charts
✅ Interactive data table
✅ Transaction details modal
✅ CSV export functionality
✅ Firestore integration
✅ Responsive design
✅ Deployed to Firebase Hosting
✅ Production build successful