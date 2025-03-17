import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Download, HelpCircle, Terminal, AlertTriangle, Globe, Code, Database } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-transparent font-mono">
      <header className="border-b border-border bg-black/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/Logo.png" 
                alt="ODINSMASH Logo" 
                className="h-8 w-8 object-contain"
                style={{ marginRight: '-4px' }}
              />
              <span className="text-lg font-semibold">ODINSMASH</span>
            </Link>
            <nav className="flex items-center space-x-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                HOME
              </Link>
              <Link href="/tokens" className="text-muted-foreground hover:text-foreground">
                TOKENS
              </Link>
              <Link href="/extension" className="text-muted-foreground hover:text-foreground">
                EXTENSION
              </Link>
              <Link href="/docs" className="text-primary hover:text-primary/80">
                DOCS
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Documentation</h1>
            <p className="text-sm text-muted-foreground">
              Learn how to use the ODINSMASH website and browser extension
            </p>
          </div>

          <Tabs defaultValue="website" className="space-y-6">
            <TabsList className="bg-secondary/50 backdrop-blur-sm">
              <TabsTrigger
                value="website"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Globe className="h-4 w-4 mr-2" />
                Website
              </TabsTrigger>
              <TabsTrigger
                value="extension"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Terminal className="h-4 w-4 mr-2" />
                Extension
              </TabsTrigger>
              <TabsTrigger
                value="api"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Code className="h-4 w-4 mr-2" />
                API
              </TabsTrigger>
              <TabsTrigger
                value="faq"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>

            {/* WEBSITE DOCUMENTATION */}
            <TabsContent value="website" className="space-y-6">
              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Using ODINSMASH Website</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Token Analysis
                    </h3>
                    <p className="text-sm mb-2">
                      The main function of ODINSMASH is to analyze Odin.fun tokens for potential risks:
                    </p>
                    <ol className="space-y-2 pl-6 text-sm list-decimal">
                      <li>
                        Navigate to the{" "}
                        <Link href="/" className="text-primary hover:underline">
                          home page
                        </Link>
                      </li>
                      <li>Enter an Odin.fun token URL in the search box</li>
                      <li>Click the search button or press Enter</li>
                      <li>
                        View the detailed analysis results, including:
                        <ul className="pl-4 mt-1 space-y-1 list-disc text-muted-foreground">
                          <li>Risk assessment (LOW RISK, MODERATE RISK, HIGH RISK, VERY HIGH RISK, EXTREME RISK)</li>
                          <li>Token metrics (supply, market cap, holders)</li>
                          <li>Liquidity information</li>
                          <li>Market data and trading pairs</li>
                          <li>Top holder distribution</li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Tokens Directory
                    </h3>
                    <p className="text-sm mb-2">Browse recently created tokens on the Tokens page:</p>
                    <ol className="space-y-2 pl-6 text-sm list-decimal">
                      <li>
                        Navigate to the{" "}
                        <Link href="/tokens" className="text-primary hover:underline">
                          Tokens page
                        </Link>
                      </li>
                      <li>View the list of recently created tokens with their key metrics:
                        <ul className="pl-4 mt-1 space-y-1 list-disc text-muted-foreground">
                          <li>Token name and symbol</li>
                          <li>Creation time</li>
                          <li>Market cap</li>
                          <li>Number of holders</li>
                          <li>Trading volume</li>
                        </ul>
                      </li>
                      <li>Use the search box to find specific tokens by name</li>
                      <li>Click on any token to view its detailed risk analysis</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Understanding Risk Analysis</h2>

                <div className="space-y-4">
                  <p className="text-sm">
                  ODINSMASH analyzes multiple factors to determine a token's risk level. Here's how to interpret the
                    results:
                  </p>

                  <div className="space-y-2">
                    <div className="bg-green-900/20 text-green-500 px-2 py-1 rounded">LOW RISK</div>
                    <p className="text-sm">
                      Tokens with this status show healthy distribution and positive indicators:
                    </p>
                    <ul className="space-y-1 pl-6 text-sm list-disc">
                      <li>Well distributed token supply</li>
                      <li>Developer holds less than 10% of supply</li>
                      <li>Top 5 holders control less than 30% of supply</li>
                      <li>Active trading and healthy market activity</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-yellow-900/20 text-yellow-500 px-2 py-1 rounded">MODERATE RISK</div>
                    <p className="text-sm">Standard market risks apply:</p>
                    <ul className="space-y-1 pl-6 text-sm list-disc">
                      <li>Developer holds 10-20% of supply</li>
                      <li>Top 5 holders control 30-40% of supply</li>
                      <li>Normal market volatility expected</li>
                      <li>Trade carefully and monitor holder distribution</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-orange-900/20 text-orange-500 px-2 py-1 rounded">HIGH RISK</div>
                    <p className="text-sm">High concentration detected:</p>
                    <ul className="space-y-1 pl-6 text-sm list-disc">
                      <li>Developer holds 20-30% of supply</li>
                      <li>Top 5 holders control 40-50% of supply</li>
                      <li>Significant price manipulation risk</li>
                      <li>Exercise extreme caution</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-red-900/20 text-red-500 px-2 py-1 rounded">VERY HIGH RISK</div>
                    <p className="text-sm">Very high centralization detected:</p>
                    <ul className="space-y-1 pl-6 text-sm list-disc">
                      <li>Developer holds 30-50% of supply</li>
                      <li>Top 5 holders control 50-70% of supply</li>
                      <li>Major price manipulation risk</li>
                      <li>Not recommended for investment</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-red-900/30 text-red-600 px-2 py-1 rounded">EXTREME RISK</div>
                    <p className="text-sm">Extremely high centralization:</p>
                    <ul className="space-y-1 pl-6 text-sm list-disc">
                      <li>Developer holds over 50% of supply</li>
                      <li>Top 5 holders control over 70% of supply</li>
                      <li>High probability of price manipulation</li>
                      <li>Developer has sold their tokens</li>
                      <li>Developer has created multiple tokens previously</li>
                      <li>Avoid investment - extreme danger</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Website Features</h2>

                <div className="space-y-4">
                  <div className="data-row">
                    <span className="data-label">Token Analysis</span>
                    <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-sm">Available</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Token Directory</span>
                    <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-sm">Available</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Portfolio Tracking</span>
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-sm">Coming Soon</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Price Alerts</span>
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-sm">Coming Soon</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Token Comparison</span>
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-sm">Coming Soon</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Mobile App</span>
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-sm">Planned</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* EXTENSION DOCUMENTATION */}
            <TabsContent value="extension" className="space-y-6">
              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Browser Extension</h2>

                <div className="space-y-4">
                  <p className="text-sm">
                    The ODINSMASH browser extension brings token analysis capabilities directly to your browser,
                    allowing you to check tokens while browsing the web.
                  </p>

                  <div className="flex justify-center">
                    <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                      <a href="#" download>
                        <Download className="h-4 w-4 mr-2" />
                        Download Extension
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Installing the Extension</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Chrome / Edge / Brave Installation
                    </h3>
                    <ol className="space-y-2 pl-6 text-sm list-decimal">
                      <li>
                        Download the extension package from the{" "}
                        <a href="#" className="text-primary hover:underline">
                          releases page
                        </a>
                      </li>
                      <li>Unzip the downloaded file to a folder on your computer</li>
                      <li>
                        Open your browser and navigate to the extensions page:
                        <ul className="pl-4 mt-1 space-y-1 list-disc text-muted-foreground">
                          <li>Chrome: chrome://extensions/</li>
                          <li>Edge: edge://extensions/</li>
                          <li>Brave: brave://extensions/</li>
                        </ul>
                      </li>
                      <li>Enable "Developer mode" using the toggle in the top-right corner</li>
                      <li>Click "Load unpacked" and select the folder where you unzipped the extension</li>
                      <li>The ODINSMASH extension should now appear in your extensions list</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Firefox Installation
                    </h3>
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-sm">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        Firefox support is coming soon. Currently, the extension is only available for Chromium-based
                        browsers.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      System Requirements
                    </h3>
                    <div className="space-y-2">
                  <div className="data-row">
                    <span className="data-label">Supported Browsers</span>
                    <span>Chrome 88+, Edge 88+, Brave 1.20+</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Operating Systems</span>
                    <span>Windows 10+, macOS 10.15+, Linux</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Extension Size</span>
                    <span>~500KB</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Permissions Required</span>
                    <span>Storage, Active Tab, odin.fun domain access</span>
                  </div>
                </div>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Using the Extension</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Checking a Token via Popup
                    </h3>
                    <ol className="space-y-2 pl-6 text-sm list-decimal">
                      <li>Click the ODINSMASH extension icon in your browser toolbar</li>
                      <li>
                        In the popup, enter a token URL in the format:{" "}
                        <code className="bg-secondary px-1 py-0.5 rounded-sm">https://odin.fun/token/TOKENNAME</code>
                      </li>
                      <li>Click the search button or press Enter</li>
                      <li>View the detailed analysis results</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Checking a Token on Odin.fun
                    </h3>
                    <ol className="space-y-2 pl-6 text-sm list-decimal">
                      <li>
                        Navigate to any token page on{" "}
                        <a
                          href="https://odin.fun"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          odin.fun
                        </a>
                      </li>
                      <li>Look for the "Check with ODINSMASH" button in the bottom-right corner</li>
                      <li>Click the button to analyze the current token</li>
                      <li>The extension popup will open with the analysis results</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Using the Context Menu
                    </h3>
                    <ol className="space-y-2 pl-6 text-sm list-decimal">
                      <li>Find a link to an Odin.fun token on any webpage</li>
                      <li>Right-click on the link</li>
                      <li>Select "Check token with ODINSMASH" from the context menu</li>
                      <li>The extension popup will open with the analysis results</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Viewing Recent Checks
                    </h3>
                    <ol className="space-y-2 pl-6 text-sm list-decimal">
                      <li>Open the extension popup</li>
                      <li>Click the "RECENT" tab</li>
                      <li>View a list of your recently checked tokens</li>
                      <li>Click on any token in the list to view its analysis again</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Sharing Results
                    </h3>
                    <ol className="space-y-2 pl-6 text-sm list-decimal">
                      <li>After checking a token, view the analysis results</li>
                      <li>Click the "Share Result" button at the bottom of the results</li>
                      <li>A shareable link will be copied to your clipboard</li>
                      <li>Paste the link anywhere to share the token analysis</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Extension Features</h2>

                <div className="space-y-4">
                  <div className="data-row">
                    <span className="data-label">Token Analysis</span>
                    <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-sm">Available</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Recent Checks History</span>
                    <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-sm">Available</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Context Menu Integration</span>
                    <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-sm">Available</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Odin.fun Page Integration</span>
                    <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-sm">Available</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Firefox Support</span>
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-sm">Coming Soon</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Real-time Alerts</span>
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-sm">Coming Soon</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Portfolio Tracking</span>
                    <span className="px-2 py-0.5 text-xs bg-secondary rounded-sm">Coming Soon</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* API DOCUMENTATION */}
            <TabsContent value="api" className="space-y-6">
              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">API Overview</h2>

                <div className="space-y-4">
                    <p className="text-sm">
                    ODINSMASH provides a REST API that allows developers to integrate token analysis capabilities into
                    their own applications. To request API access, please DM us on X.
                  </p>

                  <div className="flex justify-center">
                    <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                      <a 
                        href="https://x.com/odinsmash" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        DM us on X (@ODINSMASH)
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Authentication</h2>

                <div className="space-y-4">
                  <p className="text-sm">
                    All API requests require authentication using an API key. You can obtain an API key by registering
                    as a developer.
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">API Key Authentication</h3>
                    <p className="text-sm">Include your API key in the request headers:</p>
                    <pre className="bg-secondary p-3 rounded-sm text-xs overflow-x-auto">
                      <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Rate Limits</h3>
                    <p className="text-sm">The API has the following rate limits:</p>
                    <ul className="space-y-1 pl-6 text-sm list-disc">
                      <li>Free tier: 100 requests per day</li>
                      <li>Developer tier: 1,000 requests per day</li>
                      <li>Enterprise tier: Custom limits</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">API Endpoints</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Get Token Analysis
                    </h3>
                    <div className="space-y-2">
                      <div className="data-row">
                        <span className="data-label">Endpoint</span>
                        <span className="font-mono text-xs bg-secondary px-1 py-0.5 rounded-sm">
                          GET /api/v1/tokens/{"{token}"}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Description</span>
                        <span>Retrieve detailed analysis for a specific token</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Parameters</span>
                        <span>token (string): The token name or address</span>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <p className="text-sm font-medium">Example Request:</p>
                      <pre className="bg-secondary p-3 rounded-sm text-xs overflow-x-auto">
                        <code>
                          {`curl -X GET "https://odin-smash-server.onrender.com/api/v1/tokens/ODIN" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                        </code>
                      </pre>
                    </div>
                    <div className="space-y-2 mt-2">
                      <p className="text-sm font-medium">Example Response:</p>
                      <pre className="bg-secondary p-3 rounded-sm text-xs overflow-x-auto">
                        <code>
                          {`{
  "name": "ODIN",
  "status": "GOOD",
  "risk_score": 85,
  "supply": "1T",
  "market_cap": "$70.4K",
  "holders": 12847,
  "lp_locked": "85.15%",
  "markets": [
    {
      "name": "Market 1",
      "pair": "ODIN/SOL",
      "liquidity": "$3,048,961"
    },
    {
      "name": "Market 2",
      "pair": "ODIN/USDC",
      "liquidity": "$574,487"
    }
  ],
  "risk_factors": [],
  "positive_factors": [
    "Liquidity locked for 6+ months",
    "Healthy holder distribution",
    "Active trading volume"
  ]
}`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      List Tokens
                    </h3>
                    <div className="space-y-2">
                      <div className="data-row">
                        <span className="data-label">Endpoint</span>
                        <span className="font-mono text-xs bg-secondary px-1 py-0.5 rounded-sm">
                          GET /api/v1/tokens
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Description</span>
                        <span>Retrieve a list of tokens with basic information</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Parameters</span>
                        <span>
                          limit (int, optional): Number of results (default: 20, max: 100)
                          <br />
                          offset (int, optional): Pagination offset (default: 0)
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <p className="text-sm font-medium">Example Request:</p>
                      <pre className="bg-secondary p-3 rounded-sm text-xs overflow-x-auto">
                        <code>
                          {`curl -X GET "https://odin-smash-server.onrender.com/api/v1/tokens?limit=2" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                        </code>
                      </pre>
                    </div>
                    <div className="space-y-2 mt-2">
                      <p className="text-sm font-medium">Example Response:</p>
                      <pre className="bg-secondary p-3 rounded-sm text-xs overflow-x-auto">
                        <code>
                          {`{
  "tokens": [
    {
      "name": "ODIN",
      "status": "GOOD",
      "market_cap": "$70.4K",
      "holders": 12847,
      "volume_24h": "1.47 BTC",
      "change_24h": "+3061.1%"
    },
    {
      "name": "ODINFROG",
      "status": "WARNING",
      "market_cap": "$33.1K",
      "holders": 3912,
      "volume_24h": "0.114 BTC",
      "change_24h": "+1713.4%"
    }
  ],
  "total": 156,
  "limit": 2,
  "offset": 0
}`}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Search Tokens
                    </h3>
                    <div className="space-y-2">
                      <div className="data-row">
                        <span className="data-label">Endpoint</span>
                        <span className="font-mono text-xs bg-secondary px-1 py-0.5 rounded-sm">
                          GET /api/v1/tokens/search
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Description</span>
                        <span>Search for tokens by name or other criteria</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Parameters</span>
                        <span>
                          q (string): Search query
                          <br />
                          status (string, optional): Filter by status (GOOD, WARNING, BAD)
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <p className="text-sm font-medium">Example Request:</p>
                      <pre className="bg-secondary p-3 rounded-sm text-xs overflow-x-auto">
                        <code>
                          {`curl -X GET "https://odin-smash-server.onrender.com/api/v1/tokens/search?q=odin&status=GOOD" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Error Handling</h2>

                <div className="space-y-4">
                  <p className="text-sm">
                    The API uses standard HTTP status codes to indicate the success or failure of requests.
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Common Error Codes</h3>
                    <div className="space-y-2">
                      <div className="data-row">
                        <span className="data-label">400 Bad Request</span>
                        <span>Invalid request parameters</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">401 Unauthorized</span>
                        <span>Missing or invalid API key</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">403 Forbidden</span>
                        <span>Insufficient permissions</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">404 Not Found</span>
                        <span>Resource not found</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">429 Too Many Requests</span>
                        <span>Rate limit exceeded</span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">500 Internal Server Error</span>
                        <span>Server error</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Error Response Format</h3>
                    <pre className="bg-secondary p-3 rounded-sm text-xs overflow-x-auto">
                      <code>
                        {`{
  "error": {
    "code": "token_not_found",
    "message": "The requested token could not be found",
    "status": 404
  }
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* FAQ DOCUMENTATION */}
            <TabsContent value="faq" className="space-y-6">
              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Frequently Asked Questions</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      General Questions
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">What is ODINSMASH?</p>
                        <p className="text-sm text-muted-foreground">
                          ODINSMASH is a tool for analyzing Odin.fun tokens to assess their risk level and provide
                          detailed information about their metrics, liquidity, and market data. It helps users make more
                          informed decisions about tokens.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">How accurate is the token analysis?</p>
                        <p className="text-sm text-muted-foreground">
                          ODINSMASH uses multiple data points to analyze tokens, including contract code, liquidity
                          metrics, holder distribution, and trading patterns. While we strive for high accuracy, no
                          analysis tool can predict with 100% certainty. Always do your own research (DYOR) before
                          investing.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Is ODINSMASH free to use?</p>
                        <p className="text-sm text-muted-foreground">
                          Yes, the basic token analysis features on the website and browser extension are free to use.
                          We also offer premium features and API access for developers and professional users.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">How often is the token data updated?</p>
                        <p className="text-sm text-muted-foreground">
                          Token data is fetched in real-time when you check a token. The analysis reflects the current
                          state of the token at the time of checking. For the most up-to-date information, we recommend
                      re-checking tokens before making investment decisions.
                    </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Website Questions
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Do I need to connect my wallet to use ODINSMASH?</p>
                        <p className="text-sm text-muted-foreground">
                          No, ODINSMASH is a completely wallet-free tool. You can use all features without connecting any wallet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Extension Questions
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Does the extension collect my data?</p>
                        <p className="text-sm text-muted-foreground">
                          The ODINSMASH extension only stores your recent token checks locally in your browser. We do
                          not collect personal data or track your browsing history. The extension only accesses the
                          odin.fun domain to enhance your experience on that site.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Why does the extension need permissions?</p>
                        <p className="text-sm text-muted-foreground">
                          The extension requires minimal permissions to function: Storage (to save your recent token
                          checks), Active Tab (to add the "Check with ODINSMASH" button on token pages), and odin.fun
                          access (to interact with token pages on the Odin.fun website).
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Can I check tokens from other platforms?</p>
                        <p className="text-sm text-muted-foreground">
                          Currently, ODINSMASH only supports tokens listed on Odin.fun. We plan to expand support to
                          other platforms in future updates.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      API Questions
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">How do I get API access?</p>
                        <p className="text-sm text-muted-foreground">
                          To get API access, click the "Request API Access" button on the API documentation page and
                          fill out the request form. Our team will review your request and provide you with an API key
                          if approved.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">What are the API rate limits?</p>
                        <p className="text-sm text-muted-foreground">
                          The API has different rate limits depending on your tier: Free tier (100 requests per day),
                          Developer tier (1,000 requests per day), and Enterprise tier (custom limits). You can view
                          your current usage and limits in your developer dashboard.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Can I use the API in commercial applications?</p>
                        <p className="text-sm text-muted-foreground">
                          Yes, you can use the API in commercial applications with the appropriate tier. The Developer
                          and Enterprise tiers allow commercial use. Please review our terms of service for more
                          details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Troubleshooting</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Website Issues
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Token analysis not loading</p>
                        <ol className="space-y-1 pl-6 text-sm list-decimal">
                          <li>Check your internet connection</li>
                          <li>Try refreshing the page</li>
                          <li>Clear your browser cache and cookies</li>
                          <li>Try a different browser</li>
                        </ol>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Wallet connection issues</p>
                    <ol className="space-y-1 pl-6 text-sm list-decimal">
                          <li>Make sure your wallet extension is installed and up to date</li>
                          <li>Check if you're connected to the correct network</li>
                          <li>Try disconnecting and reconnecting your wallet</li>
                          <li>Restart your browser</li>
                    </ol>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      Extension Issues
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Extension not appearing in toolbar</p>
                        <ol className="space-y-1 pl-6 text-sm list-decimal">
                          <li>Click the puzzle piece icon in your browser toolbar</li>
                          <li>Find ODINSMASH in the dropdown list</li>
                          <li>Click the pin icon to pin it to your toolbar</li>
                        </ol>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">"Check with ODINSMASH" button not appearing</p>
                    <ol className="space-y-1 pl-6 text-sm list-decimal">
                      <li>Refresh the page</li>
                      <li>Check if the extension is enabled in your browser</li>
                      <li>Make sure you're on a token page (URL should contain "/token/")</li>
                    </ol>
                  </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Extension popup not opening</p>
                    <ol className="space-y-1 pl-6 text-sm list-decimal">
                      <li>Try restarting your browser</li>
                      <li>Disable and re-enable the extension</li>
                      <li>Check for browser updates</li>
                    </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="terminal-card p-6 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-4">Contact Us</h2>

                <div className="space-y-4">
                  <p className="text-sm">
                    Have questions or need support? Reach out to us through our official channels:
                  </p>

                  <div className="space-y-2">
                    <div className="data-row">
                      <span className="data-label">X (Twitter)</span>
                      <a 
                        href="https://x.com/odinsmash" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        @ODINSMASH
                      </a>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Telegram</span>
                      <a 
                        href="https://t.me/ODINSMASH" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        Join our Telegram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
              <a href="#" download>
                <Download className="h-4 w-4 mr-2" />
                Download Extension
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

