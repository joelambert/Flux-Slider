/**
 * @preserve Flux Slider v1.2
 * http://www.joelambert.co.uk/flux
 *
 * Copyright 2011, Joe Lambert. All rights reserved
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

// Flux namespace
var flux = {
	version: '1.2'
};

flux.slider = function(elem, opts) {
	if(!flux.browser.supportsTransitions)
	{
		if(window.console && window.console.error)
			console.error("Flux Slider requires a browser that supports CSS3 transitions");
	
		return;
	}
	
	var _this = this;
	
	this.element = $(elem);
	
	// Make a list of all available transitions
	this.transitions = [];
	for(var fx in flux.transitions)
		this.transitions.push(fx);
	
	this.options = $.extend({
		autoplay: true,
		transitions: this.transitions,
		delay: 4000,
		pagination: true,
		controls: true
	}, opts);
	
	// Get a list the images to use
	this.images = new Array();
	this.imageLoadedCount = 0;
	this.currentImageIndex = 0;
	this.nextImageIndex = 1;
	this.playing = false;
	
	this.element.find('img').each(function(index, found_img){
		_this.images.push(found_img.cloneNode(false));

		var image = new Image();
		image.onload = function() {
			_this.imageLoadedCount++;

			_this.width  = this.width;
			_this.height = this.height;
			
			if(_this.imageLoadedCount >= _this.images.length)
			{
				_this.finishedLoading();
				_this.setupImages();
			}
		};
		
		// Load the image to ensure its cached by the browser
		image.src = found_img.src;
		
		// Remove the images from the DOM
		$(found_img).remove();
	});
	
	this.container = $('<div class="fluxslider"></div>');
	this.element.append(this.container);
	
	this.imageContainer = $('<div class="images loading"></div>').css({
		'position': 'relative',
		'overflow': 'hidden',
		'min-height': '100px'
	});
	this.container.append(this.imageContainer);
	
	this.image1 = $('<div class="image1" style="height: 100%; width: 100%"></div>');
	this.imageContainer.append(this.image1);
	
	this.image2 = $('<div class="image2" style="height: 100%; width: 100%"></div>');
	this.imageContainer.append(this.image2);
	
	$(this.image1).css({
		'position': 'absolute',
		'top': '0px',
		'left': '0px'
	});
	
	$(this.image2).css({
		'position': 'absolute',
		'top': '0px',
		'left': '0px'
	});
	
	// Should we auto start the slider?
	if(this.options.autoplay)
		this.start();
};

flux.slider.prototype = {
	constructor: flux.slider,
	start: function() {
		var _this = this;
		this.interval = setInterval(function() {
			_this.transition();
		}, this.options.delay);
	},
	stop: function() {
		clearInterval(this.interval);
		this.interval = null;
	},
	isPlaying: function() {
		return this.interval != null;
	},
	next: function(trans) {
		this.showImage(this.currentImageIndex+1, trans);
	},
	prev: function(trans) {
		this.showImage(this.currentImageIndex-1, trans);
	},
	showImage: function(index, trans) {
		this.setNextIndex(index);
		
		this.stop();
		this.setupImages();
		this.transition(trans);
		
		if(this.options.autoplay)
			this.start();
	},  
	finishedLoading: function() {
		var _this = this;
		
		this.container.css({
			width: this.width+'px',
			height: this.height+'px'
		});
		
		this.imageContainer.removeClass('loading');
		
		// Should we setup a pagination view?
		if(this.options.pagination)
		{
			// TODO: Attach to touch events if appropriate
			this.pagination = $('<ul class="pagination"></ul>').css({
				margin: '0px',
				padding: '0px',
				'text-align': 'center'
			});
			
			this.pagination.bind('click', function(event){
				event.preventDefault();
				_this.showImage($(event.target).data('index'));
			});
			
			$(this.images).each(function(index, image){
				var li = $('<li data-index="'+index+'">'+(index+1)+'</li>').css({
					display: 'inline-block',
					'margin-left': '0.5em',
					'cursor': 'pointer'
				});
				
				_this.pagination.append(li);
				
				if(index == 0)
					li.css('margin-left', 0).addClass('current');
			});
			
			this.container.append(this.pagination);
		}
		
		// Resize
		$(this.imageContainer).css({
			width: this.width+'px',
			height: this.height+'px'
		});
		
		$(this.image1).css({
			width: this.width+'px',
			height: this.height+'px'
		});
		
		$(this.image2).css({
			width: this.width+'px',
			height: this.height+'px'
		});
		
		this.container.css({
			width: this.width+'px',
			height: this.height+(this.options.pagination?this.pagination.height():0)+'px'
		});
	},
	setupImages: function() {
		this.image1.css({
			'background-image': 'url("'+this.getImage(this.currentImageIndex).src+'")',
			'z-index': 101
		}).children().remove();
		
		this.image2.css({
			'background-image': 'url("'+this.getImage(this.nextImageIndex).src+'")',
			'z-index': 100
		});
		
		if(this.options.pagination)
		{
			this.pagination.find('li.current').removeClass('current');
			$(this.pagination.find('li')[this.currentImageIndex]).addClass('current');
		}
	},
	transition: function(transition) {
		// Allow a transition to be picked from ALL available transitions (not just the reduced set)
		if(transition == undefined || !flux.transitions[transition])
		{
			// Pick a transition at random from the (possibly reduced set of) transitions
			var index = Math.floor(Math.random()*(this.options.transitions.length));
			transition = this.options.transitions[index];
		}
		
		var tran = new flux.transitions[transition](this, this.options[transition]);

		tran.run();
		
		this.currentImageIndex = this.nextImageIndex;
		this.setNextIndex(this.currentImageIndex+1);
	},
	getImage: function(index) {
		index = index % this.images.length;
			
		return this.images[index];
	},
	setNextIndex: function(nextIndex)
	{
		if(nextIndex == undefined)
			nextIndex = this.currentImageIndex+1;
		
		this.nextImageIndex = nextIndex;
		
		if(this.nextImageIndex > this.images.length-1)
			this.nextImageIndex = 0;
			
		if(this.nextImageIndex < 0)
			this.nextImageIndex = this.images.length-1;
	},
	increment: function() {
		this.currentImageIndex++;
		if(this.currentImageIndex > this.images.length-1)
			this.currentImageIndex = 0;
	}
};

/**
 * Helper object to determine support for various CSS3 functions
 * @author Joe Lambert
 */

flux.browser = {
	translate: function(x, y, z) {
		x = (x != undefined) ? x : 0;
		y = (y != undefined) ? y : 0;
		z = (z != undefined) ? z : 0;
		
		return 'translate' + (flux.browser.supports3d ? '3d(' : '(') + x + 'px,' + y + (flux.browser.supports3d ? 'px,' + z + 'px)' : 'px)');
	},
	
	rotateX: function(deg) {
		return flux.browser.rotate('x', deg);
	},
	
	rotateY: function(deg) {
		return flux.browser.rotate('y', deg);
	},
	
	rotateZ: function(deg) {
		return flux.browser.rotate('z', deg);
	},
	
	rotate: function(axis, deg) {
		if(!axis in {'x':'', 'y':'', 'z':''})
			axis = 'z';
			
		deg = (deg != undefined) ? deg : 0;
			
		if(flux.browser.supports3d)
			return 'rotate3d('+(axis == 'x' ? '1' : '0')+', '+(axis == 'y' ? '1' : '0')+', '+(axis == 'z' ? '1' : '0')+', '+deg+'deg)';
		else
		{
			if(axis == 'z')
				return 'rotate('+deg+'deg)';
			else
				return '';
		}
	}
};

$(function() {
	var div = document.createElement('div');
	
	flux.browser.supportsTransitions = false;
	var prefixes = ['Webkit', 'Moz', 'O', 'Ms'];
	for(var i=0; i<prefixes.length; i++)
	{
		if(prefixes[i]+'Transition' in div.style)
			flux.browser.supportsTransitions = flux.browser.supportsTransitions || true;
	}

	flux.browser.supports3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
	
	// Chrome has a 3D matrix but doesn't support 3d transforms
	if(flux.browser.supports3d && 'webkitPerspective' in div.style)
	{
		// Double check with a media query (similar to how Modernizr does this)
		var div3D = $('<div id="csstransform3d"></div>');
		var mq = $('<style media="(transform-3d), (-webkit-transform-3d)">div#csstransform3d { position: absolute; left: 9px }</style>');
		
		$('body').append(div3D);
		$('head').append(mq);
		
		flux.browser.supports3d = div3D.get(0).offsetLeft == 9;
		
		div3D.remove();
		mq.remove();
	}
});;

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

flux.transitions = {};;

flux.transitions.bars = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		barWidth: 60,
		setup: function() {
			var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1
			
			var delayBetweenBars = 40;
			
			for(var i=0; i<barCount; i++) {
				var bar = $('<div></div>').attr('class', 'bar bar-'+i).css({
					width: this.options.barWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0',
					left: (i*this.options.barWidth)+'px',
					
					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+(i*this.options.barWidth)+'px 0px'
				}).css3({
					'transition-duration': '400ms',
					'transition-timing-function': 'ease-in',
					'transition-property': 'all',
					'transition-delay': (i*delayBetweenBars)+'ms'
				});
				this.slider.image1.append(bar);
			}
		},
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
				'transform': flux.browser.translate(0, height)
			});
		}
	}, opts));	
};

flux.transitions.bars3d = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		requires3d: true,
		barWidth: 100,
		setup: function() {
			var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1
			
			// Adjust the barWidth so that we can fit inside the available space
			this.options.barWidth = Math.floor(this.slider.image1.width() / barCount);
			
			// Work out how much space remains with the adjusted barWidth
			var remainder = this.slider.image1.width() - (barCount * this.options.barWidth);
			var addPerLoop = Math.ceil(remainder / barCount);
			
			var delayBetweenBars = 150;
			var height = this.slider.image1.height();
			
			var totalLeft = 0;
			
			for(var i=0; i<barCount; i++) {
				var thisBarWidth = this.options.barWidth;
				
				if(remainder > 0)
				{
					var add = remainder >= addPerLoop ? addPerLoop : remainder;
					thisBarWidth += add;
					remainder -= add;
				}
				
				var bar = $('<div class="bar bar-'+i+'"></div>').css({
					width: thisBarWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0px',
					left: '0px',
					
					'background-image': this.slider.image1.css('background-image'),
					'background-position': '-'+totalLeft+'px 0px',
					'background-repeat': 'no-repeat'
				}).css3({
					'backface-visibility': 'hidden'
				});

				var bar2 = $(bar.get(0).cloneNode(false)).css({
					'background-image': this.slider.image2.css('background-image')
				}).css3({
					'transform': flux.browser.rotateX(90) + ' ' + flux.browser.translate(0, -height/2, height/2)
				});
				
				var left = $('<div class="side bar bar-'+i+'"></div>').css({
					width: height+'px',
					height: height+'px',
					position: 'absolute',
					top: '0px',
					left: '0px',
					background: '#222'
				}).css3({
					'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(height/2, 0, -height/2)
				});
				
				var right = $(left.get(0).cloneNode(false)).css3({
					'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(height/2, 0, thisBarWidth-height/2)
				});
				
				var barContainer = $('<div class="barcontainer"></div>').css({
					width: thisBarWidth+'px',
					height: '100%',
					position: 'absolute',
					top: '0px',
					left: totalLeft+'px'
				}).css3({
					'transition-duration': '800ms',
					'transition-timing-function': 'linear',
					'transition-property': 'all',
					'transition-delay': (i*delayBetweenBars)+'ms',
					'transform-style': 'preserve-3d'
				}).append(bar).append(bar2).append(left).append(right);
				
				this.slider.image1.append(barContainer);
				
				totalLeft += thisBarWidth;
			}
			
			this.imageContainerOverflow = this.slider.imageContainer.css('overflow');
			
			this.slider.imageContainer.css({
				'overflow': 'visible'
			}).css3({
				'perspective': 600,
				'perspective-origin': '50% 50%'
			});
		},
		execute: function() {
			var _this = this;
			
			var height = this.slider.image1.height();

			var bars = this.slider.image1.find('div.barcontainer');
			
			this.slider.image2.hide();
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).transitionEnd(function(){
				_this.slider.image2.show();
				
				_this.slider.imageContainer.css({
					'overflow': _this.imageContainerOverflow
				})
				
				_this.finished();
			});

			this.slider.image1.find('div.barcontainer').css3({
				'transform': flux.browser.rotateX(-90) + ' ' + flux.browser.translate(0, height/2, height/2)
			});
			
			
			
			// this.slider.image1.find('div.bar.current').css3({
			// 	'transform': flux.browser.translate(0, height/2) + ' ' + flux.browser.rotateX(-90)
			// });
			// 
			// this.slider.image1.find('div.bar.next').css3({
			// 	'transform': flux.browser.translate(0, 0) + ' ' + flux.browser.rotateX(0)
			// });
		}
	}, opts));	
};

flux.transitions.blinds = function(fluxslider, opts) {
	return new flux.transitions.bars(fluxslider, $.extend({
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
	}, opts));
};

flux.transitions.zip = function(fluxslider, opts) {
	return new flux.transitions.bars(fluxslider, $.extend({
		execute: function() {
			var _this = this;
			
			var height = this.slider.image1.height();

			var bars = this.slider.image1.find('div.bar');
			
			// Get notified when the last transition has completed
			$(bars[bars.length-1]).transitionEnd(function(){
				_this.finished();
			});
			
			bars.each(function(index, bar){	
				setTimeout(function(){
					$(bar).css({
						'opacity': '0.3'
					}).css3({
						'transform': flux.browser.translate(0, (index%2 ? '-'+(2*height) : height))
					});
				}, 5);		
			})
		}
	}, opts));
};

flux.transitions.blocks = function(fluxslider, opts) {
	return new flux.transition(fluxslider, $.extend({
		blockSize: 80,
		blockDelays: {},
		maxDelay: 0,
		setup: function() {
			var xCount = Math.floor(this.slider.image1.width() / this.options.blockSize)+1;
			var yCount = Math.floor(this.slider.image1.height() / this.options.blockSize)+1;
			
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
						
						'background-image': this.slider.image1.css('background-image'),
						'background-position': '-'+(i*this.options.blockSize)+'px -'+(j*this.options.blockSize)+'px'
					}).css3({
						'transition-duration': '350ms',
						'transition-timing-function': 'ease-in',
						'transition-property': 'all',
						'transition-delay': delay+'ms'
					});
					this.slider.image1.append(block);
					
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

			var blocks = this.slider.image1.find('div.block');
			
			// Get notified when the last transition has completed
			this.options.maxDelayBlock.transitionEnd(function(){
				_this.finished();
			});
			
			blocks.each(function(index, block){				
				setTimeout(function(){
					$(block).css({
						'opacity': '0'
					}).css3({
						'transform': 'scale(0.8)'
					});
				}, 5);
			})
		}
	}, opts));
};;

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
};;

flux.transitions.warp = function(fluxslider, opts) {
	return new flux.transitions.concentric(fluxslider, $.extend({
		delay: 30,
		alternate: true
	}, opts));
};;

