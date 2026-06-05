export type ContinuityInputs = {
  diameterInches: number;
  velocityFeetPerSecond: number;
};

export type ContinuityResult = ContinuityInputs & {
  diameterFeet: number;
  radiusFeet: number;
  areaSquareFeet: number;
  flowCubicFeetPerSecond: number;
  flowGallonsPerMinute: number;
  flowMillionGallonsPerDay: number;
};

export type HazenWilliamsInputs = {
  flowGallonsPerMinute: number;
  diameterInches: number;
  hazenWilliamsC: number;
  pipeLengthFeet: number;
};

export type HazenWilliamsResult = HazenWilliamsInputs & {
  headLossFeet: number;
  headLossFeetPer100Feet: number;
  pressureLossPsi: number;
};

export type EquationOption = {
  id: string;
  name: string;
  formula: string;
  description: string;
  examUse: string;
  coefficientNotes?: string[];
};

const INCHES_PER_FOOT = 12;
const RADIUS_FROM_DIAMETER = 2;

// Exact/standard water-unit conversions used by the continuity equation.
const GALLONS_PER_CUBIC_FOOT = 7.48052;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_DAY = 1440;
const MILLION = 1_000_000;
const GPM_PER_CFS = GALLONS_PER_CUBIC_FOOT * SECONDS_PER_MINUTE;
const MGD_PER_CFS = (GALLONS_PER_CUBIC_FOOT * SECONDS_PER_MINUTE * MINUTES_PER_DAY) / MILLION;

// Hazen-Williams empirical constants for the common US customary form:
// hₗ(ft) = 4.52 × L(ft) × Q(gpm)^1.85 ÷ (C^1.85 × d(in)^4.87).
// They are not derived from first principles; they fit observed turbulent water flow
// in pressurized pipe and bake in the ft/gpm/in unit conversions.
const HAZEN_WILLIAMS_US_COEFFICIENT = 4.52;
const HAZEN_WILLIAMS_FLOW_EXPONENT = 1.85;
const HAZEN_WILLIAMS_ROUGHNESS_EXPONENT = 1.85;
const HAZEN_WILLIAMS_DIAMETER_EXPONENT = 4.87;
const FEET_PER_100_FEET = 100;
const PSI_PER_FOOT_OF_WATER = 0.433;

// Display-only bounds for the pipe cross-section graphic. The log scale keeps
// small pipes visible while preventing large-pipe examples from overflowing.
const MIN_VISUAL_DIAMETER_INCHES = 1;
const MAX_VISUAL_DIAMETER_INCHES = 24;
const MIN_PIPE_VISUAL_SIZE_PERCENT = 14;
const MAX_PIPE_VISUAL_SIZE_PERCENT = 88;

export const fluidDynamicsEquationOptions: EquationOption[] = [
  {
    id: 'continuity-flow',
    name: 'Continuity flow rate',
    formula: 'Q = A × v, where A = π(d/2)²',
    description:
      'Computes flow from pipe diameter and water velocity. It is a core water-operator relationship because treatment and distribution questions often move between pipe size, velocity, and flow rate.',
    examUse:
      'Use it when a problem gives a pipe diameter plus velocity and asks for cfs, gpm, or MGD. This is the first building block before head loss, detention time, and dosage problems.',
  },
  {
    id: 'hazen-williams-head-loss',
    name: 'Hazen-Williams head loss',
    formula: 'hₗ = 4.52 × L × Q^1.85 ÷ (C^1.85 × d^4.87)',
    description:
      'Estimates friction head loss through pressurized water pipe using flow, pipe diameter, pipe length, and the Hazen-Williams roughness coefficient.',
    examUse:
      'Use it when a water distribution problem asks for friction loss, pressure loss, or the effect of pipe size/material on head loss. In this US customary form: Q is gpm, d is inches, L is feet, and hₗ is feet of water.',
    coefficientNotes: [
      '4.52 is the empirical US-customary coefficient; it folds observed water-flow behavior together with the gpm, inch, foot unit choices.',
      '1.85 is the empirical exponent on both flow Q and roughness C. Because Q is raised above 1, head loss increases faster than flow.',
      '4.87 is the empirical diameter exponent. The large exponent is why small diameter changes have a big impact on friction loss.',
      '0.433 psi per ft of water converts calculated head loss into pressure loss.',
    ],
  },
];

export const futureFluidDynamicsEquations = [
  'Darcy-Weisbach head loss: friction loss from velocity, diameter, and friction factor',
  'Reynolds number: laminar/transitional/turbulent flow classification',
  'Bernoulli energy equation: elevation head, pressure head, and velocity head',
  'Detention time: volume divided by flow for basins, tanks, and clearwells',
  'Weir/orifice flow: estimating open-channel or restriction discharge',
] as const;

export function calculateContinuityFlow(inputs: ContinuityInputs): ContinuityResult {
  const diameterFeet = inputs.diameterInches / INCHES_PER_FOOT;
  const radiusFeet = diameterFeet / RADIUS_FROM_DIAMETER;
  const areaSquareFeet = Math.PI * radiusFeet ** 2;
  const flowCubicFeetPerSecond = areaSquareFeet * inputs.velocityFeetPerSecond;
  const flowGallonsPerMinute = flowCubicFeetPerSecond * GPM_PER_CFS;
  const flowMillionGallonsPerDay = flowCubicFeetPerSecond * MGD_PER_CFS;

  return {
    ...inputs,
    diameterFeet,
    radiusFeet,
    areaSquareFeet,
    flowCubicFeetPerSecond,
    flowGallonsPerMinute,
    flowMillionGallonsPerDay,
  };
}

export function calculateHazenWilliamsHeadLoss(inputs: HazenWilliamsInputs): HazenWilliamsResult {
  const headLossFeet =
    (HAZEN_WILLIAMS_US_COEFFICIENT *
      inputs.pipeLengthFeet *
      inputs.flowGallonsPerMinute ** HAZEN_WILLIAMS_FLOW_EXPONENT) /
    (inputs.hazenWilliamsC ** HAZEN_WILLIAMS_ROUGHNESS_EXPONENT * inputs.diameterInches ** HAZEN_WILLIAMS_DIAMETER_EXPONENT);
  const headLossFeetPer100Feet = (headLossFeet / inputs.pipeLengthFeet) * FEET_PER_100_FEET;
  const pressureLossPsi = headLossFeet * PSI_PER_FOOT_OF_WATER;

  return {
    ...inputs,
    headLossFeet,
    headLossFeetPer100Feet,
    pressureLossPsi,
  };
}

export function calculatePipeVisualSizePercent(diameterInches: number): number {
  const clampedDiameter = Math.min(MAX_VISUAL_DIAMETER_INCHES, Math.max(MIN_VISUAL_DIAMETER_INCHES, diameterInches));
  const normalizedLogScale =
    Math.log(clampedDiameter / MIN_VISUAL_DIAMETER_INCHES + 1) /
    Math.log(MAX_VISUAL_DIAMETER_INCHES / MIN_VISUAL_DIAMETER_INCHES + 1);

  return MIN_PIPE_VISUAL_SIZE_PERCENT + normalizedLogScale * (MAX_PIPE_VISUAL_SIZE_PERCENT - MIN_PIPE_VISUAL_SIZE_PERCENT);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: value === 0 ? 0 : Math.min(1, digits),
  }).format(value);
}
