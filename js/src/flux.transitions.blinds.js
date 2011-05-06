flux.transitions.blinds = function(fluxslider, opts) {
	return new flux.transitions.bars(fluxslider, {
		barWidth: 70,
		execute: function() {
			var _this = this;
			
			var height = this.image.height();

			var bars = this.image.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			bars.css({
				'-webkit-transform': 'scalex(0.0001)',
				'opacity': '0.5'
			});
		}
	});
}