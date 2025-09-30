import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Tutors() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    subjects: [],
    description: '',
    pricePerLesson: '',
    lessonDuration: '',
    profilePicture: ''
  });
  const navigate = useNavigate();

  const subjects = [
    'French', 'Spanish', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Geography', 'History', 'Economics', 'Business Studies', 'Accounting',
    'Computer Science / ICT', 'Psychology', 'Sociology', 'Art & Design'
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setProfileForm({
            fullName: data.fullName || '',
            subjects: data.subjects ? (typeof data.subjects === 'string' ? [data.subjects] : data.subjects) : [],
            description: data.description || '',
            pricePerLesson: data.pricePerLesson || '',
            lessonDuration: data.lessonDuration || '',
            profilePicture: data.profilePicture || ''
          });
        }
        
        await fetchStudents();
        await fetchBookings();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);


  useEffect(() => {
    if (user?.uid) {
      const interval = setInterval(() => {
        fetchBookings();
      }, 5000); 
      
      return () => clearInterval(interval);
    }
  }, [user?.uid]);

  const fetchStudents = async () => {
    try {
      const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
      const querySnapshot = await getDocs(studentsQuery);
      const studentsList = [];
      querySnapshot.forEach((doc) => {
        studentsList.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      console.log("Fetching bookings for tutor UID:", user?.uid);
      const bookingsQuery = query(collection(db, "bookings"), where("tutorId", "==", user?.uid));
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsList = [];
      querySnapshot.forEach((doc) => {
        console.log("Found booking:", doc.id, doc.data());
        bookingsList.push({ id: doc.id, ...doc.data() });
      });
      console.log("Total bookings found:", bookingsList.length);
      setBookings(bookingsList);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...profileForm,
        subjects: profileForm.subjects.join(', '),
        isProfileComplete: true
      });
      setUserData({ ...userData, ...profileForm, isProfileComplete: true });
      setShowProfileModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSubjectToggle = (subject) => {
    setProfileForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
        updatedAt: new Date()
      });
      await fetchBookings(); 
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const getStudentById = (studentId) => {
    return students.find(student => student.id === studentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">Tutor<span className='text-blue-400'>Match</span></div>
            </div>

            <nav className="flex space-x-8 text-gray-600 font-medium">
              <span className="text-blue-600 cursor-pointer">Dashboard</span>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-600 transition-colors"
              >
                {userData?.fullName ? userData.fullName.split(' ').map(n => n[0]).join('') : 'T'}
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium px-4 py-1.5 rounded-3xl bg-gray-100/10 hover:bg-gray-100/20 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {!userData?.isProfileComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Complete your profile to start receiving students
                </h3>
                <div className="mt-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
               
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{userData?.totalStudents || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
               
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{userData?.rating || '4.8'}/5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
              
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Lessons Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{userData?.lessonsCompleted || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {userData?.isProfileComplete && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                {userData?.fullName ? userData.fullName.split(' ').map(n => n[0]).join('') : 'T'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{userData?.fullName}</h3>
                <p className="text-gray-600">${userData?.pricePerLesson}/lesson • {userData?.lessonDuration}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subjects Taught</label>
                <p className="mt-1 text-gray-900">{userData?.subjects}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-900">{userData?.description}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Booking Requests</h2>
            <button
              onClick={fetchBookings}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No booking requests at the moment.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const student = getStudentById(booking.studentId);
                if (!student) return null;
                
                return (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                          {student.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.fullName}</h3>
                          <p className="text-sm text-gray-600">Grade: {student.grade}</p>
                          <p className="text-sm text-gray-600">Requested on: {new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleBookingStatusUpdate(booking.id, 'accepted')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleBookingStatusUpdate(booking.id, 'declined')}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {booking.status === 'accepted' && (
                          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                            Accepted
                          </span>
                        )}
                        {booking.status === 'declined' && (
                          <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium">
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Complete Your Tutor Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects You Teach</label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileForm.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="mr-2"
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Tell students about your teaching experience and approach..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Lesson ($)</label>
                  <input
                    type="number"
                    value={profileForm.pricePerLesson}
                    onChange={(e) => setProfileForm({...profileForm, pricePerLesson: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Duration</label>
                  <select
                    value={profileForm.lessonDuration}
                    onChange={(e) => setProfileForm({...profileForm, lessonDuration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Duration</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="60 minutes">60 minutes</option>
                    <option value="90 minutes">90 minutes</option>
                    <option value="120 minutes">120 minutes</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL (Optional)</label>
                <input
                  type="url"
                  value={profileForm.profilePicture}
                  onChange={(e) => setProfileForm({...profileForm, profilePicture: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tutors;