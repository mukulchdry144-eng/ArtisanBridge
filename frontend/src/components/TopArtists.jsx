import { Link } from "react-router-dom";
import { artistsData } from "../data/artistsData";

const TopArtists= () => {
  const artists = artistsData.slice(0, 4);

  return (
    <section className="bg-[#0a0f1e] text-white py-12 px-6 md:px-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">

        <div>
          <p className="text-xs tracking-widest text-yellow-500 mb-2">
            COMMUNITY
          </p>

          <h2 className="text-3xl md:text-5xl font-playfair font-semibold">
            Top Artists
          </h2>

          <p className="text-gray-400 mt-3">
            Meet our most celebrated creators
          </p>
        </div>

        <Link to="/artists">
          <button className="mt-6 md:mt-0 border border-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-yellow-500 hover:text-black transition">
            Discover All Artists →
          </button>
        </Link>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-4 gap-6">

        {artists.map((artist, index) => (
          <div
            key={index}
            className="bg-[#111] border border-[#E6E6F2] rounded-xl p-6 text-center hover:border-yellow-500 transition-all duration-300"
          >

            {/* Avatar */}
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-semibold text-lg ${!artist.image ? artist.color : 'bg-transparent'} overflow-hidden`}>
              {artist.image ? (
                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                artist.initials
              )}
            </div>

            {/* Info */}
            <h3 className="mt-4 font-semibold">
              {artist.name}
            </h3>

            <p className="text-gray-500 text-sm">
              {artist.category}
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-6 text-xs mt-4 text-gray-400">
              <div>
                <p className="text-yellow-500 font-semibold">{artist.works}</p>
                <span>Works</span>
              </div>
              <div>
                <p className="text-yellow-500 font-semibold">{artist.rating}</p>
                <span>Rating</span>
              </div>
              <div>
                <p className="text-yellow-500 font-semibold">{artist.followers}</p>
                <span>Followers</span>
              </div>
            </div>

            {/* Button */}
            <Link to={`/artist/${artist.id}`}>
              <button className="mt-6 w-full border border-[#E6E6F2]  py-2 rounded-full text-sm hover:bg-yellow-500 hover:text-black hover:border-transparent transition">
                View Profile
              </button>
            </Link>

          </div>
        ))}

      </div>

    </section>
  );
}
export default TopArtists;
