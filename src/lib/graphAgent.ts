export type GraphToolId = "create-line-chart" | "create-bar-chart" | "create-scatter-plot" | "create-function-plot";
export type GraphKind = "line" | "bar" | "scatter" | "function";

export type GraphPoint = {
  x: number;
  y: number;
  label: string;
};

export type GraphSpec = {
  kind: GraphKind;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  points: GraphPoint[];
  expression?: string;
};

export type GraphTool = {
  id: GraphToolId;
  name: string;
  description: string;
};

export type GraphAgentResponse = {
  answer: string;
  toolCall: {
    toolId: GraphToolId;
    rationale: string;
  };
  chart: GraphSpec;
  followUps: string[];
};

export const graphAgentTools: GraphTool[] = [
  {
    id: "create-line-chart",
    name: "Create line chart",
    description: "D3 tool for plotting ordered trends, time series, and numeric sequences.",
  },
  {
    id: "create-bar-chart",
    name: "Create bar chart",
    description: "D3 tool for comparing categories, counts, budgets, scores, or rankings.",
  },
  {
    id: "create-scatter-plot",
    name: "Create scatter plot",
    description: "D3 tool for showing paired observations, correlation, clusters, and outliers.",
  },
  {
    id: "create-function-plot",
    name: "Create function plot",
    description: "D3 tool for graphing equations such as y=x^2, y=2x+1, sine waves, and exponentials.",
  },
];

export const graphProductMetadata = {
  name: "Graph Agent",
  description: "Chat agent with D3 graph tools that turns arbitrary analytical questions into interactive visual answers.",
  department: "Systems Research",
  href: "/products/graph-agent",
} as const;

export const graphAgentPresentation = {
  layout: "chat-canvas",
  heroTitle: "Chat with a graph canvas.",
  primaryRegions: ["chat-thread", "graph-canvas"],
  canvasPrinciples: [
    "Make the rendered graph canvas the dominant surface.",
    "Keep tool chrome secondary to the chat and canvas loop.",
    "Show the latest chart as an artifact, not a report card.",
  ],
} as const;

const monthPattern = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
const labeledNumberPattern = /([a-z][a-z0-9%/ -]{0,32}?)\s*[:=]?\s*(-?\d+(?:\.\d+)?)/gi;
const pairPattern = /\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\)/g;

export function answerGraphQuestion(question: string): GraphAgentResponse {
  const trimmed = question.trim();
  const functionSpec = parseFunctionQuestion(trimmed);
  if (functionSpec) {
    return buildResponse("create-function-plot", "The question names an equation, so I used the function plotting tool.", functionSpec);
  }

  const pairedPoints = parseCoordinatePairs(trimmed);
  if (pairedPoints.length >= 2) {
    return buildResponse("create-scatter-plot", "The question includes coordinate pairs, so I used the scatter plot tool.", {
      kind: "scatter",
      title: titleFromQuestion(trimmed, "Paired observations"),
      xAxisLabel: "x",
      yAxisLabel: "y",
      points: pairedPoints,
    });
  }

  const labeledPoints = parseLabeledNumbers(trimmed);
  if (labeledPoints.length >= 2) {
    const wantsBar = /\b(bar|compare|ranking|rank|category|categories|count|counts)\b/i.test(trimmed);
    const wantsLine = /\b(line|trend|over time|timeline|forecast|growth|change|revenue|sales)\b/i.test(trimmed) || labeledPoints.some((point) => monthPattern.test(point.label));
    const kind: GraphKind = wantsBar && !wantsLine ? "bar" : "line";
    const toolId: GraphToolId = kind === "bar" ? "create-bar-chart" : "create-line-chart";
    return buildResponse(toolId, `The question provides labeled values, so I used the ${kind} chart tool.`, {
      kind,
      title: titleFromQuestion(trimmed, kind === "bar" ? "Category comparison" : "Trend analysis"),
      xAxisLabel: kind === "bar" ? "Category" : "Observation",
      yAxisLabel: inferYAxisLabel(trimmed),
      points: labeledPoints,
    });
  }

  return buildResponse("create-line-chart", "No structured data was supplied, so I used a generated scenario tool to make the question explorable.", fallbackScenario(trimmed));
}

function buildResponse(toolId: GraphToolId, rationale: string, chart: GraphSpec): GraphAgentResponse {
  return {
    answer: summarize(chart),
    toolCall: { toolId, rationale },
    chart,
    followUps: [
      "Try adding exact numbers or coordinate pairs for a more specific graph.",
      "Ask for a bar, line, scatter, or function plot to steer the tool choice.",
      "Change labels or ranges in the prompt and resubmit to redraw the D3 chart.",
    ],
  };
}

function parseLabeledNumbers(question: string): GraphPoint[] {
  const cleaned = question
    .replace(/\b(make|create|draw|show|plot|graph|chart|compare|for|and|with|over)\b/gi, " ")
    .replace(/[.;]/g, ",");
  const points: GraphPoint[] = [];
  for (const match of cleaned.matchAll(labeledNumberPattern)) {
    const rawLabel = match[1].replace(/[,，:]$/g, "").trim();
    const y = Number(match[2]);
    if (!rawLabel || Number.isNaN(y)) continue;
    if (/^-?\d/.test(rawLabel)) continue;
    const words = rawLabel.split(/\s+/).filter(Boolean);
    const label = words[words.length - 1] ?? rawLabel;
    points.push({ x: points.length, y, label });
  }
  return dedupePoints(points).slice(0, 16);
}

function parseCoordinatePairs(question: string): GraphPoint[] {
  const points: GraphPoint[] = [];
  for (const match of question.matchAll(pairPattern)) {
    const x = Number(match[1]);
    const y = Number(match[2]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ x, y, label: `(${x}, ${y})` });
    }
  }
  return points.slice(0, 40);
}

function parseFunctionQuestion(question: string): GraphSpec | null {
  const normalized = question.replace(/\s+/g, " ");
  const expressionMatch = normalized.match(/y\s*=\s*([^,;]+?)(?:\s+from\s+|\s+for\s+x\s*=|$)/i);
  if (!expressionMatch) return null;

  const expression = expressionMatch[1].trim().replace(/\s/g, "");
  const rangeMatch = normalized.match(/(?:from|between)\s+(-?\d+(?:\.\d+)?)\s+(?:to|and)\s+(-?\d+(?:\.\d+)?)/i);
  const xMin = rangeMatch ? Number(rangeMatch[1]) : -10;
  const xMax = rangeMatch ? Number(rangeMatch[2]) : 10;
  const domain: [number, number] = xMin <= xMax ? [xMin, xMax] : [xMax, xMin];
  const points = sampleExpression(expression, domain);
  if (points.length === 0) return null;

  return {
    kind: "function",
    title: `y = ${expression}`,
    xAxisLabel: "x",
    yAxisLabel: "y",
    expression,
    points,
  };
}

function sampleExpression(expression: string, [xMin, xMax]: [number, number]): GraphPoint[] {
  const safeExpression = expression
    .replace(/\^/g, "**")
    .replace(/sin\(/gi, "Math.sin(")
    .replace(/cos\(/gi, "Math.cos(")
    .replace(/tan\(/gi, "Math.tan(")
    .replace(/sqrt\(/gi, "Math.sqrt(")
    .replace(/log\(/gi, "Math.log(")
    .replace(/exp\(/gi, "Math.exp(");
  if (!/^[0-9x+\-*/().,\s*Mathsincotaqreplg]+$/i.test(safeExpression)) return [];

  const evaluator = new Function("x", `return ${safeExpression};`) as (x: number) => number;
  const stepCount = 40;
  const step = (xMax - xMin) / stepCount || 1;
  const points: GraphPoint[] = [];
  for (let index = 0; index <= stepCount; index += 1) {
    const rawX = index === stepCount ? xMax : xMin + step * index;
    const x = round(rawX, 4);
    try {
      const y = Number(evaluator(x));
      if (Number.isFinite(y)) points.push({ x, y: round(y, 4), label: `${x}` });
    } catch {
      return [];
    }
  }
  return points;
}

function fallbackScenario(question: string): GraphSpec {
  const seed = Array.from(question).reduce((sum, char) => sum + char.charCodeAt(0), 0) || 42;
  const points = Array.from({ length: 6 }, (_, index) => {
    const x = index + 1;
    const y = Math.max(1, round(((seed % 17) + 8) * (1 + index * 0.18) + Math.sin(index + seed) * 4, 2));
    return { x: index, y, label: `Scenario ${x}` };
  });
  return {
    kind: "line",
    title: titleFromQuestion(question, "Exploratory scenario"),
    xAxisLabel: "Scenario step",
    yAxisLabel: "Relative score",
    points,
  };
}

function summarize(chart: GraphSpec): string {
  if (chart.points.length === 0) return "I created an empty graph specification. Add data to render a chart.";
  const first = chart.points[0];
  const last = chart.points[chart.points.length - 1];
  const min = chart.points.reduce((best, point) => (point.y < best.y ? point : best), first);
  const max = chart.points.reduce((best, point) => (point.y > best.y ? point : best), first);
  const direction = last.y > first.y ? "upward" : last.y < first.y ? "downward" : "flat";
  return `I used a ${chart.kind} D3 graph. The visible trend is ${direction}; the low point is ${min.label} (${formatValue(min.y)}) and the high point is ${max.label} (${formatValue(max.y)}).`;
}

function titleFromQuestion(question: string, fallback: string): string {
  const compact = question.replace(/\s+/g, " ").trim();
  if (!compact) return fallback;
  const stripped = compact.replace(/^(make|create|draw|show|plot|graph|chart|compare)\s+/i, "");
  return stripped.length > 64 ? `${stripped.slice(0, 61)}…` : stripped;
}

function inferYAxisLabel(question: string): string {
  const lower = question.toLowerCase();
  if (lower.includes("revenue") || lower.includes("sales")) return "Value";
  if (lower.includes("count")) return "Count";
  if (lower.includes("percent") || lower.includes("%")) return "Percent";
  if (lower.includes("score")) return "Score";
  return "Value";
}

function dedupePoints(points: GraphPoint[]): GraphPoint[] {
  const seen = new Set<string>();
  return points.filter((point) => {
    const key = `${point.label}:${point.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatValue(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/0+$/g, "").replace(/\.$/, "");
}
