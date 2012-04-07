(function($) {
	flux.transitions.swipe = function(fluxslider, opts) {
		return new flux.transition(fluxslider, $.extend({
			setup: function() {
				var svgmask = $('<svg id="svgmask" xmlns="http://www.w3.org/2000/svg" height="0px">' +
					'<linearGradient id="myGradient" gradientTransform="translate(0,0)">' +
						'<animateTransform attributeName="gradientTransform"' +
								 'dur="1600ms" type="translate" from="-0.1 0" to="1.1 0" fill="freeze"/>' +
						'<stop offset="0%" stop-color="white" stop-opacity="0"/>' +
						'<stop offset="10%" stop-color="white"/>' +
						'<stop offset="0%" stop-color="white"/>' +
					'</linearGradient>' +
					'<mask id="myMask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">' +
						'<rect fill="url(#myGradient)" x="0" y="0" width="1" height="1"/>' +
					'</mask>' +
				'</svg>');
				var img = $('<div></div>').css({
					width: '100%',
					height: '100%',
					'background-image': this.slider.image1.css('background-image')
				}).css3({
					'transition-duration': '1600ms',
					'transition-timing-function': 'ease-in',
					'transition-property': 'all',
					'mask-image': '-webkit-linear-gradient(left, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 48%, rgba(0,0,0,1) 52%, rgba(0,0,0,1) 100%)',
					'mask-position': '70%',
					'mask-size': '400%'
				});
				
				this.slider.image1.append(img);
				this.slider.image1.append(svgmask);
			},
			execute: function() {
				//return;
				var _this = this,
					img = this.slider.image1.find('div');

				// Get notified when the last transition has completed
				$(img).transitionEnd(function(){
					_this.finished();
				}).get()[0].addEventListener('end', function() {
					_this.finished();
				}, false);

				setTimeout(function(){
					if (flux.browser.supportsCSSProperty('MaskImage')) {
						$(img).css3({
							'mask-position': '30%'
						});
					} else if (flux.browser.supportsCSSProperty('mask')) {
						$(img).css3({
							'mask': 'url(#myMask)',
						});
					}
				}, 50);
			},
			compatibilityCheck: function() {
				return flux.browser.supportsCSSProperty('MaskImage') ||
				       flux.browser.supportsCSSProperty('mask');
			}
		}, opts));
	};
})(window.jQuery || window.Zepto);