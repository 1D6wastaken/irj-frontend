import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import "./index.css"
import App from './App.tsx'
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://07ad85d879981f57794d6f4f47fea24e@o4509927771930626.ingest.de.sentry.io/4509927775404112",
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1  // = 10%
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Sentry.ErrorBoundary fallback={<div>⚠️ Une erreur est survenue</div>}>
            <App/>
        </Sentry.ErrorBoundary>
    </StrictMode>
)
