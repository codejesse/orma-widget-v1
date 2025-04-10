// src/embed.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import FeedbackWidget from './FeedbackWiget';

const createWidgetContainer = () => {
  const containerId = 'feedback-widget-root';
  
  // Check if container already exists
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }
  
  return container;
};

// Load Tailwind CSS programmatically
const loadTailwind = () => {
  if (!document.getElementById('feedback-widget-tailwind')) {
    const link = document.createElement('link');
    link.id = 'feedback-widget-tailwind';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    document.head.appendChild(link);
  }
};

// Initialize widget with routing capabilities
const initWidget = (config) => {
  loadTailwind();
  
  const container = createWidgetContainer();
  const root = createRoot(container);
  
  // Get template from route if available
  let template = config.template || 'default';
  const currentPath = window.location.pathname;
  
  // Check if we should use route-specific template
  if (config.routes && typeof config.routes === 'object') {
    for (const [route, routeTemplate] of Object.entries(config.routes)) {
      // Simple route matching - can be enhanced for pattern matching
      if (currentPath === route || currentPath.startsWith(route)) {
        template = routeTemplate;
        break;
      }
    }
  }
  
  root.render(
    <React.StrictMode>
      <FeedbackWidget 
        projectId={config.projectId}
        position={config.position || 'bottom-right'}
        primaryColor={config.primaryColor || '#4f46e5'}
        template={template}
        customTemplate={config.customTemplate || null}
      />
    </React.StrictMode>
  );
};

// Handle script initialization
window.FeedbackWidget = window.FeedbackWidget || {
  init: initWidget
};

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', () => {
  const scriptTag = document.querySelector('script[data-feedback-project-id]');
  
  if (scriptTag) {
    const projectId = scriptTag.getAttribute('data-feedback-project-id');
    const position = scriptTag.getAttribute('data-feedback-position');
    const primaryColor = scriptTag.getAttribute('data-feedback-color');
    const template = scriptTag.getAttribute('data-feedback-template');
    
    // Parse routes if provided as a data attribute
    let routes = {};
    const routesAttr = scriptTag.getAttribute('data-feedback-routes');
    if (routesAttr) {
      try {
        routes = JSON.parse(routesAttr);
      } catch (e) {
        console.error('Invalid routes format:', e);
      }
    }
    
    if (projectId) {
      initWidget({
        projectId,
        position,
        primaryColor,
        template,
        routes
      });
    }
  }
});

export default initWidget;