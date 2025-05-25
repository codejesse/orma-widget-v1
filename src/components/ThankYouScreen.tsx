import React from "react";

type Props = {
  onClose?: () => void;
};

const ThankYouScreen: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="p-6 text-center">
      <button className="cursor-pointer" onClick={onClose} aria-label="Close">
        <span className="text-xl">✕</span>
      </button>
      <h2 className="text-4xl font-semibold">🙏</h2>
      <h2 className="text-xl font-semibold">Thank you For your feedback!</h2>
      <p className="text-sm text-gray-500">
        We appreciate your feedback always.
      </p>
    </div>
  );
};

export default ThankYouScreen;
