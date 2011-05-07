flux.transition = function(fluxslider, opts) {
	this.options = $.extend({
		after: function() {
			// Default callback for after the transition has completed
		}
	}, opts);
	
	this.slider = fluxslider;
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