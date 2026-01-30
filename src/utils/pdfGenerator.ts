import jsPDF from 'jspdf';
import { packImages } from './layoutEngine';

interface Screenshot {
    id: string;
    file: File;
    preview: string;
    width: number;
    height: number;
}

interface LayoutConfig {
    rows: number;
    cols: number;
    margin: number;
    gap: number;
    allowRotation: boolean;
    scale: number;
    shrinkTolerance: number;
}

export const generatePDF = async (images: Screenshot[], config: LayoutConfig) => {
    if (images.length === 0) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;

    // Use LayoutEngine to position images
    const packedItems = packImages(images, {
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        margin: config.margin,
        gap: config.gap,
        allowRotation: config.allowRotation,
        scale: config.scale,
        shrinkTolerance: config.shrinkTolerance
    });

    // Sort items by page
    packedItems.sort((a, b) => a.pageIndex - b.pageIndex);

    let currentPage = 0;

    for (const item of packedItems) {
        // Find original image
        const imgData = images.find(img => img.id === item.id);
        if (!imgData) continue;

        // Add pages if needed
        while (currentPage < item.pageIndex) {
            doc.addPage();
            currentPage++;
        }

        // Load Image
        const img = new Image();
        img.src = imgData.preview;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        const x = item.x;
        const y = item.y;

        if (item.rotated) {
            // Draw rotated 90 degrees clockwise
            // Fits into box (item.width, item.height) on page.
            doc.addImage(img, 'JPEG', x + item.width, y, item.height, item.width, undefined, 'FAST', 90);
        } else {
            // Draw normal
            doc.addImage(img, 'JPEG', x, y, item.width, item.height);
        }
    }

    doc.save('snapsheet.pdf');
};
