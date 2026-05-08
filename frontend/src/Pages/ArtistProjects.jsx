import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const categories = ["All", "Original", "Commission", "Print", "Digital", "Branding"];

const projects = [
  {
    title: "Golden Hour on the Horizon",
    artist: "Marcus Kline",
    location: "New York, USA",
    category: "Original",
    medium: "Oil painting",
    price: "$1,240",
    timeline: "Ready to ship",
    description: "Warm realism study with layered sunset tones and a textured hand-finished surface.",
    icon: "fa-sun",
    accent: "from-[#5a2e00] to-[#241104]",
    image: "https://picsum.photos/seed/golden/600/400",
    artistImage: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    title: "Serenity of the Deep Blue",
    artist: "Sofia Laurent",
    location: "Paris, France",
    category: "Commission",
    medium: "Watercolor",
    price: "$890",
    timeline: "2 weeks",
    description: "Custom watercolor scenes for homes, editorial spreads, and keepsake gifting.",
    icon: "fa-water",
    accent: "from-[#0f2a3d] to-[#07131d]",
    image: "https://picsum.photos/seed/ocean/600/400",
    artistImage: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    title: "Bloom in Abstract",
    artist: "Aisha Rowe",
    location: "London, UK",
    category: "Print",
    medium: "Illustration",
    price: "$560",
    timeline: "5 days",
    description: "Expressive botanical forms designed as limited prints and interior art sets.",
    icon: "fa-seedling",
    accent: "from-[#2d1247] to-[#12071f]",
    image: "https://picsum.photos/seed/bloom/600/400",
    artistImage: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    title: "Neon Market Portraits",
    artist: "Julian Park",
    location: "Seoul, KR",
    category: "Digital",
    medium: "Digital art",
    price: "$720",
    timeline: "1 week",
    description: "High-impact digital portraits with vibrant city lighting and surreal composition.",
    icon: "fa-bolt",
    accent: "from-[#4a1231] to-[#160711]",
    image: "https://picsum.photos/seed/neon/600/400",
    artistImage: "https://randomuser.me/api/portraits/men/46.jpg"
  },
  {
    title: "Heritage Ceramic Set",
    artist: "Naina Verma",
    location: "Jaipur, India",
    category: "Original",
    medium: "Handmade craft",
    price: "$430",
    timeline: "Ready to ship",
    description: "Small-batch ceramic objects with hand-painted pattern work and glazed finishing.",
    icon: "fa-mug-hot",
    accent: "from-[#5b3a14] to-[#1d1207]",
    image: "https://picsum.photos/seed/ceramic/600/400",
    artistImage: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    title: "Atelier Brand Marks",
    artist: "Leo Martin",
    location: "Berlin, Germany",
    category: "Branding",
    medium: "Brand design",
    price: "$1,600",
    timeline: "3 weeks",
    description: "Logo and identity concepts for studios, makers, galleries, and product founders.",
    icon: "fa-pen-nib",
    accent: "from-[#132f3d] to-[#07151c]",
    image: "https://picsum.photos/seed/brand/600/400",
    artistImage: "https://randomuser.me/api/portraits/men/11.jpg"
  },
  {
    title: "Quiet Room Studies",
    artist: "Mira Chen",
    location: "Vancouver, Canada",
    category: "Print",
    medium: "Mixed media",
    price: "$310",
    timeline: "4 days",
    description: "Minimal interiors and soft tonal studies printed on museum-grade paper.",
    icon: "fa-border-all",
    accent: "from-[#20302c] to-[#0d1715]",
    image: "https://picsum.photos/seed/room/600/400",
    artistImage: "https://randomuser.me/api/portraits/women/31.jpg"
  },
  {
    title: "Festival Poster Series",
    artist: "Omar Reyes",
    location: "Mexico City, MX",
    category: "Commission",
    medium: "Poster art",
    price: "$940",
    timeline: "10 days",
    description: "Custom event posters with bold type, energetic layouts, and illustrated key art.",
    icon: "fa-layer-group",
    accent: "from-[#54321c] to-[#1c0f08]",
    image: "https://picsum.photos/seed/poster/600/400",
    artistImage: "https://randomuser.me/api/portraits/men/22.jpg"
  }
];

export default function ArtistProjects() {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((project) => project.category === activeCategory);
  }, [activeCategory]);

  return (
    <main className="bg-[#0a0f1e] text-white">
      <section className="border-b border-white/10 px-6 py-14 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#F5C518]">
                Artist projects
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
                Explore artworks, commissions, and studio-ready projects.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                Browse curated work from painters, illustrators, designers, and makers on ArtisanBridge.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <Metric value="8" label="Projects" />
                <Metric value="6" label="Artists" />
                <Metric value="5" label="Categories" />
              </div>
              <Link
                to="/get-started"
                className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-[#F5C518] px-4 py-3 text-sm font-bold text-black hover:bg-yellow-400"
              >
                Start a project
                <i className="fa-solid fa-arrow-right ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">All artworks</h2>
              <p className="mt-1 text-sm text-slate-400">
                Filter by project type and discover artists ready for your next brief.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category
                      ? "border-[#F5C518] bg-[#F5C518] text-black"
                      : "border-white/15 bg-white/5 text-slate-300 hover:border-[#F5C518] hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visibleProjects.map((project) => (
              <article
                key={project.title}
                className="group overflow-hidden rounded-lg border border-white/10 bg-[#111827] shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-[#F5C518]/70 cursor-pointer"
              >
                <div className={`flex h-52 items-center justify-center bg-gradient-to-br overflow-hidden ${!project.image ? project.accent : ''}`}>
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/25 text-[#F5C518]">
                      <i className={`fa-solid ${project.icon} text-3xl`} />
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold group-hover:text-[#F5C518] transition-colors">{project.title}</h3>
                      <p className="mt-1 truncate text-sm text-slate-400">{project.medium}</p>
                    </div>
                    <span className="rounded-full bg-[#F5C518]/15 px-2.5 py-1 text-xs font-semibold text-[#F5C518]">
                      {project.category}
                    </span>
                  </div>

                  <p className="min-h-[72px] text-sm leading-6 text-slate-300">{project.description}</p>

                  <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5C518] text-sm font-bold text-black overflow-hidden">
                      {project.artistImage ? (
                        <img src={project.artistImage} alt={project.artist} className="w-full h-full object-cover" />
                      ) : (
                        project.artist.slice(0, 1)
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{project.artist}</p>
                      <p className="truncate text-xs text-slate-500">{project.location}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                    <Info label="Price" value={project.price} />
                    <Info label="Timeline" value={project.timeline} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-md bg-black/20 px-3 py-3">
      <p className="text-2xl font-semibold text-[#F5C518]">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md bg-white/[0.06] px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
