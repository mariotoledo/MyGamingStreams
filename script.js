var streamsDB = {
			"kami": {
				"name": 'Kami',
				"id": 'kami',
				"type": 'azubu',
			},
			"brtt": {
				"name": 'Brtt',
				"id": 'brtt',
				"type": 'azubu'
			},
			"riotgames": {
				"name": 'Riot Games',
				"id": 'riotgames',
				"type": 'twitch'
			},
			"Faker": {
				"name": 'Faker',
				"id": "Faker",
				"type": 'azubu'
			},
			"LoLEsports": {
				"name": 'Lol eSports',
				"id": "LoLEsports",
				"type": 'azubu'
			},
			"stonedyooda": {
			    "name": 'StoneD YoDa',
			    "id": "stonedyooda",
			    "type": 'twitch'
			}
		}

		var onlineStreams = [];
		var offlineStreams = [];

	document.addEventListener('DOMContentLoaded', function() {
		$.ajaxSetup({
		   async: false
		});
		updateOnlineStreams();
	}, false);

	function showLoadingMessage(show){
		var $loading = $('#loading');
		var $streams = $('#streams');

		if(show == true){
			$loading.show();
			$streams.hide();
		} else {
			$loading.hide();
			$streams.show();
		}
	}

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

	function getStatusFromTwitch(streammer){
		var isOnline = false;

		$.getJSON('https://api.twitch.tv/kraken/streams/' + streammer.id, function (channel) {
		    console.log(channel);
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

	function getStatusFromAzubu(streammer){
		var isOnline = false;

		$.getJSON('http://api.azubu.tv/public/channel/' + streammer.id + '/info', function (channel) {
		    console.log(channel);
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