/**
 * event-lite.js - Light-weight EventEmitter (less than 1KB when minified)
 *
 * @copyright Yusuke Kawasaki
 * @license MIT
 * @returns {EventLite}
 * @constructor
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
   * @name EventLite.mixin
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
   * @name EventLite.prototype.on
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite}
   */

  function on(type, func) {
    getListeners(this, type).push(func);
    return this;
  }

  /**
   * Add one-time event listener.
   *
   * @name EventLite.prototype.once
   * @param type {string}
   * @param func {Function}
   * @returns {EventLite}
   */

  function once(type, func) {
    getListeners(this, type).push(wrap);
    return this;

    function wrap() {
      this.off(type, wrap);
      func.apply(this, arguments);
    }
  }

  /**
   * Remove an event listener.
   *
   * @name EventLite.prototype.off
   * @param [type] {string}
   * @param [func] {Function}
   * @returns {EventLite}
   */

  function off(type, func) {
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
  }

  /**
   * Dispatch (trigger) an event.
   *
   * @name EventLite.prototype.emit
   * @param type {string}
   * @param [value] {*}
   * @returns {boolean}
   */

  function emit(type, value) {
    var args = Array.prototype.slice.call(arguments, 1);
    var listeners = getListeners(this, type);
    listeners.forEach(run.bind(this));
    return !!listeners.length;

    function run(func) {
      func.apply(this, args);
    }
  }

  function getListeners(that, type) {
    var listeners = that.listeners || (that.listeners = {});
    return listeners[type] || (listeners[type] = []);
  }

})(EventLite);
