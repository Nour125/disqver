"use client";
import axios from "axios";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Container, Stack } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/system";

interface LeadtimeProps {
  register_activity: string;
  placement_activity: string;
}

export const Leadtime: React.FC<LeadtimeProps> = ({
  register_activity,
  placement_activity,
}) => {
  const [leadtime, setLeadtime] = useState<any>();
  const animatedComponents = makeAnimated();

  useEffect(() => {
    async function fetchLeadtime(
      register_activity: string,
      placement_activity: string
    ) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/leadtime/${register_activity}/${placement_activity}`
        );
        setLeadtime(response.data);
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          console.log("Invalid response structure");
        } else {
          console.log(error);
        }
      }
    }
    fetchLeadtime(register_activity, placement_activity);
  }, [register_activity, placement_activity]);

  function LeadtimeLineChart() {
    return <div>Line Chart</div>;
  }

  function SelectOrdertype() {
    let options = [register_activity, placement_activity]; // chaning later to the objects
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
        placeholder="Select an option"
        isClearable={true}
      />
    );
  }

  function LeadtimeTable() {
    function formatLeadTime(leadTimeInSeconds: number): string {
      const days = Math.floor(leadTimeInSeconds / (24 * 60 * 60));
      const hours = Math.floor(
        (leadTimeInSeconds % (24 * 60 * 60)) / (60 * 60)
      );
      const minutes = Math.floor((leadTimeInSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(leadTimeInSeconds % 60);

      return `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
    }
    if (!leadtime || !leadtime.lead_time_data) {
      return <div>No data available</div>;
    }
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
            <LeadtimeTable />
            <LeadtimeLineChart />
          </Stack>
        </Container>
      </div>
    </Container>
  );
};
