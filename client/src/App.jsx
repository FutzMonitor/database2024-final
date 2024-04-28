import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Books from './components/Books';
import LoginPage from './components/LoginPage';
import StudentPage from './components/StudentPage';
import FacultyPage from './components/FacultyPage';



function App() {
  return (
    <Router>
      <div>
        <header>
          <h1>University Portal</h1>
        </header>
        <Routes>
          <Route path="/" element={<LoginPage />} exact />
          <Route path="/student" element={<StudentPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
