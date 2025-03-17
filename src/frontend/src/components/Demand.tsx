"use client";
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Container, Row, Stack } from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import { Box, CircularProgress, Typography } from "@mui/material";

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
  const [ilvl, setIlvl] = useState<any>();
  const [selectedOptionsItem, setSelectedOptionsItem] = useState<any>([]);
  const [selectedOptionsCollection, setSelectedOptionsCollection] =
    useState<any>([]);
  const animatedComponents = makeAnimated();
  const [error, setError] = useState<string | null>(null);
  const barsRef = useRef<boolean | null>(null);
  const lineRef = useRef<boolean | null>(null);
  const [loading, setLoading] = useState(true);

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
  useEffect(() => {
    const fetchIlvl = async () => {
      try {
        // Prepare the payload to match the Demand model
        const payload = {
          item_names: selectedOptionsItem.map((item: any) => item.label), // Array of item names
          collection_points: selectedOptionsCollection.map(
            (cp: any) => cp.label
          ), // Array of collection points
        };
        const response = await axios.post(
          "http://127.0.0.1:8000/qstate/",
          payload
        );
        setIlvl(response.data);
        console.log("hier ist ilvl", response.data);
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          console.log("Invalid response structure");
        } else {
          console.log(error);
        }
      }
    };
    fetchIlvl();
  }, [selectedOptionsCollection, selectedOptionsItem]);

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

  interface LocationData {
    Time: { [key: string]: string };
    [key: string]: { [key: string]: number } | { [key: string]: string };
  }

  interface ChartData {
    [location: string]: {
      timestamp: Date;
      [key: string]: Date | number;
    }[];
  }

  function BarsDataset2({ demandData }: { demandData: any }) {
    const charts = useMemo(() => {
      return Object.keys(demandData || {}).map((cpName) => {
        const cpData = demandData[cpName];

        // Dynamically get all item names
        const itemNames = Object.keys(cpData);

        // Collect all unique dates across all items
        const allDates = new Set(
          itemNames.flatMap((itemName) =>
            cpData[itemName].map((entry: any[]) => entry[0])
          )
        );
        const categories = Array.from(allDates).sort();

        // Create series with data for each item
        const series = itemNames.map((itemName) => ({
          name: itemName,
          data: categories.map((date) => {
            const matchingEntry = cpData[itemName].find(
              (entry: any[]) => entry[0] === date
            );
            return matchingEntry ? matchingEntry[1] : 0;
          }),
        }));

        return (
          <div key={cpName}>
            <div
              style={{
                width: "100%", // Responsive width
                maxWidth: "1500px", // Optional: Limit the maximum width
                height: "auto", // Automatically adjust height
                aspectRatio: "16 / 9", // Maintain aspect ratio (16:9)
                margin: "0 auto", // Center the chart horizontally
              }}
            >
              <ReactApexChart
                options={{
                  chart: { type: "bar", height: 350 },
                  title: { text: cpName },
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: "55%",
                      borderRadius: 5,
                    },
                  },
                  xaxis: {
                    categories: categories,
                    title: { text: "Date" },
                  },
                  dataLabels: { enabled: false },
                  tooltip: {
                    y: { formatter: (val) => val.toFixed(2) },
                  },
                }}
                series={series}
                type="bar"
                height={500}
              />
            </div>
          </div>
        );
      });
    }, [demandData]);

    return <>{charts}</>;
  }
  const InventoryChart = ({ data }: { data: Record<string, LocationData> }) => {
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
      setLoading(false);
    }, [data]);

    // Move all hooks before any conditional returns
    const chartData = useMemo(() => {
      if (!data || Object.keys(data).length === 0) return {};

      const processData = (
        rawData: Record<string, LocationData>
      ): ChartData => {
        const results: ChartData = {};

        Object.entries(rawData).forEach(([location, locationData]) => {
          const timePoints = Object.values(locationData.Time);
          const items = Object.keys(locationData).filter((k) => k !== "Time");

          results[location] = timePoints.map((time, idx) => {
            const point: { [key: string]: Date | number; timestamp: Date } = {
              timestamp: new Date(time),
            };

            items.forEach((item) => {
              const itemData = locationData[item] as { [key: string]: number };
              point[item] = itemData[idx + 1] || 0;
            });

            return point;
          });
        });

        return results;
      };

      return processData(data);
    }, [data]);

    const timestamps = useMemo(() => {
      if (!chartData || Object.keys(chartData).length === 0) return [];

      const allTimes = Object.values(chartData)
        .flat()
        .map((d) => d.timestamp.getTime());

      return Array.from(new Set(allTimes)).sort((a, b) => a - b);
    }, [chartData]);

    const series = useMemo(() => {
      if (!chartData || Object.keys(chartData).length === 0) return [];

      return Object.entries(chartData).flatMap(([location, locationData]) => {
        if (locationData.length === 0) return [];

        const timestampMap = new Map<number, { [key: string]: number }>();
        locationData.forEach((point) => {
          const { timestamp, ...rest } = point;
          timestampMap.set(
            timestamp.getTime(),
            rest as { [key: string]: number }
          );
        });

        const itemKeys = Object.keys(locationData[0]).filter(
          (key) => key !== "timestamp"
        );

        return itemKeys.map((key) => ({
          name: `${location} - ${key}`,
          data: timestamps.map((time) => timestampMap.get(time)?.[key] || 0),
        }));
      });
    }, [chartData, timestamps]);

    const options = useMemo<ApexCharts.ApexOptions>(
      () => ({
        chart: { type: "line", height: undefined },
        xaxis: {
          type: "datetime",
          categories: timestamps.map((t) => new Date(t).toISOString()),
        },
        stroke: { curve: "stepline" },
        dataLabels: { enabled: false },
        title: { text: "Item Level Development", align: "left" },
        markers: { hover: { sizeOffset: 4 } },
      }),
      [timestamps]
    );

    // Now do the early return after all hooks
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: "16 / 9",
          margin: "0 auto",
        }}
      >
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height="100%"
        />
      </div>
    );
  };

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
          <BarsDataset2 demandData={demandData} />
          <InventoryChart data={ilvl} />
        </Container>
      </div>
    </Container>
  );
};
