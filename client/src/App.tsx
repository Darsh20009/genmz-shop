import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import { AuthProvider } from "@/components/auth-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Orders from "@/pages/Orders";
import Terms from "@/pages/Terms";
import ForgotPassword from "@/pages/ForgotPassword";
import Checkout from "@/pages/Checkout";

import Profile from "@/pages/Profile";

import AdminBranches from "@/pages/AdminBranches";
import AdminStaff from "@/pages/AdminStaff";

import AdminAuditLogs from "@/pages/AdminAuditLogs";
import POS from "@/pages/POS";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/profile" component={Profile} />
      <Route path="/orders" component={Orders} />
      <Route path="/employees" component={Employees} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/branches" component={AdminBranches} />
      <Route path="/admin/staff" component={AdminStaff} />
      <Route path="/admin/audit-logs" component={AdminAuditLogs} />
      <Route path="/pos" component={POS} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";

function AppContent() {
  const { language } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language}>
      <Router />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="genmz-theme">
            <TooltipProvider>
              <Toaster />
              <AppContent />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
