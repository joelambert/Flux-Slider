(function(){
	/**
	 * Helper function for cross-browser CSS3 support, prepends all possible prefixes to all properties passed in
	 * @param {Object} props Ker/value pairs of CSS3 properties
	 */
	$.fn.css3 = function(props) {
		var css = {};
		var prefixes = ['webkit', 'moz', 'ms', 'o'];
		
		for(var prop in props)
			for(var i=0; i<prefixes.length; i++)
				css['-'+prefixes[i]+'-'+prop] = props[prop];
			
		this.css(css);
		return this;
	};
	
	/**
	 * Helper function to bind to the correct transition end event
	 * @param {function} callback The function to call when the event fires
	 */
	$.fn.transitionEnd = function(callback) {
		var _this = this;
		
		var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd'];
		
		for(var i=0; i < events.length; i++)
		{
			this.bind(events[i], function(event){
				// Automatically stop listening for the event
				for(var j=0; j<events.length;j++)
					$(this).unbind(events[j]);

				// Perform the callback function
				if(callback)
					callback.call(this);
			});
		}
	};
})();


flux.transition = function(fluxslider, opts) {
	this.options = $.extend({
		requires3d: false,
		after: function() {
			// Default callback for after the transition has completed
		}
	}, opts);
	
	this.slider = fluxslider;
	
	// We need to ensure transitions degrade gracefully if they require 3d but the browser doesn't support it
	if(this.options.requires3d && !flux.browser.supports3d)
	{
		var _this = this;
		this.options.setup = undefined;
		this.options.after = undefined;
		this.options.execute = function() {
			_this.finished();
		};
	}
};

flux.transition.prototype = {
	constructor: flux.transition,
	run: function() {
		// do something
		if(this.options.setup)
			this.options.setup.call(this);
		
		// Remove the background image from the top image
		this.slider.image1.css({
			'background-image': 'none'
		});
		
		if(this.options.execute)
			this.options.execute.call(this);
	},
	finished: function() {
		if(this.options.after)
			this.options.after.call(this);
			
		this.slider.setupImages();
	}
};

flux.transitions = {};