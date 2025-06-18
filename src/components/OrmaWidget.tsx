import React, { useState, useMemo } from "react";
import { submitFeedback } from "./../rpc/submitFeedback";
import ThankYouScreen from "./ThankYouScreen";

const FEEDBACK_TYPES = [
  { label: "Report an issue", value: "Report and issue", emoji: "⚠️" },
  { label: "Suggest to us", value: "Suggest to us", emoji: "💡" },
  { label: "Other", value: "Other", emoji: "⋯" },
];

// Predefined color themes
const COLOR_THEMES = {
  default: {
    primary: "from-purple-500 to-pink-500",
    accent: "purple-600",
    light: "purple-50",
    lightHover: "purple-100",
  },
  blue: {
    primary: "from-blue-500 to-cyan-500",
    accent: "blue-600",
    light: "blue-50",
    lightHover: "blue-100",
  },
  green: {
    primary: "from-green-500 to-emerald-500",
    accent: "green-600",
    light: "green-50",
    lightHover: "green-100",
  },
  orange: {
    primary: "from-orange-500 to-red-500",
    accent: "orange-600",
    light: "orange-50",
    lightHover: "orange-100",
  },
  indigo: {
    primary: "from-indigo-500 to-purple-500",
    accent: "indigo-600",
    light: "indigo-50",
    lightHover: "indigo-100",
  },
};

type Props = {
  position?: "bottom-right" | "bottom-left";
  projectId?: string;
  companyIconUrl?: string;
  colorTheme?: string; // still supported for legacy
  primaryColor?: string; // <-- NEW: hex/rgb/hsl
  onClose?: () => void;
};

// Helper to check if a string is a valid hex or rgb/hsl color
function isValidColor(str: string | undefined): boolean {
  if (!str) return false;
  // Hex
  if (/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(str)) return true;
  // rgb/rgba/hsl/hsla
  if (/^(rgb|hsl)a?\((\s*\d+\s*,?)+\s*[\d\.]*\)$/.test(str)) return true;
  return false;
}

// Helper to create a gradient from any color
function makeGradient(color: string) {
  // Use a transparent version of the color for the fade-out
  // For hex, add CC for 80% opacity; for rgb/hsl, use with alpha if possible
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    return `linear-gradient(90deg, ${color} 0%, ${color}CC 70%, #fff0 100%)`;
  }
  if (color.startsWith("rgb")) {
    return `linear-gradient(90deg, ${color} 0%, ${color.replace("rgb", "rgba").replace(")", ",0.8)")} 70%, #fff0 100%)`;
  }
  if (color.startsWith("hsl")) {
    return `linear-gradient(90deg, ${color} 0%, ${color.replace("hsl", "hsla").replace(")", ",0.8)")} 70%, #fff0 100%)`;
  }
  // fallback
  return `linear-gradient(90deg, ${color} 0%, #fff0 100%)`;
}

export const OrmaWidget: React.FC<Props> = ({
  position = "bottom-right",
  projectId,
  companyIconUrl,
  colorTheme = "default",
  primaryColor,
  onClose,
}) => {
  const [step, setStep] = useState<"type" | "form" | "thankyou">("type");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Use user color if valid, else fallback to theme
  const gradient = useMemo(() => {
    if (isValidColor(primaryColor)) return makeGradient(primaryColor!);
    // fallback to your old theme system if needed
    const theme = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;
    return `linear-gradient(to right, var(--tw-gradient-stops, ${theme.primary}))`;
  }, [primaryColor, colorTheme]);

  const accent = useMemo(() => {
    if (isValidColor(primaryColor)) return primaryColor!;
    const theme = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;
    return `var(--tw-color, ${theme.accent})`;
  }, [primaryColor, colorTheme]);

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
      {step === "type" ? (
        <>
          {/* Header */}
          <div
            className="text-white p-4 flex justify-between items-start"
            style={{ background: gradient }}
          >
            <div className="flex items-center gap-3">
              {companyIconUrl && (
                <img 
                  src={companyIconUrl} 
                  alt="Company Logo" 
                  className="w-full h-10 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <h2 className="text-lg font-semibold">Acme Inc.</h2> {/* Replace with dynamic company name dynamically */}
            </div>
            <button className="cursor-pointer" onClick={onClose} aria-label="Close">
              <span className="text-xl">✕</span>
            </button>
          </div>
          {/* Feedback type selection screen */}
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
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  <span className="text-xl">{ft.emoji}</span>
                  <span className="text-sm font-medium">{ft.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-6">
              Powered by{" "}
              <span style={{ color: accent }} className="font-semibold">〰️ ORMA</span>
            </p>
          </div>
        </>
      ) : step === "form" ? (
        <>
          {/* Header */}
          <div
            className="text-white p-4 flex justify-between items-start"
            style={{ background: gradient }}
          >
            <div className="flex items-center gap-3">
              {companyIconUrl && (
                <img 
                  src={companyIconUrl} 
                  alt="Company Logo" 
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <h2 className="text-lg font-semibold">Acme Inc.</h2>
            </div>
            <button className="cursor-pointer" onClick={onClose} aria-label="Close">
              <span className="text-xl">✕</span>
            </button>
          </div>
          {/* Form screen with back button */}
          <div className="p-4 space-y-3">
            <button
              className="text-sm mb-2 cursor-pointer"
              style={{ color: accent }}
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
              className="w-full cursor-pointer text-white p-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
              style={{ background: accent }}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">
              Powered by{" "}
              <span style={{ color: accent }} className="font-semibold">〰️ ORMA</span>
            </p>
          </div>
        </>
      ) : (
        <ThankYouScreen onClose={onClose} />
      )}
    </div>
  );
};