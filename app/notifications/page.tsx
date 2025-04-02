import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Info, Settings, Plus, Trash2 } from "lucide-react"
import AdContainer from "@/components/ad-container"

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border bg-black/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold">
              ODINCHECK
            </Link>
            <nav className="flex items-center space-x-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                HOME
              </Link>
              <Link href="/tokens" className="text-muted-foreground hover:text-foreground">
                TOKENS
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                DASHBOARD
              </Link>
              <Link href="/verify" className="text-muted-foreground hover:text-foreground">
                VERIFY
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                DOCS
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-primary" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            </Button>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="md:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Notification Settings</h1>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create New Alert
              </Button>
            </div>

            <div className="terminal-card p-6 backdrop-blur-sm">
              <h2 className="text-lg font-medium mb-4">Notification Channels</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Web Push Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications in your browser even when you're not on the site
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="web-push" />
                    <Label htmlFor="web-push">Enabled</Label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <p className="text-xs text-muted-foreground">Receive email alerts for important events</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="email" />
                    <Label htmlFor="email">Enabled</Label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Telegram Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Connect your Telegram account to receive instant alerts
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Discord Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Connect your Discord account or webhook to receive alerts
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                </div>
              </div>
            </div>

            <div className="terminal-card p-6 backdrop-blur-sm">
              <h2 className="text-lg font-medium mb-4">Alert Rules</h2>

              <div className="space-y-4">
                {/* Whale Activity Alert */}
                <div className="border border-border rounded-sm p-4 bg-secondary/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Whale Activity Alert</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Get notified when whales make significant moves with your tracked tokens
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Tokens:</span>
                      <span className="text-xs font-medium">ODIN, ODINFROG, CATS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Threshold:</span>
                      <span className="text-xs font-medium">Transactions &gt; 50 ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Notification Channels:</span>
                      <span className="text-xs font-medium">Web Push, Email</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Status:</span>
                      <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-sm">Active</span>
                    </div>
                  </div>
                </div>

                {/* Price Movement Alert */}
                <div className="border border-border rounded-sm p-4 bg-secondary/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Price Movement Alert</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Get notified when token prices change significantly
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Tokens:</span>
                      <span className="text-xs font-medium">ODIN, BUILDER</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Threshold:</span>
                      <span className="text-xs font-medium">Price change > 15% in 1h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Notification Channels:</span>
                      <span className="text-xs font-medium">Web Push, Telegram</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Status:</span>
                      <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-sm">Active</span>
                    </div>
                  </div>
                </div>

                {/* Dev Activity Alert */}
                <div className="border border-border rounded-sm p-4 bg-secondary/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Dev Activity Alert</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Get notified when developers make changes to token contracts
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Tokens:</span>
                      <span className="text-xs font-medium">All tracked tokens</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Events:</span>
                      <span className="text-xs font-medium">Contract updates, Large transfers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Notification Channels:</span>
                      <span className="text-xs font-medium">Web Push, Email, Telegram</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Status:</span>
                      <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-sm">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Alert
                </Button>
              </div>
            </div>

            <div className="terminal-card p-6 backdrop-blur-sm">
              <h2 className="text-lg font-medium mb-4">Create Custom Alert</h2>

              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-name">Alert Name</Label>
                  <Input id="alert-name" placeholder="My Custom Alert" className="bg-secondary border-border" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokens">Tokens to Track</Label>
                  <Input id="tokens" placeholder="ODIN, ODINFROG, CATS" className="bg-secondary border-border" />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of tokens, or "All" for all tokens
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Alert Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" className="justify-start">
                      Whale Activity
                    </Button>
                    <Button type="button" variant="outline" className="justify-start">
                      Price Movement
                    </Button>
                    <Button type="button" variant="outline" className="justify-start">
                      Dev Activity
                    </Button>
                    <Button type="button" variant="outline" className="justify-start">
                      Liquidity Change
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Alert Condition</Label>
                  <Textarea
                    id="condition"
                    placeholder="e.g., Notify me when a whale sells >100 ETH of $TOKEN"
                    className="bg-secondary border-border min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notification Channels</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="channel-web" />
                      <Label htmlFor="channel-web">Web Push</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="channel-email" />
                      <Label htmlFor="channel-email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="channel-telegram" />
                      <Label htmlFor="channel-telegram">Telegram</Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                  Create Alert
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar with ads */}
          <div className="md:col-span-1">
            <div className="sticky top-20 space-y-6">
              <AdContainer position="sidebar" maxAds={2} />

              <div className="terminal-card p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Notification Tips</h3>
                </div>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <p>Set up alerts for tokens you're actively tracking to stay informed about important events.</p>
                  <p>
                    Combine different notification channels for critical alerts to ensure you never miss important
                    movements.
                  </p>
                  <p>Use specific thresholds to reduce notification noise and focus on significant events.</p>
                </div>
              </div>

              <div className="terminal-card p-4 backdrop-blur-sm">
                <h3 className="text-sm font-medium mb-3">Recent Notifications</h3>
                <div className="space-y-2">
                  {[
                    { token: "ODIN", message: "Whale sold 78 ETH worth of tokens", time: "2h ago" },
                    { token: "ODINFROG", message: "New contract deployment detected", time: "6h ago" },
                    { token: "CATS", message: "Price dropped 15% in the last hour", time: "1d ago" },
                  ].map((notification, index) => (
                    <div key={index} className="text-xs border-b border-border pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{notification.token}</span>
                        <span className="text-muted-foreground">{notification.time}</span>
                      </div>
                      <p className="mt-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

