import { Church, Trophy, Users, User } from "lucide-react";

const categories = [
  {
    id: "monuments_lieux",
    icon: Church,
    title: "Monuments & Lieux",
    description: "Églises, chapelles, sanctuaires et lieux de pèlerinage dédiés à Saint-Jacques",
    color: "blue"
  },
  {
    id: "mobiliers_images",
    icon: Trophy,
    title: "Mobiliers & Images",
    description: "Statues, tableaux, reliquaires et objets d'art religieux",
    color: "green"
  },
  {
    id: "personnes_morales",
    icon: Users,
    title: "Personnes Morales",
    description: "Confréries, ordres religieux et institutions liées au culte",
    color: "purple"
  },
  {
    id: "personnes_physiques",
    icon: User,
    title: "Personnes Physiques",
    description: "Pèlerins, saints, artistes et personnalités historiques",
    color: "orange"
  }
];

interface CategoriesSectionProps {
  onCategoryClick?: (categoryId: string) => void;
}

export function CategoriesSection({ onCategoryClick }: CategoriesSectionProps) {
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
            Explorez nos collections
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les différentes facettes du patrimoine Saint-Jacques à travers nos quatre grandes catégories
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div 
              key={index} 
              onClick={() => handleCategoryClick(category.id)}
              className="group cursor-pointer bg-card hover:bg-accent p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border"
            >
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <category.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">
                {category.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {category.description}
              </p>
              <div className="mt-6">
                <div className="inline-flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform duration-200">
                  Explorer →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}