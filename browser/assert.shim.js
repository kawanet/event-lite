// Browser-side shim for node:assert. The test bundle receives it as the
// global `assert`, and the suites reach it as `require("assert").strict`,
// so `strict` points back at the same surface.

var assert = (function() {
  var strict = {
    // Truthy check. Mirrors `assert.ok(value, message?)` in node:assert.
    ok: function(value, message) {
      if (!value) {
        throw new Error(message || "expected truthy, got " + JSON.stringify(value));
      }
    },

    // node:assert/strict-compatible `equal`. Uses `Object.is`
    // semantics, matching Node — so `equal(NaN, NaN)` passes and
    // `equal(0, -0)` fails, both opposite of `===`.
    equal: function(actual, expected, message) {
      if (!Object.is(actual, expected)) {
        throw new Error(message || "expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
      }
    }
  };

  strict.strict = strict;
  return strict;
})();
