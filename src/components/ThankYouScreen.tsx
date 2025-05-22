import React from "react";

type Props = {
  onClose?: () => void;
};

const ThankYouScreen: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-8 text-center min-h-[180px]">
      {/* Decorative purple gradient circle in the top-right */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 300"
          className="absolute top-0 right-0"
          style={{ minWidth: 180, minHeight: 180 }}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="purpleGradient" cx="70%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#e0c3fc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#8ec5fc" stopOpacity="0.7" />
              <stop offset="80%" stopColor="#a18cd1" stopOpacity="1" />
              <stop offset="100%" stopColor="#fbc2eb" stopOpacity="0.8" />
            </radialGradient>
          </defs>
          <circle cx="150" cy="150" r="150" fill="url(#purpleGradient)" />
        </svg>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-1 shadow z-10"
        aria-label="Close"
        style={{ backdropFilter: "blur(2px)" }}
      >
        <span className="sr-only">Close</span>
        <svg
          className="w-6 h-6 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Main content */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">
        Thanks for your feedback! 🎉
      </h2>
      <p className="text-lg text-gray-700 relative z-10">
        We appreciate your feedback and always love to use your feedback to serve
        you better.
      </p>
    </div>
  );
};

export default ThankYouScreen;
