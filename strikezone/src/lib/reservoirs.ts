export interface Reservoir {
  name: string;
  state: string;
  lat: number;
  lon: number;
}

// Major US bass fishing reservoirs — curated for tournament-level anglers
const RESERVOIRS: Reservoir[] = [
  // ─── Southeast ───
  { name: 'Lake Guntersville', state: 'AL', lat: 34.38, lon: -86.22 },
  { name: 'Pickwick Lake', state: 'AL', lat: 34.85, lon: -87.88 },
  { name: 'Wheeler Lake', state: 'AL', lat: 34.57, lon: -87.18 },
  { name: 'Lewis Smith Lake', state: 'AL', lat: 34.08, lon: -87.08 },
  { name: 'Lake Eufaula (Walter F. George)', state: 'AL', lat: 31.90, lon: -85.10 },
  { name: 'Lay Lake', state: 'AL', lat: 33.13, lon: -86.52 },
  { name: 'Lake Martin', state: 'AL', lat: 32.70, lon: -85.92 },
  { name: 'Lake Seminole', state: 'GA', lat: 30.78, lon: -84.85 },
  { name: 'Lake Lanier', state: 'GA', lat: 34.25, lon: -83.97 },
  { name: 'Lake Oconee', state: 'GA', lat: 33.53, lon: -83.22 },
  { name: 'West Point Lake', state: 'GA', lat: 32.90, lon: -85.17 },
  { name: 'Clarks Hill Lake (Strom Thurmond)', state: 'SC', lat: 33.66, lon: -82.19 },
  { name: 'Lake Murray', state: 'SC', lat: 34.07, lon: -81.42 },
  { name: 'Lake Hartwell', state: 'SC', lat: 34.45, lon: -82.85 },
  { name: 'Lake Keowee', state: 'SC', lat: 34.82, lon: -82.90 },
  { name: 'Lake Wylie', state: 'NC', lat: 35.08, lon: -81.07 },
  { name: 'Lake Norman', state: 'NC', lat: 35.50, lon: -80.95 },
  { name: 'Falls Lake', state: 'NC', lat: 36.02, lon: -78.72 },
  { name: 'Kerr Lake (Buggs Island)', state: 'VA', lat: 36.60, lon: -78.35 },
  { name: 'Smith Mountain Lake', state: 'VA', lat: 37.07, lon: -79.55 },
  { name: 'Lake Chickamauga', state: 'TN', lat: 35.30, lon: -85.10 },
  { name: 'Kentucky Lake', state: 'TN', lat: 36.60, lon: -88.05 },
  { name: 'Lake Barkley', state: 'KY', lat: 36.80, lon: -87.95 },
  { name: 'Dale Hollow Lake', state: 'TN', lat: 36.55, lon: -85.42 },
  { name: 'Norris Lake', state: 'TN', lat: 36.35, lon: -84.05 },
  { name: 'Center Hill Lake', state: 'TN', lat: 36.08, lon: -85.82 },
  { name: 'Old Hickory Lake', state: 'TN', lat: 36.33, lon: -86.42 },
  { name: 'Percy Priest Lake', state: 'TN', lat: 36.10, lon: -86.55 },
  { name: 'Watts Bar Lake', state: 'TN', lat: 35.62, lon: -84.78 },
  { name: 'Lake Okeechobee', state: 'FL', lat: 26.95, lon: -80.80 },
  { name: 'Lake Tohopekaliga', state: 'FL', lat: 28.18, lon: -81.35 },
  { name: 'Rodman Reservoir', state: 'FL', lat: 29.48, lon: -81.82 },
  { name: 'Lake Istokpoga', state: 'FL', lat: 27.38, lon: -81.28 },
  { name: 'Harris Chain of Lakes', state: 'FL', lat: 28.78, lon: -81.78 },
  { name: 'Ross Barnett Reservoir', state: 'MS', lat: 32.42, lon: -89.98 },
  { name: 'Grenada Lake', state: 'MS', lat: 33.82, lon: -89.72 },
  { name: 'Sardis Lake', state: 'MS', lat: 34.38, lon: -89.78 },
  { name: 'Enid Lake', state: 'MS', lat: 34.15, lon: -89.90 },

  // ─── Texas ───
  { name: 'Lake Fork', state: 'TX', lat: 32.87, lon: -95.58 },
  { name: 'Sam Rayburn Reservoir', state: 'TX', lat: 31.10, lon: -94.10 },
  { name: 'Toledo Bend Reservoir', state: 'TX', lat: 31.18, lon: -93.55 },
  { name: 'Lake Falcon', state: 'TX', lat: 26.90, lon: -99.18 },
  { name: 'Lake Amistad', state: 'TX', lat: 29.47, lon: -101.05 },
  { name: 'Lake Travis', state: 'TX', lat: 30.42, lon: -97.92 },
  { name: 'Lake Conroe', state: 'TX', lat: 30.42, lon: -95.55 },
  { name: 'Lake Texoma', state: 'TX', lat: 33.82, lon: -96.57 },
  { name: 'Lake Ray Roberts', state: 'TX', lat: 33.37, lon: -97.02 },
  { name: 'O.H. Ivie Reservoir', state: 'TX', lat: 31.58, lon: -99.72 },
  { name: 'Choke Canyon Reservoir', state: 'TX', lat: 28.48, lon: -98.28 },
  { name: 'Lake LBJ', state: 'TX', lat: 30.58, lon: -98.38 },

  // ─── Ozarks / Midwest ───
  { name: 'Table Rock Lake', state: 'MO', lat: 36.60, lon: -93.31 },
  { name: 'Lake of the Ozarks', state: 'MO', lat: 38.12, lon: -92.65 },
  { name: 'Bull Shoals Lake', state: 'AR', lat: 36.42, lon: -92.58 },
  { name: 'Beaver Lake', state: 'AR', lat: 36.35, lon: -93.85 },
  { name: 'Lake Ouachita', state: 'AR', lat: 34.58, lon: -93.22 },
  { name: 'DeGray Lake', state: 'AR', lat: 34.22, lon: -93.12 },
  { name: 'Greers Ferry Lake', state: 'AR', lat: 35.52, lon: -92.15 },
  { name: 'Norfork Lake', state: 'AR', lat: 36.42, lon: -92.22 },
  { name: 'Lake Dardanelle', state: 'AR', lat: 35.32, lon: -93.18 },
  { name: 'Grand Lake O\' the Cherokees', state: 'OK', lat: 36.60, lon: -94.85 },
  { name: 'Lake Tenkiller', state: 'OK', lat: 35.60, lon: -94.95 },
  { name: 'Lake Eufaula', state: 'OK', lat: 35.30, lon: -95.38 },
  { name: 'Broken Bow Lake', state: 'OK', lat: 34.15, lon: -94.68 },
  { name: 'Lake Erie (Western Basin)', state: 'OH', lat: 41.50, lon: -82.70 },
  { name: 'Lake St. Clair', state: 'MI', lat: 42.42, lon: -82.68 },
  { name: 'Mille Lacs Lake', state: 'MN', lat: 46.22, lon: -93.62 },
  { name: 'Lake of the Woods', state: 'MN', lat: 49.00, lon: -94.88 },

  // ─── California / West ───
  { name: 'Clear Lake', state: 'CA', lat: 39.05, lon: -122.78 },
  { name: 'Lake Shasta', state: 'CA', lat: 40.78, lon: -122.35 },
  { name: 'Lake Oroville', state: 'CA', lat: 39.55, lon: -121.48 },
  { name: 'Don Pedro Reservoir', state: 'CA', lat: 37.70, lon: -120.40 },
  { name: 'Lake Berryessa', state: 'CA', lat: 38.62, lon: -122.22 },
  { name: 'Lake Havasu', state: 'AZ', lat: 34.48, lon: -114.35 },
  { name: 'Lake Powell', state: 'UT', lat: 37.08, lon: -111.25 },
  { name: 'Lake Mead', state: 'NV', lat: 36.15, lon: -114.45 },
  { name: 'Flaming Gorge Reservoir', state: 'WY', lat: 41.08, lon: -109.55 },
  { name: 'Columbia River (Pool 1-3)', state: 'OR', lat: 45.62, lon: -121.95 },
  { name: 'Lake Coeur d\'Alene', state: 'ID', lat: 47.55, lon: -116.78 },

  // ─── Northeast / Mid-Atlantic ───
  { name: 'Lake Champlain', state: 'VT', lat: 44.55, lon: -73.28 },
  { name: 'Candlewood Lake', state: 'CT', lat: 41.45, lon: -73.52 },
  { name: 'Lake Winnipesaukee', state: 'NH', lat: 43.58, lon: -71.32 },
  { name: 'Oneida Lake', state: 'NY', lat: 43.20, lon: -75.90 },
  { name: 'Cayuga Lake', state: 'NY', lat: 42.72, lon: -76.72 },
  { name: 'Lake Champlain (NY Side)', state: 'NY', lat: 44.62, lon: -73.38 },
  { name: 'Potomac River (Tidal)', state: 'MD', lat: 38.35, lon: -77.05 },
  { name: 'James River', state: 'VA', lat: 37.52, lon: -77.55 },
  { name: 'Susquehanna River (Flats)', state: 'MD', lat: 39.55, lon: -76.08 },
  { name: 'Pymatuning Reservoir', state: 'PA', lat: 41.55, lon: -80.48 },
  { name: 'Raystown Lake', state: 'PA', lat: 40.42, lon: -78.05 },

  // ─── Deep South / Louisiana ───
  { name: 'Lake D\'Arbonne', state: 'LA', lat: 32.62, lon: -92.52 },
  { name: 'Toledo Bend (LA Side)', state: 'LA', lat: 31.35, lon: -93.58 },
  { name: 'Caney Creek Reservoir', state: 'LA', lat: 32.78, lon: -92.78 },
  { name: 'False River', state: 'LA', lat: 30.72, lon: -91.52 },
  { name: 'Henderson Lake', state: 'LA', lat: 30.32, lon: -91.78 },
  { name: 'Santee Cooper Lakes', state: 'SC', lat: 33.52, lon: -80.15 },
  { name: 'Lake Gaston', state: 'NC', lat: 36.52, lon: -77.88 },
];

export default RESERVOIRS;

// Search reservoirs by fuzzy name/state match
export function searchReservoirs(query: string, limit = 8): Reservoir[] {
  const q = query.toLowerCase();
  const scored = RESERVOIRS.map((r) => {
    const name = r.name.toLowerCase();
    const state = r.state.toLowerCase();
    const full = `${name} ${state}`;

    // Exact start-of-word match ranks highest
    if (name.startsWith(q)) return { r, score: 100 };
    // Word within name starts with query
    const words = name.split(/[\s,'-]+/);
    for (const w of words) {
      if (w.startsWith(q)) return { r, score: 80 };
    }
    // State match
    if (state === q) return { r, score: 70 };
    // Substring match
    if (full.includes(q)) return { r, score: 50 };
    return { r, score: 0 };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.r);
}
