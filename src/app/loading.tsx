export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9998] bg-white flex flex-col items-center justify-center gap-6">
      {/* Logo */}
      <img
        src="/images/logo.jpg"
        alt="WOG-STYLE"
        className="w-12 h-12 object-contain opacity-90"
      />

      {/* Barre de chargement animée */}
      <div className="w-24 h-[2px] bg-gray-100 overflow-hidden rounded-full">
        <div className="h-full bg-black animate-loading-bar" />
      </div>

      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); width: 60%; }
          100% { transform: translateX(200%); }
        }
        .animate-loading-bar {
          width: 40%;
          animation: loading-bar 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
