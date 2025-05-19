import React from "react";
import ReactDOM from "react-dom/client";
import { OrmaWidget } from "./components/OrmaWidget";
import type { FC } from "react";

// Extend the window interface to include our custom properties
declare global {
  interface Window {
    ormaWidgetRoot?: ReactDOM.Root;
    ormaWidgetContainer?: HTMLDivElement;
  }
}

const currentScript = document.currentScript as HTMLScriptElement | null;
const projectId = currentScript
  ? new URL(currentScript.src).searchParams.get("pid") ?? undefined
  : undefined;

const toggleWidget = (position: "bottom-right" | "bottom-left" = "bottom-right") => {
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
  
  // Render the widget with proper position - using the component directly
  root.render(React.createElement(OrmaWidget, { 
    projectId, 
    position,
    onClose: closeWidget 
  }));
};

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-feedback-widget]").forEach((el) => {
    // Extract position from data attribute if available
    const position = el.getAttribute("data-position") as "bottom-right" | "bottom-left" | undefined;
    
    el.addEventListener("click", (e) => {
      e.preventDefault();
      toggleWidget(position);
    });
  });
});