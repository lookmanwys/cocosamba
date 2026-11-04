export default function LoadingScreen({ text = "Securing connection..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b]">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        {/* Pulsing Ring */}
        <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin opacity-80" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute inset-2 rounded-full border-b-2 border-white/20 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        
        {/* Center Logo */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-orange-500 animate-pulse">
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>
      <div className="text-white/40 text-xs tracking-widest uppercase font-mono animate-pulse">
        {text}
      </div>
    </div>
  );
}
