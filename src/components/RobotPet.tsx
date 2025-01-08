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
  // ... [previous state declarations remain the same]
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

  // Blinking cursor effect
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

  // [Previous mission and upgrade functions remain the same]

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex items-center justify-center">
      <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,255,0,0.3)]">
        {/* Screen overlay effect */}
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.8)_0px,rgba(0,0,0,0.8)_1px,transparent_1px,transparent_2px)]"></div>
        
        {/* Main content */}
        <div className="relative font-mono text-green-500 p-8">
          <div className="text-xs mb-4 opacity-70">ROBOPET v1.0.0 - TERMINAL MODE</div>
          
          {/* Robot Display */}
          <pre className="text-2xl whitespace-pre mb-4 leading-tight font-mono">
            {getRobotState()}
            {cursorVisible ? '█' : ' '}
          </pre>

          {/* Status Section */}
          <div className="mb-6 opacity-90">
            <div className="flex gap-4">
              <div>[ENERGY: {energy}%]</div>
              <div>[HAPPINESS: {happiness}%]</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6">
            <div className="text-xs mb-2 opacity-70">> AVAILABLE COMMANDS:</div>
            <div className="flex gap-4">
              <button 
                onClick={charge}
                disabled={isOnMission}
                className="px-4 py-1 border border-green-500 hover:bg-green-500 hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Resources */}
          <div className="mb-6">
            <div className="text-xs mb-2 opacity-70">> INVENTORY:</div>
            <div className="grid grid-cols-3 gap-4">
              {resources.map(resource => (
                <div key={resource.name} className="font-mono">
                  [{resource.name.toUpperCase()}: {resource.amount}]
                </div>
              ))}
            </div>
          </div>

          {/* Missions */}
          <div className="mb-6">
            <div className="text-xs mb-2 opacity-70">> AVAILABLE MISSIONS:</div>
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

          {/* Upgrades */}
          <div className="mb-6">
            <div className="text-xs mb-2 opacity-70">> UPGRADE MODULES:</div>
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
                      &gt; {upgrade.effect}
                      <br/>
                      &gt; COST: {upgrade.cost.map(c => `${c.amount} ${c.name}`).join(', ')}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status Line */}
          <div className="text-xs opacity-70 border-t border-green-500 pt-4">
            > {lastInteraction || 'Awaiting command...'}{cursorVisible ? '_' : ' '}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobotPet
