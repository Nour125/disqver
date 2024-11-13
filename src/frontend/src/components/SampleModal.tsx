"use client";
import axios from 'axios';
import { FaCircleInfo, FaCloud } from "react-icons/fa6";
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import "ts-sql-query/Connection"
import Table from 'react-bootstrap/Table';


interface JsonData {
  [column: string]: {
    [rowId: string]: string | number | null;
  };
}



export function SampleModal({ tableName, new_sample, ...props }: any) {
  const [sampleData, setSampleData] = useState<JsonData | null>(null);
  const [key, setKey] = useState(0);  



  useEffect(() => {
    const fetchSample = async () => {
      const response = await handleSample(tableName);
      setSampleData(response);
    };
    fetchSample();
  }, [tableName]);

  // get the Sample table from the endpoint
  const handleSample = async (tableName: string): Promise<JsonData | null> => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/uploadfile/' + tableName );
        console.log(response.data)
        return response.data;
    } catch (error) { 
        console.error("Error getting sample", error);
        return null;
    }
    };

  const handleSampleModal = async (): Promise<any | null>=> {
    const newSampleData = await handleSample(tableName);
    setSampleData(newSampleData);
    setKey((prevKey) => prevKey + 1); // Increment key to remount the component
  }


  return (
    <div key={key}>
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
      <Modal.Title>Sample Data for {tableName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {sampleData ? <JsonTable data={sampleData} /> : <p>Loading data...</p>}
      </Modal.Body>
      <Modal.Footer>
            {new_sample && <Button variant="primary"  onClick={() => handleSampleModal()}>New sample</Button>}
            <Button variant="secondary" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
}

// Table component for displaying JSON data
const JsonTable: React.FC<{ data: JsonData }> = ({ data }) => {
  const columns = Object.keys(data);
  const rows = columns.length > 0 ? Object.keys(data[columns[0]] || {}) : [];

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Row ID</th>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((rowId) => (
          <tr key={rowId}>
            <td>{rowId}</td>
            {columns.map((col) => (
              <td key={`${rowId}-${col}`}>
                {data[col][rowId] || '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};


