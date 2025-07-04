import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// 링크 감지 함수
function extractLinks(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

// 링크 미리보기 데이터 가져오기
async function fetchLinkPreview(url: string) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/link-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch link preview");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return null;
  }
}

// 메시지 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    const { data: messages, error } = await supabaseServer
      .from("messages")
      .select(
        `
        *,
        users!messages_user_id_fkey(name),
        message_links(*)
      `
      )
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // 디버깅: 원본 데이터 확인
    console.log("=== API DEBUG START ===");
    console.log("Room ID:", roomId);
    console.log("Total messages:", messages.length);
    console.log(
      "Raw messages (first 2):",
      JSON.stringify(messages.slice(0, 2), null, 2)
    );
    console.log(
      "Messages with message_links:",
      messages.filter((m) => m.message_links && m.message_links.length > 0)
    );

    const formattedMessages = messages.map((msg) => ({
      ...msg,
      user_name: msg.users?.name || "알 수 없는 사용자",
      links: msg.message_links || [],
    }));

    // 디버깅: 변환된 데이터 확인
    console.log(
      "Formatted messages with links:",
      formattedMessages.filter((m) => m.links && m.links.length > 0)
    );
    console.log("=== API DEBUG END ===");

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "메시지를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 메시지 전송
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { content, userName } = await request.json();
    const { id: roomId } = await params;

    // 사용자 찾기
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("name", userName)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 메시지 저장
    const { data: message, error: messageError } = await supabaseServer
      .from("messages")
      .insert([
        {
          room_id: roomId,
          user_id: user.id,
          content,
        },
      ])
      .select(
        `
        *,
        users!messages_user_id_fkey(name)
      `
      )
      .single();

    if (messageError) throw messageError;

    // 링크 감지 및 미리보기 저장 (백그라운드에서 처리)
    const links = extractLinks(content);
    if (links.length > 0) {
      // 백그라운드에서 링크 미리보기 처리
      Promise.all(
        links.map(async (url) => {
          const preview = await fetchLinkPreview(url);
          if (preview && !preview.error) {
            await supabaseServer.from("message_links").insert([
              {
                message_id: message.id,
                url: preview.url,
                title: preview.title,
                description: preview.description,
              },
            ]);
          }
        })
      ).catch((error) => {
        console.error("Error processing link previews:", error);
      });
    }

    const formattedMessage = {
      ...message,
      user_name: message.users?.name || "알 수 없는 사용자",
      links: [], // 새 메시지는 링크 처리 중이므로 빈 배열
    };

    return NextResponse.json({ message: formattedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "메시지 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
