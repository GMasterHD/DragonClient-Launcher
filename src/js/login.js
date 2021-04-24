const fs = require('fs');
const auth = require('./js/auth.js');
const settings = require('./js/settings.js');

const {ipcRenderer} = require('electron');

const request = require('request');

document.addEventListener('DOMContentLoaded', function() {
	if(fs.existsSync('./profile.txt')) {
		auth.loadAcData((data) => {
			login(data.email, data.password);
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

	console.log(`Logging in with ${v_email}:${v_password}`);

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
			} else {
				setTimeout(() => {
					document.getElementById('status').innerHTML = 'Successfully logged in!';
					if(document.getElementById('saveData').checked) {
						auth.saveAcData(result.name, v_email, v_password);
					}
					const accountData = {
						name: result.name,
						email: v_email,
						password: v_password
					};
					ipcRenderer.send('openMainWindow', accountData);
				}, 1000);
			}
		});
	}, 2000);
}
