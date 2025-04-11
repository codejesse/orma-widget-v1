// templates/DefaultTemplate.jsx
import React from "react";

interface DefaultTemplateProps {
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

const DefaultTemplate: React.FC<DefaultTemplateProps> = ({
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
        className="rounded-full px-4 py-2 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
        style={{ backgroundColor: primaryColor }}
      >
        Feedback
      </button>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex justify-between items-center"
        style={{ backgroundColor: primaryColor }}
      >
        <h3 className="text-white font-semibold">
          {step === "success" ? "Thank You!" : "Share Your Feedback"}
        </h3>
        <button
          onClick={resetWidget}
          className="text-white text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {step === "rating" && (
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              How would you rate your experience?
            </p>
            <div className="flex justify-center space-x-2 my-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingSelect(value)}
                  className={`text-2xl transition-colors ${
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="responseType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Feedback Type
              </label>
              <select
                id="responseType"
                name="responseType"
                value={formData.responseType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  outline: `2px solid ${primaryColor}`,
                  outlineOffset: "2px",
                }}
                required
              >
                <option value="general">General Feedback</option>
                <option value="bug">Report a Bug</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  outline: `2px solid ${primaryColor}`,
                  outlineOffset: "2px",
                }}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  outline: `2px solid ${primaryColor}`,
                  outlineOffset: "2px",
                }}
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  outline: `2px solid ${primaryColor}`,
                  outlineOffset: "2px",
                }}
                required
              ></textarea>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 rounded-md text-white font-medium transition-opacity"
              style={{
                backgroundColor: primaryColor,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="text-center py-4">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white text-xl mb-4"
              style={{ backgroundColor: primaryColor }}
            >
              ✓
            </div>
            <p className="text-gray-700 mb-4">
              Thank you for your feedback! We really appreciate it.
            </p>
            <button
              onClick={resetWidget}
              className="px-4 py-2 rounded-md text-white font-medium"
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

export default DefaultTemplate;
