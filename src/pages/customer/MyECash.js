import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/myECash.css';

export default function MyECash() {
  const { user, profile } = useAuth();
  const [ecashBalance, setEcashBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCashModal, setShowAddCashModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    fetchECashData();
  }, [user]);

  const fetchECashData = async () => {
    if (!user) return;
    
    try {
      // Fetch eCash balance
      const ecashRef = doc(db, 'ecash', user.uid);
      const ecashDoc = await getDoc(ecashRef);
      
      if (ecashDoc.exists()) {
        const data = ecashDoc.data();
        setEcashBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      } else {
        // Initialize eCash account
        await setDoc(ecashRef, {
          userId: user.uid,
          balance: 0,
          transactions: [],
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching eCash data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCash = async () => {
    const amount = parseFloat(addAmount);
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount < 100) {
      alert('Minimum amount is ₹100');
      return;
    }

    try {
      const ecashRef = doc(db, 'ecash', user.uid);
      const newTransaction = {
        id: Date.now().toString(),
        type: 'credit',
        amount: amount,
        description: 'Money added to wallet',
        date: new Date().toISOString(),
        status: 'completed'
      };

      const ecashDoc = await getDoc(ecashRef);
      const currentTransactions = ecashDoc.data()?.transactions || [];

      await updateDoc(ecashRef, {
        balance: increment(amount),
        transactions: [newTransaction, ...currentTransactions]
      });

      setEcashBalance(prev => prev + amount);
      setTransactions(prev => [newTransaction, ...prev]);
      setShowAddCashModal(false);
      setAddAmount('');
      alert('Money added successfully!');
    } catch (error) {
      console.error('Error adding cash:', error);
      alert('Failed to add money. Please try again.');
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? '💰' : '💸';
  };

  const getTransactionClass = (type) => {
    return type === 'credit' ? 'transaction-credit' : 'transaction-debit';
  };

  if (loading) {
    return <LoadingSpinner size="fullpage" text="Loading your eCash wallet..." overlay />;
  }

  return (
    <div className="my-ecash-container">
      <div className="ecash-header">
        <div className="ecash-header-background">
          <div className="ecash-blob ecash-blob-1"></div>
          <div className="ecash-blob ecash-blob-2"></div>
          <div className="ecash-icon-deco"></div>
        </div>
        <div className="header-content ecash-header-content">
          <div className="ecash-icon-badge">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="ecash-header-text">
            <h1 className="page-title">My eCash</h1>
            <p className="page-subtitle">Your digital wallet for seamless payments</p>
          </div>
        </div>
      </div>

      <div className="ecash-content">
        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-header">
            <div className="balance-icon">💳</div>
            <h2>Total Balance</h2>
          </div>
          <div className="balance-amount">₹{ecashBalance.toLocaleString()}</div>
          <div className="balance-actions">
            <button className="btn-add-cash" onClick={() => setShowAddCashModal(true)}>
              + Add Money
            </button>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="benefits-card">
          <h3>🎁 eCash Benefits</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <div>
                <h4>Instant Payments</h4>
                <p>Quick checkout with eCash</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎯</span>
              <div>
                <h4>Exclusive Offers</h4>
                <p>Get special discounts</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <div>
                <h4>100% Secure</h4>
                <p>Safe and encrypted</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💸</span>
              <div>
                <h4>Easy Refunds</h4>
                <p>Direct to wallet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="transactions-section">
          <h2 className="section-title">Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <div className="no-transactions-icon">📝</div>
              <h3>No transactions yet</h3>
              <p>Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className={`transaction-item ${getTransactionClass(transaction.type)}`}>
                  <div className="transaction-icon">{getTransactionIcon(transaction.type)}</div>
                  <div className="transaction-details">
                    <h4 className="transaction-description">{transaction.description}</h4>
                    <p className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="transaction-amount">
                    <span className={transaction.type === 'credit' ? 'amount-credit' : 'amount-debit'}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </span>
                    <span className="transaction-status">{transaction.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Cash Modal */}
      {showAddCashModal && (
        <div className="modal-overlay" onClick={() => setShowAddCashModal(false)}>
          <div className="ecash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Money to Wallet</h2>
              <button className="close-btn" onClick={() => setShowAddCashModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="current-balance-info">
                <span>Current Balance:</span>
                <span className="balance-value">₹{ecashBalance.toLocaleString()}</span>
              </div>

              <div className="form-group">
                <label>Enter Amount *</label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter amount (Min: ₹100)"
                    min="100"
                  />
                </div>
              </div>

              <div className="quick-amounts">
                <p className="quick-label">Quick Add:</p>
                <div className="quick-buttons">
                  <button onClick={() => setAddAmount('500')}>₹500</button>
                  <button onClick={() => setAddAmount('1000')}>₹1000</button>
                  <button onClick={() => setAddAmount('2000')}>₹2000</button>
                  <button onClick={() => setAddAmount('5000')}>₹5000</button>
                </div>
              </div>

              <div className="payment-note">
                <p>💳 Payment will be processed securely through our payment gateway</p>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowAddCashModal(false)}>Cancel</button>
                <button className="btn-proceed" onClick={handleAddCash}>Proceed to Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
