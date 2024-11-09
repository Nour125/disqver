"use client";
import axios from 'axios';
import { FaCircleInfo, FaCloud } from "react-icons/fa6";
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {SampleModal} from './SampleModal';

export const QelOverview: React.FC = () => {
    const [qel, setQel] = useState<any>();
    const [overview, setOverview] = useState<any>();
    const [modalShow, setModalShow] = React.useState(false);
    // get the overview data from the endpoint overview
    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/overview/');
                // Check if response data contains the expected structure
                if (response.data && response.data.Events) {
                    setOverview(response.data);
                } else {
                    console.log('Invalid response structure');
                }
            } catch (error) {
                console.error("Error fetching overview", error);
            }
        };

        fetchOverview();
    }, []);
    console.log(overview);
    const eventNumber = overview ? overview['Events'] : 0;
    const activityNumber = overview ? overview['Activity'].length : 0;
    const objectNumber = overview ? overview['Objects'] : 0;
    const objectTypes = overview ? overview['Object Types'].length : 0;
    const activeQuantityEvents = overview ? overview['Quantity Events'] : 0;
    const activeQuantityActivities = overview ? overview['q-activities'].length : 0;
    const activeQuantityObjects = overview ? overview['Quantity Objects'] : 0;
    const activeQuantityObjectTypes = overview ? overview['Quantity Object Types'].length : 0;
    const itemTypes = overview ? overview['Item Types'].length : 0;
    const itemCollections = overview ? overview['Collection'].length : 0;
    const activeQuantityOprations = overview ? overview['Active Quantity Relations'] : 0;
    const QuantityRelations = overview ? overview['quantity relations'].length : 0;


    const handleSampleObjects = async () => {
        console.log("Fetching sample objects");
           // axios.get('http://127.0.0.1:8000/overview/)
    }


    return (
        <div>
            <div>
                <h4>QEL Overview</h4>
            </div>
            <Container>
                <Row >
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span><code>{eventNumber}</code> Events of <code>{activityNumber}</code> activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span><code>{objectNumber}</code> Object of <code>{objectTypes}</code> Object Types</span>
                            {<Button size="sm" onClick={() => setModalShow(true)} variant="light">Show sample</Button>}
                            <SampleModal tableName = "Objects" show={modalShow} onHide={() => setModalShow(false)} />
                        </div>
                    </Col>
                </Row>
                <Row>

                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span><code>{activeQuantityEvents}</code> Active Quantity Events of <code>{activeQuantityActivities}</code> active Quantity Activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span><code>{activeQuantityObjects}</code> active Quantity Objects of <code>{activeQuantityObjectTypes}</code> active Quantity Object Types</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                </Row>
                <Row>

                    <Col>
                        <div className="d-flex align-items-center gap-3">
                        <FaCloud className="text-secondary" />
                        <span><code>{itemTypes}</code>  itemTypes</span>
                        {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span><code>{itemCollections}</code> item Collections</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col> 
                </Row>
                <Row>
                   
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span><code>{activeQuantityOprations}</code> active Quantity Oprations</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span> <code>{QuantityRelations}</code> Quantity Relations</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                </Row>
            </Container>
            
        </div>
    );
};