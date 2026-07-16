import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
      <p className="text-xl text-muted-foreground mt-4">Page not found</p>
      <p className="text-muted-foreground/70 mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-6"><Button>Go Home</Button></Link>
    </main>
  );
}
