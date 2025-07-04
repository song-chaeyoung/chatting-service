// 링크 감지 함수
export function extractLinks(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

// 텍스트에서 링크를 찾아서 JSX 요소로 변환
export function parseTextWithLinks(
  text: string
): Array<string | { type: "link"; url: string; text: string }> {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts
    .map((part) => {
      if (part.match(urlRegex)) {
        return {
          type: "link" as const,
          url: part,
          text: part,
        };
      }
      return part;
    })
    .filter((part) => part !== "");
}

// URL에서 도메인 추출
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// 링크 텍스트 단축 (표시용)
export function shortenUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;

  const domain = extractDomain(url);
  if (domain.length <= maxLength) return domain;

  return url.substring(0, maxLength - 3) + "...";
}
