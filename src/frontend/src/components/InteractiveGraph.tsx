"use client";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { graphviz } from "d3-graphviz";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Container } from "react-bootstrap";
import { Demand } from "./Demand";
import { Leadtime } from "./Leadtime";
import { ServiceLevel } from "./ServiceLevel";
import next from "next";

interface QuantityGraphProps {
  overview: any;
}

export const QuantityGraph: React.FC<QuantityGraphProps> = ({ overview }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(undefined);
  const [nextselectedNode, setNextSelectedNode] = useState<any>(undefined);
  const [graphData, setGraphData] = useState<any>(undefined);
  const [selectedNodeEvent, setSelectedNodeEvent] = useState<any>(undefined);
  const [demandCollectionPoint, setDemandCollectionPoint] = useState<
    string | undefined
  >(undefined);
  const [demandCollectionPointItemtypes, setdemandCollectionPointItemtype] =
    useState<string[] | undefined>(undefined);
  const [userInputData, setUserInputData] = useState<any>(undefined);

  const [firstActivityNode, setFirstActivityNode] = useState<any>(undefined);
  const [secondActivityNode, setSecondActivityNode] = useState<any>(undefined);
  const [firstActivityNodeIsSet, setFirstActivityNodeIsSet] =
    useState<boolean>(false);
  const [registerActivity, setRegisteractivity] = useState<string | undefined>(
    undefined
  );
  const [placementActivity, setPlacementactivity] = useState<
    string | undefined
  >(undefined);

  const demandRef = useRef<HTMLDivElement>(null); // Ref for scrolling
  const serviceLevelRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  const graphInitializedRef = useRef(false);

  async function highlight(node: any, shape: any) {
    if (node) {
      node
        .select(shape)
        .transition()
        .duration(100) // Highlighting animation duration
        .style("stroke", "red")
        .style("stroke-width", "3px");
    }
  }
  async function dehighlight(node: any, shape: any) {
    if (node) {
      setTimeout(() => {
        node
          .select(shape)
          .transition()
          .duration(100)
          .style("stroke", "black") // Reset to the default stroke color
          .style("stroke-width", "1px");
      }, 1000); // Highlight stays for 1 second
    }
  }

  useEffect(() => {
    const getUserInputData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/UserInput/");
        setUserInputData(response.data);
      } catch (error) {
        console.error("Error fetching user input data:", error);
      }
    };
    getUserInputData();
  }, []);

  useEffect(() => {
    const initializeGraph = async () => {
      if (graphInitializedRef.current) return;

      try {
        axios.defaults.maxContentLength = Infinity;
        axios.defaults.maxBodyLength = Infinity;

        const response = await axios.get("http://127.0.0.1:8000/qnet/");
        const dotString = response.data.graph;
        setGraphData(response.data.graphData);
        console.log("Graph Data:", response.data.graphData);

        if (!dotString) {
          throw new Error("No DOT string found in the response");
        }

        // Render graph and set up interactivity in one place
        graphviz("#graph")
          .fit(true)
          .renderDot(dotString)
          .on("end", () => {
            // Set up node click handlers
            const svg = d3.select("#graph").select("svg");
            svg.selectAll("g.node").on("click", async function (event: any) {
              const node = d3.select(this);
              setSelectedNodeEvent(event);
              setSelectedNode(node);
            });

            graphInitializedRef.current = true;
            setLoading(false);
          });
      } catch (error) {
        console.error("Error fetching graph:", error);
        if (axios.isAxiosError(error)) {
          setError(error.message);
        }
        setLoading(false);
      }
    };

    initializeGraph();
  }, []);

  useEffect(() => {
    // Handle interaction with graph nodes
    const handleFirstNodeClick = async () => {
      const itemCollections = overview ? overview["Collection"] : [];
      const nodeId = selectedNode ? selectedNode.select("title").text() : null;

      if (itemCollections.includes(nodeId)) {
        console.log("Demand for CollectionPoint:", nodeId);
        setDemandCollectionPoint(nodeId);
        await highlight(selectedNode, "polygon");
        await dehighlight(selectedNode, "polygon");

        // Fetch item types associated with the collection point
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/itemtypes/${nodeId}`
          );

          setdemandCollectionPointItemtype(response.data);
        } catch (error) {
          console.error("Error fetching item types:", error);
        }

        if (demandRef.current) {
          demandRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } else if (
        userInputData &&
        graphData &&
        !firstActivityNodeIsSet &&
        nodeId in (graphData.Activity ? graphData.Activity : {})
      ) {
        setFirstActivityNode(selectedNode);
        setFirstActivityNodeIsSet(true);
        await highlight(selectedNode, "polygon");
        console.log("Activity: 1:", selectedNode);
      } else if (
        userInputData &&
        graphData &&
        firstActivityNodeIsSet &&
        nodeId in (graphData.Activity ? graphData.Activity : {})
      ) {
        setSecondActivityNode(selectedNode);
        await highlight(selectedNode, "polygon");

        console.log("Activity: 2:", selectedNode);
      } else {
        console.log("no data is found");
      }
    };

    handleFirstNodeClick();
  }, [selectedNode]);

  useEffect(() => {
    const handleSecondNodeClick = async () => {
      if (userInputData && graphData && firstActivityNodeIsSet) {
        let firstActivity =
          graphData.Activity[
            firstActivityNode ? firstActivityNode.select("title").text() : null
          ];
        let secondActivity =
          graphData.Activity[
            secondActivityNode
              ? secondActivityNode.select("title").text()
              : null
          ];
        if (
          firstActivity === userInputData.register_Replenishment_Order &&
          secondActivity === userInputData.placed_Replenishment_Order
        ) {
          await dehighlight(firstActivityNode, "polygon");
          await dehighlight(secondActivityNode, "polygon");
          console.log("yeahhhhh");
          setRegisteractivity(firstActivity);
          setPlacementactivity(secondActivity);
          setFirstActivityNodeIsSet(false);
          setFirstActivityNode(null);
          setSecondActivityNode(null);
          if (serviceLevelRef.current) {
            serviceLevelRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        } else if (
          firstActivity === userInputData.register_Customer_Order &&
          secondActivity === userInputData.placed_Customer_Order
        ) {
          await dehighlight(firstActivityNode, "polygon");
          await dehighlight(secondActivityNode, "polygon");
          setRegisteractivity(firstActivity);
          setPlacementactivity(secondActivity);
          setFirstActivityNodeIsSet(false);
          setFirstActivityNode(null);
          setSecondActivityNode(null);
          console.log("yeahhhhh");
          if (serviceLevelRef.current) {
            serviceLevelRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        } else {
          await dehighlight(firstActivityNode, "polygon");
          await dehighlight(secondActivityNode, "polygon");
          setFirstActivityNodeIsSet(false);
          setFirstActivityNode(null);
          setSecondActivityNode(null);

          alert(
            "Activities are not correlated. Please check the Input Information or select again."
          );
        }
      } else {
        await dehighlight(firstActivityNode, "polygon");
        await dehighlight(secondActivityNode, "polygon");
        setFirstActivityNodeIsSet(false);
        setFirstActivityNode(null);
        setSecondActivityNode(null);
        console.log("No data is found");
      }
    };

    handleSecondNodeClick();
  }, [secondActivityNode]);

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <Container>
      <div className="mb-5">
        <h4>Quantity Graph</h4>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              flexDirection: "column",
            }}
          >
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading graph, please wait...
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            height: "auto",
            overflow: "auto",
          }}
        >
          <div id="graph"></div>
        </Box>
      </div>
      {/* Demand Component */}
      {!loading && (
        <div ref={demandRef}>
          <Demand
            overview={overview}
            CollectionPointProp={demandCollectionPoint}
            itemTypesProp={demandCollectionPointItemtypes}
          />
        </div>
      )}
      {!loading && (
        <div>
          <Leadtime
            register_activity_Prop={
              registerActivity ? registerActivity : undefined
            }
            placement_activity_Prop={
              placementActivity ? placementActivity : undefined
            }
            userInputData_Prop={userInputData}
          />
        </div>
      )}
      {!loading && (
        <div ref={serviceLevelRef}>
          <ServiceLevel
            register_activity_Prop={
              registerActivity ? registerActivity : undefined
            }
            placement_activity_Prop={
              placementActivity ? placementActivity : undefined
            }
            userInputData_Prop={userInputData}
          />
        </div>
      )}
    </Container>
  );
};
