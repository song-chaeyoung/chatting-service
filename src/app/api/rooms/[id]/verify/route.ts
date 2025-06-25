import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { password, userName } = await request.json();
    const { id: roomId } = await params;

    // 채팅방 정보 조회
    const { data: room, error: roomError } = await supabaseServer
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: "채팅방을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자 찾기 또는 생성
    let userId;
    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("id")
      .eq("name", userName)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: userError } = await supabaseServer
        .from("users")
        .insert([{ name: userName }])
        .select("id")
        .single();

      if (userError) throw userError;
      userId = newUser.id;
    }

    // 비공개 방이면 비밀번호 확인
    if (room.is_private) {
      if (room.password !== password) {
        return NextResponse.json(
          { error: "비밀번호가 올바르지 않습니다." },
          { status: 401 }
        );
      }
    }

    // room_members에 사용자 추가 (공개방, 비공개방 모두)
    await supabaseServer.from("room_members").upsert(
      {
        room_id: roomId,
        user_id: userId,
        last_accessed_at: new Date().toISOString(),
      },
      {
        onConflict: "room_id,user_id",
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying room access:", error);
    return NextResponse.json(
      { error: "접근 권한 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
