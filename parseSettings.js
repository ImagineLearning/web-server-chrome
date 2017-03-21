var baseUrl = "localhost:8887/";


function convertServerSettingsToUrl(serverSettings, launchUrl) {
	var url = 'http://' + baseUrl;

	if (launchUrl) {
		url += launchUrl.replace(/^\//, '');
	}

	if (serverSettings) {
		var queryString = [];
		if (serverSettings && serverSettings.cloudSiteCode && serverSettings.cloudSiteCode.length > 0 && url.indexOf('sitecode') < 0) {
			queryString.push('sitecode=' + serverSettings.cloudSiteCode);
		} else if (serverSettings && serverSettings.engineAddress && serverSettings.engineAddress.length > 0) {
			queryString.push('engineaddress=' + serverSettings.engineAddress);
		}
		
		if (serverSettings && serverSettings.forceCloudLogUpload && serverSettings.forceCloudLogUpload === true) {
			queryString.push('forceCloudLogUpload');
		}

		if (serverSettings && serverSettings.adaptive && serverSettings.adaptive === true) {
			queryString.push('adaptive');
		}

		if (queryString.length) {
			url += (url.indexOf('?') < 0 ? '?' : '&') + queryString.join('&');
		}
	}

	return url;
}