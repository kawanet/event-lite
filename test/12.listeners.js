/* jshint esversion:6 */

const assert = require("node:assert").strict;
const {describe, it} = require("node:test");
const EventLite = require("../event-lite");
const TITLE = "12.listeners.js";

events_test();

function events_test() {
  describe(TITLE, function() {

    it("on() adds listeners property", function() {
      const event = EventLite();
      event.on("foo");
      assert.ok(event.listeners instanceof Object, "listeners property should be an Object");
      assert.ok(event.listeners.foo instanceof Array, "listeners.foo property should be an Array");
    });

    it("emit() should NOT add listeners property", function() {
      const event = EventLite();
      event.emit("foo");
      assert.equal(!!event.listeners, false, "listeners property should NOT exist");
    });

    it("off() should removes listeners property", function() {
      const event = EventLite();
      event.on("foo", NOP);
      event.off("foo", NOP);
      assert.equal(!!event.listeners, false, "listeners property should be removed");
    });

    it("off() should treat \"\" as a valid event name", function() {
      const event = EventLite();
      event.on("", NOP);
      event.on("foo", NOP);
      event.off("");
      assert.ok(event.listeners instanceof Object, "listeners property should be an Object");
      assert.equal(!!event.listeners[""], false, "the \"\" event should be removed");
      assert.equal(event.listeners.foo.length, 1, "the \"foo\" event should have one listener");
    });

    it("off() should remove listeners that were added by once()", function() {
      const event = EventLite();
      event.once("foo", NOP);
      event.off("foo", NOP);
      assert.equal(!!event.listeners, false, "listeners property should be removed");
    });
  });
}

function NOP() {
}
