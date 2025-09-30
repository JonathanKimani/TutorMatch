import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import HomePage from "./HomePage";
import Login from "./Login";
import Signup from "./Signup";
import Student from "./Student";
import Tutors from "./Tutors";





function App() {
  return (
  <AuthProvider>
  <Router>
 <Routes>
 <Route path="/" element={<HomePage />} />
 <Route path="/login" element={<Login />} />
 <Route path="/signup" element={<Signup />} />
 <Route path="/student" element={<Student />} />
 <Route path="/tutors" element={<Tutors />} />
  </Routes>
  </Router>
  </AuthProvider>
  );}
export default App;
