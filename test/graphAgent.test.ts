import assert from "node:assert/strict";
import test from "node:test";

import {
  answerGraphQuestion,
  graphAgentPresentation,
  graphAgentTools,
  graphProductMetadata,
} from "../src/lib/graphAgent";

test("graph agent exposes D3 graph creation tools", () => {
  assert.deepEqual(
    graphAgentTools.map((tool) => tool.id),
    ["create-line-chart", "create-bar-chart", "create-scatter-plot", "create-function-plot"],
  );
  assert.ok(graphAgentTools.every((tool) => tool.description.includes("D3")));
});

test("graph agent turns time-series questions into an interactive line chart spec", () => {
  const response = answerGraphQuestion("Compare revenue for Jan 10, Feb 20, and Mar 35");

  assert.equal(response.toolCall.toolId, "create-line-chart");
  assert.equal(response.chart.kind, "line");
  assert.deepEqual(response.chart.points.map((point) => point.label), ["Jan", "Feb", "Mar"]);
  assert.deepEqual(response.chart.points.map((point) => point.y), [10, 20, 35]);
  assert.match(response.answer, /trend/i);
});

test("graph agent recognizes explicit bar chart requests", () => {
  const response = answerGraphQuestion("Make a bar graph: apples 4, oranges 7, pears 3");

  assert.equal(response.toolCall.toolId, "create-bar-chart");
  assert.equal(response.chart.kind, "bar");
  assert.deepEqual(response.chart.points.map((point) => point.label), ["apples", "oranges", "pears"]);
  assert.deepEqual(response.chart.points.map((point) => point.y), [4, 7, 3]);
});

test("graph agent creates function plots for common math questions", () => {
  const response = answerGraphQuestion("Graph y = x^2 from -3 to 3");

  assert.equal(response.toolCall.toolId, "create-function-plot");
  assert.equal(response.chart.kind, "function");
  assert.equal(response.chart.expression, "x^2");
  assert.ok(response.chart.points.some((point) => point.x === -3 && point.y === 9));
  assert.ok(response.chart.points.some((point) => point.x === 0 && point.y === 0));
  assert.ok(response.chart.points.some((point) => point.x === 3 && point.y === 9));
});

test("graph agent presentation is chat plus canvas first", () => {
  assert.equal(graphAgentPresentation.layout, "chat-canvas");
  assert.match(graphAgentPresentation.heroTitle, /canvas/i);
  assert.ok(graphAgentPresentation.primaryRegions.includes("chat-thread"));
  assert.ok(graphAgentPresentation.primaryRegions.includes("graph-canvas"));
  assert.ok(graphAgentPresentation.canvasPrinciples.some((principle) => principle.includes("dominant")));
  assert.ok(graphAgentPresentation.canvasPrinciples.some((principle) => principle.includes("tool chrome")));
});

test("graph agent product metadata adds a dedicated products tab", () => {
  assert.equal(graphProductMetadata.href, "/products/graph-agent");
  assert.match(graphProductMetadata.description, /chat agent/i);
  assert.match(graphProductMetadata.description, /D3/i);
});
