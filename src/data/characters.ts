export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  icon: string;
}

export const characters: Character[] = [
  {
    id: 'alien-scientist',
    name: 'Dr. Zyx',
    role: 'Alien Scientist',
    description: 'A brilliant xenobiologist from the Andromeda galaxy, specializing in interdimensional physics and cosmic phenomena.',
    color: '#00f0ff',
    icon: '👽',
  },
  {
    id: 'cyberpunk-hacker',
    name: 'N3on',
    role: 'Cyberpunk Hacker',
    description: 'Elite netrunner who navigates the digital underworld, cracking encrypted systems with quantum algorithms.',
    color: '#ff00ff',
    icon: '🤖',
  },
  {
    id: 'space-pirate',
    name: 'Captain Vex',
    role: 'Space Pirate',
    description: 'Rogue starship commander sailing through asteroid belts, trading in rare cosmic artifacts across galaxies.',
    color: '#ff6600',
    icon: '🏴‍☠️',
  },
  {
    id: 'robot-companion',
    name: 'ARIA-7',
    role: 'Robot Companion',
    description: 'Empathetic AI companion designed for deep emotional connection, with encyclopedic knowledge of human culture.',
    color: '#8b5cf6',
    icon: '🦾',
  },
  {
    id: 'fantasy-wizard',
    name: 'Thalendris',
    role: 'Fantasy Wizard',
    description: 'Ancient techno-mage who blends arcane sorcery with quantum computing to reshape reality itself.',
    color: '#00ff88',
    icon: '🧙',
  },
  {
    id: 'time-traveler',
    name: 'Echo',
    role: 'Time Traveler',
    description: 'Chrono-navigator from the year 3047, witnessing pivotal moments across all timelines of existence.',
    color: '#ffcc00',
    icon: '⏳',
  },
];
