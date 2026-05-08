const steps = [
  {
    number: "Step-01",
    icon: "🔍",
    title: "Post Your Project",
    desc: "Describe your vision, style, budget, and timeline in minutes. Be as specific or open-ended as you like.",
  },
  {
    number: "Step-02",
    icon: "✨",
    title: "Browse Proposals",
    desc: "Receive portfolios and quotes from vetted artists within 24 hours. Compare styles and find your perfect match.",
  },
  {
    number: "Step-03",
    icon: "🤍",
    title: "Hire & Collaborate",
    desc: "Work directly with your chosen artist and pay securely on delivery. Your satisfaction is guaranteed.",
  },
];

const Procedure = () => {
  return (
    <section className="bg-[#E6E6F2] py-20 px-8">

      {/* Heading */}
      <div className="text-center mb-16">
        <p className="text-yellow-600 text-xs font-semibold tracking-widest uppercase mb-4">The Process</p>
        <h2 className="text-5xl font-serif text-gray-900 mb-4">Simple. Fast. Creative.</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
          From first idea to finished masterpiece — our platform makes hiring an artist effortless.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-0 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col md:flex-row items-center">

            {/* Card */}
            <div className="bg-white rounded-2xl p-8 w-full max-w-[320px] md:w-80 h-auto min-h-[288px] flex flex-col justify-start gap-4 shadow-sm">
              <p className="text-yellow-600 text-5xl font-serif font-bold">{step.number}</p>
              <div className="bg-yellow-50 w-11 h-11 rounded-xl flex items-center justify-center text-xl">
                {step.icon}
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">{step.title}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>

            {/* Dashed connector */}
            {index < steps.length - 1 && (
              <div className="h-10 w-full flex items-center justify-center md:h-auto md:w-10">
                <div className="border-l-2 border-dashed border-yellow-400 h-full md:h-auto md:w-full md:border-l-0 md:border-t-2" />
              </div>
            )}

          </div>
        ))}
      </div>

    </section>
  );
};

export default Procedure;