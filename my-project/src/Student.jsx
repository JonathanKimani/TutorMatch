import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Student() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    grade: '',
    profilePicture: ''
  });
  const navigate = useNavigate();

  const subjects = [
    'French', 'Spanish', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Geography', 'History', 'Economics', 'Business Studies', 'Accounting',
    'Computer Science / ICT', 'Psychology', 'Sociology', 'Art & Design'
  ];

  const fakeTutors = [
    {
      id: '1',
      name: 'Adriana Saray P.',
      initials: 'AS',
      subjects: ['English'],
      languages: ['English (Native)', 'Spanish (Native)'],
      badges: ['Professional', 'Super Tutor'],
      bio: 'Boost Your English with a UK Qualified Teacher from an international background | Conversational Fluency for British and USA culture. — ¡Hola! Hello! I\'m Adriana.',
      price: 12,
      originalPrice: 24,
      rating: 5,
      reviews: 9,
      students: 18,
      lessons: 364,
      flags: ['Colombia', 'Spain']
    },
    {
      id: '2',
      name: 'Darwin D.',
      initials: 'DD',
      subjects: ['English'],
      languages: ['English (Proficient)', 'Spanish (Native)'],
      badges: ['Professional', 'Super Tutor'],
      bio: 'Professional English Teacher | Certified in Young Learners, Business & Exam Prep — Hello! My name is Darwin, and I\'m an EFL teacher from Chile.',
      price: 15,
      originalPrice: 30,
      rating: 5,
      reviews: 10,
      students: 9,
      lessons: 271,
      flags: ['Chile', 'Spain']
    },
    {
      id: '3',
      name: 'Jonathan Kimani',
      initials: 'JK',
      subjects: ['Mathematics', 'Physics'],
      languages: ['English (Native)'],
      badges: ['Professional', 'Super Tutor'],
      bio: 'Experienced Math and Physics tutor with 5+ years of teaching experience. Specializing in calculus, algebra, and mechanics.',
      price: 20,
      originalPrice: 40,
      rating: 4.9,
      reviews: 15,
      students: 25,
      lessons: 450,
      flags: ['Kenya']
    },
    {
      id: '4',
      name: 'Elen Karugi',
      initials: 'EK',
      subjects: ['French', 'Spanish'],
      languages: ['French (Native)', 'Spanish (Native)', 'English (Fluent)'],
      badges: ['Professional'],
      bio: 'Native French and Spanish speaker with expertise in conversational skills and grammar. Passionate about making language learning fun!',
      price: 18,
      originalPrice: 36,
      rating: 4.8,
      reviews: 12,
      students: 22,
      lessons: 380,
      flags: ['France', 'Spain']
    },
    {
      id: '5',
      name: 'Sarah Johnson',
      initials: 'SJ',
      subjects: ['Chemistry', 'Biology'],
      languages: ['English (Native)'],
      badges: ['Professional', 'Super Tutor'],
      bio: 'PhD in Chemistry with extensive experience in organic chemistry and molecular biology. Helping students understand complex concepts.',
      price: 25,
      originalPrice: 50,
      rating: 5.0,
      reviews: 8,
      students: 12,
      lessons: 200,
      flags: ['USA']
    }
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
            grade: data.grade || '',
            profilePicture: data.profilePicture || ''
          });
        }
        
        await fetchTutors();
        await fetchBookings();
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (currentView === 'dashboard' && user?.uid) {
      fetchBookings();
      
      const interval = setInterval(() => {
        fetchBookings();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [currentView, user?.uid]);

  const fetchTutors = async () => {
    try {
      const tutorsQuery = query(collection(db, "users"), where("role", "==", "tutor"), where("isProfileComplete", "==", true));
      const querySnapshot = await getDocs(tutorsQuery);
      const tutorsList = [];
      querySnapshot.forEach((doc) => {
        console.log("Found tutor:", doc.id, doc.data());
        tutorsList.push({ id: doc.id, ...doc.data() });
      });
      console.log("Total tutors found:", tutorsList.length);
      setTutors(tutorsList);
    } catch (error) {
      console.error("Error fetching tutors:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookingsQuery = query(collection(db, "bookings"), where("studentId", "==", user?.uid));
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsList = [];
      querySnapshot.forEach((doc) => {
        bookingsList.push({ id: doc.id, ...doc.data() });
      });
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
      await updateDoc(doc(db, "users", user.uid), profileForm);
      setUserData({ ...userData, ...profileForm });
      setShowProfileModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleBookTutor = async (tutorId) => {
    try {
      console.log("Creating booking for tutorId:", tutorId);
      console.log("Student ID:", user.uid);
      
      const newBooking = {
        id: Date.now().toString(),
        tutorId,
        studentId: user.uid,
        studentName: userData?.fullName || 'Student',
        status: 'pending',
        date: new Date().toISOString(),
        createdAt: new Date()
      };
      
      console.log("Booking data:", newBooking);
      
      await setDoc(doc(db, "bookings", newBooking.id), newBooking);
      
      console.log("Booking created successfully");
      
      await fetchBookings();
      
      setShowTutorModal(false);
      
      setCurrentView('dashboard');
      
      alert('Booking request sent! Check your dashboard for updates.');
    } catch (error) {
      console.error("Error creating booking:", error);
      alert('Failed to send booking request. Please try again.');
    }
  };

  const getBookingStatus = (tutorId) => {
    const booking = bookings.find(b => b.tutorId === tutorId && b.studentId === user?.uid);
    return booking ? booking.status : null;
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
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`hover:text-blue-400 cursor-pointer ${currentView === 'dashboard' ? 'text-blue-600' : ''}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('find-tutor')}
                className={`hover:text-blue-400 cursor-pointer ${currentView === 'find-tutor' ? 'text-blue-600' : ''}`}
              >
                Find a Tutor
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-blue-600 transition-colors"
              >
                {userData?.fullName ? userData.fullName.split(' ').map(n => n[0]).join('') : 'U'}
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
        {currentView === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {userData?.fullName || 'Student'}!</h2>
              <p className="text-gray-600 mb-2">Grade Level: {userData?.grade || 'Not set'}</p>
              <p className="text-gray-600">Email: {userData?.email || user?.email}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Booking Requests</h2>
                <button
                  onClick={fetchBookings}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Refresh
                </button>
              </div>
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No booking requests yet. Start by finding a tutor!</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const tutor = tutors.find(t => t.id === booking.tutorId);
                    if (!tutor) return null;
                    
                    return (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                              {tutor.fullName ? tutor.fullName.split(' ').map(n => n[0]).join('') : 'T'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{tutor.fullName}</h3>
                              <p className="text-sm text-gray-600">Subjects: {tutor.subjects}</p>
                              <p className="text-sm text-gray-600">Requested on: {new Date(booking.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-4 py-2 rounded-lg font-medium ${
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status === 'pending' ? 'Pending' : 
                               booking.status === 'accepted' ? 'Accepted' : 'Declined'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'find-tutor' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Find a Tutor</h1>
            
            {!selectedSubject ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose a Subject</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
                    >
                      <h3 className="font-medium text-gray-900">{subject}</h3>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-6">
                  <button 
                    onClick={() => setSelectedSubject(null)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    ← Back to Subjects
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">Tutors for {selectedSubject}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tutors.filter(tutor => 
                    tutor.subjects && (
                      typeof tutor.subjects === 'string' 
                        ? tutor.subjects.toLowerCase().includes(selectedSubject.toLowerCase())
                        : tutor.subjects.some(subject => subject.toLowerCase().includes(selectedSubject.toLowerCase()))
                    )
                  ).map((tutor) => {
                    const bookingStatus = getBookingStatus(tutor.id);
                    const initials = tutor.fullName ? tutor.fullName.split(' ').map(n => n[0]).join('') : 'T';
                    return (
                      <div key={tutor.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{tutor.fullName}</h3>
                              <div className="flex space-x-1">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                  Professional
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">ksh{tutor.pricePerLesson || '25'}</div>
                            <div className="text-xs text-gray-600">{tutor.lessonDuration || '60 min'}</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center mb-2">
                            <span className="text-sm text-gray-600 mr-2">Teaching:</span>
                            <span className="text-sm font-medium">{tutor.subjects}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <span className="text-sm text-gray-600 mr-2">Grade Level:</span>
                            <span className="text-sm">{tutor.gradeLevel}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tutor.description || 'Experienced tutor ready to help you succeed!'}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <span className="font-bold mr-1">4.8</span>
                              <span></span>
                              <span className="text-gray-600 ml-1">5 reviews</span>
                            </div>
                            <div>
                              <span className="font-bold">{tutor.totalStudents || 0}</span>
                              <span className="text-gray-600 ml-1">students</span>
                            </div>
                          </div>
                        </div>

                        {bookingStatus ? (
                          <div className="flex space-x-2">
                            <button 
                              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                                bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                bookingStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}
                              disabled
                            >
                              {bookingStatus === 'pending' ? 'Pending' : 
                               bookingStatus === 'accepted' ? 'Accepted' : 'Declined'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedTutor(tutor);
                              setShowTutorModal(true);
                            }}
                            className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                          >
                            Book Trial Lesson
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Level</label>
                <select
                  value={profileForm.grade}
                  onChange={(e) => setProfileForm({...profileForm, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showTutorModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Book Lesson with {selectedTutor.fullName}</h2>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {selectedTutor.fullName ? selectedTutor.fullName.split(' ').map(n => n[0]).join('') : 'T'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedTutor.fullName}</h3>
                  <div className="flex space-x-1">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Professional
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">${selectedTutor.pricePerLesson || '25'}</div>
                <div className="text-sm text-gray-600">{selectedTutor.lessonDuration || '60 min'} lesson</div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{selectedTutor.description || 'Experienced tutor ready to help you succeed!'}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTutorModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBookTutor(selectedTutor.id)}
                className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Book Trial Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Student;