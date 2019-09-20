var reload = chrome.runtime.reload;
var storage = chrome.storage.local;
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

chrome.runtime.getBackgroundPage(function(bg) {
	window.bg = bg;
	storage.get(null, settings_ready);
});

onload = function() {
	getServerSettings(receivedServerSettings);
	var webview = document.querySelector('webview');
	doLayout();

	document.querySelector('#reset').onclick = function() {
		window.close();
	};

	document.querySelector('#reload').onclick = function() {
		if (isLoading) {
			webview.stop();
		} else {
			webview.reload();
		}
	};
	document.querySelector('#reload').addEventListener('webkitAnimationIteration', function() {
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
	webview.addEventListener('newwindow', handleNewWindow);
};

function getServerSettings(callback) {
	chrome.storage.managed.get('serverSettings', function(results) {
		if (chrome.runtime.lastError) {
			console.log('error, returning empty. Error Message: ' + chrome.runtime.lastError.message);
			return;
		} else {
			console.log('got server settings, returning');
			callback(results.serverSettings);
		}
	});
}

function receivedServerSettings(serverSettings) {
	console.log('got server settings');
	console.log(serverSettings);
	storage.get('relativeLaunchUrl', function(obj) {
		var relativeLaunchUrl = obj && obj.relativeLaunchUrl,
			url = convertServerSettingsToUrl(serverSettings, relativeLaunchUrl);

		if (url && url.length > 0) {
			console.log('calling navigateTo url: ' + url);
			navigateTo(url);
		}
	});
}

function handleRequest(e) {
	console.log('permission request');
	if (e.permission === 'media') {
		console.log('Audio permission request');
		e.request.allow();
	}
	console.log('Done with permission request');
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

	chrome.storage.sync.get(null, function(items) {
		settings = items;

		var webview = document.querySelector('webview');
		//by sending this message the webview can then send messages back to the listener added above
		webview.contentWindow.postMessage(
			{
				command: 'handshake',
				settings: settings
			},
			'*'
		);
	});

	window.addEventListener('message', function(event) {
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
	} else if (data.command === 'setPref') {
		settings[data.data.key] = data.data;
	}

	chrome.storage.sync.set(settings, function() {
		if (!chrome.runtime.lastError) {
			console.log('settings set');
		}
	});
}

function handleLoadAbort(event) {
	console.log('loadAbort');
	console.log('  url: ' + event.url);
	console.log('  isTopLevel: ' + event.isTopLevel);
	console.log('  type: ' + event.type);
}

function handleLoadRedirect(event) {
	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}

	var location = document.querySelector('#location');
	if(location !== null){
		location.value = event.newUrl;
	}
}

function handleNewWindow(event) {
	event.preventDefault();

	// event.targetUrl contains the target URL of the original link click
	// or window.open() call: use it to open your own window to it.
	// See: https://stackoverflow.com/a/18452171/6326743
	var url = event.targetUrl;

	// `chrome.browser.openTab` with `browser` permission will open the link in the browser.
	// See: https://stackoverflow.com/a/36530347/6326743
	chrome.browser.openTab({ url: url });
}

/**
 * Handler for messages sent with `chrome.runtime.sendMessage`
 * 
 * @param {any} message The message sent by the calling script
 * @param {MessageSender} sender 
 * @param {function} sendResponse Function to call (at most once) when you have a response.
 */
function handleMessage(message, sender, sendResponse) {
	console.log('handleMessage:', message);
	if (message.command === 'settings.get') {
		storage.get('serverSettings', function(items) {
			if (sendResponse) {
				var response = {
					success: !chrome.runtime.lastError,
					data: chrome.runtime.lastError
				};
				if (response.success) {
					var data = items.serverSettings || {};
					if (typeof message.data === 'string') {
						response.data = data[message.data];
					} else if (Array.isArray(message.data)) {
						response.data = message.data.reduce(function(aggregator, current) {
							return (aggregator[current] = data[current]);
						}, {});
					} else {
						response.data = data;
					}
				}
				console.log('response:', response);
				sendResponse(response);
			}
		});
		return !!sendResponse; // wait for response
	} else if (message.command === 'settings.patch') {
		storage.get('serverSettings', function(items) {
			var settings = {
				serverSettings: _.extend(items.serverSettings || {}, message.data)
			};
			storage.set(settings, function() {
				if (sendResponse) {
					var response = {
						success: !chrome.runtime.lastError,
						data: chrome.runtime.lastError
					};
					console.log('response:', response);
					sendResponse(response);
				}
			});
		});
		return !!sendResponse; // wait for response
	} else if (message.command === 'restart') {
		onload();
	}
}

chrome.runtime.onMessageExternal.addListener(handleMessage);
chrome.runtime.onMessage.addListener(handleMessage);
