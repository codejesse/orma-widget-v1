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
  private triggerElements: NodeListOf<Element> | null = null;

  constructor() {
    this.config = this.parseUrlParams();
    this.init();
  }

  private parseUrlParams(): WidgetConfig {
    const currentScript = document.currentScript as HTMLScriptElement;
    if (!currentScript?.src) {
      console.warn('OrmaWidget: Could not detect script source for URL parsing');
      return {};
    }

    const url = new URL(currentScript.src);
    const params = new URLSearchParams(url.search);
    
    // Also check the hash/fragment for additional params (common pattern)
    const hashParams = url.hash ? new URLSearchParams(url.hash.substring(1)) : null;
    
    const getParam = (key: string): string | null => {
      return params.get(key) || hashParams?.get(key) || null;
    };

    return {
      position: (getParam('position') as WidgetConfig['position']) || 'bottom-right',
      projectId: getParam('pid') || getParam('project-id') || undefined,
      companyIconUrl: getParam('company-icon-url') || getParam('icon') || undefined,
      colorTheme: getParam('color-theme') || getParam('theme') || 'default',
      primaryColor: getParam('primary-color') || getParam('color') || undefined,
      triggerSelector: getParam('trigger') || '[data-feedback-widget]',
      autoShow: getParam('auto-show') === 'true',
      showDelay: parseInt(getParam('show-delay') || '0', 10)
    };
  }

  private init(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  private setup(): void {
    this.createWidgetContainer();
    this.setupTriggers();
    
    // Handle auto-show functionality
    if (this.config.autoShow) {
      const delay = this.config.showDelay || 0;
      setTimeout(() => this.show(), delay);
    }

    // Handle inline positioning - auto-inject into specified containers
    if (this.config.position === 'inline') {
      this.handleInlinePositioning();
    }
  }

  private createWidgetContainer(): void {
    this.widgetContainer = document.createElement('div');
    this.widgetContainer.id = 'orma-widget-container';
    this.widgetContainer.style.cssText = `
      position: ${this.config.position === 'inline' ? 'relative' : 'fixed'};
      z-index: 2147483647;
      pointer-events: none;
    `;

    // For inline positioning, we'll append to target containers later
    if (this.config.position !== 'inline') {
      document.body.appendChild(this.widgetContainer);
    }
  }

  private setupTriggers(): void {
    // Set up click triggers
    const setupClickTriggers = () => {
      this.triggerElements = document.querySelectorAll(this.config.triggerSelector || '[data-feedback-widget]');
      
      this.triggerElements.forEach((element) => {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggle();
        });
        
        // Add cursor pointer for better UX
        if (element instanceof HTMLElement) {
          element.style.cursor = 'pointer';
        }
      });
    };

    // Initial setup
    setupClickTriggers();

    // Re-scan for new triggers periodically (for dynamic content)
    const observer = new MutationObserver(() => {
      setupClickTriggers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Set up keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  private handleInlinePositioning(): void {
    // Look for containers with data-orma-widget attribute
    const inlineContainers = document.querySelectorAll('[data-orma-widget]');
    
    if (inlineContainers.length === 0) {
      console.warn('OrmaWidget: No inline containers found. Add data-orma-widget attribute to target elements.');
      return;
    }

    inlineContainers.forEach((container) => {
      const inlineContainer = this.widgetContainer!.cloneNode(true) as HTMLDivElement;
      inlineContainer.id = `orma-widget-inline-${Math.random().toString(36).substr(2, 9)}`;
      inlineContainer.style.position = 'relative';
      inlineContainer.style.pointerEvents = 'auto';
      
      container.appendChild(inlineContainer);
      
      // Render widget directly for inline mode
      const root = createRoot(inlineContainer);
      root.render(
        React.createElement(OrmaWidget, {
          position: 'inline',
          projectId: this.config.projectId,
          companyIconUrl: this.config.companyIconUrl,
          colorTheme: this.config.colorTheme,
          primaryColor: this.config.primaryColor,
          onClose: () => {
            // For inline widgets, we might want to hide or remove them
            inlineContainer.style.display = 'none';
          }
        })
      );
    });
  }

  private renderWidget(): void {
    if (!this.widgetContainer || this.config.position === 'inline') return;

    // Enable pointer events when widget is shown
    this.widgetContainer.style.pointerEvents = 'auto';

    if (!this.root) {
      this.root = createRoot(this.widgetContainer);
    }

    this.root.render(
      React.createElement(OrmaWidget, {
        position: this.config.position,
        projectId: this.config.projectId,
        companyIconUrl: this.config.companyIconUrl,
        colorTheme: this.config.colorTheme,
        primaryColor: this.config.primaryColor,
        onClose: () => this.hide()
      })
    );
  }

  private show(): void {
    if (this.isVisible || this.config.position === 'inline') return;
    
    this.isVisible = true;
    this.renderWidget();
    
    // Add show animation
    if (this.widgetContainer) {
      this.widgetContainer.style.opacity = '0';
      this.widgetContainer.style.transform = this.getInitialTransform();
      this.widgetContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      // Trigger animation
      requestAnimationFrame(() => {
        if (this.widgetContainer) {
          this.widgetContainer.style.opacity = '1';
          this.widgetContainer.style.transform = 'none';
        }
      });
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('orma-widget-shown'));
  }

  private hide(): void {
    if (!this.isVisible || this.config.position === 'inline') return;
    
    this.isVisible = false;
    
    if (this.widgetContainer) {
      this.widgetContainer.style.opacity = '0';
      this.widgetContainer.style.transform = this.getInitialTransform();
      this.widgetContainer.style.pointerEvents = 'none';
      
      // Clean up after animation
      setTimeout(() => {
        if (this.root) {
          this.root.unmount();
          this.root = null;
        }
      }, 300);
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('orma-widget-hidden'));
  }

  private toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private getInitialTransform(): string {
    switch (this.config.position) {
      case 'bottom-right':
        return 'translateX(100px) translateY(100px) scale(0.8)';
      case 'bottom-left':
        return 'translateX(-100px) translateY(100px) scale(0.8)';
      case 'modal':
        return 'scale(0.9)';
      default:
        return 'scale(0.8)';
    }
  }

  // Public API methods
  public showWidget(): void {
    this.show();
  }

  public hideWidget(): void {
    this.hide();
  }

  public toggleWidget(): void {
    this.toggle();
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
    this.triggerElements?.forEach((element) => {
      element.removeEventListener('click', this.toggle);
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

// Wait for script to load and initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  initializeWidget();
}

function initializeWidget() {
  widgetInstance = new OrmaWidgetWrapper();
  
  // Expose global API
  window.OrmaWidget = {
    show: () => widgetInstance.showWidget(),
    hide: () => widgetInstance.hideWidget(),
    toggle: () => widgetInstance.toggleWidget(),
    updateConfig: (config) => widgetInstance.updateConfig(config),
    destroy: () => widgetInstance.destroy()
  };
}

// Handle hot module replacement in development
declare const module: { hot?: { accept: () => void } };

if (typeof module !== 'undefined' && module.hot) {
  module.hot.accept();
}