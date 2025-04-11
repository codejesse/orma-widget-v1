// templates/MinimalTemplate.jsx
import React from "react";

interface MinimalTemplateProps {
  isOpen: boolean;
  toggleWidget: () => void;
  step: "rating" | "form" | "success";
  rating: number;
  formData: {
    responseType: string;
    name: string;
    email: string;
    message: string;
  };
  isSubmitting: boolean;
  error: string | null;
  primaryColor: string;
  handleRatingSelect: (value: number) => void;
  handleInputChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  resetWidget: () => void;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({
  isOpen = false,
  toggleWidget = () => {},
  step = "rating",
  rating = 0,
  formData = { responseType: "", name: "", email: "", message: "" },
  isSubmitting = false,
  error = null,
  primaryColor = "#4f46e5",
  handleRatingSelect = () => {},
  handleInputChange = () => {},
  handleSubmit = () => {},
  resetWidget = () => {},
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={toggleWidget}
        className="rounded-md px-3 py-1 text-white text-sm shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        ?
      </button>
    );
  }

  return (
    <div className="w-64 bg-white rounded border shadow-md">
      {/* Header */}
      <div className="px-3 py-2 flex justify-between items-center border-b">
        <h3 className="text-sm font-medium" style={{ color: primaryColor }}>
          {step === "success" ? "Thanks!" : "Quick Feedback"}
        </h3>
        <button
          onClick={resetWidget}
          className="text-gray-500 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {step === "rating" && (
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">
              How was your experience?
            </p>
            <div className="flex justify-center space-x-1 my-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingSelect(value)}
                  className={`text-lg transition-colors ${
                    rating >= value ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <select
                name="responseType"
                value={formData.responseType}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                required
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="general">General</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                required
              />
            </div>

            <div>
              <textarea
                name="message"
                placeholder="Your feedback"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                required
              ></textarea>
            </div>

            {error && <div className="text-red-500 text-xs">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-1 px-2 rounded text-white text-xs"
              style={{
                backgroundColor: primaryColor,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="text-center py-2">
            <div
              className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white text-xs mb-2"
              style={{ backgroundColor: primaryColor }}
            >
              ✓
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Thanks for your feedback!
            </p>
            <button
              onClick={resetWidget}
              className="px-3 py-1 rounded text-white text-xs"
              style={{ backgroundColor: primaryColor }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalTemplate;
