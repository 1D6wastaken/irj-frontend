import { Component, ReactNode } from "react";
import { toast } from "sonner";

interface CrashBoundaryProps {
    children: ReactNode;
    onResetToHome: () => void;
}

interface CrashBoundaryState {
    hasError: boolean;
}

export class CrashBoundary extends Component<CrashBoundaryProps, CrashBoundaryState> {
    constructor(props: CrashBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any, info: any) {
        console.error("Crash capturé:", error, info);
        toast.error("Un problème est survenu, retour à l’accueil.");
        this.props.onResetToHome();
    }

    render() {
        return this.props.children;
    }
}