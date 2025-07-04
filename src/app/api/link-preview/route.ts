import { NextRequest, NextResponse } from "next/server";

// 간단한 HTML 파싱 함수
function extractMetaContent(html: string, property: string): string {
  const regex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*?)["']`,
    "i"
  );
  const match = html.match(regex);
  return match ? match[1] : "";
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : "";
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    // URL 유효성 검사
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!validUrl.protocol.startsWith("http")) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "유효하지 않은 URL입니다." },
        { status: 400 }
      );
    }

    // 외부 사이트에서 HTML 가져오기
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(5000), // 5초 타임아웃
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // 메타데이터 추출
    const title =
      extractMetaContent(html, "og:title") ||
      extractMetaContent(html, "twitter:title") ||
      extractTitle(html) ||
      "제목 없음";

    const description =
      extractMetaContent(html, "og:description") ||
      extractMetaContent(html, "twitter:description") ||
      extractMetaContent(html, "description") ||
      "";

    const siteName =
      extractMetaContent(html, "og:site_name") || validUrl.hostname;

    return NextResponse.json({
      url: url,
      title: title.trim().substring(0, 200), // 제목 길이 제한
      description: description.trim().substring(0, 300), // 설명 길이 제한
      siteName: siteName,
    });
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return NextResponse.json(
      {
        error: "링크 미리보기를 가져올 수 없습니다.",
      },
      { status: 500 }
    );
  }
}
