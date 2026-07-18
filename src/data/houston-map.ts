// Houston schematic map — hand-authored SVG geometry, one coordinate system.
//
// viewBox 0 0 120 100. This is a command-center schematic, NOT a survey map.
// The rings-and-spokes topology is the thing a Houstonian recognizes:
//   - three concentric loops (Loop 610 inner, Beltway 8 mid, Grand Parkway
//     outer — the outer one a partial arc, open across the south toward the
//     Gulf/Galveston Bay, mirroring the real unfinished SH-99);
//   - eight radial freeways spoking out from downtown;
//   - Galveston Bay water in the lower-right.
// The nine regions tile the metro by compass sector, each in its true
// relative position (Katy/Energy Corridor west, The Woodlands north, Fort
// Bend southwest, Clear Lake southeast on the bay, Baytown east, etc.).
//
// ids MUST match the region content-collection slugs exactly — Task 6 links
// against them.

export interface RegionShape {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

export interface Ring {
  id: 'loop-610' | 'beltway-8' | 'grand-parkway';
  path: string;
}

export interface Spoke {
  id: string;
  label: string;
  path: string;
}

export interface Mark {
  id: string;
  label: string;
  x: number;
  y: number;
}

// Nine sectors around downtown. Seams: x 6/38/74/112, y 8/34/62/96.
// Outer corners softened; the two bay-facing regions (Baytown, Clear Lake)
// are clipped by the coastline so they read as touching the water.
export const REGION_SHAPES: RegionShape[] = [
  {
    id: 'northwest-houston',
    name: 'Northwest Houston',
    path: 'M6,14 A6,6 0 0 1 12,8 L38,8 L38,34 L6,34 Z',
    labelX: 22,
    labelY: 22,
  },
  {
    id: 'north-houston-woodlands',
    name: 'North Houston & The Woodlands',
    path: 'M38,8 L74,8 L74,34 L38,34 Z',
    labelX: 56,
    labelY: 20,
  },
  {
    id: 'northeast-lake-houston',
    name: 'Northeast Houston & Lake Houston',
    path: 'M74,8 L106,8 A6,6 0 0 1 112,14 L112,34 L74,34 Z',
    labelX: 93,
    labelY: 22,
  },
  {
    id: 'west-houston-energy-corridor',
    name: 'West Houston & Energy Corridor',
    path: 'M6,34 L38,34 L38,62 L6,62 Z',
    labelX: 22,
    labelY: 49,
  },
  {
    id: 'central-houston',
    name: 'Central Houston',
    path: 'M38,34 L74,34 L74,62 L38,62 Z',
    labelX: 56,
    labelY: 57,
  },
  {
    id: 'east-houston-baytown',
    name: 'East Houston & Baytown',
    path: 'M74,34 L112,34 L112,50 Q109,56 103,62 L74,62 Z',
    labelX: 90,
    labelY: 46,
  },
  {
    id: 'southwest-fort-bend',
    name: 'Southwest Houston & Fort Bend',
    path: 'M6,62 L38,62 L38,96 L12,96 A6,6 0 0 1 6,90 Z',
    labelX: 22,
    labelY: 82,
  },
  {
    id: 'south-houston-brazoria',
    name: 'South Houston & Brazoria',
    path: 'M38,62 L74,62 L74,96 L38,96 Z',
    labelX: 55,
    labelY: 82,
  },
  {
    id: 'clear-lake-bay-area',
    name: 'Clear Lake & Bay Area',
    path: 'M74,62 L103,62 Q95,80 84,96 L74,96 Z',
    labelX: 82,
    labelY: 75,
  },
];

// Galveston Bay — one polygon, lower-right. Coast shared exactly with the
// Baytown and Clear Lake region edges so land and water meet with no seam.
export const WATER: string = 'M112,50 Q109,56 103,62 Q95,80 84,96 L112,96 Z';

// Concentric loops, centered on downtown (56,46). Rounded rectangles echo the
// real, roughly-rectangular loops. Grand Parkway is an open arc.
export const RINGS: Ring[] = [
  {
    id: 'loop-610',
    path:
      'M50,37 L62,37 A4,4 0 0 1 66,41 L66,51 A4,4 0 0 1 62,55 ' +
      'L50,55 A4,4 0 0 1 46,51 L46,41 A4,4 0 0 1 50,37 Z',
  },
  {
    id: 'beltway-8',
    path:
      'M42,26 L70,26 A8,8 0 0 1 78,34 L78,58 A8,8 0 0 1 70,66 ' +
      'L42,66 A8,8 0 0 1 34,58 L34,34 A8,8 0 0 1 42,26 Z',
  },
  {
    id: 'grand-parkway',
    // Open partial arc — sweeps from the southwest (Sugar Land) up and over
    // the top and down the east side to Baytown, leaving the south/southeast
    // (the bay side) open, like the real unfinished SH-99.
    path:
      'M20,74 C10,60 8,42 12,30 C16,18 32,10 50,9 ' +
      'C66,8 84,12 92,22 C100,32 101,50 98,60 C96,66 93,70 90,72',
  },
];

// Radial freeways out of downtown (56,46). Directions carry the meaning:
// I-10 W→Katy, I-10 E→Baytown, I-45 N→The Woodlands, I-45 S→Galveston,
// US-290→Cypress (NW), US-59/I-69 N→Humble/Kingwood (NE),
// US-59/I-69 S→Sugar Land (SW), TX-288→Pearland (S).
export const SPOKES: Spoke[] = [
  { id: 'i-10-west', label: 'I-10 W', path: 'M56,46 L6,44' },
  { id: 'i-10-east', label: 'I-10 E', path: 'M56,46 L112,50' },
  { id: 'i-45-north', label: 'I-45 N', path: 'M56,46 L44,8' },
  { id: 'i-45-south', label: 'I-45 S', path: 'M56,46 L84,94' },
  { id: 'us-290', label: 'US-290', path: 'M56,46 L16,16' },
  { id: 'us-59-north', label: 'US-59 N', path: 'M56,46 L100,14' },
  { id: 'us-59-south', label: 'US-59 S', path: 'M56,46 L14,76' },
  { id: 'tx-288', label: 'TX-288', path: 'M56,46 L54,96' },
];

// Reference marks. Downtown is the command-center focus (red). IAH sits north
// between I-45 N and US-59 N; HOU (Hobby) sits inside Beltway 8 to the
// southeast; the bay label rides the water.
export const MARKS: Mark[] = [
  { id: 'downtown', label: 'Downtown', x: 56, y: 46 },
  { id: 'iah', label: 'IAH', x: 60, y: 16 },
  { id: 'hou', label: 'HOU', x: 70, y: 60 },
  { id: 'bay', label: 'Galveston Bay', x: 99, y: 85 },
];
