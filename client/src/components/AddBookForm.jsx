import React, { useState } from 'react';
import axios from 'axios';

const AddBookForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        pub_year: '',
        category: '',
        availability: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/books', formData);
            // Reset form data after successful submission
            setFormData({
                title: '',
                author: '',
                isbn: '',
                pub_year: '',
                category: '',
                availability: '',
            });
            // Handle success, e.g., show a success message
        } catch (error) {
            // Handle error, e.g., show an error message
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Title:</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} />
                <label>Author:</label>
                <input type="text" name="author" value={formData.author} onChange={handleChange} />
                <label>ISBN:</label>
                <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} />
                <label>Publication Year:</label>
                <input type="text" name="pub_year" value={formData.pub_year} onChange={handleChange} />
                <label>Category:</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} />
                <label>Availability:</label>
                <select name="availability" value={formData.availability} onChange={handleChange}>
                <option value="Available">Available</option>
                <option value="no">Unavailable</option>
                </select>
                <button type="submit">Add Book</button>
            </form>
        </div>
    );
};

export default AddBookForm;
