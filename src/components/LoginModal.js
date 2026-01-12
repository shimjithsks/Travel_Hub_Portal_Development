import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { sendCustomerPasswordResetEmail, sendCustomerPasswordChangedEmail } from '../services/emailService';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const { isFirebaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  
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
  
  // Profile completion states (for Google sign-in)
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Try normal login first
      await signInWithEmailAndPassword(auth, emailOrPhone, password);
      
      // After successful login, check if password was recently reset
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', emailOrPhone));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          // Check if user had requested a password reset
          if (userData.passwordResetRequested) {
            // Send password changed confirmation email
            await sendCustomerPasswordChangedEmail({
              email: emailOrPhone,
              name: userData.name || userData.fullName || 'Valued Customer'
            });
            
            // Clear the flag and update login time
            await updateDoc(doc(db, 'users', userDoc.id), {
              passwordResetRequested: null,
              passwordResetRequestedAt: null,
              pendingPassword: null,
              lastLogin: serverTimestamp(),
              passwordChangedAt: serverTimestamp()
            });
          } else if (userData.pendingPassword) {
            // Clear pending password if exists (legacy)
            await updateDoc(doc(db, 'users', userDoc.id), {
              pendingPassword: null,
              lastLogin: serverTimestamp()
            });
          }
        }
      } catch (firestoreErr) {
        // Ignore Firestore errors - login was successful
        console.log('Firestore update skipped:', firestoreErr.message);
      }
      
      onClose();
      navigate('/customer');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again or use Forgot Password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up.');
      } else {
        setError(err?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setForgotSubmitting(true);

    try {
      // Get user's name and doc ID from Firestore (if exists)
      let customerName = 'Valued Customer';
      let userDocId = null;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', forgotEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          customerName = userData.name || userData.fullName || 'Valued Customer';
          userDocId = userDoc.id;
          
          // Set flag to track password reset was requested
          await updateDoc(doc(db, 'users', userDocId), {
            passwordResetRequested: true,
            passwordResetRequestedAt: serverTimestamp()
          });
        }
      } catch (e) {
        // Ignore Firestore errors, continue with reset
        console.log('Firestore update skipped:', e.message);
      }

      // Send Firebase's built-in password reset (this is the actual reset link)
      await sendPasswordResetEmail(auth, forgotEmail);
      
      // Also send our beautiful custom notification email
      await sendCustomerPasswordResetEmail({
        email: forgotEmail,
        name: customerName
      });
      
      setForgotSuccess(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err?.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSubmitting(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user already has a complete profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        // Check if profile is complete (has phone number at minimum)
        if (existingData.phone && existingData.phone.length > 5) {
          // Profile is complete, proceed to dashboard
          onClose();
          navigate('/customer');
          return;
        }
      }
      
      // New user or incomplete profile - show profile completion form
      setGoogleUser(user);
      setProfileData({
        fullName: user.displayName || '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });
      setShowProfileCompletion(true);
    } catch (err) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileCompletion = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!googleUser) {
        throw new Error('User session expired. Please try again.');
      }

      // Validate required fields
      if (!profileData.fullName.trim()) {
        throw new Error('Full name is required');
      }
      if (!profileData.phone.trim()) {
        throw new Error('Phone number is required');
      }

      // Save complete profile to Firestore
      await setDoc(doc(db, 'users', googleUser.uid), {
        role: 'customer',
        name: profileData.fullName,
        email: profileData.email,
        phone: `${countryCode}${profileData.phone}`,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        pincode: profileData.pincode,
        photoURL: googleUser.photoURL || '',
        createdAt: serverTimestamp(),
        verificationStatus: 'verified',
        authProvider: 'google'
      });

      // Update display name if different
      if (profileData.fullName !== googleUser.displayName) {
        await updateProfile(googleUser, { displayName: profileData.fullName });
      }

      setShowProfileCompletion(false);
      onClose();
      navigate('/customer');
    } catch (err) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipProfile = async () => {
    // Save minimal profile and proceed
    if (googleUser) {
      try {
        await setDoc(doc(db, 'users', googleUser.uid), {
          role: 'customer',
          name: googleUser.displayName || '',
          email: googleUser.email || '',
          photoURL: googleUser.photoURL || '',
          createdAt: serverTimestamp(),
          verificationStatus: 'verified',
          authProvider: 'google'
        });
      } catch (err) {
        console.error('Error saving minimal profile:', err);
      }
    }
    setShowProfileCompletion(false);
    onClose();
    navigate('/customer');
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
      <div className={`login-modal-content ${showProfileCompletion ? 'profile-completion-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {showProfileCompletion ? (
          /* Profile Completion Form for Google Sign-in */
          <div className="profile-completion-container">
            <div className="profile-completion-header">
              <div className="google-avatar">
                {googleUser?.photoURL ? (
                  <img src={googleUser.photoURL} alt="Profile" />
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
              <h2>Complete Your Profile</h2>
              <p>Welcome! Please provide additional details to enhance your experience.</p>
            </div>

            {error && <div className="alert-danger-modal">{error}</div>}

            <form onSubmit={handleProfileCompletion} className="profile-completion-form">
              <div className="form-row">
                <div className="form-group-modal">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    required
                    className="modal-input"
                  />
                </div>
                <div className="form-group-modal">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    className="modal-input"
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modal phone-input-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <div className="phone-wrapper">
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
                      name="phone"
                      placeholder="Enter your phone number"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      required
                      className="modal-input phone-input"
                    />
                  </div>
                </div>
                <div className="form-group-modal">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleProfileChange}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-modal">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleProfileChange}
                    className="modal-input"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group-modal">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Enter pincode"
                    value={profileData.pincode}
                    onChange={handleProfileChange}
                    className="modal-input"
                    maxLength="6"
                  />
                </div>
              </div>

              <div className="form-group-modal">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter your complete address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  className="modal-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group-modal">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter your city"
                    value={profileData.city}
                    onChange={handleProfileChange}
                    className="modal-input"
                  />
                </div>
                <div className="form-group-modal">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter your state"
                    value={profileData.state}
                    onChange={handleProfileChange}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="profile-completion-actions">
                <button 
                  type="button" 
                  className="skip-btn"
                  onClick={handleSkipProfile}
                >
                  Skip for now
                </button>
                <button 
                  type="submit" 
                  className="save-profile-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </form>
          </div>
        ) : (
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

            {showForgotPassword ? (
              // Forgot Password Form
              <>
                {forgotSuccess ? (
                  <div className="forgot-success">
                    <div className="forgot-success-icon">
                      <i className="fas fa-envelope-open-text"></i>
                    </div>
                    <h3>Check Your Email</h3>
                    <p>We've sent password reset instructions to <strong>{forgotEmail}</strong></p>
                    <div className="forgot-info">
                      <div className="forgot-info-item">
                        <i className="fas fa-clock"></i>
                        <span>The link will expire in 1 hour</span>
                      </div>
                      <div className="forgot-info-item">
                        <i className="fas fa-inbox"></i>
                        <span>Check your spam folder if you don't see the email</span>
                      </div>
                    </div>
                    <button 
                      className="back-to-login-btn"
                      onClick={() => { setShowForgotPassword(false); setForgotSuccess(false); setForgotEmail(''); setError(''); }}
                    >
                      <i className="fas fa-arrow-left"></i> Back to Login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="forgot-header">
                      <i className="fas fa-key"></i>
                      <h3>Forgot Password?</h3>
                      <p>Enter your email and we'll send you a reset link</p>
                    </div>
                    <form onSubmit={handleForgotPassword}>
                      <div className="form-group-modal">
                        <label>Email Address</label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                          className="modal-input"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="login-btn-modal"
                        disabled={forgotSubmitting}
                      >
                        {forgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </form>
                    <button 
                      className="back-to-login-btn"
                      onClick={() => { setShowForgotPassword(false); setError(''); }}
                    >
                      <i className="fas fa-arrow-left"></i> Back to Login
                    </button>
                  </>
                )}
              </>
            ) : activeTab === 'login' ? (
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
                    <div className="password-input-wrapper">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="modal-input"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        autoComplete="current-password"
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="forgot-password-link-modal">
                    <button 
                      type="button" 
                      onClick={() => { setShowForgotPassword(true); setError(''); }}
                    >
                      Forgot Password?
                    </button>
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

                  <div className="form-group-modal">
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="modal-input"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        autoComplete="new-password"
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
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
        )}
      </div>
    </div>
  );
}
