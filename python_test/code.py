import psycopg2
 
conn = psycopg2.connect(
    database="ContainerSecurity",
    user='nishantv',
    password='nishant123',

)

cve_data = {
    "CVE-2023-0286": 9.8,
    "CVE-2022-22965": 9.8,
    "CVE-2021-44228": 10.0,
    "CVE-2020-1472": 10.0,
    "CVE-2019-0708": 9.8,
    "CVE-2018-11776": 8.1,
    "CVE-2017-0144": 8.5,
    "CVE-2016-0800": 7.4,
    "CVE-2015-0204": 7.8,
    "CVE-2014-6271": 10.0
}

cur = conn.cursor()

for key, val in cve_data.items():
    query = '''
    SELECT * from cvss_score where cve_name = "${key}"
        '''
    
    cur.execute(query)
    for x in cur.fetchall():
        print(x)



