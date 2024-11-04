"use client";
import { FaCircleInfo, FaCloud } from "react-icons/fa6";
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const QelOverview: React.FC = () => {
    const [qel, setQel] = useState<any>();

    const handleSampleObjects = async () => {
        console.log("Fetching sample objects");
        // axios.get('http://
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
                            <span>File name: ... </span>
                        </div>
                    </Col>

                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span> Events of ... activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span> Events of ... activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span> Events of ... activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>

                    
                </Row>
                <Row>
                <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span> Events of ... activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span> Events of ... activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                </Row>
                <Row>
                <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span> Events of ... activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>                    <Col>
                        <div className="d-flex align-items-center gap-3">
                            <FaCloud className="text-secondary" />
                            <span> Events of ... activities</span>
                            {!!handleSampleObjects && (<Button size="sm" onClick={() => handleSampleObjects()} variant="light">Show sample</Button>)}
                        </div>
                    </Col>
                </Row>
            </Container>
            
        </div>
    );
};