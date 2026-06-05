import assert from "node:assert/strict";
import test from "node:test";

import { calculateContinuityFlow, fluidDynamicsEquationOptions } from "../src/lib/waterEquations";

test("continuity equation converts diameter and velocity into cfs, gpm, and MGD", () => {
  const result = calculateContinuityFlow({ diameterInches: 12, velocityFeetPerSecond: 2 });

  assert.equal(result.diameterFeet, 1);
  assert.equal(result.radiusFeet, 0.5);
  assert.ok(Math.abs(result.areaSquareFeet - 0.785398) < 0.00001);
  assert.ok(Math.abs(result.flowCubicFeetPerSecond - 1.570796) < 0.00001);
  assert.ok(Math.abs(result.flowGallonsPerMinute - 705.022) < 0.01);
  assert.ok(Math.abs(result.flowMillionGallonsPerDay - 1.0153) < 0.001);
});

test("equation selector starts with the continuity flow relationship", () => {
  assert.deepEqual(fluidDynamicsEquationOptions.map((equation) => equation.id), ["continuity-flow"]);
  assert.match(fluidDynamicsEquationOptions[0].formula, /Q = A/);
});
