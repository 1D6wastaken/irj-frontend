import { Component, ReactNode } from "react";
import { toast } from "sonner";

interface CrashBoundaryProps {
    children: ReactNode;
    onResetToHome: () => void;
}

interface CrashBoundaryState {
    hasError: boolean;
    errorMessage?: string;
}

export class CrashBoundary extends Component<CrashBoundaryProps, CrashBoundaryState> {
    constructor(props: CrashBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, errorMessage: error?.message ?? String(error) };
    }

    componentDidCatch(error: any, info: any) {
        console.error("Crash capturé:", error, info);
        toast.error("Un problème est survenu.");
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{padding: 24, fontFamily: "system-ui, sans-serif"}}>
                    <h1 style={{color: "#c00"}}>Erreur d'affichage</h1>
                    <pre style={{whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 12, borderRadius: 6}}>{this.state.errorMessage}</pre>
                    <button
                        onClick={() => {
                            this.setState({hasError: false, errorMessage: undefined});
                            this.props.onResetToHome();
                        }}
                        style={{marginTop: 12, padding: "8px 16px", cursor: "pointer"}}
                    >
                        Retour à l'accueil
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}