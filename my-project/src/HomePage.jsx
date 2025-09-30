import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {const [currentView, setCurrentView] = useState('home'); const [selectedRole, setSelectedRole] = useState(null);const navigate = useNavigate();const [studentForm, setStudentForm] = useState({fullName: '',email: '',password: '',grade: '',availability: ''});const [tutorForm, setTutorForm] = useState({fullName: '',email: '',password: '',subjects: '',gradeLevel: '',experience: '',availability: ''});const [isLoading, setIsLoading] = useState(false);  const [error, setError] = useState('');const [success, setSuccess] = useState('');
const handleAuthClick = (action) => {if (action === 'login') {  navigate('/login');} else {  setCurrentView('roleSelection'); }};
const handleRoleSelect = (role) => {setSelectedRole(role);setCurrentView(role === 'student' ? 'studentForm' : 'tutorForm'); };
const handleStudentInputChange = (e) => {setStudentForm({...studentForm,[e.target.name]: e.target.value});};
const handleTutorInputChange = (e) => { setTutorForm({ ...tutorForm,[e.target.name]: e.target.value}); };
const handleStudentSubmit = async () => {setIsLoading(true);setError('');  try { if (!studentForm.fullName || !studentForm.email || !studentForm.password || !studentForm.grade || !studentForm.availability) { setError('Please fill in all required fields'); setIsLoading(false); return; }if (studentForm.password.length < 6) { setError('Password must be at least 6 characters long'); setIsLoading(false); return;}const userCredential = await createUserWithEmailAndPassword(auth, studentForm.email, studentForm.password);const user = userCredential.user;
await setDoc(doc(db, "users", user.uid), { fullName: studentForm.fullName, email: studentForm.email, grade: studentForm.grade, availability: studentForm.availability, role: 'student', createdAt: new Date(),});
 console.log('Student registered successfully!'); setSuccess('Account created successfully! Redirecting...'); setTimeout(() => {   navigate('/student'); }, 1500); } catch (error) {   console.error('Error registering student:', error.message);   setError(error.message); } finally {   setIsLoading(false); }
  };

  const handleTutorSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!tutorForm.fullName || !tutorForm.email || !tutorForm.password || !tutorForm.subjects || !tutorForm.gradeLevel || !tutorForm.availability) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (tutorForm.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, tutorForm.email, tutorForm.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName: tutorForm.fullName,
        email: tutorForm.email,
        subjects: tutorForm.subjects,
        gradeLevel: tutorForm.gradeLevel,
        experience: tutorForm.experience,
        availability: tutorForm.availability,
        role: 'tutor',
        createdAt: new Date(),
      });

      console.log('Tutor registered successfully!');
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/tutors');
      }, 1500);
    } catch (error) {
      console.error('Error registering tutor:', error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (currentView === 'studentForm' || currentView === 'tutorForm') {
      setCurrentView('roleSelection');
    } else if (currentView === 'roleSelection') {
      setCurrentView('home');
    }
  };

  if (currentView === 'home') {




 return (
   <div className="relative bg-gray-900 min-h-screen ">
 <div className="absolute inset-0">
   <img
     className="w-full h-full object-cover"
     src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
     alt="Background"
   />
   <div className="absolute inset-0 bg-gray-900/70 mix-blend-multiply" />
 </div>
 <div className="relative px-6 py-3 flex items-center justify-between">
   <div className="flex items-center">
     <div className="text-white text-2xl font-bold">Tutor<span className='text-blue-400'>Match</span></div>
   </div>
   <nav className="flex space-x-8 text-white font-medium">
     <a href="#" className="hover:text-blue-400 cursor-pointer"></a>
     <a href="#" className="hover:text-blue-400 cursor-pointer"></a>
   </nav>
   <div>
     <button 
       onClick={() => handleAuthClick('login')}
       className="text-white hover:text-blue-400 font-medium px-4 py-1.5 rounded-3xl bg-gray-100/10 hover:bg-gray-100/20 transition-colors cursor-pointer"
     >
       Log in
     </button>
   </div>
 </div>
 <div className="relative px-5 py-21 text-center max-w-3xl mx-auto">
   <div className="mb-6 inline-block bg-gray-800/60 rounded-full px-4 py-2 text-sm text-gray-300">
     Over 10,000 successful matches made this month!
   </div>
   <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
     Find your perfect tutor match!
   </h1>
   <p className="text-lg text-gray-300 mb-8">
     Connect with expert tutors who understand your learning style. From math and science to languages and test prep - achieve your academic goals with personalized one-on-one guidance.
   </p>
   <div className="flex justify-center space-x-4 flex-wrap gap-4">
     <button
       onClick={() => handleAuthClick('student')}
       className="px-6 py-3 rounded-3xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors cursor-pointer"
     >
       Get A Tutor
     </button>
     <button
       onClick={() => handleAuthClick('tutor')}
       className="px-6 py-3 rounded-3xl bg-gray-100/10 text-white font-medium hover:bg-gray-100/20 transition-colors cursor-pointer"
     >
       Become A Tutor
     </button>
   </div>
 </div>
   </div>
 );
  }

  if (currentView === 'roleSelection') {
 return (
   <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
<div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
  <button 
    onClick={goBack}
    className="mb-4 text-gray-600 hover:text-gray-800 flex items-center"
  >
    ← Back
  </button>
  
  <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Choose Your Role</h2>
  <p className="text-gray-600 mb-8 text-center">Select how you'd like to use TutorMatch</p>
  
  <div className="space-y-4">
    <button
      onClick={() => handleRoleSelect('student')}
      className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
    >
      <div className="text-4xl mb-3"></div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer">I'm a Student</h3>
      <p className="text-gray-600">Looking for tutoring help to improve my grades</p>
    </button>
    
    <button
      onClick={() => handleRoleSelect('tutor')}
      className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
    >
      <div className="text-4xl mb-3"></div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer">I'm a Tutor</h3>
      <p className="text-gray-600">Ready to share my knowledge and help students succeed</p>
    </button>
  </div>
</div>
   </div>
 );
  }

  if (currentView === 'studentForm') {
 return (
   <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
     <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
  <button 
    onClick={goBack}
    className="mb-4 text-gray-600 hover:text-gray-800 flex items-center cursor-pointer"
  >
    ← Back
  </button>
  
  <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Student Registration</h2>
  <p className="text-gray-600 mb-6 text-center">Create your student account</p>
  
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
      <input
        type="text"
        name="fullName"
        value={studentForm.fullName}
        onChange={handleStudentInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        type="email"
        name="email"
        value={studentForm.email}
        onChange={handleStudentInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <input
        type="password"
        name="password"
        value={studentForm.password}
        onChange={handleStudentInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Level</label>
      <select
        name="grade"
        value={studentForm.grade}
        onChange={handleStudentInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Grade Level</option>
        <option value="elementary">Elementary (K-5)</option>
        <option value="middle">Middle School (6-8)</option>
        <option value="high">High School (9-12)</option>
        <option value="college">College</option>
        <option value="graduate">Graduate School</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
      <select
        name="availability"
        value={studentForm.availability}
        onChange={handleStudentInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Availability</option>
        <option value="weekday-morning">Weekday Mornings</option>
        <option value="weekday-afternoon">Weekday Afternoons</option>
        <option value="weekday-evening">Weekday Evenings</option>
        <option value="weekend">Weekends</option>
        <option value="flexible">Flexible</option>
      </select>
    </div>
    
    {error && (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    )}
    
    {success && (
      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
        {success}
      </div>
    )}
    
    <button
      onClick={handleStudentSubmit}
      disabled={isLoading}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Creating Account..." : "Create Student Account"}
    </button>
  </div>
     </div>
   </div>
 );
  }

  if (currentView === 'tutorForm') {
    return (
   <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
     <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
       <button 
   onClick={goBack}
   className="mb-4 text-gray-600 hover:text-gray-800 flex items-center cursor-pointer" 
 >
   ← Back
 </button>
 
 <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Tutor Registration</h2>
 <p className="text-gray-600 mb-6 text-center cursor-pointer" >Create your tutor profile</p>
 
 <div className="space-y-4">
   <div>
     <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
     <input
       type="text"
       name="fullName"
       value={tutorForm.fullName}
       onChange={handleTutorInputChange}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
       required
     />
   </div>
   
   <div>
     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
     <input
       type="email"
       name="email"
       value={tutorForm.email}
       onChange={handleTutorInputChange}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
       required
     />
   </div>
   
   <div>
     <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
     <input
       type="password"
       name="password"
       value={tutorForm.password}
       onChange={handleTutorInputChange}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
       required
     />
   </div>
   
   <div>
     <label className="block text-sm font-medium text-gray-700 mb-1">Subjects You Can Teach</label>
     <input
       type="text"
       name="subjects"
       value={tutorForm.subjects}
       onChange={handleTutorInputChange}
       placeholder="e.g., Math, Science, English"
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
       required
     />
   </div>
   
   <div>
     <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level You Can Teach</label>
     <select
       name="gradeLevel"
       value={tutorForm.gradeLevel}
       onChange={handleTutorInputChange}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
       required
     >
       <option value="">Select Grade Level</option>
       <option value="elementary">Elementary (K-5)</option>
       <option value="middle">Middle School (6-8)</option>
       <option value="high">High School (9-12)</option>
       <option value="college">College</option>
       <option value="all">All Levels</option>
     </select>
   </div>
   
   <div>
     <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Experience (Optional)</label>
     <textarea
       name="experience"
       value={tutorForm.experience}
       onChange={handleTutorInputChange}
       placeholder="Briefly describe your teaching background..."
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
     />
   </div>
   
   <div>
     <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
     <select
       name="availability"
       value={tutorForm.availability}
       onChange={handleTutorInputChange}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
       required
     >
       <option value="">Select Availability</option>
       <option value="weekday-morning">Weekday Mornings</option>
       <option value="weekday-afternoon">Weekday Afternoons</option>
       <option value="weekday-evening">Weekday Evenings</option>
       <option value="weekend">Weekends</option>
       <option value="flexible">Flexible</option>
     </select>
   </div>
   
   {error && (
     <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
       {error}
     </div>
   )}
   
   {success && (
     <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
       {success}
     </div>
   )}
   
   <button
     onClick={handleTutorSubmit}
     disabled={isLoading}
     className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
   >
     {isLoading ? "Creating Account..." : "Create Tutor Account"}
         </button>
       </div>
     </div>
   </div>
    );
  }
};

export default HomePage;