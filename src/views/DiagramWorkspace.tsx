import React, { useMemo, useState } from 'react';
import {
  FunctionalDiagramWorkspace,
  SketchElement,
  addSketchElement,
  closeSubview,
  createFunctionalDiagramWorkspace,
  diagramWorkspacePresentation,
  getVisibleSketchElements,
  groupSelectedElements,
  openGroupSubview,
  restoreDiagramWorkspace,
  serializeDiagramWorkspace,
  summarizeDiagramWorkspace,
  toggleElementSelection,
} from '../lib/diagramWorkspace';

const STORAGE_KEY = 'shelcorp:nested-sketchboard:v1';

function createSeedWorkspace(): FunctionalDiagramWorkspace {
  let workspace = createFunctionalDiagramWorkspace();
  workspace = addSketchElement(workspace, { kind: 'rectangle', label: 'Sketch input', x: 90, y: 96 });
  workspace = addSketchElement(workspace, { kind: 'note', label: 'Group me', x: 285, y: 112 });
  workspace = addSketchElement(workspace, { kind: 'diamond', label: 'Decision', x: 515, y: 210 });
  return workspace;
}

export default function DiagramWorkspace() {
  const [workspace, setWorkspace] = useState(createSeedWorkspace);
  const [groupTitle, setGroupTitle] = useState('Workflow group');
  const [lastSaved, setLastSaved] = useState('not saved');
  const summary = useMemo(() => summarizeDiagramWorkspace(), []);
  const visibleElements = getVisibleSketchElements(workspace);
  const activeGroup = workspace.groups.find((group) => group.subviewId === workspace.activeSubviewId);

  function addElement(kind: 'rectangle' | 'diamond' | 'note') {
    const offset = workspace.elements.length * 24;
    const label = kind === 'rectangle' ? 'Process' : kind === 'diamond' ? 'Branch' : 'Note';
    setWorkspace((current) => addSketchElement(current, { kind, label, x: 120 + offset, y: 92 + offset }));
  }

  function groupSelection() {
    setWorkspace((current) => groupSelectedElements(current, groupTitle.trim() || 'Untitled group'));
  }

  function openSelectedGroup() {
    const selected = workspace.selectedElementIds[0];
    const group = workspace.groups.find((candidate) => candidate.collapsedElementId === selected);
    if (group) setWorkspace((current) => openGroupSubview(current, group.id));
  }

  function saveWorkspace() {
    const serialized = serializeDiagramWorkspace(workspace);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    setLastSaved(`${workspace.elements.length} elements saved`);
  }

  function restoreWorkspace() {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      setLastSaved('nothing saved yet');
      return;
    }
    setWorkspace(restoreDiagramWorkspace(serialized));
    setLastSaved('restored from browser storage');
  }

  return (
    <section className="diagram-workspace-section">
      <div className="diagram-workspace-hero">
        <p className="status page-status">PRODUCT / NESTED SKETCHBOARD / FUNCTIONAL MVP</p>
        <h1>{diagramWorkspacePresentation.heroTitle}</h1>
        <p>
          This is now a working browser MVP: add sketch nodes, select multiple elements, collapse them into a
          Blender-style group, open the group as its own subview, add details inside it, then save and restore the scene.
        </p>
      </div>

      <div className="diagram-workspace-shell functional-sketchboard" data-layout={diagramWorkspacePresentation.layout}>
        <aside className="diagram-tool-rail" aria-label="Nested Sketchboard tools">
          <h2>Tools</h2>
          <div className="diagram-button-stack">
            <button type="button" onClick={() => addElement('rectangle')}>Add rectangle</button>
            <button type="button" onClick={() => addElement('note')}>Add note</button>
            <button type="button" onClick={() => addElement('diamond')}>Add decision</button>
          </div>

          <label className="diagram-field" htmlFor="group-title">
            Group title
            <input id="group-title" value={groupTitle} onChange={(event) => setGroupTitle(event.target.value)} />
          </label>
          <div className="diagram-button-stack">
            <button type="button" onClick={groupSelection} disabled={workspace.selectedElementIds.length < 2 || workspace.activeSubviewId !== 'root'}>
              Create group from selection
            </button>
            <button type="button" onClick={openSelectedGroup} disabled={!workspace.groups.some((group) => group.collapsedElementId === workspace.selectedElementIds[0])}>
              Open selected group
            </button>
            <button type="button" onClick={() => setWorkspace(closeSubview)} disabled={workspace.activeSubviewId === 'root'}>
              Back to root canvas
            </button>
          </div>

          <div className="diagram-button-stack">
            <button type="button" onClick={saveWorkspace}>Save scene</button>
            <button type="button" onClick={restoreWorkspace}>Restore scene</button>
          </div>
          <p className="status">{lastSaved}</p>
        </aside>

        <section className="diagram-canvas-panel" aria-label="Functional nested sketch canvas">
          <div className="diagram-canvas-toolbar">
            <div>
              <span className="canvas-kicker">{workspace.activeSubviewId === 'root' ? 'Root canvas' : 'Subview'}</span>
              <h2>{activeGroup ? activeGroup.title : 'Sketch canvas'}</h2>
            </div>
            <span className="canvas-pill">{visibleElements.length} visible / {workspace.selectedElementIds.length} selected</span>
          </div>
          <FunctionalCanvas workspace={workspace} elements={visibleElements} onChange={setWorkspace} />
        </section>

        <aside className="diagram-inspector" aria-label="Nested Sketchboard inspector">
          <h2>Inspector</h2>
          <div className="diagram-stat-grid">
            <span><strong>{workspace.elements.length}</strong> elements</span>
            <span><strong>{workspace.groups.length}</strong> real groups</span>
            <span><strong>{summary.groupCount}</strong> concept groups</span>
          </div>
          <div className="diagram-subview-card">
            <p className="status">BREADCRUMB</p>
            <p>{workspace.activeSubviewId === 'root' ? 'Root sketch' : `Root sketch / ${activeGroup?.title ?? 'Subview'}`}</p>
            <h3>{activeGroup ? 'Editing group internals' : 'Root-level scene'}</h3>
            <p>
              {activeGroup
                ? 'Elements added here belong to the open group subview; the parent canvas keeps a collapsed group node.'
                : 'Select two or more root elements and create a group to collapse them into an openable parent node.'}
            </p>
          </div>
          <div className="diagram-group-list">
            {workspace.groups.map((group) => (
              <button key={group.id} type="button" onClick={() => setWorkspace((current) => openGroupSubview(current, group.id))}>
                <span style={{ background: '#C9A449' }} />
                <strong>{group.title}</strong>
                <small>{group.childElementIds.length} internal elements</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function FunctionalCanvas({
  workspace,
  elements,
  onChange,
}: {
  workspace: FunctionalDiagramWorkspace;
  elements: SketchElement[];
  onChange: React.Dispatch<React.SetStateAction<FunctionalDiagramWorkspace>>;
}) {
  return (
    <div className="diagram-svg-wrap">
      <svg role="img" aria-label="Functional Nested Sketchboard canvas" viewBox="0 0 1120 520">
        <defs>
          <pattern id="functionalSketchGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(95,102,107,0.18)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1120" height="520" fill="url(#functionalSketchGrid)" />
        {elements.map((element, index) => (
          <SketchNode
            key={element.id}
            element={element}
            index={index}
            selected={workspace.selectedElementIds.includes(element.id)}
            onClick={() => onChange((current) => toggleElementSelection(current, element.id))}
            onOpenGroup={() => {
              const group = workspace.groups.find((candidate) => candidate.collapsedElementId === element.id);
              if (group) onChange((current) => openGroupSubview(current, group.id));
            }}
          />
        ))}
      </svg>
    </div>
  );
}

function SketchNode({
  element,
  index,
  selected,
  onClick,
  onOpenGroup,
}: {
  element: SketchElement;
  index: number;
  selected: boolean;
  onClick: () => void;
  onOpenGroup: () => void;
}) {
  const color = element.kind === 'group' ? '#C9A449' : element.kind === 'note' ? '#4DE3E3' : '#F2F4F5';
  const transform = element.kind === 'diamond' ? `rotate(45 ${element.x + element.width / 2} ${element.y + element.height / 2})` : undefined;
  return (
    <g
      className={`diagram-node functional-node ${selected ? 'selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${element.label} ${element.kind}`}
      onClick={onClick}
      onDoubleClick={onOpenGroup}
    >
      <rect
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rx={element.kind === 'note' ? 4 : 16}
        fill={selected ? 'rgba(77,227,227,0.16)' : 'rgba(242,244,245,0.045)'}
        stroke={selected ? '#4DE3E3' : color}
        strokeDasharray={element.kind === 'note' ? '7 6' : undefined}
        transform={transform}
      />
      <text x={element.x + 18} y={element.y + 38} fill="#F2F4F5" fontSize="15">{element.label}</text>
      <text x={element.x + 18} y={element.y + 60} fill="#5F666B" fontSize="11">#{index + 1} · {element.kind}</text>
      {element.kind === 'group' ? <text x={element.x + element.width - 54} y={element.y + 28} fill="#C9A449" fontSize="12">open ↵</text> : null}
    </g>
  );
}
