"use client";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

export const Demand: React.FC = () => {
  const [overview, setOverview] = useState<any>();
  const [demandData, setDemandData] = useState<any>();
  const itemTypes = overview ? overview["Item Types"] : [];
  const itemCollections = overview ? overview["Collection"] : [];
  const [selectedOptionsItem, setSelectedOptionsItem] = useState([]);
  const [selectedOptionsCollection, setSelectedOptionsCollection] = useState(
    []
  );

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
    const fetchDemandData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/Demand/Tube");
        // Check if response data contains the expected structure
        if (response.data && response.data.Events) {
          setDemandData(response.data);
        } else {
          console.log("Invalid response structure");
        }
      } catch (error) {
        console.error("Error fetching Demand Data", error);
      }
    };

    fetchOverview();
    fetchDemandData();
  }, []);
  const handleChangeItem = (selected: any) => {
    setSelectedOptionsItem(selected);
    console.log("Selected options:", selected);
  };
  const handleChangeCollection = (selected: any) => {
    setSelectedOptionsCollection(selected);
    console.log("Selected options:", selected);
  };
  function AnimatedMultiItem() {
    return (
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
        options={itemOptions}
        onChange={handleChangeItem}
        value={selectedOptionsItem}
      />
    );
  }

  function AnimatedMultiCollections() {
    return (
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        isMulti
        options={CollectionsOptions}
        onChange={handleChangeCollection}
        value={selectedOptionsCollection}
      />
    );
  }

  return (
    <div>
      <AnimatedMultiItem />
      <AnimatedMultiCollections />
    </div>
  );
};
