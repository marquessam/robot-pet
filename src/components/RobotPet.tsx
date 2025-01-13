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
  // Each "level" has a name and effect explanation
  name: string;           // e.g. "Meyers Tin Chassis"
  effectDescription: string;
  damageReduction?: number;      // for chassis
  rewardMultiplier?: number;     // for sensors
  timeReduction?: number;        // for wheels
}

interface BotPart {
  partName: string;            // e.g. "Chassis", "Sensors", "Wheels"
  currentLevelIndex: number;   // which index in levels array
  levels: ComponentLevel[];    // array of possible levels
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
  parts: BotPart[];    // chassis, sensors, wheels, etc.
  upgrades: Upgrade[]; // old upgrade system (if you keep it)
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
  requiredSensorsLevel?: number; // Optional requirement
  requiredWheelsLevel?: number;  // Optional requirement
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

// Example: Named levels for the CHASSIS
// Each level describes how it helps with missions, etc.
const CHASSIS_LEVELS: ComponentLevel[] = [
  {
    name: 'Meyers Tin Chassis',
    effectDescription: 'Basic chassis. Minimal damage protection.',
    damageReduction: 0.05, // reduces 5% of damage from missions
  },
  {
    name: 'Mark II Iron Chassis',
    effectDescription: 'Offers decent damage reduction from missions.',
    damageReduction: 0.15,
  },
  {
    name: 'Hyperion Alloy Chassis',
    effectDescription: 'High-tech alloy. Significantly reduces mission damage.',
    damageReduction: 0.3,
  },
  {
    name: 'DuraSteel Ultra Frame',
    effectDescription: 'Top-tier chassis, drastically reduces damage in missions.',
    damageReduction: 0.5,
  },
];

// Example: Named levels for the SENSORS
const SENSORS_LEVELS: ComponentLevel[] = [
  {
    name: 'Basic Scanners',
    effectDescription: 'Low-tier sensors. Standard resource detection.',
    rewardMultiplier: 1.0,
  },
  {
    name: 'Advanced Scanners',
    effectDescription: 'Find more components on missions. Unlock mid-tier missions.',
    rewardMultiplier: 1.2,
  },
  {
    name: 'Quantum Array Sensors',
    effectDescription: 'Cutting-edge sensors for maximum resource gain.',
    rewardMultiplier: 1.5,
  },
];

// Example: Named levels for the WHEELS
const WHEELS_LEVELS: ComponentLevel[] = [
  {
    name: 'Standard Wheels',
    effectDescription: 'Basic mobility system. Normal mission time.',
    timeReduction: 0.0,
  },
  {
    name: 'Heavy-Duty Treads',
    effectDescription: 'Faster travel. 20% reduced mission time. Unlock mid-tier missions.',
    timeReduction: 0.2,
  },
  {
    name: 'Hover Drive',
    effectDescription: 'High-tech hover system. 40% reduced mission time.',
    timeReduction: 0.4,
  },
];

// Define the default parts array for a fresh bot
const defaultParts: BotPart[] = [
  {
    partName: 'Chassis',
    currentLevelIndex: 0, // start at 0 => "Meyers Tin Chassis"
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

// Upgrades array (if you still want to keep old upgrades)
const defaultUpgrades: Upgrade[] = [];

/* ------------------------------
   ASCII TEMPLATES
------------------------------ */
const normalFace = '[ o--o ]';
const blinkFace = '[ >--< ]';
const happyFace1 = '[^--^]';
const happyFace2 = '[ >--< ]';
const angryFace1 = '[.\\--/.]';
const angryFace2 = '[./--\\.]';

const generateAsciiBotTemplate = (face: string, template: number): string => {
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
    case 4:
      return `
        .-----------.
       (   ${face}    )
       |-----------|
       |    ____   |
       |   (____)  |
       |    ====   |
       |           |
       '-----------'
       |   ||||   |
       |   ||||   |
       |___||||___|
`;
    default:
      // Fallback to #1
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
  }
};

/* ------------------------------
   ACTUAL COMPONENT
------------------------------ */
const RobotPet = () => {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [resources, setResources] = useState<Resource[]>(initialResources);

  // We create 1 initial "starter" bot with template #1
  const [bots, setBots] = useState<Bot[]>([
    {
      id: 'bot-1',
      name: 'SM-33',
      energy: 100,
      happiness: 100,
      damage: 0,
      parts: defaultParts.map((p) => ({ ...p })), // copy default
      upgrades: defaultUpgrades.map((u) => ({ ...u })),
      isOnMission: false,
      missionTimeLeft: null,
      asciiArt: generateAsciiBotTemplate(normalFace, 1),
    },
  ]);

  const [activeBot, setActiveBot] = useState<string>('bot-1');
  const [lastInteraction, setLastInteraction] = useState('');
  const [showComponents, setShowComponents] = useState(false);

  const currentBot = bots.find((b) => b.id === activeBot)!;

  // Helper to update a bot
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

  /* ---- Idle blinking/facial expression ---- */
  useEffect(() => {
    if (!currentBot.isOnMission) {
      let frames = [blinkFace, normalFace];
      if (currentBot.happiness > 80) frames = [happyFace1, happyFace2];
      else if (currentBot.happiness < 20) frames = [angryFace1, angryFace2];

      let index = 0;
      const blinkInterval = setInterval(() => {
        // Always use template #1 for face blinking
        updateBotState(currentBot.id, {
          asciiArt: generateAsciiBotTemplate(frames[index], 1),
        });
        index = (index + 1) % frames.length;
      }, 1000);

      return () => clearInterval(blinkInterval);
    }
  }, [currentBot.isOnMission, currentBot.happiness, currentBot.id]);

  /* ---- If mission is almost done (3s left), show "Returning..." ---- */
  useEffect(() => {
    if (currentBot.isOnMission && currentBot.missionTimeLeft !== null && currentBot.missionTimeLeft <= 3) {
      updateBotState(currentBot.id, { asciiArt: 'Returning...' });
    }
  }, [currentBot.isOnMission, currentBot.missionTimeLeft, currentBot.id]);

  /* ---- Bot "dies" at 0 energy => salvage ---- */
  useEffect(() => {
    if (currentBot && currentBot.energy <= 0) {
      setLastInteraction(`${currentBot.name} has died. Salvaging...`);
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
      setBots((prev) => {
        const updated = prev.filter((b) => b.id !== currentBot.id);
        if (updated.length > 0) setActiveBot(updated[0].id);
        else setActiveBot('');
        return updated;
      });
    }
  }, [currentBot?.energy, currentBot]);

  /* ---- Decrement mission time ---- */
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

  /* ------------------------------
     MISSIONS
     (We can lock some behind sensors/wheels level)
  ------------------------------ */
  const missions: Mission[] = [
    {
      name: 'Scrap Yard Search',
      energyCost: 20,
      happinessCost: 10,
      baseDuration: 10,
      requiredBatteryLevel: 30,
      rewards: [{ name: 'bolts', amount: 2 }, { name: 'wires', amount: 1 }],
    },
    {
      name: 'Factory Exploration',
      energyCost: 40,
      happinessCost: 20,
      baseDuration: 20,
      requiredBatteryLevel: 50,
      rewards: [
        { name: 'magnets', amount: 2 },
        { name: 'wires', amount: 2 },
        { name: 'bolts', amount: 1 },
      ],
      requiredSensorsLevel: 1, // Requires advanced sensors (level >=1)
      requiredWheelsLevel: 1,  // Also requires wheels level >=1
    },
    {
      name: 'Abandoned Warehouse',
      energyCost: 30,
      happinessCost: 15,
      baseDuration: 15,
      requiredBatteryLevel: 40,
      rewards: [
        { name: 'wires', amount: 3 },
        { name: 'bolts', amount: 1 },
        { name: 'circuit', amount: 1 },
      ],
      requiredSensorsLevel: 0, // no sensor requirement
      requiredWheelsLevel: 1,  // requires wheels level >=1
    },
    {
      name: 'Underground Lab',
      energyCost: 50,
      happinessCost: 25,
      baseDuration: 30,
      requiredBatteryLevel: 60,
      rewards: [
        { name: 'magnets', amount: 4 },
        { name: 'circuit', amount: 2 },
        { name: 'wires', amount: 2 },
      ],
      requiredSensorsLevel: 2, // quantum array sensors needed
      requiredWheelsLevel: 1,
    },
    {
      name: 'Space Junk Salvage',
      energyCost: 70,
      happinessCost: 30,
      baseDuration: 40,
      requiredBatteryLevel: 80,
      rewards: [
        { name: 'bolts', amount: 5 },
        { name: 'magnets', amount: 3 },
        { name: 'wires', amount: 3 },
        { name: 'circuit', amount: 4 },
      ],
      requiredSensorsLevel: 2,
      requiredWheelsLevel: 2, 
    },
  ];

  const startMission = (mission: Mission) => {
    // Check battery
    if (currentBot.energy < mission.requiredBatteryLevel) {
      setLastInteraction('Not enough energy for this mission!');
      return;
    }
    // Already on mission?
    if (currentBot.isOnMission) {
      setLastInteraction('Already on a mission!');
      return;
    }

    // Check sensors/wheels level if specified
    const sensorsPart = currentBot.parts.find((p) => p.partName === 'Sensors');
    const wheelsPart = currentBot.parts.find((p) => p.partName === 'Wheels');

    if (mission.requiredSensorsLevel !== undefined) {
      if (!sensorsPart || sensorsPart.currentLevelIndex < mission.requiredSensorsLevel) {
        setLastInteraction('Your sensors are not advanced enough for that mission!');
        return;
      }
    }
    if (mission.requiredWheelsLevel !== undefined) {
      if (!wheelsPart || wheelsPart.currentLevelIndex < mission.requiredWheelsLevel) {
        setLastInteraction('Your wheels are not advanced enough for that mission!');
        return;
      }
    }

    // Energy & happiness cost
    const newEnergy = Math.max(0, currentBot.energy - mission.energyCost);
    const newHappiness = Math.max(0, currentBot.happiness - mission.happinessCost);

    // Calculate final duration based on wheels
    let finalDuration = mission.baseDuration;
    if (wheelsPart) {
      const wheelsLevel = wheelsPart.levels[wheelsPart.currentLevelIndex];
      if (wheelsLevel.timeReduction) {
        // e.g. 20% reduction => finalDuration = baseDuration * (1 - 0.2)
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
      asciiArt: '← Leaving...',
    });

    setLastInteraction(`Started mission: ${mission.name}`);
    setTimeout(() => {
      completeMission(mission, finalDuration);
    }, finalDuration * 1000);
  };

  // COMPLETE MISSION
  const completeMission = (mission: Mission, duration: number) => {
    // Re-calc damage taken, factoring chassis
    let newDamage = currentBot.damage;
    // Suppose each mission deals 10 damage base
    let missionDamage = 10;
    const chassisPart = currentBot.parts.find((p) => p.partName === 'Chassis');
    if (chassisPart) {
      const chassisLevel = chassisPart.levels[chassisPart.currentLevelIndex];
      if (chassisLevel.damageReduction) {
        // e.g. 0.3 => reduce damage by 30%
        missionDamage = Math.floor(
          missionDamage * (1 - chassisLevel.damageReduction)
        );
      }
    }
    newDamage = Math.min(100, newDamage + missionDamage);

    // Reward multiplier from sensors
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
      asciiArt: generateAsciiBotTemplate(normalFace, 1),
      damage: newDamage,
    });

    // Grant resources
    setResources((prev) => {
      const newResources = [...prev];
      mission.rewards.forEach((reward) => {
        const idx = newResources.findIndex((r) => r.name === reward.name);
        if (idx !== -1) {
          // Multiply the reward by sensor's rewardMultiplier
          newResources[idx].amount += Math.ceil(reward.amount * rewardMultiplier);
        }
      });
      return newResources;
    });

    setLastInteraction(
      `Mission Complete: ${mission.name}! Time: ${duration}s, took ${missionDamage} damage, collected resources!`
    );
  };

  /* ---- Basic Interactions (Charge, Play, Repair) ---- */
  const charge = () => {
    const newEnergy = Math.min(100, currentBot.energy + 20);
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

  const repairBot = (bot: Bot) => {
    if (bot.damage <= 0) {
      setLastInteraction('Bot is already fully repaired!');
      return;
    }
    // e.g. 2 bolts + 1 wire per 10 damage
    const blocks = Math.ceil(bot.damage / 10);
    const neededBolts = blocks * 2;
    const neededWires = blocks * 1;

    const hasBolts = resources.find((r) => r.name === 'bolts')!.amount >= neededBolts;
    const hasWires = resources.find((r) => r.name === 'wires')!.amount >= neededWires;
    if (!hasBolts || !hasWires) {
      setLastInteraction('Not enough resources to repair!');
      return;
    }

    // Deduct
    setResources((prev) => {
      const copy = [...prev];
      copy.find((r) => r.name === 'bolts')!.amount -= neededBolts;
      copy.find((r) => r.name === 'wires')!.amount -= neededWires;
      return copy;
    });

    // Set damage to 0
    updateBotState(bot.id, { damage: 0 });
    setLastInteraction(`${bot.name} fully repaired!`);
  };

  /* ---- Upgrade a Bot Part (Chassis, Sensors, Wheels) ---- */
  const upgradePart = (botId: string, partName: string) => {
    const bot = bots.find((b) => b.id === botId);
    if (!bot) return;

    const part = bot.parts.find((p) => p.partName === partName);
    if (!part) return;

    // Already at max?
    if (part.currentLevelIndex >= part.maxLevel) {
      setLastInteraction(`${partName} is already at the highest level!`);
      return;
    }

    // Check cost
    const canAfford = part.upgradeCost.every((cost) => {
      const r = resources.find((x) => x.name === cost.name);
      return r && r.amount >= cost.amount;
    });
    if (!canAfford) {
      setLastInteraction(`Not enough resources to upgrade ${partName}!`);
      return;
    }

    // Deduct cost
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
    setLastInteraction(`Upgraded ${partName} to: ${newLevelName}!`);
  };

  /* ---- Build a new bot with a different model than the original (template #1) ---- */
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
      setLastInteraction('Not enough resources to build a new bot!');
      return;
    }

    // Deduct resources
    setResources((prev) => {
      const copy = [...prev];
      buildBotCost.forEach((cost) => {
        const idx = copy.findIndex((r) => r.name === cost.name);
        if (idx !== -1) copy[idx].amount -= cost.amount;
      });
      return copy;
    });

    // We have 4 templates in generateAsciiBotTemplate (1..4).
    // The first bot used template #1. Let's pick randomly from 2..4
    // (Or you can do something else if you prefer.)
    const randomTemplate = Math.floor(Math.random() * 3) + 2; // picks 2, 3, or 4

    const newBotId = `bot-${bots.length + 1}`;
    const botNames = ['C3-vxx', 'ZX-12', 'VX-99', 'SM-33', 'RX-42', 'JR-88'];
    const randomName =
      botNames[bots.length % botNames.length] + `-${bots.length + 1}`;

    const newAscii = generateAsciiBotTemplate(normalFace, randomTemplate);

    const newBot: Bot = {
      id: newBotId,
      name: randomName,
      energy: 100,
      happiness: 100,
      damage: 0,
      parts: defaultParts.map((p) => ({ ...p })), // brand new, level 0 for each part
      upgrades: defaultUpgrades.map((u) => ({ ...u })),
      isOnMission: false,
      missionTimeLeft: null,
      asciiArt: newAscii,
    };

    setBots((prev) => [...prev, newBot]);
    setActiveBot(newBotId);
    setLastInteraction(`New bot built: ${newBot.name}!`);
  };

  /* ------------------------------
     RENDER
  ------------------------------ */
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
            <span className="text-xs terminal-glow opacity-70 mr-2">
              {'>>'} SWITCH BOT:
            </span>
            {bots.map((bot) => (
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

          {/* 3-column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Left Column: Bot + basic actions */}
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
                /* ----- STATS VIEW ----- */
                <div className="border border-[#4af626]/30 p-4 rounded space-y-1">
                  <p>
                    <strong>Name:</strong> {currentBot.name}
                  </p>
                  <p>
                    <strong>Energy:</strong> ⚡ {currentBot.energy}%
                  </p>
                  <p>
                    <strong>Happiness:</strong> ❤️ {currentBot.happiness}%
                  </p>
                  <p>
                    <strong>Damage:</strong> {currentBot.damage}%
                  </p>
                </div>
              ) : (
                /* ----- COMPONENTS VIEW ----- */
                <div className="border border-[#4af626]/30 p-4 rounded space-y-4">
                  {currentBot.parts.map((part) => {
                    const levelObj =
                      part.levels[part.currentLevelIndex];
                    return (
                      <div key={part.partName}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-400">
                              {part.partName}:
                              <br />
                              {levelObj.name}
                            </p>
                          </div>
                          <button
                            disabled={part.currentLevelIndex >= part.maxLevel}
                            onClick={() => upgradePart(currentBot.id, part.partName)}
                            className="px-2 py-1 border border-[#4af626]/50 text-xs hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed text-[#4af626]"
                          >
                            [UPGRADE]
                          </button>
                        </div>
                        <div className="text-xs opacity-70 ml-4 mt-1">
                          {levelObj.effectDescription}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Missions */}
            <div>
              <div className="text-xs mb-2 text-[#4af626]/50 text-center">
                {'>>'} MISSIONS
              </div>
              <div className="space-y-2 flex flex-col items-center border border-[#4af626]/30 p-4 rounded">
                {missions.map((m) => {
                  // Check if mission is locked out by sensor/wheel requirement
                  let isDisabled =
                    currentBot.isOnMission ||
                    currentBot.energy < m.requiredBatteryLevel;

                  // If mission requires certain sensor level:
                  const sensorsPart = currentBot.parts.find(
                    (p) => p.partName === 'Sensors'
                  );
                  if (
                    m.requiredSensorsLevel !== undefined &&
                    sensorsPart?.currentLevelIndex! < m.requiredSensorsLevel
                  ) {
                    isDisabled = true;
                  }
                  // If mission requires certain wheel level:
                  const wheelsPart = currentBot.parts.find(
                    (p) => p.partName === 'Wheels'
                  );
                  if (
                    m.requiredWheelsLevel !== undefined &&
                    wheelsPart?.currentLevelIndex! < m.requiredWheelsLevel
                  ) {
                    isDisabled = true;
                  }

                  return (
                    <button
                      key={m.name}
                      onClick={() => startMission(m)}
                      disabled={isDisabled}
                      className="w-full text-left text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
                    >
                      [{m.name}]
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Inventory + Build Bot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Inventory */}
            <div className="border border-[#4af626]/30 p-4 rounded">
              <div className="text-xs mb-2 text-[#4af626]/50 text-center">
                {'>>'} INVENTORY
              </div>
              <div className="space-y-1 text-center">
                {resources.map((r) => (
                  <div key={r.name} className="font-mono text-sm terminal-glow">
                    [{r.name.toUpperCase()}: {r.amount}]
                  </div>
                ))}
              </div>
            </div>

            {/* Build Bot */}
            <div className="border border-[#4af626]/30 p-4 rounded text-center">
              <div className="text-xs mb-2 text-[#4af626]/50">
                {'>>'} BUILD NEW BOT
              </div>
              <button
                onClick={buildBot}
                disabled={!canBuildBot}
                className="w-full text-center text-sm terminal-glow px-2 py-1 border border-[#4af626]/50 hover:bg-[#4af626]/10 hover:border-[#4af626] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 text-[#4af626]"
              >
                [BUILD NEW BOT]
              </button>
              <div className="text-xs opacity-70 mt-1">
                {'>>'} Cost:{' '}
                {buildBotCost.map((c) => `${c.amount} ${c.name}`).join(', ')}
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
