import {useNavigate} from "react-router-dom";
import {HeroSection} from "./HeroSection";
import {CategoriesSection} from "./CategoriesSection";
import {SearchSection} from "./SearchSection";
import {WhySection} from "./WhySection";
import {AdvancedFilters} from "../App";
import {useAuth} from "../contexts/AuthContext";
import {buildSearchUrl} from "../utils/searchParams";

export function HomePage() {
    const navigate = useNavigate();
    const {user, openSignupModal} = useAuth();

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({behavior: "smooth", block: "start"});
        }
    };

    const handleSearch = (query: string, categories: string[] = [], filters: AdvancedFilters = {}) => {
        navigate(buildSearchUrl({query, categories, filters}));
    };

    const handleCategorySearch = (categoryId: string) => {
        navigate(buildSearchUrl({categories: [categoryId]}));
    };

    return (
        <>
            <HeroSection
                onLearnMore={() => scrollToSection("mission-section")}
                onExploreNow={() => scrollToSection("categories-section")}
            />
            <div id="categories-section">
                <CategoriesSection onCategoryClick={handleCategorySearch}/>
            </div>
            <SearchSection onSearch={handleSearch}/>
            <div id="mission-section">
                <WhySection
                    user={user}
                    onBecomeContributor={openSignupModal}
                    onContribute={() => navigate("/contribuer")}
                />
            </div>
        </>
    );
}
