import type { Task } from '../types/tasks'

export const INITIAL_TASKS: Task[] = [
  // Task 1: Mortality O/E — Sarah created, assigned to Marcus + Jennifer
  {
    id: 'task-001',
    kpiId: 'mortality_oe_csa',
    title: 'Reduce Mortality O/E to 0.78',
    description: 'Drive mortality O/E ratio below 0.78 through enhanced early warning protocols, improved care bundles, and cross-department mortality review process.',
    goalValue: 0.78,
    targetQuarter: '4Q 2026',
    currentValue: 0.83,
    direction: 'lower_better',
    status: 'on_track',
    createdBy: 'u1',
    assignedTo: ['u2', 'u3'],
    createdAt: '2026-01-08T09:15:00.000Z',
    comments: [
      {
        id: 'c-001-1',
        userId: 'u2',
        text: 'Reviewed the mortality case series from Q4 2025. Two preventable cases identified — we are scheduling a rapid improvement event in February to address care gaps in early sepsis recognition.',
        createdAt: '2026-01-20T14:32:00.000Z',
      },
      {
        id: 'c-001-2',
        userId: 'u3',
        text: 'Quality team has finalized the mortality review dashboard. Weekly case review cadence starts next Monday. I will send the invite to all attendings.',
        createdAt: '2026-02-03T10:05:00.000Z',
      },
    ],
  },

  // Task 2: HA-VTE rate — Sarah created, assigned to herself, at risk
  {
    id: 'task-002',
    kpiId: 'ha_vte',
    title: 'Achieve HA-VTE Rate ≤ 0.45',
    description: 'Reduce hospital-associated VTE rate to 0.45 per 1,000 encounters by expanding pharmacologic prophylaxis compliance and nursing-led ambulation protocols.',
    goalValue: 0.45,
    targetQuarter: '2Q 2026',
    currentValue: 0.43,
    direction: 'lower_better',
    status: 'at_risk',
    createdBy: 'u1',
    assignedTo: ['u1'],
    createdAt: '2026-01-10T11:00:00.000Z',
    comments: [
      {
        id: 'c-002-1',
        userId: 'u1',
        text: 'Pharmacy audit completed — VTE pharmacoprophylaxis compliance dropped to 91% in January, down from 94%. Working with pharmacy leadership to identify the documentation workflow issue causing the gap.',
        createdAt: '2026-02-12T08:45:00.000Z',
      },
    ],
  },

  // Task 3: Sepsis Bundle — Marcus created, assigned to Sarah + Jennifer
  {
    id: 'task-003',
    kpiId: 'sepsis_bundle',
    title: 'Sepsis Bundle Compliance to 85%',
    description: 'Increase severe sepsis and septic shock bundle compliance from current 79% to 85% through simulation training, real-time alerts, and care team huddles.',
    goalValue: 85,
    targetQuarter: '4Q 2026',
    currentValue: 79.2,
    direction: 'higher_better',
    status: 'on_track',
    createdBy: 'u2',
    assignedTo: ['u1', 'u3'],
    createdAt: '2026-01-15T13:30:00.000Z',
    comments: [
      {
        id: 'c-003-1',
        userId: 'u1',
        text: 'Simulation training for ED and ICU nurses completed last week — 87 staff trained. Post-training knowledge assessment scores averaged 92%. Good foundation for the compliance push.',
        createdAt: '2026-02-05T15:20:00.000Z',
      },
      {
        id: 'c-003-2',
        userId: 'u3',
        text: 'Real-time sepsis alert firing accuracy reviewed. Alert precision is 68% — working with IT to refine criteria to reduce alert fatigue. Target is 80% precision by end of Q1.',
        createdAt: '2026-02-18T09:10:00.000Z',
      },
    ],
  },

  // Task 4: VTE Prophylaxis — Jennifer created, assigned to Sarah, at risk
  {
    id: 'task-004',
    kpiId: 'vte_ppx',
    title: 'VTE Pharmacologic Prophylaxis to 96%',
    description: 'Push VTE pharmacologic prophylaxis compliance from 94.2% to 96% by addressing order set compliance and documentation accuracy across medical and surgical floors.',
    goalValue: 96,
    targetQuarter: '3Q 2026',
    currentValue: 94.2,
    direction: 'higher_better',
    status: 'at_risk',
    createdBy: 'u3',
    assignedTo: ['u1'],
    createdAt: '2026-01-22T10:00:00.000Z',
    comments: [],
  },

  // Task 5: 30-Day HF Mortality — Sarah created, assigned to everyone
  {
    id: 'task-005',
    kpiId: 'mortality_30d_hf',
    title: '30-Day Heart Failure Mortality to 9.0%',
    description: 'Reduce 30-day risk-adjusted heart failure mortality from 10.7% to 9.0% through guideline-directed medical therapy optimization, HF clinic transitions, and post-discharge follow-up within 7 days.',
    goalValue: 9.0,
    targetQuarter: '4Q 2027',
    currentValue: 10.7,
    direction: 'lower_better',
    status: 'on_track',
    createdBy: 'u1',
    assignedTo: ['u1', 'u2', 'u3', 'u4'],
    createdAt: '2026-01-05T08:00:00.000Z',
    comments: [
      {
        id: 'c-005-1',
        userId: 'u2',
        text: 'Cardiology and hospitalist co-management pathway approved by medical executive committee. Implementation kicks off Q2 2026. This should meaningfully move the needle on GDMT optimization at discharge.',
        createdAt: '2026-03-01T11:00:00.000Z',
      },
    ],
  },
]
