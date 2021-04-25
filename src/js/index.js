const settings = require('./js/settings.js');
const directory = require('./js/directory.js');
const api = require('./js/api.js');
const installer = require('./js/installer.js');

const url = require('url');
const electron = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');
const request = require('request');
const querystring = require('querystring');
var {exec, execSync} = require('child_process');

const fs = require('fs');
const os = require('os');
const auth = require('./js/auth.js');
const { ipcRenderer, shell } = require('electron');

var selectedMenu = 'home';

const btn_home = document.getElementById('btn_tab_home');
const btn_settings = document.getElementById('btn_tab_settings');
const btn_about = document.getElementById('btn_tab_about');

const tab_home = document.getElementById('tab_home');
const tab_settings = document.getElementById('tab_settings');
const tab_about = document.getElementById('tab_about');

const div_homeMain = document.getElementById('mainBlur');

const div_versionContainer = document.getElementById('div_versionContainer');

const btn_play = document.getElementById('btn_play');

const slider_allocatedRam = document.getElementById('rng_ram');

const num_allocatedGB = document.getElementById('num_allocatedRAM');
const lbl_allocatedRAM = document.getElementById('lbl_allocatedRAM');

const num_width = document.getElementById('num_width');
const num_height = document.getElementById('num_height');

const tbx_minecraftDir = document.getElementById('tbx_minecraftDir');
const tbx_javaDir = document.getElementById('tbx_javaDir');

var installedRAM_mb;

var accountData = {acs: [], selected: 0};

document.addEventListener('DOMContentLoaded', () => {
	api.start(() => {
		loadChangelogs();
	});

	installedRAM_mb = os.totalmem / 1024 / 1024;
	slider_allocatedRam.max = installedRAM_mb;
	settings.load();
	btn_play.innerHTML = 'Play ' + settings.getSelectedVersion();

	if(fs.existsSync('./chache/')) {
		fs.rmdirSync('./cache/', {recursive: true});
	}

	ipcRenderer.on('accountData', (event, args) => {
		this.accountData = args.data;

		// Load acs into ac list
		console.log('Loading account datas into list...');
		var accountID = 0;
		this.accountData.acs.forEach((account, index, array) => {
			document.getElementById('popup_versionSelector').innerHTML += (`<div class="accountItem" id="account_${account.username.toLowerCase()}" onclick="onAccountSelectorPressed(${accountID})"><img src="https://mc-heads.net/avatar/${account.username.toLowerCase()}/" alt="Avatar" id="playerIcon" class="avatar"><h1 id="account_name_${account.username.toLowerCase()}">${account.username}</h1></div>`);
			++accountID;
		});

		console.log(`Selected AC: ${accountData.acs[accountData.selected].username}`);
		document.getElementById('btn_account_div').innerHTML = `<img src="https://mc-heads.net/avatar/${this.accountData.acs[this.accountData.selected].username.toLowerCase()}/" alt="Avatar" id="playerIcon" class="avatar"><div id="btn_account" class="accountButton">${this.accountData.acs[this.accountData.selected].username}</div>`;
	});
}, false);

function onMenuButtonPress(id) {
	btn_home.style.backgroundColor = '#121212';
	btn_settings.style.backgroundColor = '#121212';
	btn_about.style.backgroundColor = '#121212';

	tab_home.style.display = 'none';
	tab_settings.style.display = 'none';
	tab_about.style.display = 'none';

	// If the user changed from the settings tab to a other tab, save
	if(selectedMenu === 'settings' && id != 1) {
		settings.save();
	}

	if (id == 0) {
		showHomeTab();
	} else if (id == 1) {
		showSettingsTab();
	} else if (id == 2) {
		showAboutTab();
	}
}

function showHomeTab() {
	selectedMenu = 'home';
	btn_home.style.backgroundColor = '#8C00FF';
	tab_home.style.display = 'flex'
}
function showSettingsTab() {
	selectedMenu = 'settings';
	btn_settings.style.backgroundColor = '#8C00FF';
	tab_settings.style.display = 'flex'
}
function showAboutTab() {
	selectedMenu = 'about';
	btn_about.style.backgroundColor = '#8C00FF';
	tab_about.style.display = 'flex'
}

function parseChangelogJsons() {
}

function onButtonPress(id) {
}

function onPlayButtonPress() {
	console.log('Starting Minecraft...')
	console.log('JAR Dir: ' + settings.getJavaDir());
	console.log('Minecraft Dir: ' + settings.getMinecraftDir());
	document.getElementById("btn_play").disabled = true;

	auth.authentificate(accountData.acs[accountData.selected].email, accountData.acs[accountData.selected].password, (body) => {
		if(!body.success) {
			console.error('Could authentificate user!');
			console.error('Error: ' + body.message);
			alert(body.message);
			return;
		}

		installer.install(settings.getSelectedVersion(), () => {
			var startCode = api.getStartCode(settings.getSelectedVersion());
			while(startCode.includes('${username}')) {
				startCode = startCode.replace('${username}', body.name);
			}
			while(startCode.includes('${gameDir}')) {
				startCode = startCode.replace('${gameDir}', settings.getMinecraftDir());
			}
			while(startCode.includes('${accessToken}')) {
				startCode = startCode.replace('${accessToken}', body.session.accessToken);
			}
			while(startCode.includes('${uuid}')) {
				startCode = startCode.replace('${uuid}', body.uuid);
			}
			while(startCode.includes('${clientJar}')) {
				startCode = startCode.replace('${clientJar}', `DragonClient_${settings.getSelectedVersion()}/DragonClient.jar`);
			}
			while(startCode.includes('${max_ram}')) {
				startCode = startCode.replace('${max_ram}', slider_allocatedRam.value + 'M')
			}
			while(startCode.includes('${width}')) {
				startCode = startCode.replace('${width}', num_width.value);
			}
			while(startCode.includes('${height}')) {
				startCode = startCode.replace('${height}', num_height.value);
			}

			while(startCode.includes('/')) {
				startCode = startCode.replace('/', '\\');
			}
			
			const button = document.getElementById("btn_play");

			button.style["font-size"] = "44pt";
			button.innerHTML = "Starting...";
			
			setTimeout(() => {
				var minecraft = exec(`java ${startCode}`, (error, stdout, stderr) => {
					if(error) {
						console.error(error);
					}
				});
			}, 2000);
			setTimeout(() => {
				document.getElementById('btn_play').disabled = false;
				button.style["font-size"] = "50pt";
				button.innerHTML = `Play ${settings.getSelectedVersion()}`;
			}, 6000);

			minecraft.stdout.on('data', function(data) {
				console.log(data.toString()); 
				//ipcRenderer.send('debugLog', data.toString());
			});
		});
	});
} 

function onButtonVersionPress(version, image) {
	div_homeMain.classList.remove('blur-on');
	div_versionContainer.style.display = 'none';
	btn_play.innerHTML = 'Play ' + version;
	settings.setSelectedVersion(version);
	settings.save();
	
	var elements = document.getElementsByClassName('versionsImage');
	for(var x = 0; x < elements.length; ++x) {
		elements[x].classList.remove('colored');
	}
	
	image.classList.add('colored');
}

function onVersionChangeButtonPress() {
	onSettingChanged();

	div_homeMain.classList.add('blur-on');
	div_versionContainer.style.display = 'flex';
}

function allocatedRamSliderChanged(value, changeSlider) {
	console.log('Value: ' + value);

	num_allocatedGB.value = value;
	lbl_allocatedRAM.innerHTML = `MiB (~${(value * (1000 / 1024)).toFixed(0)} MB / ${((value * (1000 / 1024) / 1000)).toFixed(1)} GB)`

	if(changeSlider) {
		slider_allocatedRam.value = value;
	}

	onSettingChanged();
}

var useOptifine = true;
function onUseOptifinePress(value) {
	console.log('Value: ' + value);

	onSettingChanged();
}

function onSettingChanged() {
	settings.save();
}

var lastBrowse;
function browse(id) {
	lastBrowse = id;
	if(id == 'mc') {
		ipcRenderer.send('openDirectory', {defaultDir: tbx_minecraftDir.value});

		ipcRenderer.on('directory', (event, arg) => {
			console.log('MC: ' + arg);
			tbx_minecraftDir.value = arg;
		});
		ipcRenderer.on('error', (event, arg) => {
			console.error('Error: ' + arg);
			if(arg == 'no_directory_selected') {
				alert('An error occured!\nPlease select a directory!');
			}
		});
	} else if(id == 'java') {
		ipcRenderer.send('openDirectory', {defaultDir: tbx_javaDir.value});

		ipcRenderer.on('directory', (event, arg) => {
			console.log('Java: ' + arg);
			tbx_javaDir.value = arg;
		});
		ipcRenderer.on('error', (event, arg) => {
			console.error('Error: ' + arg);
			if(arg == 'no_directory_selected') {
				alert('An error occured!\nPlease select a directory!');
			}
		});
	}
}

function loadChangelogs() {
	const changelogsMain = document.getElementById('changelogsMain');

	api.getChangelogs().forEach(changelog => {
		const title = changelog.title;
		var changes = "";
		const page = changelog.page;

		const changeLogHTML_pre = `<li><div class="changelogDiv" onclick='shell.openExternal("${page}")'><h2>${title}</h2><ul class="changelogsList">`;
		const changeLogHTML_post = `</ul></div></li>`;

		changelog.changelogs.forEach(change => {
			changes += `<li>${change}</li>`
		});

		changelogsMain.innerHTML += `${changeLogHTML_pre}${changes}${changeLogHTML_post}`
	});
}

function onAccountButtonPressed() {
	const accountSelector = document.getElementById('accountSelector')
	if(accountSelector.style.display == 'none') {
		accountSelector.style.display = 'flex';
	} else {
		accountSelector.style.display = 'none';
	}
}

var smallerThan1470 = false;
$(window).resize(() => {
	if ($(window).width() < 1470) {
		if(!smallerThan1470) {
			smallerThan1470 = true;

			document.getElementById('btn_account').style.display = 'none';
		}
	} else {
		if(smallerThan1470) {
			smallerThan1470 = false;

			document.getElementById('btn_account').style.display = 'flex';
		}
	}
});

function onAccountSelectorPressed(id) {
	onAccountButtonPressed();
	console.log(`Account of ${this.accountData.acs[id].username} has been pressed!`);
	document.getElementById('btn_account_div').innerHTML = `<img src="https://mc-heads.net/avatar/${accountData.acs[id].username.toLowerCase()}/" alt="Avatar" id="playerIcon" class="avatar"><div id="btn_account" class="accountButton">${accountData.acs[id].username}</div>`;

	accountData.selected = id;

	// Update selected ac
	const acData = JSON.parse(fs.readFileSync('./profiles.json'));
	acData.selected = id;
	fs.writeFileSync('./profiles.json', JSON.stringify(acData, 4, 4));
}
