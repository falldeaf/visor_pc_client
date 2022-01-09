require('dotenv').config();
const fetch = require('cross-fetch');
const path = require("path");
const fs = require("fs");
const png = require("pngjs").PNG;
const { app, Menu, Tray, BrowserWindow, Notification, clipboard, ipcMain, webContents } = require('electron')
const nativeImage = require('electron').nativeImage
const execute = require('child_process').exec;
const yaru = require('./yaru_colors');

const platform = process.platform;
const deviceid = process.env.DEVICEID;
const apikey = process.env.APIKEY;
let updating = true;
let current_color = "FF0000";
let is_progress_bars = false;
let push_id_array = [];
let progress_bars;
let tray;
let popwin;

app.mainWindow = popwin;

const icon_path = "icon.png";

//Call Visor API
setInterval(async ()=>{
	if(!updating) return;

	try{
		const response1 = await fetch(`https://falldeaf.xyz/getsettings/${apikey}`);
		const settings_data = await response1.json();
		if(popwin) popwin.webContents.send('settings', settings_data);

		const color_data = settings_data.find((setting) => setting.name == "primary_color");
		if(current_color != color_data.value) {
			new_color = color_data.value
			console.log("New color has been set: " + new_color);
			current_color = new_color;
			if(platform === "win32") setWindowsAccentColor(new_color);
			if(platform === "linux") setLinuxAccentColor(new_color);
			//setQKeyboardColor(new_color);
		}
	}
	catch (e) {
		console.log(e)
	}

	try{
		const response2 = await fetch(`https://falldeaf.xyz/getpushes/${apikey}/latest`);
		const pushes = await response2.json();
		for (const push of pushes) {
			if(!push_id_array.includes(push._id)) {
				switch(push.type) {
					case "message":
						//sendNotif(push.title, push.message);
						new Notification({ title: push.title, body: push.message }).show()
						break;
					case "command":
						runCommand(push);
						break;
				}
				console.log("New push! : " + push.message);
				
				push_id_array.push(push._id);
				if(push_id_array.length > 50) push_id_array.pop();
			}
		}
	}
	catch (e) {
		console.log(e)
	}

	try {
		const response3 = await fetch(`https://falldeaf.xyz/getprogress/${apikey}`);
		const progress_data = await response3.json();
		progress_bars = progress_data;
		if(popwin) popwin.webContents.send('progress-bars', progress_bars);
		if(progress_data.length > 0) {
			if(!is_progress_bars) is_progress_bars = true;
			setProgressIcon(progress_data);
		} else {
			if(is_progress_bars) {
				is_progress_bars = false;
				tray.setImage(icon_path);
			}
		}
	}
	catch (e) {
		console.log(e)
	}

}, 3000);

function runCommand(push) {
	if(push.deviceid == deviceid || push.deviceid == "all"){
		switch(push.title) {
			case "url":
				shell.openExternal(decodeURI(push.url));
				break;
			case "text":
				clipboard.writeText(push.message);
				break;
			case "app":
				//open.openApp(push.message);
				break;
		}
	}
}

const popupWindow = () => {

	if(!popwin) {
		const { screen } = require('electron')
		const primaryDisplay = screen.getPrimaryDisplay()
		const { width, height } = primaryDisplay.workAreaSize
		let swidth = width
		let sheight = height
		let wwidth = 400
		let wheight = 700

		popwin = new BrowserWindow({
			webPreferences: {
				preload: path.join(__dirname, "renderer.js")
			},
			width: wwidth,
			height: wheight,
			x: swidth-wwidth,
			y: sheight-wheight,
			frame: false
		})
		popwin.loadFile('popup.html')
		popwin.setAlwaysOnTop(true, "screen-saver")
		//win.setIgnoreMouseEvents(true)

		popwin.on('blur', () => {
			popwin.hide();
		});
	} else {
		popwin.show();
	}
}

app.whenReady().then(() => {
	//createWindow()

	tray = new Tray(icon_path)
	const contextMenu = createMenu();
	tray.setToolTip('Visor status application')
	tray.setContextMenu(contextMenu)
	tray.on('right-click', popupWindow);
})

function createMenu() {
	return Menu.buildFromTemplate([
		{
			label: (updating)? 'Stop updating' : 'Start updating',
			click: function () {
				updating = !updating;
				tray.setContextMenu(createMenu());
				//console.log("Clicked on settings");
				//setProgressIcon([{progress: 50, hex:"00ff00"},{progress: 80, hex:"ff0000"},{progress: 100, hex:"0000ff"},{progress: 20, hex:"0f00ff"},{progress: 10, hex:"0f0fff"},{progress: 20, hex:"0f00ff"},{progress: 100, hex:"ff0dfc"}]);
			}
		},
		{
			label: 'Popup',
			click: popupWindow
		},
		{
			label: 'Exit',
			click: exit
		 }
	]);
}

function exit() {
	tray.destroy();
	app.quit();
}

function setProgressIcon(bars) {
	fs.createReadStream(icon_path)
	.pipe(
		new png({
		filterType: 4,
		})
	)
	.on("parsed", function () {

		if(!(bars.length > 0)) return;

		//Clear the visor (remove the middle lines)
		for (var y = 2; y <= 10; y++) {
			for (var x = 2; x <= 13; x++) {
				var idx = (this.width * y + x) << 2;
				this.data[idx + 3] = 0;
			}
		}

		//add the progress bars
		for (var i = 0; i < bars.length; i++) {
			if(i > 5) {
				setPixel(this.data, 7, 12, [255,255,255], 255, false);
				setPixel(this.data, 8, 12, [255,255,255], 255, false);
				break;
			}

			const rgb = bars[i].color.convertToRGB();
			const progress = convertRange(bars[i].percent)
			let y = i*2+2;

			for (var x = 2; x <= progress; x++) {
				setPixel(this.data, x, y, rgb, 255, false);
			}
		}
		
		const image = nativeImage.createFromBitmap(this.data, {width: 16, height: 16});
		tray.setImage(image);
	});
}

String.prototype.convertToRGB = function(){
	var aRgbHex = this.match(/.{1,2}/g);
	var aRgb = [
		parseInt(aRgbHex[0], 16),
		parseInt(aRgbHex[1], 16),
		parseInt(aRgbHex[2], 16)
	];
	return aRgb;
}

function setPixel(data, x,y,rgb,a,color) {
	var idx = (16 * y + x) << 2;
	data[idx] =     (color)? rgb[0] : 255;
	data[idx + 1] = (color)? rgb[1] : 255;
	data[idx + 2] = (color)? rgb[2] : 255;
	data[idx + 3] = a;
}

function convertRange(value) {
	oldRange = {min: 0, max: 100};
	newRange = {min: 3, max: 12};
	return ((value - oldRange.min) * (newRange.max - newRange.min)) / (oldRange.max - oldRange.min) + newRange.min;
}

function setWindowsAccentColor(hexcolor) {
	execute("wcolor.exe -accent_color " + hexcolor, (err, stdout)=>{});
}

function setLinuxAccentColor(hexcolor) {
	const theme_name = yaru.matchColor(hexcolor);
	execute(`gsettings set org.gnome.desktop.interface icon-theme '${theme_name}'`, (err, stdout)=>{});
	execute(`gsettings set org.gnome.desktop.interface gtk-theme '${theme_name}-dark'`, (err, stdout)=>{});
	execute(`gsettings set org.gnome.desktop.interface cursor-theme '${theme_name}'`, (err, stdout)=>{});
}

async function setQKeyboardColor(hexcolor) {
	for(let i=1; i<=150; i++) {
		//let i=1;
		await post("http://localhost:27301/api/1.0/signals", {"name": `Set zone ${i}`,
														"id": i,
														"pid": "DK5QPID",
														"zoneId": i,
														"color": `#${hexcolor}`,
														"effect": "SET_COLOR"
														});
		await delay(10);
	}
}

function delay(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
}

async function post(url, data) {
	const dataString = JSON.stringify(data)

	const options = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Content-Length': dataString.length,
	},
	timeout: 1000, // in ms
	}

	return new Promise((resolve, reject) => {
	const req = http.request(url, options, (res) => {
		if (res.statusCode < 200 || res.statusCode > 299) {
		return reject(new Error(`HTTP status code ${res.statusCode}`))
		}

		const body = []
		res.on('data', (chunk) => body.push(chunk))
		res.on('end', () => {
		const resString = Buffer.concat(body).toString()
		resolve(resString)
		})
	})

	req.on('error', (err) => {
		reject(err)
	})

	req.on('timeout', () => {
		req.destroy()
		reject(new Error('Request time out'))
	})

	req.write(dataString)
	req.end()
	})
}