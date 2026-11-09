import https from 'node:https';

export default function handler(req, res) {
  const q = ((req.query && req.query.q) || '').toString().trim().slice(0, 200);
  const tl = ((req.query && req.query.tl) || 'en-US').toString();
  const ttsspeed = ((req.query && req.query.ttsspeed) || '1').toString();

  if (!q) {
    res.status(400).send('Missing query parameter q');
    return;
  }

  const googleUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(tl)}&ttsspeed=${encodeURIComponent(ttsspeed)}&q=${encodeURIComponent(q)}`;

  https
    .get(
      googleUrl,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
      },
      (googleRes) => {
        if (googleRes.statusCode !== 200) {
          res.status(googleRes.statusCode || 502).send('TTS upstream error');
          return;
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        googleRes.pipe(res);
      }
    )
    .on('error', () => {
      res.status(502).send('Failed to reach Google TTS');
    });
}

