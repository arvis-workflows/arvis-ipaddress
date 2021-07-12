'use strict';
const spawn = require('child_process').spawnSync;
const arvish = require('arvish');
const Promise = require('bluebird');

const externalIPCache = 'arvish-external-ip';
const fiveMinutes = 300000;
const ipconfig = spawn('ipconfig', ['getifaddr', 'en0']);

const trimNewlines = str => str.replace(/(\n|\r)+$/, '');

const localIp = trimNewlines(ipconfig.stdout.toString());

function loadExternalIp() {
	return new Promise(resolve => {
		let ip = arvish.cache.get(externalIPCache);
		if (ip) {
			resolve(ip);
		} else {
			arvish.fetch('http://icanhazip.com', {json: false}).then(data => {
				data = trimNewlines(data);
				arvish.cache.set(externalIPCache, data, {maxAge: fiveMinutes});
				resolve(data);
			});
		}
	});
}

loadExternalIp().then(data => {
	arvish.output([{
		arg: localIp,
		subtitle: 'Press Enter to copy to clipboard',
		title: `Local IP: ${localIp}`
	}, {
		arg: data,
		subtitle: 'Press Enter to copy to clipboard',
		title: `External IP: ${data}`
	}]);
});
