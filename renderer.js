// renderer process
var ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('progress-bars', function (event,message) {
	document.getElementById('progress-bars').innerHTML = addBars(message);
});

ipcRenderer.on('settings', function (event,message) {
	document.getElementById('settings-list').innerHTML = addSettings(message);
});

function addSettings(settings) {
	let settings_html = "";

	for(let i = 0; i < settings.length; i++) {
		let setting = settings[i];
		let template = `
			<li class="list-group-item d-flex justify-content-between align-items-start">
				<div class="ms-2 me-auto">
					<div class="fw-bold">${setting.name}</div>
					<i class="fa fa-bar-chart" aria-hidden="true"></i> ${setting.hex}
					<p class="fs-6">
						<i class="fa fa-tags" aria-hidden="true"></i> ${setting.tags[0]}
					</p>
				</div>
				<span class="badge bg-primary rounded-pill">14</span>
			</li>
		`;
		settings_html += template;
	}

	return settings_html;
}

function addBars(bars) {
	let bar_html = "";

	console.log(bars);

	for(let i = 0; i < bars.length; i++) {
		let bar = bars[i];
		let template = `
		<li class="list-group-item">
			<div class="fw-bold"></div>
			<div class="ms-2 me-auto">
				<div class="fw-bold">${progressIdParse(bar.deviceid)}</div>
				<div class="col-12 text-truncate" data-bs-toggle="tooltip" data-bs-placement="top" title="${bar.name}">${bar.name}</div>
			</div>
			<div class="progress">
				<div class="progress-bar bg-success" role="progressbar" style="width: ${bar.percent}%; background-color:#${bar.color} !important;" aria-valuenow="${bar.percent}" aria-valuemin="0" aria-valuemax="100"></div>
			</div>
		</li>
		`;
		bar_html += template;
	}

	return bar_html;
}

function progressIdParse(did) {
	if(did == "octoprint") {
		return '<i class="fa fa-print"></i> Octoprint Job';
	} else if (did.startsWith('dbid')) {
		return '<i class="fa fa-cloud-download"></i> DC Torrent';
	} else if (did.startsWith('gtimer')) {
		return '<i class="fa fa-stopwatch-20"></i> Google Timer';
	}

}