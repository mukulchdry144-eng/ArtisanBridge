import { useParams, Link } from "react-router-dom";
import { artistsData } from "../data/artistsData";

const ArtistProfile = () => {
  const { id } = useParams();
  const artist = artistsData.find((a) => a.id === id);

  if (!artist) {
    return (
      <div className="bg-[#0a0f1e] min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Artist Not Found</h1>
        <Link to="/artists" className="text-yellow-500 hover:underline">
          ← Back to All Artists
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0f1e] text-white min-h-screen pb-20">
      {/* Hero Header */}
      <div className="h-64 md:h-80 w-full bg-gradient-to-r from-gray-900 to-[#111] relative border-b border-gray-800">
        <div className="absolute top-6 left-6 md:top-10 md:left-16 z-10">
           <Link to="/artists" className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm uppercase tracking-widest font-semibold">
              ← Back
           </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-16 -mt-24 md:-mt-32 relative z-20">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 mb-12">
          {/* Avatar */}
          <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-[#0a0f1e] overflow-hidden flex items-center justify-center text-5xl font-bold bg-[#111] ${!artist.image ? artist.color : ''}`}>
            {artist.image ? (
              <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              artist.initials
            )}
          </div>
          
          {/* Main Info */}
          <div className="flex-1 text-center md:text-left mb-4 md:mb-6">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-2">{artist.name}</h1>
            <p className="text-xl text-gray-400 font-medium mb-6">{artist.category}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/20">
                Follow
              </button>
              <button className="border border-gray-600 px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition">
                Message
              </button>
            </div>
          </div>
          
          {/* Stats Box */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex gap-8 w-full md:w-auto justify-center md:mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-1">{artist.works}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Works</p>
            </div>
            <div className="w-px bg-gray-800"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-1">{artist.followers}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Followers</p>
            </div>
            <div className="w-px bg-gray-800"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500 mb-1">{artist.rating}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Rating</p>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Portfolio</h2>
            <div className="flex gap-4">
              <button className="text-yellow-500 font-semibold border-b-2 border-yellow-500 pb-4 -mb-[18px]">Latest</button>
              <button className="text-gray-500 font-semibold hover:text-white transition pb-4 -mb-[18px]">Popular</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-[#111] rounded-xl aspect-square overflow-hidden group relative cursor-pointer">
                <img 
                  src={`https://picsum.photos/seed/${artist.id}-${item}/600/600`} 
                  alt="Artwork" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold mb-1">Artwork Title {item}</h3>
                  <p className="text-sm text-gray-300">Creation year 2023</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
