import psycopg2
import csv

conn = psycopg2.connect(
    dbname="ContainerSecurity",
    user="nishantv",
    password="nishant123"
)

cur = conn.cursor()

with open('allbro1.csv', newline='') as csvfile:
    csvreader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(csvreader)
    count = 0
    
    for row in csvreader:
        count += 1
        name = row[0]

        cvss_score = row[3]

        print(name, cvss_score)
        '''
        cur.execute(
                """
                INSERT INTO cvss_score (cve_name, score) VALUES (%s, %s);
                """, (name, cvss_score)
        )
        '''
    
    print(count)

    conn.commit()

cur.close()
conn.close()