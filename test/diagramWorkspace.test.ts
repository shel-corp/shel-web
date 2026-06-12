import assert from "node:assert/strict";
import test from "node:test";

import {
  addSketchElement,
  createFunctionalDiagramWorkspace,
  diagramGroups,
  diagramProductMetadata,
  diagramWorkspacePresentation,
  getSubviewForGroup,
  groupSelectedElements,
  openGroupSubview,
  restoreDiagramWorkspace,
  serializeDiagramWorkspace,
  summarizeDiagramWorkspace,
  toggleElementSelection,
} from "../src/lib/diagramWorkspace";

test("diagram workspace product metadata adds a routed product tab", () => {
  assert.equal(diagramProductMetadata.href, "/products/nested-sketchboard");
  assert.match(diagramProductMetadata.description, /Excalidraw-like/i);
  assert.match(diagramProductMetadata.description, /Blender-style/i);
});

test("diagram workspace presentation protects the canvas plus subviews product contract", () => {
  assert.equal(diagramWorkspacePresentation.layout, "canvas-subviews");
  assert.ok(diagramWorkspacePresentation.primaryRegions.includes("infinite-sketch-canvas"));
  assert.ok(diagramWorkspacePresentation.primaryRegions.includes("group-subview-stack"));
  assert.ok(diagramWorkspacePresentation.borrowedPatterns.some((pattern) => pattern.includes("Excalidraw")));
  assert.ok(diagramWorkspacePresentation.borrowedPatterns.some((pattern) => pattern.includes("Blender node-editor")));
});

test("diagram workspace models grouped nodes that can open into internal subviews", () => {
  const summary = summarizeDiagramWorkspace();

  assert.equal(summary.groupCount, 3);
  assert.ok(summary.elementCount >= 9);
  assert.deepEqual(summary.routableGroups, ["orchestration"]);

  const orchestration = diagramGroups.find((group) => group.id === "orchestration");
  assert.ok(orchestration?.elements.every((element) => element.subview === "orchestration-detail"));

  const subview = getSubviewForGroup("orchestration");
  assert.equal(subview?.title, "Workflow group internals");
  assert.deepEqual(subview?.breadcrumb, ["Root sketch", "Orchestration Group", "Workflow internals"]);
});

test("functional workspace creates sketch elements and selects them for grouping", () => {
  let workspace = createFunctionalDiagramWorkspace();
  workspace = addSketchElement(workspace, { kind: "rectangle", label: "API", x: 20, y: 30 });
  workspace = addSketchElement(workspace, { kind: "note", label: "Retry policy", x: 180, y: 44 });
  workspace = toggleElementSelection(workspace, workspace.rootElementIds[0]);
  workspace = toggleElementSelection(workspace, workspace.rootElementIds[1]);

  assert.equal(workspace.elements.length, 2);
  assert.deepEqual(workspace.selectedElementIds, workspace.rootElementIds);
});

test("functional workspace collapses selected elements into a grouped node with an editable subview", () => {
  let workspace = createFunctionalDiagramWorkspace();
  workspace = addSketchElement(workspace, { kind: "rectangle", label: "Intent", x: 20, y: 30 });
  workspace = addSketchElement(workspace, { kind: "rectangle", label: "Router", x: 180, y: 44 });
  workspace = toggleElementSelection(workspace, workspace.rootElementIds[0]);
  workspace = toggleElementSelection(workspace, workspace.rootElementIds[1]);
  workspace = groupSelectedElements(workspace, "Request workflow");

  assert.equal(workspace.groups.length, 1);
  assert.equal(workspace.rootElementIds.length, 1);
  assert.equal(workspace.rootElementIds[0], workspace.groups[0].collapsedElementId);
  assert.deepEqual(workspace.groups[0].childElementIds.length, 2);
  assert.equal(openGroupSubview(workspace, workspace.groups[0].id).activeSubviewId, workspace.groups[0].subviewId);
});

test("functional workspace persists and restores nested sketchboard state", () => {
  let workspace = createFunctionalDiagramWorkspace();
  workspace = addSketchElement(workspace, { kind: "rectangle", label: "Capture", x: 10, y: 20 });
  workspace = addSketchElement(workspace, { kind: "rectangle", label: "Classify", x: 150, y: 20 });
  workspace = toggleElementSelection(workspace, workspace.rootElementIds[0]);
  workspace = toggleElementSelection(workspace, workspace.rootElementIds[1]);
  workspace = groupSelectedElements(workspace, "Pipeline");
  workspace = openGroupSubview(workspace, workspace.groups[0].id);
  workspace = addSketchElement(workspace, { kind: "diamond", label: "Policy gate", x: 320, y: 80 });

  const restored = restoreDiagramWorkspace(serializeDiagramWorkspace(workspace));

  assert.equal(restored.groups[0].title, "Pipeline");
  assert.equal(restored.activeSubviewId, workspace.groups[0].subviewId);
  assert.ok(restored.elements.some((element) => element.label === "Policy gate"));
});
