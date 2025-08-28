import { Separator } from "@radix-ui/react-separator";
import { FormattedMessage } from "react-intl";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-6">
        <Separator className="hidden w-full md:block" />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <FormattedMessage
            id="footer.text"
            values={{ name: "Imran Hossain" }}
          />
        </p>
      </div>
    </footer>
  );
}
