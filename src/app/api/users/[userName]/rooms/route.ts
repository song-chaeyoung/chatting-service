import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userName: string }> }
) {
  try {
    const { userName } = await params;
    const decodedUserName = decodeURIComponent(userName);

    // 사용자 찾기 (같은 이름이 여러 개 있을 수 있으므로 첫 번째 사용자 사용)
    const { data: users, error: userError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("name", decodedUserName)
      .order("created_at", { ascending: true })
      .limit(1);

    const user = users?.[0];
    if (userError || !user) {
      return NextResponse.json({ rooms: [] });
    }

    // 사용자가 접속한 채팅방들 조회
    const { data: roomMembers, error: roomError } = await supabaseServer
      .from("room_members")
      .select(
        `
        rooms (
          id,
          name,
          created_at,
          created_by,
          is_private
        )
      `
      )
      .eq("user_id", user.id)
      .order("last_accessed_at", { ascending: false });

    if (roomError) throw roomError;

    // 데이터 변환
    const rooms =
      roomMembers?.map((item) => item.rooms).filter((room) => room !== null) ||
      [];

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    return NextResponse.json(
      { error: "사용자 채팅방을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
