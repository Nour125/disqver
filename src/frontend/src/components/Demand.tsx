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
}

export const Demand: React.FC<DemandProps> = ({
  CollectionPointProp: CollectionPoint,
  itemTypesProp,
}) => {
  const [overview, setOverview] = useState<any>();
  const [demandData, setDemandData] = useState<any>();
  const [selectedOptionsItem, setSelectedOptionsItem] = useState<any>([]);
  const [selectedOptionsCollection, setSelectedOptionsCollection] =
    useState<any>([]);
  const animatedComponents = makeAnimated();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize state only when props change
    if (CollectionPoint) {
      setSelectedOptionsCollection([{ label: CollectionPoint }]);
    }
    if (itemTypesProp) {
      setSelectedOptionsItem(itemTypesProp.map((item) => ({ label: item })));
    }
  }, [CollectionPoint, itemTypesProp]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/overview/");
        if (response.data && response.data.Events) {
          setOverview(response.data);
        } else {
          console.log("Invalid response structure");
        }
      } catch (error) {
        console.error("Error fetching overview", error);
      }
    };

    const fetchDemandData = async () => {
      try {
        let DemandData: { [cp: string]: { [key: string]: any } } = {};

        for (const cp of selectedOptionsCollection) {
          if (!DemandData[cp.label]) {
            DemandData[cp.label] = {};
          }

          for (const item of selectedOptionsItem) {
            try {
              const response = await axios.get(
                `http://127.0.0.1:8000/Demand/${item.label}/${cp.label}`
              );

              if (response.data) {
                DemandData[cp.label][item.label] = response.data.slice(0, 10); // Limit to 10 items
              } else {
                console.log("Invalid response structure");
              }
            } catch (error: any) {
              if (error.response && error.response.status === 400) {
                console.error(
                  `Error for ${item.label} at ${cp.label}:`,
                  error.response.data.detail
                );
                setError(` ${error.response.data.detail}`);
              } else {
                console.error("Unexpected error:", error);
              }
            }
          }
        }

        setDemandData(DemandData);
      } catch (error) {
        console.error("Error fetching Demand Data:", error);
      }
    };

    fetchOverview();
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
      <div>
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
