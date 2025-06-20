// wrapper.ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { OrmaWidget } from './components/OrmaWidget';

interface WidgetConfig {
  position?: 'bottom-right' | 'bottom-left' | 'modal' | 'inline';
  projectId?: string;
  companyIconUrl?: string;
  colorTheme?: string;
  primaryColor?: string;
  triggerSelector?: string;
  autoShow?: boolean;
  showDelay?: number;
}

class OrmaWidgetWrapper {
  private config: WidgetConfig;
  private widgetContainer: HTMLDivElement | null = null;
  private root: any = null;
  private isVisible: boolean = false;
  private triggerElements: Element[] = [];
  private clickHandler: (e: Event) => void;

  constructor() {
    this.config = this.parseUrlParams();
    this.clickHandler = this.handleTriggerClick.bind(this);
    console.log('OrmaWidget initialized with config:', this.config);
    this.init();
  }

  private parseUrlParams(): WidgetConfig {
    // Try multiple methods to get the script URL
    let scriptUrl: string | null = null;
    
    // Method 1: Find script by src pattern
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src && src.includes('orma-widget')) {
        scriptUrl = src;
        break;
      }
    }
    
    if (!scriptUrl) {
      console.warn('OrmaWidget: Could not detect script source, using default config');
      return { position: 'bottom-right' };
    }

    try {
      const url = new URL(scriptUrl);
      const params = new URLSearchParams(url.search);
      
      const getParam = (key: string): string | null => {
        return params.get(key) || null;
      };

      const config = {
        position: (getParam('position') as WidgetConfig['position']) || 'bottom-right',
        projectId: getParam('pid') || getParam('project-id') || undefined,
        companyIconUrl: getParam('company-icon-url') || getParam('icon') || undefined,
        colorTheme: getParam('color-theme') || getParam('theme') || 'default',
        primaryColor: getParam('primary-color') || getParam('color') || undefined,
        triggerSelector: getParam('trigger') || '[data-feedback-widget]',
        autoShow: getParam('auto-show') === 'true',
        showDelay: parseInt(getParam('show-delay') || '0', 10)
      };

      console.log('Parsed config from URL:', config);
      return config;
    } catch (e) {
      console.error('Failed to parse script URL:', scriptUrl, e);
      return { position: 'bottom-right' };
    }
  }

  private init(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      setTimeout(() => this.setup(), 100);
    }
  }

  private setup(): void {
    console.log('Setting up OrmaWidget...');
    
    this.createWidgetContainer();
    this.setupTriggers();
    
    // Handle auto-show functionality
    if (this.config.autoShow) {
      const delay = this.config.showDelay || 0;
      setTimeout(() => this.show(), delay);
    }

    // Handle inline positioning
    if (this.config.position === 'inline') {
      this.handleInlinePositioning();
    }
  }

  private createWidgetContainer(): void {
    if (this.widgetContainer) return;

    this.widgetContainer = document.createElement('div');
    this.widgetContainer.id = 'orma-widget-container';
    
    // MINIMAL container - let React component handle all positioning and styling
    if (this.config.position === 'inline') {
      // For inline, we'll handle this separately
      return;
    } else {
      // For fixed positions, create a minimal container that doesn't interfere
      this.widgetContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2147483647;
      `;
      document.body.appendChild(this.widgetContainer);
    }

    console.log('Widget container created for position:', this.config.position);
  }

  private setupTriggers(): void {
    const selector = this.config.triggerSelector || '[data-feedback-widget]';
    console.log('Setting up triggers for selector:', selector);

    const updateTriggers = () => {
      // Remove old event listeners
      this.triggerElements.forEach(element => {
        element.removeEventListener('click', this.clickHandler);
      });

      // Find new triggers
      this.triggerElements = Array.from(document.querySelectorAll(selector));
      console.log('Found trigger elements:', this.triggerElements.length);
      
      // Add event listeners
      this.triggerElements.forEach((element) => {
        element.addEventListener('click', this.clickHandler);
        
        // Add cursor pointer for better UX
        if (element instanceof HTMLElement) {
          element.style.cursor = 'pointer';
        }
      });
    };

    // Initial setup
    updateTriggers();

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      updateTriggers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // ESC key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  private handleTriggerClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    console.log('Trigger clicked, current visibility:', this.isVisible);
    
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private handleInlinePositioning(): void {
    const inlineContainers = document.querySelectorAll('[data-orma-widget]');
    
    if (inlineContainers.length === 0) {
      console.warn('OrmaWidget: No inline containers found. Add data-orma-widget attribute to target elements.');
      return;
    }

    inlineContainers.forEach((container) => {
      // Create a simple wrapper that doesn't interfere with styles
      const inlineContainer = document.createElement('div');
      container.appendChild(inlineContainer);
      
      const root = createRoot(inlineContainer);
      root.render(
        React.createElement(OrmaWidget, {
          position: 'inline',
          projectId: this.config.projectId,
          companyIconUrl: this.config.companyIconUrl,
          colorTheme: this.config.colorTheme,
          primaryColor: this.config.primaryColor,
          onClose: () => {
            inlineContainer.style.display = 'none';
          }
        })
      );
    });
  }

  private renderWidget(): void {
    if (!this.widgetContainer || this.config.position === 'inline') return;

    console.log('Rendering widget...');
    
    // Only enable pointer events on the container when showing
    this.widgetContainer.style.pointerEvents = 'auto';

    if (!this.root) {
      this.root = createRoot(this.widgetContainer);
    }

    // Render the widget - let it handle its own positioning completely
    this.root.render(
      React.createElement(OrmaWidget, {
        position: this.config.position,
        projectId: this.config.projectId,
        companyIconUrl: this.config.companyIconUrl,
        colorTheme: this.config.colorTheme,
        primaryColor: this.config.primaryColor,
        onClose: () => {
          console.log('Widget close requested');
          this.hide();
        }
      })
    );
  }

  private show(): void {
    if (this.isVisible || this.config.position === 'inline') {
      console.log('Widget already visible or inline, skipping show');
      return;
    }
    
    console.log('Showing widget');
    this.isVisible = true;
    this.renderWidget();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('orma-widget-shown'));
  }

  private hide(): void {
    if (!this.isVisible || this.config.position === 'inline') {
      console.log('Widget not visible or inline, skipping hide');
      return;
    }
    
    console.log('Hiding widget');
    this.isVisible = false;
    
    if (this.widgetContainer) {
      this.widgetContainer.style.pointerEvents = 'none';
      
      // Clean up the React component
      if (this.root) {
        this.root.unmount();
        this.root = null;
      }
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('orma-widget-hidden'));
  }

  // Public API methods
  public showWidget(): void {
    this.show();
  }

  public hideWidget(): void {
    this.hide();
  }

  public toggleWidget(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public updateConfig(newConfig: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.isVisible) {
      this.renderWidget();
    }
  }

  public destroy(): void {
    this.hide();
    if (this.widgetContainer?.parentNode) {
      this.widgetContainer.parentNode.removeChild(this.widgetContainer);
    }
    this.triggerElements.forEach((element) => {
      element.removeEventListener('click', this.clickHandler);
    });
  }
}

// Global API
declare global {
  interface Window {
    OrmaWidget: {
      show: () => void;
      hide: () => void;
      toggle: () => void;
      updateConfig: (config: Partial<WidgetConfig>) => void;
      destroy: () => void;
    };
  }
}

// Initialize the widget
let widgetInstance: OrmaWidgetWrapper;

function initializeWidget() {
  try {
    widgetInstance = new OrmaWidgetWrapper();
    
    // Expose global API
    window.OrmaWidget = {
      show: () => widgetInstance.showWidget(),
      hide: () => widgetInstance.hideWidget(),
      toggle: () => widgetInstance.toggleWidget(),
      updateConfig: (config) => widgetInstance.updateConfig(config),
      destroy: () => widgetInstance.destroy()
    };

    console.log('OrmaWidget initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OrmaWidget:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  setTimeout(initializeWidget, 50);
}

// Handle hot module replacement in development
declare const module: { hot?: { accept: () => void } };

if (typeof module !== 'undefined' && module.hot) {
  module.hot.accept();
}