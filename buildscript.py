import shutil
import subprocess
import os
import time

# Remove old build artifacts
# Code that deletes an array of directories if the directory exists
# This is a list of directories to delete
dirs_to_delete = ['./build', './CrosshairX-win32-x64', './output', '../steamPublishOutput', '../microsoftStorePublishOutput']
for dir in dirs_to_delete:
    if os.path.exists(dir):
        shutil.rmtree(dir)


# Code that deletes one file if it exists
# This is a list of files to delete
files_to_delete = ['./CrosshairX.appxbundle']
for file in files_to_delete:
    if os.path.exists(file):
        os.remove(file)

# Package for Steam
subprocess.call(['npm', 'run-script', 'buildForSteam'], shell=True)
subprocess.call(['npm', 'run-script', 'packageForSteam'], shell=True)

# Find all subdirectories of C:\Users\Jurko\source\repos\Centerpoint-Gaming\CrosshairX\rootui-react\CrosshairX-win32-x64\resources\app.asar.unpacked\node_modules that contain a .node file
for root, dirs, files in os.walk("C:\\Users\\Jurko\\source\\repos\\Centerpoint-Gaming\\CrosshairX\\rootui-react\\CrosshairX-win32-x64\\resources\\app.asar.unpacked\\node_modules"):
    for file in files:
        if file.endswith(".node"):
            # If the file is a .node file, then copy the .dll file to the same directory
            os.system("copy C:\\Users\\Jurko\\source\\repos\\Centerpoint-Gaming\\CrosshairX\\dllsForJavascriptError\\*.dll " + root)
            break

time.sleep(5)


# copy all files from one directory to another if it exists. If the destination directory doesn't exist, create it
# This is the directory to copy all the files from
src_dir = "./CrosshairX-win32-x64"
# This is the directory to copy all the files to
dest_dir = "../steamPublishOutput"

# make sure the directory exists
if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

# move folder and rename source directory to destination directory
# the folder structure of the source directory is preserved
for src_file in os.listdir(src_dir):
    src_file_path = os.path.join(src_dir, src_file)
    dest_file_path = os.path.join(dest_dir, src_file)
    if os.path.isdir(src_file_path):
        shutil.copytree(src_file_path, dest_file_path)
    else:
        shutil.copy(src_file_path, dest_file_path)


# Ask to publish to Steam
publish_to_steam = "yes"
if publish_to_steam == "yes":
    # Delete all files from '../Steam/tools/ContentBuilder/content/windows_content'
    for root, dirs, files in os.walk("../Steam/tools/ContentBuilder/content/windows_content"):
        for file in files:
            try:
                os.remove(os.path.join(root, file))
            except:
                pass
    # Copy all files and folders from '../steamPublishOutput' to '../Steam/tools/ContentBuilder/content/windows_content'
    # the folder structure of the source directory is preserved
    for src_file in os.listdir("../steamPublishOutput"):
        src_file_path = os.path.join("../steamPublishOutput", src_file)
        dest_file_path = os.path.join("../Steam/tools/ContentBuilder/content/windows_content", src_file)
        try: 
            if os.path.isdir(src_file_path):
                shutil.copytree(src_file_path, dest_file_path)
            else:
                shutil.copy(src_file_path, dest_file_path)
        except:
            pass

# Run the steamcmd.exe in ../Steam/tools/ContentBuilder/builder/steamcmd.exe to publish to Steam
# subprocess.call(['C:/Users/Jurko/source/repos/Centerpoint-Gaming/CrosshairX/Steam/tools/ContentBuilder/builder/steamcmd.exe', '+login ', '+run_app_build C:/Users/Jurko/source/repos/Centerpoint-Gaming/CrosshairX/Steam/tools/ContentBuilder/scripts/app_build_1366800.vdf', '+exit'], shell=True)
# print("Published to Steam")

# Microsoft Store ask for incremement in version

# Build for Microsoft Store
subprocess.call(['npm', 'run-script', 'buildForMicrosoftStore'], shell=True)

# Package for Microsoft Store
subprocess.call(['npm', 'run-script', 'packageForMicrosoftStore'], shell=True)

# Convert to AppxBundle
subprocess.call(['npm', 'run-script', 'convertToBundle'], shell=True)

path = '../microsoftStorePublishOutput'
if not os.path.exists(path):
   os.mkdir(path)

shutil.move('./CrosshairX.appxbundle', path)

