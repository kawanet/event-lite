/* jshint esversion:6 */

const assert = require("assert").strict;
const EventLite = require("../event-lite");
const TITLE = __filename.split("/").pop();

events_test();

function events_test() {
  describe(TITLE, function() {
    it("off without on", function() {
      const event = EventLite();
      event.off("foo");
    });

    it("off after off", function() {
      const event = EventLite();
      let count = 0;
      event.on("foo", () => count++);
      event.off("foo");
      event.off("bar");
      event.emit("foo");
      assert.equal(count, 0);
    });
  });
}
