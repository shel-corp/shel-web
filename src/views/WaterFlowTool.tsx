import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  calculateContinuityFlow,
  fluidDynamicsEquationOptions,
  formatNumber,
  futureFluidDynamicsEquations,
} from '../lib/waterEquations';

const width = 720;
const height = 340;
const margin = { top: 28, right: 28, bottom: 48, left: 72 };

export default function WaterFlowTool() {
  const [equationId, setEquationId] = useState('continuity-flow');
  const [diameterInches, setDiameterInches] = useState(8);
  const [velocityFeetPerSecond, setVelocityFeetPerSecond] = useState(3);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const equation = fluidDynamicsEquationOptions.find((option) => option.id === equationId) ?? fluidDynamicsEquationOptions[0];
  const result = useMemo(
    () => calculateContinuityFlow({ diameterInches, velocityFeetPerSecond }),
    [diameterInches, velocityFeetPerSecond],
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const diameterDomain = d3.range(1, 25, 0.5);
    const points = diameterDomain.map((diameter) => ({
      diameter,
      flow: calculateContinuityFlow({ diameterInches: diameter, velocityFeetPerSecond }).flowGallonsPerMinute,
    }));

    const x = d3.scaleLinear().domain([0, 24]).range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(points, (point) => point.flow) ?? 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line<{ diameter: number; flow: number }>()
      .x((point) => x(point.diameter))
      .y((point) => y(point.flow))
      .curve(d3.curveMonotoneX);

    svg
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', 'rgba(255,255,255,0.018)')
      .attr('stroke', 'rgba(95,102,107,0.35)');

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat((value) => `${value} in`))
      .call((group) => group.selectAll('text').attr('fill', '#5F666B'))
      .call((group) => group.selectAll('line,path').attr('stroke', '#5F666B'));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat((value) => `${d3.format('~s')(Number(value))}`))
      .call((group) => group.selectAll('text').attr('fill', '#5F666B'))
      .call((group) => group.selectAll('line,path').attr('stroke', '#5F666B'));

    svg
      .append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', '#4DE3E3')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    svg
      .append('line')
      .attr('x1', x(diameterInches))
      .attr('x2', x(diameterInches))
      .attr('y1', y(result.flowGallonsPerMinute))
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#C6362E')
      .attr('stroke-dasharray', '4 5');

    svg
      .append('circle')
      .attr('cx', x(diameterInches))
      .attr('cy', y(result.flowGallonsPerMinute))
      .attr('r', 6)
      .attr('fill', '#C6362E')
      .attr('stroke', '#F2F4F5')
      .attr('stroke-width', 1.5);

    svg
      .append('text')
      .attr('x', margin.left)
      .attr('y', 18)
      .attr('fill', '#F2F4F5')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-size', 12)
      .text(`Flow curve at ${formatNumber(velocityFeetPerSecond, 1)} ft/s`);

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#5F666B')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-size', 11)
      .text('Pipe diameter');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#5F666B')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-size', 11)
      .text('Gallons per minute');
  }, [diameterInches, velocityFeetPerSecond, result.flowGallonsPerMinute]);

  const pipeFillPercent = Math.min(100, Math.max(8, (diameterInches / 24) * 100));

  return (
    <section className="water-tool-section">
      <p className="status page-status">SHELCORP STUDY PRODUCTS / WATER OPERATOR EXAM</p>
      <h1>Water Flow Study Tool</h1>
      <p>
        An interactive fluid-dynamics equation lab for water-treatment and distribution exam prep. Start with one
        high-frequency relationship, change the variables, and watch the raw numbers and visual curve update together.
      </p>

      <div className="water-tool-grid">
        <div className="water-panel water-controls">
          <label htmlFor="equation-select">Equation</label>
          <select id="equation-select" value={equationId} onChange={(event) => setEquationId(event.target.value)}>
            {fluidDynamicsEquationOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>

          <div className="equation-card">
            <strong>{equation.formula}</strong>
            <p>{equation.description}</p>
            <p className="status">EXAM USE: {equation.examUse}</p>
          </div>

          <label htmlFor="diameter-input">Pipe diameter: {formatNumber(diameterInches, 1)} in</label>
          <input
            id="diameter-input"
            type="range"
            min="1"
            max="24"
            step="0.5"
            value={diameterInches}
            onChange={(event) => setDiameterInches(Number(event.target.value))}
          />
          <input
            aria-label="Pipe diameter in inches"
            type="number"
            min="1"
            max="24"
            step="0.5"
            value={diameterInches}
            onChange={(event) => setDiameterInches(Number(event.target.value))}
          />

          <label htmlFor="velocity-input">Velocity: {formatNumber(velocityFeetPerSecond, 1)} ft/s</label>
          <input
            id="velocity-input"
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={velocityFeetPerSecond}
            onChange={(event) => setVelocityFeetPerSecond(Number(event.target.value))}
          />
          <input
            aria-label="Velocity in feet per second"
            type="number"
            min="0.5"
            max="10"
            step="0.1"
            value={velocityFeetPerSecond}
            onChange={(event) => setVelocityFeetPerSecond(Number(event.target.value))}
          />
        </div>

        <div className="water-panel raw-number-panel">
          <h2>Raw numbers</h2>
          <dl className="metric-list">
            <div><dt>Diameter</dt><dd>{formatNumber(result.diameterFeet, 3)} ft</dd></div>
            <div><dt>Area</dt><dd>{formatNumber(result.areaSquareFeet, 3)} ft²</dd></div>
            <div><dt>Flow</dt><dd>{formatNumber(result.flowCubicFeetPerSecond, 3)} cfs</dd></div>
            <div><dt>Flow</dt><dd>{formatNumber(result.flowGallonsPerMinute, 1)} gpm</dd></div>
            <div><dt>Flow</dt><dd>{formatNumber(result.flowMillionGallonsPerDay, 3)} MGD</dd></div>
          </dl>

          <div className="pipe-visual" aria-label="Pipe cross-section visualization">
            <div className="pipe-circle" style={{ width: `${pipeFillPercent}%`, paddingBottom: `${pipeFillPercent}%` }}>
              <span>{formatNumber(diameterInches, 1)} in</span>
            </div>
          </div>
        </div>
      </div>

      <div className="water-panel chart-panel">
        <h2>Diameter-to-flow relationship</h2>
        <p>
          The curve shows why diameter dominates flow: area grows with the square of diameter, so doubling the pipe
          diameter roughly quadruples flow at the same velocity.
        </p>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart showing flow increasing as pipe diameter increases" />
      </div>

      <div className="water-panel future-equations">
        <h2>Next equations to add</h2>
        <p>These are common water-operator fluid-dynamics relationships to expand into the selector after the first tool works well.</p>
        <ul>
          {futureFluidDynamicsEquations.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}
