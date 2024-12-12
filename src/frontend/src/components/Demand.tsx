"use client";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Container, Row, Stack } from "react-bootstrap";

export const Demand: React.FC = () => {
  const [overview, setOverview] = useState<any>();
  const [demandData, setDemandData] = useState<any>();
  const itemTypes = overview ? overview["Item Types"] : [];
  const itemCollections = overview ? overview["Collection"] : [];
  const [selectedOptionsItem, setSelectedOptionsItem] = useState<any>();
  const [selectedOptionsCollection, setSelectedOptionsCollection] =
    useState<any>();
  const animatedComponents = makeAnimated();

  const itemOptions = itemTypes.map((itemType: string) => ({
    value: itemType,
    label: itemType,
    //label: itemType.charAt(0).toUpperCase() + itemType.slice(1), // Capitalize the first letter
  }));
  const CollectionsOptions = itemCollections.map((cp: string) => ({
    value: cp,
    label: cp,
    //label: cp.charAt(0).toUpperCase() + cp.slice(1), // Capitalize the first letter
  }));

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/overview/");
        // Check if response data contains the expected structure
        if (response.data && response.data.Events) {
          setOverview(response.data);
        } else {
          console.log("Invalid response structure");
        }
      } catch (error) {
        console.error("Error fetching overview", error);
      }
    };
    /*
    const fetchDemandData = async () => {
      try {
        let DemandData: { [cp: string]: { [key: string]: any } } = {};
        for (const cp of selectedOptionsCollection) {
          if (!DemandData[cp.label]) {
            DemandData[cp.label] = {};
          }
          for (const item of selectedOptionsItem) {
            const response = await axios.get(
              "http://127.0.0.1:8000/Demand/" + item.label + "/" + cp.label
            );
            // Check if response data contains the expected structure
            if (response.data) {
              DemandData[cp.label][item.label] = response.data;
            } else {
              console.log("Invalid response structure");
            }
          }
        }
        setDemandData(DemandData);
      } catch (error) {
        console.error("Error fetching Demand Data", error);
      }
    };
    */
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

              // Check if response data contains the expected structure
              if (response.data) {
                DemandData[cp.label][item.label] = response.data;
              } else {
                console.log("Invalid response structure");
              }
            } catch (error: any) {
              // Handle specific backend errors
              if (error.response && error.response.status === 400) {
                // Display or log the specific error message from the backend
                console.error(
                  `Error for ${item.label} at ${cp.label}:`,
                  error.response.data.detail
                );
                alert(
                  `Error fetching data for ${item.label} at ${cp.label}: ${error.response.data.detail}`
                );
              } else {
                // Handle generic errors
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
        //defaultValue={itemOptions[0] ? [itemOptions[0]] : []}
        isMulti
        options={itemOptions}
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
        //defaultValue={CollectionsOptions[0] ? [CollectionsOptions[0]] : []}
        components={animatedComponents}
        isMulti
        options={CollectionsOptions}
        onChange={setSelectedOptionsCollection}
        value={selectedOptionsCollection}
        placeholder="Select Collection"
      />
    );
  }

  const chartSetting = {
    yAxis: [
      {
        label: "Quantity",
      },
    ],
    width: 900,
    height: 400,
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: "translate(-10px, 0)",
      },
    },
  };

  function BarsDataset() {
    // Generate a bar chart for each `cp` in the `demandData`
    const charts = Object.keys(demandData || {}).map((cpName) => {
      // Extract the data for the current `cp`
      const cpData = demandData[cpName];

      // Restructure the data to ensure each date has all the item values
      const formattedData = Object.keys(cpData || {}).flatMap((itemName) => {
        return cpData[itemName].map(([date, value]: [string, number]) => ({
          date,
          [itemName]: value, // Assign the value to the itemName key
        }));
      });

      // Flatten the formattedData to combine all item data into a single array
      const combinedData = formattedData.reduce((acc, curr) => {
        const existingEntry = acc.find(
          (e: { date: string }) => e.date === curr.date
        );
        if (existingEntry) {
          // Merge the new item data into the existing entry
          Object.assign(existingEntry, curr);
        } else {
          // Add a new entry if no existing entry for this date
          acc.push(curr);
        }
        return acc;
      }, []);

      // Create the series data dynamically from the `cpData`
      const seriesData = Object.keys(cpData || {}).map((itemName) => ({
        dataKey: itemName, // Use the item name as the dataKey for each series
        label: itemName, // Use the item name as the label for each series
      }));

      // Return a BarChart component for this `cp`
      return (
        <div key={cpName}>
          <h3>{cpName}</h3> {/* Title for the chart */}
          <BarChart
            dataset={combinedData} // Use the combined data for all series
            xAxis={[{ scaleType: "band", dataKey: "date", label: "Date" }]} // "Date" for x-axis
            series={seriesData} // Dynamically generated series
            {...chartSetting} // Assuming chartSetting includes your chart configurations
          />
        </div>
      );
    });

    return <div>{charts}</div>; // Render all charts
  }

  return (
    <div>
      <div className="mb-5">
        <div className="mb-3">
          <h4>Demand Analysis</h4>
        </div>
        <Container>
          <div className="mb-3">
            {overview && (
              <>
                <h6>
                  Select an item and collection to view the demand analysis.
                </h6>
                <Stack gap={3}>
                  <AnimatedMultiItem />
                  <AnimatedMultiCollections />
                </Stack>
              </>
            )}
          </div>
          <BarsDataset />
        </Container>
      </div>
    </div>
  );
};
