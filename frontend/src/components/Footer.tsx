export default function Footer() {
  return (
    <footer className="bg-primary text-slate-400 py-10 text-center">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-white font-bold text-lg mb-2">
          <span className="text-red-500">
            <i className="fas fa-heart"></i>
          </span>{' '}
          CardioGuard Assistant
        </div>
        <p className="text-sm">Advanced machine-driven heart attack risk prediction</p>
        <p className="text-xs mt-4 text-slate-500">
          © 2025 CardioGuard AI. For educational purposes only. Not a substitute for professional medical advice.
        </p>
      </div>
    </footer>
  );
}

