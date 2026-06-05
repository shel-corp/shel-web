import assert from "node:assert/strict";
import test from "node:test";

import { calculateContinuityFlow, calculateHazenWilliamsHeadLoss, calculatePipeVisualSizePercent, fluidDynamicsEquationOptions } from "../src/lib/waterEquations";

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
  assert.deepEqual(fluidDynamicsEquationOptions.map((equation) => equation.id), ["continuity-flow", "hazen-williams-head-loss"]);
  assert.match(fluidDynamicsEquationOptions[0].formula, /Q = A/);
});

test("Hazen-Williams explains where empirical constants came from", () => {
  const hazenWilliams = fluidDynamicsEquationOptions.find((equation) => equation.id === "hazen-williams-head-loss");

  assert.ok(hazenWilliams?.coefficientOrigin?.includes("measured pressure loss"));
  assert.ok(hazenWilliams?.coefficientOrigin?.includes("power-law curve"));
  assert.ok(hazenWilliams?.coefficientOrigin?.includes("curve-fit slopes"));
});

test("pipe visual uses a bounded logarithmic scale", () => {
  const oneInch = calculatePipeVisualSizePercent(1);
  const twelveInch = calculatePipeVisualSizePercent(12);
  const twentyFourInch = calculatePipeVisualSizePercent(24);

  assert.equal(oneInch, calculatePipeVisualSizePercent(0));
  assert.equal(twentyFourInch, calculatePipeVisualSizePercent(99));
  assert.ok(oneInch >= 14);
  assert.ok(twentyFourInch <= 88);
  assert.ok(oneInch < twelveInch);
  assert.ok(twelveInch < twentyFourInch);
  assert.ok(twelveInch > 51, "log scale should make mid-range diameters legible");
});


test("Hazen-Williams equation calculates head loss from gpm, pipe, C factor, and length", () => {
  const result = calculateHazenWilliamsHeadLoss({
    flowGallonsPerMinute: 1000,
    diameterInches: 8,
    hazenWilliamsC: 120,
    pipeLengthFeet: 1000,
  });

  assert.ok(Math.abs(result.headLossFeet - 9.1328) < 0.001);
  assert.ok(Math.abs(result.headLossFeetPer100Feet - 0.9133) < 0.001);
  assert.ok(Math.abs(result.pressureLossPsi - 3.9545) < 0.001);
});
