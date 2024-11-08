"use client";
import axios from 'axios';
import { FaCircleInfo, FaCloud } from "react-icons/fa6";
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import initSqlJs from 'sql.js';

//should fetch the first 10 rows of the table tableName from the database in the endpoint uploadfile

const handleSample = async (tableName: string) => {
 
};



export function SampleModal(props: any) {
    

  return (
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
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
          dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
          consectetur ac, vestibulum at eros.
        </p>
      </Modal.Body>
      <Modal.Footer>
            <Button variant="primary"  onClick={() => handleSample("")}>New sample</Button>
            <Button variant="secondary" onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}



