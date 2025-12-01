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

        // Create Vue app
        this.app = createApp(WeatherWidget);
        this.app.mount(container);

        // Inject styles into shadow DOM
        const style = document.createElement('style');
        // style.textContent = require('!!css-loader!sass-loader!./styles/main.scss').toString();
        shadowRoot.appendChild(style);
    }

    disconnectedCallback() {
        if (this.app) {
            this.app.unmount();
        }
    }
}

// Register custom element
if (!customElements.get('weather-widget')) {
    customElements.define('weather-widget', WeatherWidgetElement);
}

// Also export for direct Vue usage
export default WeatherWidget;