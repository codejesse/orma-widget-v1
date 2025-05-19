// src/embed.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import FeedbackWidget from './FeedbackWiget';

const createWidgetContainer = () => {
  const containerId = 'feedback-widget-root';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }
  return container;
};

const loadTailwind = () => {
  if (!document.getElementById('feedback-widget-tailwind')) {
    const link = document.createElement('link');
    link.id = 'feedback-widget-tailwind';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    document.head.appendChild(link);
  }
};

const getConfigFromScriptTag = () => {
  const script = document.currentScript || document.querySelector('script[data-feedback-project-id]');
  if (!script) return {};
  return {
    projectId: script.getAttribute('data-feedback-project-id'),
    position: script.getAttribute('data-feedback-position') || 'bottom-right',
    primaryColor: script.getAttribute('data-feedback-color') || '#4f46e5',
    template: script.getAttribute('data-feedback-template') || 'default',
    // Add more config extraction as needed
  };
};

export default function initWidget(config = {}) {
  loadTailwind();
  const container = createWidgetContainer();
  const scriptConfig = getConfigFromScriptTag();
  const finalConfig = { ...scriptConfig, ...config };

  const root = createRoot(container);
  root.render(<FeedbackWidget {...finalConfig} />);
}

// Auto-initialize if loaded via script tag
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('script[data-feedback-project-id]')) {
      initWidget();
    }
  });
}