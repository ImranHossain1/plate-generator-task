// src/components/common/AppButton.tsx
import { FormattedMessage } from "react-intl";
import type { ComponentProps } from "react";
import { Button } from "../ui/Button";

type AppButtonProps = ComponentProps<typeof Button> & {
  msgId?: string;
  icon?: React.ReactNode;
  iconAfter?: boolean;
};

export default function AppButton({
  msgId,
  icon,
  iconAfter = false,
  children,
  ...props
}: AppButtonProps) {
  return (
    <Button {...props}>
      {!iconAfter && icon}
      {msgId ? <FormattedMessage id={msgId} /> : children}
      {iconAfter && icon}
    </Button>
  );
}
