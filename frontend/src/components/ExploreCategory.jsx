const categories = [
  { icon: "🎨", bg: "bg-orange-100", label: "Oil Painting", count: 324 },
  { icon: "🖼️", bg: "bg-green-100", label: "Watercolor", count: 218 },
  { icon: "✏️", bg: "bg-pink-100", label: "Illustration", count: 491 },
  { icon: "🖊️", bg: "bg-blue-100", label: "Digital Art", count: 583 },
  { icon: "🏺", bg: "bg-purple-100", label: "Sculpture", count: 142 },
];

const ExploreCategory = () => {
  return (
    <section className="bg-[#E6E6F2] py-16 px-8">

      {/* Heading */}
      <div className="text-center mb-12">
        <p className="text-yellow-600 text-xs font-bold tracking-widest uppercase mb-3">Browse</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-3">Explore by Category</h2>
        <p className="text-gray-500 text-sm">Find the perfect artist for your vision</p>
      </div>

      {/* Cards */}
      <div className="flex justify-center gap-5 flex-wrap">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="bg-white rounded-2xl p-6 w-52 flex flex-col items-start gap-4 cursor-pointer
              transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className={`${cat.bg} w-14 h-14 rounded-full flex items-center justify-center text-2xl`}>
              {cat.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{cat.label}</p>
              <p className="text-sm text-gray-400">{cat.count} artists</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

export default ExploreCategory;