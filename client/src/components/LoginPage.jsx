import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student'); // 'student' or 'faculty'
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
    
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
      event.preventDefault();
      setError('');

      const validateEmail = (email) => {
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && email.endsWith("university.com");
      };
    
      if (!validateEmail(email)) {
        setError('Email must be in a valid format and end with "university.com".');
        return;
      }
    
      const username = email.split('@')[0];
      if (password !== username) {
        setError('Password must be the same as your username (email prefix).');
        return;
      }
    
      try {
        const response = await axios.post('http://localhost:3001/api/login', { email, password, userType }); // Include userType in the data object
        if (response.data.userType === 'student') {
          console.log("Navigating to /student")
          navigate('/student', { state: { studentId: response.data.studentId, studentName: response.data.studentName } });
        } else if (response.data.userType === 'faculty') {
          console.log("Navigating to /faculty")
          navigate('/faculty', { state: { facultyId: response.data.studentId, facultyName: response.data.studentName } });
        } else if (response.data.userType === 'librarian') {
          console.log("Navigating to /librarian")
          navigate('/librarian', { state: { librarianId: response.data.studentId, librarianName: response.data.studentName } });
        }
      } catch (err) {
        setError('Login failed: ' + (err.response?.data?.error || 'Unknown Error'));
      }
  };

  return (
    <div className="my-login-page">
      <section className="h-100">
        <div className="container h-100">
          <div className="row justify-content-md-center h-100">
            <div className="card-wrapper">
              <div className="brand">
                <img src="imgs/logo.jpg" alt="logo" />
              </div>
              <div className="card fat">
                <div className="card-body">
                  <h4 className="card-title">Login</h4>
                  <form onSubmit={handleSubmit} className="my-login-validation" noValidate>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="form-group">
                      <label htmlFor="email">E-Mail Address</label>
                      <input id="email" type="email" className="form-control" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input id="password" type="password" className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <select className="form-control" value={userType} onChange={(e) => setUserType(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="librarian">Librarian</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="form-group m-0">
                      <button type="submit" className="btn btn-primary btn-block">
                        Login
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="footer">
                Copyright &copy; 2024 &mdash; Databases.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
