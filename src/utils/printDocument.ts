/**
 * High-Fidelity Cross-Browser Document Print & PDF Utility
 *
 * Solves the modern Chromium / Safari / Firefox blank white page bug:
 * Fixed-position drawers with overflow-hidden and transform animations clip
 * standard window.print() output in paged media.
 *
 * This utility clones the printable document into an isolated invisible iframe,
 * applies verified A4 portrait page margins, preserves Tailwind CSS styling,
 * forces exact print color reproduction (-webkit-print-color-adjust: exact),
 * sets the document title (which browsers use as the default saved PDF filename),
 * and triggers the native print/PDF export dialog cleanly without background clipping.
 */

export interface PrintDocumentOptions {
  action?: 'print' | 'pdf';
  fileName?: string;
}

export function printDocument(
  elementId: string,
  documentTitle: string,
  options?: PrintDocumentOptions
): Promise<boolean> {
  const targetTitle = options?.fileName || documentTitle;
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const sourceEl = document.getElementById(elementId);
    if (!sourceEl) {
      console.warn(`[printDocument] Target printable element '#${elementId}' not found. Falling back to window.print().`);
      window.print();
      resolve(false);
      return;
    }

    const previousTitle = document.title;
    document.title = targetTitle;

    // Create an isolated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0; visibility: hidden;'
    );
    iframe.setAttribute('title', 'CRM Printable Document Frame');
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.warn('[printDocument] Could not access iframe document. Falling back to window.print().');
      document.title = previousTitle;
      window.print();
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      resolve(false);
      return;
    }

    // Collect all stylesheets & embedded style tags from the parent document
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    // Assemble clean standalone printable HTML
    iframeDoc.open();
    iframeDoc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(targetTitle)}</title>
  ${styleTags}
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      font-size: 13px !important;
      line-height: 1.5 !important;
    }
    .printable-document-root {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      background: #ffffff !important;
    }
    .no-print, .print\\:hidden {
      display: none !important;
    }
    table {
      border-collapse: collapse !important;
      width: 100% !important;
    }
    tr {
      page-break-inside: avoid !important;
    }
    .page-break-before {
      page-break-before: always !important;
    }
  </style>
</head>
<body>
  <div class="printable-document-root">
    ${sourceEl.innerHTML}
  </div>
</body>
</html>`);
    iframeDoc.close();

    // Settle fonts and CSS before triggering print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        resolve(true);
      } catch (err) {
        console.warn('[printDocument] Print dialog error in iframe:', err);
        window.print();
        resolve(false);
      } finally {
        document.title = previousTitle;
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 2500);
      }
    }, 350);
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
