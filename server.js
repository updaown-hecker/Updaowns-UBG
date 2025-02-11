const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rest of your proxy code remains the same...
// [Keep all your existing proxy endpoint code here]

// Proxy endpoint
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;

  // Validate URL
  if (!targetUrl || !isValidUrl(targetUrl)) {
    return res.status(400).send('Invalid URL');
  }

  try {
    // Fetch the target URL with custom headers
    const proxyResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': targetUrl,
      },
    });

    // Get the content type
    const contentType = proxyResponse.headers.get('content-type') || '';

    // Process the response based on content type
    if (contentType.includes('text/html')) {
      const html = await proxyResponse.text();
      const $ = cheerio.load(html);

      // Rewrite URLs in the <head> section
      $('head').find('link[href], meta[content], script[src]').each((_, element) => {
        const tagName = $(element).prop('tagName').toLowerCase();
        if (tagName === 'link') {
          const href = $(element).attr('href');
          if (href) {
            $(element).attr('href', rewriteUrl(href, targetUrl));
          }
        } else if (tagName === 'meta') {
          const content = $(element).attr('content');
          if (content && (content.startsWith('http://') || content.startsWith('https://'))) {
            $(element).attr('content', rewriteUrl(content, targetUrl));
          }
        } else if (tagName === 'script') {
          const src = $(element).attr('src');
          if (src) {
            $(element).attr('src', rewriteUrl(src, targetUrl));
          }
        }
      });

      // Rewrite URLs in the <body> section
      $('body').find('a[href], link[href], script[src], img[src], form[action], iframe[src], source[src], video[src], audio[src], track[src]').each((_, element) => {
        const attributes = ['href', 'src', 'action'];
        attributes.forEach(attr => {
          const value = $(element).attr(attr);
          if (value) {
            $(element).attr(attr, rewriteUrl(value, targetUrl));
          }
        });
      });

      // Inject JavaScript to handle link clicks, form submissions, and dynamic navigation
      $('body').append(`
        <script>
          // Function to rewrite URLs to go through the proxy
          function rewriteUrl(url) {
            if (!url.startsWith('http')) {
              // Convert relative URLs to absolute URLs
              url = new URL(url, window.location.origin).href;
            }
            return '/proxy?url=' + encodeURIComponent(url);
          }

          // Function to rewrite URLs in the DOM
          function rewriteUrlsInDom() {
            // Rewrite URLs in all relevant elements
            document.querySelectorAll('a[href], link[href], script[src], img[src], form[action], iframe[src], source[src], video[src], audio[src], track[src]').forEach(element => {
              const attributes = ['href', 'src', 'action'];
              attributes.forEach(attr => {
                const value = element.getAttribute(attr);
                if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
                  element.setAttribute(attr, rewriteUrl(value));
                }
              });
            });

            // Rewrite URLs in inline styles
            document.querySelectorAll('[style]').forEach(element => {
              const style = element.getAttribute('style');
              const rewrittenStyle = style.replace(/(url\\()(['"]?)(https?:\/\/[^'"\\)]+)\\2\\)/g, (match, prefix, quote, url) => {
                return \`\${prefix}\${quote}\${rewriteUrl(url)}\${quote})\`;
              });
              element.setAttribute('style', rewrittenStyle);
            });

            // Rewrite URLs in JavaScript code
            document.querySelectorAll('script').forEach(script => {
              if (!script.src && script.textContent) {
                try {
                  // Attempt to parse the script content as JSON
                  const jsonData = JSON.parse(script.textContent);
                  const rewrittenJson = rewriteUrlsInJson(jsonData);
                  script.textContent = JSON.stringify(rewrittenJson);
                } catch (error) {
                  // If it's not JSON, treat it as regular JavaScript
                  const rewrittenScript = script.textContent.replace(/(["'])(https?:\/\/[^"']+)\\1/g, (match, quote, url) => {
                    return \`\${quote}\${rewriteUrl(url)}\${quote}\`;
                  });
                  script.textContent = rewrittenScript;
                }
              }
            });
          }

          // Function to rewrite URLs in JSON data
          function rewriteUrlsInJson(data) {
            if (typeof data === 'string') {
              // Rewrite URLs in strings
              if (data.startsWith('http://') || data.startsWith('https://')) {
                return rewriteUrl(data);
              }
              return data;
            } else if (Array.isArray(data)) {
              // Traverse arrays
              return data.map(item => rewriteUrlsInJson(item));
            } else if (typeof data === 'object' && data !== null) {
              // Traverse objects
              const result = {};
              for (const key in data) {
                result[key] = rewriteUrlsInJson(data[key]);
              }
              return result;
            }
            return data;
          }

          // Rewrite URLs after the page has loaded
          document.addEventListener('DOMContentLoaded', rewriteUrlsInDom);

          // Intercept all link clicks
          document.addEventListener('click', function(event) {
            const link = event.target.closest('a');
            if (link) {
              event.preventDefault();
              const url = link.getAttribute('href');
              navigateTo(url);
            }
          });

          // Intercept all form submissions
          document.addEventListener('submit', function(event) {
            const form = event.target.closest('form');
            if (form) {
              event.preventDefault();
              const url = form.getAttribute('action');
              const method = form.getAttribute('method') || 'GET';
              const formData = new FormData(form);
              const params = new URLSearchParams(formData).toString();

              fetch(method === 'POST' ? url : \`\${url}?\${params}\`, {
                method: method,
                body: method === 'POST' ? params : null
              })
                .then(response => response.text())
                .then(html => {
                  document.documentElement.innerHTML = html;
                  rewriteUrlsInDom(); // Rewrite URLs in the new content
                });
            }
          });

          // Handle dynamic navigation (e.g., JavaScript-based links)
          function navigateTo(url) {
            if (!url.startsWith('http')) {
              url = new URL(url, window.location.origin).href;
            }
            window.history.pushState({}, '', url);
            fetch(url)
              .then(response => response.text())
              .then(html => {
                document.documentElement.innerHTML = html;
                rewriteUrlsInDom(); // Rewrite URLs in the new content
              });
          }

          // Handle back/forward navigation
          window.addEventListener('popstate', function() {
            fetch(window.location.href)
              .then(response => response.text())
              .then(html => {
                document.documentElement.innerHTML = html;
                rewriteUrlsInDom(); // Rewrite URLs in the new content
              });
          });
        </script>
      `);

      // Send the modified HTML
      return res.set('Content-Type', 'text/html').send($.html());
    }

    // For other content types (images, JSON, etc.), stream the response
    res.set('Content-Type', contentType);
    proxyResponse.body.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Helper functions
function rewriteUrl(url, baseUrl) {
  try {
    // Convert relative URLs to absolute URLs
    if (!url.startsWith('http')) {
      url = new URL(url, baseUrl).href;
    }
    // Rewrite the URL to go through the proxy
    return `/proxy?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}