import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { cloudinaryServerReady } from "@/lib/cloudinary-server";
import { isOwnerToken } from "@/lib/owner-auth";
import Editor from "@/components/owner/Editor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit website",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

export default async function OwnerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // Wrong or missing secret → looks exactly like any other missing page.
  if (!isOwnerToken(token)) notFound();

  const content = await getContent({ fresh: true });
  return <Editor initial={content} token={token} storageReady={cloudinaryServerReady()} />;
}
