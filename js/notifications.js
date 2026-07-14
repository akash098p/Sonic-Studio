"use strict";

class NotificationManager {
    constructor() {
        this.container = document.getElementById("notificationContainer");
    }

    show(message, type = "info", duration = 3000) {
        if (!this.container) return;
        
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.container.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add("show"), 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    info(message, duration) {
        this.show(message, "info", duration);
    }

    success(message, duration) {
        this.show(message, "success", duration);
    }

    error(message, duration) {
        this.show(message, "error", duration);
    }

    warning(message, duration) {
        this.show(message, "warning", duration);
    }
}

window.NotificationManager = new NotificationManager();

// Add notify method to App for backward compatibility
if (window.App) {
    window.App.notify = (message) => {
        window.NotificationManager?.info(message);
    };
}