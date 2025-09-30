import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
const AuthContext = createContext();



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
const unsubscribe = auth.onAuthStateChanged(async (user) => {
  setCurrentUser(user);  if (user) { try {   const userDoc = await getDoc(doc(db, "users", user.uid));   if (userDoc.exists()) {  setUserData(userDoc.data()); } else {     setUserData(null);  } } catch (error) {console.error("Error fetching user data:", error);setUserData(null);   } } else {   setUserData(null); }
  setLoading(false);
});
    return unsubscribe;
  }, []);
  const value = {
    currentUser,
    userData,
    loading
  };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

