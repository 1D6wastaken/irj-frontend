import {Route, Routes} from "react-router-dom";
import {AuthProvider} from "./contexts/AuthContext";
import {Layout} from "./components/Layout";
import {HomePage} from "./components/HomePage";
import {SearchResults} from "./components/SearchResults";
import {DetailPage} from "./components/DetailPage";
import {ContributePage} from "./components/ContributePage";
import {AccountPage} from "./components/AccountPage";
import {MyDraftsPage} from "./components/MyDraftsPage";
import {HistoryPage} from "./components/HistoryPage";
import {EditPage} from "./components/EditPage";
import {EditDraftPage} from "./components/EditDraftPage";
import {ValidateFormsPage} from "./components/ValidateFormsPage";
import {ValidateFormDetailPage} from "./components/ValidateFormDetailPage";
import {ValidateContributorsPage} from "./components/ValidateContributorsPage";
import {ContributorsDashboardPage} from "./components/ContributorsDashboardPage";
import {ContributionsPage} from "./components/ContributionsPage";
import {EmailValidationPage} from "./components/EmailValidationPage";
import {LegalMentionsPage} from "./components/LegalMentionsPage";
import {PrivacyPolicyPage} from "./components/PrivacyPolicyPage";
import {TermsOfUsePage} from "./components/TermsOfUsePage";
import {NotFoundPage} from "./components/NotFoundPage";
import {ProtectedRoute} from "./components/routing/ProtectedRoute";
import {AdminRoute} from "./components/routing/AdminRoute";
import {PasswordResetRouteHandler} from "./components/routing/PasswordResetRouteHandler";

export interface AdvancedFilters {
    location?: {
        communes?: string[];
        departments?: string[];
        regions?: string[];
        countries?: string[];
    };
    centuries?: string[];
    themes?: string[];
    naturesMonu?: string[];
    naturesMob?: string[];
    naturesOrg?: string[];
    conservationStatesMonu?: string[];
    conservationStatesMob?: string[];
    materialsMonu?: string[];
    materialsMob?: string[];
    techniques?: string[];
    professions?: string[];
    transportModes?: string[];
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'contributeur' | 'admin';
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<Layout/>}>
                    <Route index element={<HomePage/>}/>
                    <Route path="search" element={<SearchResults/>}/>
                    <Route path="fiches/:source/:id" element={<DetailPage/>}/>
                    <Route path="mentions-legales" element={<LegalMentionsPage/>}/>
                    <Route path="politique-confidentialite" element={<PrivacyPolicyPage/>}/>
                    <Route path="conditions-utilisation" element={<TermsOfUsePage/>}/>
                    <Route path="email/:token/validate" element={<EmailValidationPage/>}/>
                    <Route path="reset/:token" element={<PasswordResetRouteHandler/>}/>

                    <Route element={<ProtectedRoute/>}>
                        <Route path="contribuer" element={<ContributePage/>}/>
                        <Route path="mon-compte" element={<AccountPage/>}/>
                        <Route path="mes-contributions" element={<HistoryPage/>}/>
                        <Route path="mes-brouillons" element={<MyDraftsPage/>}/>
                        <Route path="mes-brouillons/:source/:id/edit" element={<EditDraftPage/>}/>
                        <Route path="fiches/:source/:id/edit" element={<EditPage/>}/>
                    </Route>

                    <Route element={<AdminRoute/>}>
                        <Route path="admin/validation-fiches" element={<ValidateFormsPage/>}/>
                        <Route path="admin/validation-fiches/:source/:id" element={<ValidateFormDetailPage/>}/>
                        <Route path="admin/validation-contributeurs" element={<ValidateContributorsPage/>}/>
                        <Route path="admin/contributeurs" element={<ContributorsDashboardPage/>}/>
                        <Route path="admin/contributions" element={<ContributionsPage/>}/>
                    </Route>

                    <Route path="*" element={<NotFoundPage/>}/>
                </Route>
            </Routes>
        </AuthProvider>
    );
}
