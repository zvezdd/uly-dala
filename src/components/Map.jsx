import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_CONFIG } from '../config/mapConfig.js';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const TRAFFIC_ROAD_CLASSES = [
  'motorway', 'motorway_link',
  'trunk', 'trunk_link',
  'primary', 'primary_link',
  'secondary', 'secondary_link',
  'street', 'street_limited',
];

const HASH4_EXPR = [
  '%',
  ['abs', ['floor', ['*', ['sin', ['to-number', ['get', 'len'], 17]], 43758.5453]]],
  4,
];

const TRAFFIC_COLOR_EXPR = [
  'let', 'h', HASH4_EXPR,
  [
    'case',
    ['==', ['var', 'h'], 0], '#22c55e',
    ['==', ['var', 'h'], 1], '#facc15',
    ['==', ['var', 'h'], 2], '#f97316',
    '#ef4444',
  ],
];

const ROAD_FILTER = [
  'in', ['get', 'class'],
  ['literal', TRAFFIC_ROAD_CLASSES],
];

function buildAQGeojson(stations) {
  return {
    type: 'FeatureCollection',
    features: stations
      .filter((s) => s.coordinates && !isNaN(s.aqi))
      .map((s) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: s.coordinates },
        properties: {
          id:                s.id,
          name:              s.name,
          aqi:               s.aqi,
          dominantPollutant: s.dominantPollutant,
          pm25:              s.pm25,
          pm10:              s.pm10,
          no2:               s.no2,
          o3:                s.o3,
          co:                s.co,
          so2:               s.so2,
          temperature:       s.temperature,
          humidity:          s.humidity,
          windSpeed:         s.windSpeed,
          windDirection:     s.windDirection,
          updatedAt:         s.updatedAt,
        },
      })),
  };
}

function roadFeatureToTrafficData(feature, lngLat) {
  const props     = feature.properties ?? {};
  const roadClass = props.class ?? 'street';
  const roadName  = props.name ?? props.ref ?? formatRoadClass(roadClass);
  const len = typeof feature.properties?.len === 'number' ? feature.properties.len : 17;
  const mod = Math.abs(Math.floor(Math.sin(len) * 43758.5453)) % 4;

  let level, currentSpeed, freeFlowSpeed;

  if (['motorway', 'motorway_link', 'trunk', 'trunk_link'].includes(roadClass)) {
    freeFlowSpeed = 90;
    if (mod === 0) { level = 1; currentSpeed = 82; }
    else if (mod === 1) { level = 2; currentSpeed = 55; }
    else if (mod === 2) { level = 3; currentSpeed = 28; }
    else                { level = 4; currentSpeed = 6;  }
  } else if (['primary', 'primary_link'].includes(roadClass)) {
    freeFlowSpeed = 70;
    if (mod === 0) { level = 1; currentSpeed = 64; }
    else if (mod === 1) { level = 2; currentSpeed = 42; }
    else if (mod === 2) { level = 3; currentSpeed = 22; }
    else                { level = 4; currentSpeed = 4;  }
  } else if (['secondary', 'secondary_link'].includes(roadClass)) {
    freeFlowSpeed = 60;
    if (mod === 0) { level = 1; currentSpeed = 55; }
    else if (mod === 1) { level = 2; currentSpeed = 36; }
    else if (mod === 2) { level = 3; currentSpeed = 18; }
    else                { level = 4; currentSpeed = 3;  }
  } else {
    freeFlowSpeed = 50;
    if (mod === 0) { level = 1; currentSpeed = 46; }
    else if (mod === 1) { level = 2; currentSpeed = 30; }
    else if (mod === 2) { level = 3; currentSpeed = 15; }
    else                { level = 4; currentSpeed = 2;  }
  }

  const congestionPct = Math.round((1 - currentSpeed / freeFlowSpeed) * 100);
  const levelLabel    = { 1: 'Free Flow', 2: 'Slow', 3: 'Congested', 4: 'Standstill' }[level];

  return {
    type: 'traffic-line',
    data: { roadName, level, levelLabel, currentSpeed, freeFlowSpeed, congestionPct },
    coordinates: lngLat,
  };
}

function formatRoadClass(cls) {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Map({ layers, airStations, onFeatureClick }) {
  const containerRef   = useRef(null);
  const mapRef         = useRef(null);
  const mapLoadedRef   = useRef(false);
  const airStationsRef = useRef(airStations);
  const onClickRef     = useRef(onFeatureClick);
  const layersRef      = useRef(layers);

  useEffect(() => { airStationsRef.current = airStations;    }, [airStations]);
  useEffect(() => { onClickRef.current     = onFeatureClick; }, [onFeatureClick]);
  useEffect(() => { layersRef.current      = layers;         }, [layers]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      ...MAP_CONFIG,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100 }), 'bottom-left');

    map.on('load', () => {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      map.addLayer({
        id: 'sky', type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      map.addLayer({
        id: 'traffic-road-casing',
        type: 'line',
        source: 'composite',
        'source-layer': 'road',
        filter: ROAD_FILTER,
        minzoom: 10,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': 'rgba(0,0,0,0.5)',
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            10, ['match', ['get', 'class'], ['motorway', 'trunk'], 4, ['primary'], 3, 2],
            14, ['match', ['get', 'class'], ['motorway', 'trunk'], 10, ['primary'], 8, 6],
            17, ['match', ['get', 'class'], ['motorway', 'trunk'], 16, ['primary'], 13, 9],
          ],
          'line-opacity': 0.55,
        },
      });

      map.addLayer({
        id: 'traffic-roads',
        type: 'line',
        source: 'composite',
        'source-layer': 'road',
        filter: ROAD_FILTER,
        minzoom: 10,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': TRAFFIC_COLOR_EXPR,
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            10, ['match', ['get', 'class'], ['motorway', 'trunk'], 2.5, ['primary'], 2, 1.5],
            14, ['match', ['get', 'class'], ['motorway', 'trunk'], 7,   ['primary'], 5.5, 4],
            17, ['match', ['get', 'class'], ['motorway', 'trunk'], 12,  ['primary'], 9,   6],
          ],
          'line-opacity': 0.88,
        },
      });

      map.on('click', 'traffic-roads', (e) => {
        const feature = e.features?.[0];
        if (feature) onClickRef.current?.(roadFeatureToTrafficData(feature, e.lngLat));
      });
      map.on('mouseenter', 'traffic-roads', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'traffic-roads', () => { map.getCanvas().style.cursor = ''; });

      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 10,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['get', 'height'],
            0, '#1e293b', 50, '#334155', 200, '#475569',
          ],
          'fill-extrusion-height':  ['get', 'height'],
          'fill-extrusion-base':    ['get', 'min_height'],
          'fill-extrusion-opacity': 0.85,
        },
      });

      map.addSource('air-quality', {
        type: 'geojson',
        data: buildAQGeojson(airStationsRef.current),
      });

      map.addLayer({
        id: 'aq-heatmap', type: 'heatmap', source: 'air-quality', maxzoom: 13,
        paint: {
          'heatmap-weight':    ['interpolate', ['linear'], ['get', 'aqi'], 0, 0, 300, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 9, 2],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0,228,0,0)',
            0.2, 'rgba(255,255,0,0.6)',
            0.5, 'rgba(255,126,0,0.8)',
            0.8, 'rgba(255,0,0,0.9)',
            1,   'rgba(126,0,35,1)',
          ],
          'heatmap-radius':  ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 40],
          'heatmap-opacity': 0.6,
        },
      });

      map.addLayer({
        id: 'aq-circles', type: 'circle', source: 'air-quality', minzoom: 9,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 6, 12, 10, 15, 16],
          'circle-color': [
            'interpolate', ['linear'], ['get', 'aqi'],
            0, '#00e400', 50, '#ffff00', 100, '#ff7e00',
            150, '#ff0000', 200, '#8f3f97', 300, '#7e0023',
          ],
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
          'circle-stroke-width': 1.5,
          'circle-opacity': 0.9,
        },
      });

      map.addLayer({
        id: 'aq-labels', type: 'symbol', source: 'air-quality', minzoom: 11,
        layout: {
          'text-field': ['get', 'aqi'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 10,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.9)',
          'text-halo-width': 1.2,
        },
      });

      map.on('click', 'aq-circles', (e) => {
        const feature = e.features?.[0];
        if (feature) onClickRef.current?.({ type: 'air-quality', data: feature.properties, coordinates: e.lngLat });
      });
      map.on('mouseenter', 'aq-circles', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'aq-circles', () => { map.getCanvas().style.cursor = ''; });

      const vis = (id, show) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
      const l = layersRef.current;
      vis('3d-buildings',        l.buildings);
      vis('traffic-roads',       l.trafficFlow);
      vis('traffic-road-casing', l.trafficFlow);
      vis('aq-heatmap',          l.airQuality);
      vis('aq-circles',          l.airQuality);
      vis('aq-labels',           l.airQuality);

      mapLoadedRef.current = true;
    });

    return () => {
      mapLoadedRef.current = false;
      map.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    const vis = (id, show) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
    vis('3d-buildings',        layers.buildings);
    vis('traffic-roads',       layers.trafficFlow);
    vis('traffic-road-casing', layers.trafficFlow);
    vis('aq-heatmap',          layers.airQuality);
    vis('aq-circles',          layers.airQuality);
    vis('aq-labels',           layers.airQuality);
  }, [layers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) return;
    map.getSource('air-quality')?.setData(buildAQGeojson(airStations));
  }, [airStations]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ position: 'absolute', inset: 0 }} />
  );
}
