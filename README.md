# SnapSheet

SnapSheet is a modern web application designed to turn your screenshots and images into perfectly formatted, printer-ready A4 PDF documents. It uses a sophisticated 2D bin packing algorithm to maximize space and efficiency.

## 🌟 The "Why"

### The Problem
When documenting software, reporting bugs, or creating visual guides, we often end up with a large collection of screenshots. Manually resizing and arranging these into a document (like Word or a basic PDF) is:
-   **Time-Consuming**: Hours spent dragging and aligning images.
-   **Inefficient**: Lots of wasted white space on A4 pages.
-   **Unprofessional**: Inconsistent image sizes and misaligned layouts.

### Our Motivation
SnapSheet was built to automate the tedious parts of documentation. By using a **Smart Bin Packing algorithm**, it treats your screenshots like a puzzle, finding the optimal way to fit them onto the fewest number of pages possible. We believe your time should be spent on the content, not the formatting.

## 🚀 Features

-   **Smart Auto-Layout**: Automatically packs images of varying sizes onto A4 pages using a MaxRects-based algorithm.
-   **Live Interactive Preview**: See exactly how your PDF will look as you upload and rearrange images.
-   **Drag & Drop Reordering**: Easily change the order of your screenshots with a smooth drag-and-drop interface.
-   **Customizable Layout**: Control margins, gaps, image scaling, and allow rotation to get the perfect fit.
-   **Client-Side PDF Generation**: Fast, high-quality PDF generation directly in your browser.

## 🛠️ Built With

-   **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)**
-   **[Vite](https://vitejs.dev/)** for lightning-fast development
-   **[Tailwind CSS](https://tailwindcss.com/)** for a clean, modern UI
-   **[@dnd-kit](https://dndkit.com/)** for robust drag-and-drop functionality
-   **[jsPDF](https://github.com/parallax/jsPDF)** for precise PDF generation

## 📦 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/VETHAVIYASH/snapsheet.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 🏗️ Project Structure

-   `src/components/`: UI components (UploadZone, LayoutPreview, Controls)
-   `src/utils/layoutEngine.ts`: The core 2D bin packing logic
-   `src/utils/pdfGenerator.ts`: Handles PDF conversion and download
-   `src/App.tsx`: Main application state and layout

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
