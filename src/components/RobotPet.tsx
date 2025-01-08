'use client'
import React, { useState, useEffect } from 'react'

interface Resource {
  name: string
  amount: number
}

interface Mission {
  name: string
  energyCost: number
  happinessCost: number
  duration: number
  rewards: Resource[]
  requiredBatteryLevel: number
}

interface Upgrade {
  name: string
  cost: Resource[]
  applied: boolean
  effect: string
}

const RobotPet = () => {
  const [cursorVisible, setCursorVisible] = useState(true)
  const [energy, setEnergy] = useState(100)
  const [happiness, setHappiness] = useState(100)
  const [lastInteraction, setLastInteraction] = useState('')
  const [resources, setResources] = useState<Resource[]>([
    { name: 'bolts', amount: 0 },
    { name: 'magnets', amount: 0 },
    { name: 'wires', amount: 0 }
  ])
  const [isOnMission, setIsOnMission] = useState(false)
  const [missionTimer, setMissionTimer] = useState<number | null>(null)
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      name: 'Battery Boost',
      cost: [{ name: 'magnets', amount: 3 }, { name: 'wires', amount: 2 }],
      applied: false,
      effect: 'Increases energy gain from charging'
    },
    {
      name: 'Happy Circuits',
      cost: [{ name: 'bolts', amount: 4 }, { name: 'wires', amount: 3 }],
      applied: false,
      effect: 'Reduces happiness loss from missions'
    }
  ])

  const missions: Mission[] = [
    {
      name: 'Scrap Yard Search',
      energyCost: 20,
      happinessCost: 10,
      duration: 10,
      requiredBatteryLevel: 30,
      rewards: [
        { name: 'bolts', amount: 2 },
        { name: 'wires', amount: 1 }
      ]
    },
    {
      name: 'Factory Exploration',
      energyCost: 40,
      happinessCost: 20,
      duration: 20,
      requiredBatteryLevel: 50,
      rewards: [
        { name: 'magnets', amount: 2 },
        { name: 'wires', amount: 2 },
        { name: 'bolts', amount: 1 }
      ]
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  const robotNormal = `
    ╭──────────╮
    │  ■ ■ ■  │
    │  ─────  │
    │ |=====| │
    ╰──────────╯
    │  ║   ║  │
    ╰──╨───╨──╯
  `

  const robotHappy = `
    ╭──────────╮
    │  ♦ ♦ ♦  │
    │  ─────  │
    │ |=====| │
    ╰──────────╯
    │  ║   ║  │
    ╰──╨───╨──╯
  `

  const robotTired = `
    ╭──────────╮
    │  × × ×  │
    │  ─────  │
    │ |=====| │
    ╰──────────╯
    │  ║   ║  │
    ╰──╨───╨──╯
  `

  const robotMission = `
    ╭──────────╮
    │  {'>'}{'<'}{'>'}  │
    │  ─────  │
    │ |=====| │
    ╰──────────╯
    │  ║   ║  │
    ╰──╨───╨──╯
  `

  const getRobotState = () => {
    if (isOnMission) return robotMission
    if (energy < 30) return robotTired
    if (happiness > 80) return robotHappy
    return robotNormal
  }

  const charge = () => {
    const chargeAmount = upgrades.find(u => u.name === 'Battery Boost')?.applied ? 30 : 20
    setEnergy(Math.min(100, energy + chargeAmount))
    setLastInteraction('Charging... Battery replenished!')
  }

  const play = () => {
    if (energy >= 10) {
      setEnergy(Math.max(0, energy - 10))
      setHappiness(Math.min(100, happiness + 15))
      setLastInteraction('Playing with robot! It seems happy!')
    } else {
      setLastInteraction('Robot is too tired to play...')
    }
  }

  const startMission = (mission: Mission) => {
    if (energy < mission.requiredBatteryLevel) {
      setLastInteraction('Not enough energy for this mission!')
      return
    }
    if (isOnMission) {
      setLastInteraction('Already on a mission!')
      return
    }

    setIsOnMission(true)
    setEnergy(Math.max(0, energy - mission.energyCost))
    
    const happinessCost = upgrades.find(u => u.name === 'Happy Circuits')?.applied 
      ? Math.floor(mission.happinessCost * 0.7) 
      : mission.happinessCost
    
    setHappiness(Math.max(0, happiness - happinessCost))
    setLastInteraction(`Started mission: ${mission.name}`)

    const timer = setTimeout(() => {
      completeMission(mission)
    }, mission.duration * 1000)

    setMissionTimer(timer as unknown as number)
  }

  const completeMission = (mission: Mission) => {
    setIsOnMission(false)
    setMissionTimer(null)
    
    setResources(prevResources => {
      const newResources = [...prevResources]
      mission.rewards.forEach(reward => {
        const resourceIndex = newResources.findIndex(r => r.name === reward.name)
        if (resourceIndex !== -1) {
          newResources[resourceIndex].amount += reward.amount
        }
      })
      return newResources
    })

    setLastInteraction(`Mission Complete: ${mission.name}! Collected resources!`)
  }

  const applyUpgrade = (upgrade: Upgrade) => {
    const canAfford = upgrade.cost.every(cost => {
      const resource = resources.find(r => r.name === cost.name)
      return resource && resource.amount >= cost.amount
    })

    if (!canAfford) {
      setLastInteraction('Not enough resources for this upgrade!')
      return
    }

    setResources(prevResources => {
      const newResources = [...prevResources]
      upgrade.cost.forEach(cost => {
        const resourceIndex = newResources.findIndex(r => r.name === cost.name)
        if (resourceIndex !== -1) {
          newResources[resourceIndex].amount -= cost.amount
        }
      })
      return newResources
    })

    setUpgrades(prevUpgrades => {
      return prevUpgrades.map(u => 
        u.name === upgrade.name ? { ...u, applied: true } : u
      )
    })

    setLastInteraction(`Upgrade applied: ${upgrade.name}!`)
  }

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      {/* CRT screen effect container */}
      <div className="relative w-full max-w-3xl bg-black rounded-xl overflow-hidden shadow-[0_0_20px_rgba(32,128,32,0.3)] border border-green-900">
        {/* Scan line effect */}
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,32,0,0.2)_0px,rgba(0,32,0,0.2)_1px,transparent_1px,transparent_2px)]"></div>
        {/* Screen glare effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-green-500/5 via-transparent to-transparent"></div>
        {/* Monitor edge effect */}
        <div className="absolute inset-0 pointer-events-none border-4 border-gray-900 rounded-xl"></div>
        
        <div className="relative font-mono text-green-500/90 p-8 min-h-[768px]">
          <div className="text-sm mb-6 flex flex-col gap-1">
            <div className="text-green-500/70 border-b border-green-500/20 pb-2">ROBOPET v1.0.0 - TERMINAL MODE</div>
            <div className="text-green-500/50 text-xs">INITIALIZING SYSTEM...</div>
            <div className="text-green-500/50 text-xs">BOOT SEQUENCE COMPLETE</div>
          </div>
          
          <pre className="text-3xl whitespace-pre mb-8 leading-tight font-mono text-green-400 animate-pulse">
            {getRobotState()}
            {cursorVisible ? '█' : ' '}
          </pre>

          <div className="mb-8 text-green-400/90">
            <div className="flex gap-6">
              <div className="border border-green-500/30 px-3 py-1">[ENERGY: {energy}%]</div>
              <div className="border border-green-500/30 px-3 py-1">[HAPPINESS: {happiness}%]</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs mb-3 text-green-500/60 border-b border-green-500/20 pb-1">{'>>'} AVAILABLE COMMANDS:</div>
            <div className="flex gap-4">
              <button 
                onClick={charge}
                disabled={isOnMission}
                className="px-4 py-2 border border-green-500/50 hover:bg-green-500/20 hover:border-green-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-green-400 hover:text-green-300 disabled:text-green-500/30"
              >
                [CHARGE]
              </button>
              <button 
                onClick={play}
                disabled={energy < 10 || isOnMission}
                className="px-4 py-1 border border-green-500 hover:bg-green-500 hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                [PLAY]
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs mb-2 opacity-70">{'>>'} INVENTORY:</div>
            <div className="grid grid-cols-3 gap-4">
              {resources.map(resource => (
                <div key={resource.name} className="font-mono">
                  [{resource.name.toUpperCase()}: {resource.amount}]
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs mb-2 opacity-70">{'>>'} AVAILABLE MISSIONS:</div>
            <div className="flex flex-col gap-2">
              {missions.map(mission => (
                <button
                  key={mission.name}
                  onClick={() => startMission(mission)}
                  disabled={isOnMission || energy < mission.requiredBatteryLevel}
                  className="text-left px-4 py-1 border border-green-500 hover:bg-green-500 hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  [{mission.name}] - E:{mission.energyCost} H:-{mission.happinessCost}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs mb-2 opacity-70">{'>>'} UPGRADE MODULES:</div>
            <div className="flex flex-col gap-2">
              {upgrades.map(upgrade => (
                <div key={upgrade.name} className="text-sm">
                  <button
                    onClick={() => applyUpgrade(upgrade)}
                    disabled={upgrade.applied}
                    className="w-full text-left px-4 py-1 border border-green-500 hover:bg-green-500 hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    [{upgrade.name}] {upgrade.applied ? '(INSTALLED)' : ''}
                    <div className="text-xs opacity-70">
                      {'>>'} {upgrade.effect}
                      <br/>
                      {'>>'} COST: {upgrade.cost.map(c => `${c.amount} ${c.name}`).join(', ')}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs opacity-70 border-t border-green-500 pt-4">
            {'>>'} {lastInteraction || 'Awaiting command...'}{cursorVisible ? '_' : ' '}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobotPet
