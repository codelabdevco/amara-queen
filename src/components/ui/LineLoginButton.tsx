import LineIcon from "@/components/ui/LineIcon";

export default function LineLoginButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="/api/auth/line"
      className={`flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold tracking-wide transition-all hover:brightness-110 ${className}`}
      style={{ background: "#06C755", color: "#fff", width: 220 }}
    >
      <LineIcon size={20} />
      เข้าสู่ระบบด้วย LINE
    </a>
  );
}
