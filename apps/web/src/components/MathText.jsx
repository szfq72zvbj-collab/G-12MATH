import React, { useEffect, useMemo, useRef } from 'react';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[ch]));

const MathText = ({ children, className = '' }) => {
  const ref = useRef(null);
  const html = useMemo(() => escapeHtml(children).replace(/\r?\n/g, '<br />'), [children]);

  useEffect(() => {
    if (window.MathJax?.typesetPromise && ref.current) {
      window.MathJax.typesetClear?.([ref.current]);
      window.MathJax.typesetPromise([ref.current]).catch(() => {});
    }
  }, [html]);

  return <span ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MathText;
