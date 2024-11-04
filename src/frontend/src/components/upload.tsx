"use client";

import axios from 'axios';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import {QelOverview} from './QelOverview';

export const UploadFile: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File>();
    const [qelOverview, setQelOverview] = useState<boolean>(false);

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
      const handleShowQelOverview = async () => {
        setQelOverview(true);
      };
    return (
        <div>
            <h4>QEL Import</h4>
            <div className="mb-5">
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Select an event log (<code>.sqlite</code> QEL format) from your local disk</Form.Label>
                <Form.Control type="file" onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const files = event.target.files ?? [];
                setSelectedFile(files[0] ?? undefined);
                }} accept=".sqlite,.zip" />
            </Form.Group>
            <Button onClick={()=>
            {
            handleUpload();
            handleShowQelOverview();
            }
            } disabled={!selectedFile}>Import</Button>
            </div>
            <div>
              {qelOverview && <QelOverview/>}
            </div>
            
        </div>
    );
}
