import { HelmetProvider } from "react-helmet-async";
import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useLanguage } from "@/hooks/use-language";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/auth-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProfileInvoices from "@/pages/ProfileInvoices";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import QuickReports from "@/pages/QuickReports";
import Employees from "@/pages/Employees";
import Orders from "@/pages/Orders";
import Terms from "@/pages/Terms";
import ForgotPassword from "@/pages/ForgotPassword";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutFailure from "@/pages/CheckoutFailure";

import Profile from "@/pages/Profile";

import AdminBranches from "@/pages/AdminBranches";
import AdminBranchInventory from "@/pages/AdminBranchInventory";
import AdminStaff from "@/pages/AdminStaff";
import AdminBanners from "@/pages/AdminBanners";

import AdminAuditLogs from "@/pages/AdminAuditLogs";
import AdminRoles from "@/pages/AdminRoles";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AdminLoyalty from "@/pages/AdminLoyalty";
import POS from "@/pages/POS";
import CashDrawer from "@/pages/CashDrawer";
import CashDrawerReport from "@/pages/CashDrawerReport";
import Guide from "@/pages/Guide";

import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Loader2, MapPin, CheckCircle2, FileText, Menu } from "lucide-react";
import { useLocation, Redirect } from "wouter";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { SplashScreen } from "@/components/SplashScreen";

// Protected Route Component
function ProtectedRoute({ component: Component, permission }: { component: React.ComponentType, permission?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Return null instead of loader for faster-feeling transitions
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  if (permission && user.role !== "admin" && (!user.permissions || !user.permissions.includes(permission))) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center" dir="rtl">
        <h2 className="text-2xl font-bold mb-4">عذراً، ليس لديك صلاحية للوصول لهذه الصفحة</h2>
        <p className="text-muted-foreground">يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.</p>
      </div>
    );
  }

  return <Component />;
}

import SalesReport from "@/pages/SalesReport";
import AdminCustomers from "@/pages/AdminCustomers";
import AdminThemes from "@/pages/AdminThemes";
import AdminSettings from "@/pages/AdminSettings";
import AdminAbandonedCarts from "@/pages/AdminAbandonedCarts";
import AdminProducts from "@/pages/AdminProducts";
import AdminCategories from "@/pages/AdminCategories";
import AdminInventory from "@/pages/AdminInventory";
import AdminReviews from "@/pages/AdminReviews";
import AdminBranding from "@/pages/AdminBranding";
import AdminPages from "@/pages/AdminPages";
import AdminFAQs from "@/pages/AdminFAQs";
import AdminPageEditor from "@/pages/AdminPageEditor";
import PageDetail from "@/pages/PageDetail";
import AdminTransferRequests from "@/pages/AdminTransferRequests";
import AdminFilterCriteria from "@/pages/AdminFilterCriteria";
import AdminOptionsLibrary from "@/pages/AdminOptionsLibrary";
import AdminProductQuestions from "@/pages/AdminProductQuestions";
import AdminStockNotifications from "@/pages/AdminStockNotifications";
import AdminCustomerGroups from "@/pages/AdminCustomerGroups";
import AdminOrders from "@/pages/AdminOrders";
import AdminManualOrder from "@/pages/AdminManualOrder";
import AdminProductAttributes from "@/pages/AdminProductAttributes";

import AdminInventoryOrder from "@/pages/AdminInventoryOrder";
import AdminInventoryChanges from "@/pages/AdminInventoryChanges";

const AdminInventoryLocations = () => (
  <Layout>
    <div className="p-8" dir="rtl">
      <h1 className="text-3xl font-black mb-4">عناوين المخزون</h1>
      <Card className="p-8 rounded-[2rem] text-center border-dashed border-2">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-primary opacity-20" />
        <p className="text-muted-foreground font-bold">لديك 1 موقع نشط من أصل 1 موقع متاح في باقتك.</p>
      </Card>
    </div>
  </Layout>
);

import AdminInventoryAudit from "@/pages/AdminInventoryAudit";

import AdminCustomFields from "@/pages/AdminCustomFields";
import AdminNavigation from "@/pages/AdminNavigation";

import { VisualEditorProvider } from "@/components/VisualEditor";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Products} />
      <Route path="/products">
        <Redirect to="/shop" />
      </Route>
      <Route path="/products/:id" component={ProductDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/failure" component={CheckoutFailure} />
      <Route path="/pages/:slug" component={PageDetail} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/profile/invoices">
        <ProtectedRoute component={ProfileInvoices} />
      </Route>
      <Route path="/orders">
        <ProtectedRoute component={Orders} />
      </Route>
      <Route path="/employees">
        <ProtectedRoute component={Employees} permission="staff.manage" />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      {/* Admin Section */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/reports">
        <ProtectedRoute component={QuickReports} permission="reports.view" />
      </Route>
      <Route path="/admin/orders">
        <ProtectedRoute component={AdminOrders} permission="orders.view" />
      </Route>
      <Route path="/admin/orders/manual">
        <ProtectedRoute component={AdminManualOrder} permission="orders.edit" />
      </Route>
      <Route path="/admin/full">
        <ProtectedRoute component={Admin} />
      </Route>
      <Route path="/admin/branches">
        <ProtectedRoute component={AdminBranches} permission="settings.manage" />
      </Route>
      <Route path="/admin/staff">
        <ProtectedRoute component={AdminStaff} permission="staff.manage" />
      </Route>
      <Route path="/admin/banners">
        <ProtectedRoute component={AdminBanners} permission="settings.manage" />
      </Route>
      <Route path="/admin/audit-logs">
        <ProtectedRoute component={AdminAuditLogs} permission="staff.manage" />
      </Route>
      <Route path="/admin/roles">
        <ProtectedRoute component={AdminRoles} permission="staff.manage" />
      </Route>
      <Route path="/admin/inventory">
        <ProtectedRoute component={AdminBranchInventory} permission="settings.manage" />
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute component={AdminAnalytics} permission="reports.view" />
      </Route>
      <Route path="/admin/loyalty">
        <ProtectedRoute component={AdminLoyalty} permission="settings.manage" />
      </Route>
      <Route path="/admin/reports/sales">
        <ProtectedRoute component={SalesReport} permission="reports.view" />
      </Route>
      <Route path="/admin/customers">
        <ProtectedRoute component={AdminCustomers} permission="customers.view" />
      </Route>
      <Route path="/admin/themes">
        <ProtectedRoute component={AdminThemes} permission="settings.manage" />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute component={AdminSettings} permission="settings.manage" />
      </Route>
      <Route path="/admin/abandoned-carts">
        <ProtectedRoute component={AdminAbandonedCarts} permission="orders.view" />
      </Route>
      <Route path="/admin/products">
        <ProtectedRoute component={AdminProducts} permission="products.view" />
      </Route>
      <Route path="/admin/categories">
        <ProtectedRoute component={AdminCategories} permission="products.view" />
      </Route>
      <Route path="/admin/product-attributes">
        <ProtectedRoute component={AdminProductAttributes} permission="products.view" />
      </Route>
      <Route path="/admin/inventory-management">
        <ProtectedRoute component={AdminInventory} permission="settings.manage" />
      </Route>
      <Route path="/admin/reviews">
        <ProtectedRoute component={AdminReviews} permission="products.view" />
      </Route>
      <Route path="/admin/branding">
        <ProtectedRoute component={AdminBranding} permission="settings.manage" />
      </Route>
      <Route path="/admin/pages">
        <ProtectedRoute component={AdminPages} permission="settings.manage" />
      </Route>
      <Route path="/admin/faqs">
        <ProtectedRoute component={AdminFAQs} permission="settings.manage" />
      </Route>
      <Route path="/admin/pages/:id">
        <ProtectedRoute component={AdminPageEditor} permission="settings.manage" />
      </Route>
      <Route path="/admin/transfers">
        <ProtectedRoute component={AdminTransferRequests} permission="settings.manage" />
      </Route>
      <Route path="/admin/filter-criteria">
        <ProtectedRoute component={AdminFilterCriteria} permission="products.view" />
      </Route>
      <Route path="/admin/options-library">
        <ProtectedRoute component={AdminOptionsLibrary} permission="products.view" />
      </Route>
      <Route path="/admin/product-questions">
        <ProtectedRoute component={AdminProductQuestions} permission="products.view" />
      </Route>
      <Route path="/admin/stock-notifications">
        <ProtectedRoute component={AdminStockNotifications} permission="settings.manage" />
      </Route>
      <Route path="/admin/customer-groups">
        <ProtectedRoute component={AdminCustomerGroups} permission="customers.view" />
      </Route>
      <Route path="/admin/inventory-order">
        <ProtectedRoute component={AdminInventoryOrder} permission="settings.manage" />
      </Route>
      <Route path="/admin/inventory-changes">
        <ProtectedRoute component={AdminInventoryChanges} permission="settings.manage" />
      </Route>
      <Route path="/admin/inventory/locations">
        <ProtectedRoute component={AdminInventoryLocations} permission="settings.manage" />
      </Route>
      <Route path="/admin/inventory/audit">
        <ProtectedRoute component={AdminInventoryAudit} permission="settings.manage" />
      </Route>
      <Route path="/admin/navigation">
        <ProtectedRoute component={AdminNavigation} permission="settings.manage" />
      </Route>

      <Route path="/admin/custom-fields">
        <ProtectedRoute component={AdminCustomFields} permission="settings.manage" />
      </Route>
      <Route path="/pos">
        <ProtectedRoute component={POS} permission="pos.access" />
      </Route>
      <Route path="/cash-drawer">
        <ProtectedRoute component={CashDrawer} permission="pos.access" />
      </Route>
      <Route path="/cash-report">
        <ProtectedRoute component={CashDrawerReport} permission="reports.view" />
      </Route>
      <Route path="/terms" component={Terms} />
      <Route path="/guide" component={Guide} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { language } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  
  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language}>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <Router />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="genmz-theme">
            <TooltipProvider>
              <AuthProvider>
                <VisualEditorProvider>
                  <Toaster />
                  <AppContent />
                </VisualEditorProvider>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
