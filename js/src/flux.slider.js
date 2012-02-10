/**
 * @preserve Flux Slider v@VERSION
 * http://www.joelambert.co.uk/flux
 *
 * Copyright 2011, Joe Lambert.
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

// Flux namespace
window.flux = {
	version: '@VERSION'
};

(function($){
	flux.slider = function(elem, opts) {
		// Setup the flux.browser singleton to perform feature detection
		flux.browser.init();

		if(!flux.browser.supportsTransitions)
		{
			if(window.console && window.console.error)
				console.error("Flux Slider requires a browser that supports CSS3 transitions");
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
			captions: false,
			width: null,
			height: null,
			onTransitionEnd: null
		}, opts);

		// Set the height/width if given [EXPERIMENTAL!]
		this.height = this.options.height ? this.options.height	: null;
		this.width 	= this.options.width  ? this.options.width 	: null;

		// Filter out non compatible transitions
		var newTrans = [];
		$(this.options.transitions).each(function(index, tran){
			var t = new flux.transitions[tran](this),
				compatible = true;
			
			if(t.options.requires3d && !flux.browser.supports3d)
				compatible = false;
				
			if(t.options.compatibilityCheck)
				compatible = t.options.compatibilityCheck();

			if(compatible)
				newTrans.push(tran);
		});		

		this.options.transitions = newTrans;

		this.images = new Array();
		this.imageLoadedCount = 0;
		this.currentImageIndex = 0;
		this.nextImageIndex = 1;
		this.playing = false;


		this.container = $('<div class="fluxslider"></div>').appendTo(this.element);
		
		this.surface = $('<div class="surface" style="position: relative"></div>').appendTo(this.container);
		
		// Listen for click events as we may want to follow a link
		this.container.bind('click', function(event) {
			if($(event.target).hasClass('hasLink'))
				window.location = $(event.target).data('href');
		});

		this.imageContainer = $('<div class="images loading"></div>').css({
			'position': 'relative',
			'overflow': 'hidden',
			'min-height': '100px'
		}).appendTo(this.surface);
		
		// If the height/width is already set then resize the container
		if(this.width && this.height)
		{
			this.imageContainer.css({
				width: this.width+'px',
				height: this.height+'px'
			});
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
		
		// Catch when a transition has finished
		this.element.bind('fluxTransitionEnd', function(event, data) {
			// If the slider is currently playing then set the timeout for the next transition
			// if(_this.isPlaying())
			// 	_this.start();
			
			// Are we using a callback instead of events for notifying about transition ends?
			if(_this.options.onTransitionEnd) {					
				event.preventDefault();
				_this.options.onTransitionEnd(data);
			}
		});

		// Should we auto start the slider?
		if(this.options.autoplay)
			this.start();
			
		// Handle swipes
		this.element.bind('swipeLeft', function(event){
			_this.next(null, {direction: 'left'});
		}).bind('swipeRight', function(event){
			_this.prev(null, {direction: 'right'});
		});
		
		// Under FF7 autoplay breaks when the current tab loses focus
		setTimeout(function(){
			$(window).focus(function(){
				if(_this.isPlaying())
					_this.next();
			});
		}, 100);
	};

	flux.slider.prototype = {
		constructor: flux.slider,
		playing: false,
		start: function() {
			var _this = this;
			this.playing = true;
			this.interval = setInterval(function() {
				console.log('play');
				_this.transition();
			}, this.options.delay);
		},
		stop: function() {
			this.playing = false;
			clearInterval(this.interval);
			this.interval = null;
		},
		isPlaying: function() {
			return this.playing;
			//return this.interval != null;
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
			
			// Temporarily stop the transition interval
			//clearInterval(this.interval);
			//this.interval = null;
			
			this.setupImages();
			this.transition(trans, opts);
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
				}).appendTo(this.surface).bind('click', function(event){
					event.preventDefault();
					_this.next();
				});
				
				this.prevButton = $('<a href="#">«</a>').css(css).css3({
					'border-radius': '4px'
				}).appendTo(this.surface).bind('click', function(event){
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
			
			// Should we use captions?
			if(this.options.captions)
			{
				this.captionBar = $('<div class="caption"></div>').css({
					background: 'rgba(0,0,0,0.6)',
					color: '#FFF',
					'font-size': '16px',
					'font-family': 'helvetica, arial, sans-serif',
					'text-decoration': 'none',
					'font-weight': 'bold',
					padding: '1.5em 1em',
					opacity: 0,
					position: 'absolute',
					'z-index': 110,
					width: '100%',
					bottom: 0
				}).css3({
					'transition-property': 'opacity',
					'transition-duration': '800ms',
					'box-sizing': 'border-box'
				}).prependTo(this.surface);
			}
			
			this.updateCaption();
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
				css1.cursor = 'pointer';
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

			if(this.options.pagination && this.pagination)
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
			
			var tran = null;

			try {
		        tran = new flux.transitions[transition](this, $.extend(this.options[transition] ? this.options[transition] : {}, opts));
			}
			catch(e) {
				// If an invalid transition has been provided then use the fallback (default is to just switch the image)
				tran = new flux.transition(this, {fallback: true});
			}

	        tran.run();
			
	        this.currentImageIndex = this.nextImageIndex;
	        this.setNextIndex(this.currentImageIndex+1);
			this.updateCaption();
		},
		updateCaption: function() {
			var str = $(this.getImage(this.currentImageIndex)).attr('title');
			if(this.options.captions && this.captionBar)
			{
				if(str !== "")
					this.captionBar.html(str);
					
				this.captionBar.css('opacity', str === "" ? 0 : 1);
			}
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
})(window.jQuery || window.Zepto);