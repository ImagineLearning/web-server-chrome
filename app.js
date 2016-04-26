var reload = chrome.runtime.reload
function getel(id) { return document.getElementById(id) }

function ui_ready() {
    getel('main-content').style.display = 'block'

    if (window.webapp) {
        if (! (webapp.started || webapp.starting)) {
            // autostart ?
            webapp.start()
        }
    }
}
function settings_ready(d) {
    window.localOptions = d
    console.log('fetched local settings',d)
    window.webapp = bg.get_webapp(d) // retainStr in here
    ui_ready()
}

chrome.runtime.getBackgroundPage( function(bg) {
    window.bg = bg
    chrome.storage.local.get(null, settings_ready)
})


onload = function(){
	var $ = function(sel) {
			return document.querySelector(sel);
		};

	var webview=$('#webview');

	webview.addEventListener('permissionrequest', function(e) {
	  if ( e.permission === 'media' ) {
		e.request.allow();
	  } else {
		console.log('Denied permission '+e.permission+' requested by webview');
		e.request.deny();
	  }
	});	
}

