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

		if (serverSettings && serverSettings.env && serverSettings.env.length > 0) {
			queryString.push('env=' + serverSettings.env);
		}

		if (queryString.length) {
			url += (url.indexOf('?') < 0 ? '?' : '&') + queryString.join('&');
		}
	}

	//if no environment set then default to production
	if(url.indexOf("env") < 0) {
		url += (url.indexOf('?') < 0 ? '?' : '&') + 'env=production';
	}

	return url;
}