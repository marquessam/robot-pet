'use client';
import React, { useState, useEffect } from 'react';

/* ------------------------------
   TYPES & INTERFACES
------------------------------ */
interface Resource {
  name: string;
  amount: number;
}

interface ComponentLevel {
  name: string;           
  effectDescription: string;
  damageReduction?: number;     
  rewardMultiplier?: number;    
  timeReduction?: number;       
}

interface BotPart {
  partName: string;           
  currentLevelIndex: number;  
  levels: ComponentLevel[];   
  maxLevel: number;
  upgradeCost: Resource[];
}

interface Upgrade {
  name: string;
  cost: Resource[];
  applied: boolean;
  effect: string;
}

interface Bot {
  id: string;
  name: string;
  energy: number;
  happiness: number;
  damage: number;
  parts: BotPart[];    
  upgrades: Upgrade[]; 
  isOnMission: boolean;
  missionTimeLeft: number | null;
  asciiArt: string;    
}

interface Mission {
  name: string;
  energyCost: number;
  happinessCost: number;
  baseDuration: number;
  rewards: Resource[];
  requiredBatteryLevel: number;
  requiredSensorsLevel?: number;
  requiredWheelsLevel?: number;
}

/* ------------------------------
   DEFAULT DATA
------------------------------ */
const initialResources: Resource[] = [
  { name: 'bolts', amount: 10 },
  { name: 'magnets', amount: 5 },
  { name: 'wires', amount: 8 },
  { name: 'circuit', amount: 3 },
];

const CHASSIS_LEVELS: ComponentLevel[] = [
  {
    name: 'Basic',
    effectDescription: 'Basic chassis',
    damageReduction: 0.05,
  },
  {
    name: 'Iron',
    effectDescription: 'Better armor',
    damageReduction: 0.15,
  },
  {
    name: 'Alloy',
    effectDescription: 'Advanced',
    damageReduction: 0.3,
  },
  {
    name: 'Ultra',
    effectDescription: 'Maximum',
    damageReduction: 0.5,
  },
];

const SENSORS_LEVELS: ComponentLevel[] = [
  {
    name: 'Basic',
    effectDescription: 'Basic scan',
    rewardMultiplier: 1.0,
  },
  {
    name: 'Advanced',
    effectDescription: 'Better scan',
    rewardMultiplier: 1.2,
  },
  {
    name: 'Quantum',
    effectDescription: 'Best scan',
    rewardMultiplier: 1.5,
  },
];

const WHEELS_LEVELS: ComponentLevel[] = [
  {
    name: 'Basic',
    effectDescription: 'Basic move',
    timeReduction: 0.0,
  },
  {
    name: 'Heavy',
    effectDescription: 'Faster',
    timeReduction: 0.2,
  },
  {
    name: 'Hover',
    effectDescription: 'Fastest',
    timeReduction: 0.4,
  },
];

const defaultParts: BotPart[] = [
  {
    partName: 'Chassis',
    currentLevelIndex: 0,
    levels: CHASSIS_LEVELS,
    maxLevel: CHASSIS_LEVELS.length - 1,
    upgradeCost: [
      { name: 'bolts', amount: 4 },
      { name: 'wires', amount: 2 },
    ],
  },
  {
    partName: 'Sensors',
    currentLevelIndex: 0,
    levels: SENSORS_LEVELS,
    maxLevel: SENSORS_LEVELS.length - 1,
    upgradeCost: [
      { name: 'magnets', amount: 2 },
      { name: 'circuit', amount: 1 },
    ],
  },
  {
    partName: 'Wheels',
    currentLevelIndex: 0,
    levels: WHEELS_LEVELS,
    maxLevel: WHEELS_LEVELS.length - 1,
    upgradeCost: [
      { name: 'bolts', amount: 2 },
      { name: 'wires', amount: 2 },
    ],
  },
];

const defaultUpgrades: Upgrade[] = [];

const missions: Mission[] = [
  {
    name: 'SCRAP SEARCH',
    energyCost: 20,
    happinessCost: 10,
    baseDuration: 10,
    requiredBatteryLevel: 30,
    rewards: [{ name: 'bolts', amount: 2 }, { name: 'wires', amount: 1 }],
  },
  {
    name: 'FACTORY',
    energyCost: 40,
    happinessCost: 20,
    baseDuration: 20,
    requiredBatteryLevel: 50,
    rewards: [
      { name: 'magnets', amount: 2 },
      { name: 'wires', amount: 2 },
      { name: 'bolts', amount: 1 },
    ],
    requiredSensorsLevel: 1,
    requiredWheelsLevel: 1,
  },
  {
    name: 'WAREHOUSE',
    energyCost: 30,
    happinessCost: 15,
    baseDuration: 15,
    requiredBatteryLevel: 40,
    rewards: [
      { name: 'wires', amount: 3 },
      { name: 'bolts', amount: 1 },
      { name: 'circuit', amount: 1 },
    ],
    requiredWheelsLevel: 1,
  },
];

const RobotPet = () => {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [bots, setBots] = useState<Bot[]>([
    {
      id: 'bot-1',
      name: 'SM-33',
      energy: 100,
      happiness: 100,
      damage: 0,
      parts: defaultParts.map((p) => ({ ...p })),
      upgrades: defaultUpgrades.map((u) => ({ ...u })),
      isOnMission: false,
      missionTimeLeft: null,
      asciiArt: '',
    },
  ]);
  const [activeBot, setActiveBot] = useState<string>('bot-1');
  const [lastInteraction, setLastInteraction] = useState('');
  const [showComponents, setShowComponents] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);
  const [currentMenu, setCurrentMenu] = useState<'main' | 'missions' | 'parts'>('main');

  const currentBot = bots.find((b) => b.id === activeBot)!;

  // Update bot helper
  const updateBotState = (botId: string, updates: Partial<Bot>) => {
    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, ...updates } : b))
    );
  };

  /* ---- Cursor blink ---- */
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  /* ---- If mission is active ---- */
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

  /* ---- Bot "dies" at 0 energy ---- */
  useEffect(() => {
    if (currentBot && currentBot.energy <= 0) {
      setLastInteraction('BOT SHUTDOWN');
      const salvage = [
        { name: 'bolts', amount: 5 },
        { name: 'magnets', amount: 2 },
        { name: 'wires', amount: 2 },
        { name: 'circuit', amount: 1 },
      ];
      setResources((prev) => {
        const newResources = [...prev];
        salvage.forEach((s) => {
          const idx = newResources.findIndex((r) => r.name === s.name);
          if (idx !== -1) newResources[idx].amount += s.amount;
        });
        return newResources;
      });
      setBots((prev) => prev.filter((b) => b.id !== currentBot.id));
    }
  }, [currentBot?.energy, currentBot]);

  const startMission = (mission: Mission) => {
    if (currentBot.energy < mission.requiredBatteryLevel) {
      setLastInteraction('LOW POWER!');
      return;
    }
    if (currentBot.isOnMission) {
      setLastInteraction('ON MISSION!');
      return;
    }

    const sensorsPart = currentBot.parts.find((p) => p.partName === 'Sensors');
    const wheelsPart = currentBot.parts.find((p) => p.partName === 'Wheels');

    if (mission.requiredSensorsLevel !== undefined &&
        (!sensorsPart || sensorsPart.currentLevelIndex < mission.requiredSensorsLevel)) {
      setLastInteraction('NEED BETTER SENSORS!');
      return;
    }
    if (mission.requiredWheelsLevel !== undefined &&
        (!wheelsPart || wheelsPart.currentLevelIndex < mission.requiredWheelsLevel)) {
      setLastInteraction('NEED BETTER WHEELS!');
      return;
    }

    const newEnergy = Math.max(0, currentBot.energy - mission.energyCost);
    const newHappiness = Math.max(0, currentBot.happiness - mission.happinessCost);

    let finalDuration = mission.baseDuration;
    if (wheelsPart) {
      const wheelsLevel = wheelsPart.levels[wheelsPart.currentLevelIndex];
      if (wheelsLevel.timeReduction) {
        finalDuration = Math.floor(
          finalDuration * (1 - wheelsLevel.timeReduction)
        );
      }
    }

    updateBotState(currentBot.id, {
      isOnMission: true,
      missionTimeLeft: finalDuration,
      energy: newEnergy,
      happiness: newHappiness,
    });

    setLastInteraction(`MISSION: ${mission.name}`);
    setTimeout(() => {
      completeMission(mission);
    }, finalDuration * 1000);
  };

  const completeMission = (mission: Mission) => {
    let newDamage = currentBot.damage;
    let missionDamage = 10;
    const chassisPart = currentBot.parts.find((p) => p.partName === 'Chassis');
    if (chassisPart) {
      const chassisLevel = chassisPart.levels[chassisPart.currentLevelIndex];
      if (chassisLevel.damageReduction) {
        missionDamage = Math.floor(
          missionDamage * (1 - chassisLevel.damageReduction)
        );
      }
    }
    newDamage = Math.min(100, newDamage + missionDamage);

    let rewardMultiplier = 1.0;
    const sensorsPart = currentBot.parts.find((p) => p.partName === 'Sensors');
    if (sensorsPart) {
      const sensorsLevel = sensorsPart.levels[sensorsPart.currentLevelIndex];
      if (sensorsLevel.rewardMultiplier) {
        rewardMultiplier = sensorsLevel.rewardMultiplier;
      }
    }

    updateBotState(currentBot.id, {
      isOnMission: false,
      missionTimeLeft: null,
      damage: newDamage,
    });

    setResources((prev) => {
      const newResources = [...prev];
      mission.rewards.forEach((reward) => {
        const idx = newResources.findIndex((r) => r.name === reward.name);
        if (idx !== -1) {
          newResources[idx].amount += Math.ceil(reward.amount * rewardMultiplier);
        }
      });
      return newResources;
    });

    setLastInteraction('MISSION COMPLETE!');
  };

  const charge = () => {
    const newEnergy = Math.min(100, currentBot.energy + 20);
    updateBotState(currentBot.id, { energy: newEnergy });
    setLastInteraction('CHARGING...');
  };

  const play = () => {
    if (currentBot.energy < 10) {
      setLastInteraction('TOO TIRED!');
      return;
    }
    const newEnergy = Math.max(0, currentBot.energy - 10);
    const newHappiness = Math.min(100, currentBot.happiness + 15);
    updateBotState(currentBot.id, { energy: newEnergy, happiness: newHappiness });
    setLastInteraction('PLAYING!');
  };

  const repairBot = (bot: Bot) => {
    if (bot.damage <= 0) {
      setLastInteraction('NO DAMAGE!');
      return;
    }
    const blocks = Math.ceil(bot.damage / 10);
    const neededBolts = blocks * 2;
    const neededWires = blocks;

    const hasBolts = resources.find((r) => r.name === 'bolts')!.amount >= neededBolts;
    const hasWires = resources.find((r) => r.name === 'wires')!.amount >= neededWires;
    
    if (!hasBolts || !hasWires) {
      setLastInteraction('NEED RESOURCES!');
      return;
    }

    setResources((prev) => {
      const copy = [...prev];
      copy.find((r) => r.name === 'bolts')!.amount -= neededBolts;
      copy.find((r) => r.name === 'wires')!.amount -= neededWires;
      return copy;
    });

    updateBotState(bot.id, { damage: 0 });
    setLastInteraction('REPAIRED!');
  };

  const upgradePart = (botId: string, partName: string) => {
    const bot = bots.find((b) => b.id === botId);
    if (!bot) return;

    const part = bot.parts.find((p) => p.partName === partName);
    if (!part) return;

   if (part.currentLevelIndex >= part.maxLevel) {
      setLastInteraction('MAX LEVEL!');
      return;
    }

    const canAfford = part.upgradeCost.every((cost) => {
      const r = resources.find((x) => x.name === cost.name);
      return r && r.amount >= cost.amount;
    });
    
    if (!canAfford) {
      setLastInteraction('NEED RESOURCES!');
      return;
    }

    setResources((prev) => {
      const copy = [...prev];
      part.upgradeCost.forEach((cost) => {
        const idx = copy.findIndex((x) => x.name === cost.name);
        if (idx !== -1) copy[idx].amount -= cost.amount;
      });
      return copy;
    });

    const newIndex = part.currentLevelIndex + 1;
    const updatedParts = bot.parts.map((p) => {
      if (p.partName === partName) {
        return { ...p, currentLevelIndex: newIndex };
      }
      return p;
    });
    updateBotState(botId, { parts: updatedParts });

    const newLevelName = part.levels[newIndex].name;
    setLastInteraction(`UPGRADED: ${newLevelName}!`);
  };

  const buildBotCost: Resource[] = [
    { name: 'bolts', amount: 10 },
    { name: 'magnets', amount: 5 },
    { name: 'wires', amount: 5 },
  ];
  
  const canBuildBot = buildBotCost.every((cost) => {
    const r = resources.find((x) => x.name === cost.name);
    return r && r.amount >= cost.amount;
  });

  const buildBot = () => {
    if (!canBuildBot) {
      setLastInteraction('NEED RESOURCES!');
      return;
    }

    setResources((prev) => {
      const copy = [...prev];
      buildBotCost.forEach((cost) => {
        const idx = copy.findIndex((r) => r.name === cost.name);
        if (idx !== -1) copy[idx].amount -= cost.amount;
      });
      return copy;
    });

    const newBotId = `bot-${bots.length + 1}`;
    const botNames = ['C3-VX', 'ZX-12', 'VX-99', 'SM-33', 'RX-42', 'JR-88'];
    const randomName = botNames[bots.length % botNames.length];

    const newBot: Bot = {
      id: newBotId,
      name: randomName,
      energy: 100,
      happiness: 100,
      damage: 0,
      parts: defaultParts.map((p) => ({ ...p })),
      upgrades: defaultUpgrades.map((u) => ({ ...u })),
      isOnMission: false,
      missionTimeLeft: null,
      asciiArt: '',
    };

    setBots((prev) => [...prev, newBot]);
    setActiveBot(newBotId);
    setLastInteraction(`NEW BOT: ${newBot.name}!`);
  };

  const renderMainMenu = () => (
    <div className="grid grid-cols-2 gap-2">
      <button 
        onClick={charge}
        className={`p-1 ${menuIndex === 0 ? 'bg-[#0F380F] text-[#9BBC0F]' : ''}`}
        onMouseEnter={() => setMenuIndex(0)}
      >
        CHARGE
      </button>
      <button 
        onClick={play}
        className={`p-1 ${menuIndex === 1 ? 'bg-[#0F380F] text-[#9BBC0F]' : ''}`}
        onMouseEnter={() => setMenuIndex(1)}
      >
        PLAY
      </button>
      <button 
        onClick={() => repairBot(currentBot)}
        className={`p-1 ${menuIndex === 2 ? 'bg-[#0F380F] text-[#9BBC0F]' : ''}`}
        onMouseEnter={() => setMenuIndex(2)}
      >
        REPAIR
      </button>
      <button 
        onClick={() => setCurrentMenu('missions')}
        className={`p-1 ${menuIndex === 3 ? 'bg-[#0F380F] text-[#9BBC0F]' : ''}`}
        onMouseEnter={() => setMenuIndex(3)}
      >
        MISSION
      </button>
      <button 
        onClick={() => setCurrentMenu('parts')}
        className={`p-1 ${menuIndex === 4 ? 'bg-[#0F380F] text-[#9BBC0F]' : ''}`}
        onMouseEnter={() => setMenuIndex(4)}
      >
        PARTS
      </button>
      <button 
        onClick={buildBot}
        disabled={!canBuildBot}
        className={`p-1 ${menuIndex === 5 ? 'bg-[#0F380F] text-[#9BBC0F]' : ''} disabled:opacity-50`}
        onMouseEnter={() => setMenuIndex(5)}
      >
        BUILD
      </button>
    </div>
  );

  const renderMissionsMenu = () => (
    <div className="space-y-2">
      {missions.map((mission, idx) => (
        <button
          key={mission.name}
          onClick={() => startMission(mission)}
          disabled={currentBot.isOnMission || currentBot.energy < mission.requiredBatteryLevel}
          className={`w-full p-1 text-left ${menuIndex === idx ? 'bg-[#0F380F] text-[#9BBC0F]' : ''} disabled:opacity-50`}
          onMouseEnter={() => setMenuIndex(idx)}
        >
          {mission.name}
        </button>
      ))}
      <button
        onClick={() => setCurrentMenu('main')}
        className={`w-full p-1 text-left ${menuIndex === missions.length ? 'bg-[#0F380F] text-[#9BBC0F]' : ''}`}
        onMouseEnter={() => setMenuIndex(missions.length)}
      >
        BACK
      </button>
    </div>
  );

  const renderPartsMenu = () => (
    <div className="space-y-2">
      {currentBot.parts.map((part, idx) => (
        <button
          key={part.partName}
          onClick={() => upgradePart(currentBot.id, part.partName)}
          disabled={part.currentLevelIndex >= part.maxLevel}
          className={`w-full p-1 text-left ${menuIndex === idx ? 'bg-[#0F380F] text-[#9BBC0F]' : ''} disabled:opacity-50`}
          onMouseEnter={() => setMenuIndex(idx)}
        >
          {part.partName}: LV{part.currentLevelIndex + 1}
        </button>
      ))}
      <button
        onClick={() => setCurrentMenu('main')}
        className={`w-full p-1 text-left ${menuIndex === currentBot.parts.length ? 'bg-[#0F380F] text-[#9BBC0F]' : ''}`}
        onMouseEnter={() => setMenuIndex(currentBot.parts.length)}
      >
        BACK
      </button>
    </div>
  );

  return (
    <div className="terminal-container">
      <div className="relative screen rounded-xl overflow-hidden shadow-[0_0_20px_rgba(74,246,38,0.2)] border border-[#4af626]/20 crt">
        <div className="relative font-mono text-[#4af626] p-8">
          {/* Header Status */}
          <div className="text-xs mb-6">
            <div>BOT:{currentBot.name} PWR:{currentBot.energy}</div>
            <div className="mt-1">
              {resources.map((r) => (
                <span key={r.name} className="mr-3">
                  {r.name}:{r.amount}
                </span>
              ))}
            </div>
          </div>

          {/* Main Layout - 3 columns */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Bot Display */}
            <div className="text-center">
              <div className="mb-4">
                <pre className="text-sm whitespace-pre terminal-glow">
                  {currentBot.asciiArt || `
        .=====.
     .-(       )-.
    /    [o--o]    \\
   |  |  =====  |  |
    \\ |_________| /
     '-._______.-'
       //     \\\\
      //       \\\\
     []         []
                  `}
                </pre>
              </div>
              {currentBot.isOnMission && (
                <div className="text-sm terminal-glow animate-pulse">
                  MISSION: {currentBot.missionTimeLeft}s
                </div>
              )}
            </div>

            {/* Middle Column - Stats & Active Menu */}
            <div>
              {/* Stats */}
              <div className="mb-4 space-y-1">
                <div>ENRG{currentBot.energy}/100</div>
                <div>HAPP{currentBot.happiness}/100</div>
                <div>DMG{currentBot.damage}/100</div>
              </div>

              {/* Menu Content */}
              <div className="space-y-2">
                {currentMenu === 'parts' && (
                  <>
                    <div className="text-xs mb-2">>> BOT COMPONENTS</div>
                    {currentBot.parts.map((part) => (
                      <div key={part.partName} className="mb-3">
                        <div className="flex justify-between items-center">
                          <span>{part.partName}: LV{part.currentLevelIndex + 1}</span>
                          <button
                            onClick={() => upgradePart(currentBot.id, part.partName)}
                            disabled={part.currentLevelIndex >= part.maxLevel}
                            className="px-2 py-1 text-sm"
                          >
                            [UPGRADE]
                          </button>
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {part.levels[part.currentLevelIndex].effectDescription}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setCurrentMenu('main')}
                      className="w-full text-left"
                    >
                      [BACK]
                    </button>
                  </>
                )}

                {currentMenu === 'missions' && (
                  <>
                    <div className="text-xs mb-2">>> AVAILABLE MISSIONS</div>
                    {missions.map((mission) => (
                      <button
                        key={mission.name}
                        onClick={() => startMission(mission)}
                        disabled={currentBot.isOnMission || currentBot.energy < mission.requiredBatteryLevel}
                        className="w-full text-left mb-2"
                      >
                        [{mission.name}]
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentMenu('main')}
                      className="w-full text-left"
                    >
                      [BACK]
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Main Actions */}
            <div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={charge} disabled={currentBot.isOnMission}>
                  [CHARGE]
                </button>
                <button onClick={play} disabled={currentBot.energy < 10 || currentBot.isOnMission}>
                  [PLAY]
                </button>
                <button onClick={() => repairBot(currentBot)}>
                  [REPAIR]
                </button>
                <button onClick={() => setCurrentMenu('missions')}>
                  [MISSION]
                </button>
                <button onClick={() => setCurrentMenu('parts')}>
                  [PARTS]
                </button>
                <button onClick={buildBot} disabled={!canBuildBot}>
                  [BUILD]
                </button>
              </div>

              {/* Bot Switching */}
              {bots.length > 1 && (
                <div className="mt-4">
                  <div className="text-xs mb-2">>> SWITCH BOT</div>
                  <div className="flex flex-wrap gap-2">
                    {bots.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => setActiveBot(bot.id)}
                        disabled={bot.id === activeBot}
                        className="px-2 py-1"
                      >
                        [{bot.name}]
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Line */}
          <div className="mt-6 pt-4 border-t border-[#4af626]/30 text-sm">
            >> {lastInteraction || 'What should BOT do?'}
            {cursorVisible ? '_' : ' '}
          </div>
        </div>
      </div>
    </div>
);

export default RobotPet
