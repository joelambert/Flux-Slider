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

		// We need to ensure transitions degrade gracefully if the transition is unsupported or not loaded
		if((this.options.requires3d && !flux.browser.supports3d) || !flux.browser.supportsTransitions || this.options.fallback === true)
		{
			var _this = this;
			
			this.options.after = undefined;

			this.options.setup = function() {
				//console.error("Fallback setup()");
				_this.fallbackSetup();
			};
			
			this.options.execute = function() {
				//console.error("Fallback execute()");
				_this.fallbackExecute();
			};
		}
	};

	flux.transition.prototype = {
		constructor: flux.transition,
		hasFinished: false, // This is a lock to ensure that the fluxTransitionEnd event is only fired once per tansition
		run: function() {
			var _this = this;

			// do something
			if(this.options.setup !== undefined)
				this.options.setup.call(this);
			
			// Remove the background image from the top image
			this.slider.image1.css({
				'background-image': 'none'
			});

			this.slider.imageContainer.css('overflow', this.options.requires3d ? 'visible' : 'hidden');

			// For some of the 3D effects using Zepto we need to delay the transitions for some reason
			setTimeout(function(){
				if(_this.options.execute !== undefined)
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
		},
		fallbackSetup: function() {
			
		},
		fallbackExecute: function() {
			this.finished();
		}
	};

	flux.transitions = {};
	
	// Flux grid transition
	
	flux.transition_grid = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			columns: 6,
			rows: 6,
			forceSquare: false,
			setup: function() {
				var imgWidth = this.slider.image1.width(),
					imgHeight = this.slider.image1.height();
					
				var colWidth = Math.floor(imgWidth / this.options.columns),
					rowHeight = Math.floor(imgHeight / this.options.rows);
					
				if(this.options.forceSquare)
				{
					rowHeight = colWidth;
					this.options.rows = Math.floor(imgHeight / rowHeight);
				}

				// Work out how much space remains with the adjusted barWidth
				var colRemainder = imgWidth - (this.options.columns * colWidth),
					colAddPerLoop = Math.ceil(colRemainder / this.options.columns),
					
					rowRemainder = imgHeight - (this.options.rows * rowHeight),
					rowAddPerLoop = Math.ceil(rowRemainder / this.options.rows),
					
					delayBetweenBars = 150,
					height = this.slider.image1.height(),
					totalLeft = 0,
					totalTop = 0,
					fragment = document.createDocumentFragment();
				
				for(var i=0; i<this.options.columns; i++) {
					var thisColWidth = colWidth,
						totalTop = 0;

					if(colRemainder > 0)
					{
						var add = colRemainder >= colAddPerLoop ? colAddPerLoop : colRemainder;
						thisColWidth += add;
						colRemainder -= add;
					}
					
					for(var j=0; j<this.options.rows; j++)
					{
						var thisRowHeight = rowHeight,
							thisRowRemainder = rowRemainder;

						if(thisRowRemainder > 0)
						{
							var add = thisRowRemainder >= rowAddPerLoop ? rowAddPerLoop : thisRowRemainder;
							thisRowHeight += add;
							thisRowRemainder -= add;
						}
						
						var tile = $('<div class="tile tile-'+i+'-'+j+'"></div>').css({
							width: thisColWidth+'px',
							height: thisRowHeight+'px',
							position: 'absolute',
							top: totalTop+'px',
							left: totalLeft+'px'
						});
						
						this.options.renderTile.call(this, tile, i, j, thisColWidth, thisRowHeight, totalLeft, totalTop);
						
						fragment.appendChild(tile.get(0));
						
						totalTop += thisRowHeight;
					}
					
					totalLeft += thisColWidth;
				}

				// Append the fragement to the surface
				this.slider.image1.get(0).appendChild(fragment);
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
			},
			renderTile: function(elem, colIndex, rowIndex, colWidth, rowHeight, leftOffset, topOffset) {
				
			}
		}, opts));	
	};
})(window.jQuery || window.Zepto);