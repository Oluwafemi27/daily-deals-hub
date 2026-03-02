import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/layout/Footer";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "buyers" | "sellers" | "drivers";
}

const FAQ = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"all" | FAQItem["category"]>("all");

  const faqs: FAQItem[] = [
    {
      id: "1",
      category: "general",
      question: "What is Daily Deals Hub?",
      answer: "Daily Deals Hub is a comprehensive e-commerce marketplace that connects buyers, sellers, and drivers. It's a platform where you can shop for products, list items for sale, or earn money as a delivery driver.",
    },
    {
      id: "2",
      category: "general",
      question: "How do I create an account?",
      answer: "Visit our sign-up page and choose whether you want to shop as a buyer or sell as a seller. Fill in your details and verify your email address. That's it!",
    },
    {
      id: "3",
      category: "buyers",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital wallets. For specific details about available payment methods in your region, please contact our support team.",
    },
    {
      id: "4",
      category: "buyers",
      question: "How long does shipping take?",
      answer: "Shipping times vary depending on your location and the seller. Most orders are delivered within 3-7 business days. You can track your order status in real-time from your account.",
    },
    {
      id: "5",
      category: "buyers",
      question: "What's your return policy?",
      answer: "We offer a 30-day return policy on most items. If you're not satisfied with your purchase, you can initiate a return from your account. Items must be in original condition.",
    },
    {
      id: "6",
      category: "sellers",
      question: "How do I become a seller?",
      answer: "Sign up as a seller and complete the verification process. You'll need to provide basic information about your business and pass our KYC (Know Your Customer) verification. Once approved, you can start listing products.",
    },
    {
      id: "7",
      category: "sellers",
      question: "How much are the seller fees?",
      answer: "We charge a commission on successful sales. The percentage varies by product category but is clearly displayed before you list. There are no hidden fees.",
    },
    {
      id: "8",
      category: "sellers",
      question: "When do I get paid for my sales?",
      answer: "Payments are processed weekly. You can withdraw your earnings to your registered bank account or keep them in your wallet for future transactions.",
    },
    {
      id: "9",
      category: "drivers",
      question: "How do I become a driver?",
      answer: "Sign up as a driver, complete your profile with vehicle information, and pass our KYC verification. Once approved, you'll receive delivery jobs in your area.",
    },
    {
      id: "10",
      category: "drivers",
      question: "How are delivery fees calculated?",
      answer: "Delivery fees are based on distance, delivery area, and current demand. You can see the fare before accepting each job.",
    },
    {
      id: "11",
      category: "drivers",
      question: "How do I withdraw my earnings?",
      answer: "You can withdraw your earnings anytime through your wallet. The money will be transferred to your registered bank account within 1-2 business days.",
    },
  ];

  const categories: Array<{ value: "all" | FAQItem["category"]; label: string }> = [
    { value: "all", label: "All" },
    { value: "general", label: "General" },
    { value: "buyers", label: "For Buyers" },
    { value: "sellers", label: "For Sellers" },
    { value: "drivers", label: "For Drivers" },
  ];

  const filteredFaqs = selectedCategory === "all" ? faqs : faqs.filter((faq) => faq.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <span className="text-2xl">←</span>
              <span>Back</span>
            </Link>
            <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
            <p className="text-primary-foreground/90">Find answers to common questions about Daily Deals Hub</p>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:border-primary"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-border rounded-lg bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                >
                  <h3 className="font-semibold text-foreground">{faq.question}</h3>
                  {expandedId === faq.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                  )}
                </button>
                {expandedId === faq.id && (
                  <div className="px-6 py-4 bg-muted/30 border-t border-border">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-card border-t border-border py-8 px-4 mt-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground mb-6">
              Contact our support team for additional assistance
            </p>
            <a
              href="mailto:support@dailydealshub.com"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
