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
    label: itemType.charAt(0).toUpperCase() + itemType.slice(1), // Capitalize the first letter
  }));
  const CollectionsOptions = itemCollections.map((cp: string) => ({
    value: cp,
    label: cp.charAt(0).toUpperCase() + cp.slice(1), // Capitalize the first letter
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
    const handleDemandData = async () => {
      try {
        let data: { [key: string]: any } = {};
        for (const item of selectedOptionsItem) {
          const response = await axios.get(
            "http://127.0.0.1:8000/Demand/" + item.label
          );
          // Check if response data contains the expected structure
          if (response.data) {
            data[item.label] = response.data;
          } else {
            console.log("Invalid response structure");
          }
        }
        setDemandData(data);
      } catch (error) {
        console.error("Error fetching Demand Data", error);
      }
    };

    fetchOverview();
    handleDemandData();
  }, [selectedOptionsItem, selectedOptionsCollection]);

  function AnimatedMultiItem() {
    return (
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        defaultValue={itemOptions[0] ? [itemOptions[0]] : []}
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
        defaultValue={CollectionsOptions[0] ? [CollectionsOptions[0]] : []}
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
    // Restructure the data to ensure each date has all the item values
    const formattedData = Object.keys(demandData || {}).map((itemName) => {
      // For each itemName, map through the data and add an object that includes
      // the date and the value for that item.
      return demandData[itemName].map(([date, value]: [string, number]) => ({
        date,
        [itemName]: value, // Assign the value to the itemName key
      }));
    });

    // Flatten the formattedData to combine all item data into a single array
    const combinedData = formattedData.reduce((acc, curr) => {
      // Merge each array of data (for each item) into a single array of objects
      curr.forEach((entry: { date: any }) => {
        const existingEntry = acc.find(
          (e: { date: any }) => e.date === entry.date
        );
        if (existingEntry) {
          // If an entry for the same date exists, merge the new item data
          Object.assign(existingEntry, entry);
        } else {
          // If no entry exists for this date, add a new one
          acc.push(entry);
        }
      });
      return acc;
    }, []);

    // Create the series data dynamically from the demandData
    const seriesData = Object.keys(demandData || {}).map((itemName) => ({
      dataKey: itemName, // Use the item name as the dataKey for each series
      label: itemName, // Use the item name as the label for each series
    }));

    return (
      <BarChart
        dataset={combinedData} // Use the combined data for all series
        xAxis={[{ scaleType: "band", dataKey: "date", label: "Date" }]} // "Date" for x-axis
        series={seriesData} // Dynamically generated series
        {...chartSetting} // Assuming chartSetting includes your chart configurations
      />
    );
  }

  return (
    <div>
      <div className="mb-5">
        <div>
          <h4>Demand Analysis</h4>
        </div>
        <Container>
          <div className="mb-3">
            {overview && (
              <>
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
