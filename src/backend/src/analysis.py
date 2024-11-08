import os
import pandas as pd
from qrpm.app.data_operations.log_overview import get_log_overview
from qrpm.analysis.quantityState import determine_quantity_state_qel
from qrpm.analysis.dataImport import load_qel_from_file
import qrpm.app.dataStructure as ds
import math


# get the last uploaded file from the files directory
def get_last_uploaded_file():
    files = os.listdir(r"src\backend\files")
    if len(files) == 0:
        return None
    print(files[-1])
    return os.path.join("src", "backend", "files", files[-1])


def replace_nan_with_empty_string(d):
    for key, value in d.items():
        if isinstance(value, dict):
            replace_nan_with_empty_string(value)
        elif isinstance(value, float) and math.isnan(value):
            d[key] = ""
    return d


# create a QEL object from the last uploaded file
qel = load_qel_from_file(file_path=get_last_uploaded_file())

# get Overview data from the qel
overview = get_log_overview(qel)

# fill nan with ""
overview = replace_nan_with_empty_string(overview)
