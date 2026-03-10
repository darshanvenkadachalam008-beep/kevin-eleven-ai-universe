import CharacterCard from '@/components/CharacterCard';
import { characters } from '@/data/characters';
import HeroScene from '@/components/HeroScene';

const Characters = () => {
  return (
    <div className="min-h-screen bg-background relative pt-20">
      {/* Background 3D */}
      <div className="fixed inset-0 z-0 opacity-40">
        <HeroScene />
      </div>

      <div className="relative z-10 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-center text-primary neon-text mb-3 tracking-wider">
            CHARACTER GALAXY
          </h1>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            Explore holographic AI personalities orbiting the Kevin Eleven universe
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char, i) => (
              <CharacterCard
                key={char.id}
                name={char.name}
                role={char.role}
                description={char.description}
                color={char.color}
                icon={char.icon}
                delay={i * 0.3}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Characters;
