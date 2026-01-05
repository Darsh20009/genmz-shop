import { useQuery } from "@tanstack/react-query";
import { ActivityLog, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User as UserIcon, Clock, Activity, AlertCircle, Filter, Download, Shield } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";

export default function AdminAuditLogs() {
  const [filterAction, setFilterAction] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterType, setFilterType] = useState("all");
  
  const { data: logs, isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/audit-logs", { action: filterAction, employee: filterEmployee, type: filterType }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterAction) params.append("action", filterAction);
      if (filterEmployee !== "all") params.append("employeeId", filterEmployee);
      if (filterType !== "all") params.append("targetType", filterType);
      
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    }
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  const handleExportCSV = () => {
    if (!logs) return;
    const csv = [
      ["الوقت", "الموظف", "الإجراء", "النوع", "التفاصيل"],
      ...logs.map(log => [
        format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss", { locale: ar }),
        users?.find(u => u.id === log.employeeId)?.name || log.employeeId,
        log.action,
        log.targetType,
        log.details || ""
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
  };

  if (logsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-bold">جاري جلب سجل العمليات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 lg:p-8 space-y-8" dir="rtl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Shield className="w-8 h-8" />
              </div>
              سجل العمليات
            </h1>
            <p className="text-muted-foreground font-medium pr-14">متابعة دقيقة لكافة تحركات الموظفين والنظام</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={handleExportCSV}>
              <Download className="w-5 h-5" />
              تصدير البيانات
            </Button>
            <div className="h-12 flex items-center bg-slate-100 dark:bg-slate-800 px-5 rounded-2xl font-black text-primary">
              {logs?.length || 0} عملية
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest pr-2">البحث بالإجراء</label>
                <Input
                  placeholder="مثال: create, delete"
                  className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none px-4 font-bold focus-visible:ring-primary/20"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest pr-2">الموظف المسؤول</label>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold">
                    <SelectValue placeholder="اختر موظف" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="all">الكل</SelectItem>
                    {users?.map(user => (
                      <SelectItem key={user.id} value={user.id || "unknown"}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest pr-2">نوع الكيان</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="order">طلبات</SelectItem>
                    <SelectItem value="product">منتجات</SelectItem>
                    <SelectItem value="customer">عملاء</SelectItem>
                    <SelectItem value="staff">فريق العمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence>
            {(!logs || logs.length === 0) ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="rounded-[3rem] border-dashed border-2 bg-transparent p-20 text-center">
                  <AlertCircle className="h-20 w-20 mx-auto mb-6 opacity-10 text-primary" />
                  <p className="font-black text-xl text-slate-300">لا توجد عمليات مسجلة حالياً</p>
                </Card>
              </motion.div>
            ) : (
              logs.map((log, idx) => {
                const user = users?.find(u => u.id === log.employeeId);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] hover-elevate overflow-hidden group">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-primary/5 dark:bg-primary/10 flex items-center justify-center rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Activity className="h-6 w-6" />
                          </div>
                          <div className="text-right">
                            <p className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                              {log.action}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1">
                              <UserIcon className="h-3 w-3" />
                              {user?.name || "النظام الآلي"}
                              <Badge variant="outline" className="text-[8px] font-black rounded-md py-0 px-1 border-slate-200 dark:border-slate-700">
                                {user?.role || "SYSTEM"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 text-xs font-black text-slate-500 bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                            <Clock className="h-3 w-3 text-primary" />
                            {format(new Date(log.createdAt), "PPP p", { locale: ar })}
                          </div>
                          <Badge className="rounded-xl px-4 py-1 font-black text-[10px] bg-primary/10 text-primary border-none">
                            {log.targetType}: {log.targetId?.slice(-6).toUpperCase() || "N/A"}
                          </Badge>
                        </div>
                      </div>

                      {log.details && (
                        <div className="px-6 pb-6 pt-0">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[10px] font-black text-primary/40 mb-2 uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              التفاصيل الفنية
                            </p>
                            <pre className="text-[11px] font-mono font-bold overflow-x-auto whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                              {log.details}
                            </pre>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
