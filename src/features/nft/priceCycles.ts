export const NFT_PRICE_CYCLES: Record<string, readonly number[]> = {
  'emerald-ape-042': [1.19, 1.29, 1.31, 1.25, 1.19],
  'sage-nomad-009': [1.69, 1.75, 1.82, 1.72, 1.69],
  'neon-vessel-552': [1.99, 2.08, 2.14, 2.03, 1.99],
  'cosmic-bloom-118': [1.29, 1.36, 1.42, 1.33, 1.29],
  'violet-nomad-314': [1.39, 1.46, 1.53, 1.43, 1.39],
  'ivory-baron-088': [1.79, 1.88, 1.94, 1.84, 1.79],
  'golden-beat-207': [0.99, 1.04, 1.11, 1.02, 0.99],
  'golden-mink-209': [0.99, 1.08, 1.16, 1.03, 0.99],
  'golden-signal-160': [0.39, 0.49, 0.55, 0.43, 0.39],
  'neon-vessel-884': [0.79, 0.84, 0.91, 0.82, 0.79],
  'cosmic-bloom-204': [0.89, 0.94, 1.02, 0.92, 0.89],
  'violet-nomad-681': [1.09, 1.16, 1.23, 1.13, 1.09],
  'golden-beat-318': [0.69, 0.74, 0.81, 0.72, 0.69],
}

export function getOscillatingPrice(nftId: string, step: number): string | undefined {
  const cycle = NFT_PRICE_CYCLES[nftId]
  if (!cycle) return undefined
  return `${cycle[step % cycle.length].toFixed(2)} ETH`
}
