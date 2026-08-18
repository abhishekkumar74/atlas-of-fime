export interface HistoricalBoundaryResult {
  matchedYear: number | null;
  formattedYearLabel: string;
  isAvailable: boolean;
  disclosureNote: string;
  geojsonUrl: string | null;
}

// Available snapshot years in historical-basemaps dataset
const AVAILABLE_SNAPSHOT_YEARS = [
  -2000, -1000, -500, -323, -200, 1, 300, 500, 800, 1000, 1200, 1500, 1600, 1700, 1783, 1815, 1900, 1945, 2000
];

const DEEP_TIME_BP_FLOOR = 130_000; // 130k BP coverage floor

export function resolveHistoricalBoundary(yearsBP: number, yearStart?: number): HistoricalBoundaryResult {
  // 1. Deep time check beyond 130,000 BP
  if (yearsBP > DEEP_TIME_BP_FLOOR) {
    return {
      matchedYear: null,
      formattedYearLabel: 'Prehistory / Deep Time',
      isAvailable: false,
      disclosureNote: 'No historical boundary data available this far back (> 130,000 BP).',
      geojsonUrl: null,
    };
  }

  // 2. Convert yearsBP to calendar year if yearStart not provided
  const targetYear = yearStart !== undefined ? yearStart : 2026 - yearsBP;

  // 3. Find nearest snapshot year from available dataset
  let closest = AVAILABLE_SNAPSHOT_YEARS[0];
  let minDiff = Math.abs(targetYear - closest);

  for (const year of AVAILABLE_SNAPSHOT_YEARS) {
    const diff = Math.abs(targetYear - year);
    if (diff < minDiff) {
      minDiff = diff;
      closest = year;
    }
  }

  const formattedMatched = closest < 0 ? `${Math.abs(closest)} BCE` : `${closest} CE`;
  const formattedTarget = targetYear < 0 ? `${Math.abs(targetYear)} BCE` : `${targetYear} CE`;

  return {
    matchedYear: closest,
    formattedYearLabel: formattedMatched,
    isAvailable: true,
    disclosureNote: `Historical Boundary Snapshot: ~${formattedMatched} (nearest available to ${formattedTarget})`,
    geojsonUrl: `https://raw.githubusercontent.com/cawgm/historical-basemaps/master/geojson/world_${closest < 0 ? `bce${Math.abs(closest)}` : closest}.geojson`,
  };
}
