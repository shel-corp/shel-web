import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  calculateBernoulliEnergy,
  calculateContinuityFlow,
  calculateDarcyWeisbachHeadLoss,
  calculateDetentionTime,
  calculateHazenWilliamsHeadLoss,
  calculateOrificeFlow,
  calculatePipeVisualSizePercent,
  calculateReynoldsNumber,
  calculateWeirFlow,
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
  const [darcyFrictionFactor, setDarcyFrictionFactor] = useState(0.02);
  const [pipeLengthFeet, setPipeLengthFeet] = useState(1000);
  const [upstreamElevationFeet, setUpstreamElevationFeet] = useState(10);
  const [upstreamPressurePsi, setUpstreamPressurePsi] = useState(50);
  const [upstreamVelocityFeetPerSecond, setUpstreamVelocityFeetPerSecond] = useState(4);
  const [downstreamElevationFeet, setDownstreamElevationFeet] = useState(12);
  const [downstreamPressurePsi, setDownstreamPressurePsi] = useState(45);
  const [downstreamVelocityFeetPerSecond, setDownstreamVelocityFeetPerSecond] = useState(6);
  const [kinematicViscositySquareFeetPerSecond, setKinematicViscositySquareFeetPerSecond] = useState(0.000011);
  const [detentionVolumeGallons, setDetentionVolumeGallons] = useState(500000);
  const [detentionFlowGallonsPerMinute, setDetentionFlowGallonsPerMinute] = useState(1000);
  const [weirLengthFeet, setWeirLengthFeet] = useState(2);
  const [weirHeadFeet, setWeirHeadFeet] = useState(0.75);
  const [weirCoefficient, setWeirCoefficient] = useState(3.33);
  const [orificeDiameterInches, setOrificeDiameterInches] = useState(6);
  const [orificeHeadFeet, setOrificeHeadFeet] = useState(4);
  const [orificeDischargeCoefficient, setOrificeDischargeCoefficient] = useState(0.62);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const equation = fluidDynamicsEquationOptions.find((option) => option.id === equationId) ?? fluidDynamicsEquationOptions[0];
  const isHazenWilliams = equationId === 'hazen-williams-head-loss';
  const isDarcyWeisbach = equationId === 'darcy-weisbach-head-loss';
  const isBernoulli = equationId === 'bernoulli-energy';
  const isReynolds = equationId === 'reynolds-number';
  const isDetentionTime = equationId === 'detention-time';
  const isWeirOrifice = equationId === 'weir-orifice-flow';
  const usesPipeDiameter = !isBernoulli && !isDetentionTime && !isWeirOrifice;
  const continuityResult = useMemo(
    () => calculateContinuityFlow({ diameterInches, velocityFeetPerSecond }),
    [diameterInches, velocityFeetPerSecond],
  );
  const hazenWilliamsResult = useMemo(
    () => calculateHazenWilliamsHeadLoss({ flowGallonsPerMinute, diameterInches, hazenWilliamsC, pipeLengthFeet }),
    [diameterInches, flowGallonsPerMinute, hazenWilliamsC, pipeLengthFeet],
  );
  const darcyWeisbachResult = useMemo(
    () => calculateDarcyWeisbachHeadLoss({ velocityFeetPerSecond, diameterInches, darcyFrictionFactor, pipeLengthFeet }),
    [darcyFrictionFactor, diameterInches, pipeLengthFeet, velocityFeetPerSecond],
  );
  const bernoulliResult = useMemo(
    () =>
      calculateBernoulliEnergy({
        upstreamElevationFeet,
        upstreamPressurePsi,
        upstreamVelocityFeetPerSecond,
        downstreamElevationFeet,
        downstreamPressurePsi,
        downstreamVelocityFeetPerSecond,
      }),
    [
      downstreamElevationFeet,
      downstreamPressurePsi,
      downstreamVelocityFeetPerSecond,
      upstreamElevationFeet,
      upstreamPressurePsi,
      upstreamVelocityFeetPerSecond,
    ],
  );
  const reynoldsResult = useMemo(
    () => calculateReynoldsNumber({ diameterInches, velocityFeetPerSecond, kinematicViscositySquareFeetPerSecond }),
    [diameterInches, kinematicViscositySquareFeetPerSecond, velocityFeetPerSecond],
  );
  const detentionTimeResult = useMemo(
    () => calculateDetentionTime({ volumeGallons: detentionVolumeGallons, flowGallonsPerMinute: detentionFlowGallonsPerMinute }),
    [detentionFlowGallonsPerMinute, detentionVolumeGallons],
  );
  const weirResult = useMemo(
    () => calculateWeirFlow({ weirLengthFeet, headFeet: weirHeadFeet, weirCoefficient }),
    [weirCoefficient, weirHeadFeet, weirLengthFeet],
  );
  const orificeResult = useMemo(
    () =>
      calculateOrificeFlow({
        orificeDiameterInches,
        headFeet: orificeHeadFeet,
        dischargeCoefficient: orificeDischargeCoefficient,
      }),
    [orificeDiameterInches, orificeDischargeCoefficient, orificeHeadFeet],
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

    if (isDarcyWeisbach) {
      const points = d3.range(0.5, 10.1, 0.25).map((velocity) => ({
        xValue: velocity,
        yValue: calculateDarcyWeisbachHeadLoss({
          velocityFeetPerSecond: velocity,
          diameterInches,
          darcyFrictionFactor,
          pipeLengthFeet,
        }).headLossFeet,
      }));

      return {
        title: `Head loss curve at ${formatNumber(diameterInches, 1)} in, f=${formatNumber(darcyFrictionFactor, 3)}`,
        xDomain: [0, 10] as [number, number],
        yMax: d3.max(points, (point) => point.yValue) ?? 1,
        xAxisLabel: 'Velocity',
        yAxisLabel: 'Head loss, ft',
        currentX: velocityFeetPerSecond,
        currentY: darcyWeisbachResult.headLossFeet,
        xTickFormat: (value: d3.NumberValue) => `${formatNumber(Number(value), 1)} ft/s`,
        yTickFormat: (value: d3.NumberValue) => `${formatNumber(Number(value), 0)} ft`,
        points,
      };
    }

    if (isBernoulli) {
      const points = d3.range(0.5, 10.1, 0.25).map((velocity) => ({
        xValue: velocity,
        yValue: calculateBernoulliEnergy({
          upstreamElevationFeet,
          upstreamPressurePsi,
          upstreamVelocityFeetPerSecond,
          downstreamElevationFeet,
          downstreamPressurePsi,
          downstreamVelocityFeetPerSecond: velocity,
        }).downstreamTotalHeadFeet,
      }));

      return {
        title: `Downstream total head as velocity changes`,
        xDomain: [0, 10] as [number, number],
        yMax: d3.max(points, (point) => point.yValue) ?? 1,
        xAxisLabel: 'Downstream velocity',
        yAxisLabel: 'Total head, ft',
        currentX: downstreamVelocityFeetPerSecond,
        currentY: bernoulliResult.downstreamTotalHeadFeet,
        xTickFormat: (value: d3.NumberValue) => `${formatNumber(Number(value), 1)} ft/s`,
        yTickFormat: (value: d3.NumberValue) => `${formatNumber(Number(value), 0)} ft`,
        points,
      };
    }

    if (isReynolds) {
      const points = d3.range(0.5, 10.1, 0.25).map((velocity) => ({
        xValue: velocity,
        yValue: calculateReynoldsNumber({
          velocityFeetPerSecond: velocity,
          diameterInches,
          kinematicViscositySquareFeetPerSecond,
        }).reynoldsNumber,
      }));

      return {
        title: `Reynolds number at ${formatNumber(diameterInches, 1)} in`,
        xDomain: [0, 10] as [number, number],
        yMax: d3.max(points, (point) => point.yValue) ?? 1,
        xAxisLabel: 'Velocity',
        yAxisLabel: 'Reynolds number',
        currentX: velocityFeetPerSecond,
        currentY: reynoldsResult.reynoldsNumber,
        xTickFormat: (value: d3.NumberValue) => `${formatNumber(Number(value), 1)} ft/s`,
        yTickFormat: (value: d3.NumberValue) => `${d3.format('~s')(Number(value))}`,
        points,
      };
    }

    if (isDetentionTime) {
      const points = d3.range(100, 3001, 100).map((flow) => ({
        xValue: flow,
        yValue: calculateDetentionTime({
          volumeGallons: detentionVolumeGallons,
          flowGallonsPerMinute: flow,
        }).detentionTimeHours,
      }));

      return {
        title: `Detention time for ${formatNumber(detentionVolumeGallons, 0)} gal`,
        xDomain: [0, 3000] as [number, number],
        yMax: d3.max(points, (point) => point.yValue) ?? 1,
        xAxisLabel: 'Flow rate',
        yAxisLabel: 'Detention time, hr',
        currentX: detentionFlowGallonsPerMinute,
        currentY: detentionTimeResult.detentionTimeHours,
        xTickFormat: (value: d3.NumberValue) => `${d3.format('~s')(Number(value))} gpm`,
        yTickFormat: (value: d3.NumberValue) => `${formatNumber(Number(value), 1)} hr`,
        points,
      };
    }

    if (isWeirOrifice) {
      const points = d3.range(0.1, 5.05, 0.1).map((head) => ({
        xValue: head,
        yValue: calculateWeirFlow({
          weirLengthFeet,
          headFeet: head,
          weirCoefficient,
        }).flowGallonsPerMinute,
      }));

      return {
        title: `Rectangular weir flow at ${formatNumber(weirLengthFeet, 1)} ft crest`,
        xDomain: [0, 5] as [number, number],
        yMax: d3.max(points, (point) => point.yValue) ?? 1,
        xAxisLabel: 'Head',
        yAxisLabel: 'Flow, gpm',
        currentX: weirHeadFeet,
        currentY: weirResult.flowGallonsPerMinute,
        xTickFormat: (value: d3.NumberValue) => `${formatNumber(Number(value), 1)} ft`,
        yTickFormat: (value: d3.NumberValue) => `${d3.format('~s')(Number(value))} gpm`,
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
  }, [
    bernoulliResult.downstreamTotalHeadFeet,
    continuityResult.flowGallonsPerMinute,
    darcyFrictionFactor,
    darcyWeisbachResult.headLossFeet,
    detentionFlowGallonsPerMinute,
    detentionTimeResult.detentionTimeHours,
    detentionVolumeGallons,
    diameterInches,
    downstreamElevationFeet,
    downstreamPressurePsi,
    downstreamVelocityFeetPerSecond,
    flowGallonsPerMinute,
    hazenWilliamsC,
    hazenWilliamsResult.headLossFeet,
    isBernoulli,
    isDarcyWeisbach,
    isDetentionTime,
    isHazenWilliams,
    isReynolds,
    isWeirOrifice,
    kinematicViscositySquareFeetPerSecond,
    pipeLengthFeet,
    reynoldsResult.reynoldsNumber,
    upstreamElevationFeet,
    upstreamPressurePsi,
    upstreamVelocityFeetPerSecond,
    velocityFeetPerSecond,
    weirCoefficient,
    weirHeadFeet,
    weirLengthFeet,
    weirResult.flowGallonsPerMinute,
  ]);

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
  const chartHeading = isBernoulli
    ? 'Bernoulli total-head relationship'
    : isHazenWilliams || isDarcyWeisbach
      ? 'Velocity/flow-to-head-loss relationship'
      : isReynolds
        ? 'Flow-regime relationship'
        : isDetentionTime
          ? 'Flow-to-detention-time relationship'
          : isWeirOrifice
            ? 'Head-to-discharge relationship'
            : 'Diameter-to-flow relationship';
  const chartDescription = isHazenWilliams
    ? 'The curve shows why head loss climbs quickly as flow increases: Hazen-Williams raises flow to the 1.85 power, so higher demand produces disproportionate friction loss.'
    : isDarcyWeisbach
      ? 'The curve shows why higher velocity increases friction loss sharply: Darcy-Weisbach uses velocity squared inside the velocity-head term.'
      : isBernoulli
        ? 'The curve shows how changing downstream velocity shifts velocity head and therefore total energy head at the downstream point.'
        : isReynolds
          ? 'The curve shows how Reynolds number rises linearly with velocity for a fixed pipe diameter and viscosity, crossing regime thresholds as inertial forces grow.'
          : isDetentionTime
            ? 'The curve shows the inverse relationship between flow and detention time: higher flow shortens theoretical contact time in the same tank volume.'
            : isWeirOrifice
              ? 'The curve shows how rectangular weir flow accelerates as head over the crest increases; the raw numbers also show the circular-orifice estimate for comparison.'
              : 'The curve shows why diameter dominates flow: area grows with the square of diameter, so doubling the pipe diameter roughly quadruples flow at the same velocity.';
  const chartAriaLabel = isHazenWilliams
    ? 'Line chart showing head loss increasing as flow increases'
    : isDarcyWeisbach
      ? 'Line chart showing head loss increasing as velocity increases'
      : isBernoulli
        ? 'Line chart showing downstream total head changing as downstream velocity changes'
        : isReynolds
          ? 'Line chart showing Reynolds number increasing as velocity increases'
          : isDetentionTime
            ? 'Line chart showing detention time decreasing as flow increases'
            : isWeirOrifice
              ? 'Line chart showing rectangular weir flow increasing as head increases'
              : 'Line chart showing flow increasing as pipe diameter increases';

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
            {equation.coefficientOrigin ? (
              <div className="coefficient-notes">
                <p className="status">HOW THESE NUMBERS WERE DISCOVERED</p>
                <p>{equation.coefficientOrigin}</p>
              </div>
            ) : null}
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

          {usesPipeDiameter ? (
            <>
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
            </>
          ) : null}

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
            </>
          ) : isBernoulli ? (
            <>
              <label htmlFor="upstream-elevation-input">Upstream elevation: {formatNumber(upstreamElevationFeet, 1)} ft</label>
              <input id="upstream-elevation-input" type="range" min="0" max="200" step="1" value={upstreamElevationFeet} onChange={(event) => setUpstreamElevationFeet(Number(event.target.value))} />
              <input aria-label="Upstream elevation in feet" type="number" min="0" max="200" step="1" value={upstreamElevationFeet} onChange={(event) => setUpstreamElevationFeet(Number(event.target.value))} />

              <label htmlFor="upstream-pressure-input">Upstream pressure: {formatNumber(upstreamPressurePsi, 1)} psi</label>
              <input id="upstream-pressure-input" type="range" min="0" max="150" step="1" value={upstreamPressurePsi} onChange={(event) => setUpstreamPressurePsi(Number(event.target.value))} />
              <input aria-label="Upstream pressure in psi" type="number" min="0" max="150" step="1" value={upstreamPressurePsi} onChange={(event) => setUpstreamPressurePsi(Number(event.target.value))} />

              <label htmlFor="upstream-velocity-input">Upstream velocity: {formatNumber(upstreamVelocityFeetPerSecond, 1)} ft/s</label>
              <input id="upstream-velocity-input" type="range" min="0.5" max="10" step="0.1" value={upstreamVelocityFeetPerSecond} onChange={(event) => setUpstreamVelocityFeetPerSecond(Number(event.target.value))} />
              <input aria-label="Upstream velocity in feet per second" type="number" min="0.5" max="10" step="0.1" value={upstreamVelocityFeetPerSecond} onChange={(event) => setUpstreamVelocityFeetPerSecond(Number(event.target.value))} />

              <label htmlFor="downstream-elevation-input">Downstream elevation: {formatNumber(downstreamElevationFeet, 1)} ft</label>
              <input id="downstream-elevation-input" type="range" min="0" max="200" step="1" value={downstreamElevationFeet} onChange={(event) => setDownstreamElevationFeet(Number(event.target.value))} />
              <input aria-label="Downstream elevation in feet" type="number" min="0" max="200" step="1" value={downstreamElevationFeet} onChange={(event) => setDownstreamElevationFeet(Number(event.target.value))} />

              <label htmlFor="downstream-pressure-input">Downstream pressure: {formatNumber(downstreamPressurePsi, 1)} psi</label>
              <input id="downstream-pressure-input" type="range" min="0" max="150" step="1" value={downstreamPressurePsi} onChange={(event) => setDownstreamPressurePsi(Number(event.target.value))} />
              <input aria-label="Downstream pressure in psi" type="number" min="0" max="150" step="1" value={downstreamPressurePsi} onChange={(event) => setDownstreamPressurePsi(Number(event.target.value))} />

              <label htmlFor="downstream-velocity-input">Downstream velocity: {formatNumber(downstreamVelocityFeetPerSecond, 1)} ft/s</label>
              <input id="downstream-velocity-input" type="range" min="0.5" max="10" step="0.1" value={downstreamVelocityFeetPerSecond} onChange={(event) => setDownstreamVelocityFeetPerSecond(Number(event.target.value))} />
              <input aria-label="Downstream velocity in feet per second" type="number" min="0.5" max="10" step="0.1" value={downstreamVelocityFeetPerSecond} onChange={(event) => setDownstreamVelocityFeetPerSecond(Number(event.target.value))} />
            </>
          ) : isReynolds ? (
            <>
              <label htmlFor="velocity-input">Velocity: {formatNumber(velocityFeetPerSecond, 1)} ft/s</label>
              <input id="velocity-input" type="range" min="0.5" max="10" step="0.1" value={velocityFeetPerSecond} onChange={(event) => setVelocityFeetPerSecond(Number(event.target.value))} />
              <input aria-label="Velocity in feet per second" type="number" min="0.5" max="10" step="0.1" value={velocityFeetPerSecond} onChange={(event) => setVelocityFeetPerSecond(Number(event.target.value))} />
              <label htmlFor="viscosity-input">Kinematic viscosity: {kinematicViscositySquareFeetPerSecond.toExponential(2)} ft²/s</label>
              <input id="viscosity-input" type="range" min="0.000008" max="0.00002" step="0.000001" value={kinematicViscositySquareFeetPerSecond} onChange={(event) => setKinematicViscositySquareFeetPerSecond(Number(event.target.value))} />
              <input aria-label="Kinematic viscosity in square feet per second" type="number" min="0.000008" max="0.00002" step="0.000001" value={kinematicViscositySquareFeetPerSecond} onChange={(event) => setKinematicViscositySquareFeetPerSecond(Number(event.target.value))} />
            </>
          ) : isDetentionTime ? (
            <>
              <label htmlFor="detention-volume-input">Volume: {formatNumber(detentionVolumeGallons, 0)} gal</label>
              <input id="detention-volume-input" type="range" min="10000" max="2000000" step="10000" value={detentionVolumeGallons} onChange={(event) => setDetentionVolumeGallons(Number(event.target.value))} />
              <input aria-label="Detention volume in gallons" type="number" min="10000" max="2000000" step="10000" value={detentionVolumeGallons} onChange={(event) => setDetentionVolumeGallons(Number(event.target.value))} />
              <label htmlFor="detention-flow-input">Flow: {formatNumber(detentionFlowGallonsPerMinute, 0)} gpm</label>
              <input id="detention-flow-input" type="range" min="100" max="3000" step="25" value={detentionFlowGallonsPerMinute} onChange={(event) => setDetentionFlowGallonsPerMinute(Number(event.target.value))} />
              <input aria-label="Detention flow in gallons per minute" type="number" min="100" max="3000" step="25" value={detentionFlowGallonsPerMinute} onChange={(event) => setDetentionFlowGallonsPerMinute(Number(event.target.value))} />
            </>
          ) : isWeirOrifice ? (
            <>
              <label htmlFor="weir-length-input">Weir crest length: {formatNumber(weirLengthFeet, 1)} ft</label>
              <input id="weir-length-input" type="range" min="0.5" max="10" step="0.1" value={weirLengthFeet} onChange={(event) => setWeirLengthFeet(Number(event.target.value))} />
              <input aria-label="Weir crest length in feet" type="number" min="0.5" max="10" step="0.1" value={weirLengthFeet} onChange={(event) => setWeirLengthFeet(Number(event.target.value))} />
              <label htmlFor="weir-head-input">Weir head: {formatNumber(weirHeadFeet, 2)} ft</label>
              <input id="weir-head-input" type="range" min="0.1" max="5" step="0.05" value={weirHeadFeet} onChange={(event) => setWeirHeadFeet(Number(event.target.value))} />
              <input aria-label="Weir head in feet" type="number" min="0.1" max="5" step="0.05" value={weirHeadFeet} onChange={(event) => setWeirHeadFeet(Number(event.target.value))} />
              <label htmlFor="weir-coefficient-input">Weir coefficient: {formatNumber(weirCoefficient, 2)}</label>
              <input id="weir-coefficient-input" type="range" min="2.8" max="3.5" step="0.01" value={weirCoefficient} onChange={(event) => setWeirCoefficient(Number(event.target.value))} />
              <input aria-label="Weir coefficient" type="number" min="2.8" max="3.5" step="0.01" value={weirCoefficient} onChange={(event) => setWeirCoefficient(Number(event.target.value))} />
              <label htmlFor="orifice-diameter-input">Orifice diameter: {formatNumber(orificeDiameterInches, 1)} in</label>
              <input id="orifice-diameter-input" type="range" min="1" max="24" step="0.5" value={orificeDiameterInches} onChange={(event) => setOrificeDiameterInches(Number(event.target.value))} />
              <input aria-label="Orifice diameter in inches" type="number" min="1" max="24" step="0.5" value={orificeDiameterInches} onChange={(event) => setOrificeDiameterInches(Number(event.target.value))} />
              <label htmlFor="orifice-head-input">Orifice head: {formatNumber(orificeHeadFeet, 2)} ft</label>
              <input id="orifice-head-input" type="range" min="0.1" max="50" step="0.1" value={orificeHeadFeet} onChange={(event) => setOrificeHeadFeet(Number(event.target.value))} />
              <input aria-label="Orifice head in feet" type="number" min="0.1" max="50" step="0.1" value={orificeHeadFeet} onChange={(event) => setOrificeHeadFeet(Number(event.target.value))} />
              <label htmlFor="orifice-coefficient-input">Orifice Cd: {formatNumber(orificeDischargeCoefficient, 2)}</label>
              <input id="orifice-coefficient-input" type="range" min="0.4" max="0.9" step="0.01" value={orificeDischargeCoefficient} onChange={(event) => setOrificeDischargeCoefficient(Number(event.target.value))} />
              <input aria-label="Orifice discharge coefficient" type="number" min="0.4" max="0.9" step="0.01" value={orificeDischargeCoefficient} onChange={(event) => setOrificeDischargeCoefficient(Number(event.target.value))} />
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

              {isDarcyWeisbach ? (
                <>
                  <label htmlFor="friction-factor-input">Darcy friction factor: {formatNumber(darcyFrictionFactor, 3)}</label>
                  <input
                    id="friction-factor-input"
                    type="range"
                    min="0.005"
                    max="0.08"
                    step="0.001"
                    value={darcyFrictionFactor}
                    onChange={(event) => setDarcyFrictionFactor(Number(event.target.value))}
                  />
                  <input
                    aria-label="Darcy friction factor"
                    type="number"
                    min="0.005"
                    max="0.08"
                    step="0.001"
                    value={darcyFrictionFactor}
                    onChange={(event) => setDarcyFrictionFactor(Number(event.target.value))}
                  />
                </>
              ) : null}
            </>
          )}

          {isHazenWilliams || isDarcyWeisbach ? (
            <>
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
          ) : null}
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
          ) : isDarcyWeisbach ? (
            <dl className="metric-list">
              <div><dt>Velocity</dt><dd>{formatNumber(darcyWeisbachResult.velocityFeetPerSecond, 1)} ft/s</dd></div>
              <div><dt>Diameter</dt><dd>{formatNumber(darcyWeisbachResult.diameterFeet, 3)} ft</dd></div>
              <div><dt>Friction factor</dt><dd>{formatNumber(darcyWeisbachResult.darcyFrictionFactor, 3)}</dd></div>
              <div><dt>Length</dt><dd>{formatNumber(darcyWeisbachResult.pipeLengthFeet, 0)} ft</dd></div>
              <div><dt>Velocity head</dt><dd>{formatNumber(darcyWeisbachResult.velocityHeadFeet, 3)} ft</dd></div>
              <div><dt>Head loss</dt><dd>{formatNumber(darcyWeisbachResult.headLossFeet, 3)} ft</dd></div>
              <div><dt>Head loss</dt><dd>{formatNumber(darcyWeisbachResult.headLossFeetPer100Feet, 3)} ft / 100 ft</dd></div>
              <div><dt>Pressure loss</dt><dd>{formatNumber(darcyWeisbachResult.pressureLossPsi, 3)} psi</dd></div>
            </dl>
          ) : isBernoulli ? (
            <dl className="metric-list">
              <div><dt>Upstream pressure head</dt><dd>{formatNumber(bernoulliResult.upstreamPressureHeadFeet, 3)} ft</dd></div>
              <div><dt>Upstream velocity head</dt><dd>{formatNumber(bernoulliResult.upstreamVelocityHeadFeet, 3)} ft</dd></div>
              <div><dt>Upstream total head</dt><dd>{formatNumber(bernoulliResult.upstreamTotalHeadFeet, 3)} ft</dd></div>
              <div><dt>Downstream pressure head</dt><dd>{formatNumber(bernoulliResult.downstreamPressureHeadFeet, 3)} ft</dd></div>
              <div><dt>Downstream velocity head</dt><dd>{formatNumber(bernoulliResult.downstreamVelocityHeadFeet, 3)} ft</dd></div>
              <div><dt>Downstream total head</dt><dd>{formatNumber(bernoulliResult.downstreamTotalHeadFeet, 3)} ft</dd></div>
              <div><dt>Energy difference</dt><dd>{formatNumber(bernoulliResult.energyDifferenceFeet, 3)} ft</dd></div>
              <div><dt>Energy difference</dt><dd>{formatNumber(bernoulliResult.energyDifferencePsi, 3)} psi</dd></div>
            </dl>
          ) : isReynolds ? (
            <dl className="metric-list">
              <div><dt>Velocity</dt><dd>{formatNumber(reynoldsResult.velocityFeetPerSecond, 1)} ft/s</dd></div>
              <div><dt>Diameter</dt><dd>{formatNumber(reynoldsResult.diameterFeet, 3)} ft</dd></div>
              <div><dt>Kinematic viscosity</dt><dd>{reynoldsResult.kinematicViscositySquareFeetPerSecond.toExponential(2)} ft²/s</dd></div>
              <div><dt>Reynolds number</dt><dd>{formatNumber(reynoldsResult.reynoldsNumber, 0)}</dd></div>
              <div><dt>Flow regime</dt><dd>{reynoldsResult.flowRegime}</dd></div>
            </dl>
          ) : isDetentionTime ? (
            <dl className="metric-list">
              <div><dt>Volume</dt><dd>{formatNumber(detentionTimeResult.volumeGallons, 0)} gal</dd></div>
              <div><dt>Flow</dt><dd>{formatNumber(detentionTimeResult.flowGallonsPerMinute, 0)} gpm</dd></div>
              <div><dt>Detention time</dt><dd>{formatNumber(detentionTimeResult.detentionTimeMinutes, 1)} min</dd></div>
              <div><dt>Detention time</dt><dd>{formatNumber(detentionTimeResult.detentionTimeHours, 2)} hr</dd></div>
              <div><dt>Detention time</dt><dd>{formatNumber(detentionTimeResult.detentionTimeDays, 3)} days</dd></div>
            </dl>
          ) : isWeirOrifice ? (
            <dl className="metric-list">
              <div><dt>Weir flow</dt><dd>{formatNumber(weirResult.flowCubicFeetPerSecond, 3)} cfs</dd></div>
              <div><dt>Weir flow</dt><dd>{formatNumber(weirResult.flowGallonsPerMinute, 1)} gpm</dd></div>
              <div><dt>Weir flow</dt><dd>{formatNumber(weirResult.flowMillionGallonsPerDay, 3)} MGD</dd></div>
              <div><dt>Orifice area</dt><dd>{formatNumber(orificeResult.areaSquareFeet, 3)} ft²</dd></div>
              <div><dt>Orifice flow</dt><dd>{formatNumber(orificeResult.flowCubicFeetPerSecond, 3)} cfs</dd></div>
              <div><dt>Orifice flow</dt><dd>{formatNumber(orificeResult.flowGallonsPerMinute, 1)} gpm</dd></div>
              <div><dt>Orifice flow</dt><dd>{formatNumber(orificeResult.flowMillionGallonsPerDay, 3)} MGD</dd></div>
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

          {usesPipeDiameter ? (
            <div className="pipe-visual" aria-label="Pipe cross-section visualization">
              <div className="pipe-circle" style={{ '--pipe-size': `${pipeVisualSizePercent}%` } as React.CSSProperties}>
                <span>{formatNumber(diameterInches, 1)} in</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="water-panel chart-panel">
        <h2>{chartHeading}</h2>
        <p>{chartDescription}</p>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={chartAriaLabel} />
      </div>

      {futureFluidDynamicsEquations.length > 0 ? (
        <div className="water-panel future-equations">
          <h2>Next equations to add</h2>
          <p>These are common water-operator fluid-dynamics relationships to expand into the selector after the current tools work well.</p>
          <ul>
            {futureFluidDynamicsEquations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
