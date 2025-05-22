import React from "react";

type Props = {
  onClose?: () => void;
};

const ThankYouScreen: React.FC<Props> = ({ onClose }) => {
  return (
    <div>
      <div className="p-6 text-center relative">
        <div className="absolute top-2 right-2">
          <button
            onClick={onClose}
            className="bg-white rounded-full p-1 shadow"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-t-[36px] h-24 w-full -mt-6 mb-4"></div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Thanks for your feedback!
        </h2>
        <p className="text-sm text-gray-600">
          We appreciate your feedback and always love to use your feedback to
          serve you better.
        </p>
      </div>
    </div>
  );
};

export default ThankYouScreen;
