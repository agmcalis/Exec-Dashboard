import type { CmsHospital } from '../types/market'

export const OWN_HOSPITALS_CMS: CmsHospital[] = [
  {
    facilityId: 'nhg-01', name: 'Northfield Medical Center',
    address: '500 Medical Plaza Dr', city: 'Springfield', state: 'IL', zipCode: '62701',
    hospitalType: 'Acute Care Hospitals',
    overallRating: 4,
    mortality: 'above', safety: 'above', readmission: 'same',
    patientExp: 'same', timeliness: 'above', effectiveCare: 'same',
    lat: 39.7987, lng: -89.6439, isOwn: true, ownHospitalId: 'nhg-01',
  },
  {
    facilityId: 'nhg-02', name: 'Riverside Community Hospital',
    address: '120 River Rd', city: 'Riverside', state: 'IL', zipCode: '62702',
    hospitalType: 'Acute Care Hospitals',
    overallRating: 3,
    mortality: 'same', safety: 'same', readmission: 'same',
    patientExp: 'same', timeliness: 'same', effectiveCare: 'same',
    lat: 39.7681, lng: -89.5982, isOwn: true, ownHospitalId: 'nhg-02',
  },
  {
    facilityId: 'nhg-03', name: 'Lakeside Regional Medical Center',
    address: '800 Lakeside Ave', city: 'Lakeside', state: 'IL', zipCode: '62703',
    hospitalType: 'Acute Care Hospitals',
    overallRating: 3,
    mortality: 'same', safety: 'same', readmission: 'below',
    patientExp: 'same', timeliness: 'same', effectiveCare: 'same',
    lat: 39.8234, lng: -89.6801, isOwn: true, ownHospitalId: 'nhg-03',
  },
  {
    facilityId: 'nhg-04', name: 'Westbrook Specialty Hospital',
    address: '42 Rural Route 9', city: 'Westbrook', state: 'IL', zipCode: '62704',
    hospitalType: 'Critical Access Hospitals',
    overallRating: 2,
    mortality: 'same', safety: 'below', readmission: 'same',
    patientExp: 'below', timeliness: 'same', effectiveCare: 'same',
    lat: 39.7422, lng: -89.7213, isOwn: true, ownHospitalId: 'nhg-04',
  },
  {
    facilityId: 'nhg-05', name: 'Elmwood General Hospital',
    address: '300 Elm Street', city: 'Elmwood', state: 'IL', zipCode: '62705',
    hospitalType: 'Acute Care Hospitals',
    overallRating: 3,
    mortality: 'same', safety: 'same', readmission: 'same',
    patientExp: 'above', timeliness: 'same', effectiveCare: 'same',
    lat: 39.8012, lng: -89.7456, isOwn: true, ownHospitalId: 'nhg-05',
  },
]
