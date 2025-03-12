const { execSync } = require('node:child_process');

/**
 * A list of the scripts the server can run. Does not necessarily have to be
 * python. All scripts should return JSON.
 */
const scripts = {
	"test": "python3 scripts/testPython.py"
}

module.exports = {
	/**
	 * Takes a string as argument that is used to lookup a command in the scripts
	 * object. This is done to prevent arbitrary shell shenanigans. This way
	 * execSync is only ever called on one of the enumerated commands in scripts.
	 * The function returns a javascript object that is the output of the python
	 * script parsed as JSON. To find the details of the object returned by a given
	 * script, consult the python script you are calling. Function may throw errors
	 * if there is a problem with running the script.
	 */
	runScript: function(scriptID) {
		return JSON.parse(execSync(scripts[scriptID]));
	}
};
