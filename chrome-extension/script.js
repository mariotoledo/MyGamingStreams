/*
* script.js
* by Mario Toledo (mariotoledo12@gmail.com)
* 
* Stores the main script for My Gaming Streams
*/

var streamsDB;

var onlineStreams = [];
var offlineStreams = [];

var isBusy = false;

document.addEventListener('DOMContentLoaded', function() {
	$.ajaxSetup({
		async: false
	});

	streamsDB = JSON.parse(localStorage.getItem('streams-mygamingstreams'));

    //if its the first time that the app is used, then we insert some good streamers for them :D
	if (!streamsDB) {
		streamsDB = {
		    kami: {
		        name: 'Kami',
		        id: 'kami',
		        type: 'azubu',
		    },
		    brtt: {
		        name: 'Brtt',
		        id: 'brtt',
		        type: 'azubu'
		    },
		    riotgames: {
		        name: 'Riot Games',
		        id: 'riotgames',
		        type: 'twitch'
		    },
		    faker: {
		        name: 'Faker',
		        id: "Faker",
		        type: 'azubu'
		    },
		    lolesports: {
		        name: 'Lol eSports',
		        id: "LoLEsports",
		        type: 'azubu'
		    },
		    stonedyooda: {
		        name: 'StoneD YoDa',
		        id: "stonedyooda",
		        type: 'twitch'
		    }
		}
	}

	$('#btnAddStreamer').click(function (e) { addStreamer() });
	$('#refresh-button').click(function (e) { updateOnlineStreams() });
	$('#mnu-link-addAStream').click(function (e) { e.preventDefault(); goToAddAStream() });
	$('#mnu-btn-back').click(function (e) { e.preventDefault(); goToMainMenu() });
	$('#mnu-link-removeAStream').click(function (e) { e.preventDefault(); goToRemoveAStream() });
	

	updateOnlineStreams();
}, false);

/*
* Garantees that no action button will be active while the app is fetching data
*/
function setBusyState(isBusy) {
    if (isBusy) {
        $('#refresh-button').hide();
        $('#refreshing-icon').show();
    } else {
        $('#refresh-button').show();
        $('#refreshing-icon').hide();
    }

	$('#btnAddStreamer').attr('disabled', isBusy);
	$('#newStreamUrl').attr('disabled', isBusy);
}

/*
* Shows or hides loading message
*/
function showLoadingMessage(show) {
    if (show == true) {
        $('#loading').show();
        $('#streams').hide();
        setBusyState(true);
	} else {
		setTimeout(function () {
		    $('#loading').hide();
		    $('#streams').show();
		    setBusyState(false);
		}, 3000);
	}
}

/*
* Fetchs new information from stored streams and reloads the screen with updated information
*/
function updateOnlineStreams(){
	showLoadingMessage(true);

	onlineStreams = [];
	offlineStreams = [];

	for(var streammerKey in streamsDB){
		if(streamsDB[streammerKey].type == 'twitch'){
			if(getStatusFromTwitch(streamsDB[streammerKey]) == true){
				onlineStreams.push(streamsDB[streammerKey]);
			} else {
				offlineStreams.push(streamsDB[streammerKey]);
			}
		} else if (streamsDB[streammerKey].type == 'azubu'){
			if(getStatusFromAzubu(streamsDB[streammerKey]) == true){
				onlineStreams.push(streamsDB[streammerKey]);
			} else {
				offlineStreams.push(streamsDB[streammerKey]);
			}
		}
	}

	reloadScreen();

	showLoadingMessage(false);
}

/*
* Reload streams screen with updated information
*/
function reloadScreen() {
	var $onlineStreams = $('#online');
	var $offlineStreams = $('#offline');

	$onlineStreams.html('');
	$offlineStreams.html('');

	var $noOnlineMessage = $('#no-online');
	var $noOfflineMessage = $('#no-offline');

	var totalStreammers = onlineStreams.length + offlineStreams.length;

	$onlineStreams.show();
	$offlineStreams.show();
	$noOnlineMessage.hide();
	$noOfflineMessage.hide();

	if (onlineStreams && onlineStreams.length) {
		for (var key in onlineStreams) {
		    $onlineStreams.append('<li class="mdl-list__item mdl-list__item--two-line"><a target="_blank" href="' + onlineStreams[key].stream_url + '">' +
                                    '<div class="mdl-list__item-primary-content">' +
                                    '<i class="material-icons mdl-list__item-avatar" style="background-image: url(' + onlineStreams[key].thumbnail_url + ')"></i>' +
                                    '<div class="streamer-name">' + onlineStreams[key].name + '</div>' +
                                    '<div class="mdl-list__item-sub-title">Playing ' + onlineStreams[key].gamePlaying + '</div>' +
                                    '<div class="mdl-list__item-sub-title">' + onlineStreams[key].numberOfWatchers + ' watching</div>' +
                                    '</a></div></li>');
		}
	} else {
		$noOnlineMessage.show();
		$onlineStreams.hide();
	}

	$('#onlineCount').html('(' + onlineStreams.length + '/' + totalStreammers + ')');

	chrome.browserAction.setBadgeText({ text: '' + onlineStreams.length });

	if (offlineStreams && offlineStreams.length) {
		for (var key in offlineStreams) {
		    $offlineStreams.append('<li class="mdl-list__item mdl-list__item--two-line"><a target="_blank" href="' + offlineStreams[key].stream_url + '">' +
                                    '<div class="mdl-list__item-primary-content">' +
                                    '<i class="material-icons mdl-list__item-avatar"></i>' +
                                    '<div style="padding-top: 10px;" class="streamer-name">' + offlineStreams[key].name + '</div>' +
                                    '</a></div></li>');
		}
	} else {
		$noOfflineMessage.show();
		$offlineStreams.hide();
	}

	$('#offlineCount').html('(' + offlineStreams.length + '/' + totalStreammers + ')');
}

/*
* Checks if user is online on Twitch and returns it. If user is online, then its information is stored
*/
function getStatusFromTwitch(streammer){
	var isOnline = false;

	$.getJSON('https://api.twitch.tv/kraken/streams/' + streammer.id, function (channel) {
		streammer.stream_url = 'http://www.twitch.tv/' + streammer.id;

		if (channel["stream"]) {
		    streammer.gamePlaying = channel.stream.game;
		    streammer.numberOfWatchers = channel.stream.viewers;
		    streammer.thumbnail_url = channel.stream.channel.logo;

		    isOnline = true;
		}
	});

	return isOnline;
}

/*
* Checks if user is online on Azubu and returns it. If user is online, then its information is stored
*/
function getStatusFromAzubu(streammer){
	var isOnline = false;

	$.getJSON('http://api.azubu.tv/public/channel/' + streammer.id + '/info', function (channel) {
		streammer.stream_url = 'http://www.azubu.tv/' + streammer.id;

		if (channel.data && channel.data.is_live == true) {
		    streammer.gamePlaying = channel.data.category.title;
		    streammer.numberOfWatchers = channel.data.view_count;
		    streammer.thumbnail_url = channel.data.url_thumbnail;

		    isOnline = true;
		}
	});

	return isOnline;
}

/*
* Adds a new Streamer from URL to local DB
*/
function addStreamer() {
	setBusyState(true);

	$('#success-addition').hide();
	$('.error-message').hide();

    try{
        var newStreamUrl = $('#newStreamUrl').val();

        //checking if field is empty
        if (!newStreamUrl || newStreamUrl.length == 0) {
            $('#format-error-addition').show();
            setBusyState(false);
            return;
        }

        var type;

        //checking if stream url is in current format and determining the domain
        if (newStreamUrl.indexOf('twitch.tv/') < 0){
            if (newStreamUrl.indexOf('azubu.tv/') < 0 && newStreamUrl.indexOf('azubu.uol') < 0) {
                $('#format-error-addition').show();
                setBusyState(false);
                return;
            } else {
                type = 'azubu';
            }
        } else {
            type = 'twitch';
        }

        var id = newStreamUrl.substring(newStreamUrl.lastIndexOf('/') + 1).toLowerCase();

        if (streamsDB[id]) {
            $('#already-exists-addition').show();
            setBusyState(false);
            return;
        }

        //making request to check if user exists
        if (type == 'twitch') {
            $.getJSON('https://api.twitch.tv/kraken/users/' + id, function (data) {
                streamsDB[id] = {
                    name: data.display_name,
                    id: id,
                    type: type
                }

                localStorage.setItem('streams-mygamingstreams', JSON.stringify(streamsDB));
                $('#success-addition').show();

                updateOnlineStreams();
            }).error(function (data) {
                if (data.status == 404) {
                    $('#not-found-addition').show();
                } else {
                    $('#unknow-error-addition').show();
                }

                setBusyState(false);
                return;
            });
        } else if (type == 'azubu') {
            $.getJSON('http://api.azubu.tv/public/channel/' + id, function (data) {
                streamsDB[id] = {
                    name: data.data.user.display_name,
                    id: id,
                    type: type
                }

                localStorage.setItem('streams-mygamingstreams', JSON.stringify(streamsDB));
                $('#success-addition').show();

                updateOnlineStreams();
            }).error(function (data) {
                if (data.status == 404) {
                    $('#not-found-addition').show();
                } else {
                    $('#unknow-error-addition').show();
                }

                setBusyState(false);
                return;
            });
        } else {
            $('#unknow-error-addition').show();
            setBusyState(false);
        }
    } catch (err) {
        $('#unknow-error-addition').show();
        setBusyState(false);
    }
}

function goToAddAStream(){
	$('#main-stream').hide();
	$('#mnu-btn-back').show();
	$('#add-stream').show();
}

function goToRemoveAStream(){
	$toRemoveStreamsWrapper = $('#to-remove-streams-wrapper');

	updateToRemoveStreamsList();

	$('#main-stream').hide();
	$('#mnu-btn-back').show();
	$('#remove-stream').show();
}

function updateToRemoveStreamsList(){
	var streams = onlineStreams.concat(offlineStreams);

	if (streams && streams.length > 0) {
		var toRemoveStreams = "";
		for (var key in streams) {
		    toRemoveStreams += '<li class="mdl-list__item"><span class="mdl-list__item-primary-content">' + streams[key].name + 
		    				   '</span><a class="mdl-list__item-secondary-action btn-remove-stream" data-streamId="' + streams[key].id.toLowerCase() + '" href="#"><i class="fa fa-times" aria-hidden="true"></i></a></li>';
		}

		$toRemoveStreamsWrapper.html(toRemoveStreams);
	} else {
		$toRemoveStreamsWrapper.html('<li class="no-users"><i>There are no users to remove</i></li>');
	}

	$('.btn-remove-stream').click(function (e) {e.preventDefault(); removeStream(jQuery(this).attr('data-streamId')) });
}

function removeStream(id){
	console.log('chamando: ' + id);
	console.log(streamsDB[id]);
	if(streamsDB && streamsDB[id]){
		console.log('entrou');
		delete streamsDB[id];
		localStorage.setItem('streams-mygamingstreams', JSON.stringify(streamsDB));
		updateOnlineStreams();
		updateToRemoveStreamsList();
	}
}

function goToMainMenu(){
	$('.sub-menu').hide();
	$('#mnu-btn-back').hide();
	$('#add-stream .alert').hide();
	$('#main-stream').show();
}

function testNotification(){
	chrome.notifications.create(
	    'name-for-notification',{   
	    type: 'basic', 
	    iconUrl: 'icon48.png', 
	    title: "This is a notification", 
	    message: "hello there!" 
	    },

	function() {} 

	);
}