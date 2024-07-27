const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

ipcMain.handle("select-destination-folder", async (event) => {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    properties: ["openDirectory"],
  });
  if (result.filePaths && result.filePaths.length > 0) {
    return result.filePaths[0]; // Return the selected directory path
  }
  return null; // Return null if no directory was selected
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");

  ipcMain.on("folderDropped", (event, sourcePath, destinationDir) => {
    folderName = sourcePath.split("\\");
    copyDirectory(sourcePath, destinationDir);
  });

  ipcMain.on("moveReversed", (event, sourcePath, destinationDir) => {
    folderName = sourcePath.split("\\");
    copyDirectory(destinationDir, sourcePath);
  });
};

function copyDirectory(sourceDir, destinationDir) {
  fs.mkdirSync(destinationDir, { recursive: true });

  fs.readdirSync(sourceDir).forEach((file) => {
    const sourceFilePath = path.join(sourceDir, file);
    const destinationFilePath = path.join(destinationDir, file);

    // Get the file extension
    const fileExtension = path.extname(file).toLowerCase();

    // Check if the file has a .png or .jpg extension and is not a directory
    if (
      (fileExtension === ".png" || fileExtension === ".jpg") &&
      fs.statSync(sourceFilePath).isFile()
    ) {
      fs.copyFileSync(sourceFilePath, destinationFilePath);
      fs.unlinkSync(sourceFilePath);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
});
