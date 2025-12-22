/**
 * Daily Motivation Quotes for SmileCRM Dashboard
 * 
 * One quote is shown per day based on day of year.
 * All quotes are short, professional, and dental-practice oriented.
 */

export const MOTIVATION_QUOTES = [
  'Каждая улыбка, которую вы создаёте — это маленькое чудо.',
  'Ваша забота делает мир здоровее и счастливее.',
  'Сегодня — отличный день для новых достижений.',
  'Профессионализм и доброта — ваша суперсила.',
  'Каждый пациент — это история успеха.',
  'Ваш труд ценят больше, чем вы думаете.',
  'Уверенность приходит с каждым днём практики.',
  'Здоровые улыбки начинаются с вас.',
  'Маленькие шаги ведут к большим результатам.',
  'Сегодня вы снова изменили чью-то жизнь к лучшему.',
  'Ваша энергия вдохновляет пациентов и коллег.',
  'Каждый день — это возможность стать лучше.',
  'Терпение и мастерство — ключи к успеху.',
  'Вы делаете важную работу. Гордитесь собой!',
  'Новый день — новые возможности помочь людям.',
] as const

export type MotivationQuote = (typeof MOTIVATION_QUOTES)[number]

/**
 * Get today's motivation quote index based on day of year.
 * Same quote will be shown throughout the entire day.
 */
export function getDailyQuoteIndex(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  
  return dayOfYear % MOTIVATION_QUOTES.length
}

/**
 * Get today's motivation quote.
 */
export function getDailyQuote(): string {
  return MOTIVATION_QUOTES[getDailyQuoteIndex()]
}

