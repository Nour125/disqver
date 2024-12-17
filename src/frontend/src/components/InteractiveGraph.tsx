"use client";
import {
  Box,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import axios from "axios";
import { graphviz } from "d3-graphviz";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Container } from "react-bootstrap";
import { getOverview } from "./QelOverview";
import { Demand } from "./Demand";

export const QuantityGraph: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggleInventory, setToggleInventory] = useState(false);
  const [toggleActivities, setToggleActivities] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(
    undefined
  );
  const [selectedNodeIdItemtypes, setSelectedNodeIdItemtypes] = useState<
    string[] | undefined
  >(undefined);
  const [overview, setOverview] = useState<any>(null); // Overview state
  const demandRef = useRef<HTMLDivElement>(null); // Ref for scrolling
  const graphRef = useRef<HTMLDivElement>(null);

  // Handle toggle switch state
  const handleToggleInventory = () => setToggleInventory(!toggleInventory);
  const handleToggleActivities = () => setToggleActivities(!toggleActivities);

  // Fetch overview data
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await getOverview();
        setOverview(data);
      } catch (error) {
        console.error("Error fetching overview:", error);
      }
    };

    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        // Increase axios payload size limit
        axios.defaults.maxContentLength = Infinity;
        axios.defaults.maxBodyLength = Infinity;

        const response = await axios.get("http://127.0.0.1:8000/qnet/", {
          //timeout: 10000, // Timeout for large payloads
        });

        const dotString =
          typeof response.data === "string"
            ? response.data
            : response.data.dot_string;

        if (!dotString) {
          throw new Error("No DOT string found in the response");
        }

        // Render the DOT string
        graphviz("#graph")
          .renderDot(dotString)
          .on("end", () => {
            graphviz("#graph").fit(true); // Fit the graph to the container
            addInteractivity(); // Add interactivity
            setLoading(false); // Disable loading screen
          });
      } catch (error) {
        console.error("Error fetching graph:", error);

        if (axios.isAxiosError(error)) {
          setError(error.message);
        }
        setLoading(false); // Disable loading screen even on error
      }
    };

    fetchGraph();
  }, []);

  // Handle interaction with graph nodes
  const handleNodeClick = async (nodeId: string) => {
    const itemCollections = (await overview) ? overview["Collection"] : [];

    if (itemCollections.includes(nodeId)) {
      console.log("Demand for CollectionPoint:", nodeId);
      setSelectedNodeId(nodeId);

      // Fetch item types associated with the collection point
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/itemtypes/${nodeId}`
        );
        setSelectedNodeIdItemtypes(response.data);
      } catch (error) {
        console.error("Error fetching item types:", error);
      }

      if (demandRef.current) {
        demandRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      console.log("Item Type:", nodeId);
    }
  };

  // Add interactivity to graph nodes
  const addInteractivity = () => {
    const svg = d3.select("#graph").select("svg");

    // Attach click listeners to nodes
    svg.selectAll("g.node").on("click", function () {
      const nodeId = d3.select(this).select("title").text();
      handleNodeClick(nodeId);
    });

    // Optional: Handle edges or clusters
    svg.selectAll("g.edge").on("click", function () {
      const edgeId = d3.select(this).select("title").text();
      alert(`Edge clicked: ${edgeId}`);
    });

    svg.selectAll("g.cluster").on("click", function () {
      const clusterId = d3.select(this).select("title").text();
      alert(`Cluster clicked: ${clusterId}`);
    });
  };

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <Container>
      <div className="mb-5">
        <div>
          <h4>Input Information</h4>
          <Box sx={{ my: 2 }}>
            <Typography>
              Please click on an inventory in the process to see the demand
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={toggleInventory}
                  onChange={handleToggleInventory}
                  color="primary"
                />
              }
              label={toggleInventory ? "Primary" : "Secondary"}
            />
          </Box>
          <Box sx={{ my: 2 }}>
            <Typography>
              Please click on the activities that are associated with the order
              to carulate the lead time and service level type
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={toggleActivities}
                  onChange={handleToggleActivities}
                  color="primary"
                />
              }
              label={toggleActivities ? "Primary" : "Secondary"}
            />
          </Box>
        </div>
        <h4>Quantity Graph</h4>
        <Box
          sx={{
            p: 1,
            border: "1px dashed grey",
            height: "500px",
            overflow: "auto",
          }}
        >
          <div id="graph" style={{ width: "100%", height: "100%" }}></div>
        </Box>
      </div>
      {/* Demand Component */}
      <div ref={demandRef}>
        <Demand
          CollectionPointProp={selectedNodeId}
          itemTypesProp={selectedNodeIdItemtypes}
        />
      </div>
    </Container>
  );
};
