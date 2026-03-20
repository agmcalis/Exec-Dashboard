export interface MockUser {
  id: string
  name: string
  firstName: string
  title: string
  initials: string
}

export const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Sarah Chen',          firstName: 'Sarah',    title: 'VP Quality & Patient Safety', initials: 'SC' },
  { id: 'u2', name: 'Dr. Marcus Williams', firstName: 'Marcus',   title: 'Chief Medical Officer',       initials: 'MW' },
  { id: 'u3', name: 'Jennifer Park',       firstName: 'Jennifer', title: 'Director of Quality',         initials: 'JP' },
  { id: 'u4', name: 'Robert Torres',       firstName: 'Robert',   title: 'VP Operations',               initials: 'RT' },
  { id: 'u5', name: 'Dr. Lisa Nguyen',     firstName: 'Lisa',     title: 'Patient Safety Officer',      initials: 'LN' },
]

export const DEFAULT_USER_ID = 'u1'
