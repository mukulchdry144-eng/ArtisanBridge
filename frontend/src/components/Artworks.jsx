import { Link } from "react-router-dom";
const Artworks= ()=> {
  const artworks = [
    {
      title: "Golden Hour on the Horizon",
      artist: "Marcus Kline",
      type: "Oil Painter • NYC",
      price: "$1,240",
      tag: "Original",
      bg: "bg-gradient-to-br from-[#5a2e00] to-[#2b1600]",
      icon: "🌄",
      image: "https://picsum.photos/seed/golden/600/400",
      artistImage: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      title: "Serenity of the Deep Blue",
      artist: "Sofia Laurent",
      type: "Watercolor • Paris",
      price: "$890",
      tag: "Commission",
      bg: "bg-gradient-to-br from-[#0f2a3d] to-[#091822]",
      icon: "🌊",
      image: "https://picsum.photos/seed/ocean/600/400",
      artistImage: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      title: "Bloom in Abstract",
      artist: "Aisha Rowe",
      type: "Illustration • London",
      price: "$560",
      tag: "Print",
      bg: "bg-gradient-to-br from-[#2d1247] to-[#140822]",
      icon: "🌸",
      image: "https://picsum.photos/seed/bloom/600/400",
      artistImage: "https://randomuser.me/api/portraits/women/68.jpg"
    },
  ];

  return (
    <section className="bg-[#0a0f1e] text-white py-10 px-6 md:px-16">

      {/* Top Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">

        <div>
          <p className="text-xs tracking-widest text-yellow-500 mb-2">
            CURATED
          </p>

          <h2 className="text-3xl md:text-5xl font-playfair font-semibold">
            Featured Artworks
          </h2>

          <p className="text-gray-400 mt-3">
            Hand-picked masterpieces from our top artists
          </p>
        </div>

        <Link
          to="/artist-projects"
          className="mt-6 md:mt-0 border border-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-yellow-500 hover:text-black transition"
        >
          View All Artworks -&gt;
        </Link>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-8">

        {artworks.map((art, index) => (
          <div
            key={index}
            className="rounded-xl overflow-hidden border border-gray-800 bg-[#111] group"
          >

            {/* Image Area */}
            <div className={`h-56 flex items-center justify-center text-3xl overflow-hidden ${!art.image ? art.bg : ''}`}>
              {art.image ? (
                <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                art.icon
              )}
            </div>

            {/* Content */}
            <div className="p-5">

              {/* Artist */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs overflow-hidden">
                  {art.artistImage ? (
                    <img src={art.artistImage} alt={art.artist} className="w-full h-full object-cover" />
                  ) : (
                    art.artist[0]
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{art.artist}</p>
                  <p className="text-xs text-gray-500">{art.type}</p>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold mb-2">
                {art.title}
              </h3>

              {/* Bottom Row */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-yellow-500 font-semibold">
                  {art.price}
                </span>

                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                  {art.tag}
                </span>
              </div>

            </div>
          </div>
        ))}

      </div>

    </section>
  );
}
export default Artworks;
