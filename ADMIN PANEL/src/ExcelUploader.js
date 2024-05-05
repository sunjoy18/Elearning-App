// Install the required library
// npm install axios

import React, { useState } from 'react';
import axios from 'axios';

const api = process.env.REACT_APP_API

const ExcelUploader = () => {
  const [file, setFile] = useState(null);

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`http://192.168.0.215:5000/api/auth/upload-data`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Users created successfully!');
    } catch (error) {
      console.error('Error creating users:', error);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx" onChange={onFileChange} />
      <button onClick={handleUpload}>Create Users</button>
    </div>
  );
};

export default ExcelUploader;
