
import React from "react";
import { motion } from "framer-motion";
import { Info, Shield, Clock, CheckCircle2, FileText, HelpCircle, Car, CreditCard, Calculator, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as Accordion from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Accordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof Accordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </Accordion.Trigger>
  </Accordion.Header>
))
AccordionTrigger.displayName = Accordion.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof Accordion.Content>,
  React.ComponentPropsWithoutRef<typeof Accordion.Content>
>(({ className, children, ...props }, ref) => (
  <Accordion.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </Accordion.Content>
))
AccordionContent.displayName = Accordion.Content.displayName

const CarFinanceInfoSection = () => {
  return (
    <motion.div 
      className="mt-16 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="section-heading mb-8">Understanding Car Finance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            icon: <Car className="h-6 w-6 text-sunset-start" />,
            bgColor: "from-sunset-start/10 to-sunset-middle/10",
            title: "What is Car Finance?",
            description: "Car finance is a loan specifically designed to help you purchase a vehicle when you don't have the full amount available upfront."
          },
          {
            icon: <Shield className="h-6 w-6 text-sunset-middle" />,
            bgColor: "from-sunset-middle/10 to-sunset-end/10",
            title: "Is it Secure?",
            description: "Car finance is usually secured against the vehicle itself, meaning the car can be repossessed if you fail to keep up with repayments."
          },
          {
            icon: <Clock className="h-6 w-6 text-sunset-end" />,
            bgColor: "from-sunset-end/10 to-sunset-start/10",
            title: "Repayment Terms",
            description: "Most car finance agreements run from 2-5 years, with longer terms offering lower monthly payments but higher overall costs."
          },
          {
            icon: <Wallet className="h-6 w-6 text-sunset-start" />,
            bgColor: "from-sunset-start/10 to-sunset-end/10",
            title: "Eligibility",
            description: "Approval depends on your credit score, income, and existing financial commitments. Better scores typically secure better rates."
          }
        ].map((item, index) => (
          <motion.div
            key={`info-card-${index}`}
            className="bg-white/90 backdrop-blur-sm gradient-border rounded-lg p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_16px_50px_rgb(0,0,0,0.15)] transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <div className={`p-3 rounded-full bg-gradient-to-br ${item.bgColor} inline-flex items-center justify-center mb-4`}>
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </motion.div>
        ))}
      </div>

      <Card className="border border-gray-100 shadow-sm bg-white/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-gradient-to-br from-sunset-start/10 via-sunset-middle/10 to-sunset-end/10 p-6 flex flex-col justify-center">
              <FileText className="h-8 w-8 text-sunset-middle mb-4" />
              <h3 className="text-xl font-bold mb-2">Compare Your Options</h3>
              <p className="text-sm text-muted-foreground">
                Understanding the differences between finance types can help you make the best decision for your circumstances.
              </p>
              <Button className="mt-6 w-full md:w-auto gradient-button text-white">Car Finance Guide</Button>
            </div>
            
            <div className="md:w-2/3 p-6">
              <Accordion.Root type="single" collapsible className="w-full">
                <Accordion.Item value="pcp-vs-hp" className="border-b border-sunset-start/10">
                  <AccordionTrigger className="text-base font-medium">
                    PCP vs HP: What's the difference?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-3">
                      <strong>Personal Contract Purchase (PCP)</strong> involves lower monthly payments with a larger optional final payment (balloon payment) at the end of the agreement. It's ideal if you want flexibility to change cars regularly.
                    </p>
                    <p>
                      <strong>Hire Purchase (HP)</strong> splits the cost of the car equally across the agreement with no large final payment. Once all payments are made, you own the car outright with no further obligations.
                    </p>
                  </AccordionContent>
                </Accordion.Item>
                
                <Accordion.Item value="apr" className="border-b border-sunset-middle/10">
                  <AccordionTrigger className="text-base font-medium">
                    Understanding APR
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Annual Percentage Rate (APR) represents the yearly cost of borrowing, including interest and mandatory fees. A lower APR means you'll pay less for your finance. Always compare the APR rather than just the monthly payment to understand the true cost.
                    </p>
                  </AccordionContent>
                </Accordion.Item>
                
                <Accordion.Item value="credit-score" className="border-b border-sunset-end/10">
                  <AccordionTrigger className="text-base font-medium">
                    How credit scores affect your finance
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Your credit score significantly impacts the interest rate you'll be offered. Higher scores typically result in lower rates, potentially saving you thousands over the term of the agreement. Before applying, check your credit report and take steps to improve it if needed.
                    </p>
                  </AccordionContent>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert className="mt-8 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 border-sunset-start/20">
        <HelpCircle className="h-4 w-4 text-sunset-text" />
        <AlertTitle>Important Note</AlertTitle>
        <AlertDescription>
          This calculator provides estimates only. The actual finance rates, terms, and eligibility will be determined by lenders based on your personal circumstances and credit history.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default CarFinanceInfoSection;