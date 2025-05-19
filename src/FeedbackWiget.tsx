// FeedbackWidget.jsx
import React, { useState, useEffect } from "react";
import DefaultTemplate from "./templates/DefaultTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import CardTemplate from "./templates/CardTemplate";
import supabase from "./supabaseClient";

// Initialize Supabase client
// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const TEMPLATES = {
  default: DefaultTemplate,
  minimal: MinimalTemplate,
  card: CardTemplate,
};

interface FeedbackWidgetProps {
  projectId: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor?: string;
  template?: "default" | "minimal" | "card";
  customTemplate?: React.ComponentType<any> | null;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  projectId,
  position = "bottom-right",
  primaryColor = "#4f46e5",
  template = "default",
  customTemplate = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("rating");
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    responseType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Determine which template to use
    if (customTemplate) {
      setSelectedTemplate(customTemplate);
    } else if (TEMPLATES[template]) {
      setSelectedTemplate(TEMPLATES[template]);
    } else {
      console.error(`Invalid template: ${template}`);
      setSelectedTemplate(TEMPLATES["default"]);
    }
  }, [template, customTemplate]);

  const toggleWidget = () => setIsOpen(!isOpen);

  const handleRatingSelect = (value: React.SetStateAction<number>) => {
    setRating(value);
    setStep("form");
  };

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const { data: returnedData, error } = await supabase.rpc("add-feedback", {
        body: {
          projectId,
          p_user_name: formData.name,
          p_user_email: formData.email,
          p_message: formData.message,
          rating,
          p_response_type: formData.responseType,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to submit feedback");
      }
      console.log(returnedData);
      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWidget = () => {
    setStep("rating");
    setRating(0);
    setFormData({
      name: "",
      email: "",
      message: "",
      responseType: "general",
    });
    setIsOpen(false);
  };

  // Render the selected template
  if (!selectedTemplate) {
    return null;
  }

  const TemplateComponent = selectedTemplate;

  return (
    <div className={`fixed z-[10000] ${getPositionClasses(position)}`}>
      <TemplateComponent
        isOpen={isOpen}
        toggleWidget={toggleWidget}
        step={step}
        rating={rating}
        formData={formData}
        isSubmitting={isSubmitting}
        error={error}
        primaryColor={primaryColor}
        handleRatingSelect={handleRatingSelect}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        resetWidget={resetWidget}
      />
    </div>
  );
};

// Helper function to get position classes
function getPositionClasses(position: string) {
  switch (position) {
    case "bottom-right":
      return "bottom-5 right-5";
    case "bottom-left":
      return "bottom-5 left-5";
    case "top-right":
      return "top-5 right-5";
    case "top-left":
      return "top-5 left-5";
    default:
      return "bottom-5 right-5";
  }
}

export default FeedbackWidget;
