import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Wine, FlaskConical, TestTubes, LayoutDashboard, BookOpen, LogOut, User, Download, BarChart3, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setChangePasswordOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      toast.loading("Exporting data...");
      
      const [recipes, batches, f2Variants, fermentationLogs, starterLogs] = await Promise.all([
        supabase.from("recipes").select("*"),
        supabase.from("batches").select("*"),
        supabase.from("f2_variant_batches").select("*"),
        supabase.from("fermentation_log_entries").select("*"),
        supabase.from("starter_log").select("*"),
      ]);

      let exportText = "=== BREW BUDDY DATA EXPORT ===\n\n";
      exportText += `Export Date: ${new Date().toISOString()}\n`;
      exportText += `User: ${user?.email}\n\n`;

      exportText += "=== RECIPES ===\n\n";
      recipes.data?.forEach((recipe) => {
        exportText += `Recipe: ${recipe.name}\n`;
        exportText += `Description: ${recipe.description || 'N/A'}\n`;
        exportText += `Batch Size: ${recipe.batch_size_liters}L\n`;
        exportText += `Tea: ${recipe.tea_amount_g_per_liter}g/L - ${recipe.tea_blend_description || 'N/A'}\n`;
        exportText += `Sugar: ${recipe.sugar_g_per_liter}g/L ${recipe.sugar_type || ''}\n`;
        exportText += `F1 Target: ${recipe.target_f1_days_min}-${recipe.target_f1_days_max} days\n`;
        exportText += `Notes: ${recipe.notes || 'N/A'}\n\n`;
      });

      exportText += "\n=== BATCHES ===\n\n";
      batches.data?.forEach((batch) => {
        exportText += `Batch: ${batch.batch_code}\n`;
        exportText += `Status: ${batch.status}\n`;
        exportText += `Start Date: ${batch.start_date}\n`;
        exportText += `Volume: ${batch.total_volume_liters}L\n`;
        exportText += `Initial pH: ${batch.initial_ph || 'N/A'}\n`;
        exportText += `Initial Brix: ${batch.initial_brix || 'N/A'}\n`;
        exportText += `Notes: ${batch.general_notes || 'N/A'}\n\n`;
      });

      exportText += "\n=== F2 VARIANTS ===\n\n";
      f2Variants.data?.forEach((variant) => {
        exportText += `Variant: ${variant.name}\n`;
        exportText += `Status: ${variant.f2_status}\n`;
        exportText += `Start Date: ${variant.f2_start_date}\n`;
        exportText += `Bottles: ${variant.bottle_count} x ${variant.bottle_size_liters}L\n`;
        exportText += `Fruits: ${variant.fruits_and_juices || 'N/A'}\n`;
        exportText += `Herbs: ${variant.herbs_and_spices || 'N/A'}\n`;
        exportText += `Rating: ${variant.tasting_rating ? `${variant.tasting_rating}/5` : 'N/A'}\n`;
        exportText += `Notes: ${variant.tasting_notes || 'N/A'}\n\n`;
      });

      exportText += "\n=== FERMENTATION LOGS ===\n\n";
      fermentationLogs.data?.forEach((log) => {
        exportText += `Date: ${new Date(log.timestamp).toLocaleString()}\n`;
        exportText += `Phase: ${log.phase}\n`;
        exportText += `pH: ${log.ph || 'N/A'}\n`;
        exportText += `Brix: ${log.brix || 'N/A'}\n`;
        exportText += `Temp: ${log.temperature_c ? `${log.temperature_c}°C` : 'N/A'}\n`;
        exportText += `Notes: ${log.smell_color_notes || log.taste_notes || 'N/A'}\n\n`;
      });

      exportText += "\n=== STARTER LOG ===\n\n";
      starterLogs.data?.forEach((starter) => {
        exportText += `Name: ${starter.name}\n`;
        exportText += `Status: ${starter.status}\n`;
        exportText += `Created: ${starter.creation_date}\n`;
        exportText += `pH: ${starter.current_ph || 'N/A'}\n`;
        exportText += `Notes: ${starter.notes || 'N/A'}\n\n`;
      });

      const blob = new Blob([exportText], { type: "text/plain" });
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
    } catch (error: any) {
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
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="max-w-[150px] truncate">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors text-foreground hover:bg-muted"
                    title="Menu"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-xs mt-1">Menu</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below. It must be at least 6 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;
