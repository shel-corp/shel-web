export function currentTimestamp() {
  return new Date().toISOString();
}

export function hash32(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function checksum(seed: string) {
  const browserSeed = typeof navigator !== 'undefined'
    ? `${navigator.userAgent}|${screen.width}x${screen.height}`
    : 'server';
  return hash32(`${seed}|${browserSeed}`).toString(16).slice(0, 4).padStart(4, '0');
}
