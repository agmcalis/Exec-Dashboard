/**
 * Simple linear regression on quarterly trend values.
 * Returns the forecasted value `quartersAhead` quarters beyond the last data point.
 */
export function linearForecast(values: number[], quartersAhead: number): number {
  const n = values.length
  if (n < 2) return values[n - 1] ?? 0
  const xMean = (n - 1) / 2
  const yMean = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  values.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2 })
  const slope = den === 0 ? 0 : num / den
  return yMean - slope * xMean + slope * (n - 1 + quartersAhead)
}

/**
 * How many quarters from the last trend point (Q4 2025, index 23) to a target quarter string.
 * Supports quarters in format "1Q 2026", "2Q 2026", etc.
 */
export function quartersUntil(targetQuarter: string): number {
  // Q4 2025 = base (the last point of our 24-quarter trend)
  const BASE_YEAR = 2025, BASE_Q = 4
  const parts = targetQuarter.trim().split(/\s+/)
  if (parts.length !== 2) return 4
  const [qPart, yearPart] = parts
  const q = parseInt(qPart)
  const y = parseInt(yearPart)
  return (y - BASE_YEAR) * 4 + (q - BASE_Q)
}

/**
 * Given a goal value and trend data, predict which quarter the goal will be reached.
 * Returns a quarter string like "3Q 2026" or null if not reachable within 16 quarters.
 */
export function forecastGoalQuarter(
  trend: number[],
  goal: number,
  direction: 'lower_better' | 'higher_better',
): string | null {
  for (let i = 1; i <= 16; i++) {
    const v = linearForecast(trend, i)
    const reached = direction === 'lower_better' ? v <= goal : v >= goal
    if (reached) {
      const baseQ = 4, baseY = 2025
      const totalQ = baseQ + i
      const q = ((totalQ - 1) % 4) + 1
      const y = baseY + Math.floor((totalQ - 1) / 4)
      return `${q}Q ${y}`
    }
  }
  return null
}
