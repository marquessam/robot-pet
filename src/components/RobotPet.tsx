'use client';
import React, { useState, useEffect } from 'react';

interface Resource {
  name: string;
  amount: number;
}

interface Upgrade {
  name: string;
  cost: Resource[];
  applied: boolean;
  effect: string;
}

interface BotPart {
  name: string;
  level: number;
  maxLevel: number;
  upgradeCost: Resource[];
}

interface Bot {
  id: string;
  name: string;
  energy: number;
  happiness: number;
  damage: number;      // <-- NEW
  parts: BotPart[];    // <-- NEW
  upgrades: Upgrade[];
  isOnMission: boolean;
  missionTimeLeft: number | null;
  asciiArt: string;
}

interface Mission {
  name: string;
  energyCost: number;
  happinessCost: number;
  duration: number;
  rewards: Resource[];
  requiredBatteryLevel: number;
}

// Example default parts:
const defaultParts: BotPart[] = [
  {
    name: 'Chassis',
    level: 1,
    maxLevel: 5,
    upgradeCost: [
      { name: 'bolts', amount: 2 },
      { name: 'wires', amount: 2 },
    ],
  },
  {
    name: 'Sensors',
    level: 1,
    maxLevel: 3,
    upgradeCost: [
      { name: 'magnets', amount: 2 },
      { name: 'circuit', amount: 1 },
    ],
  },
];

const defaultUpgrades: Upgrade[] = [
  // Possibly keep or remove these if you want
];

// Some initial resources
const initialResources: Resource[] = [
  { name: 'bolts', amount: 10 },
  { name: 'magnets', amount: 5 },
  { name: 'wires', amount: 8 },
  { name: 'circuit', amount: 3 },
];

const botEmojis = ['🤖', '🐱', '🐶', '🦊', '🐻‍❄️', '🦾', '👾'];

const normalFace = '[ o--o ]';
const blinkFace = '[ >--< ]';
const happyFace1 = '[^--^]';
const happyFace2 = '[ >--< ]';
const angryFace1 = '[.\\--/.]';
const angryFace2 = '[./--\\.]';

const generateAsciiBotTemplate = (emoji: string, face: string, template: number): string => {
  switch (template) {
    case 1:
      return `
        .=====.
     .-(       )-.
    /    ${face}    \\
   |  |  =====  |  |
    \\ |_________| /
     '-._______.-'
       //     \\\\
      //       \\\\
     []         []
`;

    case 2:
      return `
       _________
     <( ${face} )>
       \\-----/
     .-[       ]-.
     | |       | |
     | |  ===  | |
     | |  ===  | |
     '-[___]__-'
        |   |
        |   |
        |___|
`;

    case 3:
      return `
      ___________
     /           \\
    |    ${face}    |
     \\     ---     /
      |   (===)   |
   .--'    \\_/    '--.
   |                 |
    \\               /
     '-------------'
`;

    default:
      return `
       _________
     <( ${face} )>
       \\-----/
     .-[       ]-.
     | |       | |
     | |  ===  | |
     | |  ===  | |
     '-[___]__-'
        |   |
        |   |
        |___|
`;
  }
};

const RobotPet = () => {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [resources, setResources] = useState<Resource[]>(initialResources);

  // Add a single starter Bot with damage=0 and defaultParts
  const [bots, setBots] = useState<Bot[]>([
    {
      id: 'bot-1',
      name: 'SM-33',
      energy: 100,
      happiness: 100,
      damage: 0,              // <---
      parts: defaultParts.map(p => ({ ...p })),   // <---
      upgrades: defaultUpgrades.map(u => ({ ...u })),
      isOnMission: false,
      missionTimeLeft: null,
      asciiArt: generateAsciiBotTemplate('🤖', normalFace, 1),
    },
  ]);

  const [activeBot, setActiveBot] = useState<string>('bot-1');
  const [lastInteraction, setLastInteraction] = useState('');

  // Toggle to show stats or components
  const [showComponents, setShowComponents] = useState(false);

  const currentBot = bots.find(b => b.id === activeBot)!;

  // Helper to update a bot
  const updateBotState = (botId: string, updates: Partial<Bot>) => {
    setBots(prev =>
      prev.map(b => (b.id === botId ? { ...b, ...updates } : b))
    );
  };

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Idle blinking/facial expression
  useEffect(() => {
    if (!currentBot.isOnMission) {
      let frames = [blinkFace, normalFace];
      if (currentBot.happiness > 80) frames = [happyFace1, happyFace2];
      else if (currentBot.happiness < 20) frames = [angryFace1, angryFace2];

      let index = 0;
      const blinkInterval = setInterval(() => {
        // Always use template #1 for face blinking
        updateBotState(currentBot.id, {
          asciiArt: generateAsciiBotTemplate('🤖', frames[index], 1),
        });
        index = (index + 1) % frames.length;
      }, 1000);

      return () => clearInterval(blinkInterval);
    }
  }, [currentBot.isOnMission, currentBot.happiness, currentBot.id]);

  // If mission is almost done
  useEffect(() => {
    if (currentBot.isOnMission && currentBot.missionTimeLeft !== null && currentBot.missionTimeLeft <= 3) {
      updateBotState(currentBot.id, { asciiArt: 'Returning...' });
    }
  }, [currentBot.isOnMission, currentBot.missionTimeLeft, currentBot.id]);

  // Bot "dies" at 0 energy
  useEffect(() => {
    if (currentBot && currentBot.energy <= 0) {
      setLastInteraction(`${currentBot.name} has died. Salvaging...`);
      const salvage = [
        { name: 'bolts', amount: 5 },
        { name: 'magnets', amount: 2 },
        { name: 'wires', amount: 2 },
        { name: 'circuit', amount: 1 },
      ];
      setResources(prev => {
        const newResources = [...prev];
        salvage.forEach(s => {
          const idx = newResources.findIndex(r => r.name === s.name);
          if (idx !== -1) newResources[idx].amount += s.amount;
        });
        return newResources;
      });
      setBots(prev => {
        const updated = prev.filter(b => b.id !== currentBot.id);
        if (updated.length > 0) {
          setActiveBot(updated[0].id);
        } else {
          setActiveBot('');
        }
        return updated;
      });
    }
  }, [currentBot?.energy, currentBot]);

  // Decrement mission time
  useEffect(() => {
    if (!currentBot?.isOnMission) return;
    const timer = setInterval(() => {
      if (currentBot.missionTimeLeft !== null) {
        updateBotState(currentBot.id, {
          missionTimeLeft: Math.max(0, currentBot.missionTimeLeft - 1),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentBot?.id, currentBot?.isOnMission, currentBot?.missionTimeLeft]);

  // Example Missions
  const missions: Mission[] = [
    {
      name: 'Scrap Yard Search',
      energyCost: 20,
      happinessCost: 10,
      duration: 10,
      requiredBatteryLevel: 30,
      rewards: [
        { name: 'bolts', amount: 2 },
        { name: 'wires', amount: 1 },
      ],
    },
    // ... add more
  ];

  // Start mission logic
  const startMission = (mission: Mission) => {
    if (currentBot.energy < mission.requiredBatteryLevel) {
      setLastInteraction('Not enough energy for this mission!');
      return;
    }
    if (currentBot.isOnMission) {
      setLastInteraction('Already on a mission!');
      return;
    }
    // Energy & happiness cost
    const newEnergy = Math.max(0, currentBot.energy - mission.energyCost);
    const happinessCost = mission.happinessCost; // or reduce with "Happy Circuits"
    const newHappiness = Math.max(0, currentBot.happiness - happinessCost);

    updateBotState(currentBot.id, {
      isOnMission: true,
      missionTimeLeft: mission.duration,
      energy: newEnergy,
      happiness: newHappiness,
      asciiArt: '← Leaving...',
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
      asciiArt: generateAsciiBotTemplate('🤖', normalFace, 1),
    });

    setResources(prev => {
      const newResources = [...prev];
      mission.rewards.forEach(r => {
        const idx = newResources.findIndex(x => x.name === r.name);
        if (idx !== -1) {
          newResources[idx].amount += r.amount;
        }
      });
      return newResources;
    });

    // Possibly add a chance for damage
    // updateBotState(currentBot.id, { damage: currentBot.damage + 10 });

    setLastInteraction(`Mission Complete: ${mission.name}! Collected resources!`);
  };

  // Basic charge
  const charge = () => {
    // Could add logic: if Battery Boost is installed => +30, else +20
    const newEnergy = Math.min(100, currentBot.energy + 20);
    updateBotState(currentBot.id, { energy: newEnergy });
    setLastInteraction('Charging... Battery replenished!');
  };

  // Basic "play"
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

  // REPAIR logic
  const repairBot = (bot: Bot) => {
    if (bot.damage <= 0) {
      setLastInteraction('Bot is already fully repaired!');
      return;
    }
    // Example: 2 bolts + 1 wire per 10 damage
    const blocks = Math.ceil(bot.damage / 10);
    const neededBolts = blocks * 2;
    const neededWires = blocks * 1;

    const hasBolts = resources.find(r => r.name === 'bolts')!.amount >= neededBolts;
    const hasWires = resources.find(r => r.name === 'wires')!.amount >= neededWires;
    if (!hasBolts || !hasWires) {
      setLastInteraction('Not enough resources to repair!');
      return;
    }

    // Deduct
    setResources(prev => {
      const copy = [...prev];
      copy.find(r => r.name === 'bolts')!.amount -= neededBolts;
      copy.find(r => r.name === 'wires')!.amount -= neededWires;
      return copy;
    });

    // Set damage to 0
    updateBotState(bot.id, { damage: 0 });
    setLastInteraction(`${bot.name} fully repaired!`);
  };

  // UPGRADE single bot part
  const upgradePart = (botId: string, partName: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;

    const part = bot.parts.find(p => p.name === partName);
    if (!part) return;

    if (part.level >= part.maxLevel) {
      setLastInteraction(`${part.name} is already at max level!`);
      return;
    }

    // Check cost
    const canAfford = part.upgradeCost.every(cost => {
      const r = resources.find(x => x.name === cost.name);
      return r && r.amount >= cost.amount;
    });
    if (!canAfford) {
      setLastInteraction(`Not enough resources to upgrade ${part.name}!`);
      return;
    }

    // Deduct from inventory
    setResources(prev => {
      const copy = [...prev];
      part.upgradeCost.forEach(cost => {
        const idx = copy.findIndex(x => x.name === cost.name);
        if (idx !== -1) copy[idx].amount -= cost.amount;
      });
      return copy;
    });

    // Increase level by 1
    const updatedParts = bot.parts.map(p => {
      if (p.name === partName) {
        return { ...p, level: p.level + 1 };
      }
      return p;
    });

    // Update bot
    updateBotState(botId, { parts: updatedParts });
    setLastInteraction(`Upgraded ${partName} to level ${part.level + 1}!`);
  };

  // Building a new bot
  const buildBotCost: Resource[] = [
    { name: 'bolts', amount: 10 },
    { name: 'magnets', amount: 5 },
    { name: 'wires', amount: 5 },
  ];
  const canBuildBot = buildBotCost.every(cost => {
    const r = resources.find(x => x.name === cost.name);
    return r && r.amount >= cost.amount;
  });

  const buildBot = () => {
    if (!canBuildBot) {
      setLastInteraction('Not enough resources to build a new bot!');
      return;
    }
    setResources(prev => {
      const copy = [...prev];
      buildBotCost.forEach(cost => {
        const idx = copy.findIndex(r => r.name === cost.name);
        if (idx !== -1) copy[idx].amount -= cost.amount;
      });
      return copy;
    });
    const newBotId = `bot-${bots.length + 1}`;
    const botNames = ['C3-vxx', 'ZX-12', 'VX-99', 'SM-33'];
    const randomName = botNames[bots.length % botNames.length] + `-${bots.length + 1}`;
    const randomEmoji = botEmojis[Math.floor(Math.random() * botEmojis.length)];
    const template = Math.floor(Math.random() * 3) + 1;
    const asciiArt = generateAsciiBotTemplate(randomEmoji, normalFace, template);

    const newBot: Bot = {
      id: newBotId,
      name: randomName,
      energy: 100,
      happiness: 100,
      damage: 0,
      parts: defaultParts.map(p => ({ ...p })), // brand new parts
      upgrades: defaultUpgrades.map(u => ({ ...u })),
      isOnMission: false,
      missionTimeLeft: null,
      asciiArt,
    };
    setBots(prev => [...prev, newBot]);
    setActiveBot(newBotId);
    setLastInteraction(`New bot built: ${newBot.name}!`);
  };

  return (
    <div className="terminal-container">
      <div className="relative screen rounded-xl overflow-hidden shadow-[0_0_20px_rgba(74,246,38,0.2)] border border-[#4af626]/20 crt">
        <div className="relative font-mono text-[#4af626] p-8">
          {/* Title / Header */}
          <div className="text-xs mb-6 flex flex-col gap-1 terminal-glow opacity-50 text-center">
            <div>ROBOPET v1.0.0 - TERMINAL MODE</div>
            <div>SYSTEM ACTIVE...</div>
          </div>

          {/* Bot Switching */}
          <div className="mb-6 text-center">
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

          {/* Main 3-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Left Column: ASCII Bot + Charge/Play + Repair */}
            <div className="text-center mb-6">
              <pre className="text-3xl whitespace-pre leading-tight terminal-glow">
                {currentBot.asciiArt}
              </pre>
              {currentBot.isOnMission && currentBot.missionTimeLeft !== null && (
                <div className="text-xl terminal-glow animate-pulse">
                  T-{currentBot.missionTimeLeft}s
                </div>
              )}
              <div className="flex gap-2 justify-center mt-4 flex-wrap">
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
                <button
                  onClick={() => repairBot(currentBot)}
                  className="px-3 py-1 border border-[#4af626]/50 terminal-glow hover:bg-[#4af626]/10 hover:border-[#4af626] transition-colors duration-150 text-[#4af626]"
                >
                  [REPAIR]
                </button>
              </div>
            </div>

            {/* Middle Column: Toggle between Stats and Components */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg terminal-glow">
                  {showComponents ? 'Bot Components' : 'Bot Stats'}
                </h2>
                <button
                  onClick={() => setShowComponents(!showComponents)}
                  className="px-2 py-1 border border-[#4af626]/50 text-xs terminal-glow hover:bg-[#4af626]/10 hover:border-[#4af626]"
                >
                  {showComponents ? '[VIEW STATS]' : '[VIEW COMPONENTS]'}
                </button>
              </div>

              {!showComponents ? (
                // STATS VIEW
                <div className="border border-[#4af626]/30 p-4 rounded">
                  <p><strong>Name:</strong> {currentBot.name}</p>
                  <p><strong>Energy:</strong> ⚡ {currentBot.energy}%</p>
                  <p><strong>Happiness:</strong> ❤️ {currentBot.happiness}%</p>
                  <p><strong>Damage:</strong> {currentBot.damage}%</p>
                </div>
              ) : (
                // COMPONENTS VIEW
                <div className="border border-[#4af626]/30 p-4 rounded space-y-4">
                  {currentBot.parts.map(part => (
                    <div key={part.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400">
                          {part.name} (Level {part.level}/{part.maxLevel})
                        </p>
                      </div>
                      <button
                        disabled={part.level >= part.maxLevel}
                        onClick={() => upgradePart(currentBot.id, part.name)}
                        className="ml-4 px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed text-[#4af626]"
                      >
                        [UPGRADE]
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Missions */}
            <div>
              <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} MISSIONS</div>
              <div className="space-y-2 flex flex-col items-center border border-[#4af626]/30 p-4 rounded">
                {missions.map(m => (
                  <button
                    key={m.name}
                    onClick={() => startMission(m)}
                    disabled={currentBot.isOnMission || currentBot.energy < m.requiredBatteryLevel}
                    className="w-full text-left text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                  >
                    [{m.name}]
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory + Build Bot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Inventory */}
            <div className="border border-[#4af626]/30 p-4 rounded">
              <div className="text-xs mb-2 text-[#4af626]/50 text-center">{'>>'} INVENTORY</div>
              <div className="space-y-1 text-center">
                {resources.map(r => (
                  <div key={r.name} className="font-mono text-sm terminal-glow">
                    [{r.name.toUpperCase()}: {r.amount}]
                  </div>
                ))}
              </div>
            </div>

            {/* Build Bot */}
            <div className="border border-[#4af626]/30 p-4 rounded text-center">
              <div className="text-xs mb-2 text-[#4af626]/50">{'>>'} BUILD NEW BOT</div>
              <button
                onClick={buildBot}
                disabled={!canBuildBot}
                className="w-full text-center text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
              >
                [BUILD NEW BOT]
              </button>
              <div className="text-xs opacity-70 mt-1">
                {'>>'} Cost: {buildBotCost.map(c => `${c.amount} ${c.name}`).join(', ')}
              </div>
            </div>
          </div>

          {/* Last Interaction / Log */}
          <div className="text-xs text-[#4af626]/70 border-t border-[#4af626]/20 mt-6 pt-4 terminal-glow text-center">
            {'>>'} {lastInteraction || 'Awaiting command...'}
            {cursorVisible ? '_' : ' '}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotPet;

