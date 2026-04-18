/**
 * Branch Card Component
 * Display branch information with location and status
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Users, Power } from "lucide-react"
import type { Branch } from "@shared/schema"

interface BranchCardProps {
  branch: Branch
  onEdit?: (branch: Branch) => void
  onDelete?: (branchId: string) => void
  onTogglePOS?: (branchId: string, enabled: boolean) => void
}

export function BranchCard({
  branch,
  onEdit,
  onDelete,
  onTogglePOS,
}: BranchCardProps) {
  return (
    <Card className="hover-elevate transition-all">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{branch.name}</h3>
              <Badge variant={branch.isActive ? "success" : "destructive"}>
                {branch.isActive ? "نشطة" : "مغلقة"}
              </Badge>
            </div>
            <Badge variant={branch.posEnabled ? "primary" : "outline"}>
              {branch.posEnabled ? "POS مفعّل" : "بدون POS"}
            </Badge>
          </div>

          {/* Location */}
          {branch.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {branch.location}
            </div>
          )}

          {/* Phone */}
          {branch.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <a href={`tel:${branch.phone}`} className="hover:underline">
                {branch.phone}
              </a>
            </div>
          )}

          {/* Coordinates */}
          {branch.latitude && branch.longitude && (
            <div className="text-xs text-muted-foreground">
              📍 {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
            </div>
          )}

          {/* Staff Count */}
          {(branch as any).assignedStaff?.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              {(branch as any).assignedStaff.length} موظف مكلف
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(branch)}
            >
              تعديل
            </Button>
            <Button
              variant={branch.posEnabled ? "destructive" : "secondary"}
              size="sm"
              className="flex-1"
              onClick={() => onTogglePOS?.(branch.id || "", !branch.posEnabled)}
            >
              <Power className="w-3 h-3 ml-1" />
              {branch.posEnabled ? "إيقاف POS" : "تفعيل POS"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(branch.id || "")}
            >
              حذف
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
