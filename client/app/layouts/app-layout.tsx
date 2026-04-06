import { Link, Outlet, useLocation } from "react-router";
import {
  LayoutDashboard,
  Upload,
  FileText,
  FileOutput,
  Printer,
  Database,
} from "lucide-react";

const navItems = [
  { label: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { label: "ファイルアップロード", href: "/jobs/upload", icon: Upload },
  { label: "テンプレート管理", href: "/templates", icon: FileText },
  { label: "帳票テンプレート", href: "/report-templates", icon: FileOutput },
  { label: "帳票出力", href: "/report-jobs", icon: Printer },
];

export function AppLayout() {
  const { pathname } = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="border-b border-sidebar-border px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(77,131,253,0.28)] bg-[rgba(38,101,253,0.16)] shadow-[0_0_20px_rgba(38,101,253,0.15)]">
              <Database className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">DataBridge</p>
              <p className="text-xs text-muted-foreground">Business Data Workspace</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 px-4 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 text-sm font-medium transition-all ${
                  active
                    ? "border-[rgba(38,101,253,0.22)] bg-[rgba(38,101,253,0.12)] text-[#4d83fd]"
                    : "border-transparent text-sidebar-foreground hover:border-sidebar-border hover:bg-[#111b33] hover:text-foreground"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? "text-[#4d83fd]" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="text-xs text-muted-foreground">v0.1.0 MVP</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-sidebar-border bg-[rgba(11,19,38,0.82)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 lg:px-10">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#4d83fd]">Workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">業務データ取り込み・帳票出力基盤</p>
            </div>
            <div className="rounded-full border border-sidebar-border bg-[rgba(17,27,51,0.78)] px-3 py-1.5 text-xs text-muted-foreground">
              Enterprise dark UI
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="min-h-full rounded-[28px] border border-border bg-[rgba(11,19,38,0.72)] px-5 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.3)] backdrop-blur sm:px-7 sm:py-6 lg:px-10 lg:py-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
