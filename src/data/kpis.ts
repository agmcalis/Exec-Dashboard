export type KpiCategory = 'outcomes' | 'cms_stars' | 'infections' | 'experience' | 'efficiency'

export interface KpiDef {
  id: string
  category: KpiCategory
  name: string
  description: string
  unit: string   // e.g. 'ratio', 'rate per 1,000', '%', 'days', 'rating'
}

export const KPI_CATEGORIES: { id: KpiCategory; label: string; shortLabel: string }[] = [
  { id: 'outcomes',    label: 'General Outcomes',            shortLabel: 'Outcomes'    },
  { id: 'cms_stars',  label: 'CMS Star Ratings',            shortLabel: 'CMS Stars'   },
  { id: 'infections', label: 'Hospital-Acquired Infections', shortLabel: 'HAIs'        },
  { id: 'experience', label: 'Patient Experience',           shortLabel: 'Experience'  },
  { id: 'efficiency', label: 'Efficiency',                   shortLabel: 'Efficiency'  },
]

export const KPI_DEFS: KpiDef[] = [
  // General Outcomes
  { id: 'mortality_oe',      category: 'outcomes',    name: 'Mortality O/E',              description: 'Observed-to-expected in-hospital mortality ratio across all conditions.',         unit: 'ratio'   },
  { id: 'readmission_oe',    category: 'outcomes',    name: 'Readmission O/E',            description: '30-day all-cause readmission observed-to-expected ratio.',                        unit: 'ratio'   },
  { id: 'complication_oe',   category: 'outcomes',    name: 'Complications O/E',          description: 'Observed-to-expected rate of in-hospital complications.',                         unit: 'ratio'   },
  { id: 'psi90',             category: 'outcomes',    name: 'PSI-90 Composite',           description: 'CMS Patient Safety Indicator composite measure of adverse events.',               unit: 'ratio'   },
  { id: 'mortality_30d',     category: 'outcomes',    name: '30-Day Mortality Rate',      description: 'Risk-adjusted 30-day mortality rate across key conditions.',                      unit: '%'       },
  { id: 'length_of_stay_oe', category: 'outcomes',    name: 'Length of Stay O/E',         description: 'Observed vs expected LOS ratio, risk-adjusted by case mix.',                     unit: 'ratio'   },

  // CMS Star Ratings
  { id: 'cms_overall',       category: 'cms_stars',   name: 'Overall Star Rating',        description: 'CMS Overall Hospital Quality Star Rating (1–5 stars).',                          unit: 'rating'  },
  { id: 'cms_mortality',     category: 'cms_stars',   name: 'Mortality Domain',           description: 'CMS star rating mortality domain score.',                                         unit: 'score'   },
  { id: 'cms_safety',        category: 'cms_stars',   name: 'Safety of Care Domain',      description: 'CMS star rating safety domain score.',                                            unit: 'score'   },
  { id: 'cms_readmission',   category: 'cms_stars',   name: 'Readmission Domain',         description: 'CMS star rating readmission domain score.',                                       unit: 'score'   },
  { id: 'cms_experience',    category: 'cms_stars',   name: 'Patient Experience Domain',  description: 'CMS star rating patient experience domain score.',                                unit: 'score'   },
  { id: 'cms_timely',        category: 'cms_stars',   name: 'Timely & Effective Care',    description: 'CMS star rating timely and effective care domain score.',                         unit: 'score'   },

  // HAIs
  { id: 'clabsi',            category: 'infections',  name: 'CLABSI SIR',                 description: 'Central Line-Associated Bloodstream Infection standardized infection ratio.',     unit: 'ratio'   },
  { id: 'cauti',             category: 'infections',  name: 'CAUTI SIR',                  description: 'Catheter-Associated Urinary Tract Infection standardized infection ratio.',       unit: 'ratio'   },
  { id: 'ssi_colon',         category: 'infections',  name: 'SSI – Colon SIR',            description: 'Surgical Site Infection (colon surgery) standardized infection ratio.',          unit: 'ratio'   },
  { id: 'ssi_hyst',          category: 'infections',  name: 'SSI – Hysterectomy SIR',     description: 'Surgical Site Infection (abdominal hysterectomy) standardized infection ratio.', unit: 'ratio'   },
  { id: 'mrsa',              category: 'infections',  name: 'MRSA Bacteremia SIR',        description: 'Methicillin-resistant Staphylococcus aureus bacteremia standardized infection ratio.', unit: 'ratio' },
  { id: 'cdiff',             category: 'infections',  name: 'C. diff SIR',                description: 'Clostridioides difficile infection standardized infection ratio.',                unit: 'ratio'   },

  // Patient Experience (HCAHPS)
  { id: 'hcahps_overall',    category: 'experience',  name: 'Overall Hospital Rating',    description: 'HCAHPS overall hospital rating (patients rating 9 or 10 out of 10).',           unit: '%'       },
  { id: 'hcahps_nurses',     category: 'experience',  name: 'Nurse Communication',        description: 'HCAHPS composite: how well nurses communicated with patients.',                  unit: '%'       },
  { id: 'hcahps_doctors',    category: 'experience',  name: 'Doctor Communication',       description: 'HCAHPS composite: how well doctors communicated with patients.',                 unit: '%'       },
  { id: 'hcahps_staff',      category: 'experience',  name: 'Staff Responsiveness',       description: 'HCAHPS composite: responsiveness of hospital staff.',                            unit: '%'       },
  { id: 'hcahps_meds',       category: 'experience',  name: 'Medication Communication',   description: 'HCAHPS composite: communication about medicines.',                               unit: '%'       },
  { id: 'hcahps_discharge',  category: 'experience',  name: 'Discharge Information',      description: 'HCAHPS composite: patients who received written discharge instructions.',        unit: '%'       },

  // Efficiency
  { id: 'alos',              category: 'efficiency',  name: 'Avg Length of Stay',         description: 'Average inpatient length of stay across all cases.',                             unit: 'days'    },
  { id: 'cmi',               category: 'efficiency',  name: 'Case Mix Index',             description: 'Average DRG weight reflecting resource intensity of the patient population.',    unit: 'index'   },
  { id: 'cost_per_case',     category: 'efficiency',  name: 'Cost per Case',              description: 'Average direct cost per inpatient discharge.',                                   unit: '$/case'  },
  { id: 'or_utilization',    category: 'efficiency',  name: 'OR Utilization',             description: 'Percentage of allocated OR block time utilized.',                                unit: '%'       },
  { id: 'ed_lwbs',           category: 'efficiency',  name: 'ED Left Without Being Seen', description: 'Percentage of ED patients who left before receiving treatment.',                 unit: '%'       },
]
