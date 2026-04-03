import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { currentHour, peakTraffic, peakAQI, threeDayOutlook } from '../data/mockPredictions.js';
import { zoneAnalytics } from '../data/mockRecommendations.js';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY || '');

const topAQIZone   = zoneAnalytics.reduce((a, b) => a.aqi > b.aqi ? a : b);
const topCongZone  = zoneAnalytics.reduce((a, b) => a.congestion > b.congestion ? a : b);

const PROMPT = `You are an AI urban analyst for Almaty, Kazakhstan.

Current city conditions:
- Traffic congestion: ${currentHour.congestion}% (level ${currentHour.trafficLevel}/4)
- Air Quality Index: ${currentHour.aqi} | Weather: ${currentHour.weather}
- Peak traffic today: ${peakTraffic.congestion}% at ${peakTraffic.timeLabel}
- Peak AQI today: ${peakAQI.aqi} at ${peakAQI.timeLabel}
- Most congested zone: ${topCongZone.zone} (${topCongZone.congestion}%)
- Worst air quality zone: ${topAQIZone.zone} (AQI ${topAQIZone.aqi}, trend ${topAQIZone.trend})

3-day forecast:
${threeDayOutlook.map(d => `  ${d.day}: avg congestion ${d.avgCongestion}%, avg AQI ${d.avgAQI}`).join('\n')}

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "citizenAdvisory": "<2 sentences: practical advice for Almaty residents about travel and outdoor activity today>",
  "akimatAction": "<1 sentence: the single most impactful action Almaty city officials should take right now>",
  "trafficOutlook": "<1 sentence: traffic trend prediction for the rest of today>",
  "airOutlook": "<1 sentence: air quality trend prediction for the rest of today>"
}`;

export function useAIPredictions() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!import.meta.env.VITE_GEMINI_KEY) {
      setLoading(false);
      return;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
    });

    model.generateContent(PROMPT)
      .then(result => {
        const text = result.response.text().trim();
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          setData(JSON.parse(match[0]));
        } else {
          setError('Could not parse AI response');
        }
      })
      .catch(err => {
        setError(err?.message || 'AI prediction unavailable');
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
