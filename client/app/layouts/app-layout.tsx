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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="border-b border-sidebar-border px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Database className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">DataBridge</p>
              <p className="text-xs text-muted-foreground">Business Data Workspace</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-l-2 border-primary bg-[rgba(38,101,253,0.08)] text-primary"
                    : "border-l-2 border-transparent text-sidebar-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="text-xs text-muted-foreground">v0.1.0 MVP</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-4 lg:px-10">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">Workspace</p>
              <p className="mt-0.5 text-sm text-muted-foreground">業務データ取り込み・帳票出力基盤</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
