const serverURL = 'https://authserver.mojang.com/authenticate';

const mojang = require('mojang');

module.exports.authentificate = async (name, password, callback) => {
	var clientToken = "11f27bc18ebc40638a65b94f8cc9d813";
	const agent = {name: 'Minecraft', version: 1};

	try {
		var session = await mojang.authenticate({
			username: String(name), 
			password: String(password),
			agent: agent,
			clientToken: clientToken
		});
	} catch(e) {
		console.error("Invalid username or password");
		callback({
			session: undefined,
			name: undefined,
			uuid: undefined,
			message: "Invalid username or password!",
			success: false
		});
		return;
	}

	if(session == undefined) {
		console.error("Could not create session!");
		callback({
			session: undefined,
			name: undefined,
			uuid: undefined,
			message: "Could not create session! Try again",
			success: false
		});
		return;
	}

	if (await !mojang.isValid(session)) {
		console.error("Access token is invalid!");
		callback({
			session: undefined,
			name: undefined,
			uuid: undefined,
			message: 'Your access token is invalid! Invalid username or password!',
			success: false
		});
		return;
	}

	var name = session.selectedProfile.name;
	var uuid = session.selectedProfile.id;

	request({
		url: `https://api.mojang.com/user/profile/${session.user.id}`,
		json: true
	},
	(err, response, body) => {
		if(err) {
			console.error(err);

			callback({
				session: undefined,
				name: undefined,
				uuid: undefined,
				message: err,
				success: false
			});
			return;
		}
	});
	
	console.log("Login successfull!");
	callback({
		session: session,
		name: name,
		uuid: uuid,
		message: 'Login successfull!',
		success: true
	});
};

module.exports.saveAcData = (accounts, selected) => {
	const b64Accounts = [];

	accounts.acs.forEach((account) => {
		const str = `${account.username}|${account.email}|${account.password}`;
		const b64 = btoa(str);
		b64Accounts.push(b64);
	});
	
	var data = {};

	if(selected) {
		data = {
			acs: b64Accounts,
			selected: selected
		};
	} else {
		data = {
			acs: b64Accounts,
			selected: 0
		};
	}

	console.log(`Accounts: ${JSON.stringify(data, 4, 4)}`);
	fs.writeFileSync('./profiles.json', JSON.stringify(data, 4, 4), {encoding: 'utf-8'});
};
module.exports.loadAcData = (callback) => {
	const json = JSON.parse(fs.readFileSync('./profiles.json', {encoding: 'utf-8'}));

	const result = {};
	const acs = [];

	for(var x = 0; x < json.acs.length; ++x) {
		console.log(`String: ${json.acs[x]}`);
		const b64 = json.acs[x];
		const str = atob(b64);

		console.log(`(Nb64): ${str}`);

		const split = str.split('|');

		acs.push({
			username: split[0],
			email: split[1],
			password: split[2]
		});
	}

	result.acs = acs;
	result.selected = json.selected;

	console.log(`Result: ${JSON.stringify(result, 4, 4)}`);

	callback(result);
};
