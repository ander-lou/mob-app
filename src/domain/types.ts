export type Goal = 'avoid' | 'achieve'
export type FertilityState = 'potentially_fertile' | 'recognized_infertility' | 'uncertain'
export type Certainty = 'confirmed' | 'provisional' | 'needs_review'
export type Rule = 'R1' | 'R2' | 'R3' | 'PEAK' | 'NONE'
export type MobState =
  | 'LEARNING_NO_BIP'
  | 'HEAVY_BLEEDING_R1'
  | 'BIP_UNCHANGED_R2_PENDING_EVENING'
  | 'BIP_UNCHANGED_R2_AVAILABLE_EVENING'
  | 'BIP_ALTERNATE_EVENING_UNAVAILABLE'
  | 'CHANGE_WAIT_AND_SEE_R3'
  | 'FERTILE_DEVELOPING_PATTERN'
  | 'PEAK_CANDIDATE'
  | 'PEAK_CONFIRMED'
  | 'POST_PEAK_DAY_1'
  | 'POST_PEAK_DAY_2'
  | 'POST_PEAK_DAY_3'
  | 'POST_PEAK_DAY_4_PLUS'
  | 'UNCERTAIN_OR_CONFLICTING'
  | 'SPECIAL_SITUATION_REVIEW'

export type Bleeding = 'none' | 'spotting' | 'light' | 'moderate' | 'heavy'
export type Sensation = 'dry' | 'damp' | 'wet' | 'slippery' | 'other' | 'unknown'
export type Appearance = 'nothing' | 'blood' | 'spotting' | 'creamy' | 'shampoo_like' | 'clear' | 'other' | 'unknown'

export type Observation = {
  id: string
  localDate: string
  cycleDay: number
  bleeding: Bleeding
  sensation: Sensation
  appearance: Appearance
  sensationRaw?: string
  appearanceRaw?: string
  intercourseVaginal: boolean | null
  recordStatus: 'draft' | 'day_closed' | 'retroactive'
  revision: number
  updatedAt: string
  specialSituation?: boolean
}

export type Guidance = {
  label: string
  detail: string
  value: 'available' | 'wait' | 'undetermined' | 'most_favorable' | 'potential' | 'probably_low'
}

export type MobDecision = {
  date: string
  clinicalRuleVersion: string
  state: MobState
  fertilityState: FertilityState
  certainty: Certainty
  phaseLabel: string
  applicableRule: Rule
  ruleLabel: string
  peakStatus: 'none' | 'candidate' | 'confirmed' | 'revoked'
  peakDate?: string
  guidance: Record<Goal, Guidance>
  evidence: string[]
  warnings: string[]
}

export type Revision = {
  id: string
  observationId: string
  revision: number
  summary: string
  changedAt: string
}
