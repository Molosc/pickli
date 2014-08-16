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

	var defaults = {

		// GENERAL
		size:'100%',
        orientation: 'horizontal',
        resize:false,
        selectAlign: 'center',
        unselectAlign: 'center',
        interaction: 'click',
        cursor: 'pointer',
        loop: false,

		// DATA
		default: null,
        index: -1,
        value: null,
        labelKey: 'label',
        valueKey: 'value',
        erase: false,
        data: [],
        remote: {
            url: false,
            loader: null,
            type: 'GET',
            data: null,
            crossDomain: false,
            onRemoteError: null,
            onRemoteSuccess: null
        },

        // STYLES
        wrapperClass: 'pickli',
        selectClass: 'active',
        unselectClass: '',

        // ANIMATION
        transition: {
            duration: 'normal',
            easing: 'swing',
            onAnimateStart: null,
            onAnimateComplete: null
        },

        // CALLBACKS
        onChange: null,

        // FOR THE FUTUR
        infinite: false
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
		var self = this;


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

			pickli.settings.wrapper = null;
			if (pickli.settings.orientation == 'horizontal') {
				pickli.settings.wrapper_whiteSpace = 'nowrap';
				pickli.settings.wrapper_overflowX = 'hidden';
				pickli.settings.wrapper_overflowY = 'auto';
				pickli.settings.prop_pos = 'left';
				pickli.settings.prop_size = 'width';
				pickli.settings.prop_cliente_size = 'clientWidth';
				pickli.settings.prop_outer_size = 'outerWidth';
			} else if (pickli.settings.orientation == 'vertical') {
				pickli.settings.wrapper_whiteSpace = 'normal';
				pickli.settings.wrapper_overflowX = 'auto';
				pickli.settings.wrapper_overflowY = 'hidden';
				pickli.settings.prop_pos = 'top';
				pickli.settings.prop_size = 'height';
				pickli.settings.prop_cliente_size = 'clientHeight';
				pickli.settings.prop_outer_size = 'outerHeight';
			}

			// perform all DOM / CSS modifications
			setup();
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var setup = function(){

			// container
			self.wrap('<div></div>');

			pickli.settings.wrapper = self.parent();
			pickli.settings.wrapper.css({
				'white-space': pickli.settings.wrapper_whiteSpace,
				'overflow-x': pickli.settings.wrapper_overflowX,
				'overflow-y': pickli.settings.wrapper_overflowY,
				'margin': '0px',
				'padding': '0px'
			});
			pickli.settings.wrapper.css(pickli.settings.prop_size, pickli.settings.size);
			//div.addClass('pickli');
			pickli.settings.wrapper.addClass(pickli.settings.wrapperClass);



			// interaction
			if (pickli.settings.cursor) {
				self.css( 'cursor', pickli.settings.cursor);
			}

				
			setInteraction();
			setResize();
			initData();

		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var initData = function(){
			
			if (!pickli.settings.data) pickli.settings.data = [];

			if ($('li', self).length > 0) {
				var lis = [];
				$('li', self).each(function() {
					var obj = {};
					obj[pickli.settings.labelKey] = $(this).html();
					obj[pickli.settings.valueKey] = $(this).attr('value');
					lis.push(obj);
				});
				pickli.settings.data = $.merge(lis, pickli.settings.data);
				self.empty();
			}

			
			
			fill();
			remote();

			if (pickli.settings.index >= 0) changeInPlace(pickli.settings.index);
			else selectInPlace(pickli.settings.value);

		}
		function getData() {
			var data = [];
			if ($('li', self).length > 0) {
				$('li', self).each(function() {
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
			if (pickli.settings.remote && pickli.settings.remote.url) {
				if (pickli.settings.remote.loader) pickli.settings.remote.loader.show();
				$.ajax({
					url: pickli.settings.remote.url,
					type: pickli.settings.remote.type,
					data: pickli.settings.remote.data,
					crossDomain: pickli.settings.remote.crossDomain,
					success: function(data) {
						pickli.settings.data = data;
						fill();

						selectInPlace(pickli.settings.value);

						if (pickli.settings.remote.loader) pickli.settings.remote.loader.hide();
						if (pickli.settings.remote.onRemoteSuccess) pickli.settings.remote.onRemoteSuccess(data); 
					},
					error: function(e) {
						if (pickli.settings.remote.loader) pickli.settings.remote.loader.hide();
						if (pickli.settings.remote.onRemoteError) pickli.settings.remote.onRemoteError(e); 
					}
				});    
			}
		}


		/**
		 * Performs all DOM and CSS modifications
		 */
		var fill = function(){
			if (pickli.settings.erase) self.empty();
			if (pickli.settings.data) {
				for (var i = 0; i < pickli.settings.data.length; i++) {
					self.append('<li value="'+pickli.settings.data[i][pickli.settings.valueKey]+'">'+pickli.settings.data[i][pickli.settings.labelKey]+'</li>');
				}
			}
		}



		/**
		 * Performs all DOM and CSS modifications
		 */
		var getValue = function(){
			if (pickli.settings.index == null) return null;
			var target = $('li:nth-child('+(pickli.settings.index+1)+')', self);
			if (target.length > 0) return target.attr('value');
			else return null;
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var select = function(value){
			var target = $('li[value="'+value+'"]', self);
			if (target.length > 0) change(target.index());
			else selectDefault();
		}

		function selectInPlace(value) {
			var saveTransition = pickli.settings.transition;
			pickli.settings.transition = false;
			select(value);
			refresh();
			pickli.settings.transition = saveTransition;
		}
		function changeInPlace(index) {
			var saveTransition = pickli.settings.transition;
			pickli.settings.transition = false;
			change(index);
			refresh();
			pickli.settings.transition = saveTransition;
		}
		/**
		 * Performs all DOM and CSS modifications
		 */
		var selectDefault = function(){
			var target = $('li[value="'+pickli.settings.default+'"]', self);
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

			if (index < 0) index = pickli.settings.loop ? $('li', self).length - 1 : 0 ;
			else if (index >= $('li', self).length) index = pickli.settings.loop ? 0 : $('li', self).length - 1;

			if (index !== pickli.settings.index) {
				pickli.settings.index = index;
				refresh();
				if (pickli.settings.onChange) pickli.settings.onChange(getValue());
			}
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var refresh = function(){
			
			var index = pickli.settings.index;

			var targetPos = 0;

			$('li', self).removeClass(pickli.settings.selectClass).addClass(pickli.settings.unselectClass);

			if (index != null && index >= 0) {

				var li = $('li:nth-child('+(index+1)+')', self);
				var pos = li.position()[pickli.settings.prop_pos] - pickli.settings.wrapper.position()[pickli.settings.prop_pos] - (self.css('margin-'+pickli.settings.prop_pos).replace("px", ""));

				switch (pickli.settings.selectAlign) {
					case 'left':
						targetPos = -pos;
					break;
					case 'center':
						targetPos = parseInt(pickli.settings.wrapper[pickli.settings.prop_size]()*0.5) - pos - parseInt(li[0][pickli.settings.prop_cliente_size]*0.5);
					break;
					case 'right':
						targetPos = pickli.settings.wrapper[pickli.settings.prop_size]() - pos - li[0][pickli.settings.prop_cliente_size];
					break;
				}

				li.removeClass(pickli.settings.unselectClass).addClass(pickli.settings.selectClass);

			} else {

				switch (pickli.settings.unselectAlign) {
					case 'left':
						targetPos = 0;
					break;
					case 'center':
						targetPos = parseInt(pickli.settings.wrapper[pickli.settings.prop_size]()*0.5) - parseInt(fullSize()*0.5);
					break;
					case 'right':
						targetPos = pickli.settings.wrapper[pickli.settings.prop_size]() - fullSize();
					break;
				}
			}

			var props = {};
			props['margin-'+pickli.settings.prop_pos] = targetPos+'px';
			if (pickli.settings.transition) {
				self.stop(true, false).animate(	
					props, 
					{
						duration: pickli.settings.transition.duration, 
						easing: pickli.settings.transition.easing, 
						start: function() {
							if (pickli.settings.transition.onPickliAnimateStart) pickli.settings.transition.onAnimateStart();
						}, 
						complete: function() {
							if (pickli.settings.transition.onPickliAnimateComplete) pickli.settings.transition.onAnimateComplete();
						}
					}
				);
			} else {
				self.css(props);
			}
		}

		function fullSize() {
			var w = 0;
			//console.log($('li', target).length);
			$('li', self).each(function() {
				w += $(this)[pickli.settings.prop_outer_size](true);
			});
			return w;
		}

		var setInteraction = function() {
			self.off();
			if (pickli.settings.interaction) {
				var events = pickli.settings.interaction.split(' ');
				for (var i = events.length - 1; i >= 0; i--) {
					events[i] = events[i]+'.pickli';
				};

				self.on(events.join(' '), 'li', function(){
					change($(this).index());
				});
			}
		}
		/**
		 * Performs all DOM and CSS modifications
		 */
		var setResize = function(){
			$(window).off("resize", resizer);
			if (pickli.settings.resize) {
				$(window).resize(resizer);
			}
		}
		/**
		 * Performs all DOM and CSS modifications
		 */
		var resizer = function(){
			refresh();
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
		self.value = function(value){
			if (typeof value != 'undefined') select(value);
			return getValue();
		}

		/**
		 * Transitions to the next slide in the show
		 */
		self.index = function(index){
			if (typeof index != 'undefined') change(index);
			return pickli.settings.index;
		}

		/**
		 * Transitions to the next slide in the show
		 */
		self.selectAlign = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.selectAlign = p;
				refresh();
			}
			return pickli.settings.selectAlign;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.unselectAlign = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.unselectAlign = p;
				refresh();
			}
			return pickli.settings.unselectAlign;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.default = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.default = p;
				refresh();
			}
			return pickli.settings.default;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.size = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.size = p;
				pickli.settings.wrapper.css('width', pickli.settings.size);
				refresh();
			}
			return pickli.settings.size;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.data = function(p){
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
		self.resize = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.resize = p;
				setResize();
				refresh();
			}
			return pickli.settings.resize;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.interaction = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.interaction = p;
				setInteraction();
			}
			return pickli.settings.interaction;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.cursor = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.cursor = p;
				if (pickli.settings.cursor) self.css( 'cursor', pickli.settings.cursor);
			}
			return pickli.settings.cursor;
		}


		/**
		 * Transitions to the next slide in the show
		 */
		self.wrapperClass = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.wrapper.removeClass(pickli.settings.wrapperClass);
				pickli.settings.wrapperClass = p;
				pickli.settings.wrapper.addClass(pickli.settings.wrapperClass);
				refresh();
			}
			return pickli.settings.wrapperClass;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.selectClass = function(p){
			if (typeof p != 'undefined') {
				$('li', self).removeClass(pickli.settings.selectClass);
				pickli.settings.selectClass = p;
				refresh();
			}
			return pickli.settings.selectClass;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.unselectClass = function(p){
			if (typeof p != 'undefined') {
				$('li', self).removeClass(pickli.settings.unselectClass);
				pickli.settings.unselectClass = p;
				refresh();
			}
			return pickli.settings.unselectClass;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.erase = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.erase = p;
			}
			return pickli.settings.erase;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.valueKey = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.valueKey = p;
			}
			return pickli.settings.valueKey;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.labelKey = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.labelKey = p;
			}
			return pickli.settings.labelKey;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		/**
		 * Transitions to the next slide in the show
		 */
		self.loop = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.loop = p;
			}
			return pickli.settings.loop;
		}
		/**
		 * Transitions to the next slide in the show
		 */
		self.onChange = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.onChange = p;
			}
			return pickli.settings.onChange;
		}
		
		self.transition = function(p){
			if (typeof p != 'undefined') {
				if (p && typeof p == 'object') pickli.settings.transition = $.extend({}, (pickli.settings.transition) ? pickli.settings.transition : defaults.transition, p);
				else pickli.settings.transition = p;
			}
			return pickli.settings.transition;
		}
		self.remote = function(p){
			if (typeof p != 'undefined') {
				if (p && typeof p == 'object') pickli.settings.remote = $.extend({}, (pickli.settings.remote) ? pickli.settings.remote : defaults.remote, p);
				else pickli.settings.remote = p;
			}
			remote();
		}
	



		/**
		 * Transitions to the next slide in the show
		 */
		self.next = function(){
			if (pickli.settings.index != null) {
				change(pickli.settings.index + 1);
			}
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		self.prev = function(){
			if (pickli.settings.index != null) {
				change(pickli.settings.index - 1);
			}
		}

		/**
		 * Transitions to the next slide in the show
		 */
		self.first = function(){
			change(0);
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		self.last = function(){
			change($('li', self).length - 1);
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		self.jump = function(p){
			change(pickli.settings.index + p);
		}
		/**
		 * Transitions to the prev slide in the show
		 */
		self.refresh = function(){
			refresh();
		}



		init();

		// returns the current jQuery object
		return this;
	}

})(jQuery);
