// Vercel Serverless Function entry point
// Connects Vercel edge/serverless requests to the production backend bundle

let cachedApp: any = null;

async function getApp() {
  if (!cachedApp) {
    try {
      // Load the bundled, production-compiled CommonJS server
      // @ts-ignore - dist/server.cjs is bundled during build
      const serverModule: any = await import('../dist/server.cjs');
      const raw = serverModule?.app || serverModule?.default;
      cachedApp = typeof raw === 'function' ? raw : (raw?.app || raw?.default);
    } catch (bundleErr: any) {
      console.warn('[Vercel Serverless] dist/server.cjs not available, falling back to server.ts:', bundleErr?.message);
      const serverModule: any = await import('../server.ts');
      const raw = serverModule?.app || serverModule?.default;
      cachedApp = typeof raw === 'function' ? raw : (raw?.app || raw?.default);
    }
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();

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
