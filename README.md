<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Scripts for Setting up and Running Crosshair X Desktop App locally.](#scripts-for-setting-up-and-running-crosshair-x-desktop-app-locally)
  - [Step 1: Run `'npm install'` to install project dependencies](#step-1-run-npm-install-to-install-project-dependencies)
  - [Step 2: **IMPORTANT** After you run `'npm install'`, run this command =====> `'./node_modules/.bin/electron-builder'`](#step-2-important-after-you-run-npm-install-run-this-command--node_modulesbinelectron-builder)
  - [Step 3: Have `npm run-script start-dev` running in one terminal](#step-3-have-npm-run-script-start-dev-running-in-one-terminal)
  - [Step 4: Run `npm run-script start` in a separate terminal](#step-4-run-npm-run-script-start-in-a-separate-terminal)
- [Deployment Steps](#deployment-steps)
  - [Step 1: Minified Front End files](#step-1-minified-front-end-files)
  - [Step 2: Packaging the Front End and Electron App**](#step-2-packaging-the-front-end-and-electron-app)
  - [Step 3: Windows Redistributables included in artifact packaging**](#step-3-windows-redistributables-included-in-artifact-packaging)
  - [Step 4: (Microsoft Store only): Bundling into a .appxbundle file**](#step-4-microsoft-store-only-bundling-into-a-appxbundle-file)
  - [Step 5: Upload artifacts to respective distribution platform**](#step-5-upload-artifacts-to-respective-distribution-platform)
    - [Microsoft Store:](#microsoft-store)
    - [Steam:](#steam)
- [Automated Build Script (Steps 1 to 4)](#automated-build-script-steps-1-to-4)
  - [Run the following script:](#run-the-following-script)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

This code project is responsible for running the Crosshair X desktop app. It's also responsible for building the packaged artifacts that are uploaded to Steam and the Microsoft Store when an update is required.

# Scripts for Setting up and Running Crosshair X Desktop App locally.

## Step 1: Run `'npm install'` to install project dependencies
Pretty standard across all node.js projects. Installs all the node.js modules used in the project in the node_modules folder.

## Step 2: **IMPORTANT** After you run `'npm install'`, run this command =====> `'./node_modules/.bin/electron-builder'`

This command rebuilds necessary windows modules so they get rid of NODE_MODULE_VERSION errors. We rely on NPM packages that are dependent on native Windows 10/11 development modules such as the UWP App Service Connection (Game Bar connection) and those need to be rebuilt from scratch depending on the version of node.js that is currently installed on the development machine.

## Step 3: Have `npm run-script start-dev` running in one terminal

Runs the web portion of the app in the development mode.<br />

The way the app runs locally is that the front-end React code of the app is hosted on a local web server ([http://localhost:3000](http://localhost:3000)) and the electron portion of the app accesses that web page. When a change is made on the front-end, it should hot reload the app.

## Step 4: Run `npm run-script start` in a separate terminal

Runs the electron portion of the app. Changes made in main.js or files within main-process/ are not going to hot-reload. You need to rerun this command any time you make changes in that file or directory.

# Deployment Steps

This app is deployed to two different distributions platforms:
* [Steam](https://store.steampowered.com/app/1366800/Crosshair_X/)
* [Microsoft Store](https://www.microsoft.com/en-us/p/crosshair-x/9p8prdd1zm6l)

This means that both distribution platforms have different file formats and processes for project submissions.

## Step 1: Minified Front End files
Both apps make use of a minified set of HTML, CSS and JS files that get compiled into the *build/* folder after running `npm run build`.
When the electron version of the app is ran, it loads the front end portion of the app from this folder, specifically *build/index.html*

**Steam Step 1: Run `npm run-script buildForSteam`**

**Microsoft Step 1: Run `npm run-script buildForMicrosoftStore`**

**How do they differ?** Both utilize `npm run build` to minify the files into the build folder. However, prior to building it, an envVars.json file pertaining to each platform gets copied into the main directory from the `enivornmentVariables` folder to let the app know which distribution is being ran at the moment. 

This differentiation in the app is useful because
* it lets support know if the app is Steam or Microsoft
* if its a Steam user, we can show them the 'Leave us a review' popup

## Step 2: Packaging the Front End and Electron App**
Both apps require the compiled electron app and bundled minified front end to work. After the respective build command is run, we run `npm run-script packageForSteam`. This creates the necessary .exe files for running the app on a Windows 10/11 machine.

## Step 3: Windows Redistributables included in artifact packaging**
Since the app makes use of certain Windows 10/11 C++ SDKs, we have to include the binaries (.dll files) into the folder of every rebuilt Windows 10 module. Recall the dependencies that are rebuilt when we run `'./node_modules/.bin/electron-builder'` noted above. This 

The specific .dlls we include are:
- concrt140.dll
- msvcp140.dll
- vccorlib140.dll
- vcruntime140.dll

We include them into every file that looks like this:
CrosshairX-win32-x64\resources\app.asar.unpacked\node_modules\@nodert-win10-rs4\windows.applicationmodel.appservice\bin\win32-x64-85

The specific node_modules that we put them in are
- global-mouse-events (Native Keyboard and Mouse Event listeners)
- @nodert-win10-rs4\windows.applicationmodel.appservice
- @nodert-win10-rs4\windows.foundation
- @nodert-win10-rs4\windows.foundation.collections

and sub folders:
- bin\win32-x64-85
- build\Release

## Step 4: (Microsoft Store only): Bundling into a .appxbundle file**
Microsoft Store accepts a .appxbundle. In order to create this, we have to take the packaged files from Step 2 and run them through the bundling process. To run the bundling process, its a two script process. 

Make sure to configure [electron-windows-store](https://www.npmjs.com/package/electron-windows-store) on your machine the first time you run the scripts below. You can find all of the variables you need on the Microsoft Developer Store and the Cert provided below.

1. Fetch `Cert.pfx` from `\OneDrive\CenterPoint Gaming\Product Development\Crosshair X Cert`
2. Run `npm run-script packageForMicrosoftStore`. This creates a .appx file. The first time this is ran, you'll have to configure `electron-windows-store`
3. Run `npm run-script convertToBundle`. The Microsoft Store requires a .appxbundle file so this converts the .appx file to .appxbundle

## Step 5: Upload artifacts to respective distribution platform**

### Microsoft Store:
Grab the .appxbundle file created earlier and upload it as a submission to the Microsoft Store. Make sure to roll it out gradually (set to 99%) so that you have the ability to roll back the update incase it is faulty.

### Steam:
This [youtube video from Steam](https://www.youtube.com/watch?v=SoNH-v6aU9Q) explains it best.

# Automated Build Script (Steps 1 to 4)
Doing the steps listed below manually would be very tedious. Hence, a script was made to automate all the steps minus uploading of the artifacts.

## Run the following script:
`.\buildscript.py`




