"use strict";

class ExportManager {
    constructor() {
        this.exportFormat = "MP4";
        this.exportQuality = "High";
        this.isExporting = false;
        this.currentFormat = null;
    }

    setFormat(format) {
        this.exportFormat = format;
        this.currentFormat = format;
    }

    setQuality(quality) {
        this.exportQuality = quality;
    }

    async exportProject() {
        if (this.isExporting) return;
        if (!this.currentFormat) {
            this.notify("Please select an export format");
            return;
        }

        this.isExporting = true;
        this.notify(`Exporting project in ${this.currentFormat} format (${this.exportQuality})...`);

        try {
            // Simulate export with progress
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise(resolve => setTimeout(resolve, 500));
                this.notify(`Exporting project in ${this.currentFormat} format (${this.exportQuality}) [${progress}%]...`);
            }

            this.notify(`Export completed: ${this.currentFormat} format`);
            this.saveExportHistory(this.currentFormat, this.exportQuality);
        } catch (error) {
            this.notify(`Export failed: ${error.message}`);
        } finally {
            this.isExporting = false;
        }
    }

    saveExportHistory(format, quality) {
        const history = JSON.parse(localStorage.getItem('sonicstudio-export-history') || '[]');
        history.push({
            format,
            quality,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('sonicstudio-export-history', JSON.stringify(history));
    }

    notify(message) {
        if (window.NotificationManager) {
            window.NotificationManager.info(message);
        }
    }
}

window.ExportManager = new ExportManager();