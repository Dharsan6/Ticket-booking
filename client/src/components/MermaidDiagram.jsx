import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0f1123',
    primaryColor: '#7c3aed',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#a855f7',
    lineColor: '#6366f1',
    secondaryColor: '#1e2238',
    tertiaryColor: '#13162b',
    fontFamily: 'Plus Jakarta Sans, sans-serif'
  },
  securityLevel: 'loose'
});

export default function MermaidDiagram({ chart, id = 'mermaid-chart' }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const uniqueId = `${id}-${Math.random().toString(36).substr(2, 9)}`;

    const renderChart = async () => {
      try {
        setError(null);
        const { svg } = await mermaid.render(uniqueId, chart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to render diagram');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono whitespace-pre-wrap">
        Diagram Render Notice: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto p-4 sm:p-6 bg-brand-surface/90 rounded-2xl border border-brand-border/60 flex items-center justify-center min-h-[300px]"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
