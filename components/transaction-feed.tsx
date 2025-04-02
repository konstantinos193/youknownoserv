"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Code, RefreshCw } from "lucide-react"

interface Transaction {
  id: string
  token: string
  type: "buy" | "sell" | "deploy" | "transfer" | "update"
  amount?: string
  value?: string
  address: string
  time: string
}

interface TransactionFeedProps {
  type: 'whale' | 'dev'
  selectedToken?: string
}

export default function TransactionFeed({ type, selectedToken }: TransactionFeedProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedToken) {
        setTransactions([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        // Use the whale-activity endpoint instead
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whale-activity/${selectedToken}`)

        if (!response.ok) {
          throw new Error('Failed to fetch whale activity')
        }

        const data = await response.json()
        
        // Use the recentTrades from whale activity
        setTransactions(data.recentTrades || [])
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchTransactions, 30000)
    return () => clearInterval(interval)
  }, [selectedToken])

  const getTransactionIcon = (txType: string) => {
    switch (txType) {
      case "buy":
        return <ArrowUpRight className="h-4 w-4 text-accent" />
      case "sell":
        return <ArrowDownRight className="h-4 w-4 text-destructive" />
      case "deploy":
      case "update":
        return <Code className="h-4 w-4 text-primary" />
      case "transfer":
        return <ArrowDownRight className="h-4 w-4 text-primary" />
      default:
        return null
    }
  }

  const getTransactionTypeLabel = (txType: string) => {
    switch (txType) {
      case "buy":
        return (
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            Buy
          </Badge>
        )
      case "sell":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            Sell
          </Badge>
        )
      case "deploy":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Deploy
          </Badge>
        )
      case "update":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Update
          </Badge>
        )
      case "transfer":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Transfer
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-sm text-muted-foreground">Loading transactions...</span>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-sm text-muted-foreground">No recent transactions</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-sm"
        >
          <div className="flex flex-col">
            <span className="font-medium">{tx.user}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(tx.time).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className={tx.type === 'buy' ? 'text-accent' : 'text-destructive'}>
              {tx.type.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">
              {tx.amount.toFixed(3)} BTC
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

