var tbx_javaDir;
var tbx_minecraftDir;
var nbx_res_w;
var nbx_res_h;

var selectedVersion;

module.exports.setSelectedVersion = (version) => {
	selectedVersion = version;
}
module.exports.getSelectedVersion = () => {
	return selectedVersion;
}

module.exports.getJavaDir = () => {
	return tbx_javaDir.value;
};
module.exports.getMinecraftDir = () => {
	return tbx_minecraftDir.value;
};

module.exports.save = () => {
	if(tbx_javaDir.value == "" || tbx_javaDir.value == undefined) {
		tbx_javaDir.value = directory.javaDir().replace("/", "\\");
	}
	if(tbx_minecraftDir.value == "" || tbx_minecraftDir.value == undefined) {
		tbx_minecraftDir.value = directory.getMinecraftDir().replace("/", "\\");
	}

	var width = Number(num_width.value);
	var height = Number(num_height.value);
	if(width == 0 || width == undefined) {
		nbx_res_w.value = 1220;
	}
	if(height == 0 || height == undefined) {
		nbx_res_h.value = 720;
	}

	console.info("Saving settings...");

	// Set default values
	if(!fs.existsSync(tbx_javaDir.value)) {
		console.info(os.tmpdir);
		console.info(os.type);
		console.info(os.platform);
		console.info(os.arch);
		console.info(os.release);
		console.info(os.hostname);
		console.info(os.homedir);
		console.info(os.userInfo);
		directory.javaDir();
	}

	var settings = {
		javaDir: tbx_javaDir.value,
		minecraftDir: document.getElementById("tbx_minecraftDir").value,
		betaBranch: document.getElementById("tbx_betaBranch").value,
		whenMinecraftStart: 0,
		ram: document.getElementById("rng_ram").value,
		version: selectedVersion,
		resolution: {
			width: Number(document.getElementById("num_width").value),
			height: Number(document.getElementById("num_height").value)
		}
	};

	fs.writeFileSync("./settings.json", JSON.stringify(settings, 4, 4), {encoding: 'utf-8'});
}
module.exports.load = () => {
	tbx_javaDir = document.getElementById("tbx_javaDir");
	tbx_minecraftDir = document.getElementById("tbx_minecraftDir");
	nbx_res_w = document.getElementById("nbx_width");
	nbx_res_h = document.getElementById("nbx_height");

	console.info("Loading settings...");

	if(fs.existsSync("./settings.json")) {
		var settings = JSON.parse(fs.readFileSync('./settings.json'));
		console.log(JSON.stringify(settings));

		if(settings.version != undefined) {
			selectedVersion = settings.version;
		} else {
			selectedVersion = "1.8.9";
		}
		if(settings.ram != undefined && (settings.ram < os.totalmem / 1024 / 1024)) {
			document.getElementById("rng_ram").value = settings.ram;
			allocatedRamSliderChanged(settings.ram);
		} else {
			document.getElementById("rng_ram").value = (0.25 * os.totalmem);
			settings.ram = 0.25 * os.totalmem;
			allocatedRamSliderChanged(settings.ram);
		}
		if(settings.resolution == undefined) {
			settings.resolution = {
				width: 1220,
				height: 1080
			};
		} else {
			if(settings.resolution.width == undefined) {
				settings.resolution.width = 1220;
			}
			if(settings.resolution.height == undefined) {
				settings.resolution.height = 720;
			}
		}
		if(settings.optifine == undefined) {
			settings.optifine = true;
		}

		document.getElementById("num_width").value = settings.resolution.width;
		document.getElementById("num_height").value = settings.resolution.height;
		document.getElementById("tbx_betaBranch").checked = settings.tbx_betaBranch;
		document.getElementById(`vImg_${this.getSelectedVersion()}`).classList.add('colored');

		this.save();
	} else {
		this.save();
	}
}
