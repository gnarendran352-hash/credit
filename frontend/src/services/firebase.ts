import { collection, addDoc, updateDoc, doc, query, orderBy, limit, onSnapshot, serverTimestamp, where, getDoc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { PredictionResult, LivePrediction, Notification, Case, BlockedTransaction } from '../types';

const COLLECTIONS = {
  predictions: 'predictions',
  notifications: 'notifications',
  cases: 'cases',
  blockedTransactions: 'blockedTransactions',
  sessions: 'sessions',
  reports: 'reports',
  analytics: 'analytics',
};

export interface StoredPrediction extends PredictionResult {
  id?: string;
  userId?: string;
  sessionId?: string;
  createdAt?: any;
}

export interface StoredNotification extends Omit<Notification, 'id'> {
  id?: string;
  read: boolean;
  userId?: string;
  createdAt?: any;
}

export interface StoredCase extends Case {
  id?: string;
  transactionId?: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive' | 'closed';
  assignedTo?: string;
  notes: string[];
  createdAt?: any;
  updatedAt?: any;
}

export const firebaseService = {
  // Predictions
  async savePrediction(prediction: StoredPrediction): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.predictions), {
        ...prediction,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving prediction:', error);
      throw error;
    }
  },

  async savePredictionsBatch(predictions: StoredPrediction[]): Promise<void> {
    try {
      const batch = [];
      for (const prediction of predictions) {
        batch.push({
          ...prediction,
          createdAt: serverTimestamp(),
        });
      }
      // Use batched writes for better performance
      const promises = predictions.map(p => addDoc(collection(db, COLLECTIONS.predictions), p));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving predictions batch:', error);
    }
  },

  // Notifications
  async createNotification(notification: Omit<StoredNotification, 'id' | 'createdAt' | 'read'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.notifications), {
        ...notification,
        read: false,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  subscribeToNotifications(callback: (notifications: StoredNotification[]) => void, limitCount: number = 50) {
    const q = query(
      collection(db, COLLECTIONS.notifications),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as StoredNotification[];
      callback(notifications);
    });
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTIONS.notifications),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true, readAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  // Case Management
  async createCase(caseData: Omit<StoredCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.cases), {
        ...caseData,
        status: caseData.status || 'open',
        notes: caseData.notes || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating case:', error);
      throw error;
    }
  },

  async updateCase(caseId: string, updates: Partial<StoredCase>): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.cases, caseId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  },

  async addCaseNote(caseId: string, note: string, userId: string): Promise<void> {
    try {
      const caseRef = doc(db, COLLECTIONS.cases, caseId);
      const caseDoc = await getDoc(caseRef);
      if (!caseDoc.exists()) {
        throw new Error('Case not found');
      }
      const currentNotes = caseDoc.data()?.notes || [];
      await updateDoc(caseRef, {
        notes: [...currentNotes, { text: note, userId, timestamp: serverTimestamp() }],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding case note:', error);
      throw error;
    }
  },

  subscribeToCases(callback: (cases: StoredCase[]) => void) {
    const q = query(collection(db, COLLECTIONS.cases), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const cases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as StoredCase[];
      callback(cases);
    });
  },

  // Blocked Transactions
  async saveBlockedTransaction(transaction: Omit<StoredPrediction, 'id' | 'createdAt'> & { operator?: string }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.blockedTransactions), {
        ...transaction,
        status: 'blocked',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving blocked transaction:', error);
      throw error;
    }
  },

  subscribeToBlockedTransactions(callback: (transactions: BlockedTransaction[]) => void, limitCount: number = 100) {
    const q = query(
      collection(db, COLLECTIONS.blockedTransactions),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as BlockedTransaction[];
      callback(transactions);
    });
  },

  // Analytics
  async saveAnalytics(data: any): Promise<void> {
    try {
      await addDoc(collection(db, COLLECTIONS.analytics), {
        ...data,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  },

  // Sessions
  async createSession(sessionData: { userId?: string; startTime: any }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.sessions), {
        ...sessionData,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async updateSession(sessionId: string, updates: any): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.sessions, sessionId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  },
};

export default firebaseService;