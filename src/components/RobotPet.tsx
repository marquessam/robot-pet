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
  asciiArt: string;
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

const defaultUpgrades: Upgrade[] = [
  { name: 'Battery Boost', cost: [{ name: 'magnets', amount: 3 }, { name: 'wires', amount: 2 }], applied: false, effect: 'Increases energy gain from charging' },
  { name: 'Happy Circuits', cost: [{ name: 'bolts', amount: 4 }, { name: 'wires', amount: 3 }], applied: false, effect: 'Reduces happiness loss from missions' },
  { name: 'Advanced Sensors', cost: [{ name: 'circuit', amount: 2 }, { name: 'magnets', amount: 2 }], applied: false, effect: 'Increases mission success rate' },
  { name: 'Reinforced Chassis', cost: [{ name: 'bolts', amount: 6 }, { name: 'wires', amount: 4 }], applied: false, effect: 'Reduces energy loss during missions' },
  { name: 'Extended Battery', cost: [{ name: 'bolts', amount: 2 }, { name: 'circuit', amount: 1 }], applied: false, effect: 'Increases max energy' },
  { name: 'Enhanced AI', cost: [{ name: 'magnets', amount: 4 }, { name: 'circuit', amount: 3 }], applied: false, effect: 'Improves decision making' }
];

const initialResources: Resource[] = [
  { name: 'bolts', amount: 0 },
  { name: 'magnets', amount: 0 },
  { name: 'wires', amount: 0 },
  { name: 'circuit', amount: 0 }
];

const botEmojis = ["🤖", "🐱", "🐶", "🦊", "🐻‍❄️", "🦾", "👾"];

const normalFace = "[ o--o ]";
const blinkFace = "[ >--< ]";
const happyFace1 = "[^--^]";
const happyFace2 = "[ >--< ]";
const angryFace1 = "[.\\--/.]";
const angryFace2 = "[./--\\.]";

const generateAsciiBot = (face: string): string => `
╭──────────╮
│   ${face}    │
│  ─────   │
│ |=====|  │
╰──────────╯
│  ║   ║   │
╰──╨───╨───╯
`;

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
    asciiArt: generateAsciiBot(normalFace)
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
    if (!currentBot.isOnMission) {
      let frames = [blinkFace, normalFace];
      if (currentBot.happiness > 80) frames = [happyFace1, happyFace2];
      else if (currentBot.happiness < 20) frames = [angryFace1, angryFace2];
      let index = 0;
      const blinkInterval = setInterval(() => {
        updateBotState(currentBot.id, { asciiArt: generateAsciiBot(frames[index]) });
        index = (index + 1) % frames.length;
      }, 1000);
      return () => clearInterval(blinkInterval);
    }
  }, [currentBot.isOnMission, currentBot.happiness, currentBot.id]);

  // "Returning" effect when 3 seconds or less remain
  useEffect(() => {
    if (currentBot.isOnMission && currentBot.missionTimeLeft !== null && currentBot.missionTimeLeft <= 3) {
      updateBotState(currentBot.id, { asciiArt: "Returning..." });
    }
  }, [currentBot.isOnMission, currentBot.missionTimeLeft, currentBot.id]);

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
    { name: 'Scrap Yard Search', energyCost: 20, happinessCost: 10, duration: 10, requiredBatteryLevel: 30, rewards: [{ name: 'bolts', amount: 2 }, { name: 'wires', amount: 1 }] },
    { name: 'Factory Exploration', energyCost: 40, happinessCost: 20, duration: 20, requiredBatteryLevel: 50, rewards: [{ name: 'magnets', amount: 2 }, { name: 'wires', amount: 2 }, { name: 'bolts', amount: 1 }] },
    { name: 'Abandoned Warehouse', energyCost: 30, happinessCost: 15, duration: 15, requiredBatteryLevel: 40, rewards: [{ name: 'wires', amount: 3 }, { name: 'bolts', amount: 1 }, { name: 'circuit', amount: 1 }] },
    { name: 'Underground Lab', energyCost: 50, happinessCost: 25, duration: 30, requiredBatteryLevel: 60, rewards: [{ name: 'magnets', amount: 4 }, { name: 'circuit', amount: 2 }, { name: 'wires', amount: 2 }] },
    { name: 'Space Junk Salvage', energyCost: 70, happinessCost: 30, duration: 40, requiredBatteryLevel: 80, rewards: [{ name: 'bolts', amount: 5 }, { name: 'magnets', amount: 3 }, { name: 'wires', amount: 3 }, { name: 'circuit', amount: 4 }] }
  ];

  const startMission = (mission: Mission) => {
    if (currentBot.energy < mission.requiredBatteryLevel) {
      setLastInteraction('Not enough energy for this mission!');
      return;
    }
    if (currentBot.isOnMission) {
      setLastInteraction('Already on a mission!');
      return;
    }

    const newEnergy = Math.max(0, currentBot.energy - mission.energyCost);
    const happinessCost = currentBot.upgrades.find(u => u.name === 'Happy Circuits' && u.applied)
      ? Math.floor(mission.happinessCost * 0.7)
      : mission.happinessCost;
    const newHappiness = Math.max(0, currentBot.happiness - happinessCost);

    updateBotState(currentBot.id, {
      isOnMission: true,
      missionTimeLeft: mission.duration,
      energy: newEnergy,
      happiness: newHappiness,
      asciiArt: "← Leaving..."
    });

    setLastInteraction(`Started mission: ${mission.name}`);

    setTimeout(() => {
      completeMission(mission);
    }, mission.duration * 1000);
  };

  const completeMission = (mission: Mission) => {
    updateBotState(currentBot.id, {
      isOnMission: false,
      missionTimeLeft: null,
      asciiArt: generateAsciiBot(normalFace)
    });

    setResources(prevResources => {
      const newResources = [...prevResources];
      mission.rewards.forEach(reward => {
        const idx = newResources.findIndex(r => r.name === reward.name);
        if (idx !== -1) {
          newResources[idx].amount += reward.amount;
        }
      });
      return newResources;
    });

    setLastInteraction(`Mission Complete: ${mission.name}! Collected resources!`);
  };

  const charge = () => {
    const chargeAmount = currentBot.upgrades.find(u => u.name === 'Battery Boost' && u.applied) ? 30 : 20;
    const newEnergy = Math.min(100, currentBot.energy + chargeAmount);
    updateBotState(currentBot.id, { energy: newEnergy });
    setLastInteraction('Charging... Battery replenished!');
  };

  const play = () => {
    if (currentBot.energy < 10) {
      setLastInteraction('Robot is too tired to play...');
      return;
    }
    const newEnergy = Math.max(0, currentBot.energy - 10);
    const newHappiness = Math.min(100, currentBot.happiness + 15);
    updateBotState(currentBot.id, { energy: newEnergy, happiness: newHappiness });
    setLastInteraction('Playing with robot! It seems happy!');
  };

  const applyUpgrade = (upgrade: Upgrade) => {
    const canAfford = upgrade.cost.every(cost => {
      const resource = resources.find(r => r.name === cost.name);
      return resource && resource.amount >= cost.amount;
    });
    if (!canAfford) {
      setLastInteraction('Not enough resources for this upgrade!');
      return;
    }
    setResources(prevResources => {
      const newResources = [...prevResources];
      upgrade.cost.forEach(cost => {
        const idx = newResources.findIndex(r => r.name === cost.name);
        if (idx !== -1) newResources[idx].amount -= cost.amount;
      });
      return newResources;
    });
    updateBotState(currentBot.id, {
      upgrades: currentBot.upgrades.map(u =>
        u.name === upgrade.name ? { ...u, applied: true } : u
      )
    });
    setLastInteraction(`Upgrade applied: ${upgrade.name}!`);
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
    const randomEmoji = botEmojis[Math.floor(Math.random() * botEmojis.length)];
    const asciiArt = generateAsciiBot(randomEmoji);
    const newBot: Bot = {
      id: newBotId,
      name: randomName,
      energy: 100,
      happiness: 100,
      upgrades: defaultUpgrades.map(upg => ({ ...upg })),
      isOnMission: false,
      missionTimeLeft: null,
      asciiArt
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
            <span className="text-xs terminal-glow opacity-70 mr-2">{'>>'} SWITCH BOT:</span>
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

          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-2 gap-6 w-full">
            {/* Top Left: Bot Display with Charge/Play buttons */}
            <div className="mb-6 text-center">
              <pre className="text-3xl whitespace-pre leading-tight terminal-glow">
                {currentBot.asciiArt}
              </pre>
              {currentBot.isOnMission && currentBot.missionTimeLeft !== null && (
                <div className="text-xl terminal-glow animate-pulse">
                  T-{currentBot.missionTimeLeft}s
                </div>
              )}
              <div className="flex gap-2 justify-center mt-4">
                <button 
                  onClick={charge}
                  disabled={currentBot.isOnMission}
                  className="px-3 py-1 border border-[#4af626]/50 terminal-glow hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                >
                  [CHARGE]
                </button>
                <button 
                  onClick={play}
                  disabled={currentBot.energy < 10 || currentBot.isOnMission}
                  className="px-3 py-1 border border-[#4af626]/50 terminal-glow hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                >
                  [PLAY]
                </button>
              </div>
            </div>

            {/* Top Right: Bot Stats and Installed Upgrades */}
            <div className="stats-readout border border-[#4af626]/30 p-4 rounded">
              <h2 className="text-lg mb-2 terminal-glow">Bot Stats</h2>
              <div className="mb-4">
                <p><strong>Name:</strong> {currentBot.name}</p>
                <p><strong>Energy:</strong> ⚡ {currentBot.energy}%</p>
                <p><strong>Happiness:</strong> ❤️ {currentBot.happiness}%</p>
              </div>
              <h3 className="text-md mb-2 terminal-glow">Upgrades Installed:</h3>
              <ul className="list-disc list-inside">
                {currentBot.upgrades.filter(u => u.applied).length === 0 ? (
                  <li className="mb-1 text-gray-500">No upgrades installed.</li>
                ) : (
                  currentBot.upgrades.map(upgrade => 
                    upgrade.applied && (
                      <li key={upgrade.name} className="mb-1">
                        <span className="text-green-400">
                          {upgrade.name} (Installed)
                        </span>
                        <p className="text-xs opacity-70 ml-4">{upgrade.effect}</p>
                      </li>
                    )
                  )
                )}
              </ul>
            </div>

            {/* Bottom Left: Inventory above Missions */}
            <div className="space-y-6">
              <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} INVENTORY</div>
              <div className="space-y-1 text-center mb-6">
                {resources.map(resource => (
                  <div key={resource.name} className="font-mono text-sm terminal-glow">
                    [{resource.name.toUpperCase()}: {resource.amount}]
                  </div>
                ))}
              </div>
              <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} MISSIONS</div>
              <div className="space-y-1 flex flex-col items-center">
                {missions.map(mission => (
                  <button
                    key={mission.name}
                    onClick={() => startMission(mission)}
                    disabled={currentBot.isOnMission || currentBot.energy < mission.requiredBatteryLevel}
                    className="w-full text-left text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                  >
                    [{mission.name}]
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Right: Upgrades */}
            <div className="space-y-6">
              <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} UPGRADES</div>
              <div className="space-y-1 flex flex-col items-center">
                {currentBot.upgrades.map(upgrade => (
                  <button
                    key={upgrade.name}
                    onClick={() => applyUpgrade(upgrade)}
                    disabled={upgrade.applied}
                    className="w-full text-left text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
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

          {/* Bottom Section for Build Bot */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="space-y-6">
              <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} BUILD BOT</div>
              <button
                onClick={buildBot}
                disabled={!canBuildBot}
                className="w-full text-left text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
              >
                [BUILD NEW BOT]
                <div className="text-xs opacity-70 mt-1 pl-2">
                  {'>>'} Cost: {buildBotCost.map(c => `${c.amount} ${c.name}`).join(', ')}
                </div>
              </button>
            </div>
          </div>

          <div className="text-xs text-[#4af626]/70 border-t border-[#4af626]/20 mt-6 pt-4 terminal-glow text-center">
            {'>>'} {lastInteraction || 'Awaiting command...'}{cursorVisible ? '_' : ' '}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotPet;
