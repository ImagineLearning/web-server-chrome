var baseUrl = 'localhost:8887/';

function convertServerSettingsToUrl(serverSettings, launchUrl) {
	var url = 'http://' + baseUrl;

	if (launchUrl) {
		url += launchUrl.replace(/^\//, '');
	}

	var queryString = ['chromeappid=' + chrome.runtime.id];

	if (serverSettings) {
		if ((serverSettings.sitecode || serverSettings.cloudSiteCode) && url.indexOf('sitecode') < 0) {
			queryString.push('sitecode=' + (serverSettings.sitecode || serverSettings.cloudSiteCode));
		} else if (serverSettings.engineAddress) {
			queryString.push('engineaddress=' + serverSettings.engineAddress);
		}

		if (serverSettings.forceCloudLogUpload && serverSettings.forceCloudLogUpload === true) {
			queryString.push('forceCloudLogUpload');
		}

		if (serverSettings.adaptive && serverSettings.adaptive === true) {
			queryString.push('adaptive');
		}

		if (serverSettings.env) {
			queryString.push('env=' + serverSettings.env);
		}

		queryString.push('chromeApp');
	}

	//if no environment set then default to production
	var envIndex = queryString.findIndex(function(item) {
		return /^env=/.test(item);
	});
	if (envIndex < 0) {
		queryString.push('env=production');
	}

	url += (url.indexOf('?') < 0 ? '?' : '&') + queryString.join('&');
	return url;
}
