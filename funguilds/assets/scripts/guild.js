var guild = (function(){
	var instance;

	var Resource = {
		'Players':'',
		'events':{
			'onPlayerAdd':'',
			'onPlay':'',
			'onPlayerLeave':''
		},
		'Broadcast':{
			'addMe':'',
			'leaveMe':'',
			'play':''
		},
		'game':''
	};

	var SyncAdapter = {
		'initialize': (function(){
			
		})(),
		'loadDependancies': function(args){

		}
	};


	var ResourceAdapter = {
		'createGame': function(key, dependancies, func){
			func.apply(this, ResourceAdapter.loadDependancies(dependancies));
			return{
				'join': function(){

				},
				'play': function(){

				},
				'leave': function(){

				},
			}
		},
		'createPlugin': function(key, dependancies, func){
			Resource[key] = func.apply(this, ResourceAdapter.loadDependancies(dependancies));
			
		},
		'loadDependancies' : function(arrayArg){
            var dependancy = [], iter;
            for (iter = 0; iter < arrayArg.length; iter += 1) {
                if (typeof arrayArg[iter] === "string") {
                    //look in modules
                    if (Resource.hasOwnProperty(arrayArg[iter])){
                        dependancy.push(ResourceAdapter.loadModule(arrayArg[iter]));
                    } 
                } 
            }
            return dependancy;
        },
        'loadModule': function (key) {
            return Resource[key];
        },
	};

	function initialize(){
		if(!instance) {
			instance = {
				game : function(){
					
					return ResourceAdapter.createGame(arguments[0], arguments[1], arguments[2]);
				},
				plugin: function(){
					ResourceAdapter.createPlugin(arguments[0], arguments[1], arguments[2]);
				},
			}  
		} 
		return instance;
	}
	return initialize();
})();

/**
	jQuery Plugin 
**/
guild.plugin('jQuery', [], function(){
	var temp = window.jQuery;
	window.jQuery = null;
	$ = null;
	return temp;
});


/** 
	Sync plugin
**/
guild.plugin('WS4Redis', ['jQuery'], function(jQuery){

	'use strict';
	var opts, ws, deferred, timer, timer_interval = 0;
	var heartbeat_interval = null, missed_heartbeats = 0;

	// if (this === undefined)
	// 	return new WS4Redis(options, $);
	// if (options.uri === undefined)
	// 	throw new Error('No Websocket URI in options');
	var Use = {
		'send': function(Obj){
			//if require Stringify this
			ws.send(Obj);
		},
		'onRecieve': function(func){
			addRecieverHandler(func);
		},
		'onOpen': function(func){
			addOpenHandler(func);
		},
		'onClose': function(func){
			addCloseHandler(func);
		},
		'onError': function(func){
			addErrorHandler(func);
		},
	}

	

	if ($ === undefined || $=== null)
		$ = jQuery;
	
	opts = $.extend({ heartbeat_msg: null }, Use);
	connect("ws://notifications?subscribe-broadcast");

	var ws;

	var ConnResource = {
		'on_open':'',
		'on_error':'',
		'on_message':'',
		'on_close':''
	};

	

	function connect(uri) {
		try {
			console.log("Connecting to " + uri + " ...");
			deferred = $.Deferred();
			//ws = new WebSocket(uri);
			ws.onopen = on_open;
			ws.onmessage = on_message;
			ws.onerror = on_error;
			ws.onclose = on_close;
			timer = null;
		} catch (err) {
			deferred.reject(new Error(err));
		}
	}

	function send_heartbeat() {     
	    try {
		    missed_heartbeats++;
		    if (missed_heartbeats > 3)
			    throw new Error("Too many missed heartbeats.");
		    ws.send(opts.heartbeat_msg);
	    } catch(e) {
		    clearInterval(heartbeat_interval);
		    heartbeat_interval = null;
		    console.warn("Closing connection. Reason: " + e.message);
		    ws.close();
	    }
	}

	function on_open() {
		console.log('Connected!');
		timer_interval = 500;
		deferred.resolve();
		if (opts.heartbeat_msg && heartbeat_interval === null) {
			missed_heartbeats = 0;
			heartbeat_interval = setInterval(send_heartbeat, 5000);
		}
	}

	function on_close(evt) {
		console.log("Connection closed!");
	    if (!timer) {
		    // try to reconnect
		    timer = setTimeout(function() {
			    connect(ws.url);
		    }, timer_interval);
		    timer_interval = Math.min(timer_interval + 500, 5000);
	    }
	}

	function on_error(evt) {
		console.error("Websocket connection is broken!");
		//call all handlers
		deferred.reject(new Error(evt));
	}

	function on_message(evt) {
		if (opts.heartbeat_msg && evt.data === opts.heartbeat_msg) {
			// reset the counter for missed heartbeats
			missed_heartbeats = 0;
		} else if (typeof opts.receive_message === 'function') {
			//call all handlers
			return opts.receive_message(evt.data);
		}
	}

	// setTimeout(function(){ConnResource['on_message'](1);}, 5000);

	this.send_message = function(message) {
		ws.send(message);
	}

	this.close = function() {
        timer=true;
        clearInterval(heartbeat_interval);
		ws.close();
		//call all handlers
	}

	function addRecieverHandler(func){
		ConnResource['on_message'] = func;
	}

	function addOpenHandler(func){
		ConnResource['on_open'].append(func);
	}

	function addCloseHandler(func){
		ConnResource['on_close'].append(func);
	}

	function addErrorHandler(func){
		ConnResource['on_error'].append(func);
	}

	return Use;
});

/** 
	Hotkeys plpugin 
**/


guild.plugin('Hotkeys', ['jQuery'], function(jQuery){

	/**
	Dependency: JQuery
**/

(function(jQuery){

	var KeysResource = {};


	jQuery['hotkeys'] = {
		version: "0.8",

		specialKeys: {
			8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
			37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
		},

		shiftNums: {
			"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
			"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
			".": ">",  "/": "?",  "\\": "|"
		}
	};

	function keyHandler( handleObj ) {
		// Only care when a possible input has been specified
		if ( typeof handleObj.data !== "string" ) {
			return;
		}

		var origHandler = handleObj.handler,
			keys = handleObj.data.toLowerCase().split(" ");

		handleObj.handler = function( event ) {
			// Don't fire in text-accepting inputs that we didn't directly bind to
			if ( this !== event.target && (/textarea|select/i.test( event.target.nodeName ) ||
				 event.target.type === "text") ) {
				return;
			}

			// Keypress represents characters, not special keys
			var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[ event.which ],
				character = String.fromCharCode( event.which ).toLowerCase(),
				key, modif = "", possible = {};

			// check combinations (alt|ctrl|shift+anything)
			if ( event.altKey && special !== "alt" ) {
				modif += "alt+";
			}

			if ( event.ctrlKey && special !== "ctrl" ) {
				modif += "ctrl+";
			}

			// TODO: Need to make sure this works consistently across platforms
			if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
				modif += "meta+";
			}

			if ( event.shiftKey && special !== "shift" ) {
				modif += "shift+";
			}

			if ( special ) {
				possible[ modif + special ] = true;

			} else {
				possible[ modif + character ] = true;
				possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true;

				// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
				if ( modif === "shift+" ) {
					possible[ jQuery.hotkeys.shiftNums[ character ] ] = true;
				}
			}

			for ( var i = 0, l = keys.length; i < l; i++ ) {
				if ( possible[ keys[i] ] ) {
					return origHandler.apply( this, arguments );
				}
			}
		};
	}

	jQuery.each([ "keydown", "keyup", "keypress" ], function() {
		jQuery.event.special[ this ] = { add: keyHandler };
	});

})( jQuery );


(function($) {
	$.fn.mapHotKeys = function(data) {
		/// <summary>
		///     Associates a set of hotkeys with corresponding actions.
		/// </summary>
		/// <param name="data" type="array">
		///     An array of the shape [ {key, action}, {key, action}, {key, action} ]
		/// </param>

		var source$ = $(this);

		$(data).each(function (index, item) {

			var key = item.key;
			var action = item.action;

			source$.bind('keydown', key, function (e) {
				action(item);

				if (item.isSequence !== true) {
					$(".pending_key").remove();
				}

				e.preventDefault();
				return false;
			});

		});

		return $(this);
	};

	$.mapHotKeys = {};

	var clearActionKeyOnMismatch = function(key1, key2, source) {
		$(source).bind('keypress', null, function(e) {

			if (e.which != key2) {
				$(".pending_key").remove();
			}

			return true;
		});
	};

	var setDefferedKeyAction = function (key1, key2, source, act) {
		var id = "__mapHotKeys__pending_key__" + key1 + "_" + key2;
		clearActionKeyOnMismatch(key1, key2, source);
		var defferedHolder = $("#" + id);

		if (defferedHolder.length === 0) {
			defferedHolder = $("<div class='pending_key' style='display: none' id='" + id + "'><div>");
			$("body").append(defferedHolder);
		}

		defferedHolder.data("key", key1);


		$(source).mapHotKeys([{
			key: key2,
			action: function (item) {
				var nextDefferedHolder = $("#" + id);
				var lastKey = nextDefferedHolder.data("key");
				nextDefferedHolder.data("key", "");

				if (lastKey === key1) {
					act(item);
					$(".pending_key").remove();
				}
			} }]);
	};

	$.mapHotKeys.createSequence = function (key1, key2, source, actionMethod) {
		/// <summary>
		///     Creates a hotkey mapping for a sequence of keys (e.g. press g, then i -> action).
		/// </summary>
		/// <param name="key1" type="string">
		///     The first key to press (and release) in the sequence.
		/// </param>
		/// <param name="key2" type="string">
		///     The second key to press (and release) in the sequence.
		///     This key triggers the action.
		/// </param>
		/// <param name="source" type="DOM object">
		///     The area of the DOM where the hotkey should be active.
		/// </param>
		/// <param name="actionMethod" type="function">
		///     The method to run when the action is triggered.
		/// </param>


		var pair = {
			key: key1,
			isSequence: true,
			action: function (item) { setDefferedKeyAction(key1, key2, source, actionMethod); }
		};

		return pair;
	};

})(jQuery);
	return {
		'on': function(key, func){
			jQuery(document).ready(function(){
				jQuery(document).mapHotKeys([{ key: key, action: func,}]);
			});
		}
	}

});
