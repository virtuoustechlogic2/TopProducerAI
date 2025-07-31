import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressChartProps {
  title: string;
  current: number;
  target: number;
  type: "currency" | "number" | "percentage";
  color?: "primary" | "secondary" | "accent";
  subtitle?: string;
  breakdown?: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export default function ProgressChart({ 
  title, 
  current, 
  target, 
  type, 
  color = "primary",
  subtitle,
  breakdown 
}: ProgressChartProps) {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);

  const formatValue = (value: number) => {
    switch (type) {
      case "currency":
        return `$${value.toLocaleString()}`;
      case "percentage":
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "secondary":
        return {
          bg: "bg-secondary/5",
          border: "border-secondary/20",
          text: "text-secondary",
          progress: "gradient-success"
        };
      case "accent":
        return {
          bg: "bg-accent/5",
          border: "border-accent/20", 
          text: "text-accent",
          progress: "gradient-accent"
        };
      default:
        return {
          bg: "bg-primary/5",
          border: "border-primary/20",
          text: "text-primary", 
          progress: "gradient-primary"
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <Card className={`${colorClasses.bg} ${colorClasses.border}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{title}</span>
          <Badge variant="outline" className={colorClasses.text}>
            {Math.round(percentage)}%
          </Badge>
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-neutral-600">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Progress</span>
            <span className={`font-medium ${colorClasses.text}`}>
              {formatValue(current)} / {formatValue(target)}
            </span>
          </div>
          
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${colorClasses.progress}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-600">Current</p>
            <p className={`font-semibold ${colorClasses.text}`}>
              {formatValue(current)}
            </p>
          </div>
          <div>
            <p className="text-neutral-600">Remaining</p>
            <p className="font-semibold text-neutral-900">
              {formatValue(remaining)}
            </p>
          </div>
        </div>

        {breakdown && breakdown.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Breakdown</p>
            {breakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-neutral-600">{item.label}</span>
                </div>
                <span className="font-medium">{formatValue(item.value)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
