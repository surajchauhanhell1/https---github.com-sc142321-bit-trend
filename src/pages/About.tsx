import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Award, Truck } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Passion for Quality',
      description: 'We are committed to providing only the highest quality products that meet our strict standards.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do. We strive to exceed expectations.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We continuously innovate and improve to deliver exceptional shopping experiences.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to get your favorite products to you as soon as possible.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">About Trendora</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your premier destination for fashion and beauty. We bring you the latest trends 
            and timeless classics, all in one place.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded in 2024, Trendora began with a simple vision: to make quality fashion 
                and beauty products accessible to everyone. What started as a small initiative 
                has grown into a trusted brand that serves customers across the country.
              </p>
              <p>
                We believe that style is personal and beauty is diverse. That's why we curate 
                collections that celebrate individuality while maintaining the highest standards 
                of quality and affordability.
              </p>
              <p>
                Today, Trendora stands as a testament to the power of combining passion with 
                purpose, offering carefully selected products that help our customers express 
                their unique style.
              </p>
            </div>
          </div>
          <div className="bg-gradient-elegant rounded-xl p-8 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Quality First</h3>
              <p className="text-white/90">
                Every product in our collection is carefully tested and selected 
                to ensure it meets our high standards.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-elegant transition-[var(--transition-smooth)]">
                <CardContent className="p-0">
                  <div className="mb-4">
                    <value.icon className="h-12 w-12 text-primary mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-muted rounded-xl p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Premium Products</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99%</div>
              <p className="text-muted-foreground">Customer Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            To empower individuals to express their unique style through carefully curated, 
            high-quality fashion and beauty products, while providing an exceptional shopping 
            experience that exceeds expectations.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;