/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useCallback, useState, useEffect } from "react";

/**
 * Custom hook for debouncing callback function execution.
 * 
 * This hook delays the execution of a callback function until after the specified delay has elapsed
 * since the last time the debounced function was called. Useful for optimizing performance when
 * handling frequently triggered events like input changes or window resizing.
 * 
 * @template T - The type of arguments passed to the callback function
 * @param {(...args: T[]) => void} callback - The function to debounce
 * @param {number} delay - The delay in milliseconds after which the callback should be executed
 * @returns {(...args: T[]) => void} A debounced version of the callback function that resets the timer
 * on each invocation. The timer is automatically cleaned up when the component unmounts.
 * 
 * @example
 * const debouncedSearch = useDebounce((query: string) => {
 *   fetchSearchResults(query);
 * }, 300);
 * 
 * // Call this as frequently as needed; the callback will only execute 300ms after the last call
 * debouncedSearch(searchTerm);
 */
export const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = (...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFunction;
};

/**
 * Custom hook for exporting receipt content to PDF format.
 * 
 * This hook provides functionality to capture a receipt element and convert it to a PDF file.
 * It uses html2canvas to render the HTML element to a canvas, then converts it to a PDF using jsPDF.
 * 
 * @returns {Object} An object containing:
 * @returns {React.RefObject<HTMLDivElement>} receiptRef - A ref to attach to the receipt container element
 * @returns {() => Promise<void>} exportToPDF - Async function to trigger the PDF export process
 * @returns {boolean} isExporting - Boolean state indicating whether export is in progress
 */
export const useReceiptExport = (filename: string) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = useCallback(async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff", // explicit hex — never oklch
        onclone: (clonedDoc) => {
          // Strip all oklch colors from the cloned DOM before capture
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            const style = (el as HTMLElement).style;
            const computed = window.getComputedStyle(el);

            // Reset background if it contains oklch
            if (computed.backgroundColor.includes("oklch")) {
              style.backgroundColor = "#ffffff";
            }
            if (computed.color.includes("oklch")) {
              style.color = "#000000";
            }
            if (computed.borderColor.includes("oklch")) {
              style.borderColor = "#e5e7eb";
            }
          });
        },
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
        compress: true,
      });
      
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(filename);
    } catch (err) {
      console.error("Failed to export receipt:", err);
    } finally {
      setIsExporting(false);
    }
  }, [filename]);

  return { receiptRef, exportToPDF, isExporting };
}