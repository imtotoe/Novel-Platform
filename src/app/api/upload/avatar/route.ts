import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseServer } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WEBP allowed" }, { status: 400 });
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `avatars/${session.user.id}.${ext}`;

    const supabase = getSupabaseServer();
    const { error } = await supabase.storage
      .from("novel-assets")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from("novel-assets").getPublicUrl(path);
    const avatarUrl = data.publicUrl;

    // Update user avatar in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ url: avatarUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
