// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'estates-project-82753.firebaseapp.com',
  projectId: 'estates-project-82753',
  storageBucket: 'estates-project-82753.firebasestorage.app',
  messagingSenderId: '356527981853',
  appId: '1:356527981853:web:0d0261b25791ba862f8df4',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
