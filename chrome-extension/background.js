/*
* background.js
* by Mario Toledo (mariotoledo12@gmail.com)
* 
* in charge of update the badge count every minute
*/

var pollInterval = 1000 * 60;

function startRequest() {
    updateOnlineStreams();
    chrome.browserAction.setBadgeText({ text: '' + onlineStreams.length });
    window.setTimeout(startRequest, pollInterval);
}

$(document).ready(function(){
	startRequest();
});