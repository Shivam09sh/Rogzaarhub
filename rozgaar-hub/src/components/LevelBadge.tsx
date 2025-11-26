import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LevelBadgeProps {
  level: "bronze" | "silver" | "gold";
}

export const LevelBadge = ({ level }: LevelBadgeProps) => {
  const config = {
    bronze: {
      color: "bg-amber-700 hover:bg-amber-700",
      text: "Bronze",
    },
    silver: {
      color: "bg-slate-400 hover:bg-slate-400",
      text: "Silver",
    },
    gold: {
      color: "bg-yellow-500 hover:bg-yellow-500",
      text: "Gold",
    },
  };

  const { color, text } = config[level];

  return (
    <Badge className={`${color} text-white gap-1`}>
      <Award className="h-3 w-3" />
      {text}
    </Badge>
  );
};
