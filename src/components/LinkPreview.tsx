import { MessageLink } from "@/lib/supabase";
import { extractDomain } from "@/lib/link-utils";

interface LinkPreviewProps {
  link: MessageLink;
  isCurrentUser: boolean;
}

export default function LinkPreview({ link, isCurrentUser }: LinkPreviewProps) {
  const handleClick = () => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`mt-2 border rounded-lg p-3 cursor-pointer hover:opacity-80 transition-opacity max-w-xs lg:max-w-md ${
        isCurrentUser ? "ml-auto" : "mr-auto"
      }`}
      style={{
        backgroundColor: isCurrentUser
          ? `rgb(var(--message-own-bg))`
          : `rgb(var(--message-bg))`,
        borderColor: `rgb(var(--border-color))`,
      }}
      onClick={handleClick}
    >
      {/* 링크 아이콘과 도메인 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
            style={{ color: `rgb(var(--text-muted))` }}
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: `rgb(var(--text-muted))` }}
        >
          {extractDomain(link.url)}
        </span>
      </div>

      {/* 제목 */}
      {link.title && (
        <h4
          className="font-medium text-sm mb-1 line-clamp-2"
          style={{
            color: isCurrentUser
              ? `rgb(var(--message-own-text))`
              : `rgb(var(--text-primary))`,
          }}
        >
          {link.title}
        </h4>
      )}

      {/* 설명 */}
      {link.description && (
        <p
          className="text-xs line-clamp-2 leading-relaxed"
          style={{
            color: isCurrentUser
              ? `rgb(var(--message-own-text))`
              : `rgb(var(--text-secondary))`,
          }}
        >
          {link.description}
        </p>
      )}
    </div>
  );
}
