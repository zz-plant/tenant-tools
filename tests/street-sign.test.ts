import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { streetSignParts } from "../src/lib/streetSign";

describe("streetSignParts", () => {
  it("splits a Chicago grid address", () => {
    assert.deepEqual(streetSignParts("2400 W Wabansia"), { street: "Wabansia", block: "2400", direction: "W" });
    assert.deepEqual(streetSignParts(" 1801 n. Milwaukee Ave "), { street: "Milwaukee", block: "1801", direction: "N", suffix: "Ave" });
    assert.deepEqual(streetSignParts("400 S Dr Martin Luther King Jr Dr"), {
      street: "Dr Martin Luther King Jr",
      block: "400",
      direction: "S",
      suffix: "Dr",
    });
  });

  it("keeps any other address whole", () => {
    assert.deepEqual(streetSignParts("Our building"), { street: "Our building" });
  });
});
