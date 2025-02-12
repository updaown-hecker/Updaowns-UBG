const express = require("express");
const httpProxy = require("http-proxy");
const cors = require("cors");
const path = require("path");
const { JSDOM } = require("jsdom");

const app = express();
const PORT = process.env.PORT || 8080;

// Blacklisted domains (Cannot be proxied)
const BLACKLISTED_DOMAINS = ["example.com", "blocked-site.com"];

// Create an HTTP proxy instance
const proxy = httpProxy.createProxyServer({});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (Homepage and Public Files)
app.use(express.static(path.join(__dirname, "public")));

// Check if the URL is valid
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
    } catch {
        return false;
    }
}

// Modify Response to Keep Users in Proxy (Rewrites Links, Images, Scripts)
function rewriteContent(html, currentUrl) {
    try {
        const dom = new JSDOM(html);
        const document = dom.window.document;

        function rewriteSrc(element, attr) {
            if (element[attr]) {
                if (element[attr].startsWith("http")) {
                    element[attr] = `/proxy?url=${encodeURIComponent(element[attr])}`;
                } else if (!element[attr].startsWith("/proxy")) {
                    // Handle relative paths
                    const baseUrl = new URL(currentUrl);
                    const absoluteUrl = new URL(element[attr], baseUrl).href;
                    element[attr] = `/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                }
            }
        }

        // Update all links
        document.querySelectorAll("a").forEach((a) => rewriteSrc(a, "href"));
        // Update all images
        document.querySelectorAll("img").forEach((img) => rewriteSrc(img, "src"));
        // Update scripts that load external resources
        document.querySelectorAll("script").forEach((script) => rewriteSrc(script, "src"));
        // Update stylesheets
        document.querySelectorAll("link[rel='stylesheet']").forEach((link) => rewriteSrc(link, "href"));

        // Intercept JavaScript Fetch/XHR requests to keep them in the proxy
        const scriptInjection = document.createElement("script");
        scriptInjection.textContent = `
            (function() {
                function rewriteUrl(url) {
                    return url.startsWith("http") && !url.includes("localhost:8080/proxy?url=")
                        ? "/proxy?url=" + encodeURIComponent(url)
                        : url;
                }
                const originalFetch = window.fetch;
                window.fetch = function(url, options) {
                    return originalFetch(rewriteUrl(url), options);
                };
                const originalOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(method, url) {
                    return originalOpen.apply(this, [method, rewriteUrl(url)]);
                };
                document.addEventListener("click", function(event) {
                    let target = event.target;
                    while (target && target.tagName !== "A") target = target.parentElement;
                    if (target && target.href) {
                        event.preventDefault();
                        window.location.href = rewriteUrl(target.href);
                    }
                });
            })();
        `;
        document.body.appendChild(scriptInjection);

        return dom.serialize();
    } catch (error) {
        console.error("Error parsing HTML:", error.message);
        return html; // Return the original HTML if parsing fails
    }
}

// Dynamic Proxy Middleware (Enforcing Proxy)
app.use("/proxy", async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl || !isValidUrl(targetUrl)) {
        return res.status(400).send("Invalid URL");
    }

    const targetDomain = new URL(targetUrl).hostname;
    if (BLACKLISTED_DOMAINS.includes(targetDomain)) {
        return res.status(403).send("This domain is blocked.");
    }

    console.log(`Proxying request to: ${targetUrl}`);

    // Forward the request to the target URL
    proxy.web(
        req,
        res,
        { target: targetUrl, changeOrigin: true },
        (err) => {
            console.error("Proxy Error:", err.message);
            res.status(500).send("Proxy Error: Unable to fetch the requested page.");
        }
    );

    // Capture the response and modify it if it's HTML
    proxy.on("proxyRes", (proxyRes, req, res) => {
        let body = [];

        proxyRes.on("data", (chunk) => {
            body.push(chunk);
        });

        proxyRes.on("end", () => {
            body = Buffer.concat(body).toString();

            // Rewrite content if it's HTML
            const contentType = proxyRes.headers["content-type"] || "";
            if (contentType.includes("text/html")) {
                body = rewriteContent(body, targetUrl);
            }

            // Ensure headers are written only once
            if (!res.headersSent) {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                res.end(body);
            }
        });
    });
});

// Serve Homepage as Default Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});