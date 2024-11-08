import psycopg2
import requests
import time
from bs4 import BeautifulSoup

conn = psycopg2.connect(
    database="ContainerSecurity",
    user='nishantv',
    password='nishant123',
)

cur = conn.cursor()

cur.execute(
    """
    SELECT name from cve_table;
    """
)

result = cur.fetchall()
cve_names = [row[0] for row in result]



for i, cve in enumerate(cve_names):
    url = f"https://nvd.nist.gov/vuln/detail/{cve}"

    print(url)

    response = requests.get(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')

        score = None
        
        try:
            cvss2_element = soup.find('a', {"id": "Cvss2CalculatorAnchor"})
            cvss2 = cvss2_element.text.strip()

            if cvss2 != 'N/A':
                score = cvss2
        
        try:
            cvss3_element = soup.find('a', {"id": "Cvss3NistCalculatorAnchorNA"})
            cvss3 = cvss3_element.text.strip()

            if cvss3 != 'N/A':
                score = cvss3

        
        try:
            cvss4_element = soup.find('a', {"id": "Cvss4NistCalculatorAnchorNA"})
            cvss4 = cvss4_element.text.strip()

            if cvss4 != 'N/A':
                score = cvss4

        if score:
            try:
                score = float(score[:3])
                print(cve, score)
                cur.execute(
                    '''
                    INSERT INTO cvss_score_new (name, score) VALUES (%s, %s)
                    '''
                    , (cve, score)
                )

conn.commit()
cur.close()
conn.close()
