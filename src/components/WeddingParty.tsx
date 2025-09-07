
import React from 'react';
import { User, Users } from 'lucide-react';

const bridalParty = {
  bridesmaids: [
    { name: 'Robyn Henney', role: 'Maid of Honor' },
    { name: 'Amy Henney', role: 'Bridesmaid' },
  ],
  groomsmen: [
    { name: 'Abel Mputu', role: 'Best Man' },
    { name: 'Keenan Titus', role: 'Groomsman' },
    { name: 'Marquin Titus', role: 'Groomsman' },
  ],
};

const WeddingParty: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-soul mb-12 text-shimmer animate-on-scroll opacity-0 translate-y-8 duration-[1500ms] pb-4">
          Wedding Party
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Bridesmaids */}
          <div className="animate-on-scroll opacity-0 translate-y-8 duration-[1500ms]">
            <div className="flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-3xl font-soul mb-8 text-red-600">Bridesmaids</h3>
            <div className="space-y-6">
              {bridalParty.bridesmaids.map((person, index) => (
                <div key={index} className="p-6 rounded-lg">
                  <h4 className="text-2xl font-soul text-gray-800">{person.name}</h4>
                  <p className="text-lg font-serif text-gray-600">{person.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Groomsmen */}
          <div className="animate-on-scroll opacity-0 translate-y-8 duration-[1500ms]">
            <div className="flex items-center justify-center mb-6">
              <User className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-3xl font-soul mb-8 text-blue-600">Groomsmen</h3>
            <div className="space-y-6">
              {bridalParty.groomsmen.map((person, index) => (
                <div key={index} className="p-6 rounded-lg">
                  <h4 className="text-2xl font-soul text-gray-800">{person.name}</h4>
                  <p className="text-lg font-serif text-gray-600">{person.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeddingParty;
