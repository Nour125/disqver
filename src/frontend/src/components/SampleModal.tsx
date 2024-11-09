"use client";
import axios from 'axios';
import { FaCircleInfo, FaCloud } from "react-icons/fa6";
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import "ts-sql-query/Connection"
import Table from 'react-bootstrap/Table';
import { tableName } from 'ts-sql-query/utils/symbols';

// get the Sample table from the endpoint
const handleSample = async (tableName: string): Promise<JSON | null> => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/uploadfile/' + tableName );
        console.log(response.data)
        return response.data;
    } catch (error) { 
        console.error("Error getting sample", error);
        return null;
    }
};



export function SampleModal({ tableName, ...props }: any) {
  const [sampleData, setSampleData] = useState<JSON | null>(null);
  const [key, setKey] = useState(0);



  useEffect(() => {
    const fetchSample = async () => {
      const response = await handleSample(tableName);
      setSampleData(response);
    };
    fetchSample();
  }, [tableName]);

  const handleSampleModal = async (): Promise<any | null>=> {
    console.log("Fetching sample objects");
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
        <Modal.Title id="contained-modal-title-vcenter">
          Modal heading
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Centered Modal</h4>
        <p >
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
          dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
          consectetur ac, vestibulum at eros.
          <span><code>{JSON.stringify(sampleData)}</code></span>
        </p>
      </Modal.Body>
      <Modal.Footer>
            <Button variant="primary"  onClick={() => handleSampleModal()}>New sample</Button>
            <Button variant="secondary" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
    </div>);
}



