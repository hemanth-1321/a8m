"use client";

import {
  Navbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { TOKEN } from "@/lib/config";
import ThemeToggle from "./ThemeToggle";

export function Appbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { token, removeToken, loadToken } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    loadToken();
  }, [loadToken]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN);
    removeToken();
  };

  return (
    <div className="relative w-full sticky top-0 z-50 transition-colors duration-500">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <div className="flex items-center gap-4">
            {/* Theme toggler first */}
            <ThemeToggle />
            {!mounted ? null : token ? (
              <NavbarButton variant="secondary" onClick={handleLogout}>
                Logout
              </NavbarButton>
            ) : (
              <NavbarButton
                variant="primary"
                onClick={() => router.push("/auth")}
              >
                Login
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex w-full flex-col gap-4">
              <ThemeToggle />
              {!mounted ? null : token ? (
                <NavbarButton
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Logout
                </NavbarButton>
              ) : (
                <NavbarButton
                  onClick={() => {
                    router.push("/auth");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Login
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
