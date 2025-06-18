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
      className={`fixed z-50 bg-white rounded-[32px] shadow-2xl overflow-hidden w-[380px] ${
        position === "bottom-left" ? "bottom-6 left-6" : "bottom-6 right-6"
      }`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {step === "type" ? (
        <>
          {/* Header */}
          <div
            className="relative flex items-center justify-between"
            style={{
              height: 120,
              background: gradient,
              padding: "2rem 2rem 1.5rem 2rem",
            }}
          >
            <h2 className="text-white text-2xl font-bold leading-tight drop-shadow m-0">
              Acme Inc.
            </h2>
            {companyIconUrl && (
              <img
                src={companyIconUrl}
                alt="Company Logo"
                className="w-24 h-24 object-contain"
                style={{
                  marginLeft: "1.5rem",
                  flexShrink: 0,
                  background: "#fff",
                }}
                onError={e => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
          </div>
          {/* Feedback type selection screen */}
          <div className="p-8 pt-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Choose feedback option
            </h3>
            <div className="space-y-5">
              {FEEDBACK_TYPES.map((ft) => (
                <button
                  key={ft.value}
                  onClick={() => {
                    setType(ft.value);
                    setStep("form");
                  }}
                  className="w-full flex items-center gap-4 px-6 py-5 bg-[#f8f5ff] hover:bg-[#f3ebff] rounded-2xl transition cursor-pointer shadow-sm"
                  style={{ fontSize: "1.15rem", fontWeight: 500 }}
                >
                  <span className="text-3xl">{ft.emoji}</span>
                  <span className="flex-1 text-left text-gray-900">{ft.label}</span>
                </button>
              ))}
            </div>
            <p className="text-base text-center text-gray-400 mt-10">
              Powered by{" "}
              <span className="font-semibold" style={{ color: "#7c3aed" }}>
                // ORMA
              </span>
            </p>
          </div>
        </>
      ) : step === "form" ? (
        <>
          {/* Header */}
          <div
            className="relative flex items-center justify-between"
            style={{
              height: 80,
              background: gradient,
              padding: "1.5rem 2rem 1.5rem 2rem",
            }}
          >
            <h2 className="text-white text-xl font-bold leading-tight drop-shadow m-0">
              Acme Inc.
            </h2>
            {companyIconUrl && (
              <img
                src={companyIconUrl}
                alt="Company Logo"
                className="w-14 h-14 object-contain rounded-full bg-white shadow-lg border-4 border-white"
                style={{
                  marginLeft: "1.5rem",
                  flexShrink: 0,
                  background: "#fff",
                }}
                onError={e => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
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