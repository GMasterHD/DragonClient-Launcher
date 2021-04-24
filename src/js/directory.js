module.exports.javaDir = () => {
	/*var java = this.getJava(os.arch, false);
	console.log("Java: " + java);*/
	return "C:/Program Files/Java/jre1.8.0_281/";
}

module.exports.getProgramFilesDir = (arch) => {
	var path = process.env.HOME;
	while(path.includes("\\")) {
		path = path.replace("\\", "/");
	}

	var arrPath = path.split("/");

	arrPath.pop();
	arrPath.pop();

	if(arch == "x64") {
		arrPath.push("Program Files");
	} else {
		arrPath.push("Program Files (x86)");
	}

	return arrPath.join("/");
}

module.exports.getJava = (arch, second) => {
	if(second == undefined) {
		second = false;
	}

	if(arch == "x64") {
		var instalations = this.getJavaInstalations(this.getProgramFilesDir(arch) + "/Java/");
		if(instalations.length == 0) {
			this.getJava("x86", true);
			return;
		} else {
			return instalations;
		}
	}

	var instalations = this.getJavaInstalations(this.getProgramFilesDir("x86") + "/Java/");
	if(instalations.length == 0) {
		console.error("Java was not found on this system! Searched dirs:");
		console.error(this.getProgramFilesDir("x86") + "/Java/");

		if(second) {
			console.error(this.getProgramFilesDir("x64") + "/Java/");
		}
	}

	return instalations;
};

module.exports.getJavaInstalations = (dir) => {
	console.log("Getting Java instalations in " + dir + "...")

	var javaInstalations = [];

	var javaDirs = fs.readdirSync(dir);
	javaDirs.forEach(i => {
		if(i.startsWith("jdk-1") || i.startsWith("jdk1") || i.startsWith("jre-1") || i.startsWith("jre1")) {
			if(fs.existsSync(dir + "/" + i + "/bin/java.exe")) {
				javaInstalations.push(i);
			}
		}
	});

	console.log(`Found ${javaInstalations.length} Java instalations!`);
	console.log(javaInstalations);

	return javaInstalations;
}

module.exports.getMinecraftDir = () => {
	return process.env.home.replace("\\", "/") + "/AppData/Roaming/.minecraft/"
};
