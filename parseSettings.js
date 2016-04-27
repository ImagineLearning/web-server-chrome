var baseUrl = "localhost:8887/";


function convertServerSettingsToUrl(serverSettings) {
	if (serverSettings !== undefined && serverSettings !== null) {
	
		var protocol = 'http://';
				
		var domain = baseUrl;
				
		var queryString = '';
		if (serverSettings && serverSettings.cloudSiteCode && serverSettings.cloudSiteCode.length > 0) {
			queryString =  '?sitecode=' + serverSettings.cloudSiteCode;
		} else if (serverSettings && serverSettings.engineAddress && serverSettings.engineAddress.length > 0) {
			queryString = '?engineaddress=' + serverSettings.engineAddress;
		}
		
		if (serverSettings && serverSettings.forceCloudLogUpload && serverSettings.forceCloudLogUpload === true) {
			if (queryString === '') {
				queryString = '?forceCloudLogUpload';
			} else {
				queryString = queryString + '&forceCloudLogUpload';
			}
		}
		
		return protocol + domain + queryString;
	}
	return '';
}