var reload = chrome.runtime.reload
window.onresize = doLayout;
var isLoading = false;

function ui_ready() {

	if (window.webapp) {
		if (!(webapp.started || webapp.starting)) {
			// autostart ?
			webapp.start();
		}
	}
}
function settings_ready(d) {
	window.localOptions = d;
	console.log('fetched local settings', d);
	window.webapp = bg.get_webapp(d);
	ui_ready();
}

chrome.runtime.getBackgroundPage(function (bg) {
	window.bg = bg;
	chrome.storage.local.get(null, settings_ready);
})



onload = function () {
	getServerSettings(receivedServerSettings);
	var webview = document.querySelector('webview');
	doLayout();

	document.querySelector('#reset').onclick = function () {
		window.close();
	};

	document.querySelector('#reload').onclick = function () {
		if (isLoading) {
			webview.stop();
		} else {
			webview.reload();
		}
	};
	document.querySelector('#reload').addEventListener(
		'webkitAnimationIteration',
		function () {
			if (!isLoading) {
				document.body.classList.remove('loading');
			}
		});


	webview.addEventListener('exit', handleExit);
	webview.addEventListener('loadstart', handleLoadStart);
	webview.addEventListener('loadstop', handleLoadStop);
	webview.addEventListener('loadabort', handleLoadAbort);
	webview.addEventListener('loadredirect', handleLoadRedirect);
	webview.addEventListener('loadcommit', handleLoadCommit);
	webview.addEventListener('permissionrequest', handleRequest);
};


function getServerSettings(callback) {
	chrome.storage.managed.get("serverSettings", function (results) {
		if (chrome.runtime.lastError) {
			console.log("error, returning empty. Error Message: " + chrome.runtime.lastError.message);
			return;
		} else {
			console.log("got server settings, returning");
			callback(results.serverSettings)

		}
	});
}

function receivedServerSettings(serverSettings) {
	console.log("got server settings");
	console.log(serverSettings);
	chrome.storage.local.get('relativeLaunchUrl', function (obj) {
		var relativeLaunchUrl = obj && obj.relativeLaunchUrl,
			url = convertServerSettingsToUrl(serverSettings, relativeLaunchUrl);

		if (url && url.length > 0) {
			console.log("calling navigateTo url: " + url);
			navigateTo(url);
		}
	});
}


function handleRequest(e) {
	console.log("permission request");
	if (e.permission === 'media') {
		console.log("Audio permission request");
		e.request.allow();
	}
	console.log("Done with permission request");
}

function navigateTo(url) {
	resetExitedState();
	document.querySelector('webview').src = url;
}

function doLayout() {
	var webview = document.querySelector('webview');
	var controls = document.querySelector('#controls');
	var controlsHeight = controls.offsetHeight;
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var webviewWidth = windowWidth;
	var webviewHeight = windowHeight - controlsHeight;

	webview.style.width = webviewWidth + 'px';
	webview.style.height = webviewHeight + 'px';

	var sadWebview = document.querySelector('#sad-webview');
	sadWebview.style.width = webviewWidth + 'px';
	sadWebview.style.height = webviewHeight * 2 / 3 + 'px';
	sadWebview.style.paddingTop = webviewHeight / 3 + 'px';
}

function handleExit(event) {
	console.log(event.type);
	document.body.classList.add('exited');
	if (event.type == 'abnormal') {
		document.body.classList.add('crashed');
	} else if (event.type == 'killed') {
		document.body.classList.add('killed');
	}
}

function resetExitedState() {
	document.body.classList.remove('exited');
	document.body.classList.remove('crashed');
	document.body.classList.remove('killed');
}

function handleLoadCommit(event) {
	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}


	var webview = document.querySelector('webview');
}

function handleLoadStart(event) {
	document.body.classList.add('loading');
	isLoading = true;

	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}
}

var settings = {};
function handleLoadStop(event) {
	// We don't remove the loading class immediately, instead we let the animation
	// finish, so that the spinner doesn't jerkily reset back to the 0 position.
	isLoading = false;

	chrome.storage.sync.get(null, function (items) {
		settings = items;

		var webview = document.querySelector('webview');
		//by sending this message the webview can then send messages back to the listener added above
		webview.contentWindow.postMessage({
			command: 'handshake',
			settings: settings
		}, '*');
	});

	window.addEventListener("message", function (event) {
		console.log('window received message:', event.data);
		processCommand(event.data);
	});
}

function processCommand(data) {

	if (data.command === 'handshakereply') {
		//ignore because this is just the client telling us it can talk back
		return;
	}

	if (data.command === 'deletePref') {
		delete settings[data.data.key];
	}
	else if (data.command === 'setPref') {
		settings[data.data.key] = data.data;
	}

	chrome.storage.sync.set(settings, function () {

		if (!chrome.runtime.lastError) {
			console.log('settings set');
		}
	});


}

function handleLoadAbort(event) {
	console.log('oadAbort');
	console.log('  url: ' + event.url);
	console.log('  isTopLevel: ' + event.isTopLevel);
	console.log('  type: ' + event.type);
}

function handleLoadRedirect(event) {
	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}

	document.querySelector('#location').value = event.newUrl;
}