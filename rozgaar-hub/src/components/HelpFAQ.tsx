import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HelpFAQ = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I find work on RozgaarHub?",
      answer: "Go to the 'Jobs' tab in your dashboard. You can browse available listings based on your skills and location. Click 'Apply' to show interest."
    },
    {
      question: "How do I get paid?",
      answer: "Payments are processed securely through the platform. Once a job is marked complete by the employer, funds are transferred to your linked wallet or bank account."
    },
    {
      question: "Is there an insurance for workers?",
      answer: "Yes, all verified workers on RozgaarHub are covered under our Group Insurance Policy for accidental and medical emergencies during work hours."
    },
    {
      question: "What if I have an emergency at work?",
      answer: "Use the 'Emergency Contacts' section on this Help page. You can call our 24/7 Helpline at 9797653832 or use your saved emergency contacts."
    },
    {
      question: "How do I update my profile?",
      answer: "Navigate to the 'Profile' section. You can update your skills, experience, and contact details there."
    },
    {
      question: "Why is my account verification pending?",
      answer: "Verification usually takes 24-48 hours. Ensure you have uploaded clear photos of your ID and required documents."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("help.searchFaq", "Search FAQs...")}
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {filteredFaqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
        {filteredFaqs.length === 0 && (
          <p className="text-center text-muted-foreground py-4">No matching questions found.</p>
        )}
      </Accordion>
    </div>
  );
};
