const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const auth = require('./src/js/auth.js');

const settings = require('./src/js/settings.js')

const {app, BrowserWindow, Menu, ipcMain} = electron;
const ipc = require('ipc');
const { ipcRenderer } = require('electron/renderer');

let addAccountWindow;
let mainWindow;

app.on('ready', () => {
	/*var loginWindow = new BrowserWindow({
		minWidth: 1200,
		minHeight: 700,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			preload: path.join(__dirname, "preload.js")
		},
		icon: path.join(__dirname, "src/assets/icon.png")
	});
	loginWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'src/login.html'),
		protocol: 'file:',
		slashes: true
	}));*/

	ipcMain.on('openDirectory', (event, arg) => {
		var options = {
			properties: [
				'openDirectory'
			]
		};

		if(arg != undefined) {
			if(arg.defaultDir != undefined) {
				while(arg.defaultDir.includes("/")) {
					arg.defaultDir = arg.defaultDir.replace("/", "\\");
				}

				console.log("Custom ARG: " + arg.defaultDir);
				options.defaultPath = arg.defaultDir;
			}
		}
		
		var dir = electron.dialog.showOpenDialogSync(mainWindow, options);
		if(dir == undefined) {
			console.error("No directory selected!");
			event.sender.send('error', 'no_directory_selected');
		} else {
			console.log("Selected Dir: " + dir[0]);
			event.sender.send('directory', dir[0]);
		}
	});
	//ipcMain.on('openMainWindow', (event, args) => {
		mainWindow = new BrowserWindow({
			minWidth: 955,
			minHeight: 600,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				preload: path.join(__dirname, "preload.js")
			},
			icon: path.join(__dirname, "src/assets/icon.png")
		});
		mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'src/main.html'),
			protocol: 'file:',
			slashes: true
		}));

		mainWindow.on('close', () => {
			app.quit();
		})

		/*setTimeout(() => {
			mainWindow.webContents.send('accountData', {data: args});
		}, 1000);*/

		//loginWindow.close();
	//});
	ipcMain.on('openLoginWindow', (event, args) => {
		loginWindow = new BrowserWindow({
			minWidth: 1200,
			minHeight: 600,
			width: 1200,
			height: 600,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				preload: path.join(__dirname, "preload.js")
			}
		});
		loginWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'src/login.html'),
			protocol: 'file:',
			slashes: true
		}));
	});

	ipcMain.on('openAddAccountWindow', (event, args) => {
		addAccountWindow = new BrowserWindow({
			minWidth: 900,
			minHeight: 600,
			width: 900,
			height: 600,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
				preload: path.join(__dirname, "preload.js")
			}
		});
		addAccountWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'src/addAccount.html'),
			protocol: 'file:',
			slashes: true
		}));

		ipcMain.on('accountData_add', (event, args) => {
			addAccountWindow.hide();
			mainWindow.webContents.send('addAccount', args);
		});
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
