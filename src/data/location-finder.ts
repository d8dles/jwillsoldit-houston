export type LocationEntryType = 'zip' | 'school';

export interface StaticLocationEntry {
  label: string;
  type: LocationEntryType;
  aliases?: string[];
  regionSlug: string;
  regionName: string;
  officialUrl?: string;
}

interface RegionZipGroup {
  regionSlug: string;
  regionName: string;
  zips: string[];
}

const ZIP_GROUPS: RegionZipGroup[] = [
  {
    regionSlug: 'central-houston',
    regionName: 'Central Houston',
    zips: ['77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77019', '77024', '77027', '77030', '77046', '77054', '77056', '77057', '77098'],
  },
  {
    regionSlug: 'northwest-houston',
    regionName: 'Northwest Houston',
    zips: ['77040', '77041', '77064', '77065', '77066', '77069', '77070', '77086', '77095', '77429', '77433'],
  },
  {
    regionSlug: 'north-houston-woodlands',
    regionName: 'North Houston & The Woodlands',
    zips: ['77014', '77032', '77037', '77038', '77060', '77067', '77068', '77073', '77090', '77301', '77302', '77303', '77304', '77373', '77379', '77380', '77381', '77382', '77384', '77385', '77386', '77388', '77389'],
  },
  {
    regionSlug: 'northeast-lake-houston',
    regionName: 'Northeast Houston & Lake Houston',
    zips: ['77044', '77050', '77078', '77093', '77338', '77339', '77345', '77346', '77396'],
  },
  {
    regionSlug: 'west-houston-energy-corridor',
    regionName: 'West Houston & Energy Corridor',
    zips: ['77042', '77043', '77055', '77072', '77077', '77079', '77082', '77083', '77084', '77094', '77449', '77450', '77493', '77494'],
  },
  {
    regionSlug: 'east-houston-baytown',
    regionName: 'East Houston & Baytown',
    zips: ['77011', '77013', '77015', '77016', '77020', '77023', '77028', '77029', '77034', '77049', '77520', '77521', '77530', '77532', '77536', '77547', '77562', '77571'],
  },
  {
    regionSlug: 'southwest-fort-bend',
    regionName: 'Southwest Houston & Fort Bend',
    zips: ['77031', '77035', '77036', '77071', '77074', '77085', '77096', '77099', '77406', '77407', '77459', '77469', '77471', '77478', '77479', '77489', '77498'],
  },
  {
    regionSlug: 'south-houston-brazoria',
    regionName: 'South Houston & Brazoria',
    zips: ['77047', '77048', '77053', '77075', '77087', '77089', '77511', '77545', '77578', '77581', '77584'],
  },
  {
    regionSlug: 'clear-lake-bay-area',
    regionName: 'Clear Lake & Bay Area',
    zips: ['77058', '77059', '77062', '77546', '77565', '77573', '77586', '77598'],
  },
];

const SCHOOL_ENTRIES: StaticLocationEntry[] = [
  {
    label: 'Houston ISD school-zone lookup',
    aliases: ['Houston Independent School District', 'HISD'],
    type: 'school',
    regionSlug: 'central-houston',
    regionName: 'Central Houston',
    officialUrl: 'https://schoolnavigator.houstonisd.org/',
  },
  {
    label: 'Cypress-Fairbanks ISD school-zone lookup',
    aliases: ['Cy-Fair ISD', 'CFISD', 'Cypress Fairbanks Independent School District'],
    type: 'school',
    regionSlug: 'northwest-houston',
    regionName: 'Northwest Houston',
    officialUrl: 'https://www.cfisd.net/our-district/our-schools-facilities/attendance-zones/school-zone-locator',
  },
  {
    label: 'Conroe ISD school-zone lookup',
    aliases: ['Conroe Independent School District', 'CISD'],
    type: 'school',
    regionSlug: 'north-houston-woodlands',
    regionName: 'North Houston & The Woodlands',
    officialUrl: 'https://infolocator.conroeisd.net/',
  },
  {
    label: 'Humble ISD school-zone lookup',
    aliases: ['Humble Independent School District'],
    type: 'school',
    regionSlug: 'northeast-lake-houston',
    regionName: 'Northeast Houston & Lake Houston',
    officialUrl: 'https://www.humbleisd.net/o/humbleisd/page/attendance-zones-bus-routes',
  },
  {
    label: 'Katy ISD school-zone lookup',
    aliases: ['Katy Independent School District', 'KISD'],
    type: 'school',
    regionSlug: 'west-houston-energy-corridor',
    regionName: 'West Houston & Energy Corridor',
    officialUrl: 'https://www.katyisd.org/registration/find-my-school',
  },
  {
    label: 'Alief ISD school-zone lookup',
    aliases: ['Alief Independent School District'],
    type: 'school',
    regionSlug: 'southwest-fort-bend',
    regionName: 'Southwest Houston & Fort Bend',
    officialUrl: 'https://www.aliefisd.net/o/aisd/page/attendance-zones-and-boundary-maps',
  },
  {
    label: 'Fort Bend ISD school-zone lookup',
    aliases: ['Fort Bend Independent School District', 'FBISD'],
    type: 'school',
    regionSlug: 'southwest-fort-bend',
    regionName: 'Southwest Houston & Fort Bend',
    officialUrl: 'https://www.fortbendisd.com/',
  },
  {
    label: 'Pearland ISD school-zone lookup',
    aliases: ['Pearland Independent School District', 'PISD'],
    type: 'school',
    regionSlug: 'south-houston-brazoria',
    regionName: 'South Houston & Brazoria',
    officialUrl: 'https://www.pearlandisd.org/parents/enrollment/enrollment',
  },
  {
    label: 'Clear Creek ISD school-zone lookup',
    aliases: ['Clear Creek Independent School District', 'CCISD'],
    type: 'school',
    regionSlug: 'clear-lake-bay-area',
    regionName: 'Clear Lake & Bay Area',
    officialUrl: 'https://www.ccisd.net/district-map',
  },
];

const ZIP_ENTRIES: StaticLocationEntry[] = ZIP_GROUPS.flatMap((group) =>
  group.zips.map((zip) => ({
    label: zip,
    type: 'zip' as const,
    regionSlug: group.regionSlug,
    regionName: group.regionName,
  })),
);

export const STATIC_LOCATION_ENTRIES: StaticLocationEntry[] = [
  ...ZIP_ENTRIES,
  ...SCHOOL_ENTRIES,
];
