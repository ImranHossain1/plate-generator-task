import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";

type AppCardProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode; // e.g. button in header
  children: ReactNode; // content inside CardContent
  className?: string;
  contentClassName?: string;
};

export default function AppCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  contentClassName = "",
}: AppCardProps) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>

      <CardContent className={`flex flex-1 flex-col pt-0 ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}
