export type DiagramElement = {
  id: string;
  label: string;
  kind: 'shape' | 'connector' | 'note';
  x: number;
  y: number;
  width: number;
  height: number;
  subview?: string;
};

export type DiagramGroup = {
  id: string;
  title: string;
  description: string;
  color: string;
  collapsedLabel: string;
  elements: DiagramElement[];
};

export type DiagramSubview = {
  id: string;
  title: string;
  parentGroupId: string;
  breadcrumb: string[];
  summary: string;
  elements: DiagramElement[];
};

export type DiagramWorkspacePresentation = {
  layout: 'canvas-subviews';
  heroTitle: string;
  productName: string;
  primaryRegions: string[];
  borrowedPatterns: string[];
  interactionPrinciples: string[];
};

export const diagramWorkspacePresentation: DiagramWorkspacePresentation = {
  layout: 'canvas-subviews',
  productName: 'Nested Sketchboard',
  heroTitle: 'Hand-drawn diagrams that open into node-editor subviews.',
  primaryRegions: ['infinite-sketch-canvas', 'group-subview-stack', 'inspector'],
  borrowedPatterns: [
    'Excalidraw-style rough shapes, connectors, notes, and fast spatial sketching',
    'Blender node-editor grouping: selected clusters become reusable nodes with their own internal canvas',
    'Breadcrumb navigation that lets a system map zoom from overview to implementation detail without losing context',
  ],
  interactionPrinciples: [
    'Groups collapse into single ports-first nodes on the parent canvas.',
    'Opening a group preserves a breadcrumb trail and shows only the subgraph owned by that group.',
    'Sketch freedom stays primary; hierarchy appears only when it helps organize complexity.',
  ],
};

export const diagramProductMetadata = {
  name: diagramWorkspacePresentation.productName,
  description:
    'A visual diagramming workspace that pairs Excalidraw-like sketching with Blender-style grouped node subviews.',
  department: 'Systems Research',
  href: '/products/nested-sketchboard',
};

export const diagramGroups: DiagramGroup[] = [
  {
    id: 'capture',
    title: 'Capture Layer',
    description: 'Rough boxes, arrows, sticky notes, and quick annotations for early system thinking.',
    color: '#4DE3E3',
    collapsedLabel: 'Sketch inputs',
    elements: [
      { id: 'shape-library', label: 'Shapes', kind: 'shape', x: 82, y: 88, width: 126, height: 72 },
      { id: 'freehand', label: 'Freehand', kind: 'note', x: 86, y: 194, width: 128, height: 58 },
      { id: 'connector-hints', label: 'Arrows', kind: 'connector', x: 244, y: 142, width: 116, height: 62 },
    ],
  },
  {
    id: 'orchestration',
    title: 'Orchestration Group',
    description: 'A collapsed parent node with named ports that opens into a focused workflow graph.',
    color: '#C9A449',
    collapsedLabel: 'Workflow group',
    elements: [
      { id: 'intent', label: 'Intent', kind: 'shape', x: 428, y: 108, width: 120, height: 60, subview: 'orchestration-detail' },
      { id: 'router', label: 'Router', kind: 'shape', x: 610, y: 108, width: 120, height: 60, subview: 'orchestration-detail' },
      { id: 'policy', label: 'Policy', kind: 'note', x: 518, y: 222, width: 132, height: 58, subview: 'orchestration-detail' },
    ],
  },
  {
    id: 'artifact',
    title: 'Artifact Group',
    description: 'Outputs, links, generated docs, and canvas snapshots stay attached to their originating node cluster.',
    color: '#C6362E',
    collapsedLabel: 'Artifacts',
    elements: [
      { id: 'diagram', label: 'Diagram', kind: 'shape', x: 796, y: 96, width: 120, height: 64 },
      { id: 'spec', label: 'Spec', kind: 'note', x: 818, y: 206, width: 118, height: 58 },
      { id: 'handoff', label: 'Handoff', kind: 'connector', x: 958, y: 144, width: 118, height: 62 },
    ],
  },
];

export const diagramSubviews: DiagramSubview[] = [
  {
    id: 'orchestration-detail',
    title: 'Workflow group internals',
    parentGroupId: 'orchestration',
    breadcrumb: ['Root sketch', 'Orchestration Group', 'Workflow internals'],
    summary: 'Blender-style group editing: the parent canvas sees one node, while the subview exposes intent routing, policy checks, and artifact generation.',
    elements: [
      { id: 'normalize', label: 'Normalize request', kind: 'shape', x: 96, y: 84, width: 158, height: 58 },
      { id: 'classify', label: 'Classify task', kind: 'shape', x: 328, y: 84, width: 148, height: 58 },
      { id: 'gate', label: 'Policy gate', kind: 'note', x: 552, y: 84, width: 136, height: 58 },
      { id: 'emit', label: 'Emit artifact', kind: 'shape', x: 764, y: 84, width: 144, height: 58 },
    ],
  },
];

export function getSubviewForGroup(groupId: string): DiagramSubview | undefined {
  return diagramSubviews.find((subview) => subview.parentGroupId === groupId);
}

export function summarizeDiagramWorkspace() {
  return {
    groupCount: diagramGroups.length,
    subviewCount: diagramSubviews.length,
    routableGroups: diagramGroups.filter((group) => getSubviewForGroup(group.id)).map((group) => group.id),
    elementCount: diagramGroups.reduce((total, group) => total + group.elements.length, 0),
  };
}

export type SketchElementKind = 'rectangle' | 'diamond' | 'note' | 'arrow' | 'group';

export type SketchElement = {
  id: string;
  kind: SketchElementKind;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  subviewId?: string;
};

export type FunctionalDiagramGroup = {
  id: string;
  title: string;
  collapsedElementId: string;
  childElementIds: string[];
  subviewId: string;
};

export type FunctionalDiagramWorkspace = {
  elements: SketchElement[];
  groups: FunctionalDiagramGroup[];
  rootElementIds: string[];
  selectedElementIds: string[];
  activeSubviewId: 'root' | string;
  subviewElementIds: Record<string, string[]>;
  nextId: number;
};

export type SketchElementDraft = {
  kind: Exclude<SketchElementKind, 'group'>;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};

const DEFAULT_ELEMENT_SIZE: Record<SketchElementKind, { width: number; height: number }> = {
  rectangle: { width: 132, height: 72 },
  diamond: { width: 128, height: 78 },
  note: { width: 142, height: 76 },
  arrow: { width: 120, height: 32 },
  group: { width: 164, height: 92 },
};

export function createFunctionalDiagramWorkspace(): FunctionalDiagramWorkspace {
  return {
    elements: [],
    groups: [],
    rootElementIds: [],
    selectedElementIds: [],
    activeSubviewId: 'root',
    subviewElementIds: {},
    nextId: 1,
  };
}

export function addSketchElement(
  workspace: FunctionalDiagramWorkspace,
  draft: SketchElementDraft,
): FunctionalDiagramWorkspace {
  const id = `element-${workspace.nextId}`;
  const size = DEFAULT_ELEMENT_SIZE[draft.kind];
  const element: SketchElement = {
    id,
    kind: draft.kind,
    label: draft.label,
    x: draft.x,
    y: draft.y,
    width: draft.width ?? size.width,
    height: draft.height ?? size.height,
  };
  const activeSubviewId = workspace.activeSubviewId;
  return {
    ...workspace,
    elements: [...workspace.elements, element],
    rootElementIds: activeSubviewId === 'root' ? [...workspace.rootElementIds, id] : workspace.rootElementIds,
    subviewElementIds: activeSubviewId === 'root'
      ? workspace.subviewElementIds
      : {
          ...workspace.subviewElementIds,
          [activeSubviewId]: [...(workspace.subviewElementIds[activeSubviewId] ?? []), id],
        },
    nextId: workspace.nextId + 1,
  };
}

export function toggleElementSelection(
  workspace: FunctionalDiagramWorkspace,
  elementId: string,
): FunctionalDiagramWorkspace {
  const selected = workspace.selectedElementIds.includes(elementId)
    ? workspace.selectedElementIds.filter((id) => id !== elementId)
    : [...workspace.selectedElementIds, elementId];
  return { ...workspace, selectedElementIds: selected };
}

export function groupSelectedElements(
  workspace: FunctionalDiagramWorkspace,
  title: string,
): FunctionalDiagramWorkspace {
  const childElementIds = workspace.selectedElementIds.filter((id) => workspace.rootElementIds.includes(id));
  if (childElementIds.length < 2) return workspace;

  const selectedElements = workspace.elements.filter((element) => childElementIds.includes(element.id));
  const minX = Math.min(...selectedElements.map((element) => element.x));
  const minY = Math.min(...selectedElements.map((element) => element.y));
  const maxX = Math.max(...selectedElements.map((element) => element.x + element.width));
  const maxY = Math.max(...selectedElements.map((element) => element.y + element.height));
  const groupId = `group-${workspace.nextId}`;
  const collapsedElementId = `element-${workspace.nextId}`;
  const subviewId = `subview-${workspace.nextId}`;
  const collapsedElement: SketchElement = {
    id: collapsedElementId,
    kind: 'group',
    label: title,
    x: minX,
    y: minY,
    width: Math.max(DEFAULT_ELEMENT_SIZE.group.width, maxX - minX + 40),
    height: Math.max(DEFAULT_ELEMENT_SIZE.group.height, maxY - minY + 40),
    subviewId,
  };
  const group: FunctionalDiagramGroup = { id: groupId, title, collapsedElementId, childElementIds, subviewId };
  return {
    ...workspace,
    elements: [...workspace.elements, collapsedElement],
    groups: [...workspace.groups, group],
    rootElementIds: [...workspace.rootElementIds.filter((id) => !childElementIds.includes(id)), collapsedElementId],
    selectedElementIds: [collapsedElementId],
    subviewElementIds: { ...workspace.subviewElementIds, [subviewId]: childElementIds },
    nextId: workspace.nextId + 1,
  };
}

export function openGroupSubview(
  workspace: FunctionalDiagramWorkspace,
  groupId: string,
): FunctionalDiagramWorkspace {
  const group = workspace.groups.find((candidate) => candidate.id === groupId);
  return group ? { ...workspace, activeSubviewId: group.subviewId, selectedElementIds: [] } : workspace;
}

export function closeSubview(workspace: FunctionalDiagramWorkspace): FunctionalDiagramWorkspace {
  return { ...workspace, activeSubviewId: 'root', selectedElementIds: [] };
}

export function serializeDiagramWorkspace(workspace: FunctionalDiagramWorkspace): string {
  return JSON.stringify(workspace);
}

export function restoreDiagramWorkspace(serialized: string): FunctionalDiagramWorkspace {
  const parsed = JSON.parse(serialized) as FunctionalDiagramWorkspace;
  return {
    ...createFunctionalDiagramWorkspace(),
    ...parsed,
    selectedElementIds: parsed.selectedElementIds ?? [],
    subviewElementIds: parsed.subviewElementIds ?? {},
  };
}

export function getVisibleSketchElements(workspace: FunctionalDiagramWorkspace): SketchElement[] {
  const visibleIds = workspace.activeSubviewId === 'root'
    ? workspace.rootElementIds
    : (workspace.subviewElementIds[workspace.activeSubviewId] ?? []);
  const visible = new Set(visibleIds);
  return workspace.elements.filter((element) => visible.has(element.id));
}
