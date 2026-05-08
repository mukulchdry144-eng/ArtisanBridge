import { useState } from "react";
import { Link } from "react-router-dom";
import { artistsData } from "../data/artistsData";

const Artists = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArtists = artistsData.filter(artist => 
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    artist.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0a0f1e] text-white min-h-[calc(100vh-80px)] py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative mb-16">
          {/* Search Bar */}
          <div className="absolute top-0 right-0 w-full md:w-64 z-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111] border border-gray-600 rounded-full py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors placeholder-gray-500"
              />
              <svg 
                className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="text-center pt-16 md:pt-0">
            <p className="text-xs tracking-widest text-yellow-500 mb-2 font-bold uppercase">
              Discover Creators
            </p>
            <h1 className="text-4xl md:text-6xl font-playfair font-semibold mb-6">
              All Artists
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Explore our diverse community of talented artists from around the world. Find your next favorite creator and follow their artistic journey.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredArtists.length > 0 ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredArtists.map((artist, index) => (
            <div
              key={index}
              className="bg-[#111] border border-[#E6E6F2] rounded-xl p-6 text-center hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10 group"
            >
              {/* Avatar */}
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md ${!artist.image ? artist.color : 'bg-transparent'} group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
                {artist.image ? (
                  <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  artist.initials
                )}
              </div>

              {/* Info */}
              <h3 className="mt-5 font-bold text-xl text-white group-hover:text-yellow-500 transition-colors duration-300">
                {artist.name}
              </h3>

              <p className="text-gray-400 text-sm mt-1 font-medium">
                {artist.category}
              </p>

              {/* Stats */}
              <div className="flex justify-between items-center gap-3 mt-6 mb-2">
                <div className="bg-[#1a1f2e] py-3 px-2 rounded-lg w-full">
                  <p className="text-yellow-500 font-bold text-lg leading-none">{artist.works}</p>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1 block">Works</span>
                </div>
                <div className="bg-[#1a1f2e] py-3 px-2 rounded-lg w-full">
                  <p className="text-yellow-500 font-bold text-lg leading-none">{artist.rating}</p>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1 block">Rating</span>
                </div>
              </div>
              <div className="bg-[#1a1f2e] py-3 px-4 rounded-lg flex justify-between items-center">
                 <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Followers</span>
                 <p className="text-yellow-500 font-bold text-md">{artist.followers}</p>
              </div>

              {/* Button */}
              <Link to={`/artist/${artist.id}`}>
                <button className="mt-6 w-full border border-gray-600 py-3 rounded-full text-sm font-semibold hover:bg-yellow-500 hover:text-[#0a0f1e] hover:border-transparent transition duration-300">
                  View Profile
                </button>
              </Link>
            </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111] border border-gray-800 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">No artists found</h3>
            <p className="text-gray-400">We couldn't find any artists matching "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-6 text-yellow-500 hover:text-yellow-400 font-medium text-sm transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artists;
