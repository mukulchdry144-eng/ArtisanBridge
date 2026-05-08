import { useState } from "react";

const faqs = [
  {
    q: "How do commissions work?",
    a: "Post a brief with your requirements and budget. Artists apply, you review portfolios and choose. Payment is held securely until delivery.",
  },
  {
    q: "How are artists verified?",
    a: "Every artist undergoes a portfolio review and identity verification. Only the top 15% of applicants are accepted onto the platform.",
  },
  {
    q: "What is your refund policy?",
    a: "If you're not satisfied with the final piece, we offer a full revision round. If unresolved, our dispute team provides a fair resolution.",
  },
  {
    q: "How does pricing work?",
    a: "Artists set their own rates. You set a budget in your commission brief and artists apply within that range. No hidden platform fees for collectors.",
  },
  {
    q: "Can I buy existing artworks?",
    a: "Absolutely. Browse thousands of original pieces, limited prints, and digital downloads available for immediate purchase in the gallery.",
  },
  {
    q: "Is international shipping available?",
    a: "Yes. We partner with specialist art couriers to ship worldwide with full insurance and tracking on every original artwork shipment.",
  },
];

const Qna = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#E6E6F2] py-20 px-8">

      {/* Heading */}
      <div className="text-center mb-14">
        <p className="text-yellow-500 text-xs font-semibold tracking-widest uppercase mb-4">FAQ</p>
        <h2 className="text-gray-900 text-4xl font-bold mb-3">Frequently Asked Questions</h2>
        <p className="text-gray-500 text-sm">Everything you need to know about Artistry</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={index}
            onClick={() => toggle(index)}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-6 cursor-pointer
              transition-all duration-200 hover:border-yellow-400"
          >
            {/* Question */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-gray-900 font-semibold text-sm">{faq.q}</p>
              <span className="text-yellow-500 text-xl font-light flex-shrink-0">
                {openIndex === index ? "×" : "+"}
              </span>
            </div>

            {/* Answer */}
            {openIndex === index && (
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">{faq.a}</p>
            )}
          </div>
        ))}
      </div>

    </section>
  );
};

export default Qna;