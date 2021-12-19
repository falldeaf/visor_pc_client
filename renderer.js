console.log("Can you see this?");

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
					<div class="fw-bold"><b>${setting.name}</b> : ${setting.hex}</div>
					${setting.tags[0]}
				</div>
				<span class="badge bg-primary rounded-pill">14</span>
			</li>
		`;
		settings_html += template;
	}

	console.log(settings_html);
	return settings_html;
}

function addBars(bars) {
	let bar_html = "";

	for(let i = 0; i < bars.length; i++) {
		let bar = bars[i];
		let template = `
		<li class="list-group-item">
			<div class="fw-bold">${bar.name}</div>
			<div class="progress">
				<div class="progress-bar bg-success" role="progressbar" style="width: ${bar.progress}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
			</div>
		</li>
		`;
		bar_html += template;
	}

	return bar_html;
}