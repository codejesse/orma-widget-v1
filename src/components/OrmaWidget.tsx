import React, { useState } from "react";
import { submitFeedback } from "./../rpc/submitFeedback";

const FEEDBACK_TYPES = ["Bug", "Suggestion", "Improvement", "Other"];

type Props = {
  position?: "bottom-right" | "bottom-left";
  projectId?: string;
  onClose?: () => void;
};

export const OrmaWidget: React.FC<Props> = ({
  position = "bottom-right",
  projectId,
  onClose,
}) => {
  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await submitFeedback({
        name,
        email,
        rating,
        message,
        type,
        projectId,
      });
      alert("Thanks for your feedback!");
      setName("");
      setEmail("");
      setRating(0);
      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed z-50 p-4 bg-white shadow-lg rounded-xl w-80 ${
        position === "bottom-left" ? "bottom-4 left-4" : "bottom-4 right-4"
      }`}
    >
      {/* Header with title and close button */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">Send Feedback</h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
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

      <input
        className="w-full border mb-2 p-2"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full border mb-2 p-2"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select
        className="w-full border mb-2 p-2"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        {FEEDBACK_TYPES.map((ft) => (
          <option key={ft}>{ft}</option>
        ))}
      </select>
      <textarea
        className="w-full border mb-2 p-2"
        rows={4}
        placeholder="Your feedback..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`cursor-pointer text-xl ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
          >
            ★
          </span>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
};