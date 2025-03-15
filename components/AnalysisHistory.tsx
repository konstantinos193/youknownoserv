'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface AnalysisHistory {
  id: string;
  name: string;
  ticker: string;
  timestamp: number;
  riskLevel: string;
  warnings: number;
}

export function AnalysisHistory() {
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisHistory | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'down' | 'up'>('loading');

  useEffect(() => {
    // Initial load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lastAnalysis');
      if (stored) {
        try {
          setLastAnalysis(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing analysis:', e);
        }
      }
    }

    // Listen for updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastAnalysis' && e.newValue) {
        try {
          setLastAnalysis(JSON.parse(e.newValue));
        } catch (e) {
          console.error('Error parsing analysis:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Check if API is up
    const checkApi = async () => {
      try {
        const response = await fetch('https://api.odin.fun/v1/token/2agw');
        if (response.ok) {
          setApiStatus('up');
        } else {
          setApiStatus('down');
        }
      } catch (error) {
        setApiStatus('down');
      }
    };

    checkApi();
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Last Analysis</h3>
      <div className="space-y-1">
        {apiStatus === 'down' ? (
          <div className="text-center text-sm text-red-500 py-4">
            Odin.fun API is currently unavailable. Please try again later.
          </div>
        ) : lastAnalysis ? (
          <Link
            href={`/results?search=${lastAnalysis.id}`}
            className="data-row hover:bg-secondary/50 flex items-center justify-between p-3"
          >
            <div className="flex flex-col">
              <span className="font-medium">{lastAnalysis.name} ({lastAnalysis.ticker})</span>
              <span className="text-xs text-muted-foreground">
                {new Date(lastAnalysis.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-2 py-0.5 text-xs rounded
                  ${lastAnalysis.riskLevel.includes("LOW") ? "text-green-500" : 
                    lastAnalysis.riskLevel.includes("MEDIUM") ? "text-yellow-500" : "text-red-500"}`}
              >
                {lastAnalysis.riskLevel}
              </span>
              {lastAnalysis.warnings > 0 && (
                <span className="text-xs text-muted-foreground">
                  {lastAnalysis.warnings} warning{lastAnalysis.warnings > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </Link>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-4">
            No recent analyses. Try analyzing a token above!
          </div>
        )}
      </div>
    </div>
  );
} 