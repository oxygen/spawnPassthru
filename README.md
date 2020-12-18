# spawnPassthru
nodejs ChildProcess.spawn with stdio:inherit.

Usage
=====

Same as the standard NodeJS options for [ChildProcess.spawn()](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options).

All params are optional except for the exe path.

```JavaScript

const childProcess = await spawnPassthru(
	/*exe path*/ "/path/to/exe/chrome", 
	
	/*params*/ [
		"--headless", 
		"--disable-gpu", 
		"--remote-debugging-port=9222", 
		// "--ignore-certificate-errors", 
		// "--ignore-urlfetcher-cert-requests", 
		"--allow-insecure-localhost", 
		"--enable-logging", 
		"--v=1", 
		"https://127.0.0.1:8111/index.html"
	],

	/*ChildProcess options*/ {}, 

	/*seconds until SIGINT terminate process; 0 to disable.*/ 0, 

	/*string to send to stdin*/ "",
	/*seconds to wait before sending string to stdin*/ 5
);

// console.log(childProcess.pid);
// childProcess.kill("SIGINT");
```
