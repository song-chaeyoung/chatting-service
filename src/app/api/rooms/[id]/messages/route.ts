import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

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
        users!messages_user_id_fkey(name)
      `
      )
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const formattedMessages = messages.map((msg) => ({
      ...msg,
      user_name: msg.users?.name || "알 수 없는 사용자",
    }));

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

    const formattedMessage = {
      ...message,
      user_name: message.users?.name || "알 수 없는 사용자",
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
