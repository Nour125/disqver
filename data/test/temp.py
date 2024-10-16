import sqlite3

import numpy as np

# Step 1: Connect to the original SQLite database
original_db = 'Data\ocel2-export.sqlite'


# Connect to the original database
conn_original = sqlite3.connect(original_db)
cur_original = conn_original.cursor()



#add quantity_operations table for the new database
cur_original.execute("CREATE TABLE IF NOT EXISTS quantity_operations (ocel_id TEXT, ocel_cpid TEXT, weizen INTEGER, weizen_mehl INTEGER, Boxed_pizza INTEGER);")

# Fetch the IDs from the event table
cur_original.execute("SELECT ocel_id FROM event;")
event_ids = cur_original.fetchall()


cur_original.execute("INSERT INTO quantity_operations VALUES ('init','cp1',10,10,10);")


# Insert rows with ocel_id and ocel_cpid
for event_id in event_ids:
    x = np.random.randint(-10,10)
    y = np.random.randint(-10,10)
    z = np.random.randint(-10,10)
    cur_original.execute("INSERT INTO quantity_operations VALUES (?, ?, ?, ?, ?);", (event_id[0], 'cp1',x, y, z))




# Commit and close connections
conn_original.commit()
conn_original.close()


