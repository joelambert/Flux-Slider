flux.transitions.zip = function(fluxslider, opts) {
	return new flux.transitions.bars(fluxslider, {
		execute: function() {
			var _this = this;
			
			var height = this.slider.image1.height();

			var bars = this.slider.image1.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			bars.each(function(index, bar){	
				setTimeout(function(){
					$(bar).css({
						'-webkit-transform': flux.browser.translate(0, (index%2 ? '-'+(2*height) : height)),
						'opacity': '0.3'
					});
				}, 5);		
			})
		}
	});
}