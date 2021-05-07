const fs = require('fs');
const auth = require('./js/auth.js');
const settings = require('./js/settings.js');

const {ipcRenderer} = require('electron');

const request = require('request');

document.addEventListener('DOMContentLoaded', () => {
	if(fs.existsSync('./profiles.json')) {
		document.getElementById('btn_login').innerHTML = 'Logging in...';
		document.getElementById('btn_login').disabled = true;
		document.getElementById('tbx_email').disabled = true;
		document.getElementById('tbx_password').disabled = true;
		var validAcs = {
			acs: [],
			selected: 0
		};
		auth.loadAcData((accounts) => {
			var itemsProcessed = 0;
			accounts.acs.forEach(async (account, index, array) => {		
				await new Promise((resolve) => {
					setTimeout(resolve, 100);
				});
				validAcs.selected = accounts.selected;
				await auth.authentificate(account.email, account.password, (result) => {
					if(result.success) {					
						validAcs.acs.push({
							username: result.name,
							email: account.email, 
							password: account.password
						});
					}
				});
				++itemsProcessed;
				if(itemsProcessed == array.length) {
					auth.saveAcData(validAcs, validAcs.selected);
					ipcRenderer.send('openMainWindow', validAcs);
				}
			});
		});
	}
}, false);

function login(email, password) {
	var v_email = document.getElementById('tbx_email').value;
	var v_password = document.getElementById('tbx_password').value;

	if(email) {
		v_email = email;
	}
	if(password) {
		v_password = password;
	}
	document.getElementById('btn_login').disabled = true;
	document.getElementById('status').classList.remove('error');
	document.getElementById('btn_login').innerHTML = 'Logging in...';
	document.getElementById('status').innerHTML = 'Logging in...';
	setTimeout(() => {
		auth.authentificate(v_email, v_password, (result) => {
			if(!result.success) {
				console.error('Could authentificate user!');
				console.error('Error: ' + result.message);
				document.getElementById('btn_login').innerHTML = 'Log In';
				document.getElementById('btn_login').disabled = false;
				document.getElementById('status').innerHTML = `${result.message}`;
				document.getElementById('status').classList.add('error');
				document.getElementById('tbx_email').disabled = false;
				document.getElementById('tbx_password').disabled = false;
			} else {
				setTimeout(() => {
					document.getElementById('status').innerHTML = 'Successfully logged in!';
					const validAcs = {
						acs: [
							{
								username: result.name,
								email: v_email,
								password: v_password
							}
						],
						selected: result.name
					}
					/*if(document.getElementById('saveData').checked) {
						auth.saveAcData(validAcs, validAcs.selected);
					}*/
					ipcRenderer.send('openMainWindow', {
						username: result.name,
						email: v_email,
						password: v_password
					});
				}, 1000);
			}
		});
	}, 2000);
}
