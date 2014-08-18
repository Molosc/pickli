/**
 * Pickli v0.0.2 - Carousel Picker for li tags
 * https://github.com/Molosc/pickli
 *
 * Copyright 2014, Molosc - http://molosc.com - https://github.com/Molosc/
 * 
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */

(function($){

	var defaults = {


		// DATA
		default: null,
        index: -1,
        value: null,
        labelKey: 'label',
        valueKey: 'value',
        autoErase: false,
        data: [],
        remote: {
            url: false,
            type: 'GET',
            data: null,
            loader: null,
            crossDomain: false,
            onRemoteStart: null,
            onRemoteSuccess: null,
            onRemoteError: null
        },

        // STYLES
		size:'100%',
        orientation: 'horizontal',
        wrapperClass: 'pickli',
        selectAlign: 'center',
        unselectAlign: 'center',
        selectClass: 'active',
        unselectClass: '',
        autoResize:false,

		// INTERACTIVITY
        interaction: 'click',
        cursor: 'pointer',
        loop: false,

        // ANIMATION
        transition: {
            duration: 'normal',
            easing: 'swing',
            onTransitionStart: null,
            onTransitionComplete: null
        },

        // CALLBACKS
        onFill: null,
        onChange: null,

        // IN THE FUTUR
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
				pickli.settings.display_prop = 'inline-block';
			} else if (pickli.settings.orientation == 'vertical') {
				pickli.settings.wrapper_whiteSpace = 'normal';
				pickli.settings.wrapper_overflowX = 'auto';
				pickli.settings.wrapper_overflowY = 'hidden';
				pickli.settings.prop_pos = 'top';
				pickli.settings.prop_size = 'height';
				pickli.settings.prop_cliente_size = 'clientHeight';
				pickli.settings.prop_outer_size = 'outerHeight';
				pickli.settings.display_prop = 'block';
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
			pickli.settings.wrapper.addClass(pickli.settings.wrapperClass);

			// interaction
			if (pickli.settings.cursor) self.css( 'cursor', pickli.settings.cursor);
				
			setInteraction();
			setResize();

			initData();

		}

		/**
		 * Initialize the data collection
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


		/**
		 * Call data collection with ajax
		 */
		var remote = function(){
			if (pickli.settings.remote && pickli.settings.remote.url) {
				if (pickli.settings.remote.loader) pickli.settings.remote.loader.show();
				if (pickli.settings.remote.onRemoteStart) pickli.settings.remote.onRemoteStart(); 
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
		 * Fill the slider with the current data collection
		 */
		var fill = function(){
			if (pickli.settings.autoErase) self.empty();
			if (pickli.settings.data) {
				for (var i = 0; i < pickli.settings.data.length; i++) {
					self.append('<li value="'+pickli.settings.data[i][pickli.settings.valueKey]+'" style="display:'+pickli.settings.display_prop+';">'+pickli.settings.data[i][pickli.settings.labelKey]+'</li>');
				}
			}
			if (pickli.settings.onFill) pickli.settings.onFill(pickli.settings.data); 
		}

		/**
		 * Change the selection with a new value
		 *
		 * @param value (string)
		 *  - value of the selected idem
		 *
		 */
		var select = function(value){
			var target = $('li[value="'+value+'"]', self);
			if (target.length > 0) change(target.index());
			else selectDefault();
		}

		/**
		 * Directly change the selection with a new value (without transition)
		 *
		 * @param value (string)
		 *  - value of the selected idem
		 *
		 */
		function selectInPlace(value) {
			var saveTransition = pickli.settings.transition;
			pickli.settings.transition = false;
			select(value);
			refresh();
			pickli.settings.transition = saveTransition;
		}

		/**
		 * Directly change the selection with a new index (without transition)
		 *
		 * @param index (int)
		 *  - index of the selected idem
		 */
		function changeInPlace(index) {
			var saveTransition = pickli.settings.transition;
			pickli.settings.transition = false;
			change(index);
			refresh();
			pickli.settings.transition = saveTransition;
		}

		/**
		 * Change the selection with the default value
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
		 * Change the selection with a new index
		 *
		 * @param index (int)
		 *  - index of the selected idem
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
		 * Refresh the selection of the slider
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
						targetPos = parseInt(pickli.settings.wrapper[pickli.settings.prop_size]()*0.5) - parseInt(getFullSize()*0.5);
					break;
					case 'right':
						targetPos = pickli.settings.wrapper[pickli.settings.prop_size]() - getFullSize();
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
							if (pickli.settings.transition.onPickliAnimateStart) pickli.settings.transition.onTransitionStart();
						}, 
						complete: function() {
							if (pickli.settings.transition.onPickliAnimateComplete) pickli.settings.transition.onTransitionComplete();
						}
					}
				);
			} else {
				self.css(props);
			}
		}


		/**
		 * Get value of the selected item
		 *
		 * @return value (string)
		 *  - Value of the selected idem
		 *
		 */
		var getValue = function(){
			if (pickli.settings.index == null) return null;
			var target = $('li:nth-child('+(pickli.settings.index+1)+')', self);
			if (target.length > 0) return target.attr('value');
			else return null;
		}

		/**
		 * Get the data collection of the slider
		 *
		 * @return data (array)
		 *  - List of elements (exemple:[{label:"Item 1",value:1}, {label:"Item 2",value:2}, ...])
		 */
		var getData = function() {
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
		 * Get the size of all items
		 *
		 * @return size (int)
		 *  - The total size
		 */
		function getFullSize() {
			var w = 0;
			//console.log($('li', target).length);
			$('li', self).each(function() {
				w += $(this)[pickli.settings.prop_outer_size](true);
			});
			return w;
		}

		/**
		 * Update slider interaction events state
		 */
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
		 * Update window resize event state
		 */
		var setResize = function(){
			$(window).off("resize", resizer);
			if (pickli.settings.autoResize) {
				$(window).resize(resizer);
			}
		}
		/**
		 * Function called by window resize event
		 */
		var resizer = function(){
			refresh();
		}




		/**
		 * ===================================================================================
		 * = PUBLIC GETTER / SETTER
		 * ===================================================================================
		 */


		// DATA

		/**
		 * Get or set the value and select the item
		 *
		 * @param value (string or null)
		 *  - The new value
		 *
		 * @return value (string or null)
		 *  - The current value
		 */
		self.value = function(value){
			if (typeof value != 'undefined') select(value);
			return getValue();
		}

		/**
		 * Get or set the index and select the item
		 *
		 * @param index (int or null)
		 *  - The new index
		 *
		 * @return index (int or null)
		 *  - The current index
		 */
		self.index = function(index){
			if (typeof index != 'undefined') change(index);
			return pickli.settings.index;
		}

		/**
		 * The default value
		 *
		 * Used when no value is selected
		 *
		 * @param value (string or null)
		 *  - The new default value
		 *
		 * @return default (string or null)
		 *  - The current default value
		 */
		self.default = function(value){
			if (typeof value != 'undefined') {
				pickli.settings.default = value;
				refresh();
			}
			return pickli.settings.default;
		}

		/**
		 * The key used for the value in data collection
		 *
		 * @param key (string)
		 *  - The new value key
		 *
		 * @return key (string)
		 *  - The current value key
		 */
		self.valueKey = function(key){
			if (typeof key != 'undefined') {
				pickli.settings.valueKey = key;
			}
			return pickli.settings.valueKey;
		}

		/**
		 * The key used for the label in data collection
		 *
		 * @param key (string)
		 *  - The new label key
		 *
		 * @return key (string)
		 *  - The current label key
		 */
		self.labelKey = function(key){
			if (typeof key != 'undefined') {
				pickli.settings.labelKey = key;
			}
			return pickli.settings.labelKey;
		}

		/**
		 * Fill the slider with a collection of elements
		 *
		 * @param p (array)
		 *  - List of elements (exemple:[{label:"Item 1",value:1}, {label:"Item 2",value:2}, ...])
		 *
		 * @return data (array)
		 *  - The current data list
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
		 * Call a JSON collection of elements and fill the slider
		 *
		 * @param p (mixte)
		 *  - URL of the servive (string)
		 *  - Remote settings (object)
		 */
		self.remote = function(p){
			if (typeof p != 'undefined') {
				if (p) {
					if (typeof p == 'string') pickli.settings.remote.url = p;
					else if (typeof p == 'object') pickli.settings.remote = $.extend({}, (pickli.settings.remote) ? pickli.settings.remote : defaults.remote, p);
					else pickli.settings.remote = false;
				} else pickli.settings.remote = false;
			}
			remote();
		}

		/**
		 * Empty the slider or add items when data is updated
		 *
		 * @param p (boolean)
		 *  - true: Empty the list
		 *  - false: Add items to the current list 
		 *
		 * @return autoErase (array)
		 *  - The autoErase value
		 */
		self.autoErase = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.autoErase = p;
			}
			return pickli.settings.autoErase;
		}



		// ASPECT

		/**
		 * Wrapper size
		 *
		 * @param p (string)
		 *  - The new size of the wrapper (example: "100%" / "500px" / "auto" ...)
		 *
		 * @return size (string)
		 *  - The current size
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
		 * Wrapper class
		 *
		 * @param p (string)
		 *  - The new class name for the div wrapper
		 *
		 * @return wrapperClass (string)
		 *  - The current wrapperClass
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
		 * Alignment of selected item
		 *
		 * @param align (string)
		 *  - Position : "left" / "center" / "right"
		 *
		 * @return selectAlign (string)
		 *  - The current alignment
		 */
		self.selectAlign = function(align){
			if (typeof align != 'undefined') {
				pickli.settings.selectAlign = align;
				refresh();
			}
			return pickli.settings.selectAlign;
		}

		/**
		 * Alignment when no item is selected
		 *
		 * @param align (string)
		 *  - Position : "left" / "center" / "right"
		 *
		 * @return unselectAlign (string)
		 *  - The current alignment
		 */
		self.unselectAlign = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.unselectAlign = p;
				refresh();
			}
			return pickli.settings.unselectAlign;
		}

		/**
		 * Class for the selected item
		 *
		 * @param p (string)
		 *  - The class name
		 *
		 * @return selectClass (string)
		 *  - The current selectClass name
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
		 * Class for the unselected items
		 *
		 * @param p (string)
		 *  - The class name
		 *
		 * @return unselectClass (string)
		 *  - The current unselectClass name
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
		 * Refresh the slider on window resize
		 *
		 * @param p (boolean)
		 *  - true: Active window resize listener
		 *  - false: Remove window resize listener
		 *
		 * @return autoResize (boolean)
		 *  - The autoResize value
		 */
		self.autoResize = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.autoResize = p;
				setResize();
				refresh();
			}
			return pickli.settings.autoResize;
		}




		// INTERACTIVITY


		/**
		 * User interaction
		 *
		 * @param p (string)
		 *  - jQuery mouse / touch events (example: "click" / "mouseover" / "click touchstart")
		 *
		 * @return interaction (string)
		 *  - The interaction value
		 */
		self.interaction = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.interaction = p;
				setInteraction();
			}
			return pickli.settings.interaction;
		}
		
		/**
		 * The transition used on change item selection
		 *
		 * @param p (mixte)
		 *  - false: desactive animation (boolean)
		 *  - Transition settings (object)
		 *
		 * @return transition (object)
		 *  - The transition settings
		 */
		self.transition = function(p){
			if (typeof p != 'undefined') {
				if (p && typeof p == 'object') pickli.settings.transition = $.extend({}, (pickli.settings.transition) ? pickli.settings.transition : defaults.transition, p);
				else pickli.settings.transition = p;
			}
			return pickli.settings.transition;
		}
	
		/**
		 * Connect limite slider
		 *
		 *  - true: If index < 0, goto last. If index > last, goto first
		 *  - false: If index < 0, goto first. If index > last, goto last
		 *
		 * @param p (boolean)
		 *  - The new loop value
		 *
		 * @return loop (boolean)
		 *  - The loop value
		 */
		self.loop = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.loop = p;
			}
			return pickli.settings.loop;
		}

		/**
		 * Cursor showed on slider
		 *
		 * @param p (string)
		 *  - A CSS cursor value
		 *
		 * @return cursor (string)
		 *  - The cursor value
		 */
		self.cursor = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.cursor = p;
				if (pickli.settings.cursor) self.css( 'cursor', pickli.settings.cursor);
			}
			return pickli.settings.cursor;
		}


		// EVENTS

		/**
		 * onChange callback event
		 *
		 * - Called when the slider selection change
		 *
		 * @param p (function)
		 *  - A callback function
		 *
		 * @return onChange (function)
		 *  - The onChange function
		 */
		self.onChange = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.onChange = p;
			}
			return pickli.settings.onChange;
		}

		/**
		 * onFill callback event
		 *
		 * - Called when the data collection change
		 *
		 * @param p (function)
		 *  - A callback function
		 *
		 * @return onFill (function)
		 *  - The onFill function
		 */
		self.onFill = function(p){
			if (typeof p != 'undefined') {
				pickli.settings.onFill = p;
			}
			return pickli.settings.onFill;
		}




		/**
		 * ===================================================================================
		 * = PUBLIC FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Select next item
		 */
		self.next = function(){
			if (pickli.settings.index != null) {
				change(pickli.settings.index + 1);
			}
		}

		/**
		 * Select previous item
		 */
		self.prev = function(){
			if (pickli.settings.index != null) {
				change(pickli.settings.index - 1);
			}
		}

		/**
		 * Select first item
		 */
		self.first = function(){
			change(0);
		}

		/**
		 * Select last item
		 */
		self.last = function(){
			change($('li', self).length - 1);
		}

		/**
		 * Jump n item
		 *
		 * @param offset (int)
		 *  - Added (positive) or subtracted (negative) to index
		 */
		self.jump = function(offset){
			change(pickli.settings.index + offset);
		}

		/**
		 * Refresh the selection
		 */
		self.refresh = function(){
			refresh();
		}


		// launch
		init();

		// returns the current jQuery object
		return this;
	}

})(jQuery);
