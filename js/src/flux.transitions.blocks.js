flux.transitions.blocks = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		blockSize: 80,
		blockDelays: {},
		maxDelay: 0,
		setup: function() {
			var xCount = Math.floor(this.image.width() / this.options.blockSize)+1;
			var yCount = Math.floor(this.image.height() / this.options.blockSize)+1;
			
			var delayBetweenBars = 100;
			
			for(var i=0; i<xCount; i++)
			{
				for(var j=0; j<yCount; j++)
				{
					var delay = Math.floor(Math.random()*10*delayBetweenBars);

					var block = $('<div></div>').attr('class', 'block block-'+i+'-'+j).data('id', i+':'+j).css({
						width: this.options.blockSize+'px',
						height: this.options.blockSize+'px',
						position: 'absolute',
						top: (j*this.options.blockSize)+'px',
						left: (i*this.options.blockSize)+'px',
						
						'background-image': this.image.css('background-image'),
						'background-position': '-'+(i*this.options.blockSize)+'px -'+(j*this.options.blockSize)+'px',
						
						'-webkit-transition-duration': '350ms',
						'-webkit-transition-timing-function': 'ease-in',
						'-webkit-transition-property': 'opacity, -webkit-transform',
						'-webkit-transition-delay': delay+'ms'
					});
					this.image.append(block);
					
					if(delay > this.options.maxDelay)
					{
						this.options.maxDelayBlock = block;
						this.options.maxDelay = delay;
					}
				}
			}
		},
		execute: function() {
			var _this = this;

			var blocks = this.image.find('div.block');
			
			// Get notified when the last transition has completed
			this.options.maxDelayBlock.bind('webkitTransitionEnd', function(){
				$(this).unbind('webkitTransitionEnd');
				_this.finished();
			});
			
			blocks.each(function(index, block){				
				setTimeout(function(){
					$(block).css({
						'-webkit-transform': 'scale(0.8)',
						'opacity': '0'
					});
				}, 5);
			})
		}
	}, opts));
};