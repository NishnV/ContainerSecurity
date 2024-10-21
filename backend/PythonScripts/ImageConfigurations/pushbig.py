import csv
import psycopg2

def main():

    print('in main')

    conn = psycopg2.connect(dbname="ContainerSecurity", user="nishantv", password="nishant123")
    cur = conn.cursor()
    
    try:
        with open('/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/Others/allbroitems.csv', 'r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            
            if not reader.fieldnames:
                print("No fieldnames found. Please check the CSV file headers.")
                return

            print("Fieldnames found: ", reader.fieldnames)
            
            for row in reader:
                if not row:
                    continue


                name = row['Name']
                status = row['Status']
                description = row['Description']

                cur.execute(
                    """
                        INSERT INTO cve_table (name, status, description)
                        VALUES (%s, %s, %s)
                    """, (name, status, description))
        
        conn.commit()
        print("Data committed to the database.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        cur.close()
        conn.close()
        print("Database connection closed.")

if __name__ == "__main__":
    main()
