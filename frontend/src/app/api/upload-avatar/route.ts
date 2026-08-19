import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || "user";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `avatar_${userId.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload file directly to Supabase Storage bucket 'avatars'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(`profiles/${fileName}`, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload to Supabase Storage" },
        { status: 500 }
      );
    }

    // 2. Generate signed URL (10-year validity) to guarantee accessibility even if bucket is private
    const { data: signedUrlData } = await supabase.storage
      .from("avatars")
      .createSignedUrl(`profiles/${fileName}`, 10 * 365 * 24 * 60 * 60);

    const imageUrl =
      signedUrlData?.signedUrl ||
      supabase.storage.from("avatars").getPublicUrl(`profiles/${fileName}`).data.publicUrl;

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error("Avatar upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
