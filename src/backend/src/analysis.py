import os
import pandas as pd
from qel_simulation import *
from qrpm.analysis.quantityState import determine_quantity_state_qel
from qrpm.analysis.dataImport import load_qel_from_file


# get the last uploaded file from the files directory
def get_last_uploaded_file():
    files = os.listdir(r"src\backend\files")
    if len(files) == 0:
        return None
    return files[-1]


####### THIS IS NOT WORKING #######
t = get_last_uploaded_file()
qel = load_qel_from_file(t)

# get the quantity state from the qel
qs = determine_quantity_state_qel(qel)
print(qs)
