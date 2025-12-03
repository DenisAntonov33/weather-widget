import { createApp } from 'vue';
import WeatherWidget from './App.vue';

// Define custom element
class WeatherWidgetElement extends HTMLElement {
    private app: any;

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });

        // Create a container for Vue app
        const container = document.createElement('div');
        shadowRoot.appendChild(container);

        // Track which styles we've already copied
        const copiedStyles = new Set<string>();

        // Function to inject styles into shadow DOM
        const injectStyles = (styleElement: HTMLStyleElement) => {
            const content = styleElement.textContent || '';
            // Check if this style belongs to our component
            if (content.includes('weather-widget') || 
                content.includes('settings-button') ||
                content.includes('city-weather') ||
                content.includes('data-v-')) {
                // Check if we haven't already copied this style
                if (!copiedStyles.has(content) && content.trim()) {
                    const shadowStyle = document.createElement('style');
                    shadowStyle.textContent = content;
                    shadowRoot.insertBefore(shadowStyle, shadowRoot.firstChild);
                    copiedStyles.add(content);
                }
            }
        };

        // Use MutationObserver to watch for style elements being added to document head
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'STYLE' && node instanceof HTMLStyleElement) {
                        injectStyles(node);
                    }
                });
            });
        });

        // Start observing the document head for style additions
        observer.observe(document.head, {
            childList: true,
            subtree: false
        });

        // Also check existing styles in case they were added before observer started
        document.querySelectorAll('style').forEach(injectStyles);

        // Create Vue app
        this.app = createApp(WeatherWidget);
        this.app.mount(container);

        // Store observer reference for cleanup
        (this as any)._styleObserver = observer;
    }

    disconnectedCallback() {
        if (this.app) {
            this.app.unmount();
        }
        // Clean up MutationObserver
        if ((this as any)._styleObserver) {
            (this as any)._styleObserver.disconnect();
        }
    }
}

// Register custom element
if (!customElements.get('weather-widget')) {
    customElements.define('weather-widget', WeatherWidgetElement);
}

// Also export for direct Vue usage
export default WeatherWidget;