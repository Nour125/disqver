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
import { UserInput } from "./UserInput";
import { Leadtime } from "./Leadtime";

interface QuantityGraphProps {
  overview: any;
}

export const QuantityGraph: React.FC<QuantityGraphProps> = ({ overview }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(
    undefined
  );
  const [selectedNodeIdItemtypes, setSelectedNodeIdItemtypes] = useState<
    string[] | undefined
  >(undefined);

  const demandRef = useRef<HTMLDivElement>(null); // Ref for scrolling

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
            graphviz("#graph"); // Fit the graph to the container
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
    const itemCollections = overview ? overview["Collection"] : [];

    if (itemCollections.includes(nodeId)) {
      console.log("Demand for CollectionPoint:", nodeId);

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
  const addInteractivity = async () => {
    const svg = d3.select("#graph").select("svg");

    // Attach click listeners to nodes
    svg.selectAll("g.node").on("click", async function (event: any) {
      const node = d3.select(this);
      const nodeId = d3.select(this).select("title").text();
      setSelectedNodeId(nodeId);
      await handleNodeClick(nodeId);
      // Highlight the clicked node
      console.log("Node clicked:", nodeId);

      const shape = event.target.nodeName;

      console.log("Clicked Shape:", shape);
      node
        .select(shape)
        .transition()
        .duration(100) // Highlighting animation duration
        .style("stroke", "red")
        .style("stroke-width", "3px");

      // Remove the highlight after a short delay
      setTimeout(() => {
        node
          .select(shape)
          .transition()
          .duration(100)
          .style("stroke", "black") // Reset to the default stroke color
          .style("stroke-width", "1px");
      }, 1000); // Highlight stays for 1 second
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
        <h4>Quantity Graph</h4>
        <Box
          id="graph"
          sx={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            height: "auto",
            overflow: "auto",
          }}
        ></Box>
      </div>
      {/* Demand Component */}
      <div ref={demandRef}>
        <Demand
          overview={overview}
          CollectionPointProp={selectedNodeId}
          itemTypesProp={selectedNodeIdItemtypes}
        />
      </div>
      <div>
        <Leadtime
          register_activity="Place Replenishment Order"
          placement_activity="Identify incoming Delivery"
        />
      </div>
    </Container>
  );
};
