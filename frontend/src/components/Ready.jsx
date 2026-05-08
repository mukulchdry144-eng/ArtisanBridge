import { Link } from "react-router-dom";

const Ready = () => {
  return (
    <section className="bg-black py-20 px-6 md:px-16 font-inter">

      <div className="max-w-6xl mx-auto rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-[#2b2300] via-[#3a3100] to-[#2b2500] p-10 md:p-16 flex flex-col md:flex-row justify-between items-center gap-10">

        {/* Left Content */}
        <div className="max-w-xl">

          <p className="text-xs tracking-widest text-yellow-500 mb-4">
            START TODAY
          </p>

          <h2 className="text-3xl md:text-5xl font-playfair font-semibold text-white leading-tight">
            Ready to Bring Your <br />
            <span className="text-yellow-500">Vision to Life?</span>
          </h2>

          <p className="text-gray-400 mt-6 text-sm leading-relaxed">
            Post your first commission in under 5 minutes. Receive proposals from
            world-class artists within 24 hours. No upfront costs until you choose
            your artist.
          </p>

        </div>

        {/* Right Buttons */}
        <div className="flex flex-col gap-4 w-full md:w-auto">

          <Link to="/get-started">
            <button className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-300">
              Post a Commission →
            </button>
          </Link>

          <Link to="/artists">
            <button className="w-full border border-gray-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-500 hover:text-white transition-all duration-300">
              Browse Artists
            </button>
          </Link>

        </div>

      </div>

    </section>
  );
}
export default Ready;
