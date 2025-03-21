const { execSync } = require('node:child_process');

/**
 * A list of the scripts the server can run. Does not necessarily have to be
 * python.
 */
const scripts = {
	"test": "cat",
	"get weather": "conda run --no-capture-output -n noaa python3 NOAA_scripts/get_weather.py",
	"update conda": "conda update -n base -c defaults conda -y",
	"update conda env": "conda env update -f NOAA_scripts/environment.yml -n noaa --prune"
};

module.exports = {
	/**
	 * This command takes two arguments, scriptID and stdin. scriptID is the
	 * id of the script to be run. All commands given to the shell must come
	 * from the scripts table to make sure they are scrutinized. stdin is a
	 * string that is passed as standard input. No errors are handled by
	 * this function and will be passed on to calling code. Returns the
	 * standard output of the command called.
	 */
	runScript: function(scriptID, stdin) {
		if (stdin === undefined)
			return execSync(scripts[scriptID]);
		else
			return execSync(scripts[scriptID], { input: stdin });
	}
};
