import { useNavigate } from "react-router-dom";

const plans = [
  {
    badge: "FREE",
    title: "Browse & Post",
    desc: "Perfect for exploring what ArtisanBridge has to offer.",
    price: "0",
    features: [
      "Post 1 project per month",
      "View artist profiles & portfolios",
      "Basic messaging",
      "Saved project history",
    ],
    btnText: "Get Started Free",
    popular: false,
  },
  {
    badge: "PRO",
    title: "Grow Faster",
    desc: "For clients with ongoing creative projects and bigger ambitions.",
    price: "29",
    features: [
      "Unlimited project posts",
      "Featured client listing",
      "Analytics dashboard",
      "Priority artist matching",
      "Priority support 24/7",
    ],
    btnText: "Start Pro Plan",
    popular: true,
  },
  {
    badge: "BUSINESS",
    title: "Scale Your Brand",
    desc: "Enterprise-grade tools for agencies and large creative teams.",
    price: "79",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom contracts & NDAs",
      "API access & integrations",
      "Team collaboration tools",
    ],
    btnText: "Contact Sales",
    popular: false,
  },
];

const Subscription = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#0a0f1e] py-20 px-8">

      {/* Heading */}
      <div className="text-center mb-14">
        <p className="text-yellow-500 text-xs font-semibold tracking-widest uppercase mb-4">Pricing</p>
        <h2 className="text-white text-5xl font-serif font-bold leading-tight mb-4">
          Transparent Pricing.<br />No Surprises.
        </h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
          Choose the plan that fits your creative ambitions. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Cards */}
      <div className="flex justify-center items-start gap-5 flex-wrap max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`relative flex flex-col justify-between rounded-2xl p-7 py-2 w-72 min-h-[420px]
              ${plan.popular
                ? "bg-[#1a1a1a] border-2 border-yellow-500"
                : "bg-[#252525] border border-gray-700"
              }`}
          >

            {/* Most Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            {/* Top */}
            <div>
              <p className={`text-xs font-bold tracking-widest uppercase mb-2
                ${plan.popular ? "text-yellow-500" : "text-gray-400"}`}>
                {plan.badge}
              </p>
              <p className="text-white text-xl font-bold mb-1">{plan.title}</p>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">{plan.desc}</p>

              {/* Price */}
              <div className="flex items-end gap-1 mb-6">
                <span className="text-white text-5xl font-bold">${plan.price}</span>
                <span className="text-gray-400 text-sm mb-2">/mo</span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-yellow-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

              <button
                type="button"
                onClick={() => navigate('/payment', { state: { plan } })}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105
                  ${plan.popular
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "bg-transparent border border-gray-500 text-white hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
                  }`}
              >
                {plan.btnText}
              </button>

          </div>
        ))}
      </div>

    </section>
  );
};

export default Subscription;
