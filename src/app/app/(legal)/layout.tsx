import CommonFooter from "@/components/CommonFooter";
import CommonHeader from "@/components/CommonHeader";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <CommonHeader />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <article className="prose prose-green dark:prose-invert max-w-none">
          {children}
        </article>
      </div>
      <CommonFooter />
    </div>
  );
}
