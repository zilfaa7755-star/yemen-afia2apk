import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON parser for audio payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Shared Gemini client utility
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for audio transcription using gemini-3.5-transcribe
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioData, mimeType, prompt } = req.body;
      if (!audioData) {
        return res.status(400).json({ error: 'Missing audioData' });
      }

      // Clean base64 data if data URI was sent
      const base64Data = audioData.includes('base64,')
        ? audioData.split('base64,')[1]
        : audioData;

      const audioPart = {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: base64Data,
        },
      };

      const userInstruction =
        prompt ||
        'قم بتحويل هذا التسجيل الصوتي الطبي إلى نص دقيق ومفهوم بالعربية، محتفظاً بالمصطلحات الطبية والأعراض بدقة.';

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [audioPart, { text: userInstruction }],
        },
      });

      const transcription = response.text || '';
      return res.json({ text: transcription });
    } catch (err: any) {
      console.error('Transcription error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to transcribe audio with gemini-3.5-transcribe',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Yemen Afia' });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('{*splat}', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
