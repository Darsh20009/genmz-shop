import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Star, Trash2, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminReviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/reviews"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/reviews");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/reviews/${id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "تم الموافقة على التقييم" });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/reviews/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({ title: "تم حذف التقييم" });
    },
  });

  const filteredReviews = Array.isArray(reviews) ? reviews.filter((r: any) =>
    (r.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Layout>
      <div className="p-6 space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold">التقييمات</h1>
          <p className="text-muted-foreground">إدارة تقييمات العملاء على المنتجات</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن تقييم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>التقييم</TableHead>
                    <TableHead>التقييم النصي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review: any) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.customerName}</TableCell>
                      <TableCell>{review.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < (review.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <p>{review.comment}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2">
                              {review.images.map((img: string, idx: number) => (
                                <img 
                                  key={idx} 
                                  src={img} 
                                  alt="Review" 
                                  className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(img, '_blank')}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.approved ? "default" : "secondary"}>
                          {review.approved ? "موافق عليه" : "قيد المراجعة"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!review.approved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveReviewMutation.mutate(review.id)}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReviewMutation.mutate(review.id)}
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
