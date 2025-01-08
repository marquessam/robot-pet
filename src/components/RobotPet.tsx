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
  pixelData: string[][];  // 16x16 pixel art data
}

interface Resource {
  name: string;
  amount: number;
}

interface Mission {
  name: string;
  energyCost: number;
  happinessCost: number;
  duration: number;
  rewards: Resource[];
  requiredBatteryLevel: number;
}

interface Upgrade {
  name: string;
  cost: Resource[];
  applied: boolean;
  effect: string;
}

// Define default upgrades for bots
const defaultUpgrades: Upgrade[] = [
  // ... (same as before)
  {
    name: 'Battery Boost',
    cost: [{ name: 'magnets', amount: 3 }, { name: 'wires', amount: 2 }],
    applied: false,
    effect: 'Increases energy gain from charging'
  },
  // ... rest of default upgrades
];

// Updated Pixel Art Arrays with varied colors
const botStyle1: string[][] = Array(16).fill(null).map((_, row) =>
  Array(16).fill(null).map((_, col) => {
    if(row < 2 || row > 13 || col < 2 || col > 13) return '#00f'; // blue border
    if(row >= 4 && row <= 11 && col >= 4 && col <= 11) return '#ff0'; // yellow interior
    return '#000'; // black background
  })
);

const botStyle2: string[][] = Array(16).fill(null).map((_, row) =>
  Array(16).fill(null).map((_, col) =>
    (row + col) % 2 === 0 ? '#800080' : '#000'
  )
);

const botStylesPixel = [botStyle1, botStyle2];

const initialResources: Resource[] = [
  { name: 'bolts', amount: 0 },
  { name: 'magnets', amount: 0 },
  { name: 'wires', amount: 0 },
  { name: 'circuit', amount: 0 }
];

const RobotPet = () => {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  
  const [bots, setBots] = useState<Bot[]>([{
    id: 'bot-1',
    name: 'SM-33',
    energy: 100,
    happiness: 100,
    upgrades: defaultUpgrades.map(upg => ({ ...upg })),
    isOnMission: false,
    missionTimeLeft: null,
    pixelData: botStyle1
  }]);

  const [activeBot, setActiveBot] = useState<string>('bot-1');
  const [lastInteraction, setLastInteraction] = useState('');

  const currentBot = bots.find(bot => bot.id === activeBot)!;

  const updateBotState = (botId: string, updates: Partial<Bot>) => {
    setBots(prevBots =>
      prevBots.map(bot => bot.id === botId ? { ...bot, ...updates } : bot)
    );
  };

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentBot && currentBot.energy <= 0) {
      setLastInteraction(`${currentBot.name} has died.`);
      const salvage = [
        { name: 'bolts', amount: 5 },
        { name: 'magnets', amount: 2 },
        { name: 'wires', amount: 2 },
        { name: 'circuit', amount: 1 }
      ];
      setResources(prev => {
        const newResources = [...prev];
        salvage.forEach(s => {
          const idx = newResources.findIndex(r => r.name === s.name);
          if (idx !== -1) newResources[idx].amount += s.amount;
        });
        return newResources;
      });
      setBots(prevBots => {
        const updatedBots = prevBots.filter(bot => bot.id !== currentBot.id);
        if (updatedBots.length > 0) setActiveBot(updatedBots[0].id);
        else setActiveBot('');
        return updatedBots;
      });
    }
  }, [currentBot?.energy]);

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
  }, [currentBot?.id, currentBot?.isOnMission, currentBot?.missionTimeLeft]);

  const missions: Mission[] = [
    // ... (same missions as before)
  ];

  const getBotPixelData = () => currentBot.pixelData;

  const startMission = (mission: Mission) => {
    // ... (same as before)
  };

  const completeMission = (mission: Mission) => {
    // ... (same as before)
  };

  const charge = () => {
    // ... (same as before)
  };

  const play = () => {
    // ... (same as before)
  };

  const applyUpgrade = (upgrade: Upgrade) => {
    // ... (same as before)
  };

  const buildBotCost: Resource[] = [
    { name: 'bolts', amount: 10 },
    { name: 'magnets', amount: 5 },
    { name: 'wires', amount: 5 }
  ];

  const canBuildBot = buildBotCost.every(cost => {
    const resource = resources.find(r => r.name === cost.name);
    return resource && resource.amount >= cost.amount;
  });

  const buildBot = () => {
    if (!canBuildBot) {
      setLastInteraction('Not enough resources to build a new bot!');
      return;
    }

    setResources(prevResources => {
      const newResources = [...prevResources];
      buildBotCost.forEach(cost => {
        const idx = newResources.findIndex(r => r.name === cost.name);
        if (idx !== -1) newResources[idx].amount -= cost.amount;
      });
      return newResources;
    });

    const newBotId = `bot-${bots.length + 1}`;
    const botNames = ['C3-vxx', 'ZX-12', 'VX-99', 'SM-33'];
    const randomName = botNames[bots.length % botNames.length] + `-${bots.length + 1}`;
    const randomPixelArt = botStylesPixel[Math.floor(Math.random() * botStylesPixel.length)];

    const newBot: Bot = {
      id: newBotId,
      name: randomName,
      energy: 100,
      happiness: 100,
      upgrades: defaultUpgrades.map(upg => ({ ...upg })),
      isOnMission: false,
      missionTimeLeft: null,
      pixelData: randomPixelArt
    };

    setBots(prevBots => [...prevBots, newBot]);
    setActiveBot(newBotId);
    setLastInteraction(`New bot built: ${newBot.name}!`);
  };

  return (
    <div className="terminal-container">
      <div className="relative screen rounded-xl overflow-hidden shadow-[0_0_20px_rgba(74,246,38,0.2)] border border-[#4af626]/20 crt">
        <div className="relative font-mono text-[#4af626] p-8">
          {/* Title */}
          <div className="text-xs mb-6 flex flex-col gap-1 terminal-glow opacity-50 text-center">
            <div>ROBOPET v1.0.0 - TERMINAL MODE</div>
            <div>SYSTEM ACTIVE...</div>
          </div>
          
          {/* Bot Switching Buttons */}
          <div className="mb-4 text-center">
            <span className="text-xs terminal-glow opacity-70 mr-2">
              {'>>'} SWITCH BOT:
            </span>
            {bots.map(bot => (
              <button
                key={bot.id}
                onClick={() => setActiveBot(bot.id)}
                disabled={bot.id === activeBot}
                className="mx-1 px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {bot.name}
              </button>
            ))}
          </div>
          
          {/* Robot Display and Stats Readout Container */}
          <div className="grid grid-cols-2 gap-6">
            {/* Bot Display Column */}
            <div>
              <div className="relative mb-4">
                <div className="pixel-art-container">
                  {getBotPixelData().map((row, rowIndex) => (
                    <div className="pixel-row" key={rowIndex}>
                      {row.map((color, colIndex) => (
                        <div
                          key={colIndex}
                          className="pixel"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                {currentBot.isOnMission && currentBot.missionTimeLeft !== null && (
                  <div className="absolute top-0 right-0 text-xl terminal-glow animate-pulse">
                    T-{currentBot.missionTimeLeft}s
                  </div>
                )}
              </div>
            </div>

            {/* Stats Readout Column */}
            <div className="stats-readout border border-[#4af626]/30 p-4 rounded">
              <h2 className="text-lg mb-2 terminal-glow">Bot Stats</h2>
              <div className="mb-4">
                <p><strong>Name:</strong> {currentBot.name}</p>
                <p><strong>Energy:</strong> {currentBot.energy}%</p>
                <p><strong>Happiness:</strong> {currentBot.happiness}%</p>
              </div>
              <h3 className="text-md mb-2 terminal-glow">Upgrades Installed:</h3>
              <ul className="list-disc list-inside">
                {currentBot.upgrades.map((upgrade) => (
                  <li key={upgrade.name} className="mb-1">
                    <span className={`${upgrade.applied ? 'text-green-400' : 'text-red-400'}`}>
                      {upgrade.name} {upgrade.applied ? '(Applied)' : '(Not Applied)'}
                    </span>
                    <p className="text-xs opacity-70 ml-4">{upgrade.effect}</p>
                    <p className="text-xs opacity-70 ml-4">
                      <strong>Cost:</strong> {upgrade.cost.map(c => `${c.amount} ${c.name}`).join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Status Display */}
          <div className="mb-6 text-[#4af626] grid grid-cols-2 gap-4">
            <div className="border border-[#4af626]/30 px-3 py-1 terminal-glow text-center">
              ⚡ {currentBot.energy}%
            </div>
            <div className="border border-[#4af626]/30 px-3 py-1 terminal-glow text-center">
              ❤️ {currentBot.happiness}%
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
                    disabled={currentBot.isOnMission}
                    className="flex-1 terminal-glow px-3 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                  >
                    [CHARGE]
                  </button>
                  <button 
                    onClick={play}
                    disabled={currentBot.energy < 10 || currentBot.isOnMission}
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

              {/* Build Bot */}
              <div>
                <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} BUILD BOT</div>
                <button
                  onClick={buildBot}
                  disabled={!canBuildBot}
                  className="w-full text-left text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                >
                  [BUILD NEW BOT]
                  <div className="text-xs opacity-70 mt-1 pl-2">
                    {'>>'} Cost: {buildBotCost.map(c => `${c.amount} ${c.name}`).join(', ')}
                  </div>
                </button>
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
                      disabled={currentBot.isOnMission || currentBot.energy < mission.requiredBatteryLevel}
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
                  {currentBot.upgrades.map(upgrade => (
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
  );
};

export default RobotPet;
