/**
 * One-time script to generate registration IDs for existing users in Firebase
 * 
 * Run this script with: node scripts/updateUserRegistrationIds.js
 * 
 * Note: This requires the Firebase Admin SDK or you can run it in browser console
 */

// For browser console execution, copy and paste the following code:
const updateUsersInBrowserConsole = `
// Run this in browser console while on your website (logged in as admin)

(async function() {
  // Import Firebase from window (already loaded by your app)
  const { collection, getDocs, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
  
  // Get db from window - your app should have exposed it
  // If not accessible, you'll need to initialize Firebase here
  
  console.log('Fetching all users...');
  
  const usersRef = collection(window.db || firebase.firestore(), 'users');
  const snapshot = await getDocs(usersRef);
  
  let updated = 0;
  let skipped = 0;
  
  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data();
    
    if (userData.registrationId) {
      console.log('Skipping', userData.email, '- already has ID:', userData.registrationId);
      skipped++;
      continue;
    }
    
    // Generate unique registration ID
    const registrationId = 'TA' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    await updateDoc(doc(usersRef, userDoc.id), { registrationId });
    console.log('Updated', userData.email, 'with ID:', registrationId);
    updated++;
    
    // Small delay to ensure unique timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\\n=== COMPLETE ===');
  console.log('Updated:', updated, 'users');
  console.log('Skipped:', skipped, 'users (already had IDs)');
})();
`;

console.log('='.repeat(60));
console.log('FIREBASE USER REGISTRATION ID UPDATE SCRIPT');
console.log('='.repeat(60));
console.log('\nTo update existing users, follow these steps:\n');
console.log('1. Open your website in Chrome');
console.log('2. Login as admin');
console.log('3. Open Developer Tools (F12)');
console.log('4. Go to Console tab');
console.log('5. Copy and paste the code below:\n');
console.log('-'.repeat(60));
console.log(updateUsersInBrowserConsole);
console.log('-'.repeat(60));
console.log('\nAlternatively, you can use this simpler version that works with your app:\n');

const simpleVersion = `
// Simple version - run in browser console on your website

(async function() {
  const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./firebase/firebase.js');
  
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  let updated = 0;
  
  for (const userDoc of snapshot.docs) {
    if (!userDoc.data().registrationId) {
      const registrationId = 'TA' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
      await updateDoc(doc(db, 'users', userDoc.id), { registrationId });
      console.log('Updated:', userDoc.data().email, '->', registrationId);
      updated++;
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  console.log('Done! Updated', updated, 'users');
})();
`;

console.log(simpleVersion);
