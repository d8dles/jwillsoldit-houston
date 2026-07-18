export type DisclaimerId =
  | 'general'
  | 'schools'
  | 'flood'
  | 'travel-times'
  | 'development'
  | 'market';

export interface Disclaimer {
  label: string;
  text: string;
}

export const DISCLAIMERS: Record<DisclaimerId, Disclaimer> = {
  general: {
    label: 'About this guide',
    text: 'Houston, Handled. is provided for general informational purposes. Information may change and should be independently verified. JWILLSOLDIT does not rank communities or recommend housing based on protected characteristics. Users are encouraged to evaluate locations based on their individual housing, transportation, financial and lifestyle needs.',
  },
  schools: {
    label: 'Schools',
    text: 'School attendance boundaries, programs and accountability information may change. Verify eligibility and attendance zones directly with the applicable district and the Texas Education Agency.',
  },
  flood: {
    label: 'Flood risk',
    text: 'Flood risk is property-specific and may exist inside or outside mapped flood zones. Review current FEMA maps, local flood information, seller disclosures, insurance availability and professional inspections before making a housing decision.',
  },
  'travel-times': {
    label: 'Travel times',
    text: 'Drive times are estimates and may vary substantially by time, route, weather, construction and traffic conditions.',
  },
  development: {
    label: 'Development projects',
    text: 'Development plans and completion dates may change. Verify current status with the project owner or applicable public agency.',
  },
  market: {
    label: 'Market data',
    text: 'Market statistics describe recent activity and do not predict future value or guarantee the availability or price of a particular property.',
  },
};
