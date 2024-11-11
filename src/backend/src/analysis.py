import os
import time
import pandas as pd
from qrpm.app.data_operations.log_overview import get_log_overview
from qrpm.analysis.quantityState import determine_quantity_state_qel
from qrpm.analysis.dataImport import load_qel_from_file
import qrpm.app.dataStructure as ds
import math


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
################ Determine Forecasting ######################
#############################################################
def determine_forecasting():
    # create a QEL object from the last uploaded file
    qel = load_qel_from_file(file_path=get_last_uploaded_file())

    # determine the quantity state
    quantity_state = determine_quantity_state_qel(qel)

    # determine the forecasting

    return quantity_state


print(determine_forecasting())
