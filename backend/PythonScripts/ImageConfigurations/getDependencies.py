import subprocess
import sys
import json
import os
import re
from jsonToDB import jsonToDB

class Syft:
    def __init__(self, tarName) -> None:
        self.tarName = tarName

    def getDependencies(self):
        print(f"Running syft on {self.tarName}")
        try:
            with open(os.devnull, 'w') as devnull:
                output = subprocess.check_output(["syft", self.tarName], stderr=devnull, text=True)
            return output.strip().split('\n')
        except subprocess.CalledProcessError as e:
            print("Error running syft:", e)
            return e.output.strip().split('\n')

def parse_dependency_line(line):
    pattern = r"^([^\s]+)\s+([^\s]+)\s+([^\s]+)(.*)$"
    match = re.match(pattern, line)
    if match:
        name = match.group(1)
        version = match.group(2)
        module_type = match.group(3)
        additional_info = match.group(4).strip()
        duplicates = re.search(r"\(\+(\d+)\s+duplicates?\)", additional_info)
        duplicate_count = duplicates.group(1) if duplicates else "0"
        parsed = {
            "name": name,
            "version": version,
            "type": module_type,
            "duplicates": int(duplicate_count)
        }
        return parsed
    return None

def main():
    params = json.loads(sys.stdin.read())
    fileName = params.get("fileName")
    
    pathName = '/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/uploads/'
    tarName = os.path.join(pathName, fileName)
    obj = Syft(tarName)
    dependencies = obj.getDependencies()
    
    parsed_dependencies = []
    for line in dependencies:
        parsed_dep = parse_dependency_line(line)
        if parsed_dep:
            parsed_dependencies.append(parsed_dep)
    
    jsonPath = os.path.join("/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/JSONs/", f"{fileName}.json")
    with open(jsonPath, 'w') as file:
        json.dump(parsed_dependencies[1:], file, ensure_ascii=False, indent=4)

    
    obj = jsonToDB(fileName).pushToDB()

    
    

if __name__ == "__main__":
    main()
