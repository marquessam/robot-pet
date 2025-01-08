'use client'
import React, { useState } from 'react'

const RobotPet = () => {
  const [energy, setEnergy] = useState(100)
  const [happiness, setHappiness] = useState(100)
  const [lastInteraction, setLastInteraction] = useState('')

  // Basic robot ASCII art states
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
    if (energy < 30) return robotTired
    if (happiness > 80) return robotHappy
    return robotNormal
  }

  const charge = () => {
    setEnergy(Math.min(100, energy + 20))
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

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="text-center">
        <pre className="font-mono text-lg whitespace-pre">
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

        <div className="flex justify-center gap-4">
          <button 
            onClick={charge}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Charge
          </button>
          <button 
            onClick={play}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            disabled={energy < 10}
          >
            Play
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          {lastInteraction}
        </p>
      </div>
    </div>
  )
}

export default RobotPet
