import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Menu,
  User,
  LogOut,
  Sun,
  Moon,
  Globe,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Maximize,
  Minimize,
  Users,
  FileText,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { MadeWithDyad } from "@/components/made-with-dyad";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "@/store/slices/authApi";
import { logOut } from "@/store/authActions";
import * as toast from "@/utils/toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useGetControlPanelSettingsQuery } from "@/store/slices/controlPanelApi";

interface WaliSantriLayoutProps {
  children: React.ReactNode;
  title: string;
  role: "wali-santri";
}

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const WaliSantriSidebar: React.FC<{ isCollapsed: boolean }> = ({
  isCollapsed,
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { data: settingsResponse } = useGetControlPanelSettingsQuery();
  const settings = settingsResponse?.data;
  const defaultLogoPath = "/images/default-logo.png";

  const navItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard/wali-santri",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      title: "Data Santri",
      href: "/dashboard/wali-santri/data-santri",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Informasi Tagihan",
      href: "/dashboard/wali-santri/tagihan",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Topup / Transfer Dana",
      href: "/dashboard/wali-santri/transaksi",
      icon: <Wallet className="h-5 w-5" />,
    },
  ];

  return (
    <nav
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 shrink-0 border-b border-sidebar-border px-4",
          isCollapsed ? "justify-center" : "justify-start"
        )}
      >
        <Link to="/dashboard/wali-santri" className="flex items-center gap-2 overflow-hidden">
          {settings?.app_logo ? (
            <img
              src={`https://api-smp.umediatama.com/storage/uploads/logos/small/${settings.app_logo}`}
              alt="App Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <img
              src={defaultLogoPath}
              alt="Default App Logo"
              className="h-8 w-8 object-contain"
            />
          )}
          {!isCollapsed && (
            <span className="text-xl font-bold text-primary whitespace-nowrap">
              {settings?.app_name || "SMP"}
            </span>
          )}
        </Link>
      </div>
      <div className="flex-grow p-2 pt-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            location.pathname.startsWith(`${item.href}/`);
          
          if (isCollapsed) {
             return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-center py-2 text-sm font-medium transition-colors rounded-md",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-sidebar-menu-hover-background/80"
                    )}
                  >
                    {item.icon}
                    <span className="sr-only">{item.title}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
             );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md",
                isActive
                  ? "bg-secondary text-secondary-foreground font-semibold"
                  : "hover:bg-sidebar-menu-hover-background/80"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const DashboardHeader: React.FC<{
  title: string;
  isMobile: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  settings: any;
}> = ({ title, isMobile, isCollapsed, setIsCollapsed, settings }) => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const currentUser = useSelector((state: RootState) =>
    selectCurrentUser(state)
  );
  const [hijriDate, setHijriDate] = useState("");

  const displayName =
    currentUser?.profile?.first_name && currentUser?.profile?.last_name
      ? `${currentUser.profile.first_name} ${currentUser.profile.last_name}`
      : currentUser?.name || t("header.usernamePlaceholder");

  useEffect(() => {
    document.title = `${settings?.app_name || "SMP"} | ${title}`;
  }, [title, settings]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const parts = formatter.formatToParts(today);
    let year = "";
    let month = "";
    let day = "";
    for (const part of parts) {
      if (part.type === "year") year = part.value;
      if (part.type === "month") month = part.value;
      if (part.type === "day") day = part.value;
    }
    setHijriDate(`${day}, ${month}, ${year}`);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logOut());
      toast.showSuccess("Anda telah berhasil logout.");
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.showError("Gagal logout. Silakan coba lagi.");
    }
  };

  return (
    <header className="bg-header text-header-foreground shadow-sm h-16 px-6 flex justify-between items-center border-b border-border">
      <div className="flex items-center">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <WaliSantriSidebar isCollapsed={false} />
            </SheetContent>
          </Sheet>
        ) : (
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="icon"
            className="mr-4"
          >
            {isCollapsed ? (
              <ChevronsRight className="h-5 w-5" />
            ) : (
              <ChevronsLeft className="h-5 w-5" />
            )}
          </Button>
        )}
        <div className="hidden md:block">
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground hidden sm:block">
          {hijriDate}
        </span>
        <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
          {isFullscreen ? (
            <Minimize className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Maximize className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">{t("header.toggleFullscreen")}</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("header.toggleTheme")}</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{t("header.selectLanguage")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => changeLanguage("id")}>
              <span className="mr-2">🇮🇩</span> Bahasa Indonesia
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => changeLanguage("en")}>
              <span className="mr-2">🇬🇧</span> English
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => changeLanguage("ar")}>
              <span className="mr-2">🇸🇦</span> العربية
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar>
                <AvatarImage src="/avatar-placeholder.png" alt="User Avatar" />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>{t("header.profile")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("header.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="font-medium hidden sm:block">{displayName}</span>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-800 text-white py-1 px-6 text-center">
      <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center text-xs">
        <p className="mb-1 sm:mb-0 sm:mr-2">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

const WaliSantriLayout: React.FC<WaliSantriLayoutProps> = ({
  children,
  title,
}) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: settingsResponse } = useGetControlPanelSettingsQuery();
  const settings = settingsResponse?.data;

  useEffect(() => {
    document.title = `${settings?.app_name || "SMP"} | ${title}`;
  }, [title, settings]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      {!isMobile && (
        <aside
          className={cn(
            "flex-shrink-0 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          <TooltipProvider delayDuration={0}>
            <WaliSantriSidebar isCollapsed={isCollapsed} />
          </TooltipProvider>
        </aside>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          title={title}
          isMobile={isMobile}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          settings={settings}
        />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default WaliSantriLayout;
