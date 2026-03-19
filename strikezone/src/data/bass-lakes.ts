/**
 * Curated bass lake database — ~500 major US bass fishing lakes/reservoirs.
 * Data sourced from TPWD, USACE, state fishery agencies, Bassmaster Top 100,
 * B.A.S.S./MLF/FLW tournament venues.
 *
 * This is the sole lake data source — no GNIS dependency.
 */

import type { Lake } from '@/lib/types';

const BASS_LAKES: Lake[] = [
  // ─── Alabama ───
  { id: '1286448', name: 'Lake Guntersville', aliases: ['Guntersville', 'Guntersville Lake'], state: 'AL', lat: 34.54, lon: -86.12, maxDepth: 60, surfaceAcres: 67900, bassRating: 5 },
  { id: '1326389', name: 'Pickwick Lake', aliases: ['Pickwick'], state: 'AL', lat: 34.90, lon: -88.04, maxDepth: 55, surfaceAcres: 43100, bassRating: 4 },
  { id: '112837', name: 'Wheeler Lake', aliases: ['Wheeler'], state: 'AL', lat: 34.67, lon: -87.05, maxDepth: 57, surfaceAcres: 67100, bassRating: 4 },
  { id: 'al-smith', name: 'Lewis Smith Lake', aliases: ['Smith Lake', 'Lewis Smith'], state: 'AL', lat: 34.08, lon: -87.11, maxDepth: 264, surfaceAcres: 21200, bassRating: 4 },
  { id: 'al-weiss', name: 'Weiss Lake', aliases: ['Weiss', 'Crappie Capital'], state: 'AL', lat: 34.18, lon: -85.82, maxDepth: 30, surfaceAcres: 30200, bassRating: 3 },
  { id: 'al-logan-martin', name: 'Logan Martin Lake', aliases: ['Logan Martin'], state: 'AL', lat: 33.63, lon: -86.25, maxDepth: 75, surfaceAcres: 15263, bassRating: 3 },
  { id: 'al-lay', name: 'Lay Lake', aliases: ['Lay'], state: 'AL', lat: 33.25, lon: -86.45, maxDepth: 55, surfaceAcres: 12000, bassRating: 3 },
  { id: 'al-jordan', name: 'Jordan Lake', aliases: ['Jordan AL'], state: 'AL', lat: 32.72, lon: -86.18, maxDepth: 75, surfaceAcres: 6800, bassRating: 2 },
  { id: 'al-neely-henry', name: 'Neely Henry Lake', aliases: ['Neely Henry'], state: 'AL', lat: 33.82, lon: -86.07, maxDepth: 40, surfaceAcres: 11235, bassRating: 3 },
  { id: 'al-wilson', name: 'Wilson Lake', aliases: ['Wilson AL'], state: 'AL', lat: 34.71, lon: -87.55, maxDepth: 59, surfaceAcres: 15930, bassRating: 3 },
  { id: 'al-eufaula', name: 'Lake Eufaula', aliases: ['Eufaula AL', 'Walter F. George'], state: 'AL', lat: 31.92, lon: -85.13, maxDepth: 85, surfaceAcres: 45181, bassRating: 4 },
  { id: 'al-martin', name: 'Lake Martin', aliases: ['Martin AL'], state: 'AL', lat: 32.72, lon: -85.93, maxDepth: 155, surfaceAcres: 39000, bassRating: 3 },
  { id: 'al-mitchell', name: 'Lake Mitchell', aliases: ['Mitchell AL'], state: 'AL', lat: 32.95, lon: -86.65, maxDepth: 65, surfaceAcres: 5850, bassRating: 2 },
  { id: 'al-bankhead', name: 'Bankhead Lake', aliases: ['Bankhead', 'Lewis Smith Bankhead'], state: 'AL', lat: 33.47, lon: -87.35, maxDepth: 60, surfaceAcres: 9490, bassRating: 2 },
  { id: 'al-demopolis', name: 'Demopolis Lake', aliases: ['Demopolis'], state: 'AL', lat: 32.52, lon: -87.83, maxDepth: 40, surfaceAcres: 10000, bassRating: 2 },
  { id: 'al-millers-ferry', name: 'Millers Ferry Lake', aliases: ['Millers Ferry', 'William Dannelly Reservoir'], state: 'AL', lat: 32.10, lon: -87.40, maxDepth: 50, surfaceAcres: 17200, bassRating: 2 },
  { id: 'al-holt', name: 'Holt Lake', aliases: ['Holt', 'Holt Reservoir'], state: 'AL', lat: 33.32, lon: -87.52, maxDepth: 50, surfaceAcres: 6190, bassRating: 2 },
  { id: 'al-oliver', name: 'Oliver Lake', aliases: ['Oliver'], state: 'AL', lat: 33.18, lon: -87.12, maxDepth: 38, surfaceAcres: 5330, bassRating: 2 },
  { id: 'al-harris', name: 'Lake Harris AL', aliases: ['Harris AL', 'Lake Harris Alabama'], state: 'AL', lat: 32.15, lon: -86.30, maxDepth: 60, surfaceAcres: 2800, bassRating: 2 },
  { id: 'al-yates', name: 'Yates Lake', aliases: ['Yates'], state: 'AL', lat: 32.85, lon: -86.20, maxDepth: 55, surfaceAcres: 3700, bassRating: 2 },

  // ─── Arizona ───
  { id: '243280', name: 'Lake Havasu', aliases: ['Havasu'], state: 'AZ', lat: 34.43, lon: -114.31, maxDepth: 90, surfaceAcres: 19300, bassRating: 3 },
  { id: 'az-pleasant', name: 'Lake Pleasant', aliases: ['Pleasant'], state: 'AZ', lat: 33.87, lon: -112.28, maxDepth: 289, surfaceAcres: 10000, bassRating: 3 },
  { id: 'az-roosevelt', name: 'Roosevelt Lake', aliases: ['Roosevelt', 'Theodore Roosevelt'], state: 'AZ', lat: 33.67, lon: -111.15, maxDepth: 240, surfaceAcres: 21493, bassRating: 3 },
  { id: 'az-saguaro', name: 'Saguaro Lake', aliases: ['Saguaro'], state: 'AZ', lat: 33.57, lon: -111.53, maxDepth: 175, surfaceAcres: 1264, bassRating: 2 },
  { id: 'az-apache', name: 'Apache Lake', aliases: ['Apache AZ'], state: 'AZ', lat: 33.57, lon: -111.26, maxDepth: 250, surfaceAcres: 2600, bassRating: 2 },
  { id: 'az-bartlett', name: 'Bartlett Lake', aliases: ['Bartlett'], state: 'AZ', lat: 33.82, lon: -111.63, maxDepth: 180, surfaceAcres: 2815, bassRating: 2 },
  { id: 'az-canyon', name: 'Canyon Lake AZ', aliases: ['Canyon Lake Arizona'], state: 'AZ', lat: 33.53, lon: -111.42, maxDepth: 80, surfaceAcres: 950, bassRating: 2 },
  { id: 'az-alamo', name: 'Alamo Lake', aliases: ['Alamo AZ'], state: 'AZ', lat: 34.24, lon: -113.57, maxDepth: 130, surfaceAcres: 3000, bassRating: 2 },

  // ─── Arkansas ───
  { id: '83589', name: 'Bull Shoals Lake', aliases: ['Bull Shoals'], state: 'AR', lat: 36.50, lon: -92.97, maxDepth: 204, surfaceAcres: 45440, bassRating: 4 },
  { id: '75813', name: 'Lake Ouachita', aliases: ['Ouachita'], state: 'AR', lat: 34.61, lon: -93.35, maxDepth: 407, surfaceAcres: 40100, bassRating: 3 },
  { id: '74784', name: 'DeGray Lake', aliases: ['DeGray', 'De Gray'], state: 'AR', lat: 34.25, lon: -93.20, maxDepth: 200, surfaceAcres: 13400, bassRating: 3 },
  { id: '75245', name: 'Greers Ferry Lake', aliases: ['Greers Ferry'], state: 'AR', lat: 35.53, lon: -92.20, maxDepth: 486, surfaceAcres: 31500, bassRating: 3 },
  { id: '75807', name: 'Norfork Lake', aliases: ['Norfork'], state: 'AR', lat: 36.40, lon: -92.30, maxDepth: 177, surfaceAcres: 22000, bassRating: 3 },
  { id: '74782', name: 'Lake Dardanelle', aliases: ['Dardanelle'], state: 'AR', lat: 35.35, lon: -93.40, maxDepth: 55, surfaceAcres: 34300, bassRating: 3 },
  { id: 'ar-beaver', name: 'Beaver Lake', aliases: ['Beaver'], state: 'AR', lat: 36.32, lon: -93.90, maxDepth: 202, surfaceAcres: 28370, bassRating: 4 },
  { id: 'ar-millwood', name: 'Millwood Lake', aliases: ['Millwood'], state: 'AR', lat: 33.62, lon: -93.88, maxDepth: 48, surfaceAcres: 29200, bassRating: 3 },
  { id: 'ar-hamilton', name: 'Lake Hamilton', aliases: ['Hamilton AR'], state: 'AR', lat: 34.47, lon: -93.05, maxDepth: 85, surfaceAcres: 7200, bassRating: 2 },
  { id: 'ar-lake-village', name: 'Lake Chicot', aliases: ['Lake Chicot', 'Chicot'], state: 'AR', lat: 33.28, lon: -91.28, maxDepth: 20, surfaceAcres: 4580, bassRating: 3 },
  { id: 'ar-conway', name: 'Lake Conway', aliases: ['Conway AR', 'Lake Conway AR'], state: 'AR', lat: 34.90, lon: -92.58, maxDepth: 13, surfaceAcres: 6700, bassRating: 3 },
  { id: 'ar-catherine', name: 'Lake Catherine', aliases: ['Catherine AR'], state: 'AR', lat: 34.37, lon: -92.95, maxDepth: 65, surfaceAcres: 1960, bassRating: 2 },
  { id: 'ar-dardanelle-river', name: 'Arkansas River Dardanelle', aliases: ['Arkansas River AR'], state: 'AR', lat: 35.24, lon: -93.22, maxDepth: 45, surfaceAcres: 10000, bassRating: 2 },
  { id: 'ar-felsenthal', name: 'Lake Felsenthal', aliases: ['Felsenthal'], state: 'AR', lat: 33.28, lon: -92.62, maxDepth: 20, surfaceAcres: 15000, bassRating: 2 },

  // ─── California ───
  { id: '253897', name: 'Lake Shasta', aliases: ['Shasta'], state: 'CA', lat: 40.75, lon: -122.36, maxDepth: 517, surfaceAcres: 29500, bassRating: 3 },
  { id: '264404', name: 'Lake Oroville', aliases: ['Oroville'], state: 'CA', lat: 39.55, lon: -121.42, maxDepth: 700, surfaceAcres: 15800, bassRating: 3 },
  { id: '253880', name: 'Don Pedro Reservoir', aliases: ['Don Pedro'], state: 'CA', lat: 37.70, lon: -120.40, maxDepth: 490, surfaceAcres: 12960, bassRating: 3 },
  { id: '255067', name: 'Lake Berryessa', aliases: ['Berryessa'], state: 'CA', lat: 38.59, lon: -122.23, maxDepth: 275, surfaceAcres: 20700, bassRating: 3 },
  { id: 'ca-clear', name: 'Clear Lake', aliases: ['Clear Lake CA'], state: 'CA', lat: 39.04, lon: -122.77, maxDepth: 60, surfaceAcres: 43600, bassRating: 5 },
  { id: 'ca-castaic', name: 'Castaic Lake', aliases: ['Castaic'], state: 'CA', lat: 34.53, lon: -118.61, maxDepth: 323, surfaceAcres: 2235, bassRating: 3 },
  { id: 'ca-folsom', name: 'Folsom Lake', aliases: ['Folsom'], state: 'CA', lat: 38.72, lon: -121.12, maxDepth: 200, surfaceAcres: 11450, bassRating: 2 },
  { id: 'ca-new-melones', name: 'New Melones Lake', aliases: ['New Melones'], state: 'CA', lat: 37.96, lon: -120.52, maxDepth: 500, surfaceAcres: 12500, bassRating: 3 },
  { id: 'ca-sonoma', name: 'Lake Sonoma', aliases: ['Sonoma'], state: 'CA', lat: 38.72, lon: -123.02, maxDepth: 350, surfaceAcres: 2700, bassRating: 2 },
  { id: 'ca-diamond-valley', name: 'Diamond Valley Lake', aliases: ['Diamond Valley', 'DVL'], state: 'CA', lat: 33.70, lon: -117.00, maxDepth: 260, surfaceAcres: 4500, bassRating: 3 },
  { id: 'ca-perris', name: 'Lake Perris', aliases: ['Perris'], state: 'CA', lat: 33.86, lon: -117.18, maxDepth: 100, surfaceAcres: 2250, bassRating: 2 },
  { id: 'ca-san-vicente', name: 'San Vicente Reservoir', aliases: ['San Vicente'], state: 'CA', lat: 32.90, lon: -116.93, maxDepth: 190, surfaceAcres: 1069, bassRating: 2 },
  { id: 'ca-isabella', name: 'Lake Isabella', aliases: ['Isabella'], state: 'CA', lat: 35.66, lon: -118.48, maxDepth: 180, surfaceAcres: 11400, bassRating: 2 },
  { id: 'ca-casitas', name: 'Lake Casitas', aliases: ['Casitas'], state: 'CA', lat: 34.37, lon: -119.33, maxDepth: 195, surfaceAcres: 2700, bassRating: 3 },
  { id: 'ca-cachuma', name: 'Lake Cachuma', aliases: ['Cachuma'], state: 'CA', lat: 34.58, lon: -119.98, maxDepth: 205, surfaceAcres: 3100, bassRating: 2 },
  { id: 'ca-el-capitan', name: 'El Capitan Reservoir', aliases: ['El Capitan'], state: 'CA', lat: 32.89, lon: -116.80, maxDepth: 197, surfaceAcres: 1580, bassRating: 2 },
  { id: 'ca-skinner', name: 'Lake Skinner', aliases: ['Skinner'], state: 'CA', lat: 33.59, lon: -117.02, maxDepth: 170, surfaceAcres: 1200, bassRating: 2 },
  { id: 'ca-silverwood', name: 'Silverwood Lake', aliases: ['Silverwood'], state: 'CA', lat: 34.29, lon: -117.34, maxDepth: 200, surfaceAcres: 1000, bassRating: 2 },
  { id: 'ca-piru', name: 'Lake Piru', aliases: ['Piru'], state: 'CA', lat: 34.45, lon: -118.79, maxDepth: 240, surfaceAcres: 1200, bassRating: 2 },
  { id: 'ca-pine-flat', name: 'Pine Flat Lake', aliases: ['Pine Flat Reservoir'], state: 'CA', lat: 36.85, lon: -119.33, maxDepth: 400, surfaceAcres: 4274, bassRating: 2 },

  // ─── Colorado ───
  { id: 'co-pueblo', name: 'Lake Pueblo', aliases: ['Pueblo Reservoir', 'Pueblo'], state: 'CO', lat: 38.26, lon: -104.93, maxDepth: 142, surfaceAcres: 4646, bassRating: 2 },
  { id: 'co-john-martin', name: 'John Martin Reservoir', aliases: ['John Martin'], state: 'CO', lat: 38.07, lon: -102.93, maxDepth: 45, surfaceAcres: 7800, bassRating: 2 },
  { id: 'co-chatfield', name: 'Chatfield Reservoir', aliases: ['Chatfield'], state: 'CO', lat: 39.53, lon: -105.07, maxDepth: 90, surfaceAcres: 1450, bassRating: 2 },
  { id: 'co-horsetooth', name: 'Horsetooth Reservoir', aliases: ['Horsetooth'], state: 'CO', lat: 40.57, lon: -105.15, maxDepth: 175, surfaceAcres: 1900, bassRating: 2 },
  { id: 'co-aurora', name: 'Aurora Reservoir', aliases: ['Aurora CO'], state: 'CO', lat: 39.63, lon: -104.73, maxDepth: 130, surfaceAcres: 820, bassRating: 2 },
  { id: 'co-cherry-creek', name: 'Cherry Creek Reservoir', aliases: ['Cherry Creek CO'], state: 'CO', lat: 39.63, lon: -104.83, maxDepth: 75, surfaceAcres: 880, bassRating: 2 },

  // ─── Connecticut ───
  { id: '206018', name: 'Candlewood Lake', aliases: ['Candlewood'], state: 'CT', lat: 41.50, lon: -73.45, maxDepth: 85, surfaceAcres: 5420, bassRating: 2 },
  { id: 'ct-bantam', name: 'Bantam Lake', aliases: ['Bantam'], state: 'CT', lat: 41.73, lon: -73.23, maxDepth: 25, surfaceAcres: 916, bassRating: 2 },

  // ─── Florida ───
  { id: '307550', name: 'Lake Okeechobee', aliases: ['Okeechobee', 'Big O'], state: 'FL', lat: 26.95, lon: -80.80, maxDepth: 15, surfaceAcres: 451000, bassRating: 5 },
  { id: '292327', name: 'Lake Tohopekaliga', aliases: ['Toho', 'Lake Toho', 'Tohopekaliga'], state: 'FL', lat: 28.21, lon: -81.38, maxDepth: 15, surfaceAcres: 22700, bassRating: 5 },
  { id: '284635', name: 'Lake Istokpoga', aliases: ['Istokpoga'], state: 'FL', lat: 27.35, lon: -81.25, maxDepth: 10, surfaceAcres: 27692, bassRating: 4 },
  { id: '294031', name: 'Lake Harris', aliases: ['Harris Chain', 'Harris Chain of Lakes', 'Lake Harris'], state: 'FL', lat: 28.77, lon: -81.81, maxDepth: 32, surfaceAcres: 18416, bassRating: 4 },
  { id: 'fl-kissimmee', name: 'Lake Kissimmee', aliases: ['Kissimmee'], state: 'FL', lat: 27.94, lon: -81.26, maxDepth: 12, surfaceAcres: 34948, bassRating: 4 },
  { id: 'fl-george', name: 'Lake George', aliases: ['George FL'], state: 'FL', lat: 29.28, lon: -81.55, maxDepth: 12, surfaceAcres: 46000, bassRating: 3 },
  { id: 'fl-rodman', name: 'Rodman Reservoir', aliases: ['Rodman', 'Lake Ocklawaha'], state: 'FL', lat: 29.48, lon: -81.81, maxDepth: 23, surfaceAcres: 9400, bassRating: 4 },
  { id: 'fl-stick-marsh', name: 'Stick Marsh', aliases: ['Stick Marsh', 'Farm 13'], state: 'FL', lat: 27.75, lon: -80.79, maxDepth: 6, surfaceAcres: 6500, bassRating: 4 },
  { id: 'fl-johns', name: 'St. Johns River', aliases: ['St. Johns', 'Saint Johns River'], state: 'FL', lat: 29.08, lon: -81.56, maxDepth: 25, surfaceAcres: 12000, bassRating: 4 },
  { id: 'fl-garcia', name: 'Garcia Reservoir', aliases: ['Garcia', 'Headwaters Lake'], state: 'FL', lat: 27.56, lon: -80.81, maxDepth: 7, surfaceAcres: 767, bassRating: 3 },
  { id: 'fl-griffin', name: 'Lake Griffin', aliases: ['Griffin FL'], state: 'FL', lat: 28.86, lon: -81.77, maxDepth: 14, surfaceAcres: 9937, bassRating: 3 },
  { id: 'fl-yale', name: 'Lake Yale', aliases: ['Yale FL'], state: 'FL', lat: 28.97, lon: -81.74, maxDepth: 20, surfaceAcres: 4004, bassRating: 2 },
  { id: 'fl-weir', name: 'Lake Weir', aliases: ['Weir FL'], state: 'FL', lat: 29.05, lon: -81.90, maxDepth: 34, surfaceAcres: 5685, bassRating: 2 },
  { id: 'fl-panasoffkee', name: 'Lake Panasoffkee', aliases: ['Panasoffkee'], state: 'FL', lat: 28.77, lon: -82.10, maxDepth: 8, surfaceAcres: 4460, bassRating: 3 },
  { id: 'fl-talquin', name: 'Lake Talquin', aliases: ['Talquin'], state: 'FL', lat: 30.39, lon: -84.62, maxDepth: 70, surfaceAcres: 8800, bassRating: 3 },
  { id: 'fl-jackson', name: 'Lake Jackson Tallahassee', aliases: ['Lake Jackson FL', 'Jackson Tallahassee'], state: 'FL', lat: 30.54, lon: -84.41, maxDepth: 17, surfaceAcres: 4000, bassRating: 3 },
  { id: 'fl-trafford', name: 'Lake Trafford', aliases: ['Trafford'], state: 'FL', lat: 26.43, lon: -81.49, maxDepth: 10, surfaceAcres: 1700, bassRating: 3 },
  { id: 'fl-west-toho', name: 'West Lake Tohopekaliga', aliases: ['West Toho', 'West Lake Toho'], state: 'FL', lat: 28.17, lon: -81.48, maxDepth: 10, surfaceAcres: 7800, bassRating: 4 },
  { id: 'fl-crescent', name: 'Crescent Lake FL', aliases: ['Crescent Lake Florida'], state: 'FL', lat: 29.47, lon: -81.53, maxDepth: 24, surfaceAcres: 13640, bassRating: 3 },
  { id: 'fl-dora', name: 'Lake Dora', aliases: ['Dora FL'], state: 'FL', lat: 28.84, lon: -81.63, maxDepth: 14, surfaceAcres: 4520, bassRating: 3 },
  { id: 'fl-eustis', name: 'Lake Eustis', aliases: ['Eustis FL'], state: 'FL', lat: 28.83, lon: -81.68, maxDepth: 14, surfaceAcres: 7806, bassRating: 3 },
  { id: 'fl-apopka', name: 'Lake Apopka', aliases: ['Apopka'], state: 'FL', lat: 28.65, lon: -81.63, maxDepth: 9, surfaceAcres: 30800, bassRating: 3 },
  { id: 'fl-butler', name: 'Lake Butler FL', aliases: ['Butler FL'], state: 'FL', lat: 28.54, lon: -81.53, maxDepth: 35, surfaceAcres: 1652, bassRating: 2 },
  { id: 'fl-seminole-ga', name: 'Lake Seminole FL', aliases: ['Seminole FL'], state: 'FL', lat: 30.22, lon: -85.60, maxDepth: 30, surfaceAcres: 12000, bassRating: 3 },
  { id: 'fl-lochloosa', name: 'Lake Lochloosa', aliases: ['Lochloosa'], state: 'FL', lat: 29.50, lon: -82.10, maxDepth: 14, surfaceAcres: 5760, bassRating: 3 },
  { id: 'fl-santa-fe', name: 'Santa Fe Lake', aliases: ['Santa Fe FL'], state: 'FL', lat: 29.68, lon: -82.15, maxDepth: 26, surfaceAcres: 5850, bassRating: 3 },
  { id: 'fl-newnan', name: 'Newnan Lake', aliases: ['Newnan'], state: 'FL', lat: 29.62, lon: -82.22, maxDepth: 9, surfaceAcres: 7326, bassRating: 2 },

  // ─── Georgia ───
  { id: '322971', name: 'Lake Lanier', aliases: ['Lanier', 'Lake Sidney Lanier'], state: 'GA', lat: 34.16, lon: -84.07, maxDepth: 160, surfaceAcres: 38449, bassRating: 3 },
  { id: '330982', name: 'Lake Oconee', aliases: ['Oconee'], state: 'GA', lat: 33.47, lon: -83.30, maxDepth: 115, surfaceAcres: 19050, bassRating: 3 },
  { id: '335836', name: 'Clarks Hill Lake', aliases: ['Clarks Hill', 'Strom Thurmond', 'Thurmond Reservoir', 'J. Strom Thurmond'], state: 'GA', lat: 33.66, lon: -82.41, maxDepth: 180, surfaceAcres: 71100, bassRating: 4 },
  { id: '325064', name: 'West Point Lake', aliases: ['West Point'], state: 'GA', lat: 32.94, lon: -85.19, maxDepth: 82, surfaceAcres: 25864, bassRating: 3 },
  { id: '336443', name: 'Lake Seminole', aliases: ['Seminole GA', 'Seminole'], state: 'GA', lat: 30.78, lon: -84.85, maxDepth: 35, surfaceAcres: 37500, bassRating: 5 },
  { id: '356215', name: 'Lake Hartwell', aliases: ['Hartwell'], state: 'GA', lat: 34.53, lon: -83.16, maxDepth: 185, surfaceAcres: 56000, bassRating: 3 },
  { id: 'ga-sinclair', name: 'Lake Sinclair', aliases: ['Sinclair'], state: 'GA', lat: 33.17, lon: -83.20, maxDepth: 72, surfaceAcres: 15330, bassRating: 3 },
  { id: 'ga-chatuge', name: 'Lake Chatuge', aliases: ['Chatuge'], state: 'GA', lat: 34.98, lon: -83.83, maxDepth: 144, surfaceAcres: 7050, bassRating: 2 },
  { id: 'ga-blackshear', name: 'Lake Blackshear', aliases: ['Blackshear'], state: 'GA', lat: 31.86, lon: -83.73, maxDepth: 25, surfaceAcres: 8700, bassRating: 3 },
  { id: 'ga-nottely', name: 'Lake Nottely', aliases: ['Nottely'], state: 'GA', lat: 34.88, lon: -84.00, maxDepth: 130, surfaceAcres: 4180, bassRating: 2 },
  { id: 'ga-rabun', name: 'Lake Rabun', aliases: ['Rabun'], state: 'GA', lat: 34.74, lon: -83.44, maxDepth: 100, surfaceAcres: 834, bassRating: 2 },
  { id: 'ga-burton', name: 'Lake Burton', aliases: ['Burton'], state: 'GA', lat: 34.82, lon: -83.52, maxDepth: 120, surfaceAcres: 2775, bassRating: 2 },
  { id: 'ga-allatoona', name: 'Lake Allatoona', aliases: ['Allatoona'], state: 'GA', lat: 34.15, lon: -84.72, maxDepth: 100, surfaceAcres: 11860, bassRating: 3 },
  { id: 'ga-carters', name: 'Carters Lake', aliases: ['Carters'], state: 'GA', lat: 34.63, lon: -84.68, maxDepth: 450, surfaceAcres: 3200, bassRating: 3 },
  { id: 'ga-jackson', name: 'Lake Jackson GA', aliases: ['Jackson GA', 'Lloyd Shoals'], state: 'GA', lat: 33.37, lon: -83.87, maxDepth: 35, surfaceAcres: 4750, bassRating: 2 },
  { id: 'ga-blue-ridge', name: 'Lake Blue Ridge', aliases: ['Blue Ridge GA'], state: 'GA', lat: 34.88, lon: -84.33, maxDepth: 135, surfaceAcres: 3290, bassRating: 2 },
  { id: 'ga-harding', name: 'Lake Harding', aliases: ['Harding', 'Bartletts Ferry'], state: 'GA', lat: 32.72, lon: -85.08, maxDepth: 60, surfaceAcres: 5850, bassRating: 2 },
  { id: 'ga-juliette', name: 'Lake Juliette', aliases: ['Juliette'], state: 'GA', lat: 33.10, lon: -83.82, maxDepth: 45, surfaceAcres: 3600, bassRating: 2 },
  { id: 'ga-strom-thurmond-ga', name: 'Thurmond Lake GA', aliases: ['Strom Thurmond GA'], state: 'GA', lat: 33.65, lon: -82.38, maxDepth: 180, surfaceAcres: 71100, bassRating: 3 },

  // ─── Idaho ───
  { id: '397563', name: "Lake Coeur d'Alene", aliases: ['Coeur d\'Alene', 'CDA'], state: 'ID', lat: 47.55, lon: -116.80, maxDepth: 220, surfaceAcres: 29000, bassRating: 2 },
  { id: 'id-brownlee', name: 'Brownlee Reservoir', aliases: ['Brownlee'], state: 'ID', lat: 44.62, lon: -116.83, maxDepth: 295, surfaceAcres: 15000, bassRating: 2 },
  { id: 'id-cj-strike', name: 'C.J. Strike Reservoir', aliases: ['CJ Strike', 'Strike Reservoir'], state: 'ID', lat: 42.93, lon: -115.95, maxDepth: 100, surfaceAcres: 7500, bassRating: 2 },
  { id: 'id-lucky-peak', name: 'Lucky Peak Reservoir', aliases: ['Lucky Peak'], state: 'ID', lat: 43.55, lon: -116.07, maxDepth: 260, surfaceAcres: 3000, bassRating: 2 },

  // ─── Illinois ───
  { id: 'il-shelbyville', name: 'Lake Shelbyville', aliases: ['Shelbyville'], state: 'IL', lat: 39.42, lon: -88.80, maxDepth: 65, surfaceAcres: 11100, bassRating: 3 },
  { id: 'il-carlyle', name: 'Carlyle Lake', aliases: ['Carlyle'], state: 'IL', lat: 38.63, lon: -89.36, maxDepth: 35, surfaceAcres: 26000, bassRating: 3 },
  { id: 'il-rend', name: 'Rend Lake', aliases: ['Rend'], state: 'IL', lat: 38.05, lon: -88.96, maxDepth: 35, surfaceAcres: 18900, bassRating: 3 },
  { id: 'il-clinton', name: 'Clinton Lake', aliases: ['Clinton IL'], state: 'IL', lat: 40.14, lon: -88.88, maxDepth: 43, surfaceAcres: 4895, bassRating: 2 },
  { id: 'il-kinkaid', name: 'Kinkaid Lake', aliases: ['Kinkaid'], state: 'IL', lat: 37.80, lon: -89.43, maxDepth: 70, surfaceAcres: 2750, bassRating: 2 },
  { id: 'il-springfield', name: 'Lake Springfield', aliases: ['Springfield IL'], state: 'IL', lat: 39.71, lon: -89.60, maxDepth: 34, surfaceAcres: 4234, bassRating: 2 },
  { id: 'il-sam-dale', name: 'Sam Dale Lake', aliases: ['Sam Dale'], state: 'IL', lat: 38.62, lon: -88.73, maxDepth: 30, surfaceAcres: 1058, bassRating: 2 },
  { id: 'il-forbes', name: 'Forbes Lake', aliases: ['Forbes'], state: 'IL', lat: 38.52, lon: -88.59, maxDepth: 28, surfaceAcres: 585, bassRating: 2 },
  { id: 'il-egypt', name: 'Lake of Egypt', aliases: ['Lake of Egypt IL', 'Egypt Lake'], state: 'IL', lat: 37.55, lon: -88.92, maxDepth: 28, surfaceAcres: 2300, bassRating: 2 },
  { id: 'il-crab-orchard', name: 'Crab Orchard Lake', aliases: ['Crab Orchard'], state: 'IL', lat: 37.70, lon: -88.97, maxDepth: 35, surfaceAcres: 6965, bassRating: 3 },
  { id: 'il-banner-marsh', name: 'Banner Marsh State Fish and Wildlife Area', aliases: ['Banner Marsh'], state: 'IL', lat: 40.52, lon: -89.92, maxDepth: 18, surfaceAcres: 1122, bassRating: 2 },
  { id: 'il-braidwood', name: 'Braidwood Lake', aliases: ['Braidwood'], state: 'IL', lat: 41.22, lon: -88.17, maxDepth: 30, surfaceAcres: 2165, bassRating: 2 },
  { id: 'il-powerton', name: 'Powerton Lake', aliases: ['Powerton'], state: 'IL', lat: 40.57, lon: -89.60, maxDepth: 40, surfaceAcres: 2516, bassRating: 2 },
  { id: 'il-chautauqua', name: 'Lake Chautauqua IL', aliases: ['Chautauqua IL', 'Chautauqua NWR'], state: 'IL', lat: 40.42, lon: -89.87, maxDepth: 10, surfaceAcres: 4485, bassRating: 2 },
  { id: 'il-horseshoe', name: 'Horseshoe Lake IL', aliases: ['Horseshoe IL'], state: 'IL', lat: 37.13, lon: -89.35, maxDepth: 10, surfaceAcres: 2400, bassRating: 2 },

  // ─── Indiana ───
  { id: 'in-patoka', name: 'Patoka Lake', aliases: ['Patoka'], state: 'IN', lat: 38.42, lon: -86.62, maxDepth: 64, surfaceAcres: 8800, bassRating: 3 },
  { id: 'in-monroe', name: 'Monroe Lake', aliases: ['Monroe', 'Lake Monroe IN'], state: 'IN', lat: 39.07, lon: -86.47, maxDepth: 55, surfaceAcres: 10750, bassRating: 3 },
  { id: 'in-brookville', name: 'Brookville Lake', aliases: ['Brookville'], state: 'IN', lat: 39.42, lon: -85.02, maxDepth: 100, surfaceAcres: 5260, bassRating: 2 },
  { id: 'in-cagles-mill', name: "Cagles Mill Lake", aliases: ['Cagles Mill', 'Cataract Lake'], state: 'IN', lat: 39.42, lon: -86.85, maxDepth: 40, surfaceAcres: 1400, bassRating: 2 },
  { id: 'in-hardy', name: 'Hardy Lake', aliases: ['Hardy'], state: 'IN', lat: 38.74, lon: -85.69, maxDepth: 51, surfaceAcres: 741, bassRating: 2 },
  { id: 'in-salamonie', name: 'Salamonie Lake', aliases: ['Salamonie'], state: 'IN', lat: 40.82, lon: -85.68, maxDepth: 35, surfaceAcres: 2855, bassRating: 2 },
  { id: 'in-mississinewa', name: 'Mississinewa Lake', aliases: ['Mississinewa'], state: 'IN', lat: 40.71, lon: -85.82, maxDepth: 50, surfaceAcres: 3180, bassRating: 2 },
  { id: 'in-cec-harden', name: 'Cecil M. Harden Lake', aliases: ['Cecil Harden', 'Raccoon Lake IN'], state: 'IN', lat: 39.92, lon: -87.02, maxDepth: 50, surfaceAcres: 2060, bassRating: 2 },
  { id: 'in-shafer', name: 'Lake Shafer', aliases: ['Shafer', 'Norway Lake IN'], state: 'IN', lat: 40.75, lon: -86.65, maxDepth: 30, surfaceAcres: 1390, bassRating: 2 },
  { id: 'in-freeman', name: 'Lake Freeman', aliases: ['Freeman IN'], state: 'IN', lat: 40.80, lon: -86.65, maxDepth: 30, surfaceAcres: 1550, bassRating: 2 },

  // ─── Iowa ───
  { id: 'ia-rathbun', name: 'Rathbun Lake', aliases: ['Rathbun'], state: 'IA', lat: 40.84, lon: -92.87, maxDepth: 64, surfaceAcres: 11000, bassRating: 2 },
  { id: 'ia-red-rock', name: 'Red Rock Lake', aliases: ['Red Rock'], state: 'IA', lat: 41.37, lon: -93.00, maxDepth: 42, surfaceAcres: 15250, bassRating: 2 },
  { id: 'ia-coralville', name: 'Coralville Lake', aliases: ['Coralville Reservoir', 'Coralville'], state: 'IA', lat: 41.73, lon: -91.60, maxDepth: 40, surfaceAcres: 5430, bassRating: 2 },
  { id: 'ia-macbride', name: 'Lake Macbride', aliases: ['Macbride'], state: 'IA', lat: 41.81, lon: -91.57, maxDepth: 25, surfaceAcres: 812, bassRating: 2 },
  { id: 'ia-saylorville', name: 'Saylorville Lake', aliases: ['Saylorville'], state: 'IA', lat: 41.70, lon: -93.72, maxDepth: 40, surfaceAcres: 5900, bassRating: 2 },

  // ─── Kansas ───
  { id: 'ks-milford', name: 'Milford Lake', aliases: ['Milford'], state: 'KS', lat: 39.12, lon: -96.90, maxDepth: 65, surfaceAcres: 15709, bassRating: 3 },
  { id: 'ks-perry', name: 'Perry Lake', aliases: ['Perry KS'], state: 'KS', lat: 39.12, lon: -95.45, maxDepth: 52, surfaceAcres: 11150, bassRating: 2 },
  { id: 'ks-clinton', name: 'Clinton Lake', aliases: ['Clinton KS'], state: 'KS', lat: 38.95, lon: -95.38, maxDepth: 65, surfaceAcres: 7000, bassRating: 2 },
  { id: 'ks-el-dorado', name: 'El Dorado Lake', aliases: ['El Dorado KS', 'El Dorado Reservoir'], state: 'KS', lat: 37.85, lon: -96.82, maxDepth: 40, surfaceAcres: 8000, bassRating: 2 },
  { id: 'ks-cheney', name: 'Cheney Reservoir', aliases: ['Cheney'], state: 'KS', lat: 37.77, lon: -97.82, maxDepth: 50, surfaceAcres: 9537, bassRating: 2 },
  { id: 'ks-glen-elder', name: 'Glen Elder Lake', aliases: ['Glen Elder', 'Waconda Lake'], state: 'KS', lat: 39.49, lon: -98.33, maxDepth: 55, surfaceAcres: 12600, bassRating: 2 },
  { id: 'ks-tuttle-creek', name: 'Tuttle Creek Lake', aliases: ['Tuttle Creek'], state: 'KS', lat: 39.30, lon: -96.59, maxDepth: 40, surfaceAcres: 15800, bassRating: 2 },

  // ─── Kentucky ───
  { id: 'ky-kentucky', name: 'Kentucky Lake', aliases: ['Kentucky Lake KY', 'KY Lake'], state: 'KY', lat: 36.80, lon: -88.10, maxDepth: 75, surfaceAcres: 160300, bassRating: 4 },
  { id: 'ky-barkley', name: 'Lake Barkley', aliases: ['Barkley'], state: 'KY', lat: 36.83, lon: -87.92, maxDepth: 60, surfaceAcres: 57920, bassRating: 4 },
  { id: 'ky-cumberland', name: 'Lake Cumberland', aliases: ['Cumberland'], state: 'KY', lat: 36.90, lon: -85.02, maxDepth: 200, surfaceAcres: 50250, bassRating: 4 },
  { id: 'ky-dale-hollow', name: 'Dale Hollow Lake KY', aliases: ['Dale Hollow KY'], state: 'KY', lat: 36.55, lon: -85.46, maxDepth: 248, surfaceAcres: 27700, bassRating: 3 },
  { id: 'ky-laurel-river', name: 'Laurel River Lake', aliases: ['Laurel River'], state: 'KY', lat: 36.98, lon: -84.30, maxDepth: 280, surfaceAcres: 5600, bassRating: 2 },
  { id: 'ky-green-river', name: 'Green River Lake', aliases: ['Green River'], state: 'KY', lat: 37.22, lon: -85.32, maxDepth: 90, surfaceAcres: 8210, bassRating: 2 },
  { id: 'ky-cave-run', name: 'Cave Run Lake', aliases: ['Cave Run'], state: 'KY', lat: 38.10, lon: -83.55, maxDepth: 70, surfaceAcres: 8270, bassRating: 2 },
  { id: 'ky-herrington', name: 'Herrington Lake', aliases: ['Herrington'], state: 'KY', lat: 37.72, lon: -84.78, maxDepth: 249, surfaceAcres: 2335, bassRating: 2 },
  { id: 'ky-taylorsville', name: 'Taylorsville Lake', aliases: ['Taylorsville'], state: 'KY', lat: 38.02, lon: -85.27, maxDepth: 77, surfaceAcres: 3050, bassRating: 2 },
  { id: 'ky-dewey', name: 'Dewey Lake', aliases: ['Dewey KY'], state: 'KY', lat: 37.83, lon: -82.73, maxDepth: 120, surfaceAcres: 1100, bassRating: 2 },
  { id: 'ky-paintsville', name: 'Paintsville Lake', aliases: ['Paintsville'], state: 'KY', lat: 37.80, lon: -82.85, maxDepth: 120, surfaceAcres: 1139, bassRating: 2 },
  { id: 'ky-buckhorn', name: 'Buckhorn Lake', aliases: ['Buckhorn'], state: 'KY', lat: 37.33, lon: -83.46, maxDepth: 95, surfaceAcres: 1230, bassRating: 2 },
  { id: 'ky-yatesville', name: 'Yatesville Lake', aliases: ['Yatesville'], state: 'KY', lat: 38.00, lon: -82.65, maxDepth: 90, surfaceAcres: 2350, bassRating: 2 },
  { id: 'ky-grayson', name: 'Grayson Lake', aliases: ['Grayson'], state: 'KY', lat: 38.33, lon: -82.88, maxDepth: 80, surfaceAcres: 1512, bassRating: 2 },
  { id: 'ky-nolin-river', name: 'Nolin River Lake', aliases: ['Nolin River', 'Nolin Lake'], state: 'KY', lat: 37.30, lon: -86.27, maxDepth: 60, surfaceAcres: 5795, bassRating: 2 },
  { id: 'ky-rough-river', name: 'Rough River Lake', aliases: ['Rough River'], state: 'KY', lat: 37.57, lon: -86.48, maxDepth: 60, surfaceAcres: 5100, bassRating: 2 },

  // ─── Louisiana ───
  { id: '558729', name: 'Toledo Bend Reservoir', aliases: ['Toledo Bend', 'Toledo'], state: 'LA', lat: 31.50, lon: -93.74, maxDepth: 110, surfaceAcres: 185000, bassRating: 5 },
  { id: '553446', name: "Bayou D'Arbonne Lake", aliases: ["D'Arbonne", "Lake D'Arbonne", "Bayou D'Arbonne"], state: 'LA', lat: 32.76, lon: -92.43, maxDepth: 40, surfaceAcres: 15250, bassRating: 3 },
  { id: '556606', name: 'Caney Creek Reservoir', aliases: ['Caney Creek', 'Caney Lake LA'], state: 'LA', lat: 32.24, lon: -92.53, maxDepth: 43, surfaceAcres: 5000, bassRating: 2 },
  { id: '554381', name: 'False River', aliases: ['False River LA'], state: 'LA', lat: 30.62, lon: -91.47, maxDepth: 65, surfaceAcres: 3400, bassRating: 2 },
  { id: 'la-catahoula', name: 'Catahoula Lake', aliases: ['Catahoula'], state: 'LA', lat: 31.38, lon: -91.92, maxDepth: 18, surfaceAcres: 26000, bassRating: 3 },
  { id: 'la-caddo', name: 'Caddo Lake', aliases: ['Caddo'], state: 'LA', lat: 32.72, lon: -94.07, maxDepth: 20, surfaceAcres: 26800, bassRating: 3 },
  { id: 'la-claiborne', name: 'Lake Claiborne', aliases: ['Claiborne LA'], state: 'LA', lat: 32.55, lon: -92.89, maxDepth: 88, surfaceAcres: 6400, bassRating: 2 },
  { id: 'la-bistineau', name: 'Lake Bistineau', aliases: ['Bistineau'], state: 'LA', lat: 32.33, lon: -93.38, maxDepth: 30, surfaceAcres: 15600, bassRating: 2 },
  { id: 'la-bussey-brake', name: 'Bussey Brake Reservoir', aliases: ['Bussey Brake'], state: 'LA', lat: 32.47, lon: -91.85, maxDepth: 32, surfaceAcres: 2200, bassRating: 2 },
  { id: 'la-poverty-point', name: 'Poverty Point Reservoir', aliases: ['Poverty Point'], state: 'LA', lat: 32.59, lon: -91.55, maxDepth: 30, surfaceAcres: 2700, bassRating: 3 },
  { id: 'la-vernon', name: 'Lake Vernon', aliases: ['Vernon LA', 'Anacoco Lake Vernon'], state: 'LA', lat: 31.03, lon: -93.23, maxDepth: 60, surfaceAcres: 9700, bassRating: 2 },
  { id: 'la-cross', name: 'Cross Lake', aliases: ['Cross Lake LA'], state: 'LA', lat: 32.59, lon: -93.82, maxDepth: 20, surfaceAcres: 8600, bassRating: 2 },
  { id: 'la-anacoco', name: 'Anacoco Lake', aliases: ['Anacoco'], state: 'LA', lat: 31.22, lon: -93.33, maxDepth: 30, surfaceAcres: 3400, bassRating: 2 },
  { id: 'la-saline', name: 'Lake Saline', aliases: ['Saline LA'], state: 'LA', lat: 32.08, lon: -92.98, maxDepth: 35, surfaceAcres: 2370, bassRating: 2 },
  { id: 'la-spring', name: 'Spring Lake LA', aliases: ['Spring LA'], state: 'LA', lat: 31.85, lon: -93.30, maxDepth: 20, surfaceAcres: 1850, bassRating: 2 },
  { id: 'la-iatt', name: 'Lake Iatt', aliases: ['Iatt'], state: 'LA', lat: 31.33, lon: -92.33, maxDepth: 15, surfaceAcres: 1200, bassRating: 2 },

  // ─── Maine ───
  { id: 'me-sebago', name: 'Sebago Lake', aliases: ['Sebago'], state: 'ME', lat: 43.85, lon: -70.55, maxDepth: 316, surfaceAcres: 29799, bassRating: 2 },
  { id: 'me-moosehead', name: 'Moosehead Lake', aliases: ['Moosehead'], state: 'ME', lat: 45.65, lon: -69.78, maxDepth: 246, surfaceAcres: 117000, bassRating: 2 },

  // ─── Maryland ───
  { id: 'md-deep-creek', name: 'Deep Creek Lake', aliases: ['Deep Creek'], state: 'MD', lat: 39.51, lon: -79.35, maxDepth: 73, surfaceAcres: 3900, bassRating: 2 },
  { id: 'md-potomac', name: 'Potomac River', aliases: ['Potomac', 'Upper Potomac'], state: 'MD', lat: 39.45, lon: -77.99, maxDepth: 40, surfaceAcres: 8500, bassRating: 3 },
  { id: 'md-liberty', name: 'Liberty Reservoir', aliases: ['Liberty MD'], state: 'MD', lat: 39.47, lon: -76.93, maxDepth: 135, surfaceAcres: 3100, bassRating: 2 },
  { id: 'md-prettyboy', name: 'Prettyboy Reservoir', aliases: ['Prettyboy'], state: 'MD', lat: 39.60, lon: -76.78, maxDepth: 115, surfaceAcres: 1500, bassRating: 2 },
  { id: 'md-loch-raven', name: 'Loch Raven Reservoir', aliases: ['Loch Raven'], state: 'MD', lat: 39.47, lon: -76.58, maxDepth: 75, surfaceAcres: 2400, bassRating: 2 },

  // ─── Massachusetts ───
  { id: 'ma-quabbin', name: 'Quabbin Reservoir', aliases: ['Quabbin'], state: 'MA', lat: 42.39, lon: -72.31, maxDepth: 150, surfaceAcres: 25000, bassRating: 2 },

  // ─── Michigan ───
  { id: '1624888', name: 'Lake Saint Clair', aliases: ['St. Clair', 'Lake St. Clair', 'Saint Clair'], state: 'MI', lat: 42.45, lon: -82.68, maxDepth: 27, surfaceAcres: 275000, bassRating: 4 },
  { id: 'mi-burt', name: 'Burt Lake', aliases: ['Burt'], state: 'MI', lat: 45.42, lon: -84.73, maxDepth: 73, surfaceAcres: 17120, bassRating: 2 },
  { id: 'mi-houghton', name: 'Houghton Lake', aliases: ['Houghton'], state: 'MI', lat: 44.35, lon: -84.77, maxDepth: 22, surfaceAcres: 20044, bassRating: 3 },
  { id: 'mi-murray', name: 'Murray Lake', aliases: ['Murray MI'], state: 'MI', lat: 43.11, lon: -85.30, maxDepth: 65, surfaceAcres: 762, bassRating: 2 },
  { id: 'mi-gun', name: 'Gun Lake', aliases: ['Gun'], state: 'MI', lat: 42.46, lon: -85.42, maxDepth: 64, surfaceAcres: 2680, bassRating: 2 },
  { id: 'mi-gogebic', name: 'Lake Gogebic', aliases: ['Gogebic'], state: 'MI', lat: 46.55, lon: -89.60, maxDepth: 52, surfaceAcres: 13380, bassRating: 2 },
  { id: 'mi-indian', name: 'Indian Lake MI', aliases: ['Indian Lake Michigan'], state: 'MI', lat: 46.00, lon: -86.35, maxDepth: 18, surfaceAcres: 8600, bassRating: 2 },
  { id: 'mi-fletcher-pond', name: 'Fletcher Pond', aliases: ['Fletcher Pond MI', 'Fletcher Lake'], state: 'MI', lat: 45.03, lon: -84.08, maxDepth: 20, surfaceAcres: 9000, bassRating: 2 },
  { id: 'mi-sanford', name: 'Sanford Lake', aliases: ['Sanford'], state: 'MI', lat: 43.68, lon: -84.37, maxDepth: 16, surfaceAcres: 2080, bassRating: 2 },
  { id: 'mi-wixom', name: 'Wixom Lake', aliases: ['Wixom'], state: 'MI', lat: 43.73, lon: -84.45, maxDepth: 18, surfaceAcres: 2169, bassRating: 2 },

  // ─── Minnesota ───
  { id: '647859', name: 'Mille Lacs Lake', aliases: ['Mille Lacs'], state: 'MN', lat: 46.24, lon: -93.65, maxDepth: 43, surfaceAcres: 132516, bassRating: 3 },
  { id: '654378', name: 'Lake of the Woods', aliases: ['Lake of the Woods', 'LOW'], state: 'MN', lat: 49.05, lon: -94.95, maxDepth: 70, surfaceAcres: 307000, bassRating: 3 },
  { id: 'mn-vermilion', name: 'Lake Vermilion', aliases: ['Vermilion'], state: 'MN', lat: 47.87, lon: -92.22, maxDepth: 76, surfaceAcres: 39272, bassRating: 3 },
  { id: 'mn-minnetonka', name: 'Lake Minnetonka', aliases: ['Minnetonka'], state: 'MN', lat: 44.92, lon: -93.60, maxDepth: 113, surfaceAcres: 14528, bassRating: 2 },
  { id: 'mn-leech', name: 'Leech Lake', aliases: ['Leech'], state: 'MN', lat: 47.15, lon: -94.37, maxDepth: 150, surfaceAcres: 110000, bassRating: 3 },
  { id: 'mn-winni', name: 'Lake Winnibigoshish', aliases: ['Winni', 'Winnibigoshish', 'Big Winnie'], state: 'MN', lat: 47.47, lon: -94.07, maxDepth: 72, surfaceAcres: 58544, bassRating: 2 },
  { id: 'mn-prior', name: 'Prior Lake', aliases: ['Prior MN'], state: 'MN', lat: 44.72, lon: -93.42, maxDepth: 68, surfaceAcres: 1820, bassRating: 2 },
  { id: 'mn-rainy', name: 'Rainy Lake', aliases: ['Rainy'], state: 'MN', lat: 48.63, lon: -93.17, maxDepth: 167, surfaceAcres: 222000, bassRating: 3 },
  { id: 'mn-upper-red', name: 'Upper Red Lake', aliases: ['Upper Red', 'Upper Red Lake MN'], state: 'MN', lat: 48.12, lon: -94.77, maxDepth: 15, surfaceAcres: 107800, bassRating: 2 },
  { id: 'mn-kabetogama', name: 'Lake Kabetogama', aliases: ['Kabetogama'], state: 'MN', lat: 48.42, lon: -93.00, maxDepth: 60, surfaceAcres: 26000, bassRating: 2 },
  { id: 'mn-cass', name: 'Cass Lake', aliases: ['Cass Lake MN'], state: 'MN', lat: 47.38, lon: -94.62, maxDepth: 120, surfaceAcres: 15596, bassRating: 2 },

  // ─── Mississippi ───
  { id: '676892', name: 'Ross Barnett Reservoir', aliases: ['Ross Barnett', 'Barnett Reservoir', 'Rez'], state: 'MS', lat: 32.56, lon: -89.88, maxDepth: 35, surfaceAcres: 33000, bassRating: 3 },
  { id: '693366', name: 'Grenada Lake', aliases: ['Grenada'], state: 'MS', lat: 33.83, lon: -89.73, maxDepth: 50, surfaceAcres: 35820, bassRating: 3 },
  { id: '694715', name: 'Sardis Lake', aliases: ['Sardis'], state: 'MS', lat: 34.47, lon: -89.67, maxDepth: 60, surfaceAcres: 58300, bassRating: 3 },
  { id: '691643', name: 'Enid Lake', aliases: ['Enid'], state: 'MS', lat: 34.15, lon: -89.85, maxDepth: 53, surfaceAcres: 26000, bassRating: 2 },
  { id: 'ms-pickwick', name: 'Pickwick Lake MS', aliases: ['Pickwick MS'], state: 'MS', lat: 34.86, lon: -88.26, maxDepth: 55, surfaceAcres: 43100, bassRating: 3 },
  { id: 'ms-arkabutla', name: 'Arkabutla Lake', aliases: ['Arkabutla'], state: 'MS', lat: 34.76, lon: -90.10, maxDepth: 37, surfaceAcres: 12700, bassRating: 2 },
  { id: 'ms-bay-springs', name: 'Bay Springs Lake', aliases: ['Bay Springs'], state: 'MS', lat: 34.82, lon: -88.42, maxDepth: 72, surfaceAcres: 6700, bassRating: 2 },
  { id: 'ms-okatibbee', name: 'Okatibbee Lake', aliases: ['Okatibbee'], state: 'MS', lat: 32.47, lon: -88.72, maxDepth: 60, surfaceAcres: 3810, bassRating: 2 },
  { id: 'ms-ms-lake', name: 'Lake Lamar Bruce', aliases: ['Lamar Bruce'], state: 'MS', lat: 34.67, lon: -88.50, maxDepth: 30, surfaceAcres: 400, bassRating: 2 },
  { id: 'ms-bogue-homo', name: 'Bogue Homo Lake', aliases: ['Bogue Homo'], state: 'MS', lat: 31.48, lon: -89.32, maxDepth: 35, surfaceAcres: 940, bassRating: 2 },

  // ─── Missouri ───
  { id: '752479', name: 'Table Rock Lake', aliases: ['Table Rock'], state: 'MO', lat: 36.60, lon: -93.48, maxDepth: 220, surfaceAcres: 43100, bassRating: 4 },
  { id: '729600', name: 'Lake of the Ozarks', aliases: ['Ozarks', 'Lake Ozarks', 'LOZ'], state: 'MO', lat: 38.17, lon: -92.97, maxDepth: 130, surfaceAcres: 54000, bassRating: 4 },
  { id: 'mo-stockton', name: 'Stockton Lake', aliases: ['Stockton'], state: 'MO', lat: 37.67, lon: -93.67, maxDepth: 132, surfaceAcres: 24900, bassRating: 3 },
  { id: 'mo-truman', name: 'Truman Lake', aliases: ['Truman', 'Harry S Truman'], state: 'MO', lat: 38.28, lon: -93.48, maxDepth: 90, surfaceAcres: 55600, bassRating: 3 },
  { id: 'mo-pomme-de-terre', name: 'Pomme de Terre Lake', aliases: ['Pomme de Terre'], state: 'MO', lat: 37.89, lon: -93.27, maxDepth: 121, surfaceAcres: 7820, bassRating: 2 },
  { id: 'mo-mark-twain', name: 'Mark Twain Lake', aliases: ['Mark Twain', 'Clarence Cannon Dam'], state: 'MO', lat: 39.52, lon: -91.73, maxDepth: 77, surfaceAcres: 18600, bassRating: 2 },
  { id: 'mo-taneycomo', name: 'Lake Taneycomo', aliases: ['Taneycomo'], state: 'MO', lat: 36.63, lon: -93.29, maxDepth: 65, surfaceAcres: 2080, bassRating: 3 },
  { id: 'mo-smithville', name: 'Smithville Lake', aliases: ['Smithville'], state: 'MO', lat: 39.40, lon: -94.56, maxDepth: 50, surfaceAcres: 7189, bassRating: 2 },
  { id: 'mo-longview', name: 'Longview Lake', aliases: ['Longview'], state: 'MO', lat: 38.87, lon: -94.37, maxDepth: 50, surfaceAcres: 930, bassRating: 2 },
  { id: 'mo-wappapello', name: 'Wappapello Lake', aliases: ['Wappapello'], state: 'MO', lat: 36.92, lon: -90.28, maxDepth: 65, surfaceAcres: 8400, bassRating: 2 },
  { id: 'mo-clearwater', name: 'Clearwater Lake', aliases: ['Clearwater MO'], state: 'MO', lat: 37.13, lon: -90.78, maxDepth: 130, surfaceAcres: 1630, bassRating: 2 },
  { id: 'mo-big-river', name: 'Big River Lake', aliases: ['Big River MO'], state: 'MO', lat: 38.05, lon: -90.58, maxDepth: 30, surfaceAcres: 800, bassRating: 2 },
  { id: 'mo-james-fork', name: 'James Fork Lake', aliases: ['James Fork'], state: 'MO', lat: 37.12, lon: -93.82, maxDepth: 60, surfaceAcres: 620, bassRating: 2 },

  // ─── Nebraska ───
  { id: 'ne-mccook', name: 'Lake McConaughy', aliases: ['McConaughy', 'Big Mac'], state: 'NE', lat: 41.22, lon: -101.94, maxDepth: 142, surfaceAcres: 30000, bassRating: 2 },
  { id: 'ne-calamus', name: 'Calamus Reservoir', aliases: ['Calamus'], state: 'NE', lat: 41.88, lon: -99.15, maxDepth: 50, surfaceAcres: 5123, bassRating: 2 },
  { id: 'ne-harlan-county', name: 'Harlan County Reservoir', aliases: ['Harlan County', 'Republican River Reservoir'], state: 'NE', lat: 40.07, lon: -99.22, maxDepth: 45, surfaceAcres: 13250, bassRating: 2 },
  { id: 'ne-sherman', name: 'Sherman Reservoir', aliases: ['Sherman'], state: 'NE', lat: 41.33, lon: -98.87, maxDepth: 50, surfaceAcres: 2845, bassRating: 2 },

  // ─── Nevada ───
  { id: '7862', name: 'Lake Mead', aliases: ['Mead'], state: 'NV', lat: 36.17, lon: -114.43, maxDepth: 590, surfaceAcres: 157900, bassRating: 3 },
  { id: 'nv-mohave', name: 'Lake Mohave', aliases: ['Mohave'], state: 'NV', lat: 35.30, lon: -114.72, maxDepth: 120, surfaceAcres: 28260, bassRating: 2 },
  { id: 'nv-lahontan', name: 'Lahontan Reservoir', aliases: ['Lahontan'], state: 'NV', lat: 39.47, lon: -119.07, maxDepth: 60, surfaceAcres: 17000, bassRating: 2 },

  // ─── New Hampshire ───
  { id: '870958', name: 'Lake Winnipesaukee', aliases: ['Winnipesaukee'], state: 'NH', lat: 43.61, lon: -71.34, maxDepth: 212, surfaceAcres: 44586, bassRating: 3 },
  { id: 'nh-sunapee', name: 'Lake Sunapee', aliases: ['Sunapee'], state: 'NH', lat: 43.40, lon: -72.06, maxDepth: 109, surfaceAcres: 4085, bassRating: 2 },
  { id: 'nh-newfound', name: 'Newfound Lake', aliases: ['Newfound'], state: 'NH', lat: 43.65, lon: -71.78, maxDepth: 180, surfaceAcres: 4106, bassRating: 2 },

  // ─── New Mexico ───
  { id: 'nm-elephant-butte', name: 'Elephant Butte Lake', aliases: ['Elephant Butte'], state: 'NM', lat: 33.15, lon: -107.18, maxDepth: 200, surfaceAcres: 36500, bassRating: 3 },
  { id: 'nm-caballo', name: 'Caballo Lake', aliases: ['Caballo'], state: 'NM', lat: 32.87, lon: -107.30, maxDepth: 100, surfaceAcres: 11500, bassRating: 2 },
  { id: 'nm-navajo', name: 'Navajo Lake', aliases: ['Navajo NM'], state: 'NM', lat: 36.80, lon: -107.61, maxDepth: 395, surfaceAcres: 15600, bassRating: 2 },
  { id: 'nm-ute', name: 'Ute Lake', aliases: ['Ute NM'], state: 'NM', lat: 35.38, lon: -103.48, maxDepth: 75, surfaceAcres: 8200, bassRating: 2 },
  { id: 'nm-conchas', name: 'Conchas Lake', aliases: ['Conchas'], state: 'NM', lat: 35.40, lon: -104.18, maxDepth: 105, surfaceAcres: 9600, bassRating: 2 },
  { id: 'nm-santa-rosa', name: 'Santa Rosa Lake', aliases: ['Santa Rosa NM'], state: 'NM', lat: 34.95, lon: -104.62, maxDepth: 90, surfaceAcres: 3800, bassRating: 2 },

  // ─── New York ───
  { id: '974076', name: 'Cayuga Lake', aliases: ['Cayuga'], state: 'NY', lat: 42.69, lon: -76.70, maxDepth: 435, surfaceAcres: 42956, bassRating: 2 },
  { id: 'ny-oneida', name: 'Oneida Lake', aliases: ['Oneida'], state: 'NY', lat: 43.19, lon: -75.88, maxDepth: 55, surfaceAcres: 51200, bassRating: 3 },
  { id: 'ny-champlain', name: 'Lake Champlain NY', aliases: ['Champlain NY'], state: 'NY', lat: 44.53, lon: -73.36, maxDepth: 400, surfaceAcres: 271000, bassRating: 4 },
  { id: 'ny-chautauqua', name: 'Chautauqua Lake', aliases: ['Chautauqua'], state: 'NY', lat: 42.16, lon: -79.41, maxDepth: 75, surfaceAcres: 13156, bassRating: 3 },
  { id: 'ny-st-lawrence', name: 'St. Lawrence River', aliases: ['St. Lawrence', 'Saint Lawrence', 'Thousand Islands'], state: 'NY', lat: 44.35, lon: -75.92, maxDepth: 250, surfaceAcres: 30000, bassRating: 4 },
  { id: 'ny-seneca', name: 'Seneca Lake', aliases: ['Seneca'], state: 'NY', lat: 42.61, lon: -76.91, maxDepth: 618, surfaceAcres: 43343, bassRating: 2 },
  { id: 'ny-saratoga', name: 'Saratoga Lake', aliases: ['Saratoga'], state: 'NY', lat: 43.05, lon: -73.72, maxDepth: 96, surfaceAcres: 3818, bassRating: 2 },
  { id: 'ny-black', name: 'Black Lake NY', aliases: ['Black Lake New York'], state: 'NY', lat: 44.49, lon: -75.67, maxDepth: 37, surfaceAcres: 7460, bassRating: 3 },
  { id: 'ny-sacandaga', name: 'Great Sacandaga Lake', aliases: ['Sacandaga', 'Great Sacandaga'], state: 'NY', lat: 43.17, lon: -74.17, maxDepth: 110, surfaceAcres: 29000, bassRating: 3 },
  { id: 'ny-otisco', name: 'Otisco Lake', aliases: ['Otisco'], state: 'NY', lat: 42.89, lon: -76.28, maxDepth: 66, surfaceAcres: 1665, bassRating: 2 },
  { id: 'ny-cross', name: 'Cross Lake NY', aliases: ['Cross Lake New York'], state: 'NY', lat: 43.17, lon: -76.50, maxDepth: 40, surfaceAcres: 1820, bassRating: 2 },
  { id: 'ny-onondaga', name: 'Onondaga Lake', aliases: ['Onondaga'], state: 'NY', lat: 43.10, lon: -76.22, maxDepth: 65, surfaceAcres: 4618, bassRating: 2 },
  { id: 'ny-skaneateles', name: 'Skaneateles Lake', aliases: ['Skaneateles'], state: 'NY', lat: 42.83, lon: -76.43, maxDepth: 349, surfaceAcres: 9041, bassRating: 2 },
  { id: 'ny-owasco', name: 'Owasco Lake', aliases: ['Owasco'], state: 'NY', lat: 42.72, lon: -76.50, maxDepth: 177, surfaceAcres: 6756, bassRating: 2 },

  // ─── North Carolina ───
  { id: '1227721', name: 'Lake Wylie', aliases: ['Wylie'], state: 'NC', lat: 35.10, lon: -81.04, maxDepth: 100, surfaceAcres: 12455, bassRating: 2 },
  { id: '991183', name: 'Lake Norman', aliases: ['Norman'], state: 'NC', lat: 35.54, lon: -80.94, maxDepth: 130, surfaceAcres: 32510, bassRating: 3 },
  { id: '999761', name: 'Falls Lake', aliases: ['Falls Lake NC'], state: 'NC', lat: 35.90, lon: -78.40, maxDepth: 90, surfaceAcres: 12410, bassRating: 2 },
  { id: '985605', name: 'Lake Gaston', aliases: ['Gaston'], state: 'NC', lat: 36.54, lon: -78.06, maxDepth: 90, surfaceAcres: 20300, bassRating: 3 },
  { id: 'nc-jordan', name: 'Jordan Lake', aliases: ['Jordan NC', 'B. Everett Jordan'], state: 'NC', lat: 35.72, lon: -79.02, maxDepth: 64, surfaceAcres: 13940, bassRating: 3 },
  { id: 'nc-high-rock', name: 'High Rock Lake', aliases: ['High Rock'], state: 'NC', lat: 35.59, lon: -80.22, maxDepth: 68, surfaceAcres: 15180, bassRating: 3 },
  { id: 'nc-badin', name: 'Badin Lake', aliases: ['Badin'], state: 'NC', lat: 35.42, lon: -80.10, maxDepth: 120, surfaceAcres: 5355, bassRating: 2 },
  { id: 'nc-shearon-harris', name: 'Shearon Harris Lake', aliases: ['Shearon Harris', 'Harris Lake NC'], state: 'NC', lat: 35.65, lon: -78.98, maxDepth: 50, surfaceAcres: 4100, bassRating: 2 },
  { id: 'nc-james', name: 'Lake James', aliases: ['James NC'], state: 'NC', lat: 35.72, lon: -81.90, maxDepth: 150, surfaceAcres: 6812, bassRating: 2 },
  { id: 'nc-rhodhiss', name: 'Lake Rhodhiss', aliases: ['Rhodhiss'], state: 'NC', lat: 35.77, lon: -81.47, maxDepth: 90, surfaceAcres: 3285, bassRating: 2 },
  { id: 'nc-hickory', name: 'Lake Hickory', aliases: ['Hickory NC'], state: 'NC', lat: 35.72, lon: -81.22, maxDepth: 105, surfaceAcres: 4223, bassRating: 2 },
  { id: 'nc-mountain-island', name: 'Mountain Island Lake', aliases: ['Mountain Island'], state: 'NC', lat: 35.42, lon: -80.99, maxDepth: 115, surfaceAcres: 3279, bassRating: 2 },
  { id: 'nc-w-kerr-scott', name: 'W. Kerr Scott Reservoir', aliases: ['W Kerr Scott', 'Kerr Scott'], state: 'NC', lat: 36.12, lon: -81.22, maxDepth: 75, surfaceAcres: 1475, bassRating: 2 },
  { id: 'nc-tillery', name: 'Lake Tillery', aliases: ['Tillery'], state: 'NC', lat: 35.25, lon: -80.08, maxDepth: 60, surfaceAcres: 5600, bassRating: 2 },
  { id: 'nc-tuckertown', name: 'Tuckertown Reservoir', aliases: ['Tuckertown'], state: 'NC', lat: 35.49, lon: -80.14, maxDepth: 80, surfaceAcres: 2280, bassRating: 2 },
  { id: 'nc-fontana', name: 'Fontana Lake', aliases: ['Fontana'], state: 'NC', lat: 35.45, lon: -83.82, maxDepth: 440, surfaceAcres: 10530, bassRating: 2 },
  { id: 'nc-santeetlah', name: 'Santeetlah Lake', aliases: ['Santeetlah'], state: 'NC', lat: 35.37, lon: -84.05, maxDepth: 170, surfaceAcres: 3000, bassRating: 2 },

  // ─── Ohio ───
  { id: '1075813', name: 'Lake Erie', aliases: ['Lake Erie Western Basin', 'Erie'], state: 'OH', lat: 42.15, lon: -81.24, maxDepth: 210, surfaceAcres: 9910, bassRating: 4 },
  { id: 'oh-alum-creek', name: 'Alum Creek Reservoir', aliases: ['Alum Creek'], state: 'OH', lat: 40.15, lon: -82.96, maxDepth: 70, surfaceAcres: 3387, bassRating: 2 },
  { id: 'oh-caesar-creek', name: 'Caesar Creek Lake', aliases: ['Caesar Creek'], state: 'OH', lat: 39.48, lon: -84.06, maxDepth: 115, surfaceAcres: 2830, bassRating: 2 },
  { id: 'oh-paint-creek', name: 'Paint Creek Lake', aliases: ['Paint Creek'], state: 'OH', lat: 39.35, lon: -83.47, maxDepth: 45, surfaceAcres: 1190, bassRating: 2 },
  { id: 'oh-buckeye', name: 'Buckeye Lake', aliases: ['Buckeye'], state: 'OH', lat: 39.93, lon: -82.47, maxDepth: 16, surfaceAcres: 3310, bassRating: 2 },
  { id: 'oh-hoover', name: 'Hoover Reservoir', aliases: ['Hoover'], state: 'OH', lat: 40.11, lon: -82.87, maxDepth: 55, surfaceAcres: 3046, bassRating: 2 },
  { id: 'oh-delaware', name: 'Delaware Lake', aliases: ['Delaware OH'], state: 'OH', lat: 40.33, lon: -83.06, maxDepth: 46, surfaceAcres: 1330, bassRating: 2 },
  { id: 'oh-piedmont', name: 'Piedmont Lake', aliases: ['Piedmont OH'], state: 'OH', lat: 40.15, lon: -81.18, maxDepth: 50, surfaceAcres: 2270, bassRating: 2 },
  { id: 'oh-mosquito-creek', name: 'Mosquito Creek Lake', aliases: ['Mosquito Creek'], state: 'OH', lat: 41.32, lon: -80.73, maxDepth: 36, surfaceAcres: 7850, bassRating: 2 },
  { id: 'oh-berlin', name: 'Berlin Reservoir', aliases: ['Berlin', 'Berlin Lake OH'], state: 'OH', lat: 41.07, lon: -81.05, maxDepth: 54, surfaceAcres: 3590, bassRating: 2 },
  { id: 'oh-salt-fork', name: 'Salt Fork Lake', aliases: ['Salt Fork'], state: 'OH', lat: 40.17, lon: -81.50, maxDepth: 57, surfaceAcres: 2952, bassRating: 2 },
  { id: 'oh-tappan', name: 'Tappan Lake', aliases: ['Tappan'], state: 'OH', lat: 40.37, lon: -81.22, maxDepth: 50, surfaceAcres: 2350, bassRating: 2 },
  { id: 'oh-atwood', name: 'Atwood Lake', aliases: ['Atwood'], state: 'OH', lat: 40.58, lon: -81.37, maxDepth: 50, surfaceAcres: 1540, bassRating: 2 },
  { id: 'oh-leesville', name: 'Leesville Lake OH', aliases: ['Leesville OH'], state: 'OH', lat: 40.47, lon: -81.22, maxDepth: 48, surfaceAcres: 1000, bassRating: 2 },

  // ─── Oklahoma ───
  { id: '1100123', name: 'Lake Eufaula', aliases: ['Eufaula OK', 'Eufaula Lake Oklahoma'], state: 'OK', lat: 35.18, lon: -95.75, maxDepth: 87, surfaceAcres: 102500, bassRating: 4 },
  { id: '1102966', name: 'Lake Texoma', aliases: ['Texoma'], state: 'OK', lat: 33.88, lon: -96.69, maxDepth: 100, surfaceAcres: 89000, bassRating: 3 },
  { id: '1102836', name: "Grand Lake O' the Cherokees", aliases: ['Grand Lake', 'Grand Lake Oklahoma', 'Grand'], state: 'OK', lat: 36.60, lon: -94.86, maxDepth: 150, surfaceAcres: 46500, bassRating: 3 },
  { id: '1098801', name: 'Lake Tenkiller', aliases: ['Tenkiller', 'Tenkiller Ferry'], state: 'OK', lat: 35.69, lon: -94.98, maxDepth: 165, surfaceAcres: 12900, bassRating: 3 },
  { id: '1101902', name: 'Broken Bow Lake', aliases: ['Broken Bow'], state: 'OK', lat: 34.21, lon: -94.68, maxDepth: 158, surfaceAcres: 14200, bassRating: 3 },
  { id: 'ok-skiatook', name: 'Skiatook Lake', aliases: ['Skiatook'], state: 'OK', lat: 36.36, lon: -96.06, maxDepth: 99, surfaceAcres: 10190, bassRating: 2 },
  { id: 'ok-fort-gibson', name: 'Fort Gibson Lake', aliases: ['Fort Gibson'], state: 'OK', lat: 35.88, lon: -95.23, maxDepth: 100, surfaceAcres: 19900, bassRating: 3 },
  { id: 'ok-oologah', name: 'Oologah Lake', aliases: ['Oologah'], state: 'OK', lat: 36.47, lon: -95.68, maxDepth: 74, surfaceAcres: 29500, bassRating: 2 },
  { id: 'ok-sardis', name: 'Sardis Lake', aliases: ['Sardis OK'], state: 'OK', lat: 34.60, lon: -95.35, maxDepth: 100, surfaceAcres: 14360, bassRating: 2 },
  { id: 'ok-arbuckle', name: 'Lake of the Arbuckles', aliases: ['Arbuckle'], state: 'OK', lat: 34.47, lon: -97.08, maxDepth: 107, surfaceAcres: 2350, bassRating: 2 },
  { id: 'ok-hugo', name: 'Hugo Lake', aliases: ['Hugo'], state: 'OK', lat: 34.07, lon: -95.38, maxDepth: 65, surfaceAcres: 13250, bassRating: 2 },
  { id: 'ok-canton', name: 'Canton Lake', aliases: ['Canton OK'], state: 'OK', lat: 36.07, lon: -98.60, maxDepth: 55, surfaceAcres: 7910, bassRating: 2 },
  { id: 'ok-waurika', name: 'Waurika Lake', aliases: ['Waurika'], state: 'OK', lat: 34.15, lon: -97.98, maxDepth: 70, surfaceAcres: 10000, bassRating: 2 },
  { id: 'ok-keystone', name: 'Keystone Lake', aliases: ['Keystone'], state: 'OK', lat: 36.13, lon: -96.32, maxDepth: 70, surfaceAcres: 26343, bassRating: 3 },
  { id: 'ok-mcalester', name: 'Lake McAlester', aliases: ['McAlester OK'], state: 'OK', lat: 34.80, lon: -95.83, maxDepth: 45, surfaceAcres: 1680, bassRating: 2 },
  { id: 'ok-thunderbird', name: 'Lake Thunderbird', aliases: ['Thunderbird'], state: 'OK', lat: 35.22, lon: -97.28, maxDepth: 55, surfaceAcres: 6070, bassRating: 2 },
  { id: 'ok-murray', name: 'Lake Murray', aliases: ['Murray OK'], state: 'OK', lat: 34.05, lon: -97.08, maxDepth: 60, surfaceAcres: 5728, bassRating: 2 },
  { id: 'ok-gibson', name: 'Lake Gibson', aliases: ['Gibson OK'], state: 'OK', lat: 35.62, lon: -95.50, maxDepth: 55, surfaceAcres: 9300, bassRating: 2 },

  // ─── Oregon ───
  { id: 'or-tenmile', name: 'Tenmile Lake', aliases: ['Tenmile'], state: 'OR', lat: 43.56, lon: -124.19, maxDepth: 67, surfaceAcres: 1675, bassRating: 2 },
  { id: 'or-siltcoos', name: 'Siltcoos Lake', aliases: ['Siltcoos'], state: 'OR', lat: 43.87, lon: -124.14, maxDepth: 22, surfaceAcres: 3164, bassRating: 2 },
  { id: 'or-henry-hagg', name: 'Henry Hagg Lake', aliases: ['Hagg Lake', 'Henry Hagg'], state: 'OR', lat: 45.47, lon: -123.22, maxDepth: 110, surfaceAcres: 1113, bassRating: 2 },
  { id: 'or-columbia', name: 'Columbia River Sloughs', aliases: ['Columbia Sloughs', 'Columbia River OR'], state: 'OR', lat: 45.63, lon: -122.75, maxDepth: 40, surfaceAcres: 5000, bassRating: 2 },
  { id: 'or-lost-creek', name: 'Lost Creek Lake', aliases: ['Lost Creek OR'], state: 'OR', lat: 42.62, lon: -122.68, maxDepth: 250, surfaceAcres: 3430, bassRating: 2 },
  { id: 'or-applegate', name: 'Applegate Lake', aliases: ['Applegate'], state: 'OR', lat: 42.07, lon: -123.01, maxDepth: 130, surfaceAcres: 988, bassRating: 2 },

  // ─── Pennsylvania ───
  { id: '1193175', name: 'Raystown Lake', aliases: ['Raystown'], state: 'PA', lat: 40.36, lon: -78.10, maxDepth: 200, surfaceAcres: 8300, bassRating: 2 },
  { id: 'pa-wallenpaupack', name: 'Lake Wallenpaupack', aliases: ['Wallenpaupack'], state: 'PA', lat: 41.38, lon: -75.22, maxDepth: 60, surfaceAcres: 5700, bassRating: 2 },
  { id: 'pa-nockamixon', name: 'Lake Nockamixon', aliases: ['Nockamixon'], state: 'PA', lat: 40.46, lon: -75.22, maxDepth: 82, surfaceAcres: 1450, bassRating: 2 },
  { id: 'pa-pymatuning', name: 'Pymatuning Lake', aliases: ['Pymatuning'], state: 'PA', lat: 41.58, lon: -80.42, maxDepth: 36, surfaceAcres: 17088, bassRating: 3 },
  { id: 'pa-beltzville', name: 'Beltzville Lake', aliases: ['Beltzville'], state: 'PA', lat: 40.87, lon: -75.64, maxDepth: 100, surfaceAcres: 949, bassRating: 2 },
  { id: 'pa-shenango', name: 'Shenango River Lake', aliases: ['Shenango', 'Lake Wilhelm'], state: 'PA', lat: 41.35, lon: -80.47, maxDepth: 50, surfaceAcres: 3560, bassRating: 2 },
  { id: 'pa-youghiogheny', name: 'Youghiogheny River Lake', aliases: ['Youghiogheny', 'Yough Lake'], state: 'PA', lat: 39.92, lon: -79.42, maxDepth: 120, surfaceAcres: 2840, bassRating: 2 },
  { id: 'pa-allegheny', name: 'Allegheny Reservoir', aliases: ['Allegheny', 'Kinzua'], state: 'PA', lat: 41.80, lon: -79.02, maxDepth: 125, surfaceAcres: 21200, bassRating: 2 },
  { id: 'pa-kettle', name: 'Kettle Creek Reservoir', aliases: ['Kettle Creek PA'], state: 'PA', lat: 41.40, lon: -77.82, maxDepth: 100, surfaceAcres: 165, bassRating: 2 },

  // ─── South Carolina ───
  { id: '1224900', name: 'Lake Murray', aliases: ['Murray SC'], state: 'SC', lat: 34.07, lon: -81.38, maxDepth: 190, surfaceAcres: 50000, bassRating: 3 },
  { id: '1238598', name: 'Lake Keowee', aliases: ['Keowee'], state: 'SC', lat: 34.81, lon: -82.92, maxDepth: 300, surfaceAcres: 18500, bassRating: 3 },
  { id: '1224315', name: 'Lake Marion', aliases: ['Marion', 'Santee Cooper', 'Santee Cooper Lakes'], state: 'SC', lat: 33.46, lon: -80.38, maxDepth: 75, surfaceAcres: 110000, bassRating: 4 },
  { id: 'sc-moultrie', name: 'Lake Moultrie', aliases: ['Moultrie'], state: 'SC', lat: 33.28, lon: -80.10, maxDepth: 70, surfaceAcres: 60400, bassRating: 3 },
  { id: 'sc-wateree', name: 'Lake Wateree', aliases: ['Wateree'], state: 'SC', lat: 34.38, lon: -80.73, maxDepth: 80, surfaceAcres: 13700, bassRating: 3 },
  { id: 'sc-jocassee', name: 'Lake Jocassee', aliases: ['Jocassee'], state: 'SC', lat: 34.96, lon: -82.92, maxDepth: 360, surfaceAcres: 7565, bassRating: 2 },
  { id: 'sc-greenwood', name: 'Lake Greenwood', aliases: ['Greenwood'], state: 'SC', lat: 34.15, lon: -82.00, maxDepth: 60, surfaceAcres: 11400, bassRating: 2 },
  { id: 'sc-russell', name: 'Lake Russell', aliases: ['Russell SC', 'Richard B. Russell'], state: 'SC', lat: 34.13, lon: -82.77, maxDepth: 120, surfaceAcres: 26650, bassRating: 3 },
  { id: 'sc-fishing-creek', name: 'Fishing Creek Reservoir', aliases: ['Fishing Creek SC'], state: 'SC', lat: 34.70, lon: -81.13, maxDepth: 55, surfaceAcres: 3390, bassRating: 2 },
  { id: 'sc-robinson', name: 'Lake Robinson', aliases: ['Robinson SC'], state: 'SC', lat: 34.90, lon: -81.85, maxDepth: 55, surfaceAcres: 1020, bassRating: 2 },
  { id: 'sc-wylie-sc', name: 'Lake Wylie SC', aliases: ['Lake Wylie South Carolina'], state: 'SC', lat: 35.08, lon: -81.07, maxDepth: 100, surfaceAcres: 12455, bassRating: 2 },
  { id: 'sc-hartwell-sc', name: 'Lake Hartwell SC', aliases: ['Hartwell SC'], state: 'SC', lat: 34.40, lon: -82.88, maxDepth: 185, surfaceAcres: 56000, bassRating: 3 },
  { id: 'sc-thurmond', name: 'J. Strom Thurmond Lake SC', aliases: ['Thurmond SC', 'Clarks Hill SC'], state: 'SC', lat: 33.60, lon: -82.22, maxDepth: 180, surfaceAcres: 71100, bassRating: 3 },
  { id: 'sc-catawba', name: 'Lake Catawba', aliases: ['Catawba SC'], state: 'SC', lat: 35.02, lon: -81.13, maxDepth: 80, surfaceAcres: 3256, bassRating: 2 },
  { id: 'sc-monticello', name: 'Lake Monticello SC', aliases: ['Monticello SC'], state: 'SC', lat: 34.37, lon: -81.08, maxDepth: 60, surfaceAcres: 7100, bassRating: 2 },

  // ─── Tennessee ───
  { id: '1326920', name: 'Chickamauga Lake', aliases: ['Chickamauga', 'Chick'], state: 'TN', lat: 35.40, lon: -84.99, maxDepth: 60, surfaceAcres: 35400, bassRating: 5 },
  { id: '1269701', name: 'Kentucky Lake', aliases: ['Kentucky'], state: 'TN', lat: 35.42, lon: -88.07, maxDepth: 75, surfaceAcres: 160300, bassRating: 4 },
  { id: '490538', name: 'Dale Hollow Lake', aliases: ['Dale Hollow'], state: 'TN', lat: 36.51, lon: -85.37, maxDepth: 248, surfaceAcres: 27700, bassRating: 3 },
  { id: '1269832', name: 'Norris Lake', aliases: ['Norris'], state: 'TN', lat: 36.30, lon: -83.88, maxDepth: 260, surfaceAcres: 34200, bassRating: 3 },
  { id: '1313767', name: 'Center Hill Lake', aliases: ['Center Hill'], state: 'TN', lat: 35.82, lon: -85.67, maxDepth: 291, surfaceAcres: 18220, bassRating: 3 },
  { id: '1269839', name: 'Old Hickory Lake', aliases: ['Old Hickory'], state: 'TN', lat: 36.31, lon: -86.30, maxDepth: 91, surfaceAcres: 22500, bassRating: 3 },
  { id: '1289137', name: 'Percy Priest Lake', aliases: ['Percy Priest', 'J Percy Priest'], state: 'TN', lat: 36.07, lon: -86.53, maxDepth: 90, surfaceAcres: 14200, bassRating: 3 },
  { id: '1304421', name: 'Watts Bar Lake', aliases: ['Watts Bar'], state: 'TN', lat: 35.85, lon: -84.55, maxDepth: 162, surfaceAcres: 39000, bassRating: 3 },
  { id: 'tn-ft-loudoun', name: 'Fort Loudoun Lake', aliases: ['Fort Loudoun', 'Ft Loudoun'], state: 'TN', lat: 35.79, lon: -84.17, maxDepth: 81, surfaceAcres: 14600, bassRating: 3 },
  { id: 'tn-cherokee', name: 'Cherokee Lake', aliases: ['Cherokee TN'], state: 'TN', lat: 36.20, lon: -83.40, maxDepth: 200, surfaceAcres: 28780, bassRating: 3 },
  { id: 'tn-douglas', name: 'Douglas Lake', aliases: ['Douglas'], state: 'TN', lat: 36.00, lon: -83.40, maxDepth: 150, surfaceAcres: 28420, bassRating: 2 },
  { id: 'tn-tellico', name: 'Tellico Lake', aliases: ['Tellico'], state: 'TN', lat: 35.60, lon: -84.28, maxDepth: 180, surfaceAcres: 15560, bassRating: 3 },
  { id: 'tn-melton-hill', name: 'Melton Hill Lake', aliases: ['Melton Hill'], state: 'TN', lat: 35.88, lon: -84.30, maxDepth: 100, surfaceAcres: 5690, bassRating: 2 },
  { id: 'tn-pickwick', name: 'Pickwick Lake TN', aliases: ['Pickwick TN'], state: 'TN', lat: 35.08, lon: -88.10, maxDepth: 55, surfaceAcres: 43100, bassRating: 4 },
  { id: 'tn-tims-ford', name: 'Tims Ford Lake', aliases: ['Tims Ford'], state: 'TN', lat: 35.17, lon: -86.25, maxDepth: 90, surfaceAcres: 10700, bassRating: 3 },
  { id: 'tn-boone', name: 'Boone Lake', aliases: ['Boone'], state: 'TN', lat: 36.38, lon: -82.42, maxDepth: 130, surfaceAcres: 4310, bassRating: 2 },
  { id: 'tn-reelfoot', name: 'Reelfoot Lake', aliases: ['Reelfoot'], state: 'TN', lat: 36.45, lon: -89.35, maxDepth: 18, surfaceAcres: 15000, bassRating: 3 },
  { id: 'tn-cordell-hull', name: 'Cordell Hull Lake', aliases: ['Cordell Hull'], state: 'TN', lat: 36.43, lon: -85.80, maxDepth: 96, surfaceAcres: 12000, bassRating: 2 },
  { id: 'tn-woods', name: 'Woods Reservoir', aliases: ['Woods', 'Woods Lake TN'], state: 'TN', lat: 35.23, lon: -86.30, maxDepth: 55, surfaceAcres: 3940, bassRating: 2 },
  { id: 'tn-south-holston', name: 'South Holston Lake', aliases: ['South Holston', 'South Holston TN'], state: 'TN', lat: 36.53, lon: -82.12, maxDepth: 185, surfaceAcres: 7580, bassRating: 2 },
  { id: 'tn-cheatham', name: 'Cheatham Lake', aliases: ['Cheatham'], state: 'TN', lat: 36.32, lon: -87.12, maxDepth: 60, surfaceAcres: 7450, bassRating: 2 },
  { id: 'tn-barkley-tn', name: 'Lake Barkley TN', aliases: ['Barkley TN'], state: 'TN', lat: 36.55, lon: -87.85, maxDepth: 60, surfaceAcres: 57920, bassRating: 3 },
  { id: 'tn-hiwassee', name: 'Hiwassee Lake', aliases: ['Hiwassee TN'], state: 'TN', lat: 35.17, lon: -84.28, maxDepth: 200, surfaceAcres: 6090, bassRating: 2 },
  { id: 'tn-watauga', name: 'Watauga Lake', aliases: ['Watauga'], state: 'TN', lat: 36.37, lon: -82.02, maxDepth: 267, surfaceAcres: 6430, bassRating: 2 },
  { id: 'tn-nikajack', name: 'Nickajack Lake', aliases: ['Nickajack'], state: 'TN', lat: 35.10, lon: -85.50, maxDepth: 60, surfaceAcres: 10370, bassRating: 3 },
  { id: 'tn-guntersville-tn', name: 'Guntersville Lake TN', aliases: ['Guntersville TN'], state: 'TN', lat: 34.95, lon: -85.98, maxDepth: 60, surfaceAcres: 67900, bassRating: 4 },
  { id: 'tn-wilson-tn', name: 'Wilson Lake TN', aliases: ['Wilson TN'], state: 'TN', lat: 34.75, lon: -87.60, maxDepth: 59, surfaceAcres: 15930, bassRating: 3 },

  // ─── Texas ───
  { id: '1388620', name: 'Lake Fork Reservoir', aliases: ['Lake Fork', 'Fork', 'Fork Reservoir'], state: 'TX', lat: 32.80, lon: -95.54, maxDepth: 70, surfaceAcres: 27690, bassRating: 5 },
  { id: '1384041', name: 'Sam Rayburn Reservoir', aliases: ['Sam Rayburn', 'Rayburn', 'Sam Rayburn Lake'], state: 'TX', lat: 31.11, lon: -94.15, maxDepth: 80, surfaceAcres: 114500, bassRating: 5 },
  { id: '1373696', name: 'Falcon Lake', aliases: ['Falcon', 'Falcon Reservoir', 'International Falcon'], state: 'TX', lat: 26.74, lon: -99.23, maxDepth: 110, surfaceAcres: 83654, bassRating: 5 },
  { id: '1858775', name: 'Lake Amistad', aliases: ['Amistad', 'Amistad Reservoir'], state: 'TX', lat: 29.71, lon: -101.35, maxDepth: 217, surfaceAcres: 64860, bassRating: 4 },
  { id: '1385437', name: 'Lake Lewisville', aliases: ['Lewisville', 'Lewisville Lake', 'Lake Lewisville'], state: 'TX', lat: 33.08, lon: -96.99, maxDepth: 67, surfaceAcres: 29000, bassRating: 3 },
  { id: '1380953', name: 'Lake Conroe', aliases: ['Conroe'], state: 'TX', lat: 30.43, lon: -95.60, maxDepth: 70, surfaceAcres: 21000, bassRating: 3 },
  { id: '1377269', name: 'Ray Roberts Lake', aliases: ['Ray Roberts', 'Lake Ray Roberts'], state: 'TX', lat: 33.33, lon: -97.03, maxDepth: 106, surfaceAcres: 29350, bassRating: 3 },
  { id: '2611276', name: 'O.H. Ivie Reservoir', aliases: ['O.H. Ivie', 'Ivie', 'OH Ivie'], state: 'TX', lat: 31.54, lon: -99.68, maxDepth: 119, surfaceAcres: 19149, bassRating: 3 },
  { id: '2805147', name: 'Choke Canyon Reservoir', aliases: ['Choke Canyon', 'Choke'], state: 'TX', lat: 28.49, lon: -98.30, maxDepth: 85, surfaceAcres: 26000, bassRating: 3 },
  { id: '1374767', name: 'Lake LBJ', aliases: ['LBJ', 'Lake Lyndon B Johnson', 'Lyndon B Johnson'], state: 'TX', lat: 30.56, lon: -98.36, maxDepth: 90, surfaceAcres: 6375, bassRating: 3 },
  { id: '1339727', name: 'Lavon Lake', aliases: ['Lavon', 'Lake Lavon'], state: 'TX', lat: 33.07, lon: -96.48, maxDepth: 60, surfaceAcres: 21000, bassRating: 2 },
  { id: '1373517', name: 'Eagle Mountain Lake', aliases: ['Eagle Mountain'], state: 'TX', lat: 32.92, lon: -97.50, maxDepth: 50, surfaceAcres: 8738, bassRating: 2 },
  { id: 'tx-ray-hubbard', name: 'Lake Ray Hubbard', aliases: ['Ray Hubbard', 'Hubbard'], state: 'TX', lat: 32.82, lon: -96.50, maxDepth: 40, surfaceAcres: 22745, bassRating: 3 },
  { id: 'tx-white-rock', name: 'White Rock Lake', aliases: ['White Rock', 'White Rock Dallas'], state: 'TX', lat: 32.83, lon: -96.72, maxDepth: 18, surfaceAcres: 1254, bassRating: 2 },
  { id: 'tx-tawakoni', name: 'Lake Tawakoni', aliases: ['Tawakoni'], state: 'TX', lat: 32.86, lon: -96.03, maxDepth: 55, surfaceAcres: 37879, bassRating: 3 },
  { id: 'tx-travis', name: 'Lake Travis', aliases: ['Travis'], state: 'TX', lat: 30.42, lon: -97.95, maxDepth: 210, surfaceAcres: 18929, bassRating: 3 },
  { id: 'tx-whitney', name: 'Lake Whitney', aliases: ['Whitney'], state: 'TX', lat: 31.87, lon: -97.38, maxDepth: 123, surfaceAcres: 23560, bassRating: 3 },
  { id: 'tx-cedar-creek', name: 'Cedar Creek Reservoir', aliases: ['Cedar Creek', 'Cedar Creek Lake'], state: 'TX', lat: 32.30, lon: -96.14, maxDepth: 50, surfaceAcres: 33750, bassRating: 3 },
  { id: 'tx-richland-chambers', name: 'Richland Chambers Reservoir', aliases: ['Richland Chambers', 'Richland-Chambers'], state: 'TX', lat: 31.96, lon: -96.15, maxDepth: 75, surfaceAcres: 41350, bassRating: 3 },
  { id: 'tx-livingston', name: 'Lake Livingston', aliases: ['Livingston'], state: 'TX', lat: 30.80, lon: -95.00, maxDepth: 83, surfaceAcres: 82600, bassRating: 3 },
  { id: 'tx-palestine', name: 'Lake Palestine', aliases: ['Palestine'], state: 'TX', lat: 32.12, lon: -95.52, maxDepth: 58, surfaceAcres: 25560, bassRating: 3 },
  { id: 'tx-toledo-bend', name: 'Toledo Bend TX', aliases: ['Toledo Bend TX'], state: 'TX', lat: 31.50, lon: -93.74, maxDepth: 110, surfaceAcres: 185000, bassRating: 5 },
  { id: 'tx-buchanan', name: 'Lake Buchanan', aliases: ['Buchanan'], state: 'TX', lat: 30.80, lon: -98.40, maxDepth: 132, surfaceAcres: 23200, bassRating: 2 },
  { id: 'tx-belton', name: 'Belton Lake', aliases: ['Belton'], state: 'TX', lat: 31.10, lon: -97.48, maxDepth: 124, surfaceAcres: 12300, bassRating: 2 },
  { id: 'tx-possum-kingdom', name: 'Possum Kingdom Lake', aliases: ['Possum Kingdom', 'PK Lake'], state: 'TX', lat: 32.87, lon: -98.52, maxDepth: 145, surfaceAcres: 17700, bassRating: 3 },
  { id: 'tx-purtis-creek', name: 'Purtis Creek Lake', aliases: ['Purtis Creek', 'Purtis Creek State Park'], state: 'TX', lat: 32.35, lon: -96.00, maxDepth: 18, surfaceAcres: 355, bassRating: 3 },
  { id: 'tx-grapevine', name: 'Grapevine Lake', aliases: ['Grapevine'], state: 'TX', lat: 32.98, lon: -97.08, maxDepth: 60, surfaceAcres: 7380, bassRating: 2 },
  { id: 'tx-joe-pool', name: 'Joe Pool Lake', aliases: ['Joe Pool'], state: 'TX', lat: 32.61, lon: -97.00, maxDepth: 75, surfaceAcres: 7470, bassRating: 2 },
  { id: 'tx-alan-henry', name: 'Alan Henry Reservoir', aliases: ['Alan Henry'], state: 'TX', lat: 33.06, lon: -101.05, maxDepth: 115, surfaceAcres: 2880, bassRating: 3 },
  { id: 'tx-somerville', name: 'Lake Somerville', aliases: ['Somerville'], state: 'TX', lat: 30.33, lon: -96.53, maxDepth: 60, surfaceAcres: 11460, bassRating: 2 },
  { id: 'tx-houston', name: 'Lake Houston', aliases: ['Houston', 'Lake Houston'], state: 'TX', lat: 30.04, lon: -95.15, maxDepth: 35, surfaceAcres: 12240, bassRating: 2 },
  { id: 'tx-austin', name: 'Lake Austin', aliases: ['Austin TX lake', 'Town Lake'], state: 'TX', lat: 30.30, lon: -97.85, maxDepth: 75, surfaceAcres: 1830, bassRating: 2 },
  { id: 'tx-bob-sandlin', name: 'Lake Bob Sandlin', aliases: ['Bob Sandlin', 'Sandlin'], state: 'TX', lat: 33.05, lon: -95.02, maxDepth: 70, surfaceAcres: 9460, bassRating: 3 },
  { id: 'tx-wright-patman', name: 'Wright Patman Lake', aliases: ['Wright Patman', 'Texarkana Lake'], state: 'TX', lat: 33.30, lon: -94.16, maxDepth: 40, surfaceAcres: 20300, bassRating: 2 },
  { id: 'tx-caddo', name: 'Caddo Lake TX', aliases: ['Caddo TX'], state: 'TX', lat: 32.72, lon: -94.07, maxDepth: 20, surfaceAcres: 26800, bassRating: 3 },
  { id: 'tx-monticello', name: 'Lake Monticello', aliases: ['Monticello'], state: 'TX', lat: 33.10, lon: -95.55, maxDepth: 55, surfaceAcres: 2000, bassRating: 2 },
  { id: 'tx-athens', name: 'Lake Athens', aliases: ['Athens'], state: 'TX', lat: 32.14, lon: -95.78, maxDepth: 30, surfaceAcres: 1799, bassRating: 2 },
  { id: 'tx-naconiche', name: 'Lake Naconiche', aliases: ['Naconiche'], state: 'TX', lat: 31.64, lon: -94.57, maxDepth: 62, surfaceAcres: 696, bassRating: 3 },
  { id: 'tx-waco', name: 'Lake Waco', aliases: ['Waco'], state: 'TX', lat: 31.61, lon: -97.23, maxDepth: 78, surfaceAcres: 7300, bassRating: 2 },
  { id: 'tx-proctor', name: 'Proctor Lake', aliases: ['Proctor'], state: 'TX', lat: 31.95, lon: -98.47, maxDepth: 55, surfaceAcres: 4610, bassRating: 2 },
  { id: 'tx-granbury', name: 'Lake Granbury', aliases: ['Granbury'], state: 'TX', lat: 32.41, lon: -97.74, maxDepth: 70, surfaceAcres: 8310, bassRating: 2 },
  { id: 'tx-benbrook', name: 'Benbrook Lake', aliases: ['Benbrook'], state: 'TX', lat: 32.63, lon: -97.43, maxDepth: 75, surfaceAcres: 3770, bassRating: 2 },
  { id: 'tx-texana', name: 'Lake Texana', aliases: ['Texana', 'Navidad Lake'], state: 'TX', lat: 28.97, lon: -96.57, maxDepth: 50, surfaceAcres: 11000, bassRating: 2 },
  { id: 'tx-o-the-pines', name: "Lake O' the Pines", aliases: ["O' the Pines", 'O the Pines', 'Lake O the Pines'], state: 'TX', lat: 32.80, lon: -94.60, maxDepth: 75, surfaceAcres: 18700, bassRating: 3 },
  { id: 'tx-martin-creek', name: 'Martin Creek Lake', aliases: ['Martin Creek'], state: 'TX', lat: 32.51, lon: -94.57, maxDepth: 55, surfaceAcres: 5000, bassRating: 2 },
  { id: 'tx-gibbons-creek', name: 'Gibbons Creek Reservoir', aliases: ['Gibbons Creek'], state: 'TX', lat: 30.51, lon: -96.10, maxDepth: 60, surfaceAcres: 2490, bassRating: 2 },
  { id: 'tx-canyon', name: 'Canyon Lake TX', aliases: ['Canyon Lake Texas'], state: 'TX', lat: 29.88, lon: -98.20, maxDepth: 125, surfaceAcres: 8240, bassRating: 2 },
  { id: 'tx-medina', name: 'Medina Lake', aliases: ['Medina'], state: 'TX', lat: 29.55, lon: -99.00, maxDepth: 145, surfaceAcres: 5575, bassRating: 2 },
  { id: 'tx-brownwood', name: 'Lake Brownwood', aliases: ['Brownwood'], state: 'TX', lat: 31.90, lon: -99.00, maxDepth: 54, surfaceAcres: 7300, bassRating: 2 },
  { id: 'tx-coleman', name: 'Lake Coleman', aliases: ['Coleman TX'], state: 'TX', lat: 31.82, lon: -99.40, maxDepth: 57, surfaceAcres: 1850, bassRating: 2 },
  { id: 'tx-inks', name: 'Inks Lake', aliases: ['Inks'], state: 'TX', lat: 30.73, lon: -98.38, maxDepth: 83, surfaceAcres: 803, bassRating: 2 },
  { id: 'tx-marble-falls', name: 'Lake Marble Falls', aliases: ['Marble Falls Lake', 'Marble Falls'], state: 'TX', lat: 30.55, lon: -98.25, maxDepth: 55, surfaceAcres: 780, bassRating: 2 },
  { id: 'tx-dunlap', name: 'Lake Dunlap', aliases: ['Dunlap'], state: 'TX', lat: 29.68, lon: -98.06, maxDepth: 35, surfaceAcres: 469, bassRating: 2 },
  { id: 'tx-mcqueeney', name: 'Lake McQueeney', aliases: ['McQueeney'], state: 'TX', lat: 29.60, lon: -98.05, maxDepth: 30, surfaceAcres: 372, bassRating: 2 },
  { id: 'tx-georgetown', name: 'Lake Georgetown', aliases: ['Georgetown TX'], state: 'TX', lat: 30.68, lon: -97.73, maxDepth: 70, surfaceAcres: 1310, bassRating: 2 },
  { id: 'tx-granger', name: 'Granger Lake', aliases: ['Granger'], state: 'TX', lat: 30.72, lon: -97.38, maxDepth: 51, surfaceAcres: 4080, bassRating: 2 },
  { id: 'tx-limestone', name: 'Lake Limestone', aliases: ['Limestone TX', 'Limestone Lake'], state: 'TX', lat: 31.42, lon: -96.38, maxDepth: 50, surfaceAcres: 13616, bassRating: 3 },
  { id: 'tx-navarro-mills', name: 'Navarro Mills Lake', aliases: ['Navarro Mills'], state: 'TX', lat: 31.97, lon: -96.70, maxDepth: 47, surfaceAcres: 5070, bassRating: 2 },
  { id: 'tx-tradinghouse-creek', name: 'Tradinghouse Creek Reservoir', aliases: ['Tradinghouse Creek', 'Tradinghouse'], state: 'TX', lat: 31.58, lon: -96.92, maxDepth: 40, surfaceAcres: 2010, bassRating: 2 },
  { id: 'tx-striker', name: 'Lake Striker', aliases: ['Striker'], state: 'TX', lat: 31.72, lon: -95.31, maxDepth: 60, surfaceAcres: 2400, bassRating: 3 },
  { id: 'tx-tyler', name: 'Lake Tyler', aliases: ['Tyler East', 'Lake Tyler TX'], state: 'TX', lat: 32.27, lon: -95.38, maxDepth: 55, surfaceAcres: 2550, bassRating: 2 },
  { id: 'tx-nacogdoches', name: 'Lake Nacogdoches', aliases: ['Nacogdoches'], state: 'TX', lat: 31.60, lon: -94.68, maxDepth: 60, surfaceAcres: 2294, bassRating: 2 },
  { id: 'tx-bastrop', name: 'Lake Bastrop', aliases: ['Bastrop'], state: 'TX', lat: 30.13, lon: -97.25, maxDepth: 30, surfaceAcres: 906, bassRating: 2 },
  { id: 'tx-palo-pinto', name: 'Palo Pinto Lake', aliases: ['Palo Pinto'], state: 'TX', lat: 32.80, lon: -98.28, maxDepth: 55, surfaceAcres: 2400, bassRating: 2 },
  { id: 'tx-twin-buttes', name: 'Twin Buttes Reservoir', aliases: ['Twin Buttes'], state: 'TX', lat: 31.38, lon: -100.62, maxDepth: 65, surfaceAcres: 9400, bassRating: 2 },
  { id: 'tx-colorado-city', name: 'Lake Colorado City', aliases: ['Colorado City TX'], state: 'TX', lat: 32.38, lon: -100.88, maxDepth: 55, surfaceAcres: 1612, bassRating: 2 },
  { id: 'tx-abilene', name: 'Lake Abilene', aliases: ['Abilene'], state: 'TX', lat: 32.28, lon: -99.72, maxDepth: 40, surfaceAcres: 595, bassRating: 2 },
  { id: 'tx-hubbard-creek', name: 'Hubbard Creek Reservoir', aliases: ['Hubbard Creek', 'Lake Leon'], state: 'TX', lat: 32.78, lon: -99.13, maxDepth: 65, surfaceAcres: 15250, bassRating: 2 },
  { id: 'tx-buffalo-springs', name: 'Buffalo Springs Lake', aliases: ['Buffalo Springs'], state: 'TX', lat: 33.53, lon: -101.73, maxDepth: 37, surfaceAcres: 225, bassRating: 2 },
  { id: 'tx-white-river', name: 'White River Reservoir', aliases: ['White River TX'], state: 'TX', lat: 33.55, lon: -101.00, maxDepth: 60, surfaceAcres: 1680, bassRating: 2 },
  { id: 'tx-diversion', name: 'Lake Diversion', aliases: ['Diversion TX'], state: 'TX', lat: 33.90, lon: -99.30, maxDepth: 40, surfaceAcres: 3200, bassRating: 2 },
  { id: 'tx-kickapoo', name: 'Lake Kickapoo', aliases: ['Kickapoo'], state: 'TX', lat: 33.62, lon: -99.10, maxDepth: 55, surfaceAcres: 6200, bassRating: 2 },
  { id: 'tx-arrowhead', name: 'Lake Arrowhead TX', aliases: ['Arrowhead TX'], state: 'TX', lat: 33.77, lon: -98.48, maxDepth: 55, surfaceAcres: 16200, bassRating: 2 },
  { id: 'tx-nocona', name: 'Lake Nocona', aliases: ['Nocona'], state: 'TX', lat: 33.90, lon: -97.77, maxDepth: 35, surfaceAcres: 1540, bassRating: 2 },

  // ─── Utah ───
  { id: '1431462', name: 'Lake Powell', aliases: ['Powell'], state: 'UT', lat: 37.17, lon: -110.81, maxDepth: 560, surfaceAcres: 161390, bassRating: 3 },
  { id: 'ut-deer-creek', name: 'Deer Creek Reservoir', aliases: ['Deer Creek'], state: 'UT', lat: 40.42, lon: -111.51, maxDepth: 132, surfaceAcres: 2965, bassRating: 2 },
  { id: 'ut-jordanelle', name: 'Jordanelle Reservoir', aliases: ['Jordanelle'], state: 'UT', lat: 40.60, lon: -111.42, maxDepth: 292, surfaceAcres: 3320, bassRating: 2 },
  { id: 'ut-sand-hollow', name: 'Sand Hollow Reservoir', aliases: ['Sand Hollow'], state: 'UT', lat: 37.14, lon: -113.43, maxDepth: 100, surfaceAcres: 1320, bassRating: 3 },
  { id: 'ut-starvation', name: 'Starvation Reservoir', aliases: ['Starvation'], state: 'UT', lat: 40.18, lon: -110.43, maxDepth: 130, surfaceAcres: 3490, bassRating: 2 },
  { id: 'ut-willard-bay', name: 'Willard Bay Reservoir', aliases: ['Willard Bay'], state: 'UT', lat: 41.39, lon: -112.10, maxDepth: 15, surfaceAcres: 9900, bassRating: 2 },
  { id: 'ut-flaming-gorge', name: 'Flaming Gorge UT', aliases: ['Flaming Gorge Utah'], state: 'UT', lat: 40.92, lon: -109.42, maxDepth: 436, surfaceAcres: 42020, bassRating: 2 },

  // ─── Vermont ───
  { id: '946367', name: 'Lake Champlain', aliases: ['Champlain'], state: 'VT', lat: 44.59, lon: -73.31, maxDepth: 400, surfaceAcres: 271000, bassRating: 4 },

  // ─── Virginia ───
  { id: '1501629', name: 'Kerr Lake', aliases: ['Kerr', 'Buggs Island', 'John H. Kerr Reservoir'], state: 'VA', lat: 36.60, lon: -78.30, maxDepth: 101, surfaceAcres: 48900, bassRating: 3 },
  { id: '1502131', name: 'Smith Mountain Lake', aliases: ['Smith Mountain'], state: 'VA', lat: 37.06, lon: -79.77, maxDepth: 250, surfaceAcres: 20600, bassRating: 3 },
  { id: 'va-james-river', name: 'James River', aliases: ['James River'], state: 'VA', lat: 37.54, lon: -78.80, maxDepth: 30, surfaceAcres: 8000, bassRating: 3 },
  { id: 'va-new-river', name: 'Claytor Lake', aliases: ['Claytor', 'New River VA'], state: 'VA', lat: 37.07, lon: -80.66, maxDepth: 115, surfaceAcres: 4475, bassRating: 2 },
  { id: 'va-anna', name: 'Lake Anna', aliases: ['Anna'], state: 'VA', lat: 38.05, lon: -77.85, maxDepth: 75, surfaceAcres: 9600, bassRating: 2 },
  { id: 'va-gaston', name: 'Lake Gaston VA', aliases: ['Gaston VA'], state: 'VA', lat: 36.52, lon: -78.14, maxDepth: 90, surfaceAcres: 20300, bassRating: 3 },
  { id: 'va-philpott', name: 'Philpott Lake', aliases: ['Philpott'], state: 'VA', lat: 36.80, lon: -80.03, maxDepth: 175, surfaceAcres: 2880, bassRating: 2 },
  { id: 'va-moomaw', name: 'Lake Moomaw', aliases: ['Moomaw', 'Gathright Reservoir'], state: 'VA', lat: 37.97, lon: -79.82, maxDepth: 195, surfaceAcres: 2530, bassRating: 2 },
  { id: 'va-south-holston', name: 'South Holston Lake VA', aliases: ['South Holston VA'], state: 'VA', lat: 36.57, lon: -82.00, maxDepth: 185, surfaceAcres: 7580, bassRating: 2 },
  { id: 'va-leesville', name: 'Leesville Lake', aliases: ['Leesville'], state: 'VA', lat: 37.15, lon: -79.70, maxDepth: 100, surfaceAcres: 3214, bassRating: 2 },
  { id: 'va-buggs-island', name: 'Buggs Island Lake', aliases: ['Buggs Island'], state: 'VA', lat: 36.60, lon: -78.30, maxDepth: 101, surfaceAcres: 48900, bassRating: 3 },
  { id: 'va-hungry-mother', name: 'Hungry Mother Lake', aliases: ['Hungry Mother'], state: 'VA', lat: 36.87, lon: -81.52, maxDepth: 40, surfaceAcres: 108, bassRating: 2 },

  // ─── Washington ───
  { id: 'wa-potholes', name: 'Potholes Reservoir', aliases: ['Potholes', 'O\'Sullivan'], state: 'WA', lat: 46.98, lon: -119.34, maxDepth: 50, surfaceAcres: 27000, bassRating: 3 },
  { id: 'wa-banks', name: 'Banks Lake', aliases: ['Banks'], state: 'WA', lat: 47.73, lon: -119.07, maxDepth: 125, surfaceAcres: 27000, bassRating: 2 },
  { id: 'wa-columbia-basin', name: 'Moses Lake', aliases: ['Moses'], state: 'WA', lat: 47.08, lon: -119.33, maxDepth: 35, surfaceAcres: 6800, bassRating: 2 },
  { id: 'wa-roosevelt', name: 'Lake Roosevelt', aliases: ['Roosevelt WA'], state: 'WA', lat: 47.94, lon: -118.98, maxDepth: 470, surfaceAcres: 80865, bassRating: 2 },
  { id: 'wa-chelan', name: 'Lake Chelan', aliases: ['Chelan'], state: 'WA', lat: 47.85, lon: -120.18, maxDepth: 1486, surfaceAcres: 33710, bassRating: 2 },
  { id: 'wa-sprague', name: 'Sprague Lake', aliases: ['Sprague WA'], state: 'WA', lat: 47.31, lon: -118.03, maxDepth: 25, surfaceAcres: 3748, bassRating: 2 },
  { id: 'wa-curlew', name: 'Curlew Lake', aliases: ['Curlew'], state: 'WA', lat: 48.72, lon: -118.67, maxDepth: 65, surfaceAcres: 874, bassRating: 2 },
  { id: 'wa-long', name: 'Long Lake WA', aliases: ['Long Lake Washington', 'Spokane River Long Lake'], state: 'WA', lat: 47.87, lon: -117.65, maxDepth: 100, surfaceAcres: 4500, bassRating: 2 },
  { id: 'wa-riffe', name: 'Riffe Lake', aliases: ['Riffe', 'Riffe Reservoir'], state: 'WA', lat: 46.65, lon: -122.23, maxDepth: 290, surfaceAcres: 23460, bassRating: 2 },

  // ─── Wisconsin ───
  { id: 'wi-petenwell', name: 'Lake Petenwell', aliases: ['Petenwell'], state: 'WI', lat: 44.04, lon: -89.88, maxDepth: 40, surfaceAcres: 23040, bassRating: 2 },
  { id: 'wi-winnebago', name: 'Lake Winnebago', aliases: ['Winnebago'], state: 'WI', lat: 43.98, lon: -88.43, maxDepth: 21, surfaceAcres: 131939, bassRating: 3 },
  { id: 'wi-chippewa', name: 'Chippewa Flowage', aliases: ['Chippewa', 'Chippewa Flowage'], state: 'WI', lat: 46.02, lon: -91.09, maxDepth: 67, surfaceAcres: 15300, bassRating: 2 },
  { id: 'wi-mendota', name: 'Lake Mendota', aliases: ['Mendota'], state: 'WI', lat: 43.10, lon: -89.42, maxDepth: 83, surfaceAcres: 9740, bassRating: 2 },
  { id: 'wi-castle-rock', name: 'Castle Rock Lake', aliases: ['Castle Rock'], state: 'WI', lat: 43.86, lon: -89.90, maxDepth: 30, surfaceAcres: 13955, bassRating: 2 },
  { id: 'wi-green', name: 'Green Lake', aliases: ['Green WI'], state: 'WI', lat: 43.82, lon: -88.96, maxDepth: 236, surfaceAcres: 7346, bassRating: 2 },
  { id: 'wi-wissota', name: 'Lake Wissota', aliases: ['Wissota'], state: 'WI', lat: 44.93, lon: -91.29, maxDepth: 74, surfaceAcres: 6300, bassRating: 2 },
  { id: 'wi-lac-courte-oreilles', name: 'Lac Courte Oreilles', aliases: ['Courte Oreilles', 'LCO'], state: 'WI', lat: 45.92, lon: -91.14, maxDepth: 100, surfaceAcres: 5019, bassRating: 2 },
  { id: 'wi-du-bay', name: 'Lake Du Bay', aliases: ['Du Bay', 'Lake DuBay'], state: 'WI', lat: 44.63, lon: -89.62, maxDepth: 22, surfaceAcres: 6800, bassRating: 2 },
  { id: 'wi-yellow', name: 'Yellow Lake WI', aliases: ['Yellow Lake Wisconsin'], state: 'WI', lat: 45.75, lon: -92.02, maxDepth: 45, surfaceAcres: 2218, bassRating: 2 },
  { id: 'wi-namekagon', name: 'Namekagon Lake', aliases: ['Namekagon'], state: 'WI', lat: 46.17, lon: -91.32, maxDepth: 82, surfaceAcres: 3291, bassRating: 2 },
  { id: 'wi-nagawicka', name: 'Nagawicka Lake', aliases: ['Nagawicka'], state: 'WI', lat: 43.07, lon: -88.38, maxDepth: 72, surfaceAcres: 1003, bassRating: 2 },
  { id: 'wi-okauchee', name: 'Okauchee Lake', aliases: ['Okauchee'], state: 'WI', lat: 43.10, lon: -88.35, maxDepth: 56, surfaceAcres: 1209, bassRating: 2 },

  // ─── Wyoming ───
  { id: '1441113', name: 'Flaming Gorge Reservoir', aliases: ['Flaming Gorge'], state: 'WY', lat: 41.10, lon: -109.55, maxDepth: 436, surfaceAcres: 42020, bassRating: 2 },
  { id: 'wy-boysen', name: 'Boysen Reservoir', aliases: ['Boysen'], state: 'WY', lat: 43.44, lon: -108.17, maxDepth: 100, surfaceAcres: 19600, bassRating: 2 },
  { id: 'wy-glendo', name: 'Glendo Reservoir', aliases: ['Glendo'], state: 'WY', lat: 42.50, lon: -105.00, maxDepth: 100, surfaceAcres: 12500, bassRating: 2 },
  { id: 'wy-seminoe', name: 'Seminoe Reservoir', aliases: ['Seminoe'], state: 'WY', lat: 42.17, lon: -106.90, maxDepth: 240, surfaceAcres: 20800, bassRating: 2 },

  // ─── West Virginia ───
  { id: 'wv-summersville', name: 'Summersville Lake', aliases: ['Summersville'], state: 'WV', lat: 38.25, lon: -80.85, maxDepth: 315, surfaceAcres: 2790, bassRating: 2 },
  { id: 'wv-burnsville', name: 'Burnsville Lake', aliases: ['Burnsville'], state: 'WV', lat: 38.85, lon: -80.65, maxDepth: 85, surfaceAcres: 968, bassRating: 2 },
  { id: 'wv-beech-fork', name: 'Beech Fork Lake', aliases: ['Beech Fork'], state: 'WV', lat: 38.10, lon: -82.28, maxDepth: 75, surfaceAcres: 720, bassRating: 2 },
  { id: 'wv-east-lynn', name: 'East Lynn Lake', aliases: ['East Lynn'], state: 'WV', lat: 38.00, lon: -82.38, maxDepth: 90, surfaceAcres: 1005, bassRating: 2 },
  { id: 'wv-sutton', name: 'Sutton Lake', aliases: ['Sutton'], state: 'WV', lat: 38.60, lon: -80.68, maxDepth: 75, surfaceAcres: 1440, bassRating: 2 },
];

export default BASS_LAKES;

// ─── Indexes ───

const byId = new Map<string, Lake>();
const aliasIndex = new Map<string, Lake>();

for (const lake of BASS_LAKES) {
  byId.set(lake.id, lake);
  aliasIndex.set(lake.name.toLowerCase(), lake);
  for (const alias of lake.aliases) {
    aliasIndex.set(alias.toLowerCase(), lake);
  }
}

// Legacy exports for any remaining consumers
export const bassLakeById = byId;
export const bassLakeAliasIndex = aliasIndex;

// ─── Public API ───

export function getLakeById(id: string): Lake | undefined {
  return byId.get(id);
}

export function nearestLake(lat: number, lon: number): Lake | null {
  let best: Lake | null = null;
  let bestDistSq = Infinity;
  const cosLat = Math.cos(lat * Math.PI / 180);
  for (const lake of BASS_LAKES) {
    const dLat = lake.lat - lat;
    const dLon = (lake.lon - lon) * cosLat;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = lake;
    }
  }
  return best;
}

export function searchLakes(query: string, userLat?: number, userLon?: number, limit = 20): Lake[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const queryWords = q.split(/\s+/);
  const scored: { lake: Lake; score: number }[] = [];

  // Check for 2-letter state filter
  const stateMatch = q.match(/\b([A-Za-z]{2})\b/);
  const stateFilter = stateMatch && stateMatch[1].length === 2 ? stateMatch[1].toUpperCase() : null;

  // Check alias exact match
  const aliasExact = aliasIndex.get(q);

  for (const lake of BASS_LAKES) {
    const name = lake.name.toLowerCase();
    let score = 0;

    // Alias exact match
    if (aliasExact && lake === aliasExact) {
      score = 1500;
    }
    // Alias starts-with
    else {
      for (const alias of lake.aliases) {
        const al = alias.toLowerCase();
        if (al.startsWith(q) || q.startsWith(al)) {
          score = Math.max(score, 1200);
          break;
        }
      }
    }

    if (score === 0) {
      if (name === q) {
        score = 1000;
      } else if (name.startsWith(q)) {
        score = 500;
      } else if (queryWords.every(w => name.includes(w))) {
        score = 200;
      } else if (name.startsWith(queryWords[0])) {
        score = 100;
      } else if (queryWords.some(w => name.includes(w) || lake.aliases.some(a => a.toLowerCase().includes(w)))) {
        score = 50;
      }
    }

    if (score === 0) continue;

    // State match bonus
    if (stateFilter && lake.state === stateFilter) score += 25;

    // Bass rating bonus
    score += lake.bassRating * 50;

    // GPS proximity bonus
    if (userLat != null && userLon != null) {
      const cosLat = Math.cos(userLat * Math.PI / 180);
      const dLat = lake.lat - userLat;
      const dLon = (lake.lon - userLon) * cosLat;
      const distMiles = Math.sqrt(dLat * dLat + dLon * dLon) * 69;
      score += Math.max(0, 200 - (distMiles / 5));
    }

    scored.push({ lake, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.lake);
}
