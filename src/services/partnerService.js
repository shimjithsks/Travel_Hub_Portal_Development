import { db } from '../firebase/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { sendPasswordResetEmail as sendPasswordResetEmailService, sendPasswordChangedEmail } from './emailService';

const PARTNERS_COLLECTION = 'partners';

// Convert file to Base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    
    // Check file size (limit to 500KB for Firestore)
    if (file.size > 500 * 1024) {
      console.warn('File too large for Base64 storage, skipping:', file.name);
      resolve(null);
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => {
      console.error('Error converting file to Base64:', error);
      resolve(null);
    };
  });
};

// Register a new partner
export const registerPartner = async (partnerData, files = {}) => {
  if (!db) {
    throw new Error('Database not configured. Please set up Firebase.');
  }

  try {
    // Check if email already exists
    const existingPartner = await getPartnerByEmail(partnerData.email);
    if (existingPartner) {
      throw new Error('A partner with this email is already registered. Please use a different email or login to your existing account.');
    }

    // Check if mobile number already exists
    const mobileQuery = query(collection(db, PARTNERS_COLLECTION), where('mobile', '==', partnerData.mobile));
    const mobileSnapshot = await getDocs(mobileQuery);
    if (!mobileSnapshot.empty) {
      throw new Error('A partner with this mobile number is already registered. Please use a different mobile number.');
    }

    // Check if PAN number already exists
    const panQuery = query(collection(db, PARTNERS_COLLECTION), where('panNumber', '==', partnerData.panNumber));
    const panSnapshot = await getDocs(panQuery);
    if (!panSnapshot.empty) {
      throw new Error('A partner with this PAN number is already registered.');
    }

    // Convert files to Base64 (optional - won't fail registration)
    let addressProofBase64 = null;
    let panCardBase64 = null;
    
    try {
      if (files.addressProofScan) {
        addressProofBase64 = await fileToBase64(files.addressProofScan);
      }
      
      if (files.panCardScan) {
        panCardBase64 = await fileToBase64(files.panCardScan);
      }
    } catch (fileError) {
      console.error('File upload failed, continuing without files:', fileError);
    }

    // Prepare partner document
    const partnerDoc = {
      // Company Info
      companyName: partnerData.companyName,
      address1: partnerData.address1,
      address2: partnerData.address2 || '',
      city: partnerData.city,
      state: partnerData.state,
      country: partnerData.country,
      pincode: partnerData.pincode,
      
      // Contact Person
      title: partnerData.title,
      contactFirstName: partnerData.contactFirstName,
      contactLastName: partnerData.contactLastName,
      email: partnerData.email,
      mobile: partnerData.mobile,
      landline: partnerData.landline || '',
      
      // Business Info
      referredBy: partnerData.referredBy || '',
      monthlySalesVolume: partnerData.monthlySalesVolume,
      iata: partnerData.iata || '',
      
      // Documents (stored as Base64)
      addressProofType: partnerData.addressProofType || '',
      addressProofData: addressProofBase64,
      panNumber: partnerData.panNumber,
      panCardHolderName: partnerData.panCardHolderName,
      panCardData: panCardBase64,
      
      // Status & Metadata
      status: 'pending', // pending, approved, rejected, suspended
      termsAccepted: partnerData.termsAccepted,
      registrationDate: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      
      // For future use
      partnerId: null, // Will be set after approval
      approvedBy: null,
      approvalDate: null,
      rejectionReason: null,
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, PARTNERS_COLLECTION), partnerDoc);
    
    console.log('Partner registered successfully with ID:', docRef.id);
    
    return {
      success: true,
      id: docRef.id,
      message: 'Partner registration submitted successfully!'
    };
  } catch (error) {
    console.error('Error registering partner:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(error.message || 'Failed to register partner. Please try again.');
  }
};

// Get all partners (for admin)
export const getAllPartners = async () => {
  if (!db) return [];
  
  try {
    const q = query(collection(db, PARTNERS_COLLECTION), orderBy('registrationDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
};

// Get partner by ID
export const getPartnerById = async (partnerId) => {
  if (!db) return null;
  
  try {
    const docRef = doc(db, PARTNERS_COLLECTION, partnerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching partner:', error);
    return null;
  }
};

// Get partner by email
export const getPartnerByEmail = async (email) => {
  if (!db) return null;
  
  try {
    const q = query(collection(db, PARTNERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching partner by email:', error);
    return null;
  }
};

// Update partner status (for admin)
export const updatePartnerStatus = async (partnerId, status, additionalData = {}) => {
  if (!db) return { success: false };
  
  try {
    const docRef = doc(db, PARTNERS_COLLECTION, partnerId);
    await updateDoc(docRef, {
      status,
      lastUpdated: serverTimestamp(),
      ...additionalData
    });
    return { success: true, ...additionalData };
  } catch (error) {
    console.error('Error updating partner status:', error);
    return { success: false };
  }
};

// Approve partner
export const approvePartner = async (partnerId, approvedBy) => {
  const partnerIdCode = `TA${Date.now().toString().slice(-8)}`;
  const result = await updatePartnerStatus(partnerId, 'approved', {
    partnerId: partnerIdCode,
    approvedBy,
    approvalDate: serverTimestamp()
  });
  
  if (result.success) {
    return { success: true, partnerId: partnerIdCode };
  }
  return { success: false };
};

// Reject partner
export const rejectPartner = async (partnerId, reason) => {
  const result = await updatePartnerStatus(partnerId, 'rejected', {
    rejectionReason: reason
  });
  return result.success;
};

// Delete partner (for admin)
export const deletePartner = async (partnerId) => {
  if (!db) return false;
  
  try {
    await deleteDoc(doc(db, PARTNERS_COLLECTION, partnerId));
    return true;
  } catch (error) {
    console.error('Error deleting partner:', error);
    return false;
  }
};

// Get partners by status
export const getPartnersByStatus = async (status) => {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, PARTNERS_COLLECTION), 
      where('status', '==', status),
      orderBy('registrationDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching partners by status:', error);
    return [];
  }
};

// Partner Authentication - Login with email and password
export const loginPartner = async (email, password) => {
  if (!db) {
    throw new Error('Database not configured.');
  }

  try {
    const partner = await getPartnerByEmail(email);
    
    if (!partner) {
      throw new Error('No partner account found with this email.');
    }

    if (partner.status === 'pending') {
      throw new Error('Your account is pending approval. Please wait for admin verification.');
    }

    if (partner.status === 'rejected') {
      throw new Error('Your partner application was rejected. Please contact support for more information.');
    }

    if (partner.status === 'suspended') {
      throw new Error('Your account has been suspended. Please contact support.');
    }

    // Check password (stored as hash in production, plain text for demo)
    if (!partner.password) {
      throw new Error('Password not set. Please use the "Set Password" link sent to your email.');
    }

    if (partner.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    // Update last login
    const docRef = doc(db, PARTNERS_COLLECTION, partner.id);
    await updateDoc(docRef, {
      lastLogin: serverTimestamp()
    });

    return {
      success: true,
      partner: {
        id: partner.id,
        partnerId: partner.partnerId,
        companyName: partner.companyName,
        email: partner.email,
        contactFirstName: partner.contactFirstName,
        contactLastName: partner.contactLastName,
        status: partner.status
      }
    };
  } catch (error) {
    console.error('Partner login error:', error);
    throw error;
  }
};

// Set partner password (after approval)
export const setPartnerPassword = async (email, password, confirmPassword) => {
  if (!db) {
    throw new Error('Database not configured.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  try {
    const partner = await getPartnerByEmail(email);
    
    if (!partner) {
      throw new Error('No partner account found with this email.');
    }

    if (partner.status !== 'approved') {
      throw new Error('Your account is not approved yet.');
    }

    const docRef = doc(db, PARTNERS_COLLECTION, partner.id);
    await updateDoc(docRef, {
      password: password, // In production, hash this!
      passwordSetAt: serverTimestamp(),
      resetToken: null, // Clear reset token after password change
      resetTokenExpiry: null,
      lastUpdated: serverTimestamp()
    });

    // Send password changed confirmation email
    await sendPasswordChangedEmail(partner);
    console.log('Password changed confirmation email sent to:', email);

    return { success: true, message: 'Password set successfully!' };
  } catch (error) {
    console.error('Set password error:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email) => {
  if (!db) {
    throw new Error('Database not configured.');
  }

  try {
    const partner = await getPartnerByEmail(email);
    
    if (!partner) {
      throw new Error('No partner account found with this email address.');
    }

    if (partner.status === 'pending') {
      throw new Error('Your account is pending approval. Password reset is not available yet.');
    }

    if (partner.status === 'rejected') {
      throw new Error('Your partner application was rejected. Please contact support.');
    }

    if (partner.status === 'suspended') {
      throw new Error('Your account has been suspended. Please contact support.');
    }

    // Generate a reset token (in production, use secure random token)
    const resetToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in partner document
    const docRef = doc(db, PARTNERS_COLLECTION, partner.id);
    await updateDoc(docRef, {
      resetToken: resetToken,
      resetTokenExpiry: resetTokenExpiry,
      lastUpdated: serverTimestamp()
    });

    // Send password reset email
    await sendPasswordResetEmailService(partner, resetToken);
    console.log('Password reset email sent to:', email);

    return { 
      success: true, 
      message: 'Password reset email sent successfully!' 
    };
  } catch (error) {
    console.error('Send password reset email error:', error);
    throw error;
  }
};

// Update partner profile
export const updatePartnerProfile = async (partnerId, profileData) => {
  if (!db) return false;
  
  try {
    const docRef = doc(db, PARTNERS_COLLECTION, partnerId);
    await updateDoc(docRef, {
      ...profileData,
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating partner profile:', error);
    return false;
  }
};

// Get partner bookings (placeholder - will be implemented with bookings collection)
export const getPartnerBookings = async (partnerId) => {
  // Placeholder - return mock data for now
  return [
    {
      id: 'BK001',
      customerName: 'Rahul Sharma',
      destination: 'Goa Beach Resort',
      date: '2026-01-15',
      amount: 45000,
      commission: 2250,
      status: 'confirmed'
    },
    {
      id: 'BK002',
      customerName: 'Priya Patel',
      destination: 'Kerala Backwaters',
      date: '2026-01-20',
      amount: 62000,
      commission: 3100,
      status: 'confirmed'
    },
    {
      id: 'BK003',
      customerName: 'Amit Kumar',
      destination: 'Rajasthan Heritage Tour',
      date: '2026-02-05',
      amount: 85000,
      commission: 4250,
      status: 'pending'
    }
  ];
};

// Get partner commission stats
export const getPartnerCommissionStats = async (partnerId) => {
  // Placeholder - return mock data for now
  return {
    totalEarnings: 45600,
    pendingCommission: 4250,
    paidCommission: 41350,
    totalBookings: 15,
    thisMonthBookings: 3,
    thisMonthEarnings: 9600
  };
};
