export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Digital Art in 2026",
      category: "Trends",
      date: "May 2, 2026",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      summary: "Exploring the new tools and platforms empowering creators to reach global audiences like never before."
    },
    {
      id: 2,
      title: "Pricing Your Artwork: A Comprehensive Guide",
      category: "Resources",
      date: "April 28, 2026",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
      summary: "Learn how to accurately value your time, skills, and materials to ensure a sustainable creative career."
    },
    {
      id: 3,
      title: "How to Communicate Effectively with Clients",
      category: "Tips",
      date: "April 15, 2026",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2669&auto=format&fit=crop",
      summary: "Setting expectations early and keeping open lines of communication can turn one-time buyers into lifelong patrons."
    }
  ];

  const successStories = [
    {
      id: 1,
      name: "Elena Rostova",
      role: "Illustrator",
      quote: "ArtisanBridge gave me the global reach I always dreamed of. I quit my day job and now illustrate full-time for clients across 12 countries.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Studio X",
      role: "Brand Agency",
      quote: "Finding specialized talent used to take weeks. Now, we connect with verified, world-class artists in hours. It has transformed our pipeline.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop"
    }
  ];

  return (
    <div className="bg-[#0a0f1e] text-white min-h-[calc(100vh-80px)] py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#F5C518]/10 blur-[100px] rounded-full pointer-events-none"></div>
          <p className="text-xs tracking-widest text-[#F5C518] mb-2 font-bold uppercase relative z-10">
            Insights & Updates
          </p>
          <h1 className="text-4xl md:text-6xl font-playfair font-semibold mb-6 relative z-10">
            The ArtisanBridge Blog
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed relative z-10">
            Discover industry trends, tips for growing your creative business, and inspiring stories from our global community.
          </p>
        </div>

        {/* Latest Posts Grid */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
            <span className="w-8 h-1 bg-[#F5C518] rounded-full block"></span>
            Latest Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <div key={post.id} className="bg-[#111] rounded-2xl border border-gray-800 overflow-hidden hover:border-[#F5C518] transition-colors duration-300 group cursor-pointer flex flex-col">
                <div className="h-56 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 duration-300"></div>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute top-4 right-4 bg-[#F5C518] text-black text-xs font-bold px-3 py-1 rounded-full z-20">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-500 text-sm mb-3">{post.date}</p>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#F5C518] transition-colors">{post.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">{post.summary}</p>
                  <div className="text-[#F5C518] text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Read More <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories Section */}
        <div id="success-stories" className="bg-[#111] rounded-3xl p-8 md:p-12 border border-gray-800 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-[#F5C518]/5 to-transparent pointer-events-none"></div>
          
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest text-[#F5C518] mb-2 font-bold uppercase">
              Community Impact
            </p>
            <h2 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-4">
              Success Stories
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Real stories from artists who scaled their passion, and clients who found exactly what they were looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {successStories.map(story => (
              <div key={story.id} className="bg-[#1a1f2e] p-8 rounded-2xl border border-gray-800 hover:shadow-[0_0_30px_rgba(245,197,24,0.05)] transition-shadow">
                <i className="fa-solid fa-quote-left text-4xl text-[#F5C518]/20 mb-4 block"></i>
                <p className="text-gray-300 italic text-lg leading-relaxed mb-8">"{story.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={story.image} alt={story.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#F5C518]/50" />
                  <div>
                    <h4 className="font-bold text-white">{story.name}</h4>
                    <p className="text-[#F5C518] text-sm">{story.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 relative z-10">
            <button className="border border-gray-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-black transition duration-300">
              Share Your Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
