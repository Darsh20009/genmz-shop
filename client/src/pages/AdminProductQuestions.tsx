import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminProductQuestions() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: questions = [] } = useQuery({
    queryKey: ["/api/product-questions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/product-questions");
      return res.json();
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => {
      const res = await apiRequest("PATCH", `/api/product-questions/${id}/answer`, { answer });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-questions"] });
      toast({ title: "تم الإجابة على السؤال" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/product-questions/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-questions"] });
      toast({ title: "تم حذف السؤال" });
    },
  });

  const filteredQuestions = (questions as any[]).filter((q: any) =>
    q.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.question?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold">أسئلة المنتجات</h1>
          <p className="text-muted-foreground">جهز قسمًا للأسئلة والأجوبة لكل منتج</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن سؤال..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>السؤال</TableHead>
                    <TableHead>المسائل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question: any) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.productName}</TableCell>
                      <TableCell className="text-sm">{question.question?.substring(0, 50)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{question.askedBy}</TableCell>
                      <TableCell>
                        <Badge variant={question.answered ? "default" : "secondary"}>
                          {question.answered ? "مجاب" : "بدون إجابة"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!question.answered && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => answerQuestionMutation.mutate({ id: question.id, answer: "" })}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestionMutation.mutate(question.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
