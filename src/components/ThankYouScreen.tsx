import React from "react";

type Props = {
  onClose?: () => void;
};

const ThankYouScreen: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-8 text-center min-h-[180px]">

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-4 bg-white/80 hover:bg-white rounded-full p-1 shadow z-10"
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
