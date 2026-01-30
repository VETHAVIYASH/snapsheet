import jsPDF from 'jspdf';

interface Screenshot {
    id: string;
    file: File;
    preview: string;
}

interface LayoutConfig {
    rows: number;
    cols: number;
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
    const margin = 10; // 10mm margin
    const gap = 5; // 5mm gap between images

    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);

    // Calculate cell dimensions including gap
    // Total width = (cols * cellW) + ((cols - 1) * gap)
    // cellW = (TotalWidth - (cols - 1) * gap) / cols

    const cellWidth = (contentWidth - ((config.cols - 1) * gap)) / config.cols;
    const cellHeight = (contentHeight - ((config.rows - 1) * gap)) / config.rows;

    const itemsPerPage = config.rows * config.cols;

    for (let i = 0; i < images.length; i++) {
        const imgData = images[i];

        // Add new page if needed
        if (i > 0 && i % itemsPerPage === 0) {
            doc.addPage();
        }

        const indexOnPage = i % itemsPerPage;
        const colIndex = indexOnPage % config.cols;
        const rowIndex = Math.floor(indexOnPage / config.cols);

        const x = margin + (colIndex * (cellWidth + gap));
        const y = margin + (rowIndex * (cellHeight + gap));

        // Load image to get dimensions
        const img = new Image();
        img.src = imgData.preview;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        // Calculate dimensions to fit in cell while maintaining aspect ratio
        const imgRatio = img.width / img.height;
        const cellRatio = cellWidth / cellHeight;

        let finalW = cellWidth;
        let finalH = cellHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > cellRatio) {
            // Image is wider than cell (relative to aspect)
            finalH = cellWidth / imgRatio;
            offsetY = (cellHeight - finalH) / 2;
        } else {
            // Image is taller than cell
            finalW = cellHeight * imgRatio;
            offsetX = (cellWidth - finalW) / 2;
        }

        // Add image to PDF
        // Note: jsPDF needs raw image data or base64. 
        // objectURL might work depending on browser, but safer to convert to base64 or pass the HTMLImageElement if supported.
        // jsPDF addImage supports HTMLImageElement since v2.0.
        doc.addImage(img, 'JPEG', x + offsetX, y + offsetY, finalW, finalH);

        // Optional: Draw cell border for debugging or style
        // doc.rect(x, y, cellWidth, cellHeight); 
    }

    doc.save('snapsheet.pdf');
};
