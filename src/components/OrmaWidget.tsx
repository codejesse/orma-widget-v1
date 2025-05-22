import React, { useState } from "react";
import { submitFeedback } from "./../rpc/submitFeedback";
import ThankYouScreen from "./ThankYouScreen";

const FEEDBACK_TYPES = [
  { label: "Report an issue", value: "Bug", emoji: "⚠️" },
  { label: "Suggest to us", value: "Suggestion", emoji: "💡" },
  { label: "Other", value: "Other", emoji: "⋯" },
];

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
  const [step, setStep] = useState<"type" | "form" | "thankyou">("type");
  const [type, setType] = useState("");
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
      setStep("thankyou");
    //   setStep("type");
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
      className={`fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden w-[360px] ${
        position === "bottom-left" ? "bottom-4 left-4" : "bottom-4 right-4"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Acme Inc.</h2>
        </div>
        <button className="cursor-pointer" onClick={onClose} aria-label="Close">
          <span className="text-xl">✕</span>
        </button>
      </div>

      {step === "type" ? (
        // Feedback type selection screen
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Choose feedback option</h3>
          <div className="space-y-3">
            {FEEDBACK_TYPES.map((ft) => (
              <button
                key={ft.value}
                onClick={() => {
                  setType(ft.value);
                  setStep("form");
                }}
                className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition cursor-pointer"
              >
                <span className="text-xl">{ft.emoji}</span>
                <span className="text-sm font-medium">{ft.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-6">
            Powered by{" "}
            <span className="text-purple-600 font-semibold">〰️ ORMA</span>
          </p>
        </div>
      ) : step === "form" ? (
        // Form screen with back button
        <div className="p-4 space-y-3">
          <button
            className="text-sm text-purple-600 mb-2 cursor-pointer"
            onClick={() => setStep("type")}
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <div className="flex flex-col w-1/2">
              <label className="text-sm mb-1">Name</label>
              <input
                className="border rounded-md p-2 text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-1/2">
              <label className="text-sm mb-1">Email</label>
              <input
                type="email"
                className="border rounded-md p-2 text-sm"
                placeholder="johndoe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm mb-1 block">Feedback</label>
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              placeholder="Why did you select your choice and what do you think about our product/services?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex justify-center gap-1 text-xl text-gray-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`cursor-pointer ${
                  star <= rating ? "text-yellow-400" : ""
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
            className="w-full cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">
            Powered by{" "}
            <span className="text-purple-600 font-semibold">〰️ ORMA</span>
          </p>
        </div>
      ) : (
        <ThankYouScreen onClose={onClose} />
      )}
    </div>
  );
};
