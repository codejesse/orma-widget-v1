import React from "react";
import ReactDOM from "react-dom/client";
import { OrmaWidget } from "./components/OrmaWidget";
import "./index.css";

// Extend the window interface to include our custom properties
declare global {
  interface Window {
    ormaWidgetRoot?: ReactDOM.Root;
    ormaWidgetContainer?: HTMLDivElement;
  }
}

// Types for customization options
interface WidgetConfig {
  projectId?: string;
  position?: "bottom-right" | "bottom-left";
  companyIconUrl?: string;
  colorTheme?: string;
  primaryColor?: string; // <-- NEW
}

const currentScript = document.currentScript as HTMLScriptElement | null;

// Extract all parameters from the URL
const getWidgetConfig = (): WidgetConfig => {
  if (!currentScript) return {};

  const url = new URL(currentScript.src);
  return {
    projectId: url.searchParams.get("pid") ?? undefined,
    position: (url.searchParams.get("position") as "bottom-right" | "bottom-left") ?? "bottom-right",
    companyIconUrl: url.searchParams.get("company-icon-url") ?? undefined,
    colorTheme: url.searchParams.get("color-theme") ?? undefined,
    primaryColor: url.searchParams.get("primary-color") ?? undefined, // <-- NEW
  };
};

const widgetConfig = getWidgetConfig();

const toggleWidget = (customPosition?: "bottom-right" | "bottom-left") => {
  // If widget is already open, close it
  if (window.ormaWidgetContainer && window.ormaWidgetRoot) {
    document.body.removeChild(window.ormaWidgetContainer);
    window.ormaWidgetRoot.unmount();
    window.ormaWidgetContainer = undefined;
    window.ormaWidgetRoot = undefined;
    return;
  }

  // Create a new widget
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  // Store references for later cleanup
  window.ormaWidgetContainer = container;
  window.ormaWidgetRoot = root;

  // Function to close the widget
  const closeWidget = () => {
    if (window.ormaWidgetContainer && window.ormaWidgetRoot) {
      document.body.removeChild(window.ormaWidgetContainer);
      window.ormaWidgetRoot.unmount();
      window.ormaWidgetContainer = undefined;
      window.ormaWidgetRoot = undefined;
    }
  };

  // Use custom position if provided, otherwise fall back to URL config, then default
  const finalPosition = customPosition || widgetConfig.position || "bottom-right";

  // Render the widget with all customization options
  root.render(React.createElement(OrmaWidget, {
    projectId: widgetConfig.projectId,
    position: finalPosition,
    companyIconUrl: widgetConfig.companyIconUrl,
    colorTheme: widgetConfig.colorTheme,
    primaryColor: widgetConfig.primaryColor, // <-- NEW
    onClose: closeWidget
  }));
};

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-feedback-widget]").forEach((el) => {
    // Extract position from data attribute if available (this overrides URL parameter)
    const dataPosition = el.getAttribute("data-position") as "bottom-right" | "bottom-left" | undefined;

    el.addEventListener("click", (e) => {
      e.preventDefault();
      toggleWidget(dataPosition);
    });
  });
});