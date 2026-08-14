export interface WorkQuote {
  text: string
  author: string
}

const WORK_QUOTES: WorkQuote[] = [
  { text: 'Suffering is the true test of life.', author: 'David Goggins' },
  { text: 'You are in danger of living a life so comfortable that you die without ever realizing your potential.', author: 'David Goggins' },
  { text: 'Motivation is crap. Motivation comes and goes.', author: 'David Goggins' },
  { text: 'The only way you gain mental toughness is to do things you hate to do.', author: 'David Goggins' },
  { text: 'Discipline equals freedom.', author: 'Jocko Willink' },
  { text: 'Don’t expect to be motivated every day. Get out there and get it done.', author: 'Jocko Willink' },
  { text: 'Hard choices, easy life. Easy choices, hard life.', author: 'Jerzy Gregorek' },
  { text: 'The obstacle is the way.', author: 'Ryan Holiday' },
  { text: 'We suffer more in imagination than in reality.', author: 'Seneca' },
  { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { text: 'Do the hard jobs first. The easy jobs will take care of themselves.', author: 'Dale Carnegie' },
]

export function randomWorkQuote(): WorkQuote {
  const index = Math.floor(Math.random() * WORK_QUOTES.length)
  return WORK_QUOTES[index]
}

export function dailyWorkQuote(dateKey: string): WorkQuote {
  const n = dateKey.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
  return WORK_QUOTES[n % WORK_QUOTES.length]
}
