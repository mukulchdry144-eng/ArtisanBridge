import { useLocation, useNavigate } from "react-router-dom";

const fallbackPlan = {
  badge: "PRO",
  title: "Grow Faster",
  desc: "For clients with ongoing creative projects and bigger ambitions.",
  price: "29",
  features: ["Unlimited project posts", "Featured client listing", "Analytics dashboard"]
};

function formatPrice(price) {
  const value = Number(price || 0);
  if (value === 0) return "Free";
  return `$${value}/mo`;
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan || fallbackPlan;
  const features = plan.features || fallbackPlan.features;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4 py-10 text-white">
      <section className="grid w-full max-w-5xl gap-6 md:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-gray-700 bg-[#171717] p-7 shadow-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-500">
            Plan summary
          </p>
          <h1 className="text-3xl font-bold">{plan.title}</h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">{plan.desc}</p>
          <div className="mt-8 flex items-end gap-2">
            <span className="text-5xl font-bold">{formatPrice(plan.price)}</span>
            {Number(plan.price || 0) > 0 ? <span className="mb-2 text-sm text-gray-400">billed monthly</span> : null}
          </div>

          <ul className="mt-8 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
                  <i className="fa-solid fa-check" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-yellow-500 bg-[#1f1f1f] p-7 shadow-[0_0_18px_rgba(234,179,8,0.18)]">
          <span className="inline-flex rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
            {plan.badge || "Plan"}
          </span>
          <h2 className="mt-5 text-2xl font-bold">Checkout setup required</h2>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Payments are not connected to a live processor in this build, so ArtisanBridge will not ask for card numbers or CVV details.
          </p>

          <div className="mt-6 rounded-lg border border-gray-700 bg-black/25 p-4">
            <p className="text-sm font-semibold text-white">Next deployment step</p>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Connect Stripe, Razorpay, or another payment provider before enabling paid subscriptions.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-yellow-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
            >
              Continue to dashboard
              <i className="fa-solid fa-arrow-right ml-2" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/get-started")}
              className="inline-flex items-center justify-center rounded-md border border-gray-600 px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Contact team
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
