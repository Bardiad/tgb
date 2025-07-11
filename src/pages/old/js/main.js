/* JavaScript Boilerplate main scripting file *
 * @version 1.2
 * GIT URL - https://github.com/mdarif/JavaScript-Boilerplate
 * Author - Mohammed Arif
 */

/* app (our namespace name) and undefined are passed here
 * to ensure 1. namespace can be modified locally and isn't
 * overwritten outside of our function context
 * 2. the value of undefined is guaranteed as being truly
 * undefined. This is to avoid issues with undefined being
 * mutable pre-ES5.
 */

(function(app, $, undefined) {
    'use strict';

    $('#site-wrapper').fadeIn(600);
    /**
     * Logging function, for debugging mode
     */
    $.log = function(message) {
        if (app.config.debug && (typeof window.console !== 'undefined' && typeof window.console.log !== 'undefined') && console.debug) {
            console.debug(message);
        }
        /*else {
            alert(message);
        }*/
    };

    /**
     * Angus Croll awesome typeof fix from http://goo.gl/GtvsU
     */
    $.toType = (function toType(global) {
        return function(obj) {
            if (obj === global) {
                return 'global';
            }
            return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
        };
    }(this));

    /**
     * Private properties & Methods
     */
    var scrollThreshold = ($('[data-scrollpost]').first().outerHeight(true) - $('[data-scrollpost]').first().scrollTop()),

    _debounce = function(func, delay) {
        var inDebounce;

        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(inDebounce);
            inDebounce = setTimeout(function(){func.apply(context, args)}, delay);
        }
    },

    _throttle = function (func, limit) {
        var lastFunc, lastRan;

        return function() {
            var context = this;
            var args = arguments;

            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now()
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    },

    _$cachedEls = {
        siteSidebar : $('.l-site__sidebar'),
        navHamburger: $('#nav-hamburger'),
        body: $('body'),
        window: $(window)
    },

    _whichTrans = function () {

        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
          'transition':'transitionend',
          'OTransition':'oTransitionEnd',
          'MozTransition':'transitionend',
          'WebkitTransition':'webkitTransitionEnd'
        }

        for(t in transitions){
            if( el.style[t] !== undefined ){
                return transitions[t];
            }
        }        
    }();     



    /**
     * Public methods and properties
     */


    app.init  = function() {
        _$cachedEls.navHamburger.on('click', function(e){

            _$cachedEls.siteSidebar.toggleClass('is-hidden');

            _whichTrans && _$cachedEls.siteSidebar.one(_whichTrans, function(){
                _$cachedEls.navHamburger.toggleClass('is-close-x');
            });

            _$cachedEls.body.toggleClass('menu-is-open');
        });

        _$cachedEls.window.on('scroll', _throttle(function(e){
            ($(e.currentTarget).scrollTop() > scrollThreshold) ? _$cachedEls.body.addClass('is-scrolling') : _$cachedEls.body.removeClass('is-scrolling');            
        },400));

        _$cachedEls.window.on('resize', _throttle(function(e){
            //Reset scrollpost value
            scrollThreshold = ($('[data-scrollpost]').first().outerHeight(true) - $('[data-scrollpost]').first().scrollTop());
        }, 500))

        $('.copyright .date').html(new Date().getFullYear());      
    }();

    /**
     * Check to evaluate whether 'app' exists in the global namespace - if not, assign window.app an object literal
     */
}(window.app = window.app || {}, jQuery));