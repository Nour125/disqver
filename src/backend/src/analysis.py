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


#############################################################
################ Determin Lead Time for #####################
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
    # step 4: delet rows where ro_id comes more than once in deliverd_ro
    delivered_ro = delivered_ro.drop_duplicates(subset=["ro_id"])
    pd.set_option("display.max_rows", None)
    print(delivered_ro)

    # Step 5: Merge PlacedRO and DeliveredRO based on ro_id
    merged_ro = pd.merge(placed_ro, delivered_ro, on="ro_id")
    item_for_object = pd.merge(
        merged_ro, object_quantities, left_on="ro_id", right_on="ocel_id"
    )[object_quantities.columns]
    if "supplier" in qel_objects.columns:
        supplier_for_object = pd.merge(
            merged_ro[["ro_id"]],
            qel_objects[["ocel_id", "supplier"]],
            left_on="ro_id",
            right_on="ocel_id",
        )[["ro_id", "supplier"]]
    else:
        supplier_for_object = pd.DataFrame(
            {"ro_id": merged_ro["ro_id"], "supplier": [None] * len(merged_ro)}
        )

    # Step 5: Calculate lead time
    merged_ro["placed_time"] = pd.to_datetime(merged_ro["placed_time"])
    merged_ro["delivered_time"] = pd.to_datetime(merged_ro["delivered_time"])
    merged_ro["lead_time"] = merged_ro["delivered_time"] - merged_ro["placed_time"]
    print(clean_dataframe_for_json(supplier_for_object))
    return (
        clean_dataframe_for_json(merged_ro),
        clean_dataframe_for_json(item_for_object),
        clean_dataframe_for_json(supplier_for_object),
    )


#############################################################
################# Determin Service Level ####################
#############################################################

"""
def get_alpha_service_level(CO: str, cps: list[str]):
    qel = load_qel_from_file(file_path=get_last_uploaded_file())
    qop = qel.get_quantity_operations()
    qstate_cp = {}
    for cp in cps:
        initial_item_level = qel.get_initial_item_level_cp(cp=cp)
        qstate_data = qstate.determine_quantity_state_cp(
            qop, cp, initial_item_level, False
        )
        qstate_cp[cp] = qstate_data

    item_types = [item for cp in cps for item in get_item_types_by_cp(cp)]
    customer_order_table = qel.get_objects_of_object_type(CO)
    # customer_order_items = [item]
    pass
"""

# get_alpha_service_level("Customer Order", ["Company Warehouse"])


def get_alpha_service_level(
    register_activity: str, placement_activity: str
) -> pd.DataFrame:
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


def get_beta_service_level(
    register_activity: str,
    placement_activity: str,
    planing_cp: str,
    physical_cp: str,
    order_type: str,
):
    import pandas as pd

    # Load data from the QEL system
    qel = load_qel_from_file(file_path=get_last_uploaded_file())

    # Extract event data for the specified activities
    register_events = qel.get_event_data_activity(register_activity).reset_index()
    placement_events = qel.get_event_data_activity(placement_activity).reset_index()

    # Consider only events associated with the specified order type
    valid_order_ids = qel.get_objects_of_object_type(
        order_type
    )  # returns a set of order IDs
    event_object = qel.e2o
    # Filter event_object to only include orders of the given order type
    event_object = event_object[event_object["ocel_object_id"].isin(valid_order_ids)]

    qop = qel.get_quantity_operations()
    itemtyps = qel.item_types

    # ----- Process Register (Placement) Events for Bought Quantities -----
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

    # Filter qop to only include records from the planning control point
    qop_planning = qop[qop["Collection"] == planing_cp]

    # Merge with filtered qop to get item-level quantities at placement
    temp1 = temp1.merge(
        qop_planning[["Events"] + list(itemtyps)].groupby("Events").sum().reset_index(),
        left_on="ocel_id",
        right_on="Events",
        how="left",
    )

    # ----- Process Placement (Arrival) Events for Arrived Quantities -----
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

    # Filter qop to only include records from the physical control point
    qop_physical = qop[qop["Collection"] == physical_cp]

    # Merge with filtered qop to get item-level quantities at arrival
    temp2 = temp2.merge(
        qop_physical[["Events"] + list(itemtyps)].groupby("Events").sum().reset_index(),
        left_on="ocel_id",
        right_on="Events",
        how="left",
    )

    # If more than one record exists for the same ro_id in temp2,
    # keep only the one with the earliest delivered_time.
    temp2 = temp2.sort_values("delivered_time").drop_duplicates(
        subset=["ro_id"], keep="first"
    )

    # Only consider orders that appear in both temp1 and temp2
    temp1 = temp1[temp1["ro_id"].isin(temp2["ro_id"])]

    # ----- Aggregation Across Orders per Item Type -----
    # Sum quantities for each item type over all placement events (bought quantities)
    bought_totals = temp1[list(itemtyps)].sum()
    # Sum quantities for each item type over all arrival events (arrived quantities)
    arrived_totals = temp2[list(itemtyps)].sum()
    # Check if any of the sums are negative, then multiply all by -1 in bought_totals and arrived_totals
    if (bought_totals < 0).any() or (arrived_totals < 0).any():
        bought_totals = bought_totals.apply(lambda x: -x)
        arrived_totals = arrived_totals.apply(lambda x: -x)
    # Build a DataFrame with the aggregated data per item
    beta_df = pd.DataFrame(
        {
            "item": list(itemtyps),
            "q_bought": bought_totals.values,
            "q_arrived": arrived_totals.values,
        }
    )

    # Calculate beta_i for each item, handling division by zero if any q_bought is zero
    beta_df["beta_i"] = beta_df.apply(
        lambda row: row["q_arrived"] / row["q_bought"] if row["q_bought"] > 0 else None,
        axis=1,
    )

    # Compute overall beta as the average of item-level beta values (ignoring items with no sales)
    valid_betas = beta_df["beta_i"].dropna()
    overall_beta = valid_betas.mean() if not valid_betas.empty else None

    beta_df = beta_df.replace({np.nan: None})

    print(f"Beta Service Level (β): {overall_beta * 100:.2f}%")

    return beta_df, overall_beta


print(
    get_beta_service_level(
        "Register incoming Customer Order",
        "Pick and pack items for Customer Order",
        "Planning System",
        "Company Warehouse",
        "Customer Order",
    )
)


def get_service_level(
    service_level_type: str,
    register_activity: str,
    placement_activity: str,
    planing_cp: str,
    physical_cp: str,
    order_type: str,
):
    if service_level_type == "Alpha":
        return get_alpha_service_level(register_activity, placement_activity)
    elif service_level_type == "Beta":
        return get_beta_service_level(
            register_activity, placement_activity, planing_cp, physical_cp, order_type
        )
    else:
        raise ValueError(f"Service level type {service_level_type} not supported.")


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
