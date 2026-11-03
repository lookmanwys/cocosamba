import Link from "next/link";
import Countdown from "@/components/Countdown";
import PresaleProgress from "@/components/PresaleProgress";
import HowItWorks from "@/components/HowItWorks";
import SectionReveal from "@/components/SectionReveal";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="logo-mark" style={{ width: 32, height: 32 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
            <span className="text-sm font-semibold">MarsChain</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#thesis" className="hover:text-white transition">
              Thesis
            </a>
            <a href="#supply" className="hover:text-white transition">
              Supply
            </a>
            <a href="#sequence" className="hover:text-white transition">
              Sequence
            </a>
            <a href="#questions" className="hover:text-white transition">
              Questions
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm text-white/60 hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 text-xs text-orange-400 mb-8 fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Private allocation · $1.00 per $MRSC
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95] fade-up fade-up-delay-1">
            The next
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              settlement layer.
            </span>
          </h1>

          <p className="text-white/50 text-base sm:text-lg md:text-xl mt-8 max-w-2xl mx-auto leading-relaxed fade-up fade-up-delay-2">
            Bitcoin settled the question of whether decentralized value
            can work. MarsChain answers the question that follows. An
            architecture engineered for the throughput, programmability,
            and scale the coming decade will demand.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 fade-up fade-up-delay-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold transition shadow-lg shadow-orange-500/20"
            >
              Buy $MRSC Now
            </Link>
            <a
              href="#thesis"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-white/80 font-medium transition text-center"
            >
              Read the thesis
            </a>
          </div>

          {/* Live countdown */}
          <div className="mt-14 sm:mt-16 fade-up fade-up-delay-4">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-4">
              Launch in
            </div>
            <Countdown />
          </div>

          {/* Live presale progress */}
          <div className="mt-8 sm:mt-10 fade-up fade-up-delay-4">
            <PresaleProgress />
          </div>
        </div>
      </section>

      {/* THESIS / MISSION */}
      <section
        id="thesis"
        className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <div className="text-xs text-orange-500 uppercase tracking-wider mb-3">
              The thesis
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Not a competitor to Bitcoin.
              <br />
              A consequence of it.
            </h2>
            <p className="text-white/50 mt-6 text-sm sm:text-base leading-relaxed">
              Bitcoin demonstrated that scarcity can exist without an
              issuer. What it did not attempt was the harder problem: what
              happens when that scarcity is coupled with programmable
              settlement, at the scale of a global economy.
            </p>
          </div>

          <SectionReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Settlement",
                  desc: "Finality measured in seconds. Security without architectural compromise. A base layer suitable for institutional and retail flow alike.",
                },
                {
                  title: "Computation",
                  desc: "A native execution environment for on-chain applications. Not bolted on, not layered above. Part of the protocol itself.",
                },
                {
                  title: "Scarcity",
                  desc: "Twenty million tokens. Issued once. Never again. A monetary policy that cannot be renegotiated by any party.",
                },
              ].map((p) => (
                <div key={p.title} className="glass rounded-2xl p-7">
                  <div className="text-3xl font-semibold tracking-tight mb-3">
                    {p.title}
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* MECHANICS / HOW IT WORKS */}
      <HowItWorks />

      {/* COMPARISON */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <div className="text-xs text-orange-500 uppercase tracking-wider mb-3">
              Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              Two systems. Different constraints.
            </h2>
            <p className="text-white/50 mt-4 text-sm sm:text-base leading-relaxed">
              Bitcoin optimized for certainty. MarsChain optimizes for
              what the next decade will require.
            </p>
          </div>

          <SectionReveal>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 px-4 sm:px-6 py-4 border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
                <div>Attribute</div>
                <div>Bitcoin</div>
                <div className="text-orange-500">MarsChain</div>
              </div>
              {[
                ["Settlement", "Approx. 10 minutes", "Near-instant"],
                ["Supply", "21,000,000", "20,000,000"],
                ["Execution", "Limited scripting", "Native computation"],
                ["Purpose", "Store of value", "Settlement + computation"],
                ["Status", "Live since 2009", "Private allocation"],
              ].map(([feature, btc, mrs]) => (
                <div
                  key={feature}
                  className="grid grid-cols-3 px-4 sm:px-6 py-4 border-b border-white/5 last:border-0 text-xs sm:text-sm"
                >
                  <div className="text-white/40">{feature}</div>
                  <div className="text-white/70">{btc}</div>
                  <div className="text-white font-semibold">{mrs}</div>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* SUPPLY / TOKENOMICS */}
      <section
        id="supply"
        className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <div className="text-xs text-orange-500 uppercase tracking-wider mb-3">
              Supply
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              Twenty million. Immutable.
            </h2>
            <p className="text-white/50 mt-4 text-sm sm:text-base leading-relaxed">
              The supply was determined at genesis. It cannot be
              increased, decreased, or renegotiated. What exists is what
              will always exist.
            </p>
          </div>

          <SectionReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-5 sm:p-7">
                <div className="space-y-4">
                  {[
                    ["Private allocation", "30%", "6,000,000"],
                    ["Liquidity", "25%", "5,000,000"],
                    ["Community", "10%", "2,000,000"],
                    ["Treasury", "10%", "2,000,000"],
                    ["Team", "6%", "1,200,000"],
                    ["Marketing", "6%", "1,200,000"],
                    ["Ecosystem", "6%", "1,200,000"],
                    ["Exchange listings", "4%", "800,000"],
                    ["Legal and audits", "3%", "600,000"],
                  ].map(([name, pct, amt]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between text-sm gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        <span className="text-white/70 truncate">{name}</span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        <span className="text-white/40 font-mono text-xs hidden sm:inline">
                          {amt}
                        </span>
                        <span className="font-semibold w-12 text-right">
                          {pct}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-5 sm:p-7 flex flex-col justify-center">
                <div className="space-y-6">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                      Total supply
                    </div>
                    <div className="text-3xl sm:text-4xl font-semibold tracking-tight">
                      20,000,000
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                      Allocation price
                    </div>
                    <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-orange-500">
                      $1.00
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                      Private allocation
                    </div>
                    <div className="text-xl sm:text-2xl font-semibold tracking-tight">
                      6,000,000 $MRSC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* SEQUENCE / ROADMAP */}
      <section
        id="sequence"
        className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <div className="text-xs text-orange-500 uppercase tracking-wider mb-3">
              Sequence
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              The path, stated plainly.
            </h2>
          </div>

          <SectionReveal>
            <div className="space-y-4">
              {[
                {
                  phase: "Phase 1",
                  time: "Present to Dec 31",
                  title: "Private allocation",
                  desc: "six million tokens offered at $1.00. Community formation and security preparation in parallel.",
                  status: "active",
                },
                {
                  phase: "Phase 2",
                  time: "Jan 1",
                  title: "Token generation",
                  desc: "Supply is issued on Solana. Withdrawals activate. Secondary market access opens for holders.",
                  status: "upcoming",
                },
                {
                  phase: "Phase 3",
                  time: "Q1 to Q2",
                  title: "Distribution and depth",
                  desc: "Centralized exchange listings, staking mechanisms, and targeted incentive programs.",
                  status: "upcoming",
                },
                {
                  phase: "Phase 4",
                  time: "Q3 to Q4",
                  title: "Ecosystem",
                  desc: "Developer grants, protocol integrations, and initial application layer deployment.",
                  status: "upcoming",
                },
                {
                  phase: "Phase 5",
                  time: "2027 and beyond",
                  title: "Layer-1 mainnet",
                  desc: "Independent consensus layer. Validator network. Full sovereignty from host chains.",
                  status: "upcoming",
                },
              ].map((step, i) => (
                <div
                  key={step.phase}
                  className={`glass rounded-2xl p-5 sm:p-6 flex items-start gap-4 sm:gap-5 ${
                    step.status === "active" ? "border-orange-500/30" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0 ${
                      step.status === "active"
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div className="text-xs text-white/40 uppercase tracking-wider">
                        {step.phase}
                      </div>
                      <div className="text-xs text-white/30">·</div>
                      <div className="text-xs text-white/40">
                        {step.time}
                      </div>
                      {step.status === "active" && (
                        <div className="flex items-center gap-1.5 text-xs text-orange-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          Active
                        </div>
                      )}
                    </div>
                    <div className="text-base sm:text-lg font-semibold mt-2">
                      {step.title}
                    </div>
                    <div className="text-white/50 text-xs sm:text-sm mt-1 leading-relaxed">
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            The allocation closes
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-300 bg-clip-text text-transparent">
              on December 31.
            </span>
          </h2>
          <p className="text-white/50 mt-6 text-base sm:text-lg">
            six million tokens. One dollar. One launch date.
          </p>
          <Link
            href="/register"
            className="inline-block mt-10 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold transition shadow-lg shadow-orange-500/20"
          >
            Request Allocation
          </Link>
        </div>
      </section>

      {/* QUESTIONS / FAQ */}
      <section
        id="questions"
        className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <div className="text-xs text-orange-500 uppercase tracking-wider mb-3">
              Questions
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              Reasonable questions, answered.
            </h2>
          </div>

          <SectionReveal>
            <div className="space-y-3">
              {[
                  
              [
                "What is MarsChain, precisely?",
                "MarsChain is a fixed-supply monetary asset paired with a programmatic settlement environment. The asset, twenty million $MRSC, immutably issued, launches on Solana in January 2027. The settlement environment is a longer-term objective: an independent Layer-1, sovereign in its consensus, purpose-built for a decade of demand that current networks were not designed to meet. The supply does not change. The architecture will.",
              ],
              [
                "Why does this need to exist alongside Bitcoin?",
                "Bitcoin solved one problem completely: how to make digital scarcity credible. It did not attempt the harder problem that follows. Coupling that scarcity with programmable settlement at global scale. MarsChain exists because the second problem is unsolved, not because the first was solved poorly.",
              ],
              [
                "When is $MRSC transferable?",
                "Not before January 1, 2027. Until that date, holdings exist on our ledger and cannot leave it. At launch, the constraint dissolves. Every holder can withdraw to any Solana address and access any venue that supports the asset.",
              ],
              [
                "What happens to unsold tokens?",
                "They are destroyed. Not held, not reserved, not repurposed. Burned, and provably so. The consequence is that the surviving supply becomes proportionally scarcer. The launch date does not move.",
              ],
              [
                "Is identity verification required?",
                "No. An email address is the only requirement. This is a deliberate position, not a shortcut. It reflects the project's current structure and the kind of participant it is designed for.",
              ],
              [
                "Which assets are accepted?",
                "Three. Bitcoin, USDT on the Tron network, and Solana. Each has a dedicated deposit address displayed at the point of purchase. Assets must be sent on the network they were assigned to. The protocol cannot recover funds sent otherwise.",
              ],
              [
                "What is the total supply of $MRSC?",
                "Twenty million. Immutably issued at genesis. No inflation schedule. No discretionary issuance. No treasury capable of minting more. The supply was determined once and will remain as it was determined.",
              ],
              ].map(([q, a]) => (
                <details
                  key={q}
                  className="glass rounded-2xl group overflow-hidden"
                >
                  <summary className="px-5 sm:px-6 py-4 sm:py-5 cursor-pointer flex items-center justify-between text-sm font-semibold list-none gap-3">
                    {q}
                    <svg
                      className="w-4 h-4 text-white/40 group-open:rotate-45 transition shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </summary>
                  <div className="px-5 sm:px-6 pb-5 text-sm text-white/50 leading-relaxed">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="logo-mark" style={{ width: 32, height: 32 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">MarsChain</div>
                <div className="text-xs text-white/40">
                  Settlement for what comes next
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-white/40">
              <Link href="/terms" className="hover:text-white transition">
                
              </Link>
              <Link href="/privacy" className="hover:text-white transition">
                
              </Link>
              <Link href="/risk" className="hover:text-white transition">
                
              </Link>
            </div>
          </div>

          <p className="text-center text-white/20 mt-10 text-xs leading-relaxed max-w-2xl mx-auto">
            
          </p>

          <p className="text-center text-white/20 mt-6 text-xs">
            © {new Date().getFullYear()} MarsChain
          </p>
        </div>
      </footer>
    </main>
  );
}