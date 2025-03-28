import sqlite3
import numpy as np
import pandas as pd
from qrpm.analysis.dataImport import load_qel_from_file
import os
import time


def sorted_directory_listing_by_creation_time_with_os_listdir(directory):
    def get_creation_time(item):
        item_path = os.path.join(directory, item)
        print(item_path)
        print(time.ctime(os.path.getctime(item_path)))
        return os.path.getctime(item_path)

    items = os.listdir(directory)
    sorted_items = sorted(items, key=get_creation_time, reverse=True)
    return sorted_items


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


# Connect to the original SQLite database
original_db = "data\Example_Inventory_Management_execution_log.sqlite"

qel = load_qel_from_file(file_path=get_last_uploaded_file())
qop = qel.get_quantity_operations()

# Connect to the original database
conn_original = sqlite3.connect(original_db)
cur_original = conn_original.cursor()

# get data
cur_original.execute("SELECT ocel_id FROM event_IdentifyincomingDelivery;")
identifyincomingDelivery_ids = cur_original.fetchall()

cur_original.execute("SELECT ocel_id FROM event_UnloadDelivery;")
UnloadDelivery_ids = cur_original.fetchall()

cur_original.execute("SELECT ocel_id,supplier FROM object_Delivery;")
Delivery_ids = cur_original.fetchall()

cur_original.execute("SELECT ocel_id FROM object_Palette;")
Palette_ids = cur_original.fetchall()

cur_original.execute("SELECT ocel_id, ocel_time FROM object_ReplenishmentOrder;")
ReplenishmentOrder_ids = cur_original.fetchall()

cur_original.execute("SELECT ocel_id FROM event_PlacedeliveredItemsintoInventory;")
PlacedeliveredItemsintoInventory_ids = cur_original.fetchall()

"""
table_name = "object_quantity"
unwanted_column = "ocel_id"

# Fetch all column names from the table
cur_original.execute(f"PRAGMA table_info({table_name});")
columns = [row[1] for row in cur_original.fetchall()]  # row[1] contains column names

# Exclude the unwanted column
columns_to_select = [col for col in columns if col != unwanted_column]
columns_str = ", ".join(columns_to_select)

# List to store results
Delivery_quantities = []

# Dynamically build the SELECT query excluding the unwanted column
query = f"SELECT {columns_str} FROM {table_name} WHERE ocel_id = ?;"

# Iterate through Delivery_ids and fetch data
for delivery_id in Delivery_ids:
    cur_original.execute(query, (delivery_id[0],))
    Delivery_quantities.extend(cur_original.fetchall())
"""

# get from event_object table all rows with ocel_object_id in Delivery_ids and ocel_event_id in identifyincomingDelivery_ids
cur_original.execute(
    "SELECT * FROM event_object WHERE ocel_object_id IN (SELECT ocel_id FROM object_Delivery) AND ocel_event_id IN (SELECT ocel_id FROM event_IdentifyincomingDelivery);"
)
event_object_identifyincomingDelivery = cur_original.fetchall()


# drop the tables
# cur_original.execute("DROP TABLE IF EXISTS event_IdentifyincomingDelivery;")
cur_original.execute("DROP TABLE IF EXISTS event_UnloadDelivery;")
cur_original.execute("DROP TABLE IF EXISTS object_Delivery;")
cur_original.execute("DROP TABLE IF EXISTS object_Palette;")

# delete all rows
"""
for identifyincomingDelivery_id in identifyincomingDelivery_ids:
    cur_original.execute(
        "DELETE FROM event WHERE ocel_id = ?;", (identifyincomingDelivery_id[0],)
    )

"""
"""
for identifyincomingDelivery_id in identifyincomingDelivery_ids:
    cur_original.execute(
        "DELETE FROM event_object WHERE ocel_event_id = ?;",
        (identifyincomingDelivery_id[0],),
    )
"""
for UnloadDelivery_id in UnloadDelivery_ids:
    cur_original.execute(
        "DELETE FROM event WHERE ocel_id = ?;", (UnloadDelivery_id[0],)
    )


for UnloadDelivery_id in UnloadDelivery_ids:
    cur_original.execute(
        "DELETE FROM event_object WHERE ocel_event_id = ?;", (UnloadDelivery_id[0],)
    )


for Delivery_id in Delivery_ids:
    cur_original.execute("DELETE FROM object WHERE ocel_id = ?;", (Delivery_id[0],))

for Palette_id in Palette_ids:
    cur_original.execute("DELETE FROM object WHERE ocel_id = ?;", (Palette_id[0],))

for Delivery_id in Delivery_ids:
    cur_original.execute(
        "DELETE FROM event_object WHERE ocel_object_id = ?;", (Delivery_id[0],)
    )

for Palette_id in Palette_ids:
    cur_original.execute(
        "DELETE FROM event_object WHERE ocel_object_id = ?;", (Palette_id[0],)
    )


"""cur_original.execute(
    "DELETE FROM event_map_type WHERE ocel_type_map = 'IdentifyincomingDelivery';"
)"""
cur_original.execute(
    "DELETE FROM event_map_type WHERE ocel_type_map = 'UnloadDelivery';"
)
cur_original.execute("DELETE FROM object_map_type WHERE ocel_type_map = 'Delivery';")
cur_original.execute("DELETE FROM object_map_type WHERE ocel_type_map = 'Palette';")


for PlacedeliveredItemsintoInventory_id in PlacedeliveredItemsintoInventory_ids:
    cur_original.execute(
        "DELETE FROM quantity_operations WHERE ocel_id = ?;",
        (PlacedeliveredItemsintoInventory_id[0],),
    )
"""
for PlacedeliveredItemsintoInventory_id in PlacedeliveredItemsintoInventory_ids:
    cur_original.execute(
        "DELETE FROM event_object WHERE ocel_event_id = ?;",
        (PlacedeliveredItemsintoInventory_id[0],),
    )
"""

# Step 3: Fetch object_quantity
cur_original.execute("SELECT * FROM object_quantity;")
object_quantity_rows = cur_original.fetchall()

# Step 4: Columns from object_quantity and quantity_operations
object_quantity_columns = [
    "Tube",
    "Front Light",
    "Back Light",
    "Saddle",
    "PADS Tube",
    "Brake Shoes (4)",
    "Bell",
    "PADS Brake Shoes (2)",
    "Helmet",
    "Pedal",
    "Speedometer",
    "Brake Cable (2)",
    "Handles (2)",
    "PADS Tire",
    "Box",
    "Tire",
    "PADS Brake Cable (2)",
]

quantity_operations_columns = [
    "PADS Brake Shoes (2)",
    "PADS Brake Cable (2)",
    "PADS Tire",
    "PADS Tube",
    "Brake Shoes (4)",
    "Tube",
    "Bell",
    "Brake Cable (2)",
    "Helmet",
    "Speedometer",
    "Pedal",
    "Front Light",
    "Back Light",
    "Saddle",
    "Tire",
    "Handles (2)",
    "Box",
]

# Mapping: Match object_quantity columns to quantity_operations columns
column_mapping = {
    col: col for col in object_quantity_columns if col in quantity_operations_columns
}

# Step 5: Build helper dictionaries
delivery_dict = {row[0]: row[1] for row in Delivery_ids}  # Maps ocel_id -> supplier
object_quantity_dict = {
    row[0]: row[1:] for row in object_quantity_rows
}  # Maps ocel_id -> quantity values

# Step 6: Process data to create rows for `quantity_operations`
result = []
for event_row in event_object_identifyincomingDelivery:
    event_id = event_row[0]
    object_id = event_row[1]

    # Get supplier for the object_id
    supplier = delivery_dict.get(object_id, "Unknown")

    # Get the quantity data for the object_id
    quantity_data = object_quantity_dict.get(
        object_id, [None] * len(object_quantity_columns)
    )

    # Build the quantities in correct column order for `quantity_operations`
    mapped_quantities = [None] * len(quantity_operations_columns)
    for obj_col, qty in zip(object_quantity_columns, quantity_data):
        if obj_col in column_mapping:
            mapped_index = quantity_operations_columns.index(column_mapping[obj_col])
            mapped_quantities[mapped_index] = qty

    # Determine inventory location
    if supplier == "PADS":
        inventory_location = "PADS Inventory (VMI)"
    else:
        inventory_location = "Company Warehouse"

    # Append the final row (event_id, inventory_location, mapped_quantities...)
    result.append((event_id, inventory_location, *mapped_quantities))

# Print or use `result` for SQLite insertion
print(result)

# Step 7: Insert the rows into `quantity_operations`
placeholders = ", ".join(["?"] * (2 + len(quantity_operations_columns)))
insert_query = f"""
    INSERT INTO quantity_operations (ocel_id, ocel_cpid, {', '.join([f'"{col}"' for col in quantity_operations_columns])})
    VALUES ({placeholders});
"""
cur_original.executemany(insert_query, result)
conn_original.commit()
conn_original.close()

"""for PlacedeliveredItemsintoInventory_id in PlacedeliveredItemsintoInventory_ids:
    cur_original.execute(
        "DELETE FROM event WHERE ocel_id = ?;",
        (PlacedeliveredItemsintoInventory_id[0],),
    )

PlacedeliveredItemsintoInventory_ids_set = {
    id[0] for id in PlacedeliveredItemsintoInventory_ids
}

for PlacedeliveredItemsintoInventory_id in PlacedeliveredItemsintoInventory_ids:
    cur_original.execute(
        "DELETE FROM event_PlacedeliveredItemsintoInventory WHERE ocel_id = ?;",
        (PlacedeliveredItemsintoInventory_id[0],),
    )"""


"""qop["Time"] = pd.to_datetime(qop["Time"])  # Ensure Time column is datetime

# Filter rows where ocel_ide is in PROII_ids and ocel_cpid is "cp1"
filtered_qop = qop[
    (qop["Events"].isin(PlacedeliveredItemsintoInventory_ids_set))
    & (qop["Collection"] == "Company Warehouse")
]

# Group by date (from Time) and sum the item columns
filtered_qop["date"] = filtered_qop["Time"].dt.date  # Extract date
grouped = filtered_qop.groupby("date", as_index=False).agg(
    {
        "Events": "max",  # Keep the largest event ID
        "Collection": "first",  # Keep the same cp1 for all
        **{
            col: "sum" for col in filtered_qop.columns if col in qel.item_types
        },  # Sum item columns
    }
)


# Drop the Time column
grouped["Time"] = pd.to_datetime(grouped["date"]) + pd.to_timedelta("10:10:10.100")
result1 = grouped[["Events", "Time"]]
result2 = grouped.drop(columns=["date"])
result2 = result2.drop(columns=["Time"])

# Result rows for SQLite insertion
result1["Time"] = result1["Time"].astype(str)
rows_to_insert1 = result1.to_records(index=False).tolist()
rows_to_insert2 = result2.to_records(index=False).tolist()"""


'''
# Step 1: Extract the date part and find the maximum time for each date
cur_original.execute(
    """
    SELECT 
        MAX(ocel_time) AS max_time 
    FROM 
        event_PlacedeliveredItemsintoInventory
    GROUP BY 
        DATE(ocel_time)
"""
)
latest_times = [row[0] for row in cur_original.fetchall()]

# Step 2: Delete rows that are not the latest for their date
cur_original.execute(
    """
    DELETE FROM event_PlacedeliveredItemsintoInventory
    WHERE ocel_time NOT IN (
        SELECT 
            MAX(ocel_time) 
        FROM 
            event_PlacedeliveredItemsintoInventory
        GROUP BY 
            DATE(ocel_time)
    )
"""
)
'''
"""cur_original.executemany(
    "INSERT INTO event_PlacedeliveredItemsintoInventory (ocel_id, ocel_time) VALUES (?, ?);",
    rows_to_insert1,
)
rows_to_insert1 = [evid for evid, _ in rows_to_insert1]

cur_original.executemany(
    "INSERT INTO event (ocel_id, ocel_type) VALUES (?, ?);",
    [
        (event_id, "Place delivered Items into Inventory")
        for event_id in rows_to_insert1
    ],
)


cur_original.execute(
    "SELECT ocel_id, ocel_time  FROM event_PlacedeliveredItemsintoInventory;"
)
PlacedeliveredItemsintoInventory_ids = cur_original.fetchall()


# Step 1: Sort both lists by their timestamps
PlacedeliveredItemsintoInventory_ids.sort(
    key=lambda x: x[1]
)  # Sort by time (second element)
ReplenishmentOrder_ids.sort(key=lambda x: x[1])  # Sort by time (second element)

# Step 2: Pair the items
new_rows = [
    (
        placedelivered[0],
        replenishment[0],
        None,
    )  # ocel_event_id, ocel_object_id, ocel_qualifier
    for placedelivered, replenishment in zip(
        PlacedeliveredItemsintoInventory_ids, ReplenishmentOrder_ids
    )
]

# Step 3: Insert the new rows into the event_object table
cur_original.executemany(
    "INSERT INTO event_object (ocel_event_id, ocel_object_id, ocel_qualifier) VALUES (?, ?, ?);",
    new_rows,
)


num_columns = len(rows_to_insert2[0])  # Automatically determines the number of columns
placeholders = ", ".join(["?"] * num_columns)  # Generate placeholders
insert_sql = f"INSERT INTO quantity_operations VALUES ({placeholders});"

# Insert rows
cur_original.executemany(insert_sql, rows_to_insert2)


conn_original.commit()
conn_original.close()"""

"""# Pad ReplenishmentOrder_ids with NULL to match the length of Palette_ids
if len(Palette_ids) > len(ReplenishmentOrder_ids):
    ReplenishmentOrder_ids.extend(
        [("o-3536",)] * (len(Palette_ids) - len(ReplenishmentOrder_ids))
    )


# Replace each Palette_id with the corresponding ReplenishmentOrder_id
for palette_id, replenishment_order_id in zip(Palette_ids, ReplenishmentOrder_ids):
    cur_original.execute(
        "UPDATE event_object SET ocel_object_id = ? WHERE ocel_object_id = ?;",
        (replenishment_order_id[0], palette_id[0]),
    )
for palette_id, replenishment_order_id in zip(Palette_ids, ReplenishmentOrder_ids):
    cur_original.execute(
        "UPDATE object_quantity SET ocel_id = ? WHERE ocel_id = ?;",
        (replenishment_order_id[0], palette_id[0]),
    )"""
