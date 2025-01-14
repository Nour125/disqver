"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Container, Row, Stack } from "react-bootstrap";

interface DemandProps {
  CollectionPointProp?: string;
  itemTypesProp?: string[];
  overview: any;
}

export const Demand: React.FC<DemandProps> = ({
  CollectionPointProp,
  itemTypesProp,
  overview,
}) => {
  const [demandData, setDemandData] = useState<any>();
  const [selectedOptionsItem, setSelectedOptionsItem] = useState<any>([]);
  const [selectedOptionsCollection, setSelectedOptionsCollection] =
    useState<any>([]);
  const animatedComponents = makeAnimated();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize state only when props change
    if (CollectionPointProp) {
      setSelectedOptionsCollection([{ label: CollectionPointProp }]);
    }
    if (itemTypesProp) {
      setSelectedOptionsItem(itemTypesProp.map((item) => ({ label: item })));
    }
  }, [CollectionPointProp, itemTypesProp]);

  useEffect(() => {
    const fetchDemandData = async () => {
      try {
        // Prepare the payload to match the Demand model
        const payload = {
          item_names: selectedOptionsItem.map((item: any) => item.label), // Array of item names
          collection_points: selectedOptionsCollection.map(
            (cp: any) => cp.label
          ), // Array of collection points
        };

        // Make a POST request with the payload
        const response = await axios.post(
          "http://127.0.0.1:8000/Demand/",
          payload
        );

        if (response.data) {
          const demandData = response.data;

          // Process and limit the data to 10 items per collection point/item
          for (const cp in demandData) {
            for (const item in demandData[cp]) {
              demandData[cp][item] = demandData[cp][item].slice(0, 10);
            }
          }

          setDemandData(demandData); // Update state with the demand data
        } else {
          console.error("Invalid response structure");
        }
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          console.error(
            "Error fetching Demand Data:",
            error.response.data.detail
          );
          setError(error.response.data.detail);
        } else {
          console.error("Unexpected error:", error);
        }
      }
    };

    fetchDemandData();
  }, [selectedOptionsItem, selectedOptionsCollection]);

  function AnimatedMultiItem() {
    return (
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
        options={
          overview
            ? overview["Item Types"].map((itemType: string) => ({
                value: itemType,
                label: itemType,
              }))
            : []
        }
        onChange={setSelectedOptionsItem}
        value={selectedOptionsItem}
        placeholder="Select Item"
      />
    );
  }

  function AnimatedMultiCollections() {
    return (
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
        options={
          overview
            ? overview["Collection"].map((cp: string) => ({
                value: cp,
                label: cp,
              }))
            : []
        }
        onChange={setSelectedOptionsCollection}
        value={selectedOptionsCollection}
        placeholder="Select Collection"
      />
    );
  }

  const chartSetting = {
    yAxis: [{ label: "Quantity" }],
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: "translate(-10px, 0)",
      },
    },
  };

  function BarsDataset() {
    const charts = Object.keys(demandData || {}).map((cpName) => {
      const cpData = demandData[cpName];

      const formattedData = Object.keys(cpData || {}).flatMap((itemName) => {
        return cpData[itemName].map(([date, value]: [string, number]) => ({
          date,
          [itemName]: value,
        }));
      });

      const combinedData = formattedData.reduce((acc, curr) => {
        const existingEntry = acc.find(
          (e: { date: string }) => e.date === curr.date
        );
        if (existingEntry) {
          Object.assign(existingEntry, curr);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

      const seriesData = Object.keys(cpData || {}).map((itemName) => ({
        dataKey: itemName,
        label: itemName,
      }));

      return (
        <div key={cpName}>
          <h3>{cpName}</h3>
          <div
            style={{
              width: "100%", // Responsive width
              maxWidth: "900px", // Optional: Limit the maximum width
              height: "auto", // Automatically adjust height
              aspectRatio: "16 / 9", // Maintain aspect ratio (16:9)
              margin: "0 auto", // Center the chart horizontally
            }}
          >
            <BarChart
              dataset={combinedData}
              xAxis={[{ scaleType: "band", dataKey: "date", label: "Date" }]}
              series={seriesData}
              {...chartSetting}
              width={undefined} // Let the container control the width
              height={undefined} // Let the container control the height
            />
          </div>
        </div>
      );
    });

    return <div>{charts}</div>;
  }

  return (
    <Container>
      <div className="mb-5">
        <h4>Demand Analysis</h4>
        <Container>
          <Stack gap={3}>
            {error && <div style={{ color: "red" }}>Error: {error}</div>}
            <AnimatedMultiItem />
            <AnimatedMultiCollections />
          </Stack>
          <BarsDataset />
        </Container>
      </div>
    </Container>
  );
};
