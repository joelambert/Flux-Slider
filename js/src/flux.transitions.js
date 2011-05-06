flux.transition = function(fluxslider, opts) {
	this.options = $.extend({
		// Default callback for once the transition has completed
		after: function() {
			fluxslider.setupImages();
		}
	}, opts);
	
	this.image = fluxslider.image1;
};

flux.transition.prototype = {
	constructor: flux.transition,
	run: function() {
		// do something
		if(this.options.setup)
			this.options.setup.call(this);
		
		// Remove the background image from the top image
		this.image.css({
			'background-image': 'none'
		});
		
		if(this.options.execute)
			this.options.execute.call(this);
	},
	finished: function() {
		if(this.options.after)
			this.options.after.call(this);
	}
};

flux.transitions = {};