"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, ArrowUpDown, ChevronRight, Info, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { API_ENDPOINTS } from "@/lib/config/api"
import { calculateRiskLevel } from "../utils/calculateRiskLevel"
import { fetchTokenHolders } from "../utils/api"
import type { Holder } from "../utils/api"
import { debounce } from "lodash"

interface Token {
  id: string
  name: string
  ticker: string
  price: number
  marketcap: number
  volume: number
  holder_count: number
  created_time: string
  creator: string
  total_supply: string
  creator_balance?: string
  website?: string
  twitter?: string
  telegram?: string
  creator_tokens_count?: number
  holders?: any[]
}

interface RiskAssessment {
  level: string
  color: string
  message: string
  warning: string
}

const formatPrice = (price: number): string => {
  // Convert to proper decimal form (e.g., 152000 -> 152.00)
  const properDecimal = price / 1000000; // Divide by 1M to get correct decimal places
  
  if (properDecimal >= 1000000) {
    return `$${(properDecimal / 1000000).toFixed(2)}M`;
  } else if (properDecimal >= 1000) {
    return `$${(properDecimal / 1000).toFixed(2)}K`;
  } else if (properDecimal >= 1) {
    return `$${properDecimal.toFixed(2)}`;
  } else if (properDecimal >= 0.01) {
    return `$${properDecimal.toFixed(2)}`;
  } else if (properDecimal >= 0.0001) {
    return `$${properDecimal.toFixed(5)}`;
  } else {
    return `$${properDecimal.toFixed(6)}`;
  }
};

type SortOption =
  | "newest"
  | "oldest"
  | "price_high"
  | "price_low"
  | "holders_high"
  | "holders_low"
  | "risk_high"
  | "risk_low"
type RiskFilter = "all" | "low" | "guarded" | "elevated" | "moderate" | "high" | "very_high" | "extreme"
type ViewMode = "grid" | "table" | "compact"

// Token image component with error handling
const TokenImage = ({ tokenId, name, size = "md" }: { tokenId: string; name: string; size?: "sm" | "md" | "lg" }) => {
  const [imgError, setImgError] = useState(false)
  const imageUrl = `https://images.odin.fun/token/${tokenId}`
  const placeholderUrl = "/placeholder.svg?height=48&width=48"

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <img
      src={imgError ? placeholderUrl : imageUrl}
      alt={name || "Token"}
      onError={() => setImgError(true)}
      className={`${sizeClasses[size]} rounded-lg object-cover`}
    />
  )
}

// Risk badge component
const RiskBadge = ({ level, color }: { level: string; color: string }) => {
  const getIcon = () => {
    if (level.includes("SAFE")) return <CheckCircle2 className="h-3 w-3 mr-1" />
    if (level.includes("EXTREME")) return <AlertTriangle className="h-3 w-3 mr-1" />
    return <Info className="h-3 w-3 mr-1" />
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color} bg-black/30`}>
      {getIcon()}
      {level}
    </div>
  )
}

// Grid view token card
const TokenGridCard = ({ token }: { token: Token }) => {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatedHolderCount, setValidatedHolderCount] = useState(token.holder_count);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch holders data
        const holdersData = await fetchTokenHolders(token.id, token.creator);
        // Extract holders array from the response structure
        const holdersArray = holdersData[token.id]?.holders || [];
        setHolders(holdersArray);

        // Validate and update holder count
        const actualHolderCount = holdersArray.filter((h: Holder) => Number(h.balance) > 0).length;
        setValidatedHolderCount(actualHolderCount);

        // Use shared risk assessment
        const riskAssessment = calculateRiskLevel(token, holdersArray, actualHolderCount);
        setRisk(riskAssessment);
      } catch (error) {
        console.error('Error loading token data:', error);
        setRisk({
          level: "ERROR",
          color: "text-red-600",
          message: "Error loading data",
          warning: "Error calculating risk level"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [token]);

  return (
    <Card className="bg-gray-900/80 border-cyan-600/20 overflow-hidden">
      <div className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <TokenImage tokenId={token.id} name={token.name} />
              <div>
                <CardTitle className="text-yellow-300 truncate max-w-[150px]">{token.name}</CardTitle>
                <CardDescription className="text-cyan-400/70">{token.ticker}</CardDescription>
              </div>
            </div>
            <RiskBadge level={risk?.level || "Loading"} color={risk?.color || "text-cyan-400"} />
          </div>
        </CardHeader>

        <CardContent className="pb-2 flex-grow">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-cyan-400/70">Price:</div>
            <div className="text-yellow-300 font-medium text-right">{formatPrice(token.price)}</div>

            <div className="text-cyan-400/70">Holders:</div>
            <div className="text-yellow-300 text-right">{validatedHolderCount}</div>
          </div>

          <div className="mt-3 text-xs text-cyan-400/50">{risk?.warning}</div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-cyan-600/10">
          <div className="flex justify-between items-center w-full">
            <div className="text-xs text-cyan-400/50">{new Date(token.created_time).toLocaleDateString()}</div>
            <Link 
              href={`/results?search=${token.id}`}
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1 rounded-md hover:bg-cyan-950/30"
            >
              View <ChevronRight className="ml-1 h-3 w-3 inline" />
            </Link>
          </div>
        </CardFooter>
      </div>
    </Card>
  )
}

// Table row for token
const TokenTableRow = ({ token }: { token: Token }) => {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatedHolderCount, setValidatedHolderCount] = useState(token.holder_count);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch holders data
        const holdersData = await fetchTokenHolders(token.id, token.creator);
        // Extract holders array from the response structure
        const holdersArray = holdersData[token.id]?.holders || [];
        setHolders(holdersArray);

        // Validate and update holder count
        const actualHolderCount = holdersArray.filter((h: Holder) => Number(h.balance) > 0).length;
        setValidatedHolderCount(actualHolderCount);

        // Use shared risk assessment
        const riskAssessment = calculateRiskLevel(token, holdersArray, actualHolderCount);
        setRisk(riskAssessment);
      } catch (error) {
        console.error('Error loading token data:', error);
        setRisk({
          level: "ERROR",
          color: "text-red-600",
          message: "Error loading data",
          warning: "Error calculating risk level"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [token]);

  return (
    <tr className="border-b border-cyan-600/10">
      <td className="py-3 pl-4">
        <div className="flex items-center gap-3">
          <TokenImage tokenId={token.id} name={token.name} size="sm" />
          <div>
            <div className="font-medium text-yellow-300 truncate max-w-[120px]">{token.name}</div>
            <div className="text-xs text-cyan-400/70">{token.ticker}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-2">
        <RiskBadge level={risk?.level || "Loading"} color={risk?.color || "text-cyan-400"} />
      </td>
      <td className="py-3 px-2 text-right text-yellow-300">{formatPrice(token.price)}</td>
      <td className="py-3 px-2 text-right text-yellow-300">{validatedHolderCount}</td>
      <td className="py-3 pr-4 text-right">
        <Link 
          href={`/results?search=${token.id}`}
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1 rounded-md hover:bg-cyan-950/30"
        >
          View <ChevronRight className="ml-1 h-3 w-3 inline" />
        </Link>
      </td>
    </tr>
  )
}

// Compact view token item
const TokenCompactItem = ({ token }: { token: Token }) => {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatedHolderCount, setValidatedHolderCount] = useState(token.holder_count);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch holders data
        const holdersData = await fetchTokenHolders(token.id, token.creator);
        // Extract holders array from the response structure
        const holdersArray = holdersData[token.id]?.holders || [];
        setHolders(holdersArray);

        // Validate and update holder count
        const actualHolderCount = holdersArray.filter((h: Holder) => Number(h.balance) > 0).length;
        setValidatedHolderCount(actualHolderCount);

        // Use shared risk assessment
        const riskAssessment = calculateRiskLevel(token, holdersArray, actualHolderCount);
        setRisk(riskAssessment);
      } catch (error) {
        console.error('Error loading token data:', error);
        setRisk({
          level: "ERROR",
          color: "text-red-600",
          message: "Error loading data",
          warning: "Error calculating risk level"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [token]);

  return (
    <div className="flex items-center justify-between p-3 border-b border-cyan-600/10">
      <div className="flex items-center gap-3">
        <TokenImage tokenId={token.id} name={token.name} size="sm" />
        <div>
          <div className="font-medium text-yellow-300 truncate max-w-[150px]">
            {token.name} <span className="text-cyan-400/70 text-xs">({token.ticker})</span>
          </div>
          <div className="text-xs text-cyan-400/50">{validatedHolderCount} holders</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-medium text-yellow-300">{formatPrice(token.price)}</div>
          <RiskBadge level={risk?.level || "Loading"} color={risk?.color || "text-cyan-400"} />
        </div>
        <Link 
          href={`/results?search=${token.id}`}
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1 rounded-md hover:bg-cyan-950/30"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

// Token list skeleton for loading state
const TokenListSkeleton = ({ viewMode }: { viewMode: ViewMode }) => {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-gray-900/50 border-cyan-600/10 animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-800"></div>
                  <div>
                    <div className="h-5 w-24 bg-gray-800 rounded"></div>
                    <div className="h-3 w-16 bg-gray-800 rounded mt-1"></div>
                  </div>
                </div>
                <div className="h-5 w-20 bg-gray-800 rounded"></div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="h-3 w-16 bg-gray-800 rounded"></div>
                <div className="h-3 w-16 bg-gray-800 rounded ml-auto"></div>
                <div className="h-3 w-16 bg-gray-800 rounded"></div>
                <div className="h-3 w-16 bg-gray-800 rounded ml-auto"></div>
              </div>
              <div className="mt-3 h-3 w-full bg-gray-800 rounded"></div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between items-center border-t border-cyan-600/10">
              <div className="h-3 w-20 bg-gray-800 rounded"></div>
              <div className="h-5 w-16 bg-gray-800 rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (viewMode === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cyan-600/20">
              <th className="text-left py-3 pl-4 text-cyan-400">Token</th>
              <th className="text-left py-3 px-2 text-cyan-400">Risk</th>
              <th className="text-right py-3 px-2 text-cyan-400">Price</th>
              <th className="text-right py-3 px-2 text-cyan-400">Holders</th>
              <th className="text-right py-3 pr-4 text-cyan-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-cyan-600/10 animate-pulse">
                <td className="py-3 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-800"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-800 rounded"></div>
                      <div className="h-3 w-16 bg-gray-800 rounded mt-1"></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="h-5 w-20 bg-gray-800 rounded"></div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="h-4 w-16 bg-gray-800 rounded ml-auto"></div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="h-4 w-12 bg-gray-800 rounded ml-auto"></div>
                </td>
                <td className="py-3 pr-4 text-right">
                  <div className="h-5 w-16 bg-gray-800 rounded ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Compact view skeleton
  return (
    <div className="space-y-0 border-t border-cyan-600/10">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border-b border-cyan-600/10 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800"></div>
            <div>
              <div className="h-4 w-32 bg-gray-800 rounded"></div>
              <div className="h-3 w-24 bg-gray-800 rounded mt-1"></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="h-4 w-16 bg-gray-800 rounded ml-auto"></div>
              <div className="h-3 w-20 bg-gray-800 rounded mt-1 ml-auto"></div>
            </div>
            <div className="h-4 w-4 rounded-full bg-gray-800"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Mobile filter sheet component
const MobileFilterSheet = ({
  riskFilter,
  setRiskFilter,
  sortBy,
  setSortBy,
}: {
  riskFilter: RiskFilter
  setRiskFilter: (filter: RiskFilter) => void
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 border-cyan-600/30 text-cyan-400 bg-black/50">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-gray-900 border-t border-cyan-600/30 rounded-t-xl p-0">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-yellow-300 mb-4">Filter Options</h3>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-cyan-400 mb-2">Risk Level</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "all", label: "All Risks" },
                { value: "low", label: "Low Risk" },
                { value: "guarded", label: "Guarded Risk" },
                { value: "elevated", label: "Elevated Risk" },
                { value: "moderate", label: "Moderate Risk" },
                { value: "high", label: "High Risk" },
                { value: "very_high", label: "Very High Risk" },
                { value: "extreme", label: "Extreme Risk" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  className={`justify-start ${
                    riskFilter === option.value
                      ? "bg-cyan-900/30 text-cyan-300 border-cyan-500/50"
                      : "text-cyan-400/70 border-cyan-600/20"
                  }`}
                  onClick={() => setRiskFilter(option.value as RiskFilter)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-cyan-400 mb-2">Sort By</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "price_high", label: "Highest Price" },
                { value: "price_low", label: "Lowest Price" },
                { value: "holders_high", label: "Most Holders" },
                { value: "holders_low", label: "Least Holders" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  className={`justify-start ${
                    sortBy === option.value
                      ? "bg-cyan-900/30 text-cyan-300 border-cyan-500/50"
                      : "text-cyan-400/70 border-cyan-600/20"
                  }`}
                  onClick={() => setSortBy(option.value as SortOption)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Add chunk size constant
const CHUNK_SIZE = 20; // Number of tokens to load at a time

// Add this helper function near the top with other helpers
const validateHolderCount = (token: Token): number => {
  // If holder_count is 0 or undefined, try to get it from holders array
  if (!token.holder_count && token.holders) {
    return token.holders.filter(h => Number(h.balance) > 0).length;
  }
  return token.holder_count || 0;
};

// Update the footer section to use client-side time formatting
const TokenListFooter = () => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Set time only on client side to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  return (
    <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-cyan-400/50">
      {currentTime && <span className="ml-2">Updated {currentTime}</span>}
    </div>
  );
};

// Add loading skeleton for filtered results
const FilteredTokensSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-gray-900/50 border border-cyan-600/10 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-800/50 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-5 w-32 bg-gray-800/50 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-800/50 rounded"></div>
          </div>
          <div className="text-right">
            <div className="h-5 w-20 bg-gray-800/50 rounded mb-1"></div>
            <div className="h-4 w-16 bg-gray-800/50 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [initialLoad, setInitialLoad] = useState(true)
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  const [hideHighRisk, setHideHighRisk] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  const [windowSize, setWindowSize] = useState(50); // Initial load size
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerTarget = useRef(null);

  // Check if we're on mobile
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Filter and sort tokens
  const filterAndSortTokens = useCallback(() => {
    if (!tokens.length) return [];
    
    // Only filter currently visible tokens
    let result = tokens.slice(0, windowSize);

    // Apply search filter first (most restrictive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(token => 
        token.name.toLowerCase().includes(query) ||
        token.ticker.toLowerCase().includes(query) ||
        token.id.toLowerCase().includes(query)
      );
    }

    // Apply risk filter if needed
    if (riskFilter !== "all") {
      result = result.filter(token => {
        const risk = calculateRiskLevel(token);
        return risk.level.toLowerCase().includes(riskFilter.toLowerCase());
      });
    }

    // Apply high risk filter last
    if (hideHighRisk) {
      result = result.filter((token) => {
        const risk = calculateRiskLevel(token);
        return !["EXTREME RISK", "VERY HIGH RISK"].includes(risk.level);
      });
    }

    // Apply sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_time).getTime() - new Date(b.created_time).getTime();
        case "price_high":
          return (b.price || 0) - (a.price || 0);
        case "price_low":
          return (a.price || 0) - (b.price || 0);
        case "holders_high":
          return (b.holder_count || 0) - (a.holder_count || 0);
        case "holders_low":
          return (a.holder_count || 0) - (b.holder_count || 0);
        case "newest":
        default:
          return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
      }
    });
  }, [tokens, windowSize, searchQuery, riskFilter, hideHighRisk, sortBy]);

  // Add debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setIsFilterLoading(true);
      setSearchQuery(query);
      setTimeout(() => {
        setFilteredTokens(filterAndSortTokens());
        setIsFilterLoading(false);
      }, 100);
    }, 300),
    [filterAndSortTokens]
  );

  // Update the search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    // Show loading state immediately
    setIsFilterLoading(true);
    // Debounce the actual filtering
    debouncedSearch(query);
  };

  // Load tokens on component mount
  useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('http://deape.ddns.net:3001/api/all-tokens', {
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }

        const result = await response.json();
        
        if (result && Array.isArray(result.data)) {
          // Sort by newest first
          const allTokens = result.data
            .sort((a: Token, b: Token) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())
            .map((token: any) => ({
              id: token.id,
              name: token.name || '',
              ticker: token.ticker || '',
              creator: token.creator || '',
              created_time: token.created_time || new Date().toISOString(),
              price: Number(token.price || 0),
              marketcap: Number(token.marketcap) || 0,
              total_supply: token.total_supply || '0',
              holder_count: token.holder_count || token.holders || 0,
              volume: Number(token.volume) || 0,
              creator_balance: token.creator_balance || '0',
              website: token.website || '',
              twitter: token.twitter || '',
              telegram: token.telegram || '',
              creator_tokens_count: token.creator_tokens_count || 0
            }));

          // Store all tokens but only show first chunk
          setTokens(allTokens);
          setFilteredTokens(allTokens.slice(0, CHUNK_SIZE));
          setWindowSize(CHUNK_SIZE);
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
        setError('Failed to load tokens. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTokens();

    // Refresh tokens every 30 seconds
    const interval = setInterval(loadTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
        !isLoadingMore &&
        filteredTokens.length < tokens.length
      ) {
        setIsLoadingMore(true);
        
        // Add delay to prevent rapid loading
        setTimeout(() => {
          const nextChunkSize = windowSize + CHUNK_SIZE;
          setWindowSize(nextChunkSize);
          setFilteredTokens(tokens.slice(0, nextChunkSize));
          setIsLoadingMore(false);
        }, 300);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [windowSize, tokens, filteredTokens.length, isLoadingMore]);

  // Render token list based on view mode
  const renderTokenList = () => {
    if (loading && initialLoad) {
      return <TokenListSkeleton viewMode={viewMode} />;
    }

    if (error) {
      return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    // Show filtered loading state
    if (isFilterLoading) {
      return <FilteredTokensSkeleton />;
    }

    if (filteredTokens.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-cyan-400 mb-2">No tokens found</div>
          <div className="text-cyan-400/50 text-sm">
            Try adjusting your filters or search query
          </div>
        </div>
      );
    }

    return (
      <>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTokens.map((token) => (
              <TokenGridCard key={token.id} token={token} />
            ))}
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-600/20">
                  <th className="text-left py-3 pl-4 text-cyan-400">Token</th>
                  <th className="text-left py-3 px-2 text-cyan-400">Risk</th>
                  <th className="text-right py-3 px-2 text-cyan-400">Price</th>
                  <th className="text-right py-3 px-2 text-cyan-400">Holders</th>
                  <th className="text-right py-3 pr-4 text-cyan-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map((token) => (
                  <TokenTableRow key={token.id} token={token} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-0 border-t border-cyan-600/10">
            {filteredTokens.map((token) => (
              <TokenCompactItem key={token.id} token={token} />
            ))}
          </div>
        )}
        
        {/* Infinite scroll trigger */}
        {filteredTokens.length < tokens.length && !isFilterLoading && (
          <div 
            ref={observerTarget}
            className="py-4 text-center text-cyan-400/50 text-sm"
          >
            {isLoadingMore ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></div>
              </div>
            ) : (
              "Scroll for more"
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen w-full bg-black">
      {/* Background elements */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-cyan-950/10 to-gray-900 z-0"></div>
      <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-cyan-400/5 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-1/2 h-64 bg-yellow-300/5 blur-3xl rounded-full"></div>

      {/* Norse-inspired decorative elements */}
      <div className="fixed top-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"></div>
      <div className="fixed bottom-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent"></div>

      {/* Animated runes - hidden on small screens */}
      <div className="fixed top-1/4 left-10 text-4xl text-cyan-400/10 animate-pulse hidden sm:block">ᚨ</div>
      <div
        className="fixed top-1/3 right-10 text-4xl text-yellow-300/10 animate-pulse hidden sm:block"
        style={{ animationDelay: "1s" }}
      >
        ᚱ
      </div>
      <div
        className="fixed bottom-1/4 left-20 text-4xl text-cyan-400/10 animate-pulse hidden sm:block"
        style={{ animationDelay: "1.5s" }}
      >
        ᚦ
      </div>
      <div
        className="fixed bottom-1/3 right-20 text-4xl text-yellow-300/10 animate-pulse hidden sm:block"
        style={{ animationDelay: "0.5s" }}
      >
        ᚷ
      </div>

      {/* Main content */}
      <div className="container px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header with logo and title */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center">
              <Image
                src="https://i.postimg.cc/pTvbWnHN/image-removebg-preview.png"
                alt="ODINSCAN Logo"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3"
              />
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold text-yellow-300">ODINSCAN</h1>
                <div className="text-[10px] sm:text-xs text-cyan-400">Token Explorer</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size={isMobile ? "sm" : "default"} className="bg-cyan-500 hover:bg-cyan-600 text-black">
                <Link href="/">Analyze</Link>
              </Button>

              {!isMobile && (
                <div className="flex border border-cyan-600/30 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none ${viewMode === "grid" ? "bg-cyan-900/30 text-cyan-300" : "text-cyan-500"}`}
                    onClick={() => {
                      setViewMode("grid")
                      // Add visual feedback
                      setFilteredTokens([])
                      setTimeout(() => setFilteredTokens(filterAndSortTokens()), 100)
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-grid-2x2"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 12h18" />
                      <path d="M12 3v18" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none ${viewMode === "table" ? "bg-cyan-900/30 text-cyan-300" : "text-cyan-500"}`}
                    onClick={() => {
                      setViewMode("table")
                      // Add visual feedback
                      setFilteredTokens([])
                      setTimeout(() => setFilteredTokens(filterAndSortTokens()), 100)
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-table"
                    >
                      <path d="M12 3v18" />
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M3 15h18" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none ${viewMode === "compact" ? "bg-cyan-900/30 text-cyan-300" : "text-cyan-500"}`}
                    onClick={() => {
                      setViewMode("compact")
                      // Add visual feedback
                      setFilteredTokens([])
                      setTimeout(() => setFilteredTokens(filterAndSortTokens()), 100)
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-list"
                    >
                      <line x1="8" x2="21" y1="6" y2="6" />
                      <line x1="8" x2="21" y1="12" y2="12" />
                      <line x1="8" x2="21" y1="18" y2="18" />
                      <line x1="3" x2="3.01" y1="6" y2="6" />
                      <line x1="3" x2="3.01" y1="12" y2="12" />
                      <line x1="3" x2="3.01" y1="18" y2="18" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Search and filter bar */}
          <div className="bg-gray-900/50 border border-cyan-600/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-cyan-400/50" />
                </div>
                <Input
                  placeholder="Search tokens..."
                  className="pl-10 bg-black/50 border-cyan-600/30 focus:border-cyan-400 text-yellow-300 placeholder:text-cyan-400/50"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex gap-2">
                {/* Add the toggle button */}
                <Button
                  variant="outline"
                  className={`gap-2 border-cyan-600/30 ${
                    hideHighRisk ? "bg-cyan-900/30 text-cyan-300" : "text-cyan-400"
                  }`}
                  onClick={() => setHideHighRisk(!hideHighRisk)}
                >
                  <AlertTriangle className="h-4 w-4" />
                  {hideHighRisk ? "Show All" : "Hide High Risk"}
                </Button>

                {isMobile ? (
                  <MobileFilterSheet
                    riskFilter={riskFilter}
                    setRiskFilter={setRiskFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
                ) : (
                  <>
                    {/* Risk Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 border-cyan-600/30 text-cyan-400 bg-black/50">
                          <Filter className="h-4 w-4" />
                          {riskFilter === "all"
                            ? "All Risks"
                            : `${riskFilter
                                .split("_")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")} Risk`}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border border-cyan-600/30">
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setRiskFilter("all");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          All Risks
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setRiskFilter("low");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Low Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setRiskFilter("guarded");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Guarded Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setRiskFilter("elevated");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Elevated Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setRiskFilter("moderate");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Moderate Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setRiskFilter("high");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          High Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setRiskFilter("very_high");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Very High Risk
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setRiskFilter("extreme");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Extreme Risk
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 border-cyan-600/30 text-cyan-400 bg-black/50">
                          <ArrowUpDown className="h-4 w-4" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border border-cyan-600/30">
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setSortBy("newest");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Newest First
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setSortBy("oldest");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Oldest First
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setSortBy("price_high");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Highest Price
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setSortBy("price_low");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Lowest Price
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setSortBy("holders_high");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Most Holders
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setIsFilterLoading(true);
                            setSortBy("holders_low");
                          }}
                          className="hover:bg-gray-800 focus:bg-gray-800 text-cyan-400"
                        >
                          Least Holders
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs for quick filtering - scrollable on mobile */}
          <div className="overflow-x-auto pb-2 mb-4 sm:mb-6">
            <Tabs
              defaultValue="all"
              onValueChange={(value) => {
                setIsFilterLoading(true);
                setActiveTab(value);
              }}
            >
              <TabsList className="bg-gray-900/50 border border-cyan-600/20 w-full sm:w-auto">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 text-cyan-400/70 flex-1 sm:flex-none"
                >
                  All Tokens
                </TabsTrigger>
                <TabsTrigger
                  value="safe"
                  className="data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 text-cyan-400/70 flex-1 sm:flex-none"
                >
                  Safe (Low/Guarded)
                </TabsTrigger>
                <TabsTrigger
                  value="risky"
                  className="data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 text-cyan-400/70 flex-1 sm:flex-none"
                >
                  Risky (Elevated-High)
                </TabsTrigger>
                <TabsTrigger
                  value="extreme"
                  className="data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 text-cyan-400/70 flex-1 sm:flex-none"
                >
                  Extreme Risk
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Mobile view mode selector */}
          {isMobile && (
            <div className="flex border border-cyan-600/30 rounded-lg overflow-hidden mb-4">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-none flex-1 ${viewMode === "grid" ? "bg-cyan-900/30 text-cyan-300" : "text-cyan-500"}`}
                onClick={() => {
                  setViewMode("grid")
                  setFilteredTokens([])
                  setTimeout(() => setFilteredTokens(filterAndSortTokens()), 100)
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-grid-2x2 mr-1"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 12h18" />
                  <path d="M12 3v18" />
                </svg>
                Grid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-none flex-1 ${viewMode === "table" ? "bg-cyan-900/30 text-cyan-300" : "text-cyan-500"}`}
                onClick={() => {
                  setViewMode("table")
                  setFilteredTokens([])
                  setTimeout(() => setFilteredTokens(filterAndSortTokens()), 100)
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-table mr-1"
                >
                  <path d="M12 3v18" />
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                </svg>
                Table
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-none flex-1 ${viewMode === "compact" ? "bg-cyan-900/30 text-cyan-300" : "text-cyan-500"}`}
                onClick={() => {
                  setViewMode("compact")
                  setFilteredTokens([])
                  setTimeout(() => setFilteredTokens(filterAndSortTokens()), 100)
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-list mr-1"
                >
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
                List
              </Button>
            </div>
          )}

          {/* Token list */}
          <div className="bg-gray-900/50 border border-cyan-600/20 rounded-lg p-3 sm:p-4">{renderTokenList()}</div>

          {/* Footer with stats */}
          <TokenListFooter />
        </div>
      </div>
    </div>
  )
}
