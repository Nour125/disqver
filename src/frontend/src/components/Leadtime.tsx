"use client";
import axios from "axios";
import React, {
  ChangeEvent,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Alert, Container, Stack } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { LineChart } from "@mui/x-charts/LineChart";
import ReactApexChart from "react-apexcharts";
import { AlertTitle } from "@mui/material";

interface LeadtimeProps {
  register_activity_Prop: string | undefined;
  placement_activity_Prop: string | undefined;
  userInputData_Prop: any;
}

export const Leadtime: React.FC<LeadtimeProps> = ({
  register_activity_Prop,
  placement_activity_Prop,
  userInputData_Prop,
}) => {
  const [leadtime, setLeadtime] = useState<any>();
  const animatedComponents = makeAnimated();
  const [selectedOptionsObject, setSelectedOptionsObject] = useState<any>([]);
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
    async function fetchLeadtime() {
      let registeractivity;
      let placementactivity;
      if (
        selectedOptionsObject?.label === userInputData_Prop?.replenishment_Order
      ) {
        registeractivity = userInputData_Prop?.register_Replenishment_Order;
        placementactivity = userInputData_Prop?.placed_Replenishment_Order;
      } else if (
        selectedOptionsObject?.label === userInputData_Prop?.Customer_Order
      ) {
        registeractivity = userInputData_Prop?.register_Customer_Order;
        placementactivity = userInputData_Prop?.placed_Customer_Order;
      } else {
        setLeadtime(null);
      }
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/leadtime/${registeractivity}/${placementactivity}`
        );
        setLeadtime(response.data);
        console.log(response.data);
      } catch (error: any) {
        setSelectedOptionsObject(null);
        if (error.response && error.response.status === 400) {
          console.log("Invalid response structure");
        } else {
          console.log(error);
        }
      }
    }
    fetchLeadtime();
  }, [selectedOptionsObject]);

  function formatLeadTime(leadTimeInSeconds: number): string {
    const days = Math.floor(leadTimeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((leadTimeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((leadTimeInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(leadTimeInSeconds % 60);

    return `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
  }

  function LeadtimeLineChart() {
    if (!leadtime || !leadtime.lead_time_data) {
      return <div>No data available</div>;
    }
    // Extract `ro_id` and `lead_time` as arrays
    const roIds = Object.values(leadtime.lead_time_data.ro_id);
    const leadTimes = Object.values(leadtime.lead_time_data.lead_time) as (
      | number
      | null
    )[];
    const supplier = Object.values(leadtime.supplier_data.supplier);

    return (
      <LineChart
        height={300}
        series={[{ data: leadTimes, label: "Lead Time" }]}
        xAxis={[
          {
            scaleType: "point",
            data: roIds,
            label: "Order IDs",
          },
        ]}
      />
    );
  }

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
            ? options.map((object: string | undefined) =>
                object
                  ? { value: object, label: object }
                  : { value: "", label: "" }
              )
            : []
        }
        onChange={setSelectedOptionsObject}
        value={selectedOptionsObject}
        placeholder="Select an order type"
        isClearable={true}
      />
    );
  }

  function LeadtimeTable({ leadtime }: { leadtime: any }) {
    if (!leadtime || !leadtime.lead_time_data) {
      return <div></div>;
    }
    const rows = Object.keys(leadtime?.lead_time_data?.ro_id || {}).map(
      (id) => ({
        id: id, // Unique identifier for each row
        ro_id: leadtime.lead_time_data.ro_id[id],
        placed_time: leadtime.lead_time_data.placed_time[id],
        delivered_time: leadtime.lead_time_data.delivered_time[id],
        lead_time: formatLeadTime(leadtime.lead_time_data.lead_time[id]),
      })
    );

    // Define Columns
    const columns: GridColDef[] = [
      { field: "ro_id", headerName: "Order ID", width: 150 },
      { field: "placed_time", headerName: "Placed Time", width: 200 },
      { field: "delivered_time", headerName: "Delivered Time", width: 200 },
      {
        field: "lead_time",
        headerName: "Lead Time",
        width: 300,
      },
    ];
    return (
      <div key={selectedOptionsObject?.label}>
        <h3>{selectedOptionsObject?.label}</h3>
        <Box sx={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </div>
    );
  }

  // Interfaces
  interface LeadTimeData {
    ro_id: { [key: string]: string };
    placed_time: { [key: string]: string };
    delivered_time: { [key: string]: string };
    lead_time: { [key: string]: number };
  }

  interface SupplierData {
    ro_id: { [key: string]: string };
    supplier: { [key: string]: string };
  }

  interface LeadTimeHistogram {
    lead_time_data: LeadTimeData;
    supplier_data: SupplierData;
  }

  const LeadTimeHistogram = ({ data }: { data: LeadTimeHistogram }) => {
    if (!data) {
      return <></>;
    }
    const hasSuppliers = data.supplier_data && data.supplier_data.supplier;

    const supplierLeadTimes: { [key: string]: number[] } = {
      Overall: Object.values(data.lead_time_data.lead_time),
    };

    if (hasSuppliers) {
      const roToSupplier = Object.entries(data.supplier_data.ro_id).reduce(
        (acc, [key, roId]) => {
          acc[roId] = data.supplier_data.supplier[key];
          return acc;
        },
        {} as { [key: string]: string }
      );

      Object.entries(data.lead_time_data.ro_id).forEach(([key, roId]) => {
        const supplier = roToSupplier[roId];
        if (supplier) {
          if (!supplierLeadTimes[supplier]) {
            supplierLeadTimes[supplier] = [];
          }
          supplierLeadTimes[supplier].push(data.lead_time_data.lead_time[key]);
        }
      });
    }

    const allTimes = Object.values(data.lead_time_data.lead_time);
    const min = Math.min(...allTimes);
    const max = Math.max(...allTimes);
    const binWidth = (max - min) / 10;
    const bins = Array.from({ length: 11 }, (_, i) => min + i * binWidth);

    const series = Object.entries(supplierLeadTimes).map(
      ([supplier, times]) => {
        const frequencies = new Array(10).fill(0);
        times.forEach((time) => {
          const binIndex = Math.min(Math.floor((time - min) / binWidth), 9);
          frequencies[binIndex]++;
        });

        return {
          name: supplier,
          data: frequencies,
        };
      }
    );

    const options = {
      chart: {
        type: "bar" as const,
        height: 350,
        stacked: false,
      },
      xaxis: {
        categories: bins.slice(0, -1).map((bin) => bin.toFixed(0)),
        title: {
          text: "Lead Time (seconds)",
        },
      },
      yaxis: {
        title: {
          text: "Frequency",
        },
      },
      title: {
        text: "Distribution of Lead Times",
        align: "center" as const,
      },
      legend: {
        position: "right" as const,
      },
    };

    return (
      <div className="w-full max-w-4xl">
        {!hasSuppliers && (
          <Alert variant="danger" className="mb-4">
            <AlertTitle>No supplier data available</AlertTitle>
          </Alert>
        )}
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    );
  };
  //if (!leadtime) {
  // return <Container>Loading...</Container>;

  return (
    <Container>
      <div className="mb-5">
        <h4>Leadtime Analysis</h4>
        <Container>
          <Stack gap={3}>
            <SelectOrdertype />
            <LeadtimeTable leadtime={leadtime} />
            <LeadTimeHistogram data={leadtime} />
          </Stack>
        </Container>
      </div>
    </Container>
  );
};
