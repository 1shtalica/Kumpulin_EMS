"use client"

import {
    CircleCheckIcon,
    CircleXIcon,
    InfoIcon,
    Loader2Icon,
    TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            closeButton
            gap={10}
            offset={16}
            mobileOffset={12}
            visibleToasts={4}
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:min-h-14 group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:shadow-xl group-[.toaster]:shadow-slate-950/10 group-[.toaster]:backdrop-blur-md group-[.toaster]:tracking-normal",
                    default:
                        "group-[.toaster]:border-border group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground",
                    success:
                        "group-[.toaster]:border-success/25 group-[.toaster]:bg-success-light/95 group-[.toaster]:text-slate-950",
                    error:
                        "group-[.toaster]:border-danger/25 group-[.toaster]:bg-danger-light/95 group-[.toaster]:text-slate-950",
                    warning:
                        "group-[.toaster]:border-warning/30 group-[.toaster]:bg-warning-light/95 group-[.toaster]:text-slate-950",
                    info:
                        "group-[.toaster]:border-info/25 group-[.toaster]:bg-info-light/95 group-[.toaster]:text-slate-950",
                    loading:
                        "group-[.toaster]:border-border group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground",
                    title:
                        "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-5 group-[.toast]:tracking-normal",
                    description:
                        "group-[.toast]:mt-1 group-[.toast]:text-xs group-[.toast]:leading-relaxed group-[.toast]:text-muted-foreground group-[.toast]:tracking-normal",
                    icon:
                        "group-[.toast]:mt-0.5 group-[.toast]:flex group-[.toast]:size-7 group-[.toast]:items-center group-[.toast]:justify-center group-[.toast]:rounded-full group-[.toast]:bg-white/70 group-[.toast]:shadow-sm group-[.toast]:shadow-slate-950/5",
                    closeButton:
                        "group-[.toast]:border-border group-[.toast]:bg-white/90 group-[.toast]:text-slate-500 group-[.toast]:shadow-sm group-[.toast]:transition-colors group-[.toast]:hover:bg-white group-[.toast]:hover:text-slate-950",
                    actionButton:
                        "group-[.toast]:h-8 group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-semibold group-[.toast]:text-primary-foreground",
                    cancelButton:
                        "group-[.toast]:h-8 group-[.toast]:rounded-lg group-[.toast]:bg-white/80 group-[.toast]:px-3 group-[.toast]:text-xs group-[.toast]:font-semibold group-[.toast]:text-slate-600 group-[.toast]:hover:bg-white",
                },
            }}
            icons={{
                success: <CircleCheckIcon className="size-4 text-success" />,
                info: <InfoIcon className="size-4 text-info" />,
                warning: <TriangleAlertIcon className="size-4 text-warning" />,
                error: <CircleXIcon className="size-4 text-danger" />,
                loading: (
                    <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                ),
            }}
            {...props}
        />
    )
}

export { Toaster }
