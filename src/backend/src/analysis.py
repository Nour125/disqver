import os
import pandas as pd
from qel_simulation import *
from qrpm.analysis.quantityState import determine_quantity_state_qel
from qrpm.analysis.dataImport import load_qel_from_file, ImporterQEL
from qrpm.analysis.modelDiscovery import mine_basic_qnet_from_qel
from qel_simulation.components.quantity_net_graph import (
    QuantityGraph,
    show_qnet_graph,
    export_qnet_graph,
)


# get the last uploaded file from the files directory
def get_last_uploaded_file():
    files = os.listdir(r"src\backend\files")
    if len(files) == 0:
        return None
    return files[-1]


# get the last uploaded file + the path
t = "src//backend//files//" + get_last_uploaded_file()

# load the qel from the file
qel = load_qel_from_file(file_path=t)

# get the quantity state from the qel
qs = determine_quantity_state_qel(qel)
print(qs)

# Discovery of the QNet
qnet = mine_basic_qnet_from_qel(qel)
s = show_qnet_graph(qnet)
