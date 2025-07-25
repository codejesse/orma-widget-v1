"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { submitFeedback } from "./../rpc/submitFeedback"
import ThankYouScreen from "./ThankYouScreen"

const FEEDBACK_TYPES = [
  { label: "Report an issue", value: "Report and issue", emoji: "🐛" },
  { label: "Suggest to us", value: "Suggest to us", emoji: "💡" },
  { label: "Other", value: "Other", emoji: "💬" },
]

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
}

type Props = {
  position?: "bottom-right" | "bottom-left" | "modal" | "inline"
  projectId?: string
  companyIconUrl?: string
  colorTheme?: string
  primaryColor?: string
  onClose?: () => void
}

// Helper to check if a string is a valid hex or rgb/hsl color
function isValidColor(str: string | undefined): boolean {
  if (!str) return false
  if (/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(str)) return true
  if (/^(rgb|hsl)a?\(\s*(\d+\s*,?\s*)+[\d.]*\)$/.test(str)) return true
  return false
}

// Helper to convert hex to RGB values
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

// Helper to create beautiful noisy gradients from any color
function makeGradient(color: string) {
  if (color.startsWith("#")) {
    const rgb = hexToRgb(color)
    if (rgb) {
      const { r, g, b } = rgb
      const lighter = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`
      const darker = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`
      const accent = `rgb(${Math.min(255, r + 15)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 35)})`

      return `
        linear-gradient(135deg, 
          ${color} 0%, 
          ${lighter} 15%, 
          ${color} 25%, 
          ${accent} 40%, 
          ${darker} 60%, 
          ${color} 75%, 
          ${lighter} 90%, 
          ${darker} 100%
        ),
        radial-gradient(circle at 30% 20%, 
          rgba(255,255,255,0.1) 0%, 
          transparent 50%
        ),
        radial-gradient(circle at 70% 80%, 
          rgba(0,0,0,0.1) 0%, 
          transparent 50%
        )
      `
        .replace(/\s+/g, " ")
        .trim()
    }
  }

  if (color.startsWith("rgb")) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const [, r, g, b] = match.map(Number)
      const lighter = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`
      const darker = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`
      const accent = `rgb(${Math.min(255, r + 15)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 35)})`

      return `
        linear-gradient(135deg, 
          ${color} 0%, 
          ${lighter} 20%, 
          ${accent} 40%, 
          ${darker} 70%, 
          ${color} 100%
        ),
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)
      `
        .replace(/\s+/g, " ")
        .trim()
    }
  }

  return `linear-gradient(135deg, ${color} 0%, rgba(0,0,0,0.1) 100%)`
}

export const OrmaWidget: React.FC<Props> = ({
  position = "bottom-right",
  projectId,
  companyIconUrl,
  colorTheme = "default",
  primaryColor,
  onClose,
}) => {
  const [step, setStep] = useState<"type" | "form" | "thankyou">("type")
  const [type, setType] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640 || window.innerHeight < 600)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const gradient = useMemo(() => {
    if (isValidColor(primaryColor)) return makeGradient(primaryColor!)
    const theme = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default
    return `linear-gradient(135deg, var(--tw-gradient-stops, ${theme.primary}))`
  }, [primaryColor, colorTheme])

  const accent = useMemo(() => {
    if (isValidColor(primaryColor)) return primaryColor!
    const theme = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.default
    return theme.accent
  }, [primaryColor, colorTheme])

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await submitFeedback({
        name,
        email,
        rating,
        message,
        type,
        projectId,
      })
      setStep("thankyou")
      setName("")
      setEmail("")
      setRating(0)
      setMessage("")
    } catch (err) {
      console.error(err)
      alert("Submission failed.")
    } finally {
      setLoading(false)
    }
  }

  // Determine positioning styles based on position prop
  const getPositionStyles = () => {
    switch (position) {
      case "modal":
        return {
          containerClass: "fixed inset-0 z-50 flex items-center justify-center p-4",
          widgetClass: "w-full max-w-md max-h-[90vh] overflow-y-auto",
          showBackdrop: true,
          backdropClass: "fixed inset-0 bg-black/20 backdrop-blur-sm z-40",
        }
      case "bottom-right":
        return {
          containerClass: "fixed bottom-6 right-6 z-50",
          widgetClass: "w-[380px] max-h-[90vh] overflow-y-auto",
          showBackdrop: false,
          backdropClass: "",
        }
      case "bottom-left":
        return {
          containerClass: "fixed bottom-6 left-6 z-50",
          widgetClass: "w-[380px] max-h-[90vh] overflow-y-auto",
          showBackdrop: false,
          backdropClass: "",
        }
      case "inline":
        return {
          containerClass: "relative w-full",
          widgetClass: "w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto",
          showBackdrop: false,
          backdropClass: "",
        }
      default:
        return {
          containerClass: "fixed bottom-6 right-6 z-50",
          widgetClass: "w-[380px] max-h-[90vh] overflow-y-auto",
          showBackdrop: false,
          backdropClass: "",
        }
    }
  }

  const positionStyles = getPositionStyles()

  // Mobile adjustments for fixed positions
  const mobileAdjustments = () => {
    if (!isMobile) return {}
    
    if (position === "modal") {
      return {
        containerClass: "fixed inset-0 z-50 flex items-center justify-center p-4",
        widgetClass: "w-full max-w-sm max-h-[90vh]",
      }
    }
    
    if (position === "bottom-right" || position === "bottom-left") {
      return {
        containerClass: "fixed bottom-4 left-4 right-4 z-50",
        widgetClass: "w-full max-h-[80vh]",
      }
    }
    
    return {}
  }

  const finalStyles = isMobile ? { ...positionStyles, ...mobileAdjustments() } : positionStyles

  const WidgetContent = () => (
    <div
      className={`bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20 transition-all duration-300 hover:shadow-3xl ${finalStyles.widgetClass} max-h-[90vh] overflow-y-auto`}
      style={{
        boxShadow: position === "inline" 
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)"
          : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
      }}
    >
      {step === "type" ? (
        <div className="flex flex-col max-h-full">
          {/* Header */}
          <div
            className="text-white p-4 sm:p-6 relative overflow-hidden flex-shrink-0"
            style={{
              background: gradient,
              minHeight: isMobile ? "70px" : "80px",
            }}
          >
            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(255,255,255,0.05) 2px,
                    rgba(255,255,255,0.05) 4px
                  )
                `,
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {companyIconUrl && (
                  <div
                    className={`flex-shrink-0 max-w-[100px] sm:max-w-[120px] ${isMobile ? "h-10" : "h-12"} flex items-center`}
                  >
                    <img
                      src={companyIconUrl || "/placeholder.svg"}
                      alt="Company Logo"
                      className="max-w-full max-h-full object-contain drop-shadow-sm"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>
                )}
                <div>
                  <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-bold truncate drop-shadow-sm`}>
                    Acme Inc.
                  </h2>
                  <p className={`text-white/80 ${isMobile ? "text-xs" : "text-sm"} font-medium`}>
                    We'd love your feedback
                  </p>
                </div>
              </div>

              {/* Close Button - only show for non-inline positions */}
              {position !== "inline" && (
                <button
                  onClick={onClose}
                  className={`flex-shrink-0 ${isMobile ? "w-8 h-8" : "w-10 h-10"} flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 active:scale-95`}
                  aria-label="Close feedback widget"
                >
                  <svg
                    width={isMobile ? "14" : "16"}
                    height={isMobile ? "14" : "16"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            <div className="p-4 sm:p-6">
              <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-bold mb-2 text-gray-900`}>
                Choose feedback type
              </h3>
              <p className={`text-gray-600 ${isMobile ? "text-xs" : "text-sm"} mb-4 sm:mb-6`}>
                Help us improve by sharing your thoughts
              </p>

              <div className="space-y-3">
                {FEEDBACK_TYPES.map((ft, index) => (
                  <button
                    key={ft.value}
                    onClick={() => {
                      setType(ft.value)
                      setStep("form")
                    }}
                    className={`w-full group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50/80 hover:bg-gray-100/80 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div
                      className={`${isMobile ? "w-10 h-10" : "w-12 h-12"} flex items-center justify-center rounded-xl bg-white shadow-sm group-hover:shadow-md transition-all duration-200 flex-shrink-0`}
                    >
                      <span className={`${isMobile ? "text-xl" : "text-2xl"}`}>{ft.emoji}</span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className={`font-semibold text-gray-900 block ${isMobile ? "text-sm" : ""}`}>
                        {ft.label}
                      </span>
                      <span className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500 block truncate`}>
                        {ft.value === "Report and issue" && "Found a bug or issue?"}
                        {ft.value === "Suggest to us" && "Have an idea to share?"}
                        {ft.value === "Other" && "Something else on your mind?"}
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                <p
                  className={`${isMobile ? "text-xs" : "text-xs"} text-center text-gray-400 flex items-center justify-center gap-2`}
                >
                  <span>Powered by</span>
                  <span style={{ color: accent }} className={`font-bold ${isMobile ? "text-xs" : "text-sm"}`}>
                    〰️ ORMA
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : step === "form" ? (
        <div className="flex flex-col max-h-full">
          {/* Header */}
          <div
            className="text-white p-4 sm:p-6 relative overflow-hidden flex-shrink-0"
            style={{
              background: gradient,
              minHeight: isMobile ? "70px" : "80px",
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(255,255,255,0.05) 2px,
                    rgba(255,255,255,0.05) 4px
                  )
                `,
              }}
            />

            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {companyIconUrl && (
                  <div
                    className={`flex-shrink-0 max-w-[100px] sm:max-w-[120px] ${isMobile ? "h-10" : "h-12"} flex items-center`}
                  >
                    <img
                      src={companyIconUrl || "/placeholder.svg"}
                      alt="Company Logo"
                      className="max-w-full max-h-full object-contain drop-shadow-sm"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>
                )}
                <div>
                  <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-bold truncate drop-shadow-sm`}>
                    Acme Inc.
                  </h2>
                  <p className={`text-white/80 ${isMobile ? "text-xs" : "text-sm"} font-medium`}>
                    Share your feedback
                  </p>
                </div>
              </div>

              {position !== "inline" && (
                <button
                  onClick={onClose}
                  className={`flex-shrink-0 ${isMobile ? "w-8 h-8" : "w-10 h-10"} flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 active:scale-95`}
                  aria-label="Close feedback widget"
                >
                  <svg
                    width={isMobile ? "14" : "16"}
                    height={isMobile ? "14" : "16"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <button
                className={`flex items-center gap-2 ${isMobile ? "text-xs" : "text-sm"} font-medium transition-colors duration-200 hover:opacity-80`}
                style={{ color: accent }}
                onClick={() => setStep("type")}
              >
                <svg
                  width={isMobile ? "14" : "16"}
                  height={isMobile ? "14" : "16"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to options
              </button>

              <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"}`}>
                <div className="space-y-2">
                  <label className={`${isMobile ? "text-xs" : "text-sm"} font-semibold text-gray-700`}>Name</label>
                  <input
                    className={`w-full border-2 border-gray-200 rounded-xl ${isMobile ? "p-2.5 text-sm" : "p-3 text-sm"} transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none bg-gray-50/50 hover:bg-white`}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`${isMobile ? "text-xs" : "text-sm"} font-semibold text-gray-700`}>Email</label>
                  <input
                    type="email"
                    className={`w-full border-2 border-gray-200 rounded-xl ${isMobile ? "p-2.5 text-sm" : "p-3 text-sm"} transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none bg-gray-50/50 hover:bg-white`}
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`${isMobile ? "text-xs" : "text-sm"} font-semibold text-gray-700`}>
                  Your feedback
                </label>
                <textarea
                  className={`w-full border-2 border-gray-200 rounded-xl ${isMobile ? "p-2.5 text-sm" : "p-3 text-sm"} transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none bg-gray-50/50 hover:bg-white resize-none`}
                  rows={isMobile ? 3 : 4}
                  placeholder="Tell us what's on your mind. We value every piece of feedback!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className={`${isMobile ? "text-xs" : "text-sm"} font-semibold text-gray-700 block`}>
                  Rate your experience
                </label>
                <div className="flex justify-center gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${isMobile ? "text-2xl" : "text-3xl"} transition-all duration-200 hover:scale-110 active:scale-95 ${
                        star <= (hoveredStar || rating) ? "text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className={`text-center ${isMobile ? "text-xs" : "text-sm"} text-gray-600`}>
                    {rating === 1 && "We're sorry to hear that 😔"}
                    {rating === 2 && "We'll work on improving 🔧"}
                    {rating === 3 && "Thanks for the feedback 👍"}
                    {rating === 4 && "Great to hear! 😊"}
                    {rating === 5 && "Awesome! We're thrilled! 🎉"}
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className={`w-full text-white ${isMobile ? "p-3 text-sm" : "p-4 text-sm"} rounded-xl font-bold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                style={{
                  background: loading ? "#9CA3AF" : accent,
                  boxShadow: loading ? "none" : `0 4px 14px 0 ${accent}40`,
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  "Submit Feedback"
                )}
              </button>

              <div className="pt-3 sm:pt-4 border-t border-gray-100">
                <p
                  className={`${isMobile ? "text-xs" : "text-xs"} text-center text-gray-400 flex items-center justify-center gap-2`}
                >
                  <span>Powered by</span>
                  <span style={{ color: accent }} className={`font-bold ${isMobile ? "text-xs" : "text-sm"}`}>
                    〰️ ORMA
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ThankYouScreen onClose={onClose} />
      )}
    </div>
  )

  return (
    <>
      {/* Backdrop for modal and mobile */}
      {finalStyles.showBackdrop && (
        <div
          className={finalStyles.backdropClass}
          onClick={position === "modal" ? onClose : undefined}
        />
      )}

      {/* Widget Container */}
      <div className={finalStyles.containerClass}>
        <WidgetContent />
      </div>
    </>
  )
}