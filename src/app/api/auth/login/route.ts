import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { userName, password } = await request.json();

    if (!userName || !password) {
      return NextResponse.json(
        { error: "사용자 이름과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 기존 사용자 확인
    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("*")
      .eq("name", userName)
      .single();

    if (existingUser) {
      // 로그인 시도
      if (existingUser.password === password) {
        return NextResponse.json({
          success: true,
          message: "로그인 성공",
          user: { id: existingUser.id, name: existingUser.name },
        });
      } else {
        return NextResponse.json(
          { error: "비밀번호가 틀렸습니다." },
          { status: 401 }
        );
      }
    } else {
      // 새 사용자 생성 (회원가입)
      const { data: newUser, error: createError } = await supabaseServer
        .from("users")
        .insert([
          {
            name: userName,
            password: password,
          },
        ])
        .select()
        .single();

      if (createError) {
        if (createError.code === "23505") {
          // UNIQUE 제약조건 위반 (동시 가입 시도)
          return NextResponse.json(
            { error: "이미 사용 중인 사용자 이름입니다." },
            { status: 409 }
          );
        }
        throw createError;
      }

      return NextResponse.json({
        success: true,
        message: "회원가입 및 로그인 성공",
        user: { id: newUser.id, name: newUser.name },
      });
    }
  } catch (error) {
    console.error("Login/Register error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
