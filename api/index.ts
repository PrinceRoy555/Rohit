// Vercel Serverless Function entry point
// Connects Vercel serverless requests to the production backend Express application
// @ts-ignore - api/_server.js is bundled for serverless runtime resolution
import serverApp from './_server.js';

const app = typeof serverApp === 'function' ? serverApp : ((serverApp as any)?.default || (serverApp as any)?.app);

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

