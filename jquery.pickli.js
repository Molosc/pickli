/**
 * Pickli v0.0.0 - Li Picker
 * https://github.com/Molosc/pickli
 *
 * Copyright 2014, Molosc - http://molosc.com - https://github.com/Molosc/
 * 
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */

(function($){

	var plugin = {};

	var defaults = {

		// GENERAL
		size:'100%',
        orientation: 'horizontal',
        resize:false,
        selectAlign: 'center',
        unselectAlign: 'center',
        interaction: 'click',
        cursor: 'pointer',

		// DATA
		default: null,
        value: null,
        labelKey: 'label',
        valueKey: 'value',
        erase: false,
        data: [],
        remote: {
            url: '',
            onRemoteError: null,
            onRemoteLoad: null
        },

        // STYLES
        wrapperClass: 'pickli',
        selectClass: 'active',
        unselectClass: '',

        // ANIMATION
        animate: {
            duration: 'normal',
            easing: 'swing',
            onAnimateStart: null,
            onAnimateComplete: null
        },

        // CALLBACKS
        onChange: null
	}

	$.fn.pickli = function(options){

		if(this.length == 0) return this;

		// support mutltiple elements
		if(this.length > 1){
			this.each(function(){$(this).pickli(options)});
			return this;
		}

		// create a namespace to be used throughout the plugin
		var pickli = {};
		// set a reference to our slider element
		var el = this;
		//plugin.el = this;


		/**
		 * ===================================================================================
		 * = PRIVATE FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Initializes namespace settings to be used throughout plugin
		 */
		var init = function(){
			// merge user-supplied options with the defaults
			pickli.settings = $.extend({}, defaults, options);

			pickli.div = null;
			pickli.index = -1;

			// perform all DOM / CSS modifications
			setup();
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var setup = function(){

			// container
			el.wrap('<div></div>');

			pickli.div = el.parent();
			pickli.div.css({
				'white-space': 'nowrap',
				'overflow-x': 'hidden',
				'margin': '0px',
				'padding': '0px',
				'width': pickli.settings.size
			});
			//div.addClass('pickli');
			pickli.div.addClass(pickli.settings.wrapperClass);



			// interaction
			if (pickli.settings.cursor) {
				el.css( 'cursor', pickli.settings.cursor);
			}
			if (pickli.settings.interaction) {

				var events = pickli.settings.interaction.split(' ');
				for (var i = events.length - 1; i >= 0; i--) {
					events[i] = events[i]+'.pickli';
				};

				el.on(events.join(' '), 'li', function(){
					change($(this).index());
				});
			}


			if (pickli.settings.resize) {
				$(window).resize(function() {
					refresh();
				});
			}
			
			initData();

		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var initData = function(){
			
			if (!pickli.settings.data) pickli.settings.data = [];

			if ($('li', el).length > 0) {
				var lis = [];
				$('li', el).each(function() {
					var obj = {};
					obj[pickli.settings.labelKey] = $(this).html();
					obj[pickli.settings.valueKey] = $(this).attr('value');
					lis.push(obj);
				});
				pickli.settings.data = $.merge(lis, pickli.settings.data);
				el.empty();
			}


			fill();
			
			// data remote
			if (pickli.settings.remote) {
				remote();
			}

			select(pickli.settings.value);

		}
		function getData() {
			var data = [];
			if ($('li', el).length > 0) {
				$('li', el).each(function() {
					var obj = {};
					obj[pickli.settings.labelKey] = $(this).html();
					obj[pickli.settings.valueKey] = $(this).attr('value');
					data.push(obj);
				});
			}
			return data;
		}



		/**
		 * Performs all DOM and CSS modifications
		 */
		var remote = function(){
			//if (pickli.settings.erase) el.empty();
			
		}


		/**
		 * Performs all DOM and CSS modifications
		 */
		var fill = function(){
			if (pickli.settings.erase) el.empty();
			if (pickli.settings.data) {
				for (var i = 0; i < pickli.settings.data.length; i++) {
					el.append('<li value="'+pickli.settings.data[i][pickli.settings.valueKey]+'">'+pickli.settings.data[i][pickli.settings.labelKey]+'</li>');
				}
			}
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var getValue = function(){
			if (pickli.index == null) return null;
			var target = $('li:nth-child('+(pickli.index+1)+')', el);
			if (target.length > 0) return target.attr('value');
			else return null;
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var select = function(value){
			var target = $('li[value="'+value+'"]', el);
			if (target.length > 0) change(target.index());
			else selectDefault();
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var selectDefault = function(){
			var target = $('li[value="'+pickli.settings.default+'"]', el);
			if (target.length > 0) change(target.index());
			else {
				pickli.settings.defaults = null;
				change(null);
			}
		}



		/**
		 * Performs all DOM and CSS modifications
		 */
		var change = function(index){

			if (index < 0) index = 0;
			else if (index >= $('li', el).length) index = $('li', el).length - 1;

			if (index !== pickli.index) {
				pickli.index = index;
				refresh();
				if (pickli.settings.onChange) pickli.settings.onChange(getValue());
			}
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var refresh = function(){
			
			var index = pickli.index;

			var targetPos = 0;

			$('li', el).removeClass(pickli.settings.selectClass).addClass(pickli.settings.unselectClass);

			if (index != null && index >= 0) {

				var li = $('li:nth-child('+(index+1)+')', el);
				var x = li.position().left - pickli.div.position().left - (el.css('marginLeft').replace("px", ""));

				switch (pickli.settings.selectAlign) {
					case 'left':
						targetPos = -x;
					break;
					case 'center':
						targetPos = parseInt(pickli.div.width()*0.5) - x - parseInt(li[0].clientWidth*0.5);
					break;
					case 'right':
						targetPos = pickli.div.width() - x - li[0].clientWidth;
					break;
				}

				li.removeClass(pickli.settings.unselectClass).addClass(pickli.settings.selectClass);

			} else {

				switch (pickli.settings.unselectAlign) {
					case 'left':
						targetPos = 0;
					break;
					case 'center':
						targetPos = parseInt(pickli.div.width()*0.5) - parseInt(fullWidth()*0.5);
					break;
					case 'right':
						targetPos = pickli.div.width() - fullWidth();
					break;
				}
			}

			if (pickli.settings.animate) {
				el.stop(true, false).animate(	
					{
						marginLeft:targetPos
					}, 
					{
						duration: pickli.settings.animate.duration, 
						easing: pickli.settings.animate.easing, 
						start: function() {
							if (pickli.settings.animate.onPickliAnimateStart) pickli.settings.animate.onAnimateStart();
						}, 
						complete: function() {
							if (pickli.settings.animate.onPickliAnimateComplete) pickli.settings.animate.onAnimateComplete();
						}
					}
				);
			} else {
				el.css({marginLeft:targetPos+'px'});
			}
		}

		function fullWidth() {
			var w = 0;
			//console.log($('li', target).length);
			$('li', el).each(function() {
				w += $(this).outerWidth(true);
			});
			return w;
		}

		/**
		 * ===================================================================================
		 * = PUBLIC FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Performs slide transition to the specified slide
		 *
		 * @param slideIndex (int)
		 *  - the destination slide's index (zero-based)
		 *
		 * @param direction (string)
		 *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
		 */
		el.value = function(value){
			if (typeof value != 'undefined') select(value);
			return getValue();
		}

		/**
		 * Transitions to the next slide in the show
		 */
		el.index = function(index){
			if (typeof index != 'undefined') change(index);
			return pickli.index;
		}

		/**
		 * Transitions to the next slide in the show
		 */
		el.selectAlign = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.selectAlign = p;
				refresh();
			}
			return pickli.settings.selectAlign;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		el.unselectAlign = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.unselectAlign = p;
				refresh();
			}
			return pickli.settings.unselectAlign;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		el.default = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.default = p;
				refresh();
			}
			return pickli.settings.default;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		el.data = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.data = p;
				fill();
				refresh();
			}
			return getData();
		}







		/**
		 * Transitions to the next slide in the show
		 */
		el.next = function(){
			if (pickli.index != null) {
				change(pickli.index + 1);
			}
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		el.prev = function(){
			if (pickli.index != null) {
				change(pickli.index - 1);
			}
		}

		/**
		 * Transitions to the next slide in the show
		 */
		el.first = function(){
			change(0);
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		el.last = function(){
			change($('li', el).length - 1);
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		el.jump = function(p){
			change(pickli.index + p);
		}


		init();

		// returns the current jQuery object
		return this;
	}

})(jQuery);
