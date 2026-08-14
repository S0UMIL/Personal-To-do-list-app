function pick(quotes: string[], seed: string): string {
  const n = seed.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
  return quotes[n % quotes.length]
}

/** Short, progress-aware encouragement for today's home view. */
export function dailyMotivation(
  completed: number,
  total: number,
  dateKey: string,
): string {
  if (total === 0) return 'Pick your focus for today.'

  if (completed === total) {
    return pick(
      [
        'You showed up today.',
        'All done. Well played.',
        'Day complete — rest easy.',
      ],
      `${dateKey}-done`,
    )
  }

  const left = total - completed

  if (left === 1) {
    return pick(
      ["You're almost there.", 'One more — finish strong.', 'So close now.'],
      `${dateKey}-last`,
    )
  }

  if (left === 2) {
    return pick(
      ['Two more — you’ve got this.', 'Almost there. Keep going.', 'The finish line is close.'],
      `${dateKey}-two`,
    )
  }

  if (completed === 0) {
    return pick(
      [
        'Small steps start big days.',
        'Start with one thing.',
        'Momentum begins with a single task.',
      ],
      `${dateKey}-start`,
    )
  }

  if (completed / total >= 0.5) {
    return pick(
      ['Halfway there. Keep going.', 'You’re building momentum.', 'Past the halfway mark.'],
      `${dateKey}-half`,
    )
  }

  return pick(
    [
      'Small progress compounds.',
      'One task at a time.',
      'Showing up is the hard part — you did.',
    ],
    `${dateKey}-early`,
  )
}
