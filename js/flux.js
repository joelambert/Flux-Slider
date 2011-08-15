/**
 * @preserve Flux Slider v1.3.3 (pre release)
 * http://www.joelambert.co.uk/flux
 *
 * Copyright 2011, Joe Lambert.
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

// Flux namespace
window.flux = {
	version: '1.3.3 (pre release)'
};

(function($){
	flux.slider = function(elem, opts) {
		// Setup the flux.browser singleton to perform feature detection
		flux.browser.init();

		if(!flux.browser.supportsTransitions)
		{
			if(window.console && window.console.error)
				console.error("Flux Slider requires a browser that supports CSS3 transitions");

			//return false;
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
			controls: false,
			width: null,
			height: null,
			onTransitionEnd: null
		}, opts);

		// Set the height/width if given [EXPERIMENTAL!]
		this.height = this.options.height ? this.options.height	: null;
		this.width 	= this.options.width  ? this.options.width 	: null;

		// Filter out 3d transitions if the browser doesn't support them
		if(!flux.browser.supports3d)
		{
			var newTrans = [];
			$(this.options.transitions).each(function(index, tran){
				var t = new flux.transitions[tran](this);

				if(!t.options.requires3d)
					newTrans.push(tran);
			});		

			this.options.transitions = newTrans;
		}

		this.images = new Array();
		this.imageLoadedCount = 0;
		this.currentImageIndex = 0;
		this.nextImageIndex = 1;
		this.playing = false;


		this.container = $('<div class="fluxslider"></div>').appendTo(this.element);
		
		// Listen for click events as we may want to follow a link
		this.container.bind('click', function(event) {
			if($(event.target).hasClass('hasLink'))
				window.location = $(event.target).data('href');
		});

		this.imageContainer = $('<div class="images loading"></div>').css({
			'position': 'relative',
			'overflow': 'hidden',
			'min-height': '100px'
		}).appendTo(this.container);
		
		// If the height/width is already set then resize the container
		if(this.width && this.height)
		{
			this.imageContainer.css({
				width: this.width+'px',
				height: this.height+'px'
			})
		}

		// Create the placeholders for the current and next image
		this.image1 = $('<div class="image1" style="height: 100%; width: 100%"></div>').appendTo(this.imageContainer);
		this.image2 = $('<div class="image2" style="height: 100%; width: 100%"></div>').appendTo(this.imageContainer);

		$(this.image1).add(this.image2).css({
			'position': 'absolute',
			'top': '0px',
			'left': '0px'
		});
		
		// Get a list of the images to use
		this.element.find('img, a img').each(function(index, found_img){
			var imgClone = found_img.cloneNode(false),
				link = $(found_img).parent();

			// If this img is directly inside a link then save the link for later use
			if(link.is('a'))
				$(imgClone).data('href', link.attr('href'));

			_this.images.push(imgClone);

			

			// Remove the images from the DOM
			$(found_img).remove();
		});
		
		// Load the images afterwards as IE seems to load images synchronously
		for(var i=0; i<this.images.length; i++) {
			var image = new Image();
			image.onload = function() {
				_this.imageLoadedCount++;

				_this.width  = _this.width 	? _this.width  : this.width;
				_this.height = _this.height ? _this.height : this.height;

				if(_this.imageLoadedCount >= _this.images.length)
				{
					_this.finishedLoading();
					_this.setupImages();
				}
			};

			// Load the image to ensure its cached by the browser
			image.src = this.images[i].src;
		}

		// Are we using a callback instead of events for notifying about transition ends?
		if(this.options.onTransitionEnd) {
			this.element.bind('fluxTransitionEnd', function(event) {
				event.preventDefault();
				_this.options.onTransitionEnd(event.data);
			});
		}

		// Should we auto start the slider?
		if(this.options.autoplay)
			this.start();
			
		// Handle swipes
		this.element.bind('swipeLeft', function(event){
			_this.next(null, {direction: 'left'});
		}).bind('swipeRight', function(event){
			_this.prev(null, {direction: 'right'});
		});
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
		next: function(trans, opts) {
			opts = opts || {};
			opts.direction = 'left';
			this.showImage(this.currentImageIndex+1, trans, opts);
		},
		prev: function(trans, opts) {
			opts = opts || {};
			opts.direction = 'right';
			this.showImage(this.currentImageIndex-1, trans, opts);
		},
		showImage: function(index, trans, opts) {
			this.setNextIndex(index);

			this.stop();
			this.setupImages();
			this.transition(trans, opts);

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
					}).appendTo(_this.pagination);

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
			
			// Should we add prev/next controls?
			if(this.options.controls)
			{
				var css = {
					padding: '4px 10px 10px',
					'font-size': '60px',
					'font-family': 'arial, sans-serif',
					'line-height': '1em',
					'font-weight': 'bold',
					color: '#FFF',
					'text-decoration': 'none',
					background: 'rgba(0,0,0,0.5)',
					position: 'absolute',
					'z-index': 2000
				};
				
				this.nextButton = $('<a href="#">»</a>').css(css).css3({
					'border-radius': '4px'
				}).appendTo(this.imageContainer).bind('click', function(event){
					event.preventDefault();
					_this.next();
				});
				
				this.prevButton = $('<a href="#">«</a>').css(css).css3({
					'border-radius': '4px'
				}).appendTo(this.imageContainer).bind('click', function(event){
					event.preventDefault();
					_this.prev();
				});
				
				var top = (this.height - this.nextButton.height())/2;
				this.nextButton.css({
					top: top+'px',
					right: '10px'
				});
				
				this.prevButton.css({
					top: top+'px',
					left: '10px'
				});
			}
		},
		setupImages: function() {
			var img1 = this.getImage(this.currentImageIndex),
				css1 = {
					'background-image': 'url("'+img1.src+'")',
					'z-index': 101,
					'cursor': 'auto'
				};

			// Does this image have an associated link?
			if($(img1).data('href'))
			{
				css1.cursor = 'pointer'
				this.image1.addClass('hasLink');
				this.image1.data('href', $(img1).data('href'));
			}
			else
			{
				this.image1.removeClass('hasLink');
				this.image1.data('href', null);
			}

			this.image1.css(css1).children().remove();

			this.image2.css({
				'background-image': 'url("'+this.getImage(this.nextImageIndex).src+'")',
				'z-index': 100
			}).show();

			if(this.options.pagination)
			{
				this.pagination.find('li.current').removeClass('current');
				$(this.pagination.find('li')[this.currentImageIndex]).addClass('current');
			}
		},
		transition: function(transition, opts) {
			// Allow a transition to be picked from ALL available transitions (not just the reduced set)
	        if(transition == undefined || !flux.transitions[transition])
	        {
	            // Pick a transition at random from the (possibly reduced set of) transitions
	            var index = Math.floor(Math.random()*(this.options.transitions.length));
	            transition = this.options.transitions[index];
	        }

	        var tran = new flux.transitions[transition](this, $.extend(this.options[transition] ? this.options[transition] : {}, opts));

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
	}
})(window.jQuery || window.Zepto);

/**
 * Helper object to determine support for various CSS3 functions
 * @author Joe Lambert
 */

(function($) {
	flux.browser = {
		init: function() {
			// Have we already been initialised?
			if(flux.browser.supportsTransitions !== undefined)
				return;

			var div = document.createElement('div'),
				prefixes = ['-webkit', '-moz', '-o', '-ms'],
				domPrefixes = ['Webkit', 'Moz', 'O', 'Ms'];

			// Does the current browser support CSS Transitions?
			if(window.Modernizr && Modernizr.csstransitions !== undefined)
				flux.browser.supportsTransitions = Modernizr.csstransitions;
			else
			{
				// Custom detection when Modernizr isn't available
				flux.browser.supportsTransitions = false;
				for(var i=0; i<domPrefixes.length; i++)
				{
					if(domPrefixes[i]+'Transition' in div.style)
						flux.browser.supportsTransitions = flux.browser.supportsTransitions || true;
				}
			}

			// Does the current browser support 3D CSS Transforms?
			if(window.Modernizr && Modernizr.csstransforms3d !== undefined)
				flux.browser.supports3d = Modernizr.csstransforms3d;
			else
			{
				// Custom detection when Modernizr isn't available
				// flux.browser.supports3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
				// 
				// // Chrome has a 3D matrix but doesn't support 3d transforms
				// if(flux.browser.supports3d && 'webkitPerspective' in div.style)
				// {
					// Double check with a media query (similar to how Modernizr does this)
					var div3D = $('<div id="csstransform3d"></div>');
					var mq = $('<style media="(transform-3d), ('+prefixes.join('-transform-3d),(')+'-transform-3d)">div#csstransform3d { position: absolute; left: 9px }</style>');

					$('body').append(div3D);
					$('head').append(mq);

					flux.browser.supports3d = div3D.get(0).offsetLeft == 9;

					div3D.remove();
					mq.remove();
				// }	
			}

		},
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

	$(function(){
		// To continue to work with legacy code, ensure that flux.browser is initialised on document ready at the latest
		flux.browser.init();
	});
})(window.jQuery || window.Zepto);

(function($){
	/**
	 * Helper function for cross-browser CSS3 support, prepends all possible prefixes to all properties passed in
	 * @param {Object} props Ker/value pairs of CSS3 properties
	 */
	$.fn.css3 = function(props) {
		var css = {};
		var prefixes = ['webkit', 'moz', 'ms', 'o'];

		for(var prop in props)
		{
			// Add the vendor specific versions
			for(var i=0; i<prefixes.length; i++)
				css['-'+prefixes[i]+'-'+prop] = props[prop];
			
			// Add the actual version	
			css[prop] = props[prop];
		}
		
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
					callback.call(this, event);
			});
		}
		
		return this;
	};

	flux.transition = function(fluxslider, opts) {
		this.options = $.extend({
			requires3d: false,
			after: function() {
				// Default callback for after the transition has completed
			}
		}, opts);

		this.slider = fluxslider;

		// We need to ensure transitions degrade gracefully if they require 3d but the browser doesn't support it
		if((this.options.requires3d && !flux.browser.supports3d) || !flux.browser.supportsTransitions)
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
		hasFinished: false, // This is a lock to ensure that the fluxTransitionEnd event is only fired once per tansition
		run: function() {
			var _this = this;

			// do something
			if(this.options.setup)
				this.options.setup.call(this);

			// Remove the background image from the top image
			this.slider.image1.css({
				'background-image': 'none'
			});

			this.slider.imageContainer.css('overflow', this.options.requires3d ? 'visible' : 'hidden');

			// For some of the 3D effects using Zepto we need to delay the transitions for some reason
			setTimeout(function(){
				if(_this.options.execute)
					_this.options.execute.call(_this);
			}, 5);
		},
		finished: function() {
			if(this.hasFinished)
				return;
				
			this.hasFinished = true;
			
			if(this.options.after)
				this.options.after.call(this);

			this.slider.imageContainer.css('overflow', 'hidden');	

			this.slider.setupImages();

			// Trigger an event to signal the end of a transition
			this.slider.element.trigger('fluxTransitionEnd', {
				currentImage: this.slider.getImage(this.slider.currentImageIndex)
			});
		}
	};

	flux.transitions = {};
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.bars = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			barWidth: 60,
			setup: function() {
				var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1

				var delayBetweenBars = 40;

				var fragment = document.createDocumentFragment();

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

					fragment.appendChild(bar.get(0));
				}

				//this.slider.image1.append($(fragment));
				this.slider.image1.get(0).appendChild(fragment);
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
	}
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.bars3d = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			requires3d: true,
			barWidth: 100,
			perspective: 600,
			setup: function() {
				var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1;

				// Adjust the barWidth so that we can fit inside the available space
				this.options.barWidth = Math.floor(this.slider.image1.width() / barCount);

				// Work out how much space remains with the adjusted barWidth
				var remainder = this.slider.image1.width() - (barCount * this.options.barWidth),
					addPerLoop = Math.ceil(remainder / barCount),
					delayBetweenBars = 150,
					height = this.slider.image1.height(),
					totalLeft = 0,
					fragment = document.createDocumentFragment();

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
						'z-index': 200,

						'background-image': this.slider.image1.css('background-image'),
						'background-position': '-'+totalLeft+'px 0px',
						'background-repeat': 'no-repeat'
					}).css3({
						'backface-visibility': 'hidden'
					}),

					bar2 = $(bar.get(0).cloneNode(false)).css({
						'background-image': this.slider.image2.css('background-image')
					}).css3({
						'transform': flux.browser.rotateX(90) + ' ' + flux.browser.translate(0, -height/2, height/2)
					}),

					left = $('<div class="side bar bar-'+i+'"></div>').css({
						width: height+'px',
						height: height+'px',
						position: 'absolute',
						top: '0px',
						left: '0px',
						background: '#222',
						'z-index': 190
					}).css3({
						'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(height/2, 0, -height/2) + ' ' + flux.browser.rotateY(180),
						'backface-visibility': 'hidden'
					}),

					right = $(left.get(0).cloneNode(false)).css3({
						'transform': flux.browser.rotateY(90) + ' ' + flux.browser.translate(height/2, 0, thisBarWidth-height/2)
					}),

					barContainer = $('<div class="barcontainer"></div>').css({
						width: thisBarWidth+'px',
						height: '100%',
						position: 'absolute',
						top: '0px',
						left: totalLeft+'px',
						'z-index': i > barCount/2 ? 1000-i : 1000 // Fix for Chrome to ensure that the z-index layering is correct!
					}).css3({
						'transition-duration': '800ms',
						'transition-timing-function': 'linear',
						'transition-property': 'all',
						'transition-delay': (i*delayBetweenBars)+'ms',
						'transform-style': 'preserve-3d'
					}).append(bar).append(bar2).append(left).append(right);

					fragment.appendChild(barContainer.get(0));

					totalLeft += thisBarWidth;
				}

				//this.slider.image1.append(barContainer);
				this.slider.image1.get(0).appendChild(fragment);

				this.slider.imageContainer.css3({
					'perspective': this.options.perspective,
					'perspective-origin': '50% 50%'
				});
			},
			execute: function() {
				var _this = this,
					height = this.slider.image1.height(),
					bars = this.slider.image1.find('div.barcontainer');

				this.slider.image2.hide();

				// Get notified when the last transition has completed
				bars.last().transitionEnd(function(event){
					_this.slider.image2.show();

					_this.finished();
				});

				bars.css3({
					'transform': flux.browser.rotateX(-90) + ' ' + flux.browser.translate(0, height/2, height/2)
				});
			}
		}, opts));	
	}
})(window.jQuery || window.Zepto);

(function($) {	
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
	}
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.blinds3d = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			requires3d: true,
			barWidth: 150,
			perspective: 600,
			setup: function() {
				var barCount = Math.floor(this.slider.image1.width() / this.options.barWidth) + 1;
				var blockCountY = Math.floor(this.slider.image1.height() / this.options.barWidth) + 1;

				// Adjust the barWidth so that we can fit inside the available space
				this.options.barWidth = Math.floor(this.slider.image1.width() / barCount);

				// Work out how much space remains with the adjusted barWidth
				var remainder = this.slider.image1.width() - (barCount * this.options.barWidth),
					addPerLoop = Math.ceil(remainder / barCount),
					delayBetweenBars = 150,
					height = this.slider.image1.height(),
					totalLeft = 0,
					fragment = document.createDocumentFragment();

				for(var i=0; i<barCount; i++) {

					var totalTop = 0,
						addX,
						thisbarWidth,
						bar,
						bar2,
						barContainer;

					if(remainder > 0)
					{
						addX = remainder >= addPerLoop ? addPerLoop : remainderY;
						thisbarWidth += addX;
						remainder -= addX;
					}

					thisbarWidth = this.options.barWidth;

					bar = $('<div class="bar bar-'+i+'"></div>').css({
						width: thisbarWidth+'px',
						height: '100%',
						position: 'absolute',
						top: '0px',
						left: '0px',
						'z-index': 200,

						'background-image': this.slider.image1.css('background-image'),
						'background-position': '-'+totalLeft+'px 0px',
						'background-repeat': 'no-repeat'
					}).css3({
						'backface-visibility': 'hidden'
					});

					bar2 = $(bar.get(0).cloneNode(false)).css({
						'background-image': this.slider.image2.css('background-image'),
						'z-index': 190
					}).css3({
						'transform': flux.browser.rotateY(180)
					});

					barContainer = $('<div class="barcontainer"></div>').css({
						width: thisbarWidth+'px',
						height: height+'px',
						position: 'absolute',
						top: totalTop+'px',
						left: totalLeft+'px',
						'z-index': i > barCount/2 ? 1000-i : 1000 // Fix for Chrome to ensure that the z-index layering is correct!
					}).css3({
						'transition-duration': '800ms',
						'transition-timing-function': 'ease-out',
						'transition-property': 'all',
						'transition-delay': (i*delayBetweenBars)+'ms',
						'transform-style': 'preserve-3d'
					}).append(bar).append(bar2);

					fragment.appendChild(barContainer.get(0));

					totalLeft += thisbarWidth;
				}

				//this.slider.image1.append($(fragment));
				this.slider.image1.get(0).appendChild(fragment);

				this.slider.imageContainer.css3({
					'perspective': this.options.perspective,
					'perspective-origin': '50% 50%'
				});
			},
			execute: function() {
				var _this = this;

				var bars = this.slider.image1.find('div.barcontainer');

				this.slider.image2.hide();

				// Get notified when the last transition has completed
				bars.last().transitionEnd(function(event){
					_this.slider.image2.show();

					_this.finished();
				});

				bars.css3({
					'transform': flux.browser.rotateY(180)
				});
			}
		}, opts));	
	}
})(window.jQuery || window.Zepto);

(function($) {
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
	}
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.blocks = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			blockSize: 80,
			blockDelays: {},
			maxDelay: 0,
			setup: function() {
				var xCount = Math.floor(this.slider.image1.width() / this.options.blockSize)+1,
					yCount = Math.floor(this.slider.image1.height() / this.options.blockSize)+1,
					delayBetweenBars = 100,
					fragment = document.createDocumentFragment();

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

						fragment.appendChild(block.get(0));

						if(delay > this.options.maxDelay)
						{
							this.options.maxDelayBlock = block;
							this.options.maxDelay = delay;
						}
					}
				}

				//this.slider.image1.append($(fragment));
				this.slider.image1.get(0).appendChild(fragment);
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
	};
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.concentric = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			blockSize: 60,
			delay: 150,
			alternate: false,
			setup: function() {
				var w = this.slider.image1.width(),
					h = this.slider.image1.height(),
					largestLength = Math.sqrt(w*w + h*h), // Largest length is the diagonal

					// How many blocks do we need?
					blockCount = Math.ceil(((largestLength-this.options.blockSize)/2) / this.options.blockSize) + 1, // 1 extra to account for the round border
					fragment = document.createDocumentFragment();

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
						'border-radius': thisBlockSize+'px',
						'transition-duration': '800ms',
						'transition-timing-function': 'linear',
						'transition-property': 'all',
						'transition-delay': ((blockCount-i)*this.options.delay)+'ms'
					});

					fragment.appendChild(block.get(0));
				}

				//this.slider.image1.append($(fragment));
				this.slider.image1.get(0).appendChild(fragment);
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
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.warp = function(fluxslider, opts) {
		return new flux.transitions.concentric(fluxslider, $.extend({
			delay: 30,
			alternate: true
		}, opts));
	};
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.cube = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			requires3d: true,
			barWidth: 100,
			direction: 'left',
			perspective: 1000,
			setup: function() {
				var width = this.slider.image1.width();
				var height = this.slider.image1.height();

				// Setup the container to allow 3D perspective

				this.slider.imageContainer.css3({
					'perspective': this.options.perspective,
					'perspective-origin': '50% 50%'
				});

				this.cubeContainer = $('<div class="cube"></div>').css({
					width: width+'px',
					height: height+'px',
					position: 'relative'
				}).css3({
					'transition-duration': '800ms',
					'transition-timing-function': 'linear',
					'transition-property': 'all',
					'transform-style': 'preserve-3d'
				});

				var css = {
					height: '100%',
					width: '100%',
					position: 'absolute',
					top: '0px',
					left: '0px'
				};

				var currentFace = $('<div class="face current"></div>').css($.extend(css, {
					background: this.slider.image1.css('background-image')	
				}));

				this.cubeContainer.append(currentFace);

				var nextFace = $('<div class="face next"></div>').css($.extend(css, {
					background: this.slider.image2.css('background-image')
				})).css3({
					'transform' : this.options.transitionStrings.call(this, this.options.direction, 'nextFace')
				});

				this.cubeContainer.append(nextFace);

				this.slider.image1.append(this.cubeContainer);
			},
			execute: function() {
				var _this = this;

				var width = this.slider.image1.width();
				var height = this.slider.image1.height();

				this.slider.image2.hide();
				this.cubeContainer.css3({
					'transform' : this.options.transitionStrings.call(this, this.options.direction, 'container')
				}).transitionEnd(function(){
					_this.slider.image2.show();

					_this.finished();
				});
			},
			transitionStrings: function(direction, elem) {
				var width = this.slider.image1.width();
				var height = this.slider.image1.height();

				// Define the various transforms that are required to perform various cube rotations
				var t = {
					'up' : {
						'nextFace': flux.browser.rotateX(-90) + ' ' + flux.browser.translate(0, height/2, height/2),
						'container': flux.browser.rotateX(90) + ' ' + flux.browser.translate(0, -height/2, height/2)
					},
					'down' : {
						'nextFace': flux.browser.rotateX(90) + ' ' + flux.browser.translate(0, -height/2, height/2),
						'container': flux.browser.rotateX(-90) + ' ' + flux.browser.translate(0, height/2, height/2)
					},
					'left' : {
						'nextFace': flux.browser.rotateY(90) + ' ' + flux.browser.translate(width/2, 0, width/2),
						'container': flux.browser.rotateY(-90) + ' ' + flux.browser.translate(-width/2, 0, width/2)
					},
					'right' : {
						'nextFace': flux.browser.rotateY(-90) + ' ' + flux.browser.translate(-width/2, 0, width/2),
						'container': flux.browser.rotateY(90) + ' ' + flux.browser.translate(width/2, 0, width/2)
					}
				};

				return (t[direction] && t[direction][elem]) ? t[direction][elem] : false;
			}
		}, opts));	
	}
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.tiles3d = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			requires3d: true,
			tileWidth: 180,
			perspective: 600,
			setup: function() {
				var blockCountX = Math.floor(this.slider.image1.width() / this.options.tileWidth) + 1,
					blockCountY = Math.floor(this.slider.image1.height() / this.options.tileWidth) + 1;

				// Adjust the tileWidth so that we can fit inside the available space
				this.options.tileWidth = Math.floor(this.slider.image1.width() / blockCountX);

				// Work out how much space remains with the adjusted tileWidth
				var remainderX = this.slider.image1.width() - (blockCountX * this.options.tileWidth),
					addPerLoopX = Math.ceil(remainderX / blockCountX),
					remainderY = this.slider.image1.height() - (blockCountY * this.options.tileWidth),
					addPerLoopY = Math.ceil(remainderY / blockCountY),

					delayBetweenBarsX = 200,
					delayBetweenBarsY = 150,

					height = this.slider.image1.height(),

					totalLeft = 0,
					fragment = document.createDocumentFragment();

				for(var i=0; i<blockCountX; i++) {

					var totalTop = 0;

					var thisTileWidth = this.options.tileWidth;

					if(remainderX > 0)
					{
						var addX = remainderX >= addPerLoopX ? addPerLoopX : remainderX;
						thisTileWidth += addX;
						remainderX -= addX;
					}

					for(var j=0; j<blockCountY; j++)
					{
						var thisTileHeight = this.options.tileWidth;

						var remainderY2 = remainderY;

						if(remainderY2 > 0)
						{
							var addY = remainderY2 >= addPerLoopY ? addPerLoopY : remainderY2;
							thisTileHeight += addY;
							remainderY2 -= addY;
						}

						var tile = $('<div class="tile tile-'+i+'-'+j+'"></div>').css({
							width: thisTileWidth+'px',
							height: thisTileHeight+'px',
							position: 'absolute',
							top: '0px',
							left: '0px',
							'z-index': 200,

							'background-image': this.slider.image1.css('background-image'),
							'background-position': '-'+totalLeft+'px -'+totalTop+'px',
							'background-repeat': 'no-repeat'
						}).css3({
							'backface-visibility': 'hidden'
						});

						var tile2 = $(tile.get(0).cloneNode(false)).css({
							'background-image': this.slider.image2.css('background-image'),
							'z-index': 190
						}).css3({
							'transform': flux.browser.rotateY(180)
						});

						var tileContainer = $('<div class="tilecontainer"></div>').css({
							width: thisTileWidth+'px',
							height: thisTileHeight+'px',
							position: 'absolute',
							top: totalTop+'px',
							left: totalLeft+'px',
							'z-index': (i > blockCountX/2 ? 500-i : 500) + (j > blockCountY/2 ? 500-j : 500) // Fix for Chrome to ensure that the z-index layering is correct!
						}).css3({
							'transition-duration': '800ms',
							'transition-timing-function': 'ease-out',
							'transition-property': 'all',
							'transition-delay': (i*delayBetweenBarsX+j*delayBetweenBarsY)+'ms',
							'transform-style': 'preserve-3d'
						}).append(tile).append(tile2);

						fragment.appendChild(tileContainer.get(0));
						//this.slider.image1.append(tileContainer);

						totalTop += thisTileHeight;
					}

					totalLeft += thisTileWidth;
				}

				//this.slider.image1.append($(fragment));
				this.slider.image1.get(0).appendChild(fragment);

				this.slider.imageContainer.css3({
					'perspective': this.options.perspective,
					'perspective-origin': '50% 50%'
				});
			},
			execute: function() {
				var _this = this;

				var tiles = this.slider.image1.find('div.tilecontainer');

				this.slider.image2.hide();

				// Get notified when the last transition has completed
				tiles.last().transitionEnd(function(event){
					_this.slider.image2.show();

					_this.finished();
				});

				tiles.css3({
					'transform': flux.browser.rotateY(180)
				});
			}
		}, opts));	
	}
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.turn = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			requires3d: true,
			perspective: 1300,
			direction: 'left',
			setup: function() {
				var tab = $('<div class="tab"></div>').css({
						width: '50%',
						height: '100%',
						position: 'absolute',
						top: '0px',
						left: this.options.direction == 'left' ? '50%' : '0%',
						'z-index':101
					}).css3({
						'transform-style': 'preserve-3d',
						'transition-duration': '1000ms',
						'transition-timing-function': 'ease-out',
						'transition-property': 'all',
						'transform-origin': this.options.direction == 'left' ? 'left center' : 'right center'
					}),

				front = $('<div></div>').appendTo(tab).css({
						'background-image': this.slider.image1.css('background-image'),
						'background-position': (this.options.direction == 'left' ? '-'+(this.slider.image1.width()/2) : 0)+'px 0',
						width: '100%',
						height: '100%',
						position: 'absolute',
						top: '0',
						left: '0'
					}).css3({
						'backface-visibility': 'hidden'
					}),

				back = $('<div></div>').appendTo(tab).css({
						'background-image': this.slider.image2.css('background-image'),
						'background-position': (this.options.direction == 'left' ? 0 : '-'+(this.slider.image1.width()/2))+'px 0',
						width: '100%',
						height: '100%',
						position: 'absolute',
						top: '0',
						left: '0'
					}).css3({
						transform: flux.browser.rotateY(180),
						'backface-visibility': 'hidden'
					}),

				current = $('<div></div>').css({
					position: 'absolute',
					top: '0',
					left: this.options.direction == 'left' ? '0' : '50%',
					width: '50%',
					height: '100%',
					'background-image': this.slider.image1.css('background-image'),
					'background-position': (this.options.direction == 'left' ? 0 : '-'+(this.slider.image1.width()/2))+'px 0',
					'z-index':100
				}),

				overlay = $('<div class="overlay"></div>').css({
					position: 'absolute',
					top: '0',
					left: this.options.direction == 'left' ? '50%' : '0',
					width: '50%',
					height: '100%',
					background: '#000',
					opacity: 1
				}).css3({
					'transition-duration': '800ms',
					'transition-timing-function': 'linear',
					'transition-property': 'opacity'
				}),

				container = $('<div></div>').css3({
					width: '100%',
					height: '100%'
				}).css3({
					'perspective': this.options.perspective,
					'perspective-origin': '50% 50%'
				}).append(tab).append(current).append(overlay);

				this.slider.image1.append(container);
			},
			execute: function() {
				var _this = this;

				this.slider.image1.find('div.tab').first().transitionEnd(function(){
					_this.finished();
				}).css3({
					transform: flux.browser.rotateY(this.options.direction == 'left' ? -180 : 180)
				});
				this.slider.image1.find('div.overlay').css({
					opacity: 0
				});
			}
		}, opts));
	};
})(window.jQuery || window.Zepto);

(function($) {
	flux.transitions.slide = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			direction: 'left',
			setup: function() {
				var width = this.slider.image1.width(),
					height = this.slider.image1.height(),

				currentImage = $('<div class="current"></div>').css({
					height: height+'px',
					width: width+'px',
					position: 'absolute',
					top: '0px',
					left: '0px',
					background: this.slider[this.options.direction == 'left' ? 'image1' : 'image2'].css('background-image')	
				}).css3({
					'backface-visibility': 'hidden'
				}),

				nextImage = $('<div class="next"></div>').css({
					height: height+'px',
					width: width+'px',
					position: 'absolute',
					top: '0px',
					left: width+'px',
					background: this.slider[this.options.direction == 'left' ? 'image2' : 'image1'].css('background-image')
				}).css3({
					'backface-visibility': 'hidden'
				});

				this.slideContainer = $('<div class="slide"></div>').css({
					width: (2*width)+'px',
					height: height+'px',
					position: 'relative',
					left: this.options.direction == 'left' ? '0px' : -width+'px',
					'z-index': 101
				}).css3({
					'transition-duration': '600ms',
					'transition-timing-function': 'ease-in',
					'transition-property': 'all'
				});

				this.slideContainer.append(currentImage).append(nextImage);

				this.slider.image1.append(this.slideContainer);
			},
			execute: function() {
				var _this = this,
					delta = this.slider.image1.width();

				if(this.options.direction == 'left')
					delta = -delta;

				this.slideContainer.css3({
					'transform' : flux.browser.translate(delta)
				}).transitionEnd(function(){
					_this.finished();
				});
			}
		}, opts));	
	}
})(window.jQuery || window.Zepto);

