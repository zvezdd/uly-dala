// Mock air quality station data for Almaty
// AQI scale: 0-50 Good | 51-100 Moderate | 101-150 Unhealthy (Sensitive) | 151-200 Unhealthy | 201-300 Very Unhealthy | 301+ Hazardous

const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const now = Date.now();

function station(id, name, lng, lat, aqi, pm25, pm10, no2, o3, co, so2, temp, humidity, windSpeed, windDir, dominant) {
  return {
    id: `aq-${String(id).padStart(3, '0')}`,
    name,
    coordinates: [lng, lat],
    aqi,
    dominantPollutant: dominant,
    pm25,
    pm10,
    no2,
    o3,
    co,
    so2,
    temperature: temp,
    humidity,
    windSpeed,
    windDirection: windDir,
    updatedAt: new Date(now - Math.floor(Math.random() * 3_600_000)).toISOString(),
  };
}

export const mockAirQualityStations = [
  //  MEDEU DISTRICT
  station(1,  'Medeu Station',              76.935, 43.180, 18,  6.1,  11.2,  8.5,  52.1,  0.3,  2.1,  12, 58, 14, 'NW',  'PM2.5'),
  station(2,  'Shymbulak Base',             76.978, 43.158,  9,  2.8,   5.4,  4.2,  61.3,  0.2,  0.8,   8, 65, 20, 'W',   'O3'),
  station(3,  'Kok-Tobe Summit',            76.969, 43.232, 22,  7.5,  14.1,  9.8,  49.2,  0.3,  2.4,  14, 52, 18, 'NW',  'PM2.5'),
  station(4,  'Medeu Reservoir',            76.950, 43.200, 15,  5.2,   9.6,  7.1,  54.8,  0.2,  1.8,  10, 61, 16, 'NW',  'O3'),
  station(5,  'Alatau Foothills',           76.910, 43.205, 27, 10.1,  18.3, 12.4,  46.5,  0.4,  3.2,  13, 55, 12, 'N',   'PM2.5'),
  station(6,  'Gorny Giant Resort',         76.986, 43.175, 12,  3.9,   7.2,  5.3,  58.7,  0.2,  1.2,   9, 63, 22, 'W',   'O3'),

  // BOSTANDYK DISTRICT 
  station(7,  'Bostandyk Park',             76.855, 43.238, 34, 12.8,  23.1, 16.5,  44.3,  0.5,  4.1,  16, 48, 10, 'NE',  'PM2.5'),
  station(8,  'Al-Farabi / Navoi Crossing', 76.862, 43.260, 48, 18.4,  33.5, 22.1,  41.2,  0.7,  5.8,  17, 46,  9, 'E',   'PM2.5'),
  station(9,  'Samal District',             76.875, 43.250, 41, 15.6,  28.4, 19.3,  43.1,  0.6,  5.0,  17, 47, 11, 'NE',  'PM2.5'),
  station(10, 'Alatau Ave W',               76.830, 43.248, 39, 14.8,  27.0, 18.2,  43.8,  0.6,  4.7,  16, 49, 10, 'E',   'PM2.5'),
  station(11, 'Dostyk Mall Area',           76.928, 43.240, 55, 21.2,  38.5, 26.4,  39.5,  0.8,  7.1,  18, 44,  8, 'NE',  'PM2.5'),
  station(12, 'Esentai Park',               76.950, 43.237, 62, 24.5,  44.3, 29.8,  37.1,  0.9,  8.3,  19, 43,  7, 'E',   'PM2.5'),

  // ALMALY DISTRICT
  station(13, 'Almaty Central Park',        76.922, 43.260, 78, 30.2,  55.6, 38.4,  33.5,  1.1, 10.2,  20, 42,  7, 'SE',  'PM2.5'),
  station(14, 'Panfilov Park',              76.935, 43.262, 83, 32.6,  59.1, 41.2,  32.0,  1.2, 11.0,  21, 41,  6, 'SE',  'PM2.5'),
  station(15, 'Abay / Seifullin Int.',      76.893, 43.265, 95, 37.4,  68.0, 46.8,  29.4,  1.3, 12.8,  21, 40,  6, 'E',   'PM2.5'),
  station(16, 'Green Market Area',          76.900, 43.258, 88, 34.8,  62.9, 43.6,  31.2,  1.2, 11.8,  20, 41,  7, 'SE',  'PM2.5'),
  station(17, 'Republic Square',            76.938, 43.254, 72, 27.9,  50.7, 35.5,  35.3,  1.1,  9.5,  20, 43,  8, 'E',   'PM2.5'),
  station(18, 'Opera House',                76.930, 43.270, 69, 26.6,  48.4, 33.9,  36.1,  1.0,  9.1,  19, 44,  8, 'NE',  'NO2'),
  station(19, 'Alatau Ave Central',         76.878, 43.270, 74, 28.8,  52.5, 36.9,  34.4,  1.1,  9.9,  20, 43,  7, 'SE',  'PM2.5'),
  station(20, 'Gogol St Station',           76.910, 43.248, 91, 35.8,  65.1, 45.0,  30.3,  1.3, 12.3,  21, 40,  6, 'E',   'PM2.5'),
  station(21, 'Raiymbek / Furmanova',       76.941, 43.251, 98, 38.7,  70.3, 48.5,  28.6,  1.4, 13.5,  21, 39,  6, 'SE',  'PM2.5'),

  //  ALATAU DISTRICT
  station(22, 'Alatau District Center',     76.850, 43.225, 45, 17.2,  31.2, 21.3,  42.1,  0.7,  5.9,  17, 46,  9, 'NW',  'PM2.5'),
  station(23, 'Micro-district 3',           76.830, 43.232, 52, 19.8,  36.1, 24.7,  40.5,  0.8,  6.8,  18, 45,  9, 'NW',  'PM2.5'),
  station(24, 'Alatau Bazaar',              76.862, 43.242, 60, 23.1,  42.0, 28.8,  38.2,  0.9,  8.0,  18, 44,  8, 'N',   'PM2.5'),
  station(25, 'Taugul District',            76.880, 43.228, 43, 16.4,  29.8, 20.4,  42.8,  0.7,  5.6,  17, 47,  9, 'NW',  'PM2.5'),
  station(26, 'Al-Farabi W Station',        76.800, 43.235, 38, 14.3,  26.1, 17.8,  44.2,  0.6,  4.9,  17, 48, 11, 'W',   'PM2.5'),

  // ZHETYSU DISTRICT 
  station(27, 'Zhetysu District Center',    77.010, 43.285, 82, 32.1,  58.5, 40.5,  32.3,  1.2, 10.9,  20, 42,  7, 'S',   'PM2.5'),
  station(28, 'Altai Micro-district',       77.025, 43.272, 76, 29.6,  53.8, 37.4,  33.8,  1.1, 10.1,  20, 43,  8, 'SW',  'PM2.5'),
  station(29, 'Shugyla Market',             77.038, 43.260, 68, 26.2,  47.7, 33.2,  36.4,  1.0,  9.0,  19, 44,  8, 'S',   'PM2.5'),
  station(30, 'Keremet St Station',         77.020, 43.255, 74, 28.7,  52.3, 36.7,  34.6,  1.1,  9.9,  20, 43,  8, 'SW',  'PM2.5'),
  station(31, 'Bakad E Crossing',           77.050, 43.242, 59, 22.7,  41.4, 28.4,  38.5,  0.9,  7.8,  18, 45,  9, 'S',   'PM2.5'),
  station(32, 'Sairan Lake Area',           76.998, 43.274, 65, 25.0,  45.5, 31.8,  37.1,  1.0,  8.6,  19, 44,  9, 'SW',  'PM2.5'),
  station(33, 'Orbita Micro-district',      76.985, 43.288, 70, 27.1,  49.3, 34.4,  35.8,  1.0,  9.3,  19, 43,  8, 'S',   'PM2.5'),

  //  NAURYZBAI DISTRICT 
  station(34, 'Nauryzbai Center',           76.868, 43.308, 104, 41.3, 75.1, 52.0,  27.2,  1.5, 14.8,  22, 38,  5, 'S',   'PM2.5'),
  station(35, 'Spartak Stadium Area',       76.897, 43.315,  96, 38.0, 69.1, 47.8,  29.1,  1.4, 13.1,  21, 39,  6, 'SE',  'PM2.5'),
  station(36, 'Micro-district Orbita 4',    76.853, 43.296,  88, 34.6, 63.0, 43.5,  31.3,  1.2, 11.8,  21, 40,  7, 'S',   'PM2.5'),
  station(37, 'Baganashyl Suburb',          76.837, 43.320,  78, 30.5, 55.5, 38.5,  33.3,  1.1, 10.4,  20, 41,  8, 'S',   'PM2.5'),
  station(38, 'Ryskulov / Seifullin',       76.895, 43.322, 112, 44.2, 80.5, 55.7,  25.5,  1.6, 16.0,  22, 37,  5, 'SE',  'PM2.5'),
  station(39, 'Aksai Micro-district',       76.820, 43.296,  93, 36.7, 66.7, 46.2,  30.0,  1.3, 12.6,  21, 40,  6, 'SW',  'PM2.5'),
  station(40, 'Dzerzhinsky Ave N',          76.912, 43.303,  85, 33.4, 60.7, 42.0,  31.8,  1.2, 11.4,  20, 41,  7, 'SE',  'PM2.5'),

  // TURKSIB DISTRICT 
  station(41, 'Turksib Plant Gate',         77.068, 43.298, 185, 73.4,133.5, 88.2,  16.4,  2.8, 35.2,  23, 35,  4, 'SW',  'PM2.5'),
  station(42, 'Railway Workshop',           77.082, 43.285, 162, 63.8,116.3, 77.5,  19.1,  2.5, 29.8,  23, 36,  4, 'SW',  'PM10'),
  station(43, 'Turksib Market',             77.058, 43.310, 148, 57.9,105.5, 71.2,  21.8,  2.2, 26.4,  22, 37,  5, 'W',   'PM2.5'),
  station(44, 'Industrial Zone North',      77.090, 43.320, 215, 86.2,156.8,104.0,  13.2,  3.2, 45.5,  24, 33,  3, 'SW',  'PM2.5'),
  station(45, 'Freight Terminal',           77.075, 43.330, 198, 78.8,143.5, 95.4,  15.0,  2.9, 39.0,  24, 34,  3, 'SW',  'PM10'),
  station(46, 'Alatau Industrial',          77.048, 43.298, 137, 53.4, 97.1, 65.3,  24.1,  2.0, 23.1,  22, 38,  5, 'W',   'PM2.5'),
  station(47, 'Suyunbay / Turksib',         77.000, 43.310, 122, 47.5, 86.4, 58.1,  26.8,  1.8, 20.1,  22, 38,  6, 'SW',  'PM2.5'),
  station(48, 'Eastern Logistics Hub',      77.102, 43.268, 143, 55.8,101.5, 68.2,  22.5,  2.1, 24.4,  23, 36,  4, 'W',   'PM2.5'),

  //  NEAR AL-FARABI HIGHWAY 
  station(49, 'Al-Farabi / Dostyk',         76.952, 43.233, 108, 42.8, 77.8, 53.8,  26.8,  1.6, 15.3,  22, 38,  5, 'SE',  'NO2'),
  station(50, 'Al-Farabi / Seifullin',      76.893, 43.233, 115, 45.4, 82.5, 57.1,  25.3,  1.7, 16.8,  22, 37,  5, 'SE',  'NO2'),
  station(51, 'Al-Farabi / Kabanbay',       76.921, 43.232, 120, 47.2, 85.9, 59.5,  24.4,  1.8, 17.9,  23, 37,  5, 'SE',  'NO2'),
  station(52, 'Al-Farabi / Furmanova',      76.941, 43.232, 102, 40.3, 73.3, 50.6,  28.0,  1.5, 14.4,  22, 39,  6, 'SE',  'PM2.5'),
  station(53, 'Al-Farabi / Nazarbayev',     76.977, 43.230, 97,  38.2, 69.5, 48.0,  29.0,  1.4, 13.2,  21, 40,  7, 'S',   'PM2.5'),

  // CITY CENTER EXTRA STATIONS
  station(54, 'Abay / Dostyk',              76.952, 43.264, 86,  33.8, 61.5, 42.6,  31.6,  1.2, 11.6,  21, 41,  7, 'E',   'PM2.5'),
  station(55, 'Seifullin / Raiymbek',       76.893, 43.252, 118, 46.5, 84.5, 58.5,  24.8,  1.7, 17.3,  22, 37,  5, 'SE',  'PM2.5'),
  station(56, 'Almaty-1 Train Station',     76.908, 43.257, 103, 40.7, 74.1, 51.2,  27.8,  1.5, 14.6,  22, 39,  6, 'E',   'NO2'),
  station(57, 'Almaty-2 Train Station',     76.932, 43.254, 95,  37.5, 68.2, 47.0,  29.5,  1.4, 13.0,  21, 40,  7, 'SE',  'PM2.5'),
  station(58, 'Mega Center Alma',           76.848, 43.268, 58,  22.3, 40.5, 27.9,  38.8,  0.9,  7.6,  19, 45,  9, 'NE',  'PM2.5'),
  station(59, 'Big Almaty Canal Park',      76.962, 43.298, 67,  25.8, 47.0, 32.7,  36.6,  1.0,  8.9,  19, 44,  8, 'SW',  'PM2.5'),
  station(60, 'Botanical Garden',           77.008, 43.261, 54,  20.7, 37.6, 25.9,  39.9,  0.8,  7.2,  19, 45,  9, 'SW',  'PM2.5'),

  // ADDITIONAL SUBURBAN STATIONS 
  station(61, 'Bakad W Interchange',        76.808, 43.255, 44,  16.8, 30.5, 20.9,  42.4,  0.7,  5.7,  17, 48, 10, 'NW',  'PM2.5'),
  station(62, 'Atyrau Micro-district',      76.830, 43.308, 72,  27.7, 50.5, 35.1,  35.5,  1.1,  9.6,  20, 43,  8, 'S',   'PM2.5'),
  station(63, 'Sarybulak Village',          76.808, 43.268, 36,  13.6, 24.7, 16.9,  44.5,  0.6,  4.7,  17, 49, 11, 'W',   'PM2.5'),
  station(64, 'Karasai Bazaar',             77.058, 43.244, 64,  24.6, 44.8, 31.1,  37.4,  1.0,  8.5,  19, 44,  9, 'SW',  'PM2.5'),
  station(65, 'Taldykorgan Hwy Start',      77.100, 43.248, 128, 50.0, 91.0, 61.2,  24.3,  1.9, 21.8,  23, 36,  4, 'SW',  'PM2.5'),
  station(66, 'Kapchagay Hwy Start',        77.088, 43.305, 155, 60.9,110.8, 74.5,  20.5,  2.3, 27.9,  23, 35,  4, 'SW',  'PM10'),
  station(67, 'Almaty Airport Area',        76.928, 43.352, 132, 51.8, 94.1, 63.3,  23.5,  1.9, 22.8,  22, 37,  7, 'S',   'PM2.5'),
  station(68, 'Micro-district Altynkazyk',  76.805, 43.285, 61,  23.5, 42.8, 29.6,  37.8,  0.9,  8.1,  19, 45,  9, 'W',   'PM2.5'),
  station(69, 'Koktobe Viewpoint',          76.969, 43.235, 28,  10.4, 18.9, 13.1,  47.2,  0.4,  3.5,  14, 54, 17, 'NW',  'O3'),
  station(70, 'Ile-Alatau NP Gate',         77.002, 43.195, 16,   5.5, 10.1,  7.4,  55.3,  0.2,  1.9,  11, 60, 19, 'NW',  'O3'),
  station(71, 'Burunday Settlement',        76.855, 43.340, 90,  35.4, 64.4, 44.5,  30.8,  1.3, 12.1,  21, 40,  6, 'S',   'PM2.5'),
  station(72, 'Nurly Tau Business Center',  76.948, 43.228, 75,  29.1, 53.1, 37.0,  34.3,  1.1,  9.9,  20, 43,  8, 'SE',  'PM2.5'),
  station(73, 'Shanyrak District',          76.800, 43.320, 118, 46.5, 84.5, 58.5,  25.0,  1.7, 17.5,  22, 37,  5, 'SE',  'PM2.5'),
  station(74, 'Atakent Expo Center',        76.875, 43.278, 63,  24.2, 44.1, 30.5,  37.2,  0.9,  8.4,  19, 44,  9, 'NE',  'PM2.5'),
  station(75, 'Meyram Hospital Area',       76.960, 43.278, 80,  31.2, 56.8, 39.2,  32.8,  1.1, 10.6,  20, 42,  8, 'SE',  'PM2.5'),
];
