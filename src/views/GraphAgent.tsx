import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  answerGraphQuestion,
  formatValue,
  GraphAgentResponse,
  GraphPoint,
  GraphSpec,
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

  function submitQuestion(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    const response = answerGraphQuestion(trimmed);
    setMessages((current) => [
      ...current,
      { role: 'user', content: trimmed },
      { role: 'agent', content: response.answer, response },
    ]);
    setQuestion('');
  }

  function usePrompt(prompt: string) {
    setQuestion(prompt);
    const response = answerGraphQuestion(prompt);
    setMessages((current) => [
      ...current,
      { role: 'user', content: prompt },
      { role: 'agent', content: response.answer, response },
    ]);
  }

  return (
    <section className="graph-agent-section">
      <p className="status page-status">PRODUCT / GRAPH AGENT / D3 TOOL CALLS</p>
      <h1>Ask a chart question. The agent answers by calling D3 graph tools.</h1>
      <p>
        This static-safe chat agent parses analytical prompts, chooses a graphing tool, and renders an interactive D3 SVG.
        It supports labeled values, coordinate pairs, function plots, and fallback scenario graphs for open-ended questions.
      </p>

      <div className="graph-agent-grid">
        <div className="graph-chat-panel">
          <h2>Chat agent</h2>
          <div className="graph-tool-strip" aria-label="Available graph tools">
            {graphAgentTools.map((tool) => (
              <span key={tool.id} title={tool.description}>{tool.name}</span>
            ))}
          </div>

          <div className="graph-chat-log" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`graph-message graph-message-${message.role}`} key={`${message.role}-${index}`}>
                <strong>{message.role === 'user' ? 'You' : 'Graph agent'}</strong>
                <p>{message.content}</p>
                {message.response ? (
                  <div className="tool-call-card">
                    <span>tool_call</span>
                    <code>{message.response.toolCall.toolId}</code>
                    <small>{message.response.toolCall.rationale}</small>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <form className="graph-chat-form" onSubmit={submitQuestion}>
            <label htmlFor="graph-question">Ask for a visualization</label>
            <textarea
              id="graph-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: Compare support tickets Jan 12, Feb 18, Mar 9"
              rows={4}
            />
            <button type="submit">Run graph agent</button>
          </form>

          <div className="graph-examples">
            <p className="status">EXAMPLE PROMPTS</p>
            {examplePrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => usePrompt(prompt)}>{prompt}</button>
            ))}
          </div>
        </div>

        <div className="graph-output-panel">
          <h2>{activeResponse.chart.title}</h2>
          <p>{activeResponse.answer}</p>
          <GraphChart chart={activeResponse.chart} />
          <dl className="metric-list graph-metrics">
            <div>
              <dt>Graph kind</dt>
              <dd>{activeResponse.chart.kind}</dd>
            </div>
            <div>
              <dt>Data points</dt>
              <dd>{activeResponse.chart.points.length}</dd>
            </div>
            <div>
              <dt>Tool</dt>
              <dd>{activeResponse.toolCall.toolId}</dd>
            </div>
          </dl>
          <div className="future-equations">
            <h3>How to steer it</h3>
            <ul>
              {activeResponse.followUps.map((followUp) => <li key={followUp}>{followUp}</li>)}
            </ul>
          </div>
        </div>
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
      <svg ref={svgRef} role="img" aria-label={`${chart.title} ${chart.kind} chart`} viewBox="0 0 760 400" />
    </div>
  );
}

function renderChart(svgElement: SVGSVGElement, chart: GraphSpec) {
  const svg = d3.select(svgElement);
  svg.selectAll('*').remove();

  const width = 760;
  const height = 400;
  const margin = { top: 34, right: 28, bottom: 62, left: 76 };
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

  svg.append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height).attr('fill', '#070909');

  const xAxis = xNumeric
    ? d3.axisBottom(xScale as d3.ScaleLinear<number, number>).ticks(7)
    : d3.axisBottom(xScale as d3.ScalePoint<string>);

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .call((group) => group.selectAll('text').attr('fill', '#F2F4F5'))
    .call((group) => group.selectAll('line,path').attr('stroke', '#5F666B'));

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(6))
    .call((group) => group.selectAll('text').attr('fill', '#F2F4F5'))
    .call((group) => group.selectAll('line,path').attr('stroke', '#5F666B'));

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 16)
    .attr('text-anchor', 'middle')
    .attr('fill', '#5F666B')
    .attr('font-size', 12)
    .text(chart.xAxisLabel);

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', '#5F666B')
    .attr('font-size', 12)
    .text(chart.yAxisLabel);

  svg.append('g')
    .attr('stroke', 'rgba(95, 102, 107, 0.2)')
    .selectAll('line')
    .data(yScale.ticks(6))
    .join('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', (value) => yScale(value))
    .attr('y2', (value) => yScale(value));

  if (chart.kind === 'bar') {
    const band = d3.scaleBand().domain(points.map((point) => point.label)).range([margin.left, width - margin.right]).padding(0.28);
    svg.append('g')
      .selectAll('rect')
      .data(points)
      .join('rect')
      .attr('x', (point) => band(point.label) ?? margin.left)
      .attr('y', (point) => yScale(Math.max(point.y, 0)))
      .attr('width', band.bandwidth())
      .attr('height', (point) => Math.abs(yScale(point.y) - yScale(0)))
      .attr('fill', '#4DE3E3')
      .attr('opacity', 0.74)
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
      .attr('stroke-width', 3)
      .attr('d', line);
  }

  svg.append('g')
    .selectAll('circle')
    .data(points)
    .join('circle')
    .attr('cx', (point) => xForPoint(point))
    .attr('cy', (point) => yScale(point.y))
    .attr('r', chart.kind === 'function' ? 3 : 5)
    .attr('fill', chart.kind === 'scatter' ? '#C9A449' : '#F2F4F5')
    .attr('stroke', '#0B0D0E')
    .attr('stroke-width', 1.5)
    .append('title')
    .text((point) => `${point.label}: ${formatValue(point.y)}`);
}
