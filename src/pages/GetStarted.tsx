import { Link } from "react-router-dom";
import { ShoppingBag, Store, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";

const GetStarted = () => {
  const accountTypes = [
    {
      icon: ShoppingBag,
      title: "I want to Shop",
      description: "Browse millions of products and get amazing deals",
      benefits: [
        "Secure checkout",
        "Fast delivery",
        "Easy returns",
        "24/7 support",
      ],
      buttonText: "Shop Now",
      href: "/auth?mode=buyer",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      icon: Store,
      title: "I want to Sell",
      description: "Reach millions of buyers and grow your business",
      benefits: [
        "Easy store setup",
        "Manage inventory",
        "Secure payments",
        "Business analytics",
      ],
      buttonText: "Start Selling",
      href: "/auth?mode=seller",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      icon: Truck,
      title: "I want to Deliver",
      description: "Earn money with flexible delivery jobs",
      benefits: [
        "Flexible hours",
        "Daily earnings",
        "Easy payments",
        "Priority support",
      ],
      buttonText: "Become a Driver",
      href: "/driver-auth",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Welcome to Daily Deals Hub
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Your trusted marketplace for daily deals. Choose your path and get started today.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Choose Your Role</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {accountTypes.map((account, index) => {
                const Icon = account.icon;
                return (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    {/* Colored Header */}
                    <div className={`${account.color} h-32 flex items-center justify-center`}>
                      <Icon className="h-16 w-16 text-white" />
                    </div>

                    <CardHeader>
                      <CardTitle className="text-2xl">{account.title}</CardTitle>
                      <CardDescription className="text-base">
                        {account.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      {/* Benefits List */}
                      <ul className="space-y-3 mb-6 flex-1">
                        {account.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm">
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Action Button */}
                      <Link to={account.href} className="w-full">
                        <Button className="w-full" size="lg">
                          {account.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Feature Highlights */}
            <div className="bg-card border border-border rounded-lg p-8 mb-12">
              <h3 className="text-2xl font-bold mb-6 text-center">Why Choose Daily Deals Hub?</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                  <p className="text-muted-foreground">Products Available</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <p className="text-muted-foreground">Active Sellers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-muted-foreground">Customer Support</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <p className="text-muted-foreground">Secure Transactions</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-center">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: "1",
                    title: "Sign Up",
                    description: "Create your account by choosing your role and providing basic information.",
                  },
                  {
                    step: "2",
                    title: "Verify",
                    description: "Complete verification process to unlock full access and features.",
                  },
                  {
                    step: "3",
                    title: "Get Started",
                    description: "Start shopping, selling, or delivering and enjoy the benefits!",
                  },
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Already Have Account */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Already have an account?</p>
              <Link to="/auth">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GetStarted;
