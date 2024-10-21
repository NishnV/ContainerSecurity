import psycopg2

conn = psycopg2.connect(
    dbname = "ContainerSecurity",
    user = "nishantv",
    password = "nishant123"
)

cur = conn.cursor()

cur.execute(
    """
    SELECT * FROM cve_table;
    """
)

for i,row in enumerate(cur.fetchall()):
    if i == 100:
        break
    print(row)

conn.commit()

cur.close()
conn.close()