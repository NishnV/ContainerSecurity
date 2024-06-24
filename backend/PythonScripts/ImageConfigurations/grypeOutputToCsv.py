import subprocess
import csv

def run_grype(image_name):
    try:
        output = subprocess.check_output(["grype", image_name], stderr=subprocess.STDOUT, text=True)
        print("Completed f{image_name}",image_name)
        return output.strip().split('\n')
    except subprocess.CalledProcessError as e:
        print("Couldnt complete f{image_name}",image_name)
        return e.output.strip()

def read_image_names(file_path):
    with open(file_path, 'r') as file:
        return [line.strip() for line in file]

def write_to_csv(output_data, csv_file):
    with open(csv_file, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(output_data)

    

def main():

    input_file = "/Users/nishantv/Downloads/Projects/Container Security/backend/PythonScripts/ImageConfigurations/images_names.txt"
    output_csv = "idkoutput.csv"
    csv_out = [['NAME', 'INSTALLED', 'FIXED-IN', 'TYPE', 'VULNERABILITY', 'SEVERITY']]

    image_names = read_image_names(input_file)

    for image_name in image_names:
        grype_out = run_grype(image_name)
        
        for line in grype_out[1:]:
            splitted = line.split()
            if len(splitted) == 5:
                csv_out.append(splitted[0:2] + ['Not Fixed'] + splitted[2:])
            elif len(splitted) == 7:
                csv_out.append(splitted[0:2] + [' '.join(splitted[2:4])] + splitted[4:])    
            else:
                csv_out.append(splitted)

    write_to_csv(csv_out, output_csv)


if __name__ == "__main__":
    main()

