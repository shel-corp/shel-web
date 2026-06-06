import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  answerGraphQuestion,
  formatValue,
  GraphAgentResponse,
  GraphPoint,
  GraphSpec,
  graphAgentPresentation,
  graphAgentTools,
} from '../lib/graphAgent';

type ChatMessage = {
  role: 'user' | 'agent';
  content: string;
  response?: GraphAgentResponse;
};

const examplePrompts = [
  'Compare revenue for Jan 10, Feb 20, and Mar 35',
  'Make a bar graph: apples 4, oranges 7, pears 3',
  'Plot points (1, 2), (2, 5), (3, 4), (4, 9)',
  'Graph y = x^2 from -3 to 3',
];

const initialQuestion = examplePrompts[0];
const initialResponse = answerGraphQuestion(initialQuestion);

export default function GraphAgent() {
  const [question, setQuestion] = useState('Graph y = x^2 from -3 to 3');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'user', content: initialQuestion },
    { role: 'agent', content: initialResponse.answer, response: initialResponse },
  ]);

  const activeResponse = useMemo(
    () => [...messages].reverse().find((message) => message.response)?.response ?? initialResponse,
    [messages],
  );

  function appendPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const response = answerGraphQuestion(trimmed);
    setMessages((current) => [
      ...current,
      { role: 'user', content: trimmed },
      { role: 'agent', content: response.answer, response },
    ]);
  }

  function submitQuestion(event?: FormEvent) {
    event?.preventDefault();
    appendPrompt(question);
    setQuestion('');
  }

  function usePrompt(prompt: string) {
    setQuestion(prompt);
    appendPrompt(prompt);
  }

  return (
    <section className="graph-agent-section">
      <div className="graph-agent-hero">
        <p className="status page-status">PRODUCT / GRAPH AGENT / CHAT CANVAS</p>
        <h1>{graphAgentPresentation.heroTitle}</h1>
        <p>
          Ask naturally on the left. The agent turns the latest answer into a live D3 artifact on the canvas,
          with tool details tucked into the side instead of dominating the page.
        </p>
      </div>

      <div className="graph-agent-workspace" data-layout={graphAgentPresentation.layout}>
        <aside className="graph-chat-rail" aria-label="Graph agent chat thread">
          <div className="graph-chat-header">
            <h2>Chat</h2>
            <span>{messages.length} messages</span>
          </div>

          <div className="graph-chat-thread" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`chat-bubble chat-bubble-${message.role}`} key={`${message.role}-${index}`}>
                <strong>{message.role === 'user' ? 'You' : 'Agent'}</strong>
                <p>{message.content}</p>
              </article>
            ))}
          </div>

          <form className="graph-composer" onSubmit={submitQuestion}>
            <label htmlFor="graph-question">Message the graph agent</label>
            <textarea
              id="graph-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask for a graph, compare categories, paste coordinate pairs, or describe a function."
              rows={3}
            />
            <button type="submit">Send</button>
          </form>
        </aside>

        <section className="graph-canvas-stage" aria-label="Graph canvas">
          <div className="graph-canvas-toolbar">
            <div>
              <span className="canvas-kicker">Canvas</span>
              <h2>{activeResponse.chart.title}</h2>
            </div>
            <span className="canvas-pill">{activeResponse.chart.kind}</span>
          </div>

          <div className="graph-canvas-frame">
            <GraphChart chart={activeResponse.chart} />
          </div>

          <div className="graph-canvas-caption">
            <p>{activeResponse.answer}</p>
            <div className="graph-canvas-stats" aria-label="Canvas stats">
              <span>{activeResponse.chart.points.length} points</span>
              <span>{activeResponse.toolCall.toolId}</span>
            </div>
          </div>
        </section>

        <aside className="graph-context-rail" aria-label="Graph tools and prompt examples">
          <h2>Tools</h2>
          <div className="graph-tool-stack">
            {graphAgentTools.map((tool) => (
              <div key={tool.id}>
                <strong>{tool.name}</strong>
                <span>{tool.id}</span>
              </div>
            ))}
          </div>

          <div className="tool-call-card graph-active-tool">
            <span>latest tool_call</span>
            <code>{activeResponse.toolCall.toolId}</code>
            <small>{activeResponse.toolCall.rationale}</small>
          </div>

          <div className="graph-examples">
            <p className="status">TRY</p>
            {examplePrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => usePrompt(prompt)}>{prompt}</button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function GraphChart({ chart }: { chart: GraphSpec }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    renderChart(svgRef.current, chart);
  }, [chart]);

  return (
    <div className="graph-svg-wrap">
      <svg ref={svgRef} role="img" aria-label={`${chart.title} ${chart.kind} chart`} viewBox="0 0 900 560" />
    </div>
  );
}

function renderChart(svgElement: SVGSVGElement, chart: GraphSpec) {
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();

  const width = 900;
  const height = 560;
  const margin = { top: 42, right: 42, bottom: 74, left: 86 };
  const points = chart.points;
  const yExtent = d3.extent(points, (point) => point.y) as [number, number];
  const yPadding = Math.max(1, Math.abs((yExtent[1] ?? 1) - (yExtent[0] ?? 0)) * 0.12);
  const yDomain: [number, number] = [Math.min(0, (yExtent[0] ?? 0) - yPadding), (yExtent[1] ?? 1) + yPadding];

  const xNumeric = chart.kind === 'scatter' || chart.kind === 'function';
  const xExtent = d3.extent(points, (point) => point.x) as [number, number];
  const xScale = xNumeric
    ? d3.scaleLinear().domain([(xExtent[0] ?? 0), (xExtent[1] ?? 1)]).nice().range([margin.left, width - margin.right])
    : d3.scalePoint<string>().domain(points.map((point) => point.label)).range([margin.left, width - margin.right]).padding(0.5);
  const yScale = d3.scaleLinear().domain(yDomain).nice().range([height - margin.bottom, margin.top]);

  svg.append('defs')
    .append('radialGradient')
    .attr('id', 'canvasGlow')
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'rgba(77, 227, 227, 0.14)');

  svg.append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height).attr('fill', '#060808');
  svg.append('circle').attr('cx', width * 0.72).attr('cy', height * 0.28).attr('r', 260).attr('fill', 'url(#canvasGlow)').attr('opacity', 0.72);

  const xAxis = xNumeric
    ? d3.axisBottom(xScale as d3.ScaleLinear<number, number>).ticks(7)
    : d3.axisBottom(xScale as d3.ScalePoint<string>);

  svg.append('g')
    .attr('stroke', 'rgba(95, 102, 107, 0.18)')
    .selectAll('line')
    .data(yScale.ticks(7))
    .join('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', (value) => yScale(value))
    .attr('y2', (value) => yScale(value));

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .call((group) => group.selectAll('text').attr('fill', '#F2F4F5').attr('font-size', 13))
    .call((group) => group.selectAll('line,path').attr('stroke', '#5F666B'));

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(7))
    .call((group) => group.selectAll('text').attr('fill', '#F2F4F5').attr('font-size', 13))
    .call((group) => group.selectAll('line,path').attr('stroke', '#5F666B'));

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 22)
    .attr('text-anchor', 'middle')
    .attr('fill', '#5F666B')
    .attr('font-size', 13)
    .text(chart.xAxisLabel);

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', 24)
    .attr('text-anchor', 'middle')
    .attr('fill', '#5F666B')
    .attr('font-size', 13)
    .text(chart.yAxisLabel);

  if (chart.kind === 'bar') {
    const band = d3.scaleBand().domain(points.map((point) => point.label)).range([margin.left, width - margin.right]).padding(0.32);
    svg.append('g')
      .selectAll('rect')
      .data(points)
      .join('rect')
      .attr('x', (point) => band(point.label) ?? margin.left)
      .attr('y', (point) => yScale(Math.max(point.y, 0)))
      .attr('width', band.bandwidth())
      .attr('height', (point) => Math.abs(yScale(point.y) - yScale(0)))
      .attr('rx', 10)
      .attr('fill', '#4DE3E3')
      .attr('opacity', 0.82)
      .append('title')
      .text((point) => `${point.label}: ${formatValue(point.y)}`);
    return;
  }

  const xForPoint = (point: GraphPoint) => xNumeric
    ? (xScale as d3.ScaleLinear<number, number>)(point.x)
    : ((xScale as d3.ScalePoint<string>)(point.label) ?? margin.left);

  if (chart.kind === 'line' || chart.kind === 'function') {
    const line = d3.line<GraphPoint>()
      .x((point) => xForPoint(point))
      .y((point) => yScale(point.y))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', '#4DE3E3')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('d', line);
  }

  svg.append('g')
    .selectAll('circle')
    .data(points)
    .join('circle')
    .attr('cx', (point) => xForPoint(point))
    .attr('cy', (point) => yScale(point.y))
    .attr('r', chart.kind === 'function' ? 4 : 7)
    .attr('fill', chart.kind === 'scatter' ? '#C9A449' : '#F2F4F5')
    .attr('stroke', '#0B0D0E')
    .attr('stroke-width', 1.5)
    .append('title')
    .text((point) => `${point.label}: ${formatValue(point.y)}`);
}
