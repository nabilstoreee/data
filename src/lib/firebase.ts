import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0184221253",
  appId: "1:4119005247:web:df3379e035d7ccfafa508a",
  apiKey: "AIzaSyC9URH_rdEqhpskYoPxIeCTew54KFWQv9A",
  authDomain: "gen-lang-client-0184221253.firebaseapp.com",
  databaseId: "ai-studio-018b1057-1a2f-45f4-9a28-a6deaba744c3", // Uses the custom database ID provisioned
  storageBucket: "gen-lang-client-0184221253.firebasestorage.app",
  messagingSenderId: "4119005247",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app, "ai-studio-018b1057-1a2f-45f4-9a28-a6deaba744c3");
