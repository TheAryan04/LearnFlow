import React from 'react';

export default function QuillViewer({ content = '', className = '' }) {
  if (!content) {
    return <p className="text-slate-400 italic">No notes provided for this lesson.</p>;
  }

  return (
    <div
      className={`quill-viewer prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
