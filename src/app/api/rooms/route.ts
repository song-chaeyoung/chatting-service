import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// 채팅방 목록 조회
export async function GET() {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { data: rooms, error } = await supabaseServer
      .from("rooms")
      .select("id, name, created_at, is_private")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "채팅방을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 채팅방 생성
export async function POST(request: NextRequest) {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { name, userName, isPrivate, password } = await request.json();

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

    // 채팅방 생성
    const { data: room, error: roomError } = await supabaseServer
      .from("rooms")
      .insert([
        {
          name,
          created_by: userId,
          is_private: isPrivate || false,
          password: isPrivate ? password : null,
        },
      ])
      .select()
      .single();

    if (roomError) throw roomError;

    // 생성자를 room_members에 추가
    await supabaseServer.from("room_members").insert([
      {
        room_id: room.id,
        user_id: userId,
        joined_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "채팅방 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
