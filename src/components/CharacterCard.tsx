import { useState } from 'react';

interface CharacterCardProps {
  name: string;
  role: string;
  description: string;
  color: string;
  icon: string;
  delay?: number;
}

const CharacterCard = ({ name, role, description, color, icon, delay = 0 }: CharacterCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="holo-card rounded-xl p-6 cursor-pointer animate-float"
      style={{
        animationDelay: `${delay}s`,
        borderColor: isHovered ? color : undefined,
        boxShadow: isHovered ? `0 0 20px ${color}40, 0 0 60px ${color}15` : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}05)`,
          border: `1px solid ${color}40`,
          boxShadow: isHovered ? `0 0 15px ${color}50` : undefined,
        }}
      >
        {icon}
      </div>

      {/* Name */}
      <h3
        className="font-display text-sm font-bold text-center mb-1 tracking-wider uppercase"
        style={{ color }}
      >
        {name}
      </h3>

      {/* Role */}
      <p className="text-xs text-muted-foreground text-center mb-3 font-display tracking-wide">
        {role}
      </p>

      {/* Description */}
      <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
        {description}
      </p>

      {/* Chat button */}
      <button
        className="holo-btn w-full mt-4 py-2 px-4 rounded-lg text-xs relative z-10"
        style={{
          borderColor: `${color}40`,
          color,
        }}
      >
        <span className="relative z-10">Enter Chat</span>
      </button>
    </div>
  );
};

export default CharacterCard;
