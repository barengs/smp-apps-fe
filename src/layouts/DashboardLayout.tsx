import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Calendar,
  Settings,
  LayoutDashboard,
  Menu,
  User,
  BookOpenText,
  LogOut,
  Sun,
  Moon,
  Briefcase,
  Key,
  UsersRound,
  UserCog,
  Megaphone,
  UserCheck,
  UserPlus,
  Maximize,
  Minimize,
  ChevronsLeft,
  ChevronsRight,
  Map,
  Landmark,
  Building2,
  Tent,
  GraduationCap,
  Network,
  School,
  BedDouble,
  ClipboardList,
  Globe,
  BookCopy,
  TrendingUp,
  CalendarClock,
  Shield,
  AlertTriangle,
  BookMarked,
  Compass,
  Newspaper,
  UserSearch,
  Receipt,
  Wallet,
  FileText,
  Package,
  BookKey,
  Banknote,
  ArrowLeftRight,
  Bed,
  Building,
  Info,
  Clock,
  ChevronRight,
  ChevronDown,
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
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "@/store/slices/authApi";
import { logOut } from "@/store/authActions";
import * as toast from "@/utils/toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
  LockScreenProvider,
  useLockScreen,
} from "@/contexts/LockScreenContext";
import LockScreen from "@/components/LockScreen";
import { useGetControlPanelSettingsQuery } from "@/store/slices/controlPanelApi";
import { useGetUserMenusQuery } from "@/store/slices/menuApi";
import { smpApi } from "../store/baseApi";
import { getIconComponent } from "@/utils/iconMapper";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: "wali-santri" | "administrasi";
}

interface SidebarNavItem {
  titleKey: string;
  href?: string;
  icon: React.ReactNode;
  children?: SidebarNavItem[];
}

// Helper to check if a route is active (handling strict matching for root/dashboard)
const isRouteActive = (route: string | undefined, currentPath: string) => {
  if (!route) return false;

  // Normalize paths by removing trailing slashes
  const cleanRoute = route.replace(/\/+$/, '');
  const cleanPath = currentPath.replace(/\/+$/, '');

  // Special handling for root/dashboard to avoid matching everything
  if (cleanRoute === '' || cleanRoute === '/dashboard') {
    return cleanPath === cleanRoute || cleanPath === '/dashboard';
  }

  // Exact match or sub-path match (ensure segment boundary)
  return cleanPath === cleanRoute || cleanPath.startsWith(`${cleanRoute}/`);
};

const SidebarRecursiveDropdownItem: React.FC<{ item: SidebarNavItem }> = ({ item }) => {
  const { t } = useTranslation();
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex items-center">
          {item.icon}
          <span className="ml-2">{t(item.titleKey)}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {item.children!.map(child => (
            <SidebarRecursiveDropdownItem key={child.titleKey} item={child} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem asChild>
      <Link to={item.href || '#'}>
        {item.icon}
        <span className="ml-2">{t(item.titleKey)}</span>
      </Link>
    </DropdownMenuItem>
  );
};

const SidebarRecursiveItem: React.FC<{ item: SidebarNavItem; level?: number }> = ({ item, level = 0 }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = isRouteActive(item.href, location.pathname);
  const hasChildren = item.children && item.children.length > 0;

  // Recursively check if any child is active to set open state
  const isChildActive = React.useMemo(() => {
    if (!hasChildren) return false;
    const checkActive = (nodes: SidebarNavItem[]): boolean => {
      return nodes.some(node =>
        isRouteActive(node.href, location.pathname) ||
        (node.children && checkActive(node.children))
      );
    };
    return checkActive(item.children!);
  }, [hasChildren, item.children, location.pathname]);

  const [isOpen, setIsOpen] = useState(isChildActive);

  // Update open state when inactive child becomes active (navigation)
  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className={cn(
            "w-full justify-between p-2 h-auto text-sm font-medium hover:bg-sidebar-menu-hover-background/80 hover:text-sidebar-foreground",
            isChildActive && !isOpen ? "text-primary font-semibold" : ""
          )}>
            <div className="flex items-center">
              {item.icon}
              <span className="ml-3">{t(item.titleKey)}</span>
            </div>
            {isOpen ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className={cn("space-y-1 mt-1", level === 0 ? "pl-4" : "pl-2")}>
          {item.children!.map(child => (
            <SidebarRecursiveItem key={child.titleKey} item={child} level={level + 1} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      to={item.href || '#'}
      className={cn(
        "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md",
        isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-sidebar-menu-hover-background/80"
      )}
    >
      {item.icon}
      <span className="ml-3">{t(item.titleKey)}</span>
    </Link>
  );
};

interface SidebarProps {
  role: "wali-santri" | "administrasi";
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { data: settingsResponse } = useGetControlPanelSettingsQuery();
  const settings = settingsResponse?.data;

  const { data: userMenus } = useGetUserMenusQuery();

  const sidebarNavItems: SidebarNavItem[] = React.useMemo(() => {
    if (!userMenus) return [];

    const mapToSidebarItems = (menus: any[], level = 0): SidebarNavItem[] => {
      return menus.map((menu) => ({
        titleKey: menu.id_title,
        href: menu.route || undefined,
        icon: getIconComponent(menu.icon),
        children: menu.children && menu.children.length > 0 ? mapToSidebarItems(menu.children, level + 1) : undefined,
      }));
    };

    return mapToSidebarItems(userMenus);
  }, [userMenus]);

  // Controlled active item for Accordion
  const [openItem, setOpenItem] = useState<string>("");

  // Automatically open accordion item based on active route
  useEffect(() => {
    if (isCollapsed) return;

    const findActiveParent = (items: SidebarNavItem[]) => {
      for (const item of items) {
        // Recursive check if this item or its descendants are active
        const checkActive = (node: SidebarNavItem): boolean => {
          if (isRouteActive(node.href, location.pathname)) return true;
          if (node.children) return node.children.some(child => checkActive(child));
          return false;
        };

        if (checkActive(item)) {
          return item.titleKey;
        }
      }
      return undefined;
    };

    const activeParent = findActiveParent(sidebarNavItems);
    if (activeParent) {
      setOpenItem(activeParent);
    }
  }, [location.pathname, sidebarNavItems, isCollapsed]);


  const defaultLogoPath = "/images/default-logo.png";

  return (
    <nav
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 shrink-0 border-b border-sidebar-border px-4",
          isCollapsed ? "justify-center" : "justify-start",
        )}
      >
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
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
        <Accordion
          type="single"
          collapsible
          className="w-full space-y-1"
          value={openItem}
          onValueChange={setOpenItem}
        >
          {sidebarNavItems.map((item) => {
            // Recursive active check for parent highlight
            const checkActive = (node: SidebarNavItem): boolean => {
              if (isRouteActive(node.href, location.pathname)) return true;
              if (node.children) return node.children.some(child => checkActive(child));
              return false;
            };
            const isActive = checkActive(item);

            if (item.children && item.children.length > 0) {
              if (isCollapsed) {
                return (
                  <Tooltip key={item.titleKey}>
                    <DropdownMenu>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg p-0"
                            size="icon"
                          >
                            {item.icon}
                            <span className="sr-only">{t(item.titleKey)}</span>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        forceMount
                        sideOffset={8}
                        className="z-50"
                      >
                        {item.children.map((child) => (
                          <SidebarRecursiveDropdownItem key={child.titleKey} item={child} />
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <TooltipContent side="right">
                      {t(item.titleKey)}
                    </TooltipContent>
                  </Tooltip>
                );
              } else {
                return (
                  <AccordionItem
                    value={item.titleKey}
                    key={item.titleKey}
                    className="border-none"
                  >
                    <AccordionTrigger
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-sidebar-menu-hover-background/80 hover:no-underline",
                        isActive && "bg-secondary text-secondary-foreground font-semibold",
                      )}
                    >
                      <div className="flex items-center flex-grow">
                        {item.icon}
                        <span className="ml-3">{t(item.titleKey)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 pt-1 space-y-1">
                      {item.children.map((child) => (
                        <SidebarRecursiveItem key={child.titleKey} item={child} level={1} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                );
              }
            } else {
              if (isCollapsed) {
                return (
                  <Tooltip key={item.titleKey}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href || "#"}
                        className={cn(
                          "flex items-center py-2 text-sm font-medium transition-colors rounded-md",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-sidebar-menu-hover-background/80",
                          "justify-center",
                        )}
                      >
                        {item.icon}
                        <span className="sr-only">{t(item.titleKey)}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {t(item.titleKey)}
                    </TooltipContent>
                  </Tooltip>
                );
              } else {
                return (
                  <Link
                    key={item.titleKey}
                    to={item.href || "#"}
                    className={cn(
                      "flex items-center py-2 text-sm font-medium transition-colors rounded-md",
                      isActive
                        ? "bg-primary text-secondary-foreground"
                        : "hover:bg-sidebar-menu-hover-background/80",
                      "px-4",
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{t(item.titleKey)}</span>
                  </Link>
                );
              }
            }
          })}
        </Accordion>
      </div>
    </nav>
  );
};

const DashboardHeader: React.FC<{
  title: string;
  role: "wali-santri" | "administrasi";
  isMobile: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  settings: any;
}> = ({ title, role, isMobile, isCollapsed, setIsCollapsed, settings }) => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const currentUser = useSelector((state: RootState) =>
    selectCurrentUser(state),
  );
  const [hijriDate, setHijriDate] = useState(""); // Menambahkan deklarasi state untuk hijriDate

  // Mengambil nama dari properti profile, dengan fallback ke name atau placeholder
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
      dispatch(smpApi.util.resetApiState()); // ADDED: Reset the entire RTK Query cache
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
              <Sidebar role={role} isCollapsed={false} />
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
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings/app-profile">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("header.settings")}</span>
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

const DashboardLayoutWithLockScreen: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  role,
}) => {
  const { isLocked } = useLockScreen();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: settingsResponse } = useGetControlPanelSettingsQuery(); // Mengubah nama variabel
  const settings = settingsResponse?.data; // Mengakses data dari properti 'data'

  useEffect(() => {
    document.title = `${settings?.app_name || "SMP"} | ${title}`;
  }, [title, settings]);

  return (
    <>
      {isLocked && <LockScreen />}
      <div
        className={cn(
          "flex h-screen bg-gray-50 dark:bg-background",
          isLocked ? "blur-md pointer-events-none" : "",
        )}
      >
        {!isMobile && (
          <aside
            className={cn(
              "flex-shrink-0 transition-all duration-300 ease-in-out",
              isCollapsed ? "w-20" : "w-64",
            )}
          >
            <TooltipProvider delayDuration={0}>
              <Sidebar role={role} isCollapsed={isCollapsed} />
            </TooltipProvider>
          </aside>
        )}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader
            title={title}
            role={role}
            isMobile={isMobile}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            settings={settings}
          />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => (
  <DashboardLayoutWithLockScreen {...props} />
);

export default DashboardLayout;
