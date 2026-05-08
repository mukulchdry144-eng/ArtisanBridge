import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-black text-white overflow-hidden">

      {/* Background Image */}
      <img
        src="https://i.ibb.co/Kppm8gy6/Image.png"
        alt="Art"
        className="absolute right-0 top-0 h-full w-full object-cover opacity-80"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-16 max-w-2xl">

        {/* Badge */}
        <span className="inline-block bg-yellow-500/20 text-yellow-400 px-4 py-1 rounded-full text-sm mb-6 border border-yellow-500/30">
          ● Premium Art Marketplace
        </span>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Where Art <br />
          <span className="text-yellow-500">Meets</span> <br />
          <span className="text-yellow-500">Opportunity</span>
        </h1>

        {/* Description */}
        <p className="text-gray-400 mt-6 max-w-lg">
          Connect with world-class painting artists. Commission custom artwork,
          discover original pieces, and bring your vision to life.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <Link to="/get-started">
            <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition">
              Find an Artist →
            </button>
          </Link>

          <Link to="/get-started">
            <button className="border border-gray-600 px-6 py-3 rounded-lg hover:bg-yellow-500 hover:text-white transition">
              Post a Commission
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-12 mt-12 text-sm">
          <div className='border-r border-r-gray-300'>
            <h3 className="text-yellow-500 text-xl font-bold pr-5">2,500+</h3>
            <p className="text-gray-400">Artists</p>
          </div>

          <div className='border-r border-r-gray-300'>
            <h3 className="text-yellow-500 text-xl font-bold pr-5">12K+</h3>
            <p className="text-gray-400">Artworks</p>
          </div>

          <div className='border-r border-r-gray-300'>
            <h3 className="text-yellow-500 text-xl font-bold">98%</h3>
            <p className="text-gray-400 pr-5">Satisfaction</p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero
