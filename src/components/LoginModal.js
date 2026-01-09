import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const { isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  
  // Login states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign up states
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [title, setTitle] = useState('Mr.');
  const [name, setName] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Login with email and password
      await signInWithEmailAndPassword(auth, emailOrPhone, password);
      onClose();
      navigate('/customer');
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
      navigate('/customer');
    } catch (err) {
      setError(err?.message || 'Google sign-in failed');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const fullName = `${title} ${name}`;
      
      if (fullName) {
        await updateProfile(cred.user, { displayName: fullName });
      }

      await setDoc(doc(db, 'users', cred.user.uid), {
        role: 'customer',
        name: fullName,
        email: signupEmail,
        phone: `${countryCode}${phoneNumber}`,
        title,
        createdAt: serverTimestamp(),
        verificationStatus: 'verified',
      });

      onClose();
      navigate('/customer');
    } catch (err) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-body">
          {/* Left Side - Benefits */}
          <div className="modal-left">
            <div className="traveler-illustration">
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop" 
                alt="Travel" 
                className="illustration-img"
              />
            </div>
            <div className="benefits-list">
              <div className="benefit-item">
                <i className="fas fa-percent"></i>
                <span>Save up to 25% on Fleet & Hotel bookings</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-headset"></i>
                <span>24/7 Priority Customer Support access</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-bolt"></i>
                <span>Instant booking confirmations & e-tickets</span>
              </div>
              <p className="and-more">Join 50,000+ happy travelers!</p>
            </div>
          </div>

          {/* Right Side - Login/Signup Form */}
          <div className="modal-right">
            {/* Tab Switcher */}
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setError(''); }}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signup'); setError(''); }}
              >
                Sign Up
              </button>
            </div>

            {error && <div className="alert-danger-modal">{error}</div>}

            {activeTab === 'login' ? (
              <>
                <form onSubmit={handleLogin}>
                  <div className="form-group-modal">
                    <label>Email Id / Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Email Id / Mobile Number"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      required
                      className="modal-input"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="modal-input"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="login-btn-modal"
                    disabled={submitting || !isFirebaseConfigured}
                  >
                    {submitting ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="terms-text">
                  By proceeding, you agree with our{' '}
                  <a href="/terms">Terms of Service</a>,{' '}
                  <a href="/privacy">Privacy Policy</a>
                  {' '}& <a href="/agreement">Master User Agreement</a>.
                </div>

                <div className="divider-or">
                  <span>Or</span>
                </div>

                <button className="google-signin-btn" onClick={handleGoogleSignIn}>
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google"
                    className="google-icon"
                  />
                  Sign in with Google
                </button>
              </>
            ) : (
              <>
                <form onSubmit={handleSignUp}>
                  <div className="form-group-modal">
                    <input
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="modal-input"
                    />
                  </div>

                  <div className="form-group-modal password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter Password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="modal-input"
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>

                  <div className="form-group-modal phone-input-group">
                    <select 
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="country-code-select"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="modal-input phone-input"
                    />
                  </div>

                  <div className="form-group-modal name-input-group">
                    <select 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="title-select"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="modal-input name-input"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="signup-btn-modal"
                    disabled={submitting || !isFirebaseConfigured}
                  >
                    {submitting ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </form>

                <div className="terms-text">
                  By proceeding, you agree with our{' '}
                  <a href="/terms">Terms of Service</a>,{' '}
                  <a href="/privacy">Privacy Policy</a>
                  {' '}& <a href="/agreement">Master User Agreement</a>.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
