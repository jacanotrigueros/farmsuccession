import assert from "node:assert/strict";
import { test } from "node:test";

import { dismissTerritoryPicker } from "../public/territory-picker.js";

test("Escape closes an open territory picker and restores focus from its options", () => {
  let focused = false;
  let prevented = false;
  const picker = {
    open: true,
    querySelector: (selector: string) => {
      assert.equal(selector, "summary", "Escape must return to the control that opens the picker");
      return {
        focus: () => {
          focused = true;
        },
      };
    },
  };
  const event = {
    key: "Enter",
    currentTarget: picker,
    preventDefault: () => {
      prevented = true;
    },
  };
  dismissTerritoryPicker(event, picker);
  assert.ok(picker.open && !focused, "other keys must keep the native interaction");
  dismissTerritoryPicker({ ...event, key: "Escape" }, picker);
  assert.ok(!picker.open && focused && prevented, "Escape must dismiss the picker without leaving focus in the hidden menu");
  focused = false;
  dismissTerritoryPicker({ ...event, key: "Escape" }, picker);
  assert.equal(focused, false, "a closed picker must not intercept Escape");
});
