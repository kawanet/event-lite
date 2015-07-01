/**
 * event-lite.js - Light-weight EventEmitter (less than 1KB when minified)
 *
 * @copyright Yusuke Kawasaki
 * @license MIT
 * @returns {EventLite}
 * @constructor
 */

function EventLite() {
  if (!(this instanceof EventLite)) return new EventLite();
}

(function(EventLite) {
  // export the class for node.js
  if ("undefined" !== typeof module) module.exports = EventLite;

  // export mixin function
  EventLite.mixin = mixin;

  /**
   * Import on(), once(), off() and emit() methods into target object.
   *
   * @name EventLite.mixin
   * @param target {Prototype}
   */

  function mixin(target) {
    var source = EventLite.prototype;
    for (var key in source) {
      target[key] = source[key];
    }
    return target;
  }

  /**
   * Add an event listner.
   *
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite}
   */

  EventLite.prototype.on = function(type, func) {
    getListeners(this, type).push(func);
    return this;
  };

  /**
   * Add one-time event listner.
   *
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite}
   */

  EventLite.prototype.once = function(type, func) {
    getListeners(this, type).push(wrap);
    return this;

    function wrap() {
      this.off(type, wrap);
      func.apply(this, arguments);
    }
  };

  /**
   * Remove an event listener.
   *
   * @param [type] {string}
   * @param [func] {Function}
   * @returns {EventLite}
   */

  EventLite.prototype.off = function(type, func) {
    var listners = getListeners(this, type);
    if (!type) {
      delete this.listeners;
    } else if (!func) {
      delete this.listeners[type];
    } else {
      this.listeners[type] = listners.filter(ne);
    }
    return this;

    function ne(test) {
      return test !== func;
    }
  };

  /**
   * Event emitter.
   *
   * @param type {string}
   * @param [value] {*}
   * @returns {boolean}
   */

  EventLite.prototype.emit = function(type, value) {
    var args = Array.prototype.slice.call(arguments, 1);
    var listeners = getListeners(this, type);
    listeners.forEach(run.bind(this));
    return !!listeners.length;

    function run(func) {
      func.apply(this, args);
    }
  };

  function getListeners(that, type) {
    var listeners = that.listeners || (that.listeners = {});
    return listeners[type] || (listeners[type] = []);
  }

})(EventLite);
