import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Wine, FlaskConical, TestTubes, LayoutDashboard, BookOpen, Download, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const handleExportData = async () => {
    try {
      toast.loading("Exporting data...");
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brew-buddy-export-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("Data exported successfully");
    } catch {
      toast.dismiss();
      toast.error("Failed to export data");
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/recipes", label: "Recipes", icon: BookOpen },
    { path: "/batches", label: "Batches", icon: FlaskConical },
    { path: "/f2-variants", label: "F2", icon: TestTubes },
    { path: "/statistics", label: "Stats", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wine className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Brew Buddy</h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2" onClick={handleExportData}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <nav className="md:hidden flex gap-1 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
            <button
              className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors text-foreground hover:bg-muted"
              onClick={handleExportData}
              title="Export"
            >
              <Download className="h-5 w-5" />
              <span className="text-xs mt-1">Export</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Layout;
