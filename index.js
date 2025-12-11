// FREE PROTON VPN HANDLE API - RENDER DEPLOYMENT
// Works exactly like handle.gadgetsdecory.xyz

const express = require('express');
const app = express();

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

// Store IPs for stats
const ipDatabase = {};

// UPDATED FREE PROTON VPN IP RANGES (2024)
const FREE_PROTON_VPN = {
    // Netherlands - Free Servers
    'NL': [
        '185.159.', '185.207.', '146.70.', '195.178.',
        '194.110.', '193.105.', '188.214.', '176.119.',
        '178.21.', '185.216.', '194.145.', '194.26.'
    ],
    
    // Japan - Free Servers
    'JP': [
        '45.142.', '45.86.', '46.166.', '46.182.',
        '46.226.', '5.252.', '5.253.', '5.254.',
        '5.255.', '64.120.', '65.108.', '77.83.'
    ],
    
    // USA - Free Servers
    'US': [
        '209.58.', '212.102.', '23.105.', '31.171.',
        '80.94.', '82.102.', '83.97.', '89.147.',
        '91.108.', '94.131.', '45.14.', '45.15.'
    ],
    
    // Other Countries
    'OTHER': [
        '78.142.', '85.239.', '91.92.', '95.214.',
        '185.153.', '185.195.', '45.134.', '45.135.'
    ]
};

// Check if IP is Free Proton VPN
function checkProtonVPN(ip) {
    ip = ip.trim();
    
    for (const [country, ranges] of Object.entries(FREE_PROTON_VPN)) {
        for (const range of ranges) {
            if (ip.startsWith(range)) {
                return {
                    isProton: true,
                    country: country,
                    serverType: 'free',
                    matchedRange: range,
                    confidence: 'high'
                };
            }
        }
    }
    
    return {
        isProton: false,
        country: 'XX',
        serverType: 'none',
        confidence: 'low'
    };
}

// Get country name
function getCountryName(code) {
    const countries = {
        'PK': 'Pakistan', 'US': 'USA', 'NL': 'Netherlands',
        'JP': 'Japan', 'DE': 'Germany', 'CA': 'Canada',
        'UK': 'UK', 'IN': 'India', 'XX': 'Unknown'
    };
    return countries[code] || code;
}

// ============= MAIN ENDPOINT: /dc =============
// EXACTLY like handle.gadgetsdecory.xyz
app.get('/dc', (req, res) => {
    try {
        // Get client IP
        const clientIp = req.headers['x-forwarded-for'] || 
                        req.headers['x-real-ip'] || 
                        req.ip || 
                        req.connection.remoteAddress ||
                        '8.8.8.8';
        
        // Clean IP
        const cleanIp = clientIp.split(',')[0].trim();
        
        // Detect Proton VPN
        const detection = checkProtonVPN(cleanIp);
        
        // Determine country
        let countryCode = detection.isProton ? detection.country : 'PK';
        
        // If not Proton, check if non-Pakistan (mock)
        if (!detection.isProton) {
            const countries = ['US', 'UK', 'CA', 'DE', 'AE', 'SA'];
            const randomIndex = Math.floor(Math.random() * countries.length);
            countryCode = countries[randomIndex];
        }
        
        // Prepare response data
        const responseData = {
            proxy: detection.isProton ? "yes" : "no",
            isocode: countryCode,
            country: getCountryName(countryCode),
            vpn_type: detection.isProton ? "free-proton" : "none",
            server_type: detection.serverType,
            confidence: detection.confidence,
            matched_range: detection.matchedRange || "none",
            timestamp: new Date().toISOString(),
            render_hosted: true
        };
        
        // Store in database
        ipDatabase[cleanIp] = responseData;
        
        // Build EXACT response like original
        const response = {
            clientIp: cleanIp,
            [cleanIp]: responseData,
            message: "success",
            server: "render-proton-handle",
            time: new Date().toISOString(),
            total_detections: Object.keys(ipDatabase).length
        };
        
        // Send response
        res.json(response);
        
    } catch (error) {
        console.error('Error in /dc:', error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
});

// ============= ADDITIONAL ENDPOINTS =============

// Check specific IP
app.get('/check', (req, res) => {
    const ip = req.query.ip || req.ip;
    const detection = checkProtonVPN(ip);
    
    res.json({
        ip: ip,
        isFreeProtonVPN: detection.isProton,
        details: detection,
        action: detection.isProton ? 
                "✅ Show special content" : 
                "❌ Show normal content"
    });
});

// Statistics
app.get('/stats', (req, res) => {
    const total = Object.keys(ipDatabase).length;
    const protonCount = Object.values(ipDatabase).filter(d => d.vpn_type === "free-proton").length;
    
    res.json({
        status: "active",
        total_requests: total,
        proton_detections: protonCount,
        normal_detections: total - protonCount,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        server_time: new Date().toISOString()
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    const testIPs = [
        '185.159.156.1',  // Proton VPN Netherlands
        '45.142.178.1',   // Proton VPN Japan
        '209.58.123.1',   // Proton VPN USA
        '110.235.123.1',  // Normal Pakistan IP
        '8.8.8.8'         // Google DNS
    ];
    
    const results = testIPs.map(ip => ({
        ip: ip,
        detection: checkProtonVPN(ip)
    }));
    
    res.json({
        test_results: results,
        note: "Use /dc endpoint for real detection"
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Proton VPN Handle API'
    });
});

// ============= HOME PAGE =============
app.get('/', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🔓 Free Proton VPN Handle API - Render</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    color: #333;
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 30px;
                }
                header {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    margin-bottom: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #6D4AFF;
                    font-size: 42px;
                    margin-bottom: 10px;
                }
                .subtitle {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 30px;
                }
                .cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 25px;
                    margin-bottom: 30px;
                }
                .card {
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                }
                .card h3 {
                    color: #6D4AFF;
                    margin-bottom: 15px;
                    font-size: 22px;
                }
                .code-block {
                    background: #2d2d2d;
                    color: #f8f8f2;
                    padding: 20px;
                    border-radius: 8px;
                    font-family: 'Courier New', monospace;
                    overflow-x: auto;
                    margin: 15px 0;
                }
                .btn {
                    display: inline-block;
                    background: linear-gradient(45deg, #6D4AFF, #8B5AFF);
                    color: white;
                    padding: 12px 25px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: bold;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.3s;
                }
                .btn:hover {
                    transform: translateY(-3px);
                }
                .test-area {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    margin: 30px 0;
                }
                .result {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 20px;
                    display: none;
                }
                .proton-result {
                    border-left: 5px solid #28a745;
                }
                .normal-result {
                    border-left: 5px solid #ffc107;
                }
                footer {
                    text-align: center;
                    color: white;
                    margin-top: 50px;
                    padding: 20px;
                    opacity: 0.8;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>🔓 Free Proton VPN Handle API</h1>
                    <p class="subtitle">Deployed on Render • Works exactly like handle.gadgetsdecory.xyz</p>
                    <p>Detects FREE Proton VPN connections and shows special content to VPN users.</p>
                </header>
                
                <div class="cards">
                    <div class="card">
                        <h3>📡 Main Endpoint</h3>
                        <div class="code-block">
                            GET ${baseUrl}/dc
                        </div>
                        <p>Returns data in exact same format as original handle API.</p>
                        <a href="/dc" class="btn" target="_blank">Test /dc</a>
                    </div>
                    
                    <div class="card">
                        <h3>🔧 Usage in Website</h3>
                        <div class="code-block">
fetch('${baseUrl}/dc')
  .then(res => res.json())
  .then(data => {
    const ip = data.clientIp;
    const isProton = data[ip]?.vpn_type === "free-proton";
    
    if(isProton) {
        // Show special content
        document.querySelector(".recovery-group").style.display = "block";
    }
  });
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>📊 Statistics</h3>
                        <p><strong>Total Detections:</strong> <span id="totalCount">0</span></p>
                        <p><strong>Proton VPN Users:</strong> <span id="protonCount">0</span></p>
                        <a href="/stats" class="btn">View Stats</a>
                    </div>
                </div>
                
                <div class="test-area">
                    <h3>🧪 Live API Test</h3>
                    <p>Click to test if your connection is detected as Free Proton VPN:</p>
                    <button class="btn" onclick="runTest()">Test My Connection</button>
                    
                    <div id="testResult" class="result"></div>
                </div>
                
                <div class="test-area">
                    <h3>📋 Test IPs</h3>
                    <p>Test these IPs to see detection results:</p>
                    <div class="code-block">
// Proton VPN IPs:
185.159.156.1  - Netherlands 🇳🇱
45.142.178.1   - Japan 🇯🇵
209.58.123.1   - USA 🇺🇸

// Normal IPs:
110.235.123.1  - Pakistan 🇵🇰
8.8.8.8        - Google DNS
                    </div>
                    <button class="btn" onclick="testSampleIPs()">Test Sample IPs</button>
                    <div id="sampleResult" class="result"></div>
                </div>
            </div>
            
            <footer>
                <p>Free Proton VPN Handle API • Deployed on Render • ${new Date().getFullYear()}</p>
                <p>This API detects FREE Proton VPN servers in Netherlands, Japan, and USA</p>
            </footer>
            
            <script>
                // Update stats
                async function updateStats() {
                    try {
                        const response = await fetch('/stats');
                        const data = await response.json();
                        document.getElementById('totalCount').textContent = data.total_requests || 0;
                        document.getElementById('protonCount').textContent = data.proton_detections || 0;
                    } catch (error) {
                        console.log('Stats error:', error);
                    }
                }
                
                // Test user's connection
                async function runTest() {
                    const resultDiv = document.getElementById('testResult');
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = '<p>Testing your connection...</p>';
                    
                    try {
                        const response = await fetch('/dc');
                        const data = await response.json();
                        const ip = data.clientIp;
                        const isProton = data[ip]?.vpn_type === "free-proton";
                        
                        resultDiv.className = 'result ' + (isProton ? 'proton-result' : 'normal-result');
                        resultDiv.innerHTML = \`
                            <h3>\${isProton ? '✅ Free Proton VPN Detected!' : '👤 Normal Connection'}</h3>
                            <p><strong>Your IP:</strong> \${ip}</p>
                            <p><strong>VPN Type:</strong> \${data[ip]?.vpn_type || 'none'}</p>
                            <p><strong>Country:</strong> \${data[ip]?.country || 'Unknown'}</p>
                            <p><strong>Proxy Status:</strong> \${data[ip]?.proxy || 'no'}</p>
                            <p><strong>Confidence:</strong> \${data[ip]?.confidence || 'low'}</p>
                            <hr>
                            <p><strong>Website Action:</strong> \${isProton ? 
                                '<span style="color: green;">Will show SPECIAL content</span>' : 
                                '<span style="color: orange;">Will show NORMAL content</span>'}</p>
                        \`;
                        
                    } catch (error) {
                        resultDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
                    }
                    
                    updateStats();
                }
                
                // Test sample IPs
                async function testSampleIPs() {
                    const resultDiv = document.getElementById('sampleResult');
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = '<p>Testing sample IPs...</p>';
                    
                    const sampleIPs = [
                        '185.159.156.1',
                        '45.142.178.1', 
                        '209.58.123.1',
                        '110.235.123.1',
                        '8.8.8.8'
                    ];
                    
                    let resultsHTML = '<h3>Sample IP Test Results:</h3>';
                    
                    for (const ip of sampleIPs) {
                        try {
                            const response = await fetch(\`/check?ip=\${ip}\`);
                            const data = await response.json();
                            
                            resultsHTML += \`
                                <div style="margin: 10px 0; padding: 10px; background: \${data.isFreeProtonVPN ? '#d4edda' : '#f8d7da'}; border-radius: 5px;">
                                    <strong>\${ip}</strong>: \${data.isFreeProtonVPN ? '✅ Proton VPN' : '❌ Normal IP'}
                                    <br><small>\${data.details.country} • \${data.details.confidence} confidence</small>
                                </div>
                            \`;
                        } catch (error) {
                            resultsHTML += \`<p style="color: red;">Error testing \${ip}</p>\`;
                        }
                    }
                    
                    resultDiv.innerHTML = resultsHTML;
                }
                
                // Auto run on page load
                window.onload = function() {
                    updateStats();
                    runTest();
                };
            </script>
        </body>
        </html>
    `);
});

// ============= START SERVER =============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 Free Proton VPN Handle API
    📍 Port: ${PORT}
    📡 Main Endpoint: http://localhost:${PORT}/dc
    🏠 Home Page: http://localhost:${PORT}
    🔧 Health Check: http://localhost:${PORT}/health
    📊 Stats: http://localhost:${PORT}/stats
    
    💡 TIP: After deploying on Render, your URL will be:
    https://your-app-name.onrender.com/dc
    `);
});
