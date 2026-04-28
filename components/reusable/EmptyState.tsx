import React from "react";
import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onActionClick?: () => void;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    onActionClick,
}: EmptyStateProps) {
    return (
        <div className="relative overflow-hidden p-8 md:p-14 text-center">
            <div className="relative z-10 flex flex-col items-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 shadow-sm ring-1 ring-primary/20">
                    {icon || <Inbox className="h-10 w-10 text-primary drop-shadow-sm" strokeWidth={1.5} />}
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-accent mb-2">
                    {title}
                </h3>

                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed mb-6">
                    {description}
                </p>

                {(actionLabel && actionHref) ? (
                    <Button size="lg" className="rounded-full shadow-glow font-medium px-8" asChild>
                        <Link href={actionHref}>
                            {actionLabel} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                ) : (actionLabel && onActionClick) ? (
                    <Button size="lg" className="rounded-full shadow-glow font-medium px-8" onClick={onActionClick}>
                        {actionLabel}
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
