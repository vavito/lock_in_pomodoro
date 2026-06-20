import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg dark:group-[.toaster]:border-white/10 dark:group-[.toaster]:bg-[#19181c] dark:group-[.toaster]:text-white dark:group-[.toaster]:shadow-[0_18px_48px_rgb(0_0_0_/_0.45)]",
          description: "group-[.toast]:text-muted-foreground dark:group-[.toast]:text-white/70",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground dark:group-[.toast]:bg-white/10 dark:group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
