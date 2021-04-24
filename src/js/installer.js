const progressBar = document.getElementById('progress_start');

module.exports.install = (version, callback) => {
	this.checkIfPatched(version, patched => {
		console.log('Patched: ' + patched);
		if(patched) {
			console.log('Client alredy up-to-date!');
			document.getElementById('btn_play').innerHTML = 'Running...';
			callback();
		} else {
			if(fs.existsSync('./cache/')) {
				fs.rmdirSync('./cache/', {
					recursive: true
				});
			}
			
			fs.mkdirSync('./cache/');
		
			this.setProgressBarVisible(true);
			this.setProgress(0);
			this.downloadVanillaJar(version, () => {
				this.downloadPatchFile(version, () => {
					this.patch(version, () => {
						this.setProgress(100);
						console.log('Finished patching!');
						this.setProgressBarVisible(false);
						callback();
					});
				});
			});
		}
	})
};

module.exports.checkIfPatched = (version, callback) => {
	const folderExists = fs.existsSync(`${settings.getMinecraftDir()}versions/DragonClient_${version}/`);
	if(!folderExists) {
		callback(false);
		return;
	}
	const clientJarExistst = fs.existsSync(`${settings.getMinecraftDir()}versions/DragonClient_${version}/DragonClient.jar`);
	if(!clientJarExistst) {
		callback(false);
		return;
	}
	const versionDataExists = fs.existsSync(`${settings.getMinecraftDir()}versions/DragonClient_${version}/data.json`);
	if(!versionDataExists) {
		callback(false);
		return;
	}

	// If the client's version is older than the newest from the api, download the latest version
	const { downloadedAt } = JSON.parse(fs.readFileSync(`${settings.getMinecraftDir()}versions/DragonClient_${version}/data.json`));
	const updateFrom = api.getVersions(version).lastUpdate;
	console.log('DownloadedAt: ' + downloadedAt)
	console.log('Update from: ' + updateFrom);
	if(Number(downloadedAt) < Number(updateFrom)) {
		console.log('Client is not up-to-date!');
		callback(false);
		return;
	} else {
		callback(true);
		return;
	}
	// Client is up-to-date and installed
};

module.exports.downloadVanillaJar = (version, callback) => {
	document.getElementById('btn_play').style['font-size'] = '30pt';
	document.getElementById('btn_play').innerHTML = 'Downloading Version...';
	console.log('Downloading vanilla jar...');
	console.log('Vanilla Jar Loc: ' + api.getVersions(version).vanilla);
	this.download(api.getVersions(version).vanilla, (body) => {
		fs.writeFileSync(`./cache/vanilla_${version}.jar`, body, {encoding: 'binary'});
		callback();
	}, 'binary');
};

module.exports.download = (url, callback, encoding) => {
	var request = https.get(url, (response) => {
		if (encoding){
			response.setEncoding(encoding);
		}
		var len = parseInt(response.headers['content-length'], 10);
		var body = '';
		var cur = 0;
		var total = len / 1048576; //1048576 - bytes in  1Megabyte

		response.on('data', function(chunk) {
			body += chunk;
			cur += chunk.length;
			//console.log('Downloading ' + (100.0 * cur / len).toFixed(2) + '% ' + (cur / 1048576).toFixed(2) + ' mb\r' + '.<br/> Total size: ' + total.toFixed(2) + ' mb');

			installer.setProgress((100.0 * cur / len).toFixed(2), `${(cur/1048576).toFixed(2)}MB / ${total.toFixed(2)}MB`);
		});

		response.on('end', function() {
			callback(body);
			console.log('Downloading complete');
		});

		request.on('error', function(e){
			console.log('Error: ' + e.message);
		});
	});
};

module.exports.patch = (version, callback) => {
	document.getElementById('btn_play').innerHTML = 'Patching...';
	console.log('Patching...');
	if(!fs.existsSync(`${settings.getMinecraftDir()}versions/DragonClient_${version}/`)) {
		fs.mkdirSync(`${settings.getMinecraftDir()}versions/DragonClient_${version}/`);
	}
	var patcher = execSync(`bspatch.exe ./cache/vanilla_${version}.jar ${settings.getMinecraftDir()}versions/DragonClient_${version}/DragonClient.jar ./cache/patch_${version}.patch`, (error, stdout, stderr) => {
		if (error) {
			console.error(error);
		}
		console.log(stdout);
		console.error(stderr);
	});
	fs.writeFileSync(`${settings.getMinecraftDir()}versions/DragonClient_${version}/data.json`, JSON.stringify({downloadedAt: new Date().getTime()}, 4, 4));
	callback();
};

module.exports.downloadPatchFile = (version, callback) => {
	document.getElementById('btn_play').innerHTML = 'Downloading Patch...';
	console.log('Downloading patch file...');
	console.log('Patch Loc: ' + api.getVersions(version).patch);
	this.download(api.getVersions(version).patch, (body) => {
		fs.writeFileSync(`./cache/patch_${version}.patch`, body, {encoding: 'binary'});
		callback();
	}, 'binary');
};

module.exports.setProgress = (progress, text) => {
	if(progress >= 100) {
		progress = 100;
	}

	document.getElementById('progress_start').style.width = progress + '%';

	if(text) {
		document.getElementById('progress_start').innerHTML = '<p>' + progress + '% ' + text + '</p>';
	} else {
		document.getElementById('progress_start').innerHTML = '<p>' + progress + '%</p>';
	}
};

module.exports.setProgressBarVisible = (visible) => {
	document.getElementById('progress_download').hidden = !visible;
};
