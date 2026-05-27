interface ScoringInput {
  surplusAmount: number
  claimDeadline?: Date | null
  ownerContactConfidence?: number
}

export function scoreCase(input: ScoringInput): number {
  const { surplusAmount, claimDeadline, ownerContactConfidence = 0.5 } = input

  const valueScore = Math.min(50, (surplusAmount / 10000) * 5)

  let urgencyScore = 0
  if (claimDeadline) {
    const daysToDeadline = Math.max(0, (claimDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    urgencyScore = Math.max(0, 30 - daysToDeadline * 0.1)
  }

  const contactScore = ownerContactConfidence * 20

  return Math.min(100, Math.round((valueScore + urgencyScore + contactScore) * 10) / 10)
}

export function getPriority(score: number): string {
  if (score >= 70) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

export function generateOutreachMessage(ownerFirstName: string, surplusAmount: number, county: string, state: string): string {
  return `Hi ${ownerFirstName}, we located unclaimed surplus funds estimated at $${surplusAmount.toLocaleString()} tied to a property record in ${county} County, ${state}. We can help you recover it within 7-14 days. Reply YES to learn more or call us.`
}

export function generateEmailSubject(ownerFirstName: string, surplusAmount: number): string {
  return `${ownerFirstName}, you may be owed $${surplusAmount.toLocaleString()} in unclaimed surplus funds`
}
