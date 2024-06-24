import os
import psycopg2
import json
import sys


class jsonToDB:

    def __init__(self, fileName):

        self.fileName = fileName
        
        self.conn = psycopg2.connect(
            dbname="ContainerSecurity",
            user="nishantv",
            password="nishant123",
        )

        self.path = '/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/JSONs'
        self.cur = self.conn.cursor()

    def pushToDB(self):
        
        fileOpen = open(os.path.join(self.path,self.fileName))
        jsonFile = json.load(fileOpen)
    

        for data in jsonFile:
            name = data.get("name")
            version = data.get("version")
            type = data.get("type")

            if name == "" or version == "" or type == "":
                continue

            self.cur.execute(
            """
            INSERT INTO checkdb (name,version,type) 
            VALUES (%s, %s, %s)
            """,(name,version,type))

        
        self.cur.execute(
            """
            SELECT DISTINCT rec_new.name,rec_new.version,rec_new.fixed_in,rec_new.type,rec_new.vulnerability,rec_new.severity
            FROM rec_new
            JOIN checkdb
            ON 
            rec_new.name = checkdb.name
            AND 
            rec_new.version = checkdb.version;

            """
        )

        res = '[]'

        data = json.loads(res)


        for row in self.cur.fetchall():
            dataLen = len(data)

            temp = [('name' , row[0]),('version',row[1]),('fixed_in',row[2]),('type',row[3]),('vulnerability',row[4]),('severity',row[5])]
            temp = dict(temp)

            if dataLen > 0 and temp['name'] == data[dataLen - 1]['name']:
                data.pop()

            data.append(temp)

        
        self.conn.commit()

        self.cur.close()
        self.conn.close()

        return data


def main():
    params = json.loads(sys.stdin.read())
    fileName = params.get("fileName") 
    classObj = jsonToDB(fileName)
    data = classObj.pushToDB()

    jsonPath = os.path.join("/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/JSONs/" + fileName)
    print(jsonPath)
    with open(jsonPath, 'w') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
    
if __name__ == "__main__":  
        main()





