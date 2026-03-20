export type KpiCategory =
  | 'mortality'
  | 'patient_safety'
  | 'efficiency'
  | 'readmissions'
  | 'clinical_effectiveness'
  | 'health_equity'

export interface KpiDef {
  id: string
  category: KpiCategory
  name: string
  description: string
  unit: string
}

export const KPI_CATEGORIES: { id: KpiCategory; label: string; shortLabel: string }[] = [
  { id: 'mortality',              label: 'Mortality',               shortLabel: 'Mortality'       },
  { id: 'patient_safety',         label: 'Patient Safety',          shortLabel: 'Safety'          },
  { id: 'efficiency',             label: 'Efficiency',              shortLabel: 'Efficiency'      },
  { id: 'readmissions',           label: 'Readmissions',            shortLabel: 'Readmissions'    },
  { id: 'clinical_effectiveness', label: 'Clinical Effectiveness',  shortLabel: 'Effectiveness'  },
  { id: 'health_equity',          label: 'Health Equity',           shortLabel: 'Health Equity'   },
]

export const KPI_DEFS: KpiDef[] = [
  // Mortality
  { id: 'mortality_oe_csa',      category: 'mortality',              name: 'Mortality O/E (CSA)',              description: 'Observed-to-expected in-hospital mortality ratio per CSA Standard methodology.',               unit: 'ratio'         },
  { id: 'mortality_30d_hf',      category: 'mortality',              name: '30-Day Mortality: Heart Failure',  description: '30-day risk-adjusted mortality rate for heart failure condition encounters.',                   unit: '%'             },
  { id: 'mortality_30d_stroke',  category: 'mortality',              name: '30-Day Mortality: Stroke',         description: '30-day risk-adjusted mortality rate for stroke condition encounters.',                         unit: '%'             },
  { id: 'mortality_30d_cardiac', category: 'mortality',              name: '30-Day Mortality: Cardiac Surgery', description: '30-day risk-adjusted mortality rate for cardiology and heart surgery specialty encounters.',  unit: '%'             },

  // Patient Safety
  { id: 'complication_oe_csa',   category: 'patient_safety',         name: 'Complications O/E (CSA)',          description: 'Observed-to-expected rate of in-hospital complications per CSA Standard methodology.',        unit: 'ratio'         },
  { id: 'psi_03',                category: 'patient_safety',         name: 'PSI-03 Pressure Ulcer',            description: 'Observed rate of pressure ulcer per 1,000 eligible discharges (PSI-03).',                    unit: 'rate per 1,000'},
  { id: 'psi_04',                category: 'patient_safety',         name: 'PSI-04 Death in Surgical Pts',     description: 'Death among surgical inpatients with serious treatable complications, observed rate per 1,000.', unit: 'rate per 1,000'},
  { id: 'psi_11',                category: 'patient_safety',         name: 'PSI-11 Post Respiratory Failure',  description: 'Observed rate of postoperative respiratory failure per 1,000 eligible surgical discharges.',    unit: 'rate per 1,000'},

  // Efficiency
  { id: 'los_geo_oe',            category: 'efficiency',             name: 'LOS Geometric O/E (CSA)',          description: 'Geometric mean length of stay observed-to-expected ratio per CSA Standard methodology.',       unit: 'ratio'         },
  { id: 'cost_case_geo_oe',      category: 'efficiency',             name: 'Cost/Case Geometric O/E (CSA)',    description: 'Geometric mean cost per case observed-to-expected ratio per CSA Standard methodology.',        unit: 'ratio'         },
  { id: 'icu_return_48h',        category: 'efficiency',             name: 'ICU Returns within 48 Hours',      description: 'Percentage of ICU encounters with an unplanned return to ICU within 48 hours of transfer.',    unit: '%'             },
  { id: 'icu_admission',         category: 'efficiency',             name: 'ICU Admission Rate',               description: 'Percentage of hospital encounters with at least one ICU admission.',                          unit: '%'             },

  // Readmissions
  { id: 'readmit_oe_csa',        category: 'readmissions',           name: '30-Day Readmission O/E (CSA)',      description: 'All-cause 30-day readmission observed-to-expected ratio per CSA Standard methodology.',        unit: 'ratio'         },
  { id: 'readmit_hw_oe_csa',     category: 'readmissions',           name: 'Hospital-Wide Readmission O/E (CSA)', description: 'All-cause hospital-wide 30-day readmission O/E ratio per CSA Standard methodology.',       unit: 'ratio'         },
  { id: 'ed_return_7d',          category: 'readmissions',           name: 'ED Return ≤7 Days',                description: 'Observed percentage of ED cases with a return ED visit within 7 days.',                      unit: '%'             },
  { id: 'ed_return_ip_30d',      category: 'readmissions',           name: 'ED Return + IP Admission ≤30 Days', description: 'Observed percentage of ED cases returning and admitted as acute inpatient within 30 days.',  unit: '%'             },

  // Clinical Effectiveness
  { id: 'sepsis_bundle',         category: 'clinical_effectiveness', name: 'Severe Sepsis/Septic Shock Bundle', description: 'Percentage of severe sepsis and septic shock encounters receiving the early management bundle.', unit: '%'            },
  { id: 'vte_ppx',               category: 'clinical_effectiveness', name: 'VTE Pharmacologic Prophylaxis',    description: 'Percentage of eligible encounters receiving appropriate pharmacologic VTE prophylaxis.',       unit: '%'             },
  { id: 'ha_vte',                category: 'clinical_effectiveness', name: 'Hospital-Associated VTE',          description: 'Observed rate of hospital-associated venous thromboembolism events per 1,000 encounters.',    unit: 'rate per 1,000'},
  { id: 'oud_pharmacotherapy',   category: 'clinical_effectiveness', name: 'OUD Pharmacotherapy Rate',         description: 'Percentage of opioid use disorder encounters where pharmacotherapy was provided.',            unit: '%'             },

  // Health Equity
  { id: 'sdoh_dx',               category: 'health_equity',          name: 'SDOH Diagnosis Capture Rate',      description: 'Percentage of patients with at least one social determinant of health diagnosis documented.',  unit: '%'             },
  { id: 'vulnerability_idx_pct', category: 'health_equity',          name: 'Vulnerability Index Derivation',   description: 'Percentage of patients for whom both social and clinical vulnerability indexes were derived.',  unit: '%'             },
  { id: 'clinical_vuln_idx',     category: 'health_equity',          name: 'Clinical Vulnerability Index',     description: 'Composite index reflecting the average clinical vulnerability score across the patient population.', unit: 'index'       },
  { id: 'social_vuln_idx',       category: 'health_equity',          name: 'Social Vulnerability Index',       description: 'Composite index reflecting the average social vulnerability score across the patient population.', unit: 'index'       },
]
