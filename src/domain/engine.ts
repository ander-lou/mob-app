import type { MobDecision, Observation } from './types'

const base = (observation: Observation): MobDecision => ({
  date: observation.localDate,
  clinicalRuleVersion: 'MOB-KL-DEMO-0.1',
  state: 'UNCERTAIN_OR_CONFLICTING',
  fertilityState: 'uncertain',
  certainty: 'needs_review',
  phaseLabel: 'Registro em revisão',
  applicableRule: 'NONE',
  ruleLabel: 'Sem regra aplicada',
  peakStatus: 'none',
  guidance: {
    avoid: { value: 'undetermined', label: 'Não foi possível determinar', detail: 'Revise o registro ou converse com sua instrutora.' },
    achieve: { value: 'undetermined', label: 'Não foi possível estimar com segurança', detail: 'Revise o registro ou converse com sua instrutora.' },
  },
  evidence: [],
  warnings: ['Demonstração com lógica provisória — requer validação clínica.'],
})

export function interpretObservation(observation: Observation, previous?: Observation): MobDecision {
  const decision = base(observation)

  if (observation.specialSituation) {
    return { ...decision, state: 'SPECIAL_SITUATION_REVIEW', phaseLabel: 'Situação especial', warnings: [...decision.warnings, 'O padrão precisa de acompanhamento individual.'] }
  }

  if (observation.sensation === 'unknown' || observation.appearance === 'unknown') return decision

  if (observation.bleeding === 'heavy') {
    return {
      ...decision,
      state: 'HEAVY_BLEEDING_R1',
      fertilityState: 'potentially_fertile',
      certainty: observation.recordStatus === 'day_closed' ? 'confirmed' : 'provisional',
      phaseLabel: 'Sangramento forte',
      applicableRule: 'R1',
      ruleLabel: 'Regra 1 · sangramento forte',
      guidance: {
        avoid: { value: 'wait', label: 'Aguarde relação vaginal hoje', detail: 'O sangramento pode mascarar o início do muco fértil.' },
        achieve: { value: 'undetermined', label: 'Não foi possível estimar com segurança', detail: 'O sangramento pode dificultar a observação do padrão.' },
      },
      evidence: ['Sangramento forte registrado hoje.'],
    }
  }

  if (observation.sensation === 'slippery') {
    return {
      ...decision,
      state: 'PEAK_CANDIDATE',
      fertilityState: 'potentially_fertile',
      certainty: 'provisional',
      phaseLabel: 'Ápice em confirmação',
      applicableRule: 'PEAK',
      ruleLabel: 'Regra do Ápice · observação em curso',
      peakStatus: 'candidate',
      peakDate: observation.localDate,
      guidance: {
        avoid: { value: 'wait', label: 'Aguarde relação vaginal hoje', detail: 'A sensação escorregadia indica fertilidade potencial.' },
        achieve: { value: 'most_favorable', label: 'Momento mais favorável', detail: 'A sensação escorregadia é o sinal principal observado pelo MOB.' },
      },
      evidence: ['Sensação escorregadia/lubrificativa registrada.'],
    }
  }

  if (observation.sensation === 'damp' || observation.sensation === 'wet' || ['creamy', 'shampoo_like', 'clear'].includes(observation.appearance)) {
    return {
      ...decision,
      state: 'CHANGE_WAIT_AND_SEE_R3',
      fertilityState: 'potentially_fertile',
      certainty: observation.recordStatus === 'day_closed' ? 'confirmed' : 'provisional',
      phaseLabel: 'Mudança observada',
      applicableRule: 'R3',
      ruleLabel: 'Regra 3 · mudou, aguarde e observe',
      guidance: {
        avoid: { value: 'wait', label: 'Aguarde relação vaginal hoje', detail: 'Houve mudança em relação ao padrão básico registrado.' },
        achieve: { value: 'potential', label: 'Fertilidade potencial', detail: 'Observe a evolução da sensação e da aparência.' },
      },
      evidence: [`Sensação ${observation.sensation === 'damp' ? 'úmida' : observation.sensation === 'wet' ? 'molhada' : 'alterada'} registrada.`, `Aparência ${appearanceLabel(observation.appearance).toLowerCase()}.`],
    }
  }

  if (observation.sensation === 'dry' && observation.appearance === 'nothing') {
    const alternateBlocked = previous?.intercourseVaginal === true
    const pending = observation.recordStatus !== 'day_closed'
    return {
      ...decision,
      state: pending ? 'BIP_UNCHANGED_R2_PENDING_EVENING' : alternateBlocked ? 'BIP_ALTERNATE_EVENING_UNAVAILABLE' : 'BIP_UNCHANGED_R2_AVAILABLE_EVENING',
      fertilityState: pending || alternateBlocked ? 'uncertain' : 'recognized_infertility',
      certainty: pending ? 'provisional' : 'confirmed',
      phaseLabel: 'Padrão básico sem mudança',
      applicableRule: 'R2',
      ruleLabel: 'Regra 2 · noites alternadas no PBI',
      guidance: {
        avoid: pending
          ? { value: 'undetermined', label: 'Observe até o fim do dia', detail: 'A Regra 2 só pode ser avaliada após o fechamento do registro.' }
          : alternateBlocked
            ? { value: 'wait', label: 'Esta noite não está disponível', detail: 'Houve relação vaginal registrada na noite anterior.' }
            : { value: 'available', label: 'Relação disponível esta noite', detail: 'O dia permaneceu sem mudança e a alternância está satisfeita.' },
        achieve: { value: 'probably_low', label: 'Chance provavelmente baixa hoje', detail: 'O padrão básico permaneceu sem mudança.' },
      },
      evidence: ['Sensação seca durante o dia.', 'Nenhuma secreção observada.'],
    }
  }

  return decision
}

export function appearanceLabel(value: Observation['appearance']) {
  return ({ nothing: 'Nada', blood: 'Sangue', spotting: 'Mancha', creamy: 'Cremosa', shampoo_like: 'Tipo shampoo', clear: 'Clara/transparente', other: 'Outra descrição', unknown: 'Não informado' } as const)[value]
}

export function sensationLabel(value: Observation['sensation']) {
  return ({ dry: 'Seca', damp: 'Úmida', wet: 'Molhada', slippery: 'Escorregadia', other: 'Outra descrição', unknown: 'Não informado' } as const)[value]
}
