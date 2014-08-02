/**_____________________________________________________________________
 *
 * jquery.youtubewrapper
 *
 * @author Luc Martin
 * @version 2.0.1
 * @date July 31 2013
 * Description:
 * This plugin is designed to play videos using the Youtube api.
 * It offers many options and callbacks.
 *
 * Purpose: to listen to a list of buttons or thumbnails
 * and play on click the video that is set in a html5 data element (data-youtubeid)
 *
 *
 * Instructions:
 * 1- Build a list of html objects, buttons, thumbsnails or <a> tags
 * 2- by default the plugin will grab the parameter data-youtubeid="[video to play]"
 * 3- you can set a callback function to be executed after the click
 * Example:
 *
			// Responsive design parameters for the player by
			// James Billings
			var videoWidth = $('.videoWrapper').width();
			var videoHeight = videoWidth/(713/434);

			// Don't forget to load the plugin!
			// Here we go...

			$('.playVideo').youtubewrapper({
				targetId : 'videoPlayer',  	// the id of the div where the video will play
				height : videoHeight, 		// height
				width : videoWidth, 		// width
				videoId : 'data-videoid', 	// The html-5 tag that will contain the video ID
				modestbranding : 1, 		// if set to 1 will hide the big Youtube Icon
				rel : 0, 					// Values: 0 or 1. Default is 1. indicates whether the player should show related videos when playback ends.
				showinfo : 0, 				// Values: 0 or 1. Default is 1 showinfo and playlist
				dataLayerEventName : 'Clorox Video click event',  // Google tagging
				events : {
					'onStateChange' :
					// User defined call back function on Player State Change e=event information, args = Plugin parameters
					function(e,args) {
						////console.info('Youtube Video state changed '+e.data);
						////console.info(args);
						////console.info(e);
					},
					'onReady':
					// User defined callback on apiReady
					function(e,args){
						////console.info('Youtube API ready ')
						////console.info(args);
						////console.info(e)
					}
				},
				afterClick :
				// User defined callback function triggered by clicking on the Thumbnails
				function(eventTarget, args) {

					////console.info('AfterClick functions running');

				}
			});
 */

/**
 * function onYouTubeIframeAPIReady
 * Triggered by Youtube API on load
 * will trigger a window event to let our JQuery plugin knows that the API is ready
 */
var youtubeVariables = {
	youtubeIsReady : false,
	youtubeIterator : 1,
	player:{},
	actualPlayer:{id:'', playingVideoId:'',status:'standby'},
	triggerId : '',
	triggerClass : ''
}


function onYouTubeIframeAPIReady() {
	$(window).trigger('goYoutubePlugin');
	youtubeVariables.youtubeIsReady = true;
	youtubeVariables.actualPlayer.status = 'Standby'
}

/**
 * The plugin
 */
(function($) {

	$.fn.youtubewrapper = function(args) {

		var ready;
		var src = "//www.youtube.com/iframe_api";

		// carries the ID of the trigger
		var id;
		// used to set an ID to a trigger if there is none
		var idIterator = 0;
		// player state
		var done = false;
		// the player
		var player;

		// Test if the youtube api script has been already loaded
		$('script').each(function() {

			if ($(this).attr('src')) {
				////console.log($(this).attr('src'))
				fund = $(this).attr('src').match(src);
			}

		});

		//consolidate the 'this' for the root object
		// set the defaults
		var base = this, defaults = {
			wmode : 'transparent',
			targetId : 'video',
			autoplay : 0,
			height : 244,
			width : 427,
			videoId : 'data-videoid',
			'preloadVideoId':null,
			modestbranding : 1,
			rel : 0,
			showinfo : 0,
			preImage : '.videoPlay',
			postImage : '#watchedVideo',
			dialogId : "#watchMe",
			dataLayerEventName : 'Clorox Desktop_LP_Watch',
			events : {
				'onStateChange' : function() {
					onPlayerStateChange();
				},
				'onReady':function(){}
			},
			afterClick : function() {
				//AfterClick
			}
		};
		//merge in user supplied args
		$.extend(defaults, args || {});

		setEvents(this, defaults);

		// add the tag that loads the API
		addTag();

		//Iterate trough all elements set by the plugin
		return this.each(function() {

			youtubeVariables.triggerClass = $(this).attr('class');
			setId(this);
			setListeners(this, defaults);

		});

		/**
		 * function setId
		 * Definition will set an Id on the target if there is none
 		 * @param {Object} target
		 */
		function setId(target){
			if(! $(target).attr('id')){
				++youtubeVariables.youtubeIterator;
				$(target).attr('id', 'jQueryYoutube'+youtubeVariables.youtubeIterator);
			}
		}

		/**
		 * function setListeners
		 * Definition: Sets the onClick listeners on each trigger object
		 * @param {Object} obj
		 * @param {Object} args
		 */
		function setListeners(obj, args) {

			id = $(obj).attr('id');
            //console.log('handling listeners '+id);
			$('body').on('click', '#' + id, function() {
				console.log('Click')

				if($(this).attr('data-playerid')){
					args.targetId = $(this).attr('data-playerid');
					//console.info($(this).attr('data-playerid'));
				}

				if($(this).attr('data-preimage')){
					if($(args.preImage).attr('src')){
						$(args.preImage).attr('src') = $(this).attr('data-preimage');
					}else{
						$(args.preImage).css('backgroundImage',$(this).attr('data-preimage'));
					}
				}
				if($(this).attr('data-postimage')){
					if($(args.preImage).attr('src')){
						$(args.preImage).attr('src') = $(this).attr('data-postimage');
					}else{
						$(args.postImage).css('backgroundImage',$(this).attr('data-postimage'));
					}
				}

				var eventTarget = this;
				// Hiding will fix IE 8 black screen bug
				$('#' + defaults.targetId).hide();
				var newVideoFrame = '<div id="' + defaults.targetId + '"></div>';
				$('#' + defaults.targetId).replaceWith(newVideoFrame);
				args.autoplay = 1;
				setEvents(this, args);
				args.afterClick(eventTarget, args);
				youtubeVariables.triggerId = $(this).attr('id');

			});
		  }
		/**
		 * function setEvents
		 * Definition: Set the listeners for the on Player ready event
		 * Calls the user defined callbacks on that event
		 * @param {Object} caller
		 * @param {Object} args
		 */
		function setEvents(caller, args) {

			var args = args;
			if (!youtubeVariables.youtubeIsReady) {

				//////console.info('BINDING EVENTS')

				$(window).bind('goYoutubePlugin', function(e) {

					executeOnReadyCallBacks(args);
					setVideoPlayer(null,args);

				});

			}
			else {
				////console.info('already set running')
				setVideoPlayer($(caller).attr(args.videoId),args);
			}
		}

		/**
		 * function executeOnReadyCallBacks(args)
		 * User defined callback events
 		 * @param {Object} args
		 */
		function executeOnReadyCallBacks(args){
			if(args.events && args.events.onReady){
				args.events.onReady(args);
			}
		}

		/**
		 * function setVideoPlayer
		 * Description: This is the main action for the plugin
		 * Called every time a user clicks the "trigger" (click listener)
		 * Setup the video player with the video parameters passed in the html5 tag 'data-videoid'
		 * or the User defined tag in the args.videoId
		 * Set also the listeners for the onPlayerStateChange events and executes user callback function
		 *
		 * @param {Object} videoId
		 * @param {Object} args
		 */
		function setVideoPlayer(videoId,args) {
			////console.info(videoId)
			// get the video id

			if (!videoId ) {
			    if(args.preloadVideoId){
			        console.log('args.preloadVideoId is '+args.preloadVideoId)
			        videoId = args.preloadVideoId;
			    }else{
				    videoId = $(base).first().attr(args.videoId);
				}
			}
			youtubeVariables.actualPlayer.playingVideoId = videoId;
			youtubeVariables.actualPlayer.id = args.targetId;
			////console.info('PLAYING '+videoId)
			// setup the player
			youtubeVariables.player = new YT.Player(args.targetId, // the player
			{
					height : args.height, // video height
					width : args.width, // video width
					videoId : videoId, // the youtube ID
					playerVars : {
						wmode : args.wmode,
						modestbranding : args.modestbranding, // set to 1 to hide the youtube logo
						rel : args.rel, // Values: 0 or 1. Default is 1. indicates whether the player should show related videos when playback ends.
						showinfo : args.showinfo, // Values: 0 or 1. Default is 1 showinfo and playlist
						autoplay : args.autoplay
					},
					events : {
						'onStateChange' : function(e){ // triggered whenever the player plays, stops pause etc
							//console.info('Player change')
							onPlayerStateChange(e,args) // Plugin
							args.events.onStateChange(e,args); // User defined callback
						}
					}
			});

			// Ready state
			ready = true;

			// actual playing video id
			currentVideo = videoId;
		}

		/**
		 * function onPlayerStateChange
		 * Description: Respond to the player state change event
 		 * @param {Object} event
		 */
		function onPlayerStateChange(event) {
			if(!event){
				return false;
			}
			if (event.data == YT.PlayerState.PLAYING && !done) {
				// test if there is a pre-image to hide
				if ($(args.preImage).length > 0) {
					// hide pre and post image
					$(args.preImage).fadeOut(750);
					$(args.postImage).fadeOut(750);
				}
				// test if we need to send an event to the data layer
				//TODO here we may want to add tagging events

				done = true;
			} else if (event.data == YT.PlayerState.ENDED) {
				// video is over test if there is a post image to show
				if ($(args.postImage).length > 0) {
					$(args.postImage).fadeIn(1000);
					$(args.dialogId).dialog("destroy");
				}
			}

			switch(event.data){
				case -1:
					youtubeVariables.actualPlayer.status = 'Unstarted';
				break;
				case 0:
					youtubeVariables.actualPlayer.status = 'Ended';
				break;
				case 1:
					youtubeVariables.actualPlayer.status = 'Playing';
				break;
				case 2:
					youtubeVariables.actualPlayer.status = 'Paused';
				break;
				case 3:
					youtubeVariables.actualPlayer.status = 'Buffering';
				break;
				case 5:
					youtubeVariables.actualPlayer.status = 'Video cued';
				break;

			}


		}

		/**
		 * function addTag
		 * Description: If the youtube api script is not loaded, loads it. if it is already loaded
		 * trigger the listener
		 */

		function addTag() {
			if (!youtubeVariables.youtubeIsReady) {
				$.getScript(src, function(){
					fund = true;
				})
				var tag = document.createElement('script');
				tag.src = src;
				var firstScriptTag = document.getElementsByTagName('script')[0];
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			}else{
				//$(window).trigger('goYoutubePlugin');
			}
		}

	};
})(jQuery);
