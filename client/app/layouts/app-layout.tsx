import { Link, Outlet, useLocation } from "react-router";

const navItems = [
  { label: "ダッシュボード", href: "/" },
  { label: "ファイルアップロード", href: "/jobs/upload" },
  { label: "テンプレート管理", href: "/templates" },
  { label: "帳票テンプレート", href: "/report-templates" },
  { label: "帳票出力", href: "/report-jobs" },
];

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800">DataBridge</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm text-gray-500">業務データ取り込み・帳票出力基盤</h2>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
