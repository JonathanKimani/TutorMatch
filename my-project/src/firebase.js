import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";




const firebaseConfig = {
  apiKey: "AIzaSyCF2dB9b8RQn9Xid2lNm-JaZQnbVR4gPVs",
  authDomain: "studs-tuts.firebaseapp.com",
  projectId: "studs-tuts",
  storageBucket: "studs-tuts.firebasestorage.app",
  messagingSenderId: "148661986286",
  appId: "1:148661986286:web:094b4d84d192c944dea4ff",
  measurementId: "G-TY4VBXC0K3"
};




const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
