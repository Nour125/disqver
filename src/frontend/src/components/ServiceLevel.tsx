"use client";
import axios from "axios";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Container, Stack } from "react-bootstrap";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { LineChart } from "@mui/x-charts/LineChart";

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
  const [serviceLevel, setserviceLevel] = useState<any>();
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
      setserviceLevel(null);
    }
  }, [selectedOptionsObject]);

  useEffect(() => {
    async function fetchServiceLevel() {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/servicelevel/${registeractivity}/${placementactivity}`
        );
        setserviceLevel(response.data);
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          console.log("Invalid response structure");
        } else {
          console.log(error);
        }
      }
    }
    fetchServiceLevel();
  }, [registeractivity, placementactivity]);
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
        placeholder="Select an option"
        isClearable={true}
      />
    );
  }
  function ServiceLevelTable() {
    const rows = Object.keys(serviceLevel.service_level_data.ro_id).map(
      (id) => ({
        id: id, // Unique identifier for each row
        ro_id: serviceLevel.service_level_data.ro_id[id],
        QuantityPlaced: serviceLevel.service_level_data.QuantityPlaced[id],
        QuantityArrived: serviceLevel.service_level_data.QuantityArrived[id],
        difference: serviceLevel.service_level_data.difference[id],
      })
    );

    // Define Columns
    const columns: GridColDef[] = [
      { field: "ro_id", headerName: "RO ID", width: 150 },
      { field: "QuantityPlaced", headerName: "Quantity Placed", width: 200 },
      { field: "QuantityArrived", headerName: "Quantity Arrived", width: 200 },
      { field: "difference", headerName: "Difference", width: 200 },
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

  return (
    <Container>
      <div className="mb-5">
        <h4>Service Level Analysis</h4>

        <Container>
          <Stack gap={3}>
            <SelectOrdertype />
            {serviceLevel && <ServiceLevelTable />}
          </Stack>
        </Container>
      </div>
    </Container>
  );
};
