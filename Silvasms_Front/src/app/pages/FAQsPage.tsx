import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Card, CardContent } from '../components/ui/card';
import { HelpCircle, MessageSquare, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function FAQsPage() {
  const faqCategories = [
    {
      title: 'Getting Started',
      faqs: [
        {
          question: 'How does GoldenSMS work?',
          answer: 'GoldenSMS provides temporary phone numbers that can receive SMS verification codes. Simply choose a country, select a number, and use it to verify your account on any service. You\'ll receive the SMS code instantly in your dashboard.'
        },
        {
          question: 'Do I need a subscription?',
          answer: 'No! GoldenSMS uses a pay-as-you-go wallet system. Add funds to your wallet and only pay when you purchase a number. There are no monthly fees or subscriptions.'
        },
        {
          question: 'How much does it cost?',
          answer: 'Prices vary by country, typically ranging from ₦500 to ₦5,000 per number. US numbers start at ₦2,500. You only pay for what you use, with no hidden fees.'
        }
      ]
    },
    {
      title: 'Using Numbers',
      faqs: [
        {
          question: 'How long can I use a number?',
          answer: 'Most numbers are available for 20 minutes. This is usually enough time to receive verification codes. If you need more time, you can purchase an extended session.'
        },
        {
          question: 'Can I receive multiple SMS on one number?',
          answer: 'Yes! During your active session, you can receive multiple SMS messages to the same number. All messages will appear in your dashboard.'
        },
        {
          question: 'Which services are supported?',
          answer: 'GoldenSMS works with most major platforms including Instagram, WhatsApp, Telegram, Facebook, Twitter, Google, and hundreds more. We support social media, messaging apps, and general verification services.'
        },
        {
          question: 'What if I don\'t receive the code?',
          answer: 'If you don\'t receive a code within 5 minutes, you can cancel the number and get a full refund to your wallet. We also offer a "Try Another Number" option for free.'
        }
      ]
    },
    {
      title: 'Wallet & Payments',
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept credit/debit cards (Visa, Mastercard, Amex) and cryptocurrency (BTC, ETH, USDT). Card payments have a small processing fee, while crypto payments are fee-free.'
        },
        {
          question: 'Do my credits expire?',
          answer: 'No! Funds in your wallet never expire. You can use them whenever you need them, with no time limits or expiration dates.'
        },
        {
          question: 'Can I get a refund?',
          answer: 'If you don\'t receive an SMS within 5 minutes of purchasing a number, you can request a full refund to your wallet. Unused wallet funds can also be withdrawn (minus processing fees).'
        },
        {
          question: 'Is there a minimum deposit?',
          answer: 'The minimum deposit is ₦5,000. This ensures you have enough balance to purchase at least a couple of numbers and try the service.'
        }
      ]
    },
    {
      title: 'Privacy & Security',
      faqs: [
        {
          question: 'Is my data secure?',
          answer: 'Yes! We use industry-standard encryption for all data transmission and storage. We never store your verification codes long-term, and all messages are automatically deleted after 24 hours.'
        },
        {
          question: 'Do you sell my information?',
          answer: 'Absolutely not. We never sell, share, or trade your personal information. Your privacy is our top priority.'
        },
        {
          question: 'Are the numbers private?',
          answer: 'Numbers are temporary and shared. While you have exclusive access during your active session, the number may be reused by other customers afterward. Never use these numbers for sensitive accounts or two-factor authentication.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] via-[#0F1729] to-[#1E2A45] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 p-8 rounded-2xl bg-gradient-to-r from-[#1D4ED8] via-[#1E40AF] to-[#0F2B6B] shadow-xl shadow-blue-500/20 dark:shadow-blue-900/30">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-blue-100 dark:text-blue-200">
          Find answers to common questions about GoldenSMS
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8 mb-12">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-xl text-gray-900 dark:text-white mb-4">{category.title}</h2>
            <Card className="border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`item-${categoryIndex}-${faqIndex}`}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left">
                        <span className="text-gray-900 dark:text-white">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-[#3B82F6] dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl text-[#3B82F6] dark:text-blue-100 mb-2">
            Still have questions?
          </h3>
          <p className="text-[#2563EB] dark:text-blue-300 mb-6">
            Our support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              className="border border-[#3B82F6] text-[#3B82F6] hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Live Chat
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}