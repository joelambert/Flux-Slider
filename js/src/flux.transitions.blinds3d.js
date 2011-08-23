(function($) {
	flux.transitions.blinds3d = function(fluxslider, opts) {
		return new flux.transitions.tiles3d(fluxslider, $.extend({
			forceSquare: false,
			rows: 1,
			columns: 6
		}, opts));
	};
})(window.jQuery || window.Zepto);