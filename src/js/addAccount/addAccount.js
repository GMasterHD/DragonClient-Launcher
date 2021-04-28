const fs = require('fs');
const auth = require('./js/auth.js');
const settings = require('./js/settings.js');

const {ipcRenderer} = require('electron');

const request = require('request');

function login() {
	document.getElementById('btn_add').innerHTML = 'Checking data...';
	document.getElementById('btn_add').disabled = true;
	document.getElementById('status').innerHTML = " ";
	document.getElementById('tbx_email').disabled = true;
	document.getElementById('tbx_password').disabled = true;

	const email = document.getElementById('tbx_email').value;
	const password = document.getElementById('tbx_password').value;

	console.log(`Logging in with ${email}:${password}`);

	auth.authentificate(email, password, (data) => {
		if(data.success) {
			console.log('Successfully logged in!');
			ipcRenderer.send('accountData_add', {
				username: data.name,
				email: email,
				password: password
			});
		} else {
			console.error('Could authentificate user!');
			console.error('Error: ' + result.message);
			document.getElementById('btn_add').innerHTML = 'Add Account';
			document.getElementById('btn_add').disabled = false;
			document.getElementById('status').innerHTML = `${result.message}`;
			document.getElementById('status').classList.add('error');
			document.getElementById('tbx_email').disabled = false;
			document.getElementById('tbx_password').disabled = false;
		}
	});
}
