import type { Observation, Revision } from './types'

export const observations: Observation[] = [
  { id: 'obs-01', localDate: '2026-08-28', cycleDay: 1, bleeding: 'heavy', sensation: 'wet', appearance: 'blood', intercourseVaginal: false, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-08-28T21:12:00-03:00' },
  { id: 'obs-02', localDate: '2026-08-29', cycleDay: 2, bleeding: 'heavy', sensation: 'wet', appearance: 'blood', intercourseVaginal: false, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-08-29T21:04:00-03:00' },
  { id: 'obs-03', localDate: '2026-08-30', cycleDay: 3, bleeding: 'moderate', sensation: 'damp', appearance: 'blood', intercourseVaginal: false, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-08-30T21:30:00-03:00' },
  { id: 'obs-04', localDate: '2026-08-31', cycleDay: 4, bleeding: 'spotting', sensation: 'damp', appearance: 'spotting', intercourseVaginal: false, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-08-31T20:44:00-03:00' },
  { id: 'obs-05', localDate: '2026-09-01', cycleDay: 5, bleeding: 'none', sensation: 'dry', appearance: 'nothing', intercourseVaginal: false, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-09-01T21:10:00-03:00' },
  { id: 'obs-06', localDate: '2026-09-02', cycleDay: 6, bleeding: 'none', sensation: 'dry', appearance: 'nothing', intercourseVaginal: true, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-09-02T22:18:00-03:00' },
  { id: 'obs-07', localDate: '2026-09-03', cycleDay: 7, bleeding: 'none', sensation: 'dry', appearance: 'nothing', intercourseVaginal: false, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-09-03T21:03:00-03:00' },
  { id: 'obs-08', localDate: '2026-09-04', cycleDay: 8, bleeding: 'none', sensation: 'dry', appearance: 'nothing', intercourseVaginal: true, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-09-04T21:48:00-03:00' },
  { id: 'obs-09', localDate: '2026-09-05', cycleDay: 9, bleeding: 'none', sensation: 'dry', appearance: 'nothing', intercourseVaginal: false, recordStatus: 'day_closed', revision: 2, updatedAt: '2026-09-05T22:02:00-03:00' },
  { id: 'obs-10', localDate: '2026-09-06', cycleDay: 10, bleeding: 'none', sensation: 'dry', appearance: 'nothing', intercourseVaginal: false, recordStatus: 'day_closed', revision: 1, updatedAt: '2026-09-06T20:52:00-03:00' },
  { id: 'obs-11', localDate: '2026-09-07', cycleDay: 11, bleeding: 'none', sensation: 'damp', appearance: 'creamy', intercourseVaginal: null, recordStatus: 'draft', revision: 1, updatedAt: '2026-09-07T14:35:00-03:00' },
]

export const revisions: Revision[] = [
  { id: 'rev-01', observationId: 'obs-09', revision: 2, summary: 'Aparência revisada de “não informada” para “nada”.', changedAt: '5 set., 22:02' },
]
