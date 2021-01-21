const ChildProcess = require("child_process");


/**
 * @param {string} strExecutablePath 
 * @param {string[]} arrParams 
 * @param {object} objOptions 
 * @param {number} nTimeoutToSuccessSeconds 
 * @param {string} strStdIn 
 * 
 * @returns {ChildProcess}
 */
async function spawnPassthru(strExecutablePath, arrParams = [], objOptions = {}, nTimeoutToSuccessSeconds = 0, strStdIn = "", nSendStdInAfterSeconds = 5)
{
	if(process.stdout.isTTY)
	{
		console.log(`[spawnpassthru] ${strExecutablePath} ${arrParams.join(" ")}`);
	}
	
	const childProcess = ChildProcess.spawn(strExecutablePath, arrParams, Object.assign({stdio: "inherit"}, objOptions));
	//childProcess.stdout.pipe(process.stdout);
	//childProcess.stderr.pipe(process.stderr);
	return new Promise(async(fnResolve, fnReject) => {
		let nTimeoutID = null;
		if(nTimeoutToSuccessSeconds > 0)
		{
			nTimeoutID = setTimeout(() => { 
				try 
				{
					if(process.stdout.isTTY)
					{
						console.log(`[spawnpassthru] Success timeout reached, killing this: ${strExecutablePath} ${arrParams.join(" ")}`);
					}

					childProcess.kill("SIGINT"); 
				}
				catch(error) 
				{
					if(process.stdout.isTTY)
					{
						console.error(error);
					}
				}
				finally
				{
					fnResolve(childProcess); 
				}
			}, Math.max(Math.min(nTimeoutToSuccessSeconds, Math.pow(2, 32) - 1), 0) * 1000);
		}
		
		let nTimeoutIDStdInWrite = null;
		if(typeof strStdIn === "string" && strStdIn)
		{
			nTimeoutIDStdInWrite = setTimeout(
				() => {
					if(childProcess.connected && !childProcess.killed)
					{
						try
						{
							childProcess.stdin.write(strStdIn);
						}
						catch(error)
						{
							console.error(error);
							console.error(`[spawnpassthru] Failed writing to stdin for: ${strExecutablePath} ${arrParams.join(" ")}`);
						}
					}
				},
				nSendStdInAfterSeconds * 1000
			);
		}
		
		childProcess.on("error", fnReject);
		
		childProcess.on("close", (nCode) => {
			if(nCode === 0)
			{
				fnResolve(childProcess);
			}
			else
			{
				fnReject(new Error(`Exec process exited with error code ${nCode}`));
			}
			
			if(nTimeoutID !== null)
			{
				clearTimeout(nTimeoutID);
			}
			
			if(nTimeoutIDStdInWrite !== null)
			{
				clearTimeout(nTimeoutIDStdInWrite);
			}
		});
		
		childProcess.on("exit", (nCode) => {
			if(nCode === 0)
			{
				fnResolve();
			}
			else
			{
				fnReject(new Error(`Exec process exited with error code ${nCode}`));
			}
			
			if(nTimeoutID !== null)
			{
				clearTimeout(nTimeoutID);
			}
			
			if(nTimeoutIDStdInWrite !== null)
			{
				clearTimeout(nTimeoutIDStdInWrite);
			}
		});

		fnResolve(childProcess);
	});
}

module.exports = spawnPassthru;
