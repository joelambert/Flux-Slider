flux.transitions.blinds = function(fluxslider, opts) {
	return new flux.transitions.bars(fluxslider, {
		barWidth: 70,
		execute: function() {
			var _this = this;
			
			var height = this.slider.image1.height();

			var bars = this.slider.image1.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).transitionEnd(function(){
				_this.finished();
			});
			
			bars.css({
				'opacity': '0.5'
			}).css3({
				'transform': 'scalex(0.0001)'
			});
		}
	});
}