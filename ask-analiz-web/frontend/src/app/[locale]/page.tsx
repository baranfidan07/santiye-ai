export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-100">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm5 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Aşk Analiz</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#technology" className="text-gray-300 hover:text-purple-500 transition">Technology</a>
              <a href="#features" className="text-gray-300 hover:text-purple-500 transition">Features</a>
              <a href="#about" className="text-gray-300 hover:text-purple-500 transition">About</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="bg-purple-500/20 text-purple-500 px-4 py-2 rounded-full text-sm font-semibold border border-purple-500/30">🚀 Vertical AI for Relationships</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Decode Your Relationships</span>
              <br />
              <span className="text-white">with Vertical AI.</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              The world&apos;s first AI-powered <span className="text-purple-500 font-semibold">Relationship Detective</span> and <span className="text-pink-500 font-semibold">Dating Coach</span>.
              Analyzes behavioral patterns to uncover the truth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSdMXP2giG2Nne5CYSgerHye0tQtLaiirT2DSbI8HSt549iJ3w/viewform" target="_blank" rel="noopener noreferrer" className="shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105">
                🚀 Join Waitlist
              </a>
              <a href="#technology" className="bg-transparent border-2 border-purple-600 text-purple-500 hover:bg-purple-600 hover:text-white font-bold px-10 py-4 rounded-xl text-lg transition-all duration-300">
                Learn More
              </a>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-[#1A1A2E]/50 backdrop-blur border border-purple-900/30 rounded-2xl p-6">
                <div className="text-4xl font-black text-purple-500 mb-2">120k+</div>
                <div className="text-sm text-gray-400">Analyses Performed</div>
              </div>
              <div className="bg-[#1A1A2E]/50 backdrop-blur border border-purple-900/30 rounded-2xl p-6">
                <div className="text-4xl font-black text-pink-500 mb-2">98%</div>
                <div className="text-sm text-gray-400">Pattern Accuracy</div>
              </div>
              <div className="bg-[#1A1A2E]/50 backdrop-blur border border-purple-900/30 rounded-2xl p-6">
                <div className="text-4xl font-black text-purple-400 mb-2">24/7</div>
                <div className="text-sm text-gray-400">AI Availability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E]/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Powered by <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Advanced LLMs</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Enterprise-grade artificial intelligence fine-tuned for relationship psychology and behavioral analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Custom Fine-Tuned Models</h3>
              <p className="text-gray-400 leading-relaxed">
                Our proprietary Large Language Models are trained on millions of relationship scenarios,
                analyzing text sentiment, behavioral psychology patterns, and honesty markers with scientific precision.
              </p>
            </div>

            <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Data Privacy & Security</h3>
              <p className="text-gray-400 leading-relaxed">
                <span className="text-green-400 font-semibold">End-to-End Encryption</span> ensures your conversations remain private.
                We never store personal identifiers and comply with international data protection standards (GDPR, KVKK).
              </p>
            </div>

            <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-16 h-16 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-Time Processing</h3>
              <p className="text-gray-400 leading-relaxed">
                Powered by cloud infrastructure with sub-second response times.
                Our distributed AI pipeline processes behavioral cues instantly for actionable insights.
              </p>
            </div>

            <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Continuous Learning</h3>
              <p className="text-gray-400 leading-relaxed">
                Our models evolve through reinforcement learning from anonymized feedback,
                improving detection accuracy for modern communication patterns and cultural nuances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Three <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">AI Personas</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Specialized agents designed for different relationship challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-b from-red-900/20 to-[#1A1A2E] border border-red-900/30 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2">
              <div className="text-5xl mb-4">🕵️‍♂️</div>
              <h3 className="text-2xl font-bold mb-4">Detective Mode</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Upload screenshots of conversations. Our AI analyzes linguistic patterns, response times,
                and behavioral inconsistencies to detect potential dishonesty or cheating signals.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">▹</span>
                  <span>Screenshot OCR + Sentiment Analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">▹</span>
                  <span>Lie Detection Algorithms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">▹</span>
                  <span>Behavioral Pattern Recognition</span>
                </li>
              </ul>
            </div>

            <div className="group bg-gradient-to-b from-pink-900/20 to-[#1A1A2E] border border-pink-900/30 rounded-2xl p-8 hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold mb-4">Flirt Coach</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Get strategic reply suggestions based on psychological compatibility data.
                Maximize attraction while maintaining authenticity through data-driven tactics.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">▹</span>
                  <span>3 Strategic Reply Options (Bold/Cool/Romantic)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">▹</span>
                  <span>Rizz Score Optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">▹</span>
                  <span>Psychology-Backed Tactics</span>
                </li>
              </ul>
            </div>

            <div className="group bg-gradient-to-b from-purple-900/20 to-[#1A1A2E] border border-purple-900/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-2xl font-bold mb-4">Vibe Check</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Get an instant relationship health score (0-100).
                Our AI analyzes interaction dynamics and flags red flags before they escalate.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">▹</span>
                  <span>Toxicity Meter (Real-Time)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">▹</span>
                  <span>Red Flag Detection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">▹</span>
                  <span>Actionable Recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E]/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                Built by Visionaries at <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Sivas Cumhuriyet University</span>
              </h2>
              <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                We are a team of <span className="text-purple-500 font-semibold">sociology</span> and
                <span className="text-pink-500 font-semibold"> engineering students</span> bridging the gap between
                human psychology and artificial intelligence.
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Our mission is to democratize relationship intelligence through cutting-edge AI,
                empowering individuals to make informed decisions about their personal lives.
              </p>

              <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-xl font-black text-white">
                    YBF
                  </div>
                  <div>
                    <div className="font-bold text-lg">Yakup Baran Fidan</div>
                    <div className="text-sm text-gray-500">Founder & CEO</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-xl p-6">
                <h4 className="text-lg font-bold mb-2 text-purple-500">🎓 Academic Foundation</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Grounded in behavioral psychology research and computational linguistics from Turkey&apos;s leading universities.
                </p>
              </div>
              <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-xl p-6">
                <h4 className="text-lg font-bold mb-2 text-pink-500">🚀 Innovation First</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Pioneering the world&apos;s first Vertical AI platform specifically designed for relationship intelligence and behavioral analysis.
                </p>
              </div>
              <div className="bg-[#1A1A2E] border border-purple-900/30 rounded-xl p-6">
                <h4 className="text-lg font-bold mb-2 text-purple-400">🌍 Global Impact</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Serving users across 15+ countries with multilingual support and culturally-aware AI models.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <footer className="bg-[#1A1A2E] border-t border-purple-900/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm5 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
                </svg>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Aşk Analiz</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                The world&apos;s first Vertical AI platform for relationship intelligence.
                Powered by advanced Large Language Models and behavioral psychology research.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-purple-500">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/tr/privacy" className="hover:text-purple-500 transition">Privacy Policy</a></li>
                <li><a href="/tr/terms" className="hover:text-purple-500 transition">Terms of Service</a></li>
                <li><a href="/tr/gdpr" className="hover:text-purple-500 transition">GDPR Compliance</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-purple-500">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="mailto:info@askanaliz.com" className="hover:text-purple-500 transition flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@askanaliz.com
                  </a>
                </li>
                <li className="text-gray-500">Sivas Cumhuriyet University</li>
                <li className="text-gray-500">Sivas, Turkey</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-900/30 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 Aşk Analiz Inc. All rights reserved. Powered by Vertical AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
