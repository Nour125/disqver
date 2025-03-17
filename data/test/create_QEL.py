'''
import sqlite3

# Create a connection to an in-memory SQLite database or to a file-based database
conn = sqlite3.connect('Micky_mouse_QEL.sqlite')  # Use ':memory:' for an in-memory database, or a file name for file-based

# Create a cursor object to execute SQL commands
cur = conn.cursor()

# Execute the SQL commands
cur.executescript("""
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "event" (
    "ocel_id" TEXT,
    "ocel_type" TEXT
);

INSERT INTO event VALUES('RK_1','RK');
INSERT INTO event VALUES('RK_2','RK');
INSERT INTO event VALUES('EM_1','EM');
INSERT INTO event VALUES('EP_1','EP');
INSERT INTO event VALUES('BP_1','BP');
INSERT INTO event VALUES('LP_1','LP');
INSERT INTO event VALUES('LW_1','LW');
INSERT INTO event VALUES('LW_2','LW');

CREATE TABLE IF NOT EXISTS "event_object" (
    "ocel_event_id" TEXT,
    "ocel_object_id" TEXT,
    "ocel_qualifier" TEXT
);
INSERT INTO event_object VALUES('RK_1','WK1','RK');
INSERT INTO event_object VALUES('LW_1','WK1','WL');
INSERT INTO event_object VALUES('EM_1','AA1','RAA');
INSERT INTO event_object VALUES('RK_2','WK2','RK');
INSERT INTO event_object VALUES('LW_2','WK2','WL');
INSERT INTO event_object VALUES('EP_1','AA1','ME');
INSERT INTO event_object VALUES('EP_1','P1','PF');
INSERT INTO event_object VALUES('BP_1','P1','PB');
INSERT INTO event_object VALUES('LP_1','P1','PL');

CREATE TABLE IF NOT EXISTS "object" (
    "ocel_id" TEXT,
    "ocel_type" TEXT
);
INSERT INTO object VALUES('WK1','WeizenKauf');
INSERT INTO object VALUES('WK2','WeizenKauf');
INSERT INTO object VALUES('AA1','AufbauAuftrag');
INSERT INTO object VALUES('P1','Pizza');

CREATE TABLE IF NOT EXISTS "object_object" (
    "ocel_source_id" TEXT,
    "ocel_target_id" TEXT,
    "ocel_qualifier" TEXT
);
INSERT INTO object_object VALUES('AA1','P1','WP');


CREATE TABLE IF NOT EXISTS "event_RK" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "total items" INTEGER
);
INSERT INTO event_RK VALUES('RK_1','2025-01-01 00:00:01',1);
INSERT INTO event_RK VALUES('RK_2','2025-01-01 00:00:10',1);

CREATE TABLE IF NOT EXISTS "event_LW" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "total items" INTEGER
);
INSERT INTO event_LW VALUES('LW_1','2025-01-01 00:00:02',1);
INSERT INTO event_LW VALUES('LW_2','2025-01-01 00:00:12',1);


CREATE TABLE IF NOT EXISTS "event_EM" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "total items" INTEGER
);
INSERT INTO event_EM VALUES('EM_1','2025-01-01 00:00:03',1);

CREATE TABLE IF NOT EXISTS "event_EP" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "total items" INTEGER
);
INSERT INTO event_EP VALUES('EP_1','2025-01-01 00:00:04',1);


CREATE TABLE IF NOT EXISTS "event_BP" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "total items" INTEGER
);
INSERT INTO event_BP VALUES('BP_1','2025-01-01 00:00:05',1);


CREATE TABLE IF NOT EXISTS "event_LP" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "total items" INTEGER
);
INSERT INTO event_LP VALUES('LP_1','2025-01-01 00:00:06',1);




CREATE TABLE IF NOT EXISTS "event_map_type" (
    "ocel_type" TEXT,
    "ocel_type_map" TEXT
);
INSERT INTO event_map_type VALUES('RK','RK');
INSERT INTO event_map_type VALUES('EM','EM');
INSERT INTO event_map_type VALUES('EP','EP');
INSERT INTO event_map_type VALUES('BP','BP');
INSERT INTO event_map_type VALUES('LP','LP');
INSERT INTO event_map_type VALUES('LW','LW');

CREATE TABLE IF NOT EXISTS "object_map_type" (
    "ocel_type" TEXT,
    "ocel_type_map" TEXT
);
INSERT INTO object_map_type VALUES('WeizenKauf','WK');
INSERT INTO object_map_type VALUES('AufbauAuftrag','AA');
INSERT INTO object_map_type VALUES('Pizza','P');

CREATE TABLE IF NOT EXISTS "object_WK" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "ocel_changed_field" TEXT,
    "item" INTEGER
);
INSERT INTO object_WK VALUES('WK1','2025-01-01 00:00:07',NULL,1);
INSERT INTO object_WK VALUES('WK2','2025-01-01 00:00:14',NULL,1);



CREATE TABLE IF NOT EXISTS "object_AA" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "ocel_changed_field" TEXT,
    "item" INTEGER
);
INSERT INTO object_AA VALUES('AA1','2025-01-01 00:00:08',NULL,1);


CREATE TABLE IF NOT EXISTS "object_P" (
    "ocel_id" TEXT,
    "ocel_time" TEXT,
    "ocel_changed_field" TEXT,
    "item" INTEGER
);
INSERT INTO object_P VALUES('P1','2025-01-01 00:00:09',NULL,1);



CREATE TABLE IF NOT EXISTS "quantity_operations" (
    "ocel_id" TEXT,
    "ocel_cpid" TEXT,
    "weizen"   INTEGER,
    "weizen-mehl"   INTEGER,
    "Boxed-pizza"   INTEGER
);
INSERT INTO quantity_operations VALUES('init','cp1',NULL,NULL,NULL);

INSERT INTO quantity_operations VALUES('RK_1','cp1',NULL,NULL,NULL);
INSERT INTO quantity_operations VALUES('LW_1','cp1',10,NULL,NULL);
INSERT INTO quantity_operations VALUES('EM_1','cp1',-10,10,NULL);
INSERT INTO quantity_operations VALUES('EP_1','cp1',NULL,-10,NULL);
INSERT INTO quantity_operations VALUES('BP_1','cp1',NULL,NULL,NULL);
INSERT INTO quantity_operations VALUES('LP_1','cp1',NULL,NULL,10);
INSERT INTO quantity_operations VALUES('RK_2','cp1',NULL,NULL,NULL);
INSERT INTO quantity_operations VALUES('LW_2','cp1',10,NULL,NULL);



COMMIT;
""")

# Commit changes and close the connection if you're done
conn.commit()

# Optionally, retrieve some data to verify the changes
cur.execute("SELECT * FROM event;")
print(cur.fetchall())

# Close the connection when done
conn.close()


import sqlite3

import numpy as np

# Step 1: Connect to the original SQLite database
original_db = "Data\ocel2-export.sqlite"
new_db = "new_database10.sqlite"

# Connect to the original database
conn_original = sqlite3.connect(original_db)
cur_original = conn_original.cursor()

# Step 2: Create a new SQLite database
conn_new = sqlite3.connect(new_db)
cur_new = conn_new.cursor()

# Step 3: Get all table names from the original database
cur_original.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cur_original.fetchall()

###################object table##############################
# Fetch the schema (CREATE TABLE statement) from the original database
cur_original.execute(
    f"SELECT sql FROM sqlite_master WHERE type='table' AND name= 'object';"
)
create_table_sql = cur_original.fetchone()[0]

# Create the same table in the new database
cur_new.execute(create_table_sql)

# Add the column 'ocel_changed_field' to the create_table_sql
cur_new.execute("ALTER TABLE object ADD COLUMN ocel_changed_field TEXT;")

# Step 5: Fetch the first 10 rows from the original table
cur_original.execute(f"SELECT * FROM object ORDER BY RANDOM() LIMIT 10;")
rows = cur_original.fetchall()

# Prepare the INSERT statement based on the number of columns
column_count = len(rows[0]) + 1  # Assumes there is at least 1 row
placeholders = ", ".join(["?"] * (column_count - 1)) + ", NULL"
insert_sql = f"INSERT INTO object VALUES ({placeholders});"

# Insert the first 10 rows into the new table
cur_new.executemany(insert_sql, rows)


# Step 3: Verify Data Retrieval

cur_new.execute("PRAGMA table_info(object);")
columns_info = cur_new.fetchall()
for column in columns_info:
    print(column)
# Print the first few rows to verify the order

cur_new.execute("SELECT * FROM object ORDER BY ocel_id LIMIT 501;")
ordered_rows = cur_new.fetchall()

for row in ordered_rows[:10]:
    print(row)


###################event_object table##############################

# Fetch the schema (CREATE TABLE statement) from the original database
cur_original.execute(
    f"SELECT sql FROM sqlite_master WHERE type='table' AND name= 'event_object';"
)
create_table_sql = cur_original.fetchone()[0]

# Create the same table in the new database
cur_new.execute(create_table_sql)

# Fetch the IDs from the object table
cur_new.execute("SELECT ocel_id FROM object;")
object_ids = [row[0] for row in cur_new.fetchall()]

# Fetch the matching rows from the event_object table
placeholders = ", ".join(["?"] * len(object_ids))
cur_original.execute(
    f"SELECT * FROM event_object WHERE ocel_object_id IN ({placeholders});", object_ids
)
matching_rows = cur_original.fetchall()

# Prepare the INSERT statement based on the number of columns
column_count = len(matching_rows[0])  # Assumes there is at least 1 row
placeholders = ", ".join(["?"] * column_count)
insert_sql = f"INSERT INTO event_object VALUES ({placeholders});"

# Insert the matching rows into the new table
cur_new.executemany(insert_sql, matching_rows)

###################event_x und object_xtables##############################

for table in tables:
    table_name = table[0]
    # Check if the table name starts with "event" or "object"
    if table_name[:5] == "event":
        if table_name == "event_map_type":
            # Fetch the schema (CREATE TABLE statement) from the original database
            cur_original.execute(
                f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';"
            )
            create_table_sql = cur_original.fetchone()[0]

            # Create the same table in the new database
            cur_new.execute(create_table_sql)

            # Step 5: Fetch the first 10 rows from the original table
            cur_original.execute(f"SELECT * FROM {table_name};")
            rows = cur_original.fetchall()

            # Prepare the INSERT statement based on the number of columns
            column_count = len(rows[0])  # Assumes there is at least 1 row
            placeholders = ", ".join(["?"] * column_count)
            insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders});"

            # Insert the first 10 rows into the new table
            cur_new.executemany(insert_sql, rows)
        elif table_name == "event_object":
            pass
        else:
            # Fetch the schema (CREATE TABLE statement) from the original database
            cur_original.execute(
                f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';"
            )
            create_table_sql = cur_original.fetchone()[0]

            # Create the same table in the new database
            cur_new.execute(create_table_sql)

            cur_new.execute("SELECT ocel_event_id FROM event_object;")
            event_ids = [row[0] for row in cur_new.fetchall()]
            if event_ids:  # Ensure event_ids is not empty
                # Fetch the matching rows from the event_object table
                placeholders = ", ".join(["?"] * len(event_ids))
                cur_original.execute(
                    f"SELECT * FROM {table_name} WHERE ocel_id IN ({placeholders});",
                    event_ids,
                )
                matching_rows = cur_original.fetchall()
            if matching_rows:
                # Prepare the INSERT statement based on the number of columns
                column_count = len(matching_rows[0])  # Assumes there is at least 1 row
                placeholders = ", ".join(["?"] * column_count)
                insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders});"

                # Insert the matching rows into the new table
                cur_new.executemany(insert_sql, matching_rows)

    elif table_name[:6] == "object":
        if table_name == "object_map_type":
            # Fetch the schema (CREATE TABLE statement) from the original database
            cur_original.execute(
                f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';"
            )
            create_table_sql = cur_original.fetchone()[0]

            # Create the same table in the new database
            cur_new.execute(create_table_sql)

            # Step 5: Fetch the rows from the original table
            cur_original.execute(f"SELECT * FROM {table_name};")
            rows = cur_original.fetchall()

            # Prepare the INSERT statement based on the number of columns
            column_count = len(rows[0])  # Assumes there is at least 1 row
            placeholders = ", ".join(["?"] * column_count)
            insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders});"

            # Insert the first 10 rows into the new table
            cur_new.executemany(insert_sql, rows)
        elif table_name == "object_object":
            # Fetch the schema (CREATE TABLE statement) from the original database
            cur_original.execute(
                f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';"
            )
            create_table_sql = cur_original.fetchone()[0]

            # Create the same table in the new database
            cur_new.execute(create_table_sql)

            # cur_new.execute("SELECT ocel_object_id FROM event_object;")
            # object_ids = [row[0] for row in cur_new.fetchall()]

            # Fetch the matching rows from the event_object table
            placeholders = ", ".join(["?"] * len(object_ids))
            cur_original.execute(
                f"SELECT * FROM {table_name} WHERE ocel_source_id IN ({placeholders});",
                object_ids,
            )
            matching_rows = cur_original.fetchall()

            # Prepare the INSERT statement based on the number of columns
            column_count = len(matching_rows[0])  # Assumes there is at least 1 row
            placeholders = ", ".join(["?"] * column_count)
            insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders});"

            # Insert the matching rows into the new table
            cur_new.executemany(insert_sql, matching_rows)
        elif table_name == "object":
            pass
        else:
            # Fetch the schema (CREATE TABLE statement) from the original database
            cur_original.execute(
                f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';"
            )
            create_table_sql = cur_original.fetchone()[0]

            # Create the same table in the new database
            cur_new.execute(create_table_sql)

            # cur_new.execute("SELECT ocel_object_id FROM event_object;")
            # object_ids = [row[0] for row in cur_new.fetchall()]

            # Fetch the matching rows from the event_object table
            placeholders = ", ".join(["?"] * len(object_ids))
            cur_original.execute(
                f"SELECT * FROM {table_name} WHERE ocel_id IN ({placeholders});",
                object_ids,
            )
            matching_rows = cur_original.fetchall()

            if matching_rows:
                # Prepare the INSERT statement based on the number of columns
                column_count = len(matching_rows[0])  # Assumes there is at least 1 row
                placeholders = ", ".join(["?"] * column_count)
                insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders});"

                # Insert the matching rows into the new table
                cur_new.executemany(insert_sql, matching_rows)

# add quantity_operations table for the new database
cur_new.execute(
    "CREATE TABLE IF NOT EXISTS quantity_operations (ocel_id TEXT, ocel_cpid TEXT, weizen INTEGER, weizen_mehl INTEGER, boxed_pizza INTEGER);"
)

# Fetch the IDs from the event table
cur_new.execute("SELECT ocel_id FROM event;")
event_ids = cur_new.fetchall()


cur_new.execute("INSERT INTO quantity_operations VALUES ('init','cp1',NULL,NULL,NULL);")


# Insert rows with ocel_id and ocel_cpid
for event_id in event_ids:
    x = np.random.randint(-10, 10)
    y = np.random.randint(-10, 10)
    z = np.random.randint(-10, 10)
    cur_new.execute(
        "INSERT INTO quantity_operations VALUES (?, ?, ?, ?, ?);",
        (event_id[0], "cp1", x, y, z),
    )


# Commit and close connections
conn_new.commit()
conn_original.close()
conn_new.close()
'''

import sqlite3


# Create a connection to an in-memory SQLite database or to a file-based database
conn = sqlite3.connect(
    "qel-example-v3.sqlite"
)  # Use ':memory:' for an in-memory database, or a file name for file-based

# Create a cursor object to execute SQL commands
cur = conn.cursor()

# Execute the SQL commands
cur.executescript(
    """
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "event" (
    "ocel_id" TEXT,
    "ocel_type" TEXT
);
INSERT INTO event VALUES('ev_1','Register Incoming Ingredients');  
INSERT INTO event VALUES('ev_2','Register Incoming Ingredients');
INSERT INTO event VALUES('ev_3','Check the quality');
INSERT INTO event VALUES('ev_4','Check the quality');
INSERT INTO event VALUES('ev_5','Accept and add to inventory');
INSERT INTO event VALUES('ev_6','Do not accept and send back');
INSERT INTO event VALUES('ev_7','Register pizza');
INSERT INTO event VALUES('ev_8','Register pizza');
INSERT INTO event VALUES('ev_9','Prepare pizza');
INSERT INTO event VALUES('ev_10','Prepare pizza');
INSERT INTO event VALUES('ev_11','Send pizza');
INSERT INTO event VALUES('ev_12','Send pizza');
INSERT INTO event VALUES('ev_13','Register pizza');
INSERT INTO event VALUES('ev_14','Register pizza');
INSERT INTO event VALUES('ev_15','Prepare pizza');
INSERT INTO event VALUES('ev_16','Prepare pizza');
INSERT INTO event VALUES('ev_17','Send pizza');
INSERT INTO event VALUES('ev_18','Send pizza');

CREATE TABLE IF NOT EXISTS "object" (
    "ocel_id" TEXT,
    "ocel_type" TEXT
);
INSERT INTO object VALUES('o_1','Ingredient-delivery');
INSERT INTO object VALUES('o_2','Ingredient-delivery');
INSERT INTO object VALUES('o_3','Pizza-order');
INSERT INTO object VALUES('o_4','Pizza-order');
INSERT INTO object VALUES('o_5','Pizza-order');
INSERT INTO object VALUES('o_6','Pizza-order');


CREATE TABLE IF NOT EXISTS "event_object" (
    "ocel_event_id" TEXT,
    "ocel_object_id" TEXT,
    "ocel_qualifier" TEXT
);

INSERT INTO event_object VALUES('ev_1','o_1',NULL);
INSERT INTO event_object VALUES('ev_3','o_1',NULL);
INSERT INTO event_object VALUES('ev_5','o_1',NULL);


INSERT INTO event_object VALUES('ev_2','o_2',NULL);
INSERT INTO event_object VALUES('ev_4','o_2',NULL);
INSERT INTO event_object VALUES('ev_6','o_2',NULL);

INSERT INTO event_object VALUES('ev_7','o_3',NULL);
INSERT INTO event_object VALUES('ev_9','o_3',NULL);
INSERT INTO event_object VALUES('ev_11','o_3',NULL);

INSERT INTO event_object VALUES('ev_8','o_4',NULL);
INSERT INTO event_object VALUES('ev_10','o_4',NULL);
INSERT INTO event_object VALUES('ev_12','o_4',NULL);

INSERT INTO event_object VALUES('ev_13','o_5',NULL);
INSERT INTO event_object VALUES('ev_15','o_5',NULL);
INSERT INTO event_object VALUES('ev_17','o_5',NULL);

INSERT INTO event_object VALUES('ev_14','o_6',NULL);
INSERT INTO event_object VALUES('ev_16','o_6',NULL);
INSERT INTO event_object VALUES('ev_18','o_6',NULL);
                  

CREATE TABLE IF NOT EXISTS "object_object" (
    "ocel_source_id" TEXT,
    "ocel_target_id" TEXT,
    "ocel_qualifier" TEXT
);

CREATE TABLE IF NOT EXISTS "event_register_incoming_ingredients" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO event_register_incoming_ingredients VALUES('ev_1','2025-01-01 00:00:01');
INSERT INTO event_register_incoming_ingredients VALUES('ev_2','2025-01-01 00:00:10');

CREATE TABLE IF NOT EXISTS "event_check_the_quality" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO event_check_the_quality VALUES('ev_3','2025-01-01 00:00:03');
INSERT INTO event_check_the_quality VALUES('ev_4','2025-01-01 00:00:14');
                  

CREATE TABLE IF NOT EXISTS "event_accept_and_add_to_inventory" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO event_accept_and_add_to_inventory VALUES('ev_5','2025-01-01 00:00:05');

CREATE TABLE IF NOT EXISTS "event_do_not_accept_and_send_back" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO event_do_not_accept_and_send_back VALUES('ev_6','2025-01-01 00:00:16');                  

                  
CREATE TABLE IF NOT EXISTS "event_register_pizza" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO event_register_pizza VALUES('ev_7','2025-01-01 00:00:07');
INSERT INTO event_register_pizza VALUES('ev_8','2025-01-01 00:00:18');
INSERT INTO event_register_pizza VALUES('ev_13','2025-02-01 00:00:07');
INSERT INTO event_register_pizza VALUES('ev_14','2025-03-01 00:00:18');

                  
CREATE TABLE IF NOT EXISTS "event_prepare_pizza" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO event_prepare_pizza VALUES('ev_9','2025-01-01 00:00:09');
INSERT INTO event_prepare_pizza VALUES('ev_10','2025-01-01 00:00:20');
INSERT INTO event_prepare_pizza VALUES('ev_15','2025-02-01 00:00:09');
INSERT INTO event_prepare_pizza VALUES('ev_16','2025-03-01 00:00:20');

CREATE TABLE IF NOT EXISTS "event_send_pizza" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO event_send_pizza VALUES('ev_11','2025-01-01 00:00:11');
INSERT INTO event_send_pizza VALUES('ev_12','2025-01-01 00:00:22');
INSERT INTO event_send_pizza VALUES('ev_17','2025-02-01 00:00:11');
INSERT INTO event_send_pizza VALUES('ev_18','2025-03-01 00:00:22');
                  

CREATE TABLE IF NOT EXISTS "event_map_type" (
    "ocel_type" TEXT,
    "ocel_type_map" TEXT
);
INSERT INTO event_map_type VALUES('Register Incoming Ingredients','register_incoming_ingredients');
INSERT INTO event_map_type VALUES('Check the quality','check_the_quality');
INSERT INTO event_map_type VALUES('Accept and add to inventory','accept_and_add_to_inventory');
INSERT INTO event_map_type VALUES('Do not accept and send back','do_not_accept_and_send_back');
INSERT INTO event_map_type VALUES('Register pizza','register_pizza');
INSERT INTO event_map_type VALUES('Prepare pizza','prepare_pizza');
INSERT INTO event_map_type VALUES('Send pizza','send_pizza');

CREATE TABLE IF NOT EXISTS "object_map_type" (
    "ocel_type" TEXT,
    "ocel_type_map" TEXT
);
INSERT INTO object_map_type VALUES('Ingredient-delivery','Ingredient_delivery');
INSERT INTO object_map_type VALUES('Pizza-order','pizza_order');

CREATE TABLE IF NOT EXISTS "object_ingredient_delivery" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO object_ingredient_delivery VALUES('o_1','2025-01-01 00:00:01');
INSERT INTO object_ingredient_delivery VALUES('o_2','2025-01-01 00:00:12');

                  

CREATE TABLE IF NOT EXISTS "object_pizza_order" (
    "ocel_id" TEXT,
    "ocel_time" TEXT
);
INSERT INTO object_pizza_order VALUES('o_3','2025-01-01 00:00:03');
INSERT INTO object_pizza_order VALUES('o_4','2025-01-01 00:00:14');
INSERT INTO object_pizza_order VALUES('o_5','2025-02-01 00:00:03');
INSERT INTO object_pizza_order VALUES('o_6','2025-03-01 00:00:14');


                  
CREATE TABLE IF NOT EXISTS "quantity_operations" (
    "ocel_id" TEXT,
    "ocel_cpid" TEXT,
    "Dough"   INTEGER,
    "Tomato_sauce"   INTEGER,
    "Cheese"   INTEGER
);
                  
INSERT INTO quantity_operations VALUES('init','planning',NULL,NULL,NULL);
INSERT INTO quantity_operations VALUES('init','physical',10,10,10);               
                        
INSERT INTO quantity_operations VALUES('ev_1','planning',10,10,10);
INSERT INTO quantity_operations VALUES('ev_2','planning',5,5,5);     
INSERT INTO quantity_operations VALUES('ev_5','physical',10,10,10);            
INSERT INTO quantity_operations VALUES('ev_11','physical',-1,-2,-3);
INSERT INTO quantity_operations VALUES('ev_11','planning',-1,-2,-3);
INSERT INTO quantity_operations VALUES('ev_12','physical',-1,-2,-3);
INSERT INTO quantity_operations VALUES('ev_12','planning',-1,-2,-3);
INSERT INTO quantity_operations VALUES('ev_17','physical',-3,-7,-6);
INSERT INTO quantity_operations VALUES('ev_18','physical',-2,-3,-3);

          
COMMIT;
"""
)

# Commit changes and close the connection if you're done
# conn.commit()

# Optionally, retrieve some data to verify the changes
cur.execute("SELECT * FROM event;")

# Close the connection when done
conn.close()


def export_all_tables_to_latex(db_file, output_file="latex_tables.txt"):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]

    latex_content = ""

    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [col[1] for col in cursor.fetchall()]

        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()

        # Generate LaTeX table
        latex_table = "\\begin{table}[h]\n\\centering\n"
        latex_table += (
            "\\begin{tabular}{" + " | ".join(["c"] * len(columns)) + "}\n\\hline\n"
        )
        latex_table += " & ".join(columns) + " \\\\\n\\hline\n"

        for row in rows:
            latex_table += " & ".join(map(str, row)) + " \\\\\n"

        latex_table += (
            "\\hline\n\\end{tabular}\n\\caption{Data from "
            + table
            + "}\n\\end{table}\n\n"
        )

        latex_content += latex_table

    conn.close()

    # Save to file
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(latex_content)

    print(f"LaTeX tables saved to {output_file}")


# Example usage
db_file = "qel-example-v3.sqlite"

# export_all_tables_to_latex(db_file)
# Example usage
