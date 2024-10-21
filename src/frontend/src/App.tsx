"use client";

import axios from 'axios';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';

interface Item {
  name: string;
  description?: string;
}

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [items, setItems] = useState<Item[]>([]);
  console.log("Fetching items");

  useEffect(() => {
    console.log("Fetching items");
    axios.get('http://127.0.0.1:8000/items/')
      .then(response => {
        console.log("Items fetched", response.data);
        setItems(response.data);
      })
      .catch(error => {
        console.error("Error fetching items", error);
      });
  }, []);
    // handleUpload should save the uploaded file to the directory src\backend\files and then call the function qel-overview
  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected");
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await axios.post('http://127.0.0.1:8000/uploadfile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  return (
    <div>
      <Helmet>
        <title>DISQOVER</title>
        <link rel="shortcut icon" href="src/frontend/public/logo192.png" /> 
      </Helmet>
      <header>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/">DISQOVER</a>
          </div>
        </nav>
      </header>
      <main className="container">
        <h1>Items List</h1>
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item.name}: {item.description}</li>
          ))}
        </ul>
        <h4>QEL Import</h4>
        <div className="mb-5">
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Select an event log (<code>.sqlite</code> QEL format) from your local disk</Form.Label>
            <Form.Control type="file" onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const files = event.target.files ?? [];
              setSelectedFile(files[0] ?? undefined);
            }} accept=".sqlite,.zip" />
          </Form.Group>
          <Button onClick={handleUpload} disabled={!selectedFile}>Import</Button>
        </div>
      </main>
    </div>
  );
};

export default App;