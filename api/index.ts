// Vercel Serverless Function entry point
// Connects Vercel serverless requests to the production backend Express application
import app from '../server';

export default function handler(req: any, res: any) {
  try {
    // Normalize incoming URLs if Vercel serverless rewrites altered or stripped the /api prefix
    if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_')) {
      const cleanUrl = req.url.startsWith('/') ? req.url : `/${req.url}`;
      req.url = `/api${cleanUrl}`;
    }

    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless] Fatal execution error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal server error processing request.',
      message: err?.message || 'Serverless invocation failure',
      code: 'SERVERLESS_FUNCTION_ERROR'
    }));
  }
}

