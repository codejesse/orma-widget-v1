// templates/CardTemplate.jsx
import React from "react";

interface CardTemplateProps {
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

const CardTemplate: React.FC<CardTemplateProps> = ({
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
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        style={{ backgroundColor: primaryColor }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-3a1 1 0 00-1 1v2a1 1 0 102 0V8a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        Feedback
      </button>
    );
  }

  return (
    <div className="w-96 bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header with background image */}
      <div className="relative h-16" style={{ backgroundColor: primaryColor }}>
        <div className="absolute inset-0 bg-opacity-20 bg-black"></div>
        <div className="absolute inset-0 flex justify-between items-center px-6">
          <h3 className="text-white font-bold text-lg">
            {step === "success" ? "Thank You!" : "Share Your Thoughts"}
          </h3>
          <button
            onClick={resetWidget}
            className="text-white bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-30 transition-all"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {step === "rating" && (
          <div>
            <p className="text-gray-700 font-medium mb-4 text-center">
              How would you rate your experience with us?
            </p>
            <div className="flex justify-center space-x-3 my-6">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingSelect(value)}
                  className={`text-3xl transition-transform hover:scale-110 ${
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="responseType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                What kind of feedback do you have?
              </label>
              <select
                id="responseType"
                name="responseType"
                value={formData.responseType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
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
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    outline: `2px solid ${primaryColor}`,
                    outlineOffset: "2px",
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{
                  outline: `2px solid ${primaryColor}`,
                  outlineOffset: "2px",
                }}
                required
              ></textarea>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all"
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
          <div className="text-center py-6">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-2xl mb-4 shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              ✓
            </div>
            <h4
              className="text-xl font-semibold mb-2"
              style={{ color: primaryColor }}
            >
              Feedback Received
            </h4>
            <p className="text-gray-600 mb-6">
              Thank you for taking the time to share your thoughts with us!
            </p>
            <button
              onClick={resetWidget}
              className="px-6 py-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all"
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

export default CardTemplate;
