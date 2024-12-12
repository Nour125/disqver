import os
import time
import pandas as pd
from qrpm.app.data_operations.log_overview import get_log_overview
from qrpm.analysis.quantityState import (
    determine_quantity_state_qel,
    determine_quantity_state_cp,
)
from numpy import mean, absolute
from qrpm.analysis.dataImport import load_qel_from_file
import qrpm.app.dataStructure as ds
import math
from qel_simulation import QuantityEventLog


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
        print(files)
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


def send_overview_data():
    # create a QEL object from the last uploaded file
    qel = load_qel_from_file(file_path=get_last_uploaded_file())

    # get Overview data from the qel
    overview = get_log_overview(qel)

    # fill nan with ""
    overview = replace_nan_with_empty_string(overview)
    return overview


send_overview_data()


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
    else:
        return {"error": "Table name not found."}


#############################################################
############ Determin Forecasting for an item ##############
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
    if "Collection" in qop.columns:
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


# print(forecast_error("PADS Tire"))
# print(determine_forecast(alpha=0.1, item_type="PADS Tire", period=3))
# print(determin_demand_for_months("Tube", "Company Warehouse"))


#############################################################
############ Determin Lead Time for an RO ##################
#############################################################


def get_Placed_RO(qel: QuantityEventLog, Planning_System_cp: str) -> pd.DataFrame:
    qop = qel.get_quantity_operations()
    if Planning_System_cp in qop["Collection"].values:
        qop = qop.loc[qop["Collection"].isin([Planning_System_cp])]
    else:
        raise ValueError(f"{Planning_System_cp} not found in the Collection Points.")
    print(qop)
    items_in_Planning_System = [
        item for item in qel.item_types_collection[Planning_System_cp]
    ]
    filtered_qop = qop.loc[qop[items_in_Planning_System].gt(0).any(axis=1)]
    # sortiere zu erst nach zeit
    filtered_qop["RO_id"] = range(1, len(filtered_qop) + 1)
    # filtered_qop.to_csv("src\\backend\\files\\placed_RO.csv", index=False)

    return filtered_qop


def get_delivered_RO(qel: QuantityEventLog, Physical_cp: str) -> pd.DataFrame:
    qop = qel.get_quantity_operations()
    if Physical_cp in qop["Collection"].values:
        qop = qop.loc[qop["Collection"].isin([Physical_cp])]
    else:
        raise ValueError(f"{Physical_cp} not found in the Collection Points.")
    items_in_Physical_cp = [item for item in qel.item_types_collection[Physical_cp]]
    filtered_qop = qop.loc[qop[items_in_Physical_cp].gt(0).any(axis=1)]

    # Ensure 'Time' column is in datetime format
    filtered_qop["Time"] = pd.to_datetime(filtered_qop["Time"])
    # Extract only the date part (year, month, day)
    filtered_qop["Time"] = filtered_qop["Time"].dt.date
    # Group by the 'Time' column (now containing only the date) and sum up the quantities for each item
    filtered_qop = filtered_qop.groupby("Time", as_index=False).sum()

    # sortiere zu erst nach zeit

    filtered_qop.to_csv("src\\backend\\files\\delivered_RO.csv", index=False)

    return filtered_qop
