import psycopg2
import csv

class pushToDB:
    def __init__(self):
        self.conn = psycopg2.connect(
            dbname = "ContainerSecurity",
            user = "nishantv",
            password = "nishant123"
        )

        self.cur = self.conn.cursor()

        with open('/Users/nishantv/Downloads/Projects/ContainerSecurity/idkoutput.csv', newline = '') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                name = row['NAME']
                version = row['INSTALLED']
                fixed_in = row['FIXED-IN']
                type = row['TYPE']
                vulnerability = row['VULNERABILITY']
                severity = row['SEVERITY']

                self.cur.execute(
                    """
                    INSERT INTO rec_new (name,version,fixed_in,type,vulnerability,severity)
                    VALUES(%s,%s,%s,%s,%s,%s)
                    """,(name,version,fixed_in,type,vulnerability,severity))

            self.conn.commit()

            self.cur.close()
            self.conn.close()




def main():
    pushToDB()

if __name__ == "__main__":
    main()