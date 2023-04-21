// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtYwE_TVyef5KU6vKGMtdh64kb1q9lPIo",
  authDomain: "flappybird-71389.firebaseapp.com",
  projectId: "flappybird-71389",
  storageBucket: "flappybird-71389.appspot.com",
  messagingSenderId: "201426115382",
  appId: "1:201426115382:web:395879a0e3da274df5f197",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
