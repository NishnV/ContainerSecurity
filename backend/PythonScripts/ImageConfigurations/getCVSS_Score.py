import psycopg2
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time

# Set up Selenium WebDriver (example for Chrome)
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run headless if you don't need a GUI
service = Service('/path/to/chromedriver')  # Update with the path to your WebDriver
driver = webdriver.Chrome(service=service, options=chrome_options)

conn = psycopg2.connect("dbname=ContainerSecurity user=nishantv password=nishant123")
cur = conn.cursor()

cur.execute("SELECT name FROM cve_table;")
rows = cur.fetchall()

cves = [row[0] for row in rows]  # Extract CVE names from the query result

# Iterate over each CVE ID and request the corresponding page using Selenium
for cve in cves:
    url = f"https://www.cve.org/CVERecord?id={cve}"
    driver.get(url)
    
    # Wait for the page to load properly (you may need to increase this if pages load slowly)
    time.sleep(3)
    
    try:
        # Locate and extract the score from the web page
        score_element = driver.find_element(By.XPATH, '//td[@data-label="Score"]')
        score_value = score_element.text.strip()
        print(f"CVE: {cve}, Score: {score_value}")
    except Exception as e:
        print(f"CVE: {cve}, Score not found. Error: {str(e)}")
    
    # Add a delay to prevent overwhelming the website
    time.sleep(2)

# Close the Selenium WebDriver
driver.quit()

# Close the database connection
cur.close()
conn.close()
