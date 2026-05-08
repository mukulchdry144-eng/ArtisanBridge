import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="bg-[#0a0f1e] text-white min-h-[calc(100vh-80px)] py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          <p className="text-xs tracking-widest text-[#F5C518] mb-2 font-bold uppercase relative z-10">
            Our Story
          </p>
          <h1 className="text-4xl md:text-6xl font-playfair font-semibold mb-6 relative z-10">
            About ArtisanBridge
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed relative z-10">
            We built ArtisanBridge to connect visionary creators with clients who value exceptional artistry. Our platform transcends borders to empower digital and traditional artists alike.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Empowering Global Creativity
            </h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              ArtisanBridge started with a simple belief: world-class talent shouldn't be limited by geography. We're building a thriving ecosystem where illustrators, designers, and craftsmen can easily showcase their portfolios, manage commissions, and collaborate securely with global clients.
            </p>
            <p className="text-gray-400 leading-relaxed text-lg">
              Whether you are looking for breathtaking editorial illustrations or a unique brand identity, ArtisanBridge offers a streamlined experience with built-in protections for both artists and buyers.
            </p>
            <div className="pt-4">
               <Link to="/get-started">
                 <button className="bg-[#F5C518] text-black font-semibold py-3 px-8 rounded-full hover:bg-yellow-400 transition duration-300 shadow-[0_0_15px_rgba(245,197,24,0.3)]">
                   Join Our Community
                 </button>
               </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 mt-8">
              <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 hover:border-[#F5C518] transition-colors duration-300 group">
                <h3 className="text-[#F5C518] font-bold text-4xl mb-2 group-hover:scale-105 transition-transform origin-left">10k+</h3>
                <p className="text-gray-400 font-medium">Active Artists</p>
              </div>
              <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 hover:border-[#F5C518] transition-colors duration-300 group">
                <h3 className="text-[#F5C518] font-bold text-4xl mb-2 group-hover:scale-105 transition-transform origin-left">50+</h3>
                <p className="text-gray-400 font-medium">Countries</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 hover:border-[#F5C518] transition-colors duration-300 group">
                <h3 className="text-[#F5C518] font-bold text-4xl mb-2 group-hover:scale-105 transition-transform origin-left">100k</h3>
                <p className="text-gray-400 font-medium">Projects Delivered</p>
              </div>
              <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 hover:border-[#F5C518] transition-colors duration-300 group">
                <h3 className="text-[#F5C518] font-bold text-4xl mb-2 group-hover:scale-105 transition-transform origin-left">99%</h3>
                <p className="text-gray-400 font-medium">Client Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#111] rounded-3xl p-10 md:p-16 border border-gray-800 text-center relative overflow-hidden group hover:border-gray-700 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5C518] opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:opacity-10 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5C518] opacity-5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:opacity-10 transition-opacity duration-500"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10 text-white">Our Mission</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto italic relative z-10 leading-relaxed">
            "To dismantle the barriers between talent and opportunity, providing every artist with the tools to build a sustainable, flourishing independent career."
          </p>
        </div>
      </div>
    </div>
  );
}
