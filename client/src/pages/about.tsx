import { useLanguage } from "@/lib/language-context";
import { HERO_IMAGE } from "@/lib/data";

export default function About() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero Banner */}
      <div className="h-[300px] relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="Workshop" className="w-full h-full object-cover brightness-50" />
        </div>
        <h1 className="relative z-10 text-4xl md:text-5xl font-serif font-bold text-white">{t('about')}</h1>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold text-primary">Our Story</h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                Welcome to Decorvibe Furniture, where tradition meets modern craftsmanship. Established in 2010, we started as a small workshop in Dhaka with a simple mission: to create furniture that lasts for generations.
              </p>
              <p>
                Over the years, we have grown into one of the most trusted names in the local furniture industry. We specialize in premium teak wood furniture that combines durability with aesthetic elegance.
              </p>
              <p>
                Our team of skilled artisans pours their heart and soul into every piece they create, ensuring that when you buy from us, you're not just buying furniture – you're bringing home a piece of art.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1000&auto=format&fit=crop" alt="Craftsmanship" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"/>
             </div>
             <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden translate-y-8">
                <img src="https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=1000&auto=format&fit=crop" alt="Workshop" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"/>
             </div>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-primary mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-3">100% Solid Wood</h3>
              <p className="text-muted-foreground">We use only the finest quality Chittagong Teak and Mahogany wood.</p>
            </div>
            <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-3">Lifetime Warranty</h3>
              <p className="text-muted-foreground">We stand behind our work with a guarantee against wood worms and decay.</p>
            </div>
            <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-3">Custom Design</h3>
              <p className="text-muted-foreground">Bring your own design or let our experts design the perfect piece for you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
