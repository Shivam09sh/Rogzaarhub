import { Flame, Star } from "lucide-react";
import { motion } from "framer-motion";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

export const StreakBadge = ({ streak, size = "md" }: StreakBadgeProps) => {
  const isGolden = streak >= 10;
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  
  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  return (
    <motion.div
      className="flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative flex items-center gap-1">
        <Flame 
          className={`${sizeClasses[size]} ${isGolden ? 'text-yellow-500' : 'text-primary'}`}
          fill="currentColor"
        />
        <span className={`font-bold ${textSize[size]} ${isGolden ? 'text-yellow-600' : 'text-primary'}`}>
          {streak}
        </span>
        {isGolden && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Star className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" fill="currentColor" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
