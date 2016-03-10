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
			"faker": {
				"name": 'Faker',
				"id": "Faker",
				"type": 'azubu'
			},
			"lolesports": {
				"name": 'Lol eSports',
				"id": "LoLEsports",
				"type": 'azubu'
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

		if(show){
			$loading.show();
			$streams.hide();
		} else {
			$loading.hide();
			$streams.show();
		}

	}

	function updateOnlineStreams(){
		showLoadingMessage(true);

		console.log(streamsDB);

		for(var streammerKey in streamsDB){
			console.log(streamsDB[streammerKey]);
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

	function reloadScreen(){
		var $onlineStreams = $('#online');
		var $offlineStreams = $('#offline');

		for(var key in onlineStreams){
			$onlineStreams.append('<b>' + onlineStreams[key].name + '</b><br/>');
		}

		for(var key in offlineStreams){
			$offlineStreams.append('<b>' + offlineStreams[key].name + '</b><br/>');
		}
	}

	function getStatusFromTwitch(streammer){
		var isOnline = false;

		$.getJSON('https://api.twitch.tv/kraken/streams/' + streammer.id, function(channel) {
		    if (channel["stream"]) {
		    	console.log(channel);

		        streammer.gamePlaying = channel.stream.game;
		        streammer.numberOfWatchers = channel.stream.viewers;

		        isOnline = true;
		    }
		});

		return isOnline;
	}

	function getStatusFromAzubu(streammer){
		var isOnline = false;

		$.getJSON('http://api.azubu.tv/public/channel/' + streammer.id + '/info', function(channel) {
		    if (channel.data && channel.data.is_live == true) {
		    	console.log(channel);

		        streammer.gamePlaying = channel.data.category.title;
		        streammer.numberOfWatchers = channel.data.view_count;

		        isOnline = true;
		    }
		});

		return isOnline;
	}