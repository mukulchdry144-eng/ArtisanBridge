const Testimonials = () => {
  const reviews = [
    {
      text: "The entire experience was flawless. I commissioned a portrait and the artist understood my vision perfectly. The final piece exceeded every expectation I had.",
      name: "James Mitchell",
      role: "Art Collector, New York",
      initials: "JM",
      color: "bg-orange-500",
    },
    {
      text: "As an artist, Artistry gave me the platform to reach clients I never could have found on my own. My commissions tripled in the first three months.",
      name: "Priya Verma",
      role: "Watercolor Artist, Mumbai",
      initials: "PV",
      color: "bg-indigo-500",
    },
    {
      text: "I've used many art platforms but nothing compares. The curation quality, the ease of communication, and the secure payment process are unmatched.",
      name: "Lena Kowalski",
      role: "Interior Designer, Berlin",
      initials: "LK",
      color: "bg-green-500",
    },
  ];

  return (
    <section className="bg-[#E6E6F2] py-20 px-6 md:px-16 text-center font-inter">

      {/* Top Label */}
      <p className="text-xs tracking-widest text-yellow-600 mb-3">
        REVIEWS
      </p>

      {/* Heading */}
      <h2 className="text-3xl md:text-5xl font-playfair font-semibold text-black">
        What Collectors Say
      </h2>

      {/* Subtext */}
      <p className="text-gray-500 mt-4 mb-14">
        Trusted by thousands of art lovers worldwide
      </p>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 text-left shadow-sm border border-gray-100"
          >
            {/* Avatar + Name + Stars row */}
            <div className="flex items-center gap-10">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${review.color}`}>
                {review.initials}
              </div>
              <div>
                <p className="font-semibold text-sm text-black leading-tight">
                  {review.name}
                </p>
                <p className="text-xs text-gray-500 mb-1">
                  {review.role}
                </p>
                <div className="text-orange-500 text-sm leading-none">
                  ★★★★★
                </div>
              </div>
            </div>

            {/* Quote mark */}
            <div className="text-orange-400 text-3xl leading-none mb-2">"</div>

            {/* Review Text */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {review.text}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
};

export default Testimonials;
