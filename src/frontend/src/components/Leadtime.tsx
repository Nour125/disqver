"use client";
import axios from "axios";
import React, {
  ChangeEvent,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Container, Stack } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { LineChart } from "@mui/x-charts/LineChart";

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
      setLeadtime(null);
    }
  }, [selectedOptionsObject]);

  useEffect(() => {
    async function fetchLeadtime() {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/leadtime/${registeractivity}/${placementactivity}`
        );
        setLeadtime(response.data);
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
  }, [registeractivity, placementactivity]);

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
            label: "RO IDs",
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
        placeholder="Select an option"
        isClearable={true}
      />
    );
  }

  function LeadtimeTable() {
    const rows = Object.keys(leadtime.lead_time_data.ro_id).map((id) => ({
      id: id, // Unique identifier for each row
      ro_id: leadtime.lead_time_data.ro_id[id],
      placed_time: leadtime.lead_time_data.placed_time[id],
      delivered_time: leadtime.lead_time_data.delivered_time[id],
      lead_time: formatLeadTime(leadtime.lead_time_data.lead_time[id]),
    }));

    // Define Columns
    const columns: GridColDef[] = [
      { field: "ro_id", headerName: "RO ID", width: 150 },
      { field: "placed_time", headerName: "Placed Time", width: 200 },
      { field: "delivered_time", headerName: "Delivered Time", width: 200 },
      {
        field: "lead_time",
        headerName: "Lead Time",
        width: 300,
      },
    ];
    return (
      <div key={selectedOptionsObject}>
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

  //if (!leadtime) {
  // return <Container>Loading...</Container>;

  return (
    <Container>
      <div className="mb-5">
        <h4>Leadtime Analysis</h4>
        <Container>
          <Stack gap={3}>
            <SelectOrdertype />
            {leadtime && <LeadtimeTable />}
          </Stack>
        </Container>
      </div>
    </Container>
  );
};
