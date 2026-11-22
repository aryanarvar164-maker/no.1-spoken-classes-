import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-6 text-center text-teal">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-display-md">This page doesn&apos;t exist.</h1>
        <Link href="/" className="btn-primary mt-8">
          Back to the homepage
        </Link>
      </div>
    </main>
  );
}
