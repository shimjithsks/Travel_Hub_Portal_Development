import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';

export default function Register() {
  const { user, isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();

  const role = 'customer'; // Fixed role as customer
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });

      await setDoc(doc(db, 'users', cred.user.uid), {
        role,
        name: name || '',
        email,
        createdAt: serverTimestamp(),
        verificationStatus: role === 'operator' ? 'pending' : 'verified',
      });

      if (role === 'operator') {
        await setDoc(doc(db, 'operators', cred.user.uid), {
          operatorId: cred.user.uid,
          name: name || '',
          verificationStatus: 'pending',
          locations: [],
          rating: null,
          fleetCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-6">
          <h2 className="mb-3">Create account</h2>
          {!isFirebaseConfigured ? (
            <div className="alert alert-warning">
              Firebase is not configured. Create a <strong>.env</strong> file using <strong>.env.example</strong> and restart <strong>npm start</strong>.
            </div>
          ) : null}
          {error ? <div className="alert alert-danger">{error}</div> : null}
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm password</label>
              <input className="form-control" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={submitting || !isFirebaseConfigured}>
              {submitting ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <div className="mt-3">
            <span>Already have an account? </span>
            <button 
              type="button"
              onClick={() => setShowLoginModal(true)} 
              style={{ background: 'none', border: 'none', color: '#0d6efd', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
