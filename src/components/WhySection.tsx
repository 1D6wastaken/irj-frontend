import {BookOpen, Shield, Users} from "lucide-react";
import {dynamicHomeText} from "../hooks/dynamicHomeText.tsx";

interface WhySectionProps {
    user?: any;
    onBecomeContributor?: () => void;
    onContribute?: () => void;
}

export function WhySection({user, onContribute, onBecomeContributor}: WhySectionProps) {
    const {t} = dynamicHomeText();
    return (
        <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="max-w-10xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            {t('info.title')}
                        </h2>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-9xl mx-auto">
                            {t('info.description1')}<br/>
                            {t('info.description2')}<br/>
                            <br/>
                            {t('info.description3')}
                        </p>
                    </div>

                    <h3 className="text-3xl md:text-2xl font-bold text-foreground text-center mb-4">
                        {t('info.subsection.title')}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div className="space-y-6 md:space-y-8">
                            <div className="flex items-start space-x-4">
                                <div
                                    className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                                        {t('info.subsection1.title')}</h3>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection1.description1')}
                                    </p>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection1.description2')}
                                    </p>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection1.description3')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div
                                    className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                                        {t('info.subsection2.title')}</h3>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection2.description1')}
                                    </p>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection2.description2')}
                                    </p>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection2.description3')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div
                                    className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6"/>
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
                                        {t('info.subsection3.title')}</h3>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection3.description1')}
                                    </p>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection3.description2')}
                                    </p>
                                    <p className="text-muted-foreground text-sm md:text-base">
                                        {t('info.subsection3.description3')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-secondary rounded-2xl p-6 md:p-8 border border-border">
                            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                                {t('info.highlight.title')}</h3>
                            <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
                                {t('info.highlight.description')}
                            </p>

                            {!user && (<button
                                onClick={onBecomeContributor}
                                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all duration-200 text-sm md:text-base  cursor-pointer"
                            >
                                {t('info.highlight.button')}
                            </button>)}
                            {user && (<button
                                onClick={onContribute}
                                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 hover:shadow-lg transition-all duration-200 text-sm md:text-base  cursor-pointer"
                            >
                                Contribuer !
                            </button>)}
                            <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base pt-8">
                                {t('info.highlight.end')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}