import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(cors());

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
const RHUBARB_BIN = process.platform === 'win32'
  ? path.join(__dirname, '../bin/rhubarb.exe')
  : path.join(__dirname, '../bin/rhubarb');

const TALKING_ANIMATIONS = ['Talking_0', 'Talking_1', 'Talking_2'];

const execCmd = (cmd) =>
  new Promise((resolve, reject) =>
    exec(cmd, (err, stdout) => (err ? reject(err) : resolve(stdout)))
  );

async function textToSpeech(text) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );
  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${errBody}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function runLipSync(mp3Buffer) {
  const tmpId = Date.now();
  const tmpDir = os.tmpdir();
  const mp3Path = path.join(tmpDir, `ulydala_${tmpId}.mp3`);
  const wavPath = path.join(tmpDir, `ulydala_${tmpId}.wav`);
  const jsonPath = path.join(tmpDir, `ulydala_${tmpId}.json`);

  try {
    await fs.writeFile(mp3Path, mp3Buffer);
    await execCmd(`ffmpeg -y -i "${mp3Path}" "${wavPath}"`);
    await execCmd(`"${RHUBARB_BIN}" -f json -o "${jsonPath}" "${wavPath}" -r phonetic`);
    const data = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(data);
  } finally {
    for (const f of [mp3Path, wavPath, jsonPath]) {
      try { await fs.unlink(f); } catch { /* ignore */ }
    }
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/speak', async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text is required' });

  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set in .env' });
  }

  try {
    const mp3Buffer = await textToSpeech(text);
    const audio = mp3Buffer.toString('base64');
    const animation = TALKING_ANIMATIONS[Math.floor(Math.random() * TALKING_ANIMATIONS.length)];

    let lipsync = { mouthCues: [] };
    try {
      lipsync = await runLipSync(mp3Buffer);
    } catch (err) {
      console.warn('[speak] Rhubarb/ffmpeg unavailable — skipping lip-sync:', err.message);
    }

    res.json({ audio, lipsync, animation });
  } catch (err) {
    console.error('[speak] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => console.log(`[uly-dala backend] listening on http://localhost:${PORT}`));
