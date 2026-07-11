import React, { useState } from 'react';
import { TuningResponse, DrivetrainType, ModificationType } from '../types';
import { FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportProps {
  results: TuningResponse | null;
  weight: number;
  drivetrain: DrivetrainType;
  modifications: ModificationType[];
  t: any;
  lang: 'en' | 'ar';
}

export const PDFExport: React.FC<PDFExportProps> = ({
  results,
  weight,
  drivetrain,
  modifications,
  t,
  lang
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!results) return null;

  const handleExport = async () => {
    setIsGenerating(true);
    
    // Select the element to print
    const element = document.getElementById('pdf-report-template');
    if (!element) {
      setIsGenerating(false);
      return;
    }

    try {
      // Capture element to canvas (already rendered offscreen, so it has correct dimensions instantly)
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#0a0a0f', // Match app background
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF page size
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Output PDF as a Blob to enforce MIME type and download filename parameters in all browsers
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      
      // Open the PDF in a new tab/window immediately
      window.open(blobUrl, '_blank');

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Car_Tuning_Report.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup with delay to let the new tab load the blob URL
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10000);

    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button onClick={handleExport} className="btn-secondary" style={{ width: '100%' }}>
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
        <span>{isGenerating ? 'Generating...' : t.exportPdf}</span>
      </button>

      {/* Dedicated PDF template rendered off-screen so it has computed layouts at all times */}
      <div
        id="pdf-report-template"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          zIndex: -1000,
          width: '794px', // Standard A4 pixel width at 96 DPI
          padding: '40px',
          color: '#f5f5f7',
          backgroundColor: '#0a0a0f',
          fontFamily: lang === 'ar' ? "'Cairo', sans-serif" : "'Outfit', sans-serif",
          direction: lang === 'ar' ? 'rtl' : 'ltr',
          textAlign: lang === 'ar' ? 'right' : 'left',
          boxSizing: 'border-box'
        }}
      >
        {/* Report Header */}
        <div style={{ borderBottom: '2px solid #ff5500', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f5f5f7', marginBottom: '8px' }}>
            {t.pdfTitle}
          </h1>
          <p style={{ color: '#9ea0a8', fontSize: '14px' }}>
            {t.pdfGenerated}: {new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
        </div>

        {/* Technical Specs Section */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ff5500', marginBottom: '16px' }}>
            {t.pdfHeaderSpecs}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '10px 0', color: '#9ea0a8' }}>{t.weight}</td>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>{weight} kg</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '10px 0', color: '#9ea0a8' }}>{t.drivetrain}</td>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>{drivetrain}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '10px 0', color: '#9ea0a8' }}>{t.horsepower} ({t.stock})</td>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>{results.stock.horsepower} HP</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '10px 0', color: '#9ea0a8' }}>{t.torque} ({t.stock})</td>
                <td style={{ padding: '10px 0', fontWeight: 600 }}>{results.stock.torque} Nm</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Applied Modifications Section */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#00f0ff', marginBottom: '16px' }}>
            {t.pdfHeaderMods}
          </h2>
          {modifications.length === 0 ? (
            <p style={{ color: '#5e6066', fontSize: '14px' }}>None</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {modifications.map(mod => (
                <div
                  key={mod}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <strong style={{ display: 'block', color: '#00f0ff', fontSize: '14px', marginBottom: '4px' }}>
                    {t[mod]}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#9ea0a8' }}>
                    {t[`${mod}Desc`]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Matrix Table */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ff5500', marginBottom: '16px' }}>
            {t.pdfHeaderPerformance}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#9ea0a8' }}>
                <th style={{ padding: '12px 0' }}>Metric</th>
                <th style={{ padding: '12px 0' }}>{t.stock}</th>
                <th style={{ padding: '12px 0' }}>{t.modified}</th>
                <th style={{ padding: '12px 0' }}>{t.difference}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '12px 0', fontWeight: 500 }}>{t.horsepower}</td>
                <td style={{ padding: '12px 0' }}>{results.stock.horsepower} HP</td>
                <td style={{ padding: '12px 0', color: '#00f0ff', fontWeight: 600 }}>{results.modified.horsepower} HP</td>
                <td style={{ padding: '12px 0', color: '#00e676' }}>
                  +{results.differences.horsepower} HP (+{results.differences.horsepowerPct}%)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '12px 0', fontWeight: 500 }}>{t.torque}</td>
                <td style={{ padding: '12px 0' }}>{results.stock.torque} Nm</td>
                <td style={{ padding: '12px 0', color: '#00f0ff', fontWeight: 600 }}>{results.modified.torque} Nm</td>
                <td style={{ padding: '12px 0', color: '#00e676' }}>
                  +{results.differences.torque} Nm (+{results.differences.torquePct}%)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '12px 0', fontWeight: 500 }}>{t.accel}</td>
                <td style={{ padding: '12px 0' }}>{results.stock.acceleration} s</td>
                <td style={{ padding: '12px 0', color: '#ff5500', fontWeight: 600 }}>{results.modified.acceleration} s</td>
                <td style={{ padding: '12px 0', color: results.differences.acceleration >= 0 ? '#00e676' : '#ff1744' }}>
                  {results.differences.acceleration >= 0 ? '-' : '+'}{Math.abs(results.differences.acceleration)} s ({results.differences.accelerationPct}%)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '12px 0', fontWeight: 500 }}>{t.topSpeed}</td>
                <td style={{ padding: '12px 0' }}>{results.stock.topSpeed} km/h</td>
                <td style={{ padding: '12px 0', color: '#00f0ff', fontWeight: 600 }}>{results.modified.topSpeed} km/h</td>
                <td style={{ padding: '12px 0', color: '#00e676' }}>
                  +{results.differences.topSpeed} km/h (+{results.differences.topSpeedPct}%)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '12px 0', fontWeight: 500 }}>{t.fuel}</td>
                <td style={{ padding: '12px 0' }}>{results.stock.fuelConsumption} L</td>
                <td style={{ padding: '12px 0', color: '#ffb300', fontWeight: 600 }}>{results.modified.fuelConsumption} L</td>
                <td style={{ padding: '12px 0', color: results.differences.fuelConsumption <= 0 ? '#00e676' : '#ff1744' }}>
                  {results.differences.fuelConsumption > 0 ? '+' : ''}{results.differences.fuelConsumption} L ({results.differences.fuelConsumptionPct}%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', paddingBottom: '20px', textAlign: 'center', color: '#5e6066', fontSize: '11px', marginTop: '60px' }}>
          {t.pdfFooter}
        </div>
      </div>
    </>
  );
};
