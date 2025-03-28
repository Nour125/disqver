"use client";

import axios from "axios";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Select, { ActionMeta, SingleValue } from "react-select";
import Grid from "@mui/material/Grid";
import makeAnimated from "react-select/animated";
import {
  Box,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import Button from "react-bootstrap/Button";
import { QuantityGraph } from "./InteractiveGraph";
interface UserInputProps {
  overview: any;
}

export const UserInput: React.FC<UserInputProps> = ({ overview }) => {
  const objectTypes = overview ? overview["Object Types"] : [];
  const CollectionPoints = overview ? overview["Collection"] : [];
  const activities = overview ? overview["Activity"] : [];
  const animatedComponents = makeAnimated();
  const [selectedRO_bool, setSelectedRO_bool] = useState(false);
  const [selectedCO_bool, setSelectedCO_bool] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [inputData, setInputData] = useState<any>(undefined);
  const [selected_RO, setSelected_RO] = useState<any>(undefined);
  const [selected_CO, setSelected_CO] = useState<any>(undefined);
  const [register_Replenishment_Order, set_register_Replenishment_Order] =
    useState<any>(undefined);
  const [placed_Replenishment_Order, set_placed_Replenishment_Order] =
    useState<any>(undefined);
  const [register_Customer_Order, set_register_Customer_Order] =
    useState<any>(undefined);
  const [placed_Customer_Order, set_placed_Customer_Order] =
    useState<any>(undefined);

  function AnimatedRO() {
    return (
      <Container>
        <Select
          closeMenuOnSelect={false}
          components={animatedComponents}
          options={
            objectTypes
              ? objectTypes.map((object: string) => ({
                  value: object,
                  label: object,
                }))
              : []
          }
          onChange={(selectedOption) => {
            setSelected_RO(selectedOption);
            setSelectedRO_bool(true);
          }}
          value={selected_RO}
          placeholder="Select an object type which you buy"
          isClearable={true}
        />
        {selectedRO_bool && (
          <>
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              options={
                activities
                  ? activities.map((activity: string) => ({
                      value: activity,
                      label: activity,
                    }))
                  : []
              }
              onChange={(register_Replenishment_Order) => {
                set_register_Replenishment_Order(register_Replenishment_Order);
              }}
              value={register_Replenishment_Order}
              placeholder="Select an activity for registerring"
              isClearable={true}
            />
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              options={
                activities
                  ? activities.map((activity: string) => ({
                      value: activity,
                      label: activity,
                    }))
                  : []
              }
              onChange={(placed_Replenishment_Order) => {
                set_placed_Replenishment_Order(placed_Replenishment_Order);
              }}
              value={placed_Replenishment_Order}
              placeholder="Select an activity for placment"
              isClearable={true}
            />
          </>
        )}
      </Container>
    );
  }
  function AnimatedCO() {
    return (
      <Container>
        <Select
          closeMenuOnSelect={false}
          components={animatedComponents}
          options={
            objectTypes
              ? objectTypes.map((object: string) => ({
                  value: object,
                  label: object,
                }))
              : []
          }
          onChange={(selectedOption) => {
            setSelected_CO(selectedOption);
            setSelectedCO_bool(true);
          }}
          value={selected_CO}
          placeholder="Select an object type which you sell"
          isClearable={true}
        />
        {selectedCO_bool && (
          <>
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              options={
                activities
                  ? activities.map((activity: string) => ({
                      value: activity,
                      label: activity,
                    }))
                  : []
              }
              onChange={(selectedOption) => {
                set_register_Customer_Order(selectedOption);
              }}
              value={register_Customer_Order}
              placeholder="Select an activity for registerring"
              isClearable={true}
            />
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              options={
                activities
                  ? activities.map((activity: string) => ({
                      value: activity,
                      label: activity,
                    }))
                  : []
              }
              onChange={(selectedOption) => {
                set_placed_Customer_Order(selectedOption);
              }}
              value={placed_Customer_Order}
              placeholder="Select an activity for placment"
              isClearable={true}
            />
          </>
        )}
      </Container>
    );
  }
  // State to track selected options for each collection point
  interface CollectionPointSelection {
    type: "Physical" | "Planning" | null;
    planningPartner?: string | null; // Only relevant if type is "Physical"
  }

  const [selectedCpOptions, setSelectedCpOptions] = useState<{
    [key: string]: CollectionPointSelection;
  }>(
    CollectionPoints.reduce(
      (acc: { [key: string]: CollectionPointSelection }, cp: string) => {
        acc[cp] = { type: null, planningPartner: null };
        return acc;
      },
      {}
    )
  );

  interface Option {
    value: string;
    label: string;
  }

  const CollectionPoints_sliders = () => {
    return (
      <Box>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Collection Points
        </Typography>

        {CollectionPoints.map((cp: string) => {
          // Create options for react-select
          const options: Option[] = CollectionPoints.filter(
            (p: string) => p !== cp
          ).map((p: string) => ({ value: p, label: p }));

          return (
            <Box
              key={cp}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="body1" sx={{ mr: 2 }}>
                {cp}
              </Typography>

              <RadioGroup
                row
                value={selectedCpOptions[cp]?.type || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value as "Physical" | "Planning";
                  setSelectedCpOptions((prev) => ({
                    ...prev,
                    [cp]: {
                      type: value,
                      planningPartner:
                        value === "Physical" ? prev[cp]?.planningPartner : null,
                    },
                  }));
                }}
              >
                <FormControlLabel
                  value="Physical"
                  control={<Radio color="primary" />}
                  label="Physical"
                />
                <FormControlLabel
                  value="Planning"
                  control={<Radio color="primary" />}
                  label="Planning"
                />
              </RadioGroup>

              {selectedCpOptions[cp]?.type === "Physical" && (
                <Box sx={{ ml: 2, minWidth: 220 }}>
                  <Select<Option>
                    value={
                      options.find(
                        (opt) =>
                          opt.value === selectedCpOptions[cp]?.planningPartner
                      ) || null
                    }
                    onChange={(newValue: SingleValue<Option>) => {
                      setSelectedCpOptions((prev) => ({
                        ...prev,
                        [cp]: {
                          ...prev[cp],
                          planningPartner: newValue?.value || null,
                        },
                      }));
                    }}
                    placeholder="Choose the corresponding planning system"
                    options={options}
                    isClearable
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };
  const handleClick = async () => {
    setShowGraph(true);
    try {
      // Prepare the data in the format required by the `UserInput` model
      const payload = {
        replenishment_Order: selected_RO.label,
        register_Replenishment_Order: register_Replenishment_Order.label,
        placed_Replenishment_Order: placed_Replenishment_Order.label,
        Customer_Order: selected_CO.label,
        register_Customer_Order: register_Customer_Order.label,
        placed_Customer_Order: placed_Customer_Order.label,
        collection_Point: selectedCpOptions, // Assuming `selectedOptions` is already a dictionary
      };

      // Log the payload to verify the structure

      // Make the POST request
      const response = await axios.post(
        "http://127.0.0.1:8000/UserInput/",
        payload
      );
      setInputData(response.data);
      console.log("Response:", response.data);

      // Handle success
      console.log("Response:", inputData);
    } catch (error) {
      // Handle errors
      console.error("Error submitting data:", error);
      alert("Failed to submit data.");
    }
  };

  return (
    <Container>
      <div className="mb-5">
        <h4>Input Information</h4>
        <Box sx={{ flexGrow: 1 }}>
          <Grid
            container
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{ alignItems: "stretch" }}
          >
            {/* Left Column: AnimatedRO and AnimatedCO */}
            <Grid item xs={6}>
              <Grid container rowSpacing={1} direction="column">
                <Grid item sx={{ flex: 1 }}>
                  <AnimatedRO />
                </Grid>
                <Grid item sx={{ flex: 1 }}>
                  <AnimatedCO />
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column: CollectionPoints_sliders */}
            <Grid item xs={6} sx={{ height: "100%" }}>
              <CollectionPoints_sliders />
            </Grid>
          </Grid>
        </Box>
      </div>

      {/* Button to display QuantityGraph */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          onClick={handleClick}
          disabled={
            !(
              Object.values(selectedCpOptions).every((option) => option) &&
              register_Replenishment_Order &&
              placed_Replenishment_Order &&
              register_Customer_Order &&
              placed_Customer_Order
            )
          }
        >
          Start
        </Button>
      </Box>

      {/* Conditionally render QuantityGraph */}
      {showGraph && (
        <div style={{ marginTop: "20px" }}>
          <QuantityGraph overview={overview} userInputData={inputData} />
        </div>
      )}
    </Container>
  );
};
