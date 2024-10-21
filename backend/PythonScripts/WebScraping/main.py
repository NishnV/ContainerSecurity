import requests
from bs4 import BeautifulSoup
import psycopg2
import time

class WebScraping:
    def __init__(self):
        self.conn = psycopg2.connect(
            database = 'ContainerSecurity',
            user = 'nishantv',
            password = 'nishant123'
            )

        self.cur = self.conn.cursor()


    def scrape_packages(self):

        for i in range(10,4659):

            url = 'https://pkgs.alpinelinux.org/packages?page={i}&branch=edge'.format(i = i)

            response = requests.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            rows = soup.find_all('tr')

            for row in rows:
                package_td = row.find('td', class_ = 'package')
                version_td = row.find('td', class_ = 'version')
                date_td = row.find('td', class_ = 'bdate')

                if package_td and version_td and date_td:
                    package_name = package_td.find('a').text.strip()
                    version = version_td.find('a').text.strip()
                    last_updated = date_td.text.strip()

                    self.cur.execute(
                        """
                        INSERT INTO packages(package, version, updated)
                        VALUES(%s,%s,%s)
                        """
                    , (package_name,version,last_updated))


        self.conn.commit()
        self.cur.close()
        self.conn.close()

def main():
    scraper = WebScraping()
    scraper.scrape_packages()

if __name__ == "__main__":
    main()
