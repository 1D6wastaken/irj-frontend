import {Church, Trophy, Users, User} from "lucide-react";
import {dynamicHomeText} from "../hooks/dynamicHomeText.tsx";

interface CategoriesSectionProps {
    onCategoryClick?: (categoryId: string) => void;
}

export function CategoriesSection({onCategoryClick}: CategoriesSectionProps) {
    const {t} = dynamicHomeText();

    const categories = [
        {
            id: "monuments_lieux",
            icon: Church,
            title: "Monuments & Lieux",
            description: t('explore.monumentslieux'),
            color: "blue"
        },
        {
            id: "mobiliers_images",
            icon: Trophy,
            title: "Mobiliers & Images",
            description: t('explore.mobiliersimages'),
            color: "green"
        },
        {
            id: "personnes_morales",
            icon: Users,
            title: "Personnes Morales",
            description: t('explore.personnesmorales'),
            color: "purple"
        },
        {
            id: "personnes_physiques",
            icon: User,
            title: "Personnes Physiques",
            description: t('explore.personnesphysiques'),
            color: "orange"
        }
    ];

    const handleCategoryClick = (categoryId: string) => {
        if (onCategoryClick) {
            onCategoryClick(categoryId);
        }
    };

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        {t('explore.title')}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
                        {t('explore.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            onClick={() => handleCategoryClick(category.id)}
                            className="group cursor-pointer bg-card hover:bg-accent p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border"
                        >
                            <div
                                className="bg-primary text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                                <category.icon className="w-8 h-8"/>
                            </div>
                            <h3 className="text-xl font-bold text-card-foreground mb-4">
                                {category.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {category.description}
                            </p>
                            <div className="mt-6">
                                <div
                                    className="inline-flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform duration-200">
                                    Explorer →
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="text-3xl font-bold text-primary mb-2">{t('explore.stats1')}</div>
                        <div className="text-muted-foreground">{t('explore.stats1.title')}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="text-3xl font-bold text-primary mb-2">{t('explore.stats2')}</div>
                        <div className="text-muted-foreground">{t('explore.stats2.title')}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="text-3xl font-bold text-primary mb-2">{t('explore.stats3')}</div>
                        <div className="text-muted-foreground">{t('explore.stats3.title')}</div>
                    </div>
                </div>

                <p className="text-xl text-muted-foreground max-w-5xl mx-auto py-10">
                    {t('explore.end')}
                </p>
            </div>
        </section>
    );
}