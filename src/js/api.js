module.exports.start = (callback) => {
	var start = new Date().getTime();

	if(fs.existsSync('./tmp/')) {
		console.log('Temp alredy exists! Checking the last downloads of the files...');
		// If files are old enough (at least 1 hour, renew them)
		fs.rmdirSync('./tmp/', {
			recursive: true
		});
		console.log('Successfully removed temp!');
	}

	console.log('Downloading new files from server...');
	fs.mkdirSync('./tmp/');

	// Download the new files from the api
	this.download('changelogs.json', (content) => {
		content.downloadedAt = start;
		fs.writeFileSync('./tmp/changelogs.json', JSON.stringify(content, 4, 4));

		this.download('startcodes.json', (content) => {
			content.downloadedAt = start;
			fs.writeFileSync('./tmp/startcodes.json', JSON.stringify(content, 4, 4));

			this.download('versions.json', (content) => {
				content.downloadedAt = start;
				fs.writeFileSync('./tmp/versions.json', JSON.stringify(content, 4, 4));

				var passed = new Date().getTime() - start;
				console.log(`Finished fetching files from api! (Took ${(passed)}ms)`);

				if(callback) {
					callback();
				}
			});
		});
	});
};

module.exports.download = (file, data) => {
	console.log('Downloading ' + file + '...');
	request({
		json: true,
		url: `https://raw.githubusercontent.com/GMasterHD/DragonClient-API/main/${file}`
	}, (err, res, body) => {
		if(err) {
			console.error(err);
		} else {
			body.downloadedAt = new Date().getTime();
			data(body);
		}
	})
};

module.exports.getStartCode = (version) => {
	return JSON.parse(fs.readFileSync('./tmp/startcodes.json'))[version];
};

module.exports.getVersions = (version) => {
	return JSON.parse(fs.readFileSync('./tmp/versions.json'))[version];
};

module.exports.getChangelogs = () => {
	return JSON.parse(fs.readFileSync('./tmp/changelogs.json')).changelogs;
};
