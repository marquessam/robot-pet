'use client'
import React, { useState } from 'react'

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

  // ASCII art states remain the same
  const robotNormal = `
   /[■-■]\\
  |  [+]  |
   \\=|=|=/
    |---|
  `

  const robotHappy = `
   /[^-^]\\
  |  [+]  |
   \\=|=|=/
    |---|
  `

  const robotTired = `
   /[-.~]\\
  |  [+]  |
   \\=|=|=/
    |---|
  `

  const getRobotState = () => {
    if (isOnMission) return '< ON MISSION >'
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

    // Set timer for mission completion
    const timer = setTimeout(() => {
      completeMission(mission)
    }, mission.duration * 1000) // Convert to milliseconds

    setMissionTimer(timer as unknown as number)
  }

  const completeMission = (mission: Mission) => {
    setIsOnMission(false)
    setMissionTimer(null)
    
    // Add rewards to resources
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
    // Check if we have enough resources
    const canAfford = upgrade.cost.every(cost => {
      const resource = resources.find(r => r.name === cost.name)
      return resource && resource.amount >= cost.amount
    })

    if (!canAfford) {
      setLastInteraction('Not enough resources for this upgrade!')
      return
    }

    // Deduct resources
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

    // Apply upgrade
    setUpgrades(prevUpgrades => {
      return prevUpgrades.map(u => 
        u.name === upgrade.name ? { ...u, applied: true } : u
      )
    })

    setLastInteraction(`Upgrade applied: ${upgrade.name}!`)
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="text-center">
        <pre className="font-mono text-lg whitespace-pre mb-4">
          {getRobotState()}
        </pre>
        
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span>⚡ {energy}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span>❤️ {happiness}%</span>
          </div>
        </div>

        {/* Basic Actions */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={charge}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isOnMission}
          >
            Charge
          </button>
          <button 
            onClick={play}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={energy < 10 || isOnMission}
          >
            Play
          </button>
        </div>

        {/* Resources */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-2">Resources:</h3>
          <div className="flex justify-center gap-4">
            {resources.map(resource => (
              <div key={resource.name} className="text-sm">
                {resource.name}: {resource.amount}
              </div>
            ))}
          </div>
        </div>

        {/* Missions */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Available Missions:</h3>
          <div className="flex flex-col gap-2">
            {missions.map(mission => (
              <button
                key={mission.name}
                onClick={() => startMission(mission)}
                disabled={isOnMission || energy < mission.requiredBatteryLevel}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                {mission.name} (⚡ {mission.energyCost}, ❤️ -{mission.happinessCost})
              </button>
            ))}
          </div>
        </div>

        {/* Upgrades */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Upgrades:</h3>
          <div className="flex flex-col gap-2">
            {upgrades.map(upgrade => (
              <div key={upgrade.name} className="text-sm">
                <button
                  onClick={() => applyUpgrade(upgrade)}
                  disabled={upgrade.applied}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {upgrade.name} {upgrade.applied ? '(Applied)' : ''}
                </button>
                <div className="text-xs mt-1">
                  Effect: {upgrade.effect}<br/>
                  Cost: {upgrade.cost.map(c => `${c.amount} ${c.name}`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          {lastInteraction}
        </p>
      </div>
    </div>
  )
}

export default RobotPet
