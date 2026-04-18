import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Prevent FOUC (Flash of Unstyled Content) by ensuring root is hidden until React mounts
const root = document.getElementById("root");
if (root) {
  root.style.backgroundColor = "#ffffff";
}

createRoot(document.getElementById("root")!).render(<App />);

// Load payment widgets after a brief delay to ensure React is fully mounted
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPaymentWidgets);
} else {
  setTimeout(loadPaymentWidgets, 500);
}

function loadPaymentWidgets() {
  try {
    // Load Tamara widget
    const tamaraScript = document.createElement('script');
    tamaraScript.src = 'https://cdn.tamara.co/widget-v2/tamara-widget.js';
    tamaraScript.async = true;
    document.body.appendChild(tamaraScript);

    // Load Tabby promo widget
    const tabbyScript = document.createElement('script');
    tabbyScript.src = 'https://checkout.tabby.ai/tabby-promo.js';
    tabbyScript.async = true;
    document.body.appendChild(tabbyScript);
  } catch (error) {
    console.warn('Failed to load payment widgets:', error);
  }
}
