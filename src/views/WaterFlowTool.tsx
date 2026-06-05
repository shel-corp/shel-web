import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  calculateContinuityFlow,
  calculateHazenWilliamsHeadLoss,
  calculatePipeVisualSizePercent,
  fluidDynamicsEquationOptions,
  formatNumber,
  futureFluidDynamicsEquations,
} from '../lib/waterEquations';

const width = 720;
const height = 340;
const margin = { top: 28, right: 28, bottom: 48, left: 72 };

type ChartPoint = {
  xValue: number;
  yValue: number;
};

export default function WaterFlowTool() {
  const [equationId, setEquationId] = useState('continuity-flow');
  const [diameterInches, setDiameterInches] = useState(8);
  const [velocityFeetPerSecond, setVelocityFeetPerSecond] = useState(3);
  const [flowGallonsPerMinute, setFlowGallonsPerMinute] = useState(1000);
  const [hazenWilliamsC, setHazenWilliamsC] = useState(120);
  const [pipeLengthFeet, setPipeLengthFeet] = useState(1000);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const equation = fluidDynamicsEquationOptions.find((option) => option.id === equationId) ?? fluidDynamicsEquationOptions[0];
  const isHazenWilliams = equationId === 'hazen-williams-head-loss';
  const continuityResult = useMemo(
    () => calculateContinuityFlow({ diameterInches, velocityFeetPerSecond }),
    [diameterInches, velocityFeetPerSecond],
  );
  const hazenWilliamsResult = useMemo(
    () => calculateHazenWilliamsHeadLoss({ flowGallonsPerMinute, diameterInches, hazenWilliamsC, pipeLengthFeet }),
    [diameterInches, flowGallonsPerMinute, hazenWilliamsC, pipeLengthFeet],
  );

  const chart = useMemo(() => {
    if (isHazenWilliams) {
      const points = d3.range(100, 3001, 100).map((flow) => ({
        xValue: flow,
        yValue: calculateHazenWilliamsHeadLoss({
          flowGallonsPerMinute: flow,
          diameterInches,
          hazenWilliamsC,
          pipeLengthFeet,
        }).headLossFeet,
      }));

      return {
        title: `Head loss curve at ${formatNumber(diameterInches, 1)} in, C=${formatNumber(hazenWilliamsC, 0)}`,
        xDomain: [0, 3000] as [number, number],
        yMax: d3.max(points, (point) => point.yValue) ?? 1,
        xAxisLabel: 'Flow rate',
        yAxisLabel: 'Head loss, ft',
        currentX: flowGallonsPerMinute,
        currentY: hazenWilliamsResult.headLossFeet,
        xTickFormat: (value: d3.NumberValue) => `${d3.format('~s')(Number(value))} gpm`,
        yTickFormat: (value: d3.NumberValue) => `${formatNumber(Number(value), 0)} ft`,
        points,
      };
    }

    const points = d3.range(1, 25, 0.5).map((diameter) => ({
      xValue: diameter,
      yValue: calculateContinuityFlow({ diameterInches: diameter, velocityFeetPerSecond }).flowGallonsPerMinute,
    }));

    return {
      title: `Flow curve at ${formatNumber(velocityFeetPerSecond, 1)} ft/s`,
      xDomain: [0, 24] as [number, number],
      yMax: d3.max(points, (point) => point.yValue) ?? 1,
      xAxisLabel: 'Pipe diameter',
      yAxisLabel: 'Gallons per minute',
      currentX: diameterInches,
      currentY: continuityResult.flowGallonsPerMinute,
      xTickFormat: (value: d3.NumberValue) => `${value} in`,
      yTickFormat: (value: d3.NumberValue) => `${d3.format('~s')(Number(value))}`,
      points,
    };
  }, [continuityResult.flowGallonsPerMinute, diameterInches, flowGallonsPerMinute, hazenWilliamsC, hazenWilliamsResult.headLossFeet, isHazenWilliams, pipeLengthFeet, velocityFeetPerSecond]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const x = d3.scaleLinear().domain(chart.xDomain).range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([0, chart.yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line<ChartPoint>()
      .x((point) => x(point.xValue))
      .y((point) => y(point.yValue))
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
      .call(d3.axisBottom(x).ticks(8).tickFormat(chart.xTickFormat))
      .call((group) => group.selectAll('text').attr('fill', '#5F666B'))
      .call((group) => group.selectAll('line,path').attr('stroke', '#5F666B'));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(chart.yTickFormat))
      .call((group) => group.selectAll('text').attr('fill', '#5F666B'))
      .call((group) => group.selectAll('line,path').attr('stroke', '#5F666B'));

    svg
      .append('path')
      .datum(chart.points)
      .attr('fill', 'none')
      .attr('stroke', '#4DE3E3')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    svg
      .append('line')
      .attr('x1', x(chart.currentX))
      .attr('x2', x(chart.currentX))
      .attr('y1', y(chart.currentY))
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#C6362E')
      .attr('stroke-dasharray', '4 5');

    svg
      .append('circle')
      .attr('cx', x(chart.currentX))
      .attr('cy', y(chart.currentY))
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
      .text(chart.title);

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#5F666B')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-size', 11)
      .text(chart.xAxisLabel);

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#5F666B')
      .attr('font-family', 'IBM Plex Mono, monospace')
      .attr('font-size', 11)
      .text(chart.yAxisLabel);
  }, [chart]);

  const pipeVisualSizePercent = calculatePipeVisualSizePercent(diameterInches);

  return (
    <section className="water-tool-section">
      <p className="status page-status">SHELCORP STUDY PRODUCTS / WATER OPERATOR EXAM</p>
      <h1>Water Flow Study Tool</h1>
      <p>
        An interactive fluid-dynamics equation lab for water-treatment and distribution exam prep. Select an equation,
        change the variables, and watch the raw numbers and visual curve update together.
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
            {equation.coefficientNotes ? (
              <div className="coefficient-notes">
                <p className="status">COEFFICIENT NOTES</p>
                <ul>
                  {equation.coefficientNotes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </div>
            ) : null}
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

          {isHazenWilliams ? (
            <>
              <label htmlFor="flow-input">Flow: {formatNumber(flowGallonsPerMinute, 0)} gpm</label>
              <input
                id="flow-input"
                type="range"
                min="100"
                max="3000"
                step="25"
                value={flowGallonsPerMinute}
                onChange={(event) => setFlowGallonsPerMinute(Number(event.target.value))}
              />
              <input
                aria-label="Flow in gallons per minute"
                type="number"
                min="100"
                max="3000"
                step="25"
                value={flowGallonsPerMinute}
                onChange={(event) => setFlowGallonsPerMinute(Number(event.target.value))}
              />

              <label htmlFor="c-factor-input">Hazen-Williams C factor: {formatNumber(hazenWilliamsC, 0)}</label>
              <input
                id="c-factor-input"
                type="range"
                min="80"
                max="150"
                step="1"
                value={hazenWilliamsC}
                onChange={(event) => setHazenWilliamsC(Number(event.target.value))}
              />
              <input
                aria-label="Hazen-Williams C factor"
                type="number"
                min="80"
                max="150"
                step="1"
                value={hazenWilliamsC}
                onChange={(event) => setHazenWilliamsC(Number(event.target.value))}
              />

              <label htmlFor="length-input">Pipe length: {formatNumber(pipeLengthFeet, 0)} ft</label>
              <input
                id="length-input"
                type="range"
                min="100"
                max="5000"
                step="50"
                value={pipeLengthFeet}
                onChange={(event) => setPipeLengthFeet(Number(event.target.value))}
              />
              <input
                aria-label="Pipe length in feet"
                type="number"
                min="100"
                max="5000"
                step="50"
                value={pipeLengthFeet}
                onChange={(event) => setPipeLengthFeet(Number(event.target.value))}
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="water-panel raw-number-panel">
          <h2>Raw numbers</h2>
          {isHazenWilliams ? (
            <dl className="metric-list">
              <div><dt>Flow</dt><dd>{formatNumber(hazenWilliamsResult.flowGallonsPerMinute, 0)} gpm</dd></div>
              <div><dt>Diameter</dt><dd>{formatNumber(hazenWilliamsResult.diameterInches, 1)} in</dd></div>
              <div><dt>C factor</dt><dd>{formatNumber(hazenWilliamsResult.hazenWilliamsC, 0)}</dd></div>
              <div><dt>Length</dt><dd>{formatNumber(hazenWilliamsResult.pipeLengthFeet, 0)} ft</dd></div>
              <div><dt>Head loss</dt><dd>{formatNumber(hazenWilliamsResult.headLossFeet, 3)} ft</dd></div>
              <div><dt>Head loss</dt><dd>{formatNumber(hazenWilliamsResult.headLossFeetPer100Feet, 3)} ft / 100 ft</dd></div>
              <div><dt>Pressure loss</dt><dd>{formatNumber(hazenWilliamsResult.pressureLossPsi, 3)} psi</dd></div>
            </dl>
          ) : (
            <dl className="metric-list">
              <div><dt>Diameter</dt><dd>{formatNumber(continuityResult.diameterFeet, 3)} ft</dd></div>
              <div><dt>Area</dt><dd>{formatNumber(continuityResult.areaSquareFeet, 3)} ft²</dd></div>
              <div><dt>Flow</dt><dd>{formatNumber(continuityResult.flowCubicFeetPerSecond, 3)} cfs</dd></div>
              <div><dt>Flow</dt><dd>{formatNumber(continuityResult.flowGallonsPerMinute, 1)} gpm</dd></div>
              <div><dt>Flow</dt><dd>{formatNumber(continuityResult.flowMillionGallonsPerDay, 3)} MGD</dd></div>
            </dl>
          )}

          <div className="pipe-visual" aria-label="Pipe cross-section visualization">
            <div className="pipe-circle" style={{ '--pipe-size': `${pipeVisualSizePercent}%` } as React.CSSProperties}>
              <span>{formatNumber(diameterInches, 1)} in</span>
            </div>
          </div>
        </div>
      </div>

      <div className="water-panel chart-panel">
        <h2>{isHazenWilliams ? 'Flow-to-head-loss relationship' : 'Diameter-to-flow relationship'}</h2>
        <p>
          {isHazenWilliams
            ? 'The curve shows why head loss climbs quickly as flow increases: Hazen-Williams raises flow to the 1.85 power, so higher demand produces disproportionate friction loss.'
            : 'The curve shows why diameter dominates flow: area grows with the square of diameter, so doubling the pipe diameter roughly quadruples flow at the same velocity.'}
        </p>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={isHazenWilliams ? 'Line chart showing head loss increasing as flow increases' : 'Line chart showing flow increasing as pipe diameter increases'} />
      </div>

      <div className="water-panel future-equations">
        <h2>Next equations to add</h2>
        <p>These are common water-operator fluid-dynamics relationships to expand into the selector after the current tools work well.</p>
        <ul>
          {futureFluidDynamicsEquations.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}
