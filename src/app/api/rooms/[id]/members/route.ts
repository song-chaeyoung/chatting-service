import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_ANON_KEY!
);

interface SupabaseRoomMember {
  user_id: string;
  joined_at: string;
  last_accessed_at: string;
  users: {
    id: string;
    name: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    console.log("🔍 멤버 조회 요청 - roomId:", roomId);

    // room_members 테이블에서 해당 채팅방의 멤버들을 가져옴
    const { data: members, error } = await supabase
      .from("room_members")
      .select(
        `
        user_id,
        joined_at,
        last_accessed_at,
        users (
          id,
          name
        )
      `
      )
      .eq("room_id", roomId)
      .order("last_accessed_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching room members:", error);
      return NextResponse.json(
        { error: "멤버 목록을 가져오는데 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("📊 조회된 멤버 데이터:", members);

    // 멤버 데이터 정리
    const memberList =
      (members as unknown as SupabaseRoomMember[])
        ?.filter((member) => member.users)
        .map((member) => ({
          id: member.users.id,
          name: member.users.name,
          joinedAt: member.joined_at,
          lastAccessedAt: member.last_accessed_at,
        })) || [];

    return NextResponse.json({ members: memberList });
  } catch (error) {
    console.error("Error in members API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
