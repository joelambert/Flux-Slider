flux.transitions.concentric = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		blockSize: 60,
		delay: 150,
		alternate: false,
		setup: function() {
			var w = this.slider.image1.width();
			var h = this.slider.image1.height();
			
			// Largest length is the diagonal
			var largestLength = Math.sqrt(w*w + h*h);
			
			// How many blocks do we need?
			var blockCount = Math.ceil(((largestLength-this.options.blockSize)/2) / this.options.blockSize) + 1; // 1 extra to account for the round border
			
			for(var i=0; i<blockCount; i++)
			{
				var thisBlockSize = (2*i*this.options.blockSize)+this.options.blockSize;
				
				var block = $('<div></div>').attr('class', 'block block-'+i).css({
					width: thisBlockSize+'px',
					height: thisBlockSize+'px',
					position: 'absolute',
					top: ((h-thisBlockSize)/2)+'px',
					left: ((w-thisBlockSize)/2)+'px',
					
					'z-index': 100+(blockCount-i),
					
					'background-image': this.slider.image1.css('background-image'),
					'background-position': 'center center'
				}).css3({
					'border-radius': '1000px',
					'transition-duration': '800ms',
					'transition-timing-function': 'linear',
					'transition-property': 'all',
					'transition-delay': ((blockCount-i)*this.options.delay)+'ms'
				});
				this.slider.image1.append(block);
			}
		},
		execute: function() {
			var _this = this;

			var blocks = this.slider.image1.find('div.block');
			
			// Get notified when the last transition has completed
			$(blocks[0]).transitionEnd(function(){
				_this.finished();
			});
			
			blocks.each(function(index, block){
				setTimeout(function(){
					$(block).css({
						'opacity': '0'
					}).css3({
						'transform': flux.browser.rotateZ((!_this.options.alternate || index%2 ? '' : '-')+'90')
					});
				}, 5);
			})
		}
	}, opts));
};