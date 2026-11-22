"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { cldImage } from "@/lib/cloudinary";

/**
 * next/image backed by Cloudinary: Cloudinary resizes, picks the format and
 * compresses, then serves from its CDN. Next's own optimizer is skipped, so
 * these images don't count toward your host's image-optimization quota.
 */
export default function CldImage({ publicId, ...props }: Omit<ImageProps, "src" | "loader"> & { publicId: string }) {
  const loader: ImageLoader = ({ width, quality }) => cldImage(publicId, { width, quality: quality ?? "auto" });
  return <Image {...props} src={publicId} loader={loader} />;
}
