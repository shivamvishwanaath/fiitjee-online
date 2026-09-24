/**
 * Dedicated utility for printing specific DOM elements (e.g. Hall Tickets, Admit Cards)
 * Uses an isolated hidden iframe with all current document styles, completely bypassing
 * parent modal overlays, backdrop filters, scroll clipping, or single-page app layout issues.
 */
export function printElementById(elementId: string): void {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    console.warn(`Element with id "${elementId}" not found. Falling back to window.print().`);
    window.print();
    return;
  }

  // Create isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;');
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets and inline style blocks
    const styleElements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>FIITJEE Official Hall Ticket & Tax Invoice</title>
          ${styleElements}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 6mm;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #${elementId} {
              margin: 0 auto !important;
              padding: 4px !important;
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: 100% !important;
            }
          </style>
        </head>
        <body>
          ${targetElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Give the iframe a moment to render fonts and stylesheets before printing
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (printErr) {
        console.error("Iframe print error:", printErr);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 300);
  } catch (err) {
    console.error("Failed to print via iframe, falling back to window.print():", err);
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
    window.print();
  }
}
