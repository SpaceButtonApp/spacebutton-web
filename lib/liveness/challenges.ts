// Canonical challenge IDs — must stay in sync (by hand, no shared package across
// repos) with the mobile app's constants/livenessChallenges.ts and the backend's
// LIVENESS_CHALLENGE_IDS in schemas/verification.py.
export type ChallengeId =
  | 'BLINK_TWICE'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'TURN_UP'
  | 'TURN_DOWN'
  | 'SMILE'
  | 'OPEN_MOUTH'
  | 'RAISE_EYEBROWS'

export interface ChallengeDef {
  id: ChallengeId
  label: string
  instruction: string
}

// Web's MediaPipe blendshapes give a reliable signal for all 8 — unlike mobile,
// which drops RAISE_EYEBROWS (no usable signal on that stack).
export const CHALLENGE_POOL: ChallengeDef[] = [
  { id: 'BLINK_TWICE', label: 'Blink twice', instruction: 'Blink your eyes twice' },
  { id: 'TURN_LEFT', label: 'Turn head left', instruction: 'Slowly turn your head to the left' },
  { id: 'TURN_RIGHT', label: 'Turn head right', instruction: 'Slowly turn your head to the right' },
  { id: 'TURN_UP', label: 'Turn head up', instruction: 'Slowly tilt your head up' },
  { id: 'TURN_DOWN', label: 'Turn head down', instruction: 'Slowly tilt your head down' },
  { id: 'SMILE', label: 'Smile', instruction: 'Give us a smile' },
  { id: 'OPEN_MOUTH', label: 'Open mouth', instruction: 'Open your mouth' },
  { id: 'RAISE_EYEBROWS', label: 'Raise eyebrows', instruction: 'Raise your eyebrows' },
]

export function pickRandomChallenges(count = 3): ChallengeDef[] {
  const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
