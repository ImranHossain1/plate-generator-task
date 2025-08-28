import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { cn } from "../../lib/utils";

type CardDomProps = Omit<
  React.ComponentProps<typeof Card>,
  "children" | "className"
>;

type AppCardProps = CardDomProps & {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  noHeaderPadding?: boolean;
  noContentPadding?: boolean;
};

export default function AppCard({
  title,
  subtitle,
  action,
  children,
  className,
  headerClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
  noHeaderPadding,
  noContentPadding,
  ...rest
}: AppCardProps) {
  return (
    <Card {...rest} className={cn("flex flex-col", className)}>
      {(title || subtitle || action) && (
        <CardHeader
          className={cn("pb-0", noHeaderPadding && "p-0", headerClassName)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {title && (
                <CardTitle className={cn(titleClassName)}>{title}</CardTitle>
              )}
              {subtitle && (
                <CardDescription className={cn(descriptionClassName)}>
                  {subtitle}
                </CardDescription>
              )}
            </div>
            {action}
          </div>
        </CardHeader>
      )}

      <CardContent
        className={cn(
          "flex flex-1 flex-col",
          !noContentPadding && "pt-0",
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
