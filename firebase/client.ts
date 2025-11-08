// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";
import { Firestore, getFirestore } from "firebase/firestore";
import { Functions, getFunctions } from "firebase/functions";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_CL_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_CL_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_CL_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_CL_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_CL_APP_ID,
  projectId: process.env.NEXT_PUBLIC_CL_PROJECT_ID,
  measurementId: process.env.NEXT_PUBLIC_CL_MEASUREMENT_ID
};

const currentApps = getApps();
let auth: Auth;
let storage: FirebaseStorage;
let db: Firestore;
let functions: Functions;

if (!currentApps.length) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
  functions = getFunctions(app);
} else {
  const app = currentApps[0];
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
  functions = getFunctions(app);
}

export { auth, storage, db, functions };