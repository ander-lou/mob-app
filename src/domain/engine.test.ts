import { describe, expect, it } from 'vitest'
import { interpretObservation } from './engine'
import type { Observation } from './types'

const sample: Observation = {
  id: 'test', localDate: '2026-09-07', cycleDay: 11, bleeding: 'none', sensation: 'dry', appearance: 'nothing', intercourseVaginal: false, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-09-07T21:00:00-03:00',
}

describe('motor MOB demonstrativo', () => {
  it('aplica R1 sem presumir infertilidade em sangramento forte', () => {
    const result = interpretObservation({ ...sample, bleeding: 'heavy' })
    expect(result.applicableRule).toBe('R1')
    expect(result.fertilityState).toBe('potentially_fertile')
    expect(result.guidance.avoid.value).toBe('wait')
  })

  it('mantém R2 pendente enquanto o dia está aberto', () => {
    const result = interpretObservation({ ...sample, recordStatus: 'draft' })
    expect(result.state).toBe('BIP_UNCHANGED_R2_PENDING_EVENING')
    expect(result.guidance.avoid.value).toBe('undetermined')
  })

  it('bloqueia a noite alternada quando houve relação na noite anterior', () => {
    const result = interpretObservation(sample, { ...sample, id: 'previous', intercourseVaginal: true })
    expect(result.state).toBe('BIP_ALTERNATE_EVENING_UNAVAILABLE')
  })

  it('trata sensação escorregadia como Ápice candidato, não confirmado', () => {
    const result = interpretObservation({ ...sample, sensation: 'slippery', appearance: 'clear' })
    expect(result.peakStatus).toBe('candidate')
    expect(result.guidance.achieve.value).toBe('most_favorable')
  })

  it('degrada registro incompleto para indeterminado', () => {
    const result = interpretObservation({ ...sample, sensation: 'unknown' })
    expect(result.state).toBe('UNCERTAIN_OR_CONFLICTING')
    expect(result.guidance.avoid.value).toBe('undetermined')
  })
})
