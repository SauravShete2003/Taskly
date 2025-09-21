import { useState } from "react";

export default function CommentInput({ onAdd }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 outline-none min-h-[48px] max-h-32"
            rows="1"
            style={{
              minHeight: "48px",
              maxHeight: "128px",
              lineHeight: "1.5",
            }}
            aria-label="Comment input"
          />
          <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
            {content.length}/500
          </div>
        </div>
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-sm hover:shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
          aria-label="Post comment"
        >
          Post
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>{" "}
        to submit, <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift + Enter</kbd> for new line
      </p>
    </form>
  );
}