document.addEventListener("DOMContentLoaded", () => {
    // Initialize background canvas
    initBackgroundCanvas()
  
    // Tab switching
    const tabs = document.querySelectorAll(".tab")
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove active class from all tabs and content
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"))
        document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))
  
        // Add active class to clicked tab and corresponding content
        tab.classList.add("active")
        const tabName = tab.dataset.tab
        document.getElementById(`${tabName}-tab`).classList.add("active")
      })
    })
  
    // Token check form
    const checkForm = document.getElementById("check-form")
    checkForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const tokenUrl = document.getElementById("token-url").value
      checkToken(tokenUrl)
    })
  
    // Quick token buttons
    const tokenButtons = document.querySelectorAll(".token-item")
    tokenButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const token = button.dataset.token
        checkToken(`https://odin.fun/token/${token}`)
      })
    })
  
    // Back button in results
    const backButton = document.getElementById("back-button")
    backButton.addEventListener("click", () => {
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))
      document.getElementById("check-tab").classList.add("active")
  
      // Update active tab
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"))
      document.querySelector('[data-tab="check"]').classList.add("active")
    })
  
    // Share button
    const shareButton = document.getElementById("share-button")
    shareButton.addEventListener("click", () => {
      const tokenName = document.getElementById("token-name").textContent
      const tokenUrl = document.getElementById("view-website").href
  
      // Copy to clipboard
      navigator.clipboard.writeText(`Check out ${tokenName} on ODINCHECK: ${tokenUrl}`).then(() => {
        alert("Link copied to clipboard!")
      })
    })
  
    // Load recent checks
    loadRecentChecks()
  })
  
  function initBackgroundCanvas() {
    const canvas = document.getElementById("background-canvas")
    const ctx = canvas.getContext("2d")
  
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  
    // Create nodes for network visualization
    const nodeCount = 20
    const nodes = []
  
    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 1 + Math.random() * 1.5,
        speed: 0.1 + Math.random() * 0.2,
        direction: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        connections: [],
        opacity: 0.1 + Math.random() * 0.3,
      })
    }
  
    // Calculate connections between nodes
    const calculateConnections = () => {
      const connectionDistance = 100
  
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].connections = []
  
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue
  
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
  
          if (distance < connectionDistance) {
            nodes[i].connections.push(j)
          }
        }
      }
    }
  
    calculateConnections()
  
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
  
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#000000")
      gradient.addColorStop(0.5, "#0a0a0a")
      gradient.addColorStop(1, "#000000")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
  
      // Draw subtle grid
      ctx.strokeStyle = "rgba(50, 50, 50, 0.1)"
      ctx.lineWidth = 0.5
  
      const gridSize = 20
  
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
  
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
  
      // Draw connections between nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
  
        for (let j = 0; j < node.connections.length; j++) {
          const connectedNode = nodes[node.connections[j]]
  
          const dx = node.x - connectedNode.x
          const dy = node.y - connectedNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)
  
          // Opacity based on distance
          const opacity = 0.1 * (1 - distance / 100)
  
          ctx.strokeStyle = `rgba(184, 134, 11, ${opacity})`
          ctx.lineWidth = 0.5
  
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(connectedNode.x, connectedNode.y)
          ctx.stroke()
        }
      }
  
      // Draw and update nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
  
        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184, 134, 11, ${node.opacity})`
        ctx.fill()
  
        // Update position
        node.x += node.direction.x * node.speed
        node.y += node.direction.y * node.speed
  
        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) {
          node.direction.x *= -1
        }
  
        if (node.y < 0 || node.y > canvas.height) {
          node.direction.y *= -1
        }
      }
  
      // Occasionally recalculate connections
      if (Math.random() < 0.01) {
        calculateConnections()
      }
  
      requestAnimationFrame(animate)
    }
  
    animate()
  }
  
  function checkToken(tokenUrl) {
    // Extract token name from URL
    const tokenName = tokenUrl.split("/").pop()
  
    // Mock data based on token name
    let tokenData
  
    if (tokenName === "ODINFROG") {
      tokenData = {
        name: "ODINFROG",
        status: "WARNING",
        supply: "1B",
        marketCap: "$33.1K",
        holders: "3,912",
        lpLocked: "65.41%",
        markets: [
          { name: "Market 1", pair: "ODINFROG/SOL", liquidity: "$574,487" },
          { name: "Market 2", pair: "ODINFROG/USDC", liquidity: "$111,221" },
        ],
      }
    } else if (tokenName === "CATS") {
      tokenData = {
        name: "CATS",
        status: "GOOD",
        supply: "100M",
        marketCap: "$14.7K",
        holders: "30,615",
        lpLocked: "78.32%",
        markets: [
          { name: "Market 1", pair: "CATS/SOL", liquidity: "$574,487" },
          { name: "Market 2", pair: "CATS/USDC", liquidity: "$111,221" },
        ],
      }
    } else {
      tokenData = {
        name: tokenName || "ODIN",
        status: "GOOD",
        supply: "1T",
        marketCap: "$70.4K",
        holders: "12,847",
        lpLocked: "85.15%",
        markets: [
          { name: "Market 1", pair: "ODIN/SOL", liquidity: "$3,048,961" },
          { name: "Market 2", pair: "ODIN/USDC", liquidity: "$574,487" },
        ],
      }
    }
  
    // Update UI with token data
    document.getElementById("token-name").textContent = tokenData.name
    document.getElementById("risk-status").textContent = tokenData.status
    document.getElementById("risk-status").className = tokenData.status === "GOOD" ? "status-good" : "status-warning"
  
    document.getElementById("token-supply").textContent = tokenData.supply
    document.getElementById("token-mcap").textContent = tokenData.marketCap
    document.getElementById("token-holders").textContent = tokenData.holders
    document.getElementById("token-lp").textContent = tokenData.lpLocked
  
    // Update markets table
    const marketsTable = document.getElementById("markets-table")
    marketsTable.innerHTML = ""
  
    tokenData.markets.forEach((market) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${market.name}</td>
        <td>${market.pair}</td>
        <td>${market.liquidity}</td>
      `
      marketsTable.appendChild(row)
    })
  
    // Update view website link
    document.getElementById("view-website").href = tokenUrl
  
    // Save to recent checks
    saveRecentCheck(tokenData)
  
    // Show result tab
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))
    document.getElementById("result-tab").classList.add("active")
  }
  
  function saveRecentCheck(tokenData) {
    // Get existing recent checks from storage
    chrome.storage.local.get(["recentChecks"], (result) => {
      let recentChecks = result.recentChecks || []
  
      // Add new check to the beginning
      recentChecks.unshift({
        name: tokenData.name,
        status: tokenData.status,
        timestamp: new Date().toISOString(),
      })
  
      // Keep only the last 10 checks
      if (recentChecks.length > 10) {
        recentChecks = recentChecks.slice(0, 10)
      }
  
      // Save back to storage
      chrome.storage.local.set({ recentChecks: recentChecks }, () => {
        // Update recent checks list
        loadRecentChecks()
      })
    })
  }
  
  function loadRecentChecks() {
    const recentList = document.getElementById("recent-list")
  
    // Get recent checks from storage
    chrome.storage.local.get(["recentChecks"], (result) => {
      const recentChecks = result.recentChecks || []
  
      if (recentChecks.length === 0) {
        recentList.innerHTML = '<div class="empty-state">No recent checks</div>'
        return
      }
  
      recentList.innerHTML = ""
  
      recentChecks.forEach((check) => {
        const item = document.createElement("div")
        item.className = "recent-item"
  
        const date = new Date(check.timestamp)
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  
        item.innerHTML = `
          <div class="recent-item-name">${check.name}</div>
          <div class="recent-item-status ${check.status === "GOOD" ? "text-accent" : "text-primary"}">${check.status}</div>
        `
  
        item.addEventListener("click", () => {
          checkToken(`https://odin.fun/token/${check.name}`)
        })
  
        recentList.appendChild(item)
      })
    })
  }
  
  