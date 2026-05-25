import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export async function POST(request: Request) {
  const { question } = await request.json();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(data.user.id);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      answer: "Demo modundayım. Gerçek AI yanıtı için Vercel Environment Variables içine OPENAI_API_KEY eklenmeli."
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: "gpt-5.5",
    store: false,
    input: [
      {
        role: "system",
        content: "Sen Olympion Lab yapay zeka koçusun. Türkçe cevap ver. Direkt tam çözüm ezberletme; sezgi, strateji, ipucu ve takip sorusu ver."
      },
      {
        role: "user",
        content: `Öğrenci profili: ${JSON.stringify(profile)}\nSoru: ${question}`
      }
    ]
  });

  await supabase.from("ai_messages").insert({
    user_id: data.user.id,
    role: "user",
    content: String(question)
  });

  await supabase.from("ai_messages").insert({
    user_id: data.user.id,
    role: "assistant",
    content: response.output_text
  });

  return NextResponse.json({
    answer: response.output_text
  });
}
