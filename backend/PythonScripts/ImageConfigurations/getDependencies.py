import subprocess
import sys
import json
import os

class Syft:

    def __init__(self, tarName) -> None:
        self.tarName = tarName

    def getDependencies(self):
        try:
            output = subprocess.check_output(["syft", self.tarName], stderr = subprocess.STDOUT, text = True)
            return output.strip().split('\n')
        
        except subprocess.CalledProcessError as e:
            return e


def main():
    params = json.loads(sys.stdin.read())
    fileName = params.get("fileName")
    pathName = '/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/uploads/'
    tarName = os.path.join(pathName ,str(fileName))
    obj = Syft(tarName)
    print(obj.getDependencies())

if __name__ == "__main__":
    main()