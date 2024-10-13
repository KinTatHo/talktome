import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserContext";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const { user } = useUser();

  const languageOptions = ["English", "Spanish", "French", "German", "Chinese"];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/students', {
          headers: { 'x-session-id': localStorage.getItem('sessionId') }
        });
        console.log('Fetched students:', response.data);
        setStudents(response.data);
        setFilteredStudents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch students: ' + (error.response?.data?.error || error.message));
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (filterLanguage) {
      setFilteredStudents(
        students.filter(
          (student) =>
            student.learningLanguages &&
            student.learningLanguages.includes(filterLanguage)
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [filterLanguage, students]);

  const connectWithStudent = async (studentId) => {
    try {
      const response = await axios.post('http://localhost:3001/api/connect', 
        { studentId },
        { headers: { 'x-session-id': localStorage.getItem('sessionId') } }
      );
      alert(response.data.message);
      // You might want to update the UI here to reflect the new connection
    } catch (error) {
      console.error('Error connecting with student:', error);
      alert(error.response?.data?.error || 'Failed to connect with student. Please try again.');
    }
  };

  if (loading) return <div className="text-center mt-8">Loading students...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Available Students</h2>
      <div className="mb-4">
        <label htmlFor="language-filter" className="block mb-2">
          Filter by Learning Language:
        </label>
        <select
          id="language-filter"
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
          className="w-full md:w-auto px-3 py-2 border rounded"
        >
          <option value="">All Languages</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      {filteredStudents.length === 0 ? (
        <p>No students available for the selected criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student._id} className="bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{student.username}</h3>
              <p className="text-gray-600 mb-4">
                Learning Languages:{" "}
                {student.learningLanguages
                  ? student.learningLanguages.join(", ")
                  : "Not specified"}
              </p>
              <button
                onClick={() => connectWithStudent(student._id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 mr-2"
              >
                Connect with Student
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
                Offer Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentList;