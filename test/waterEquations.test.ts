import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateContinuityFlow,
  calculateDarcyWeisbachHeadLoss,
  calculateHazenWilliamsHeadLoss,
  calculatePipeVisualSizePercent,
  fluidDynamicsEquationOptions,
} from "../src/lib/waterEquations";

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
  assert.deepEqual(fluidDynamicsEquationOptions.map((equation) => equation.id), ["continuity-flow", "hazen-williams-head-loss", "darcy-weisbach-head-loss"]);
  assert.match(fluidDynamicsEquationOptions[0].formula, /Q = A/);
});

test("Darcy-Weisbach equation metadata explains constants and when to use it", () => {
  const darcyWeisbach = fluidDynamicsEquationOptions.find((equation) => equation.id === "darcy-weisbach-head-loss");

  assert.match(darcyWeisbach?.formula ?? "", /hₗ = f × L\/D × v²\/\(2g\)/);
  assert.ok(darcyWeisbach?.coefficientNotes?.some((note) => note.includes("32.174 ft/s²")));
  assert.ok(darcyWeisbach?.coefficientNotes?.some((note) => note.includes("dimensionless friction factor")));
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

test("Darcy-Weisbach equation calculates head loss from velocity, diameter, friction factor, and length", () => {
  const result = calculateDarcyWeisbachHeadLoss({
    velocityFeetPerSecond: 5,
    diameterInches: 8,
    darcyFrictionFactor: 0.02,
    pipeLengthFeet: 1000,
  });

  assert.ok(Math.abs(result.diameterFeet - 0.6667) < 0.001);
  assert.ok(Math.abs(result.velocityHeadFeet - 0.3885) < 0.001);
  assert.ok(Math.abs(result.headLossFeet - 11.6554) < 0.001);
  assert.ok(Math.abs(result.headLossFeetPer100Feet - 1.1655) < 0.001);
  assert.ok(Math.abs(result.pressureLossPsi - 5.0468) < 0.001);
});
