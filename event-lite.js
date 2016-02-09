/**
 * event-lite.js - Light-weight EventEmitter (less than 1KB when minified)
 *
 * @copyright Yusuke Kawasaki
 * @license MIT
 * @constructor
 * @see https://github.com/kawanet/event-lite
 * @see http://kawanet.github.io/event-lite/EventLite.html
 * @example
 * var EventLite = require("event-lite");
 *
 * function MyClass() {...}             // your class
 *
 * EventLite.mixin(MyClass.prototype);  // import event methods
 *
 * var obj = new MyClass();
 * obj.on("foo", function() {...});     // add event listener
 * obj.once("bar", function() {...});   // add one-time event listener
 * obj.emit("foo");                     // dispatch event
 * obj.emit("bar");                     // dispatch another event
 * obj.off("foo");                      // remove event listener
 */

function EventLite() {
  if (!(this instanceof EventLite)) return new EventLite();
}

(function(EventLite) {
  // export the class for node.js
  if ("undefined" !== typeof module) module.exports = EventLite;

  // property name to hold listeners
  var LISTENERS = "listeners";

  // methods to export
  var methods = {
    on: on,
    once: once,
    off: off,
    emit: emit
  };

  // mixin to self
  mixin(EventLite.prototype);

  // export mixin function
  EventLite.mixin = mixin;

  /**
   * Import on(), once(), off() and emit() methods into target object.
   *
   * @function EventLite.mixin
   * @param target {Prototype}
   */

  function mixin(target) {
    for (var key in methods) {
      target[key] = methods[key];
    }
    return target;
  }

  /**
   * Add an event listener.
   *
   * @function EventLite.prototype.on
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite} Self for method chaining
   */

  function on(type, func) {
    newListener(this, type, func);
    return this;
  }

  /**
   * Add one-time event listener.
   *
   * @function EventLite.prototype.once
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite} Self for method chaining
   */

  function once(type, func) {
    var that = this;
    newListener(that, type, wrap);
    return that;

    function wrap() {
      off.call(that, type, wrap);
      func.apply(this, arguments);
    }
  }

  /**
   * Remove an event listener.
   *
   * @function EventLite.prototype.off
   * @param [type] {string}
   * @param [func] {Function}
   * @returns {EventLite} Self for method chaining
   */

  function off(type, func) {
    var that = this;
    var listners;
    if (!arguments.length) {
      delete that[LISTENERS];
    } else if (!func) {
      listners = that[LISTENERS];
      if (listners) {
        delete listners[type];
        if (!Object.keys(listners).length) return off.call(that);
      }
    } else {
      listners = getListeners(that, type);
      if (listners) {
        if (listners === func) {
          return off.call(that, type);
        } else {
          var index = listners.indexOf(func);
          if (index >= 0) {
            if (listners.length === 2) {
              that[LISTENERS][type] = index === 0 ? listners[1] : listners[0];
            } else {
              listners.splice(index, 1);
            }
          }
        }
      }
    }
    return that;
  }

  /**
   * Dispatch (trigger) an event.
   *
   * @function EventLite.prototype.emit
   * @param type {string}
   * @param [value] {*}
   * @returns {boolean} True when a listener received the event
   */

  function emit(type, value1, value2) {
    var that = this;
    var listeners = getListeners(that, type);
    if (!listeners) return false;
    var args;
    var arglen = arguments.length;
    var invoker = arglen === 1 ? emitnone :
                  arglen === 2 ? emitone :
                  arglen === 3 ? emittwo :
                  (args = copy(arguments, 1), emitmany);
    if (typeof listeners === 'function') {
      invoker(that, listeners, value1, value2, args);
      return true;
    }
    listeners = copy(listeners, 0);
    for (var i = 0, len = listeners.length; i < len; i++) {
      invoker(that, listeners[i], value1, value2, args);
    }
    return !!len;
  }

  /**
   * @ignore
   */

  function emitnone(that, listener) {
    // I use return here to take advantage of ES6 tail-call optimization.
    return listener.call(that);
  }

  /**
   * @ignore
   */

  function emitone(that, listener, value) {
    return listener.call(that, value);
  }

  /**
   * @ignore
   */

  function emittwo(that, listener, value1, value2) {
    return listener.call(that, value1, value2);
  }

  /**
   * @ignore
   */

  function emitmany(that, listener, value1, value2, args) {
    return listener.apply(that, args);
  }

  /**
   * @ignore
   */

  function copy(arr, start) {
    var len = arr.length - start;
    var ret = new Array(len);
    for (var i = 0; i < len; i++) {ret[i] = arr[i + start];}
    return ret;
  }

  /**
   * @ignore
   */

  function getListeners(that, type) {
    return that[LISTENERS] && that[LISTENERS][type];
  }

  /**
   * @ignore
   */

  function newListener(that, type, func) {
    var listeners = that[LISTENERS] || (that[LISTENERS] = {});
    var ofType = listeners[type];
    if (!ofType) {
      listeners[type] = func;
    } else if (typeof ofType === 'function') {
      listeners[type] = [ofType, func];
    } else {
      listeners[type].push(func);
    }
  }

})(EventLite);
