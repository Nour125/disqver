"use client";
import axios from "axios";
import {
  FaCircleInfo,
  FaCloud,
  FaCalendar,
  FaCube,
  FaBox,
  FaWarehouse,
} from "react-icons/fa6";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { SampleModal } from "./SampleModal";
import path from "path";
import { Demand } from "./Demand";
import { QuantityGraph } from "./InteractiveGraph";

export async function getOverview() {
  try {
    const response = await axios.get("http://127.0.0.1:8000/overview/");
    // Check if response data contains the expected structure
    if (response.data) {
      return response.data;
    } else {
      console.log("Invalid response structure");
      return null;
    }
  } catch (error) {
    console.error("Error fetching overview", error);
    return null;
  }
}

export const QelOverview: React.FC = () => {
  const [overview, setOverview] = useState<any>();
  const [currentModal, setCurrentModal] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>();
  const [new_sample_button, setNewSampleButton] = useState<boolean>(false);

  useEffect(() => {
    const fetchFileName = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/uploadfile/");
        // Check if response data contains the expected structure
        let path = response.data;
        let filename = path.split("\\").pop();
        setFileName(filename);
      } catch (error) {
        console.error("Error fetching File Name", error);
      }
    };

    fetchFileName();
  }, []);

  // get the overview data from the endpoint overview
  useEffect(() => {
    const fetchData = async () => {
      const data = await getOverview(); // Wait for the data to be fetched
      setOverview(data); // Set the overview state after the data is fetched
    };

    fetchData();
  }, [fileName]);

  const eventNumber = overview ? overview["Events"] : 0;
  const activityNumber = overview ? overview["Activity"].length : 0;
  const objectNumber = overview ? overview["Objects"] : 0;
  const objectTypes = overview ? overview["Object Types"].length : 0;
  const activeQuantityEvents = overview ? overview["Quantity Events"] : 0;
  const activeQuantityActivities = overview
    ? overview["q-activities"].length
    : 0;
  const activeQuantityObjects = overview ? overview["Quantity Objects"] : 0;
  const activeQuantityObjectTypes = overview
    ? overview["Quantity Object Types"].length
    : 0;
  const itemTypes = overview ? overview["Item Types"].length : 0;
  const itemCollections = overview ? overview["Collection"].length : 0;
  const activeQuantityOprations = overview
    ? overview["Active Quantity Relations"]
    : 0;
  const QuantityRelations = overview
    ? overview["quantity relations"].length
    : 0;

  return (
    <div>
      <div className="mb-5">
        <div>
          <h4>QEL Overview</h4>
        </div>
        <div>
          <h5>
            <span>
              File Name: <code>{fileName}</code>
            </span>
          </h5>
        </div>
        <Container>
          <Row>
            <Col>
              <div className="d-flex align-items-center gap-3">
                <FaCalendar className="text-secondary" />
                <span>
                  <code>{eventNumber}</code> Events of{" "}
                  <code>{activityNumber}</code> activities
                </span>
                {
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentModal("Events");
                      setNewSampleButton(true);
                    }}
                    variant="light"
                  >
                    Show sample
                  </Button>
                }
              </div>
            </Col>
            <Col>
              <div className="d-flex align-items-center gap-3">
                <FaCube className="text-secondary" />
                <span>
                  <code>{objectNumber}</code> Object of{" "}
                  <code>{objectTypes}</code> Object Types
                </span>
                {
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentModal("Objects");
                      setNewSampleButton(true);
                    }}
                    variant="light"
                  >
                    Show sample
                  </Button>
                }
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-flex align-items-center gap-3">
                <FaCalendar className="text-secondary" />
                <span>
                  <code>{activeQuantityEvents}</code> Active Quantity Events of{" "}
                  <br />
                  <code>{activeQuantityActivities}</code> active Quantity
                  Activities
                </span>
                {
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentModal("Quantity Activities");
                      setNewSampleButton(false);
                    }}
                    variant="light"
                  >
                    Show the active Quantity Activities
                  </Button>
                }
              </div>
            </Col>
            <Col>
              <div className="d-flex align-items-center gap-3">
                <FaCube className="text-secondary" />
                <span>
                  <code>{activeQuantityObjects}</code> active Quantity Objects
                  of <br />
                  <code>{activeQuantityObjectTypes}</code> active Quantity
                  Object Types
                </span>
                {
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentModal("Quantity Object Types");
                      setNewSampleButton(false);
                    }}
                    variant="light"
                  >
                    Show the active Quantity Object Types
                  </Button>
                }
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-flex align-items-center gap-3">
                <FaBox className="text-secondary" />
                <span>
                  <code>{itemTypes}</code> Item Types
                </span>
                {
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentModal("Item Types");
                      setNewSampleButton(false);
                    }}
                    variant="light"
                  >
                    Show Item Types
                  </Button>
                }
              </div>
            </Col>
            <Col>
              <div className="d-flex align-items-center gap-3">
                <FaWarehouse className="text-secondary" />
                <span>
                  <code>{itemCollections}</code> Item Collections
                </span>
                {
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentModal("Collection");
                      setNewSampleButton(false);
                    }}
                    variant="light"
                  >
                    Show Item Collections
                  </Button>
                }
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-flex align-items-center gap-3">
                <FaCloud className="text-secondary" />
                <span>
                  <code>{activeQuantityOprations}</code> active Quantity
                  Oprations
                </span>
                {/*{<Button size="sm" onClick={() => setCurrentModal('Active Quantity Relations')} variant="light">Show sample</Button>} */}
              </div>
            </Col>
            <Col>
              <div className="d-flex align-items-center gap-3">
                <FaCloud className="text-secondary" />
                <span>
                  {" "}
                  <code>{QuantityRelations}</code> Quantity Relations
                </span>
                {/*{<Button size="sm" onClick={() => setCurrentModal('Quantity Relations')} variant="light">Show sample</Button>} */}
              </div>
            </Col>
          </Row>
        </Container>
        <SampleModal
          tableName={currentModal}
          new_sample={new_sample_button}
          show={currentModal !== null}
          onHide={() => setCurrentModal(null)}
        />
      </div>
      <div>
        <QuantityGraph />
      </div>
    </div>
  );
};
