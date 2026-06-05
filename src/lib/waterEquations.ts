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

export type EquationOption = {
  id: string;
  name: string;
  formula: string;
  description: string;
  examUse: string;
};

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
];

export const futureFluidDynamicsEquations = [
  'Hazen-Williams head loss: pressure loss through water mains',
  'Darcy-Weisbach head loss: friction loss from velocity, diameter, and friction factor',
  'Reynolds number: laminar/transitional/turbulent flow classification',
  'Bernoulli energy equation: elevation head, pressure head, and velocity head',
  'Detention time: volume divided by flow for basins, tanks, and clearwells',
  'Weir/orifice flow: estimating open-channel or restriction discharge',
] as const;

export function calculateContinuityFlow(inputs: ContinuityInputs): ContinuityResult {
  const diameterFeet = inputs.diameterInches / 12;
  const radiusFeet = diameterFeet / 2;
  const areaSquareFeet = Math.PI * radiusFeet ** 2;
  const flowCubicFeetPerSecond = areaSquareFeet * inputs.velocityFeetPerSecond;
  const flowGallonsPerMinute = flowCubicFeetPerSecond * 448.831;
  const flowMillionGallonsPerDay = flowCubicFeetPerSecond * 0.646317;

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

export function calculatePipeVisualSizePercent(diameterInches: number): number {
  const minDiameter = 1;
  const maxDiameter = 24;
  const minSizePercent = 14;
  const maxSizePercent = 88;
  const clampedDiameter = Math.min(maxDiameter, Math.max(minDiameter, diameterInches));
  const normalizedLogScale = Math.log(clampedDiameter / minDiameter + 1) / Math.log(maxDiameter / minDiameter + 1);

  return minSizePercent + normalizedLogScale * (maxSizePercent - minSizePercent);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: value === 0 ? 0 : Math.min(1, digits),
  }).format(value);
}
