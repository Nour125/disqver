"use client";
import axios from "axios";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Container, Stack } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { LineChart } from "@mui/x-charts/LineChart";
import ReactApexChart from "react-apexcharts";

interface ServiceLevelProps {
  register_activity_Prop: string | undefined;
  placement_activity_Prop: string | undefined;
  userInputData_Prop: any;
}

export const ServiceLevel: React.FC<ServiceLevelProps> = ({
  register_activity_Prop,
  placement_activity_Prop,
  userInputData_Prop,
}) => {
  const [serviceLevelData, setserviceLevelData] = useState<any>();
  const [serviceLevelType, setserviceLevelType] = useState<any>();

  const animatedComponents = makeAnimated();
  const [selectedOptionsObject, setSelectedOptionsObject] = useState<any>([]);
  const [registeractivity, setRegisteractivity] = useState<string | undefined>(
    undefined
  );
  const [placementactivity, setPlacementactivity] = useState<
    string | undefined
  >(undefined);
  useEffect(() => {
    if (register_activity_Prop && placement_activity_Prop) {
      if (
        register_activity_Prop ===
          userInputData_Prop?.register_Replenishment_Order &&
        placement_activity_Prop ===
          userInputData_Prop?.placed_Replenishment_Order
      ) {
        setSelectedOptionsObject({
          value: userInputData_Prop?.replenishment_Order,
          label: userInputData_Prop?.replenishment_Order,
        });
      } else if (
        register_activity_Prop ===
          userInputData_Prop?.register_Customer_Order &&
        placement_activity_Prop === userInputData_Prop?.placed_Customer_Order
      ) {
        setSelectedOptionsObject({
          value: userInputData_Prop?.Customer_Order,
          label: userInputData_Prop?.Customer_Order,
        });
      }
    }
  }, [register_activity_Prop, placement_activity_Prop]);
  useEffect(() => {
    if (
      selectedOptionsObject?.label === userInputData_Prop?.replenishment_Order
    ) {
      setRegisteractivity(userInputData_Prop?.register_Replenishment_Order);
      setPlacementactivity(userInputData_Prop?.placed_Replenishment_Order);
    } else if (
      selectedOptionsObject?.label === userInputData_Prop?.Customer_Order
    ) {
      setRegisteractivity(userInputData_Prop?.register_Customer_Order);
      setPlacementactivity(userInputData_Prop?.placed_Customer_Order);
    } else {
      setserviceLevelData(null);
    }
  }, [selectedOptionsObject]);

  useEffect(() => {
    async function fetchServiceLevel() {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/servicelevel/${registeractivity}/${placementactivity}/${serviceLevelType.value}`
        );
        setserviceLevelData(response.data);
        console.log(response.data);
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          console.log("Invalid response structure");
        } else {
          console.log(error);
        }
      }
    }
    fetchServiceLevel();
  }, [registeractivity, placementactivity, serviceLevelType]);
  function SelectOrdertype() {
    let options = [
      userInputData_Prop.replenishment_Order,
      userInputData_Prop.Customer_Order,
    ]; // chaning later to the objects
    return (
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        options={
          options
            ? options.map((object: string) => ({
                value: object,
                label: object,
              }))
            : []
        }
        onChange={setSelectedOptionsObject}
        value={selectedOptionsObject}
        placeholder="Select an order type"
        isClearable={true}
      />
    );
  }
  function SelectServiceLeveltype() {
    let options = ["Alpha", "Beta"]; // chaning later to the objects
    return (
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        options={
          options
            ? options.map((object: string) => ({
                value: object,
                label: object,
              }))
            : []
        }
        onChange={(selectedOption) => {
          setserviceLevelType(selectedOption);
          setserviceLevelData(null);
        }}
        value={serviceLevelType}
        placeholder="Select a Service Level"
        isClearable={true}
      />
    );
  }

  function renderAlphaServiceLevel(alphaData: any) {
    // Check if alphaData exists and has table data (first element)
    if (!alphaData || !alphaData[0]) {
      return <div>No alpha service level data available</div>;
    }

    // Separate table data and overall alpha value
    const tableData = alphaData[0];
    const overallAlpha = alphaData[1];

    // Build rows from the table data using the keys of the ro_id object
    const rows = Object.keys(tableData.ro_id).map((key) => ({
      id: key,
      ro_id: tableData.ro_id[key],
      QuantityPlaced: tableData.QuantityPlaced[key],
      QuantityArrived: tableData.QuantityArrived[key],
      difference: tableData.difference[key],
    }));

    // Define columns for the DataGrid
    const columns: GridColDef[] = [
      { field: "ro_id", headerName: "Order ID", width: 150 },
      { field: "QuantityPlaced", headerName: "Quantity Placed", width: 150 },
      { field: "QuantityArrived", headerName: "Quantity Arrived", width: 150 },
      { field: "difference", headerName: "Difference", width: 150 },
    ];

    // Convert overallAlpha (e.g., 0.4967) to percentage value for the chart
    const overallAlphaPercentage = overallAlpha * 100;

    // Chart configuration for a radial bar chart
    const chartState = {
      series: [overallAlphaPercentage],
      options: {
        chart: {
          height: 350,
          type: "radialBar" as "radialBar",
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false,
            },
          },
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: "70%",
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: "22px",
              },
              value: {
                show: true,
                fontSize: "16px",
                formatter: function (val: number) {
                  return val.toFixed(2) + "%";
                },
              },
            },
          },
        },
        labels: ["Alpha Service Level"],
      },
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          alignItems: "center",
        }}
      >
        {/* Alpha Service Level Table */}
        <Box sx={{ height: 400, width: "70%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            initialState={{}}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>

        {/* Alpha Service Level Pie (Radial Bar) Chart */}
        <div
          style={{ width: "30%", display: "flex", justifyContent: "center" }}
        >
          <ReactApexChart
            options={chartState.options}
            series={chartState.series}
            type="radialBar"
            height={350}
          />
        </div>
      </div>
    );
  }
  function renderBetaServiceLevel(betaDataSet: any) {
    // Check if betaDataSet exists and has valid data
    if (!betaDataSet || !betaDataSet[0]) {
      return <div>No beta service level data available</div>;
    }

    // The betaDataSet consists of two elements:
    // [0] - detailed per-item data object
    // [1] - overall beta service level value (a fraction)
    const betaData = betaDataSet[0];
    const overallBeta = betaDataSet[1];

    // Extract item names and beta_i values, converting beta_i values to percentages.
    // If beta_i is not a number (null or otherwise), set it to 0.
    const items = Object.values(betaData.item) as string[];
    const betaValues = Object.values(betaData.beta_i).map((v) =>
      typeof v === "number" ? v * 100 : 0
    );
    const overallBetaPercentage =
      typeof overallBeta === "number" ? overallBeta * 100 : 0;

    // Polar Area Chart configuration for item-level percentages
    const polarChartState = {
      series: betaValues,
      options: {
        chart: {
          type: "polarArea" as "polarArea",
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false,
            },
          },
        },
        stroke: {
          colors: ["#fff"],
        },
        labels: items,
        fill: {
          opacity: 0.8,
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    };

    // Radial Bar Chart configuration for overall beta service level
    const pieChartState = {
      series: [overallBetaPercentage],
      options: {
        chart: {
          height: 350,
          type: "radialBar" as "radialBar", // type assertion needed
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false,
            },
          },
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: "70%",
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: "18px",
              },
              value: {
                show: true,
                fontSize: "16px",
                formatter: function (val: number) {
                  return val.toFixed(2) + "%";
                },
              },
            },
          },
        },
        labels: ["Beta Service Level"],
      },
    };

    // Return the two charts side by side in a flex container.
    return (
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ width: "550px", height: "400px" }}>
          <ReactApexChart
            options={polarChartState.options}
            series={polarChartState.series}
            type="polarArea"
            width="100%"
            height="100%"
          />
        </div>
        <div style={{ width: "450px", height: "400px" }}>
          <ReactApexChart
            options={pieChartState.options}
            series={pieChartState.series}
            type="radialBar"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    );
  }

  return (
    <Container>
      <div className="mb-5">
        <h4>Service Level Analysis</h4>
        <Container>
          <Stack gap={3}>
            <SelectOrdertype />
            <SelectServiceLeveltype />
            {serviceLevelData &&
              serviceLevelType?.value === "Alpha" &&
              renderAlphaServiceLevel(serviceLevelData)}
            {serviceLevelData &&
              serviceLevelType?.value === "Beta" &&
              renderBetaServiceLevel(serviceLevelData)}
          </Stack>
        </Container>
      </div>
    </Container>
  );
};
