import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Truck, Shield, Star } from 'lucide-react';
import heroFashion from '@/assets/hero-fashion.jpg';
import heroCosmetics from '@/assets/hero-cosmetics.jpg';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const slides = [
    {
      id: 1,
      image: heroFashion,
      title: "Fashion Forward",
      subtitle: "Discover the latest trends in men's and women's fashion",
      cta: "Shop Fashion",
      link: "/shop"
    },
    {
      id: 2,
      image: heroCosmetics,
      title: "Beauty Essentials",
      subtitle: "Premium cosmetics and skincare for your daily routine",
      cta: "Shop Beauty",
      link: "/cosmetics"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-beige-light to-background">
      {/* Hero Slider */}
      <div className="relative h-[600px] lg:h-[700px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl slide-up">
                  <h1 className="text-5xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
                    Welcome to <br />
                    <span className="text-primary/80">Trendora</span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-muted-foreground mb-4">
                    Shop What You Love
                  </p>
                  <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                    {slide.subtitle}
                  </p>
                  <button 
                    onClick={() => navigate(slide.link)}
                    className="btn-primary text-lg px-8 py-4 hover:transform hover:scale-105"
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-card/90 backdrop-blur-sm border border-border rounded-full hover:bg-card transition-[var(--transition-smooth)] group"
        >
          <ChevronLeft className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-card/90 backdrop-blur-sm border border-border rounded-full hover:bg-card transition-[var(--transition-smooth)] group"
        >
          <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-[var(--transition-smooth)] ${
                index === currentSlide ? 'bg-primary' : 'bg-card/60 border border-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground">
              Free shipping on orders above <span className="font-semibold text-primary">₹999</span>. 
              Quality products for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <div className="p-3 bg-beige rounded-full">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Free Shipping</h3>
                <p className="text-sm">On orders above ₹999</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <div className="p-3 bg-beige rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure Payment</h3>
                <p className="text-sm">100% secure transactions</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <div className="p-3 bg-beige rounded-full">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quality Products</h3>
                <p className="text-sm">Premium quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;