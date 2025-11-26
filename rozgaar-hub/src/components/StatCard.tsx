import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  trend?: string;
}

export const StatCard = ({ title, value, icon: Icon, gradient, trend }: StatCardProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className={`shadow-card hover:shadow-elevated transition-shadow ${gradient ? 'text-white' : ''}`}>
        <CardContent className={`p-6 ${gradient || ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${gradient ? 'text-white/90' : 'text-muted-foreground'}`}>
                {title}
              </p>
              <h3 className="text-3xl font-bold mt-2">{value}</h3>
              {trend && (
                <p className={`text-xs mt-2 ${gradient ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {trend}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${gradient ? 'bg-white/20' : 'bg-muted'}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
