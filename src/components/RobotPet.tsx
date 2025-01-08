'use client'
import React, { useState, useEffect } from 'react'

// [Previous interfaces remain the same]

const RobotPet = () => {
  // [Previous state declarations and functions remain the same]

  return (
    <div className="min-h-screen bg-[#0d0208] p-4 flex items-center justify-center">
      <div className="relative w-full max-w-3xl screen rounded-xl overflow-hidden shadow-[0_0_20px_rgba(74,246,38,0.2)] border border-[#4af626]/20 crt">
        <div className="relative font-mono text-[#4af626] p-8 min-h-[768px]">
          {/* Title and Boot Sequence */}
          <div className="text-sm mb-6 flex flex-col gap-1 terminal-glow">
            <div className="text-[#4af626] border-b border-[#4af626]/20 pb-2">ROBOPET v1.0.0 - TERMINAL MODE</div>
            <div className="text-[#4af626]/70 text-xs">INITIALIZING SYSTEM...</div>
            <div className="text-[#4af626]/70 text-xs">BOOT SEQUENCE COMPLETE</div>
          </div>
          
          {/* Robot Display */}
          <pre className="text-3xl whitespace-pre mb-8 leading-tight font-mono text-[#4af626] terminal-glow">
            {getRobotState()}
            {cursorVisible ? '█' : ' '}
          </pre>

          {/* Status Display */}
          <div className="mb-8 text-[#4af626]">
            <div className="flex gap-6">
              <div className="border border-[#4af626]/30 px-3 py-1 terminal-glow">[ENERGY: {energy}%]</div>
              <div className="border border-[#4af626]/30 px-3 py-1 terminal-glow">[HAPPINESS: {happiness}%]</div>
            </div>
          </div>

          {/* Commands */}
          <div className="mb-6">
            <div className="text-xs mb-3 text-[#4af626]/80 border-b border-[#4af626]/20 pb-1 terminal-glow">{'>>'} AVAILABLE COMMANDS:</div>
            <div className="flex gap-4">
              <button 
                onClick={charge}
                disabled={isOnMission}
                className="terminal-glow px-4 py-2 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626] hover:text-[#4af626] disabled:text-[#4af626]/30"
              >
                [CHARGE]
              </button>
              <button 
                onClick={play}
                disabled={energy < 10 || isOnMission}
                className="terminal-glow px-4 py-2 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626] hover:text-[#4af626] disabled:text-[#4af626]/30"
              >
                [PLAY]
              </button>
            </div>
          </div>

          {/* Inventory */}
          <div className="mb-6">
            <div className="text-xs mb-3 text-[#4af626]/80 border-b border-[#4af626]/20 pb-1 terminal-glow">{'>>'} INVENTORY:</div>
            <div className="grid grid-cols-3 gap-4">
              {resources.map(resource => (
                <div key={resource.name} className="font-mono terminal-glow">
                  [{resource.name.toUpperCase()}: {resource.amount}]
                </div>
              ))}
            </div>
          </div>

          {/* Missions */}
          <div className="mb-6">
            <div className="text-xs mb-3 text-[#4af626]/80 border-b border-[#4af626]/20 pb-1 terminal-glow">{'>>'} AVAILABLE MISSIONS:</div>
            <div className="flex flex-col gap-2">
              {missions.map(mission => (
                <button
                  key={mission.name}
                  onClick={() => startMission(mission)}
                  disabled={isOnMission || energy < mission.requiredBatteryLevel}
                  className="text-left terminal-glow px-4 py-2 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626] hover:text-[#4af626] disabled:text-[#4af626]/30"
                >
                  [{mission.name}] - E:{mission.energyCost} H:-{mission.happinessCost}
                </button>
              ))}
            </div>
          </div>

          {/* Upgrades */}
          <div className="mb-6">
            <div className="text-xs mb-3 text-[#4af626]/80 border-b border-[#4af626]/20 pb-1 terminal-glow">{'>>'} UPGRADE MODULES:</div>
            <div className="flex flex-col gap-2">
              {upgrades.map(upgrade => (
                <div key={upgrade.name} className="text-sm">
                  <button
                    onClick={() => applyUpgrade(upgrade)}
                    disabled={upgrade.applied}
                    className="w-full text-left terminal-glow px-4 py-2 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626] hover:text-[#4af626] disabled:text-[#4af626]/30"
                  >
                    [{upgrade.name}] {upgrade.applied ? '(INSTALLED)' : ''}
                    <div className="text-xs text-[#4af626]/70">
                      {'>>'} {upgrade.effect}
                      <br/>
                      {'>>'} COST: {upgrade.cost.map(c => `${c.amount} ${c.name}`).join(', ')}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status Line */}
          <div className="text-xs text-[#4af626]/70 border-t border-[#4af626]/20 pt-4 terminal-glow">
            {'>>'} {lastInteraction || 'Awaiting command...'}{cursorVisible ? '_' : ' '}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobotPet
