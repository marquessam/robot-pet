'use client'
import React, { useState, useEffect } from 'react'

interface Bot {
  id: string;
  name: string;
  energy: number;
  happiness: number;
  upgrades: Upgrade[];
  isOnMission: boolean;
  missionTimeLeft: number | null;
}

interface Resource {
  name: string;
  amount: number
}

interface Mission {
  name: string;
  energyCost: number;
  happinessCost: number;
  duration: number;
  rewards: Resource[];
  requiredBatteryLevel: number
}

interface Upgrade {
  name: string;
  cost: Resource[];
  applied: boolean;
  effect: string
}

const RobotPet = () => {
  const [cursorVisible, setCursorVisible] = useState(true)
  const [resources, setResources] = useState<Resource[]>([
    { name: 'bolts', amount: 0 },
    { name: 'magnets', amount: 0 },
    { name: 'wires', amount: 0 }
  ])
  
  const [bots, setBots] = useState<Bot[]>([{
    id: 'bot-1',
    name: 'BOT-1',
    energy: 100,
    happiness: 100,
    upgrades: [
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
    ],
    isOnMission: false,
    missionTimeLeft: null
  }])

  const [activeBot, setActiveBot] = useState<string>('bot-1')
  const [lastInteraction, setLastInteraction] = useState('')
  const [showBuildMenu, setShowBuildMenu] = useState(false)
  const [newBotName, setNewBotName] = useState('')

  const currentBot = bots.find(bot => bot.id === activeBot)!

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  // Mission timer effect
  useEffect(() => {
    if (isOnMission && missionTimeLeft !== null) {
      const timer = setInterval(() => {
        setMissionTimeLeft((prev) => {
          if (prev === null || prev <= 0) return null
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isOnMission, missionTimeLeft])

  // Mission timer effect for current bot
  useEffect(() => {
    if (!currentBot?.isOnMission) return;

    const timer = setInterval(() => {
      if (currentBot.missionTimeLeft !== null) {
        updateBotState(currentBot.id, {
          missionTimeLeft: Math.max(0, currentBot.missionTimeLeft - 1)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBot?.id, currentBot?.isOnMission]);
  
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
    setMissionTimeLeft(mission.duration)
    
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
    setMissionTimeLeft(null)
    
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
    <div className="terminal-container">
      <div className="relative screen rounded-xl overflow-hidden shadow-[0_0_20px_rgba(74,246,38,0.2)] border border-[#4af626]/20 crt">
        <div className="relative font-mono text-[#4af626] p-8">
          {/* Title */}
          <div className="text-xs mb-6 flex flex-col gap-1 terminal-glow opacity-50 text-center">
            <div>ROBOPET v1.0.0 - TERMINAL MODE</div>
            <div>SYSTEM ACTIVE...</div>
          </div>
          
          {/* Robot Display */}
          <div className="relative">
            <pre className="text-3xl whitespace-pre mb-4 leading-tight font-mono text-[#4af626] terminal-glow">
              {getRobotState()}
            </pre>
            {isOnMission && missionTimeLeft !== null && (
              <div className="absolute top-0 right-0 text-xl terminal-glow animate-pulse">
                T-{missionTimeLeft}s
              </div>
            )}
          </div>

          {/* Status Display */}
          <div className="mb-6 text-[#4af626] grid grid-cols-2 gap-4">
            <div className="border border-[#4af626]/30 px-3 py-1 terminal-glow text-center">
              ⚡ {energy}%
            </div>
            <div className="border border-[#4af626]/30 px-3 py-1 terminal-glow text-center">
              ❤️ {happiness}%
            </div>
          </div>

          {/* Main Interface */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Commands */}
              <div>
                <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} COMMANDS</div>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={charge}
                    disabled={isOnMission}
                    className="flex-1 terminal-glow px-3 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                  >
                    [CHARGE]
                  </button>
                  <button 
                    onClick={play}
                    disabled={energy < 10 || isOnMission}
                    className="flex-1 terminal-glow px-3 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                  >
                    [PLAY]
                  </button>
                </div>
              </div>

              {/* Inventory */}
              <div>
                <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} INVENTORY</div>
                <div className="space-y-1 text-center">
                  {resources.map(resource => (
                    <div key={resource.name} className="font-mono text-sm terminal-glow">
                      [{resource.name.toUpperCase()}: {resource.amount}]
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Missions */}
              <div>
                <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} MISSIONS</div>
                <div className="space-y-1 flex flex-col items-center">
                  {missions.map(mission => (
                    <button
                      key={mission.name}
                      onClick={() => startMission(mission)}
                      disabled={isOnMission || energy < mission.requiredBatteryLevel}
                      className="w-full text-left text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                    >
                      [{mission.name}]
                    </button>
                  ))}
                </div>
              </div>

              {/* Upgrades */}
              <div>
                <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} UPGRADES</div>
                <div className="space-y-1 flex flex-col items-center">
                  {upgrades.map(upgrade => (
                    <button
                      key={upgrade.name}
                      onClick={() => applyUpgrade(upgrade)}
                      disabled={upgrade.applied}
                      className="w-full text-left text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                    >
                      [{upgrade.name}] {upgrade.applied ? '*' : ''}
                      <div className="text-xs opacity-70 mt-1 pl-2">
                        {'>>'} Cost: {upgrade.cost.map(c => `${c.amount} ${c.name}`).join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Status Line */}
          <div className="text-xs text-[#4af626]/70 border-t border-[#4af626]/20 mt-6 pt-4 terminal-glow text-center">
            {'>>'} {lastInteraction || 'Awaiting command...'}{cursorVisible ? '_' : ' '}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobotPet
