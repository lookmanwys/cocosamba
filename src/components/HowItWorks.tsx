import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Enter your invite code",
      desc: "Access is by invitation. Enter the code you received to unlock registration.",
    },
    {
      number: "02",
      title: "Choose how to pay",
      desc: "Bitcoin, USDT on Tron, or Solana. You'll see a deposit address at checkout.",
    },
    {
      number: "03",
      title: "Get your tokens",
      desc: "Your balance appears right away. On January 1, tokens unlock and become transferable.",
    },
  ];

  return (
    <section
      id="how"
      className="py-20 sm:py-32 px-4 sm:px-6 border-t border-white/5"
    >
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="text-xs text-orange-500 uppercase tracking-wider mb-3">
            How it works
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Three steps.
            <br />
            That is it.
          </h2>
          <p className="text-white/50 mt-4 text-sm sm:text-base">
            No complex setup. No wallet required to buy. Just send and wait
            for launch day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 relative">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="glass rounded-2xl p-6 sm:p-7 relative"
            >
              <div className="text-5xl sm:text-6xl font-semibold text-orange-500/15 mb-4 tracking-tight leading-none">
                {step.number}
              </div>
              <div className="text-lg sm:text-xl font-semibold mb-2">
                {step.title}
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                {step.desc}
              </p>

              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-white/10" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-14">
          <Link
            href="/register"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold transition shadow-lg shadow-orange-500/20"
          >
            Buy $MRSC Now →
          </Link>
        </div>
      </div>
    </section>
  );
}