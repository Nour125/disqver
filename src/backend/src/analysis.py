import os
import time
import numpy as np
import pandas as pd
from qrpm.app.data_operations.log_overview import get_log_overview
from qrpm.analysis.dataImport import load_qel_from_file
import math
from qel_simulation import QuantityEventLog, QuantityGraph
from qrpm.app.qnet_component import discover_qnet, get_dot_string
import qrpm.app.dataStructure as ds
from qrpm.GLOBAL import *
import qrpm.analysis.objectQuantities as oqtyy
import json
from qrpm.analysis import quantityState as qstate


def sorted_directory_listing_by_creation_time_with_os_listdir(directory):
    def get_creation_time(item):
        item_path = os.path.join(directory, item)
        print(item_path)
        print(time.ctime(os.path.getctime(item_path)))
        return os.path.getctime(item_path)

    items = os.listdir(directory)
    sorted_items = sorted(items, key=get_creation_time, reverse=True)
    return sorted_items


# get the last uploaded file from the files directory
def get_last_uploaded_file():
    try:
        files = sorted_directory_listing_by_creation_time_with_os_listdir(
            r"src\backend\files"
        )
        if len(files) == 0:
            raise FileNotFoundError("No files found in the directory.")
        files = ["src\\backend\\files\\" + file for file in files]

        return files[0]
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None


def replace_nan_with_empty_string(d: dict):
    for key, value in d.items():
        if isinstance(value, dict):
            replace_nan_with_empty_string(value)
        elif isinstance(value, float) and math.isnan(value):
            d[key] = ""
    return d


def clean_dataframe_for_json(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean DataFrame by replacing NaN, infinite values, and converting problematic data types
    for JSON serialization.
    """
    # Make a copy to avoid modifying the original DataFrame
    df = df.copy()

    # Replace NaN/infinite values with None (which converts to null in JSON)
    df = df.replace([np.inf, -np.inf], None)
    df = df.where(pd.notnull(df), None)

    # Convert all numeric columns that might contain NaN to objects
    numeric_columns = df.select_dtypes(include=["float64", "int64"]).columns
    for col in numeric_columns:
        df[col] = df[col].astype(object).where(pd.notnull(df[col]), None)

    return df


def send_overview_data():
    # create a QEL object from the last uploaded file
    qel = load_qel_from_file(file_path=get_last_uploaded_file())

    # get Overview data from the qel
    overview = get_log_overview(qel)

    # fill nan with ""
    overview = replace_nan_with_empty_string(overview)
    return overview


# get the sample data from the table
def get_table_data(table_name):
    # create a QEL object from the last uploaded file
    qel = load_qel_from_file(file_path=get_last_uploaded_file())
    if table_name == "Events":
        return replace_nan_with_empty_string(
            qel.event_activity_timestamp.sample(10).to_dict(orient="dict")
        )
    elif table_name == "Objects":
        return replace_nan_with_empty_string(
            qel.objects.sample(10).to_dict(orient="dict")
        )
    elif table_name == "Active Quantity Relations":
        return replace_nan_with_empty_string(
            qel.active_quantity_operations.sample(10).to_dict(orient="dict")
        )
    elif table_name == "Quantity Relations":
        overview = send_overview_data()
        return overview["quantity relations"]
    elif table_name == "Item Types":
        return dict.fromkeys(qel.item_types, "")
    elif table_name == "Collection":
        return dict.fromkeys(qel.collection_points, "")
    elif table_name == "Quantity Activities":
        overview = send_overview_data()
        return dict.fromkeys(overview["q-activities"], "")
    elif table_name == "Quantity Object Types":
        overview = send_overview_data()
        return dict.fromkeys(overview["Quantity Object Types"], "")


def get_item_types_by_cp(cp: str):
    qel = load_qel_from_file(file_path=get_last_uploaded_file())
    return qel.item_types_collection[cp]


#############################################################
############ Determin demand for an item ####################
#############################################################
def determin_demand_for_months(
    item_type: str, collection_point: str
) -> list[tuple[str, float]]:
    # create a QEL object from the last uploaded file
    qel = load_qel_from_file(file_path=get_last_uploaded_file())
    qop = qel.get_quantity_operations()

    # Ensure the "Time" column is in datetime format
    qop["Time"] = pd.to_datetime(qop["Time"])
    qop = qop.loc[qop[item_type] < 0]
    if item_type not in get_item_types_by_cp(collection_point):
        raise ValueError(f"Item {item_type} not found in the {collection_point}.")
    elif "Collection" in qop.columns:
        if collection_point in qop["Collection"].values:
            qop = qop.loc[qop["Collection"].isin([collection_point])]
        else:
            raise ValueError(f"Item {item_type} not found in the {collection_point}.")
    else:
        raise KeyError("Column 'Collection' not found in the DataFrame.")
    qop = qop[[item_type, "Time"]]
    qop["year_month"] = qop["Time"].dt.to_period("M")

    demand = []
    for period, group in qop.groupby("year_month"):
        monthly_demand = group[item_type].sum()
        demand.append((str(period), -monthly_demand))
    return demand


"""
def determine_forecast(
    alpha: float, item_type: str, period: int
):  # period: #number of months to calculate the old forecast
    # item_type: the item type for which the forecast is to be determined
    # alpha: the smoothing constant

    demandlist = determin_demand_for_months(item_type=item_type)
    demandlist = demandlist[-period:]
    old_forecast = (sum([demand for (_, demand) in demandlist])) / len(demandlist)
    print(old_forecast)
    last_period_demand = demandlist[-1][1]
    print(last_period_demand)
    new_forecast = old_forecast + (alpha * (last_period_demand - old_forecast))
    return round(new_forecast, 1)


def mean_absolute_deviation_for_demand(demand: list[tuple[str, float]]):
    # calculate the mean absolute deviation for the demand
    demand = [demand for (_, demand) in demand]
    mean_demand = sum(demand) / len(demand)
    mean_absolute_deviation = sum([abs(d - mean_demand) for d in demand]) / len(demand)
    return round(mean_absolute_deviation, 1)


def forecast_error(item_type: str):
    demandlist = determin_demand_for_months(item_type=item_type)
    MAD = mean_absolute_deviation_for_demand(demandlist)
    return MAD
"""

# print(forecast_error("PADS Tire"))
# print(determine_forecast(alpha=0.1, item_type="PADS Tire", period=3))
# print(determin_demand_for_months("Tube", "Company Warehouse"))


#############################################################
############ Determin Lead Time for an RO ###################
#############################################################


def get_lead_time(register_activity: str, placement_activity: str) -> pd.DataFrame:
    """
    Calculate lead time based on the QuantityEventLog, register activity, and placement activity.

    Parameters:
        qel (QuantityEventLog): Quantity event log object.
        register_activity (str): Name of the register activity (e.g., PlaceReplenishmentOrder).
        placement_activity (str): Name of the placement activity (e.g., PutDeliveryInStock).

    Returns:
        pd.DataFrame: DataFrame containing ro_id, placed_time, delivered_time, and lead_time.
    """
    # Step 1: Extract events and map them to objects
    qel = load_qel_from_file(file_path=get_last_uploaded_file())
    register_events = qel.get_event_data_activity(
        register_activity
    )  # Get events for register activity
    placement_events = qel.get_event_data_activity(
        placement_activity
    )  # Get events for placement activity
    event_object = qel.e2o  # Event-object mapping
    object_quantities = qel.object_quantities  # Quantity operations
    qel_objects = qel.objects  # Objects
    # Ensure "Index" is treated as a column
    register_events = register_events.reset_index()  # Convert index to a column
    placement_events = placement_events.reset_index()  # Convert index to a column
    qel_objects = qel_objects.reset_index()  # Convert index to a column

    # Step 2: Map objects to register events (PlacedRO)
    placed_ro = (
        event_object[event_object["ocel_event_id"].isin(register_events["ocel_id"])]
        .merge(register_events, left_on="ocel_event_id", right_on="ocel_id")
        .rename(columns={"ocel_object_id": "ro_id", "ocel_time": "placed_time"})[
            ["ro_id", "placed_time"]
        ]
    )

    # Step 3: Map objects to placement events (DeliveredRO)
    delivered_ro = (
        event_object[event_object["ocel_event_id"].isin(placement_events["ocel_id"])]
        .merge(placement_events, left_on="ocel_event_id", right_on="ocel_id")
        .rename(columns={"ocel_object_id": "ro_id", "ocel_time": "delivered_time"})[
            ["ro_id", "delivered_time"]
        ]
    )

    # Step 4: Merge PlacedRO and DeliveredRO based on ro_id
    merged_ro = pd.merge(placed_ro, delivered_ro, on="ro_id")
    item_for_object = pd.merge(
        merged_ro, object_quantities, left_on="ro_id", right_on="ocel_id"
    )[object_quantities.columns]
    supplier_for_object = pd.merge(
        merged_ro[["ro_id"]],
        qel_objects[["ocel_id", "supplier"]],
        left_on="ro_id",
        right_on="ocel_id",
    )[["ro_id", "supplier"]]

    # Step 5: Calculate lead time
    merged_ro["placed_time"] = pd.to_datetime(merged_ro["placed_time"])
    merged_ro["delivered_time"] = pd.to_datetime(merged_ro["delivered_time"])
    merged_ro["lead_time"] = merged_ro["delivered_time"] - merged_ro["placed_time"]

    return (
        clean_dataframe_for_json(merged_ro),
        clean_dataframe_for_json(item_for_object),
        clean_dataframe_for_json(supplier_for_object),
    )


"""
print(
    get_lead_time(
        "Place Replenishment Order",
        "Identify incoming Delivery",
    )
)
"""
#############################################################
############ Determin Service Level for an RO ###############
#############################################################


def get_service_level(register_activity: str, placement_activity: str) -> pd.DataFrame:
    # Load data from the QEL system
    qel = load_qel_from_file(file_path=get_last_uploaded_file())

    # Step 1: Extract event data for the specified activities
    register_events = qel.get_event_data_activity(register_activity).reset_index()
    placement_events = qel.get_event_data_activity(placement_activity).reset_index()
    event_object = qel.e2o
    qop = qel.get_quantity_operations()
    itemtyps = qel.item_types

    # Extract objects and timestamps for Place Replenishment Order
    temp1 = event_object[event_object["ocel_event_id"].isin(register_events["ocel_id"])]
    temp1 = temp1.merge(
        register_events[["ocel_id", "ocel_time"]],
        left_on="ocel_event_id",
        right_on="ocel_id",
    )
    temp1 = temp1.rename(
        columns={"ocel_object_id": "ro_id", "ocel_time": "placed_time"}
    )
    temp1 = temp1[["ro_id", "placed_time", "ocel_id"]]

    # Match event IDs in temp1 with qop and aggregate item quantities
    temp1 = temp1.merge(
        qop[["Events"] + list(itemtyps)].groupby("Events").sum().reset_index(),
        left_on="ocel_id",
        right_on="Events",
        how="left",
    )

    # Sum up all item quantities to get the total QuantityPlaced
    temp1["QuantityPlaced"] = temp1[list(itemtyps)].sum(axis=1)
    temp1 = temp1.drop(columns=(list(itemtyps) + ["ocel_id", "Events"]))

    # Extract objects and timestamps for Put Delivery in Stock
    temp2 = event_object[
        event_object["ocel_event_id"].isin(placement_events["ocel_id"])
    ]
    temp2 = temp2.merge(
        placement_events[["ocel_id", "ocel_time"]],
        left_on="ocel_event_id",
        right_on="ocel_id",
    )
    temp2 = temp2.rename(
        columns={"ocel_object_id": "ro_id", "ocel_time": "delivered_time"}
    )
    temp2 = temp2[["ro_id", "delivered_time", "ocel_id"]]

    # Match event IDs in temp2 with qop and aggregate item quantities
    temp2 = temp2.merge(
        qop[["Events"] + list(itemtyps)].groupby("Events").sum().reset_index(),
        left_on="ocel_id",
        right_on="Events",
        how="left",
    )

    # Sum up all item quantities to get the total QuantityArrived
    temp2["QuantityArrived"] = temp2[list(itemtyps)].sum(axis=1)
    temp2 = temp2.drop(columns=(list(itemtyps) + ["ocel_id", "Events"]))

    # Merge QuantityPlaced and QuantityArrived
    result = temp1.merge(temp2, on="ro_id", how="inner")  # wrong mabye inner

    # Calculate the difference and incomplete orders
    result["difference"] = result["QuantityArrived"].fillna(0) - result[
        "QuantityPlaced"
    ].fillna(0)
    incomplete_orders = (result["difference"] < 0).sum()
    result = result.drop(columns=["delivered_time", "placed_time"])

    # Calculate Service Level
    total_orders = len(result)
    service_level = 1 - (incomplete_orders / total_orders)

    print(f"Service Level (α): {service_level * 100:.2f}%")

    return result, service_level


"""
print(
    get_service_level(
        "Register incoming Customer Order",
        "Pick and pack items for Customer Order",
    )
)"""


# discover qnet
def get_qnet_data():
    qel = load_qel_from_file(file_path=get_last_uploaded_file())
    # data frames
    e2o = qel.get_e2o_relationships()
    qop = qel.get_quantity_operations()
    events = qel.get_events()
    objects = qel.get_objects()

    qnet, qnetdata = discover_qnet(
        events=events,
        objects=objects,
        qop=qop,
        e2o=e2o,
    )
    graph = get_dot_string(qnet)

    return qnetdata, graph


# get the quantity state for the given cp
def get_quantity_state(cp: str):
    qel = load_qel_from_file(file_path=get_last_uploaded_file())
    qop = qel.get_quantity_operations()
    initial_item_level = qel.get_initial_item_level_cp(cp=cp)
    qstate_data = qstate.determine_quantity_state_cp(qop, cp, initial_item_level, False)
    return qstate_data


get_quantity_state("Company Warehouse")
