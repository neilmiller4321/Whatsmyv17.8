import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calculator, PoundSterling, Car, CreditCard, HelpCircle, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import CarFinanceInfo from "@/components/car-finance/CarFinanceInfo";
import { formatNumberWithCommas, parseFormattedNumber, calculateCursorPosition } from "@/lib/formatters";
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FinanceComparison from "@/components/car-finance/FinanceComparison";
import { useToast } from "@/hooks/use-toast";

import { calculatePCP, calculateHP } from "@/lib/financeCalculations";

const CarFinanceCalculator = () => {
  const { toast } = useToast();
  const [carValue, setCarValue] = useState(20000);
  const [carValueInput, setCarValueInput] = useState('20,000');
  const [deposit, setDeposit] = useState(10);
  const [depositInput, setDepositInput] = useState('2,000');
  const [term, setTerm] = useState(36);
  const [pcpApr, setPcpApr] = useState(9.9);
  const [hpApr, setHpApr] = useState(9.9);
  const [useCustomRates, setUseCustomRates] = useState(false);
  const [pcpResult, setPcpResult] = useState<any>(null);
  const [hpResult, setHpResult] = useState<any>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    carValue: null,
    deposit: null
  });

  const calculateResults = () => {
    try {
      setError(null);
      setPcpResult(calculatePCP(carValue, deposit, term, useCustomRates ? pcpApr : undefined));
      setHpResult(calculateHP(carValue, deposit, term, useCustomRates ? hpApr : undefined));
    } catch (error) {
      console.error("Calculation error:", error);
      setError((error as Error).message);
      toast({
        title: "Calculation Error",
        description: (error as Error).message || "Please check your input values and try again.",
        variant: "destructive",
      });
    }
  };

  // Recalculate when inputs change
  useEffect(() => {
    try {
      setError(null);
      setPcpResult(calculatePCP(carValue, deposit, term, useCustomRates ? pcpApr : undefined));
      setHpResult(calculateHP(carValue, deposit, term, useCustomRates ? hpApr : undefined));
    } catch (error) {
      console.error("Calculation error:", error);
      setError((error as Error).message);
      toast({
        title: "Calculation Error",
        description: (error as Error).message || "Please check your input values and try again.",
        variant: "destructive",
      });
    }
  }, [carValue, deposit, term, pcpApr, hpApr, useCustomRates, toast]);

  // Add keyboard shortcut for calculation
  useKeyboardShortcut('Enter', () => {
    calculateResults();
  }, { 
    triggerOnFormElements: false, 
    preventDefault: true 
  });

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight">
            What's My<br className="sm:hidden" /> Car Payment?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Compare PCP and HP finance options to find the best deal for your new car.
          </p>
        </div>
      {/* Main Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 flex flex-col"
        >
          <Card className="bg-white/80 backdrop-blur-sm gradient-border h-full">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      Car Value
                    </label>
                    <span className="text-sm font-medium">£{formatNumberWithCommas(carValue)}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                    <input
                      ref={(el) => inputRefs.current.carValue = el}
                      type="text"
                      inputMode="numeric"
                      name="carValue"
                      value={carValueInput}
                      onChange={(e) => {
                        const { value } = e.target;
                        const cursorPos = e.target.selectionStart;
                        cursorPositionRef.current = cursorPos;
                        
                        const cleanValue = value.replace(/[^\d,]/g, '');
                        const numericString = cleanValue.replace(/,/g, '');
                        
                        if (numericString === '') {
                          setCarValueInput('');
                          return;
                        }
                        
                        const numericValue = Number(numericString);
                        if (!isNaN(numericValue)) {
                          const oldValue = carValueInput;
                          const formattedValue = formatNumberWithCommas(numericValue);
                          
                          setCarValueInput(formattedValue);
                          setCarValue(numericValue);
                          
                          setTimeout(() => {
                            const inputElement = inputRefs.current.carValue;
                            if (inputElement) {
                              const newCursorPos = calculateCursorPosition(
                                cleanValue,
                                oldValue,
                                cursorPos,
                                formattedValue
                              );
                              inputElement.setSelectionRange(newCursorPos, newCursorPos);
                            }
                          }, 0);
                        }
                      }}
                      onFocus={(e) => {
                        setFocusedField('carValue');
                        if (e.target.value === '0' || e.target.value === '0,000') {
                          setCarValueInput('');
                        }
                        cursorPositionRef.current = e.target.selectionStart;
                      }}
                      onBlur={(e) => {
                        setFocusedField(null);
                        if (e.target.value === '') {
                          setCarValueInput('0');
                          setCarValue(0);
                        } else {
                          const numericValue = parseFormattedNumber(e.target.value);
                          setCarValueInput(formatNumberWithCommas(numericValue));
                        }
                      }}
                      min={1000}
                      max={100000}
                      className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      Deposit
                    </label>
                    <span className="text-sm font-medium">
                     {`${deposit.toFixed(1)}%`}
                    </span>
                  </div>
                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                      <input
                        ref={(el) => inputRefs.current.deposit = el}
                        type="text"
                        inputMode="numeric"
                        name="deposit"
                        value={depositInput}
                        onChange={(e) => {
                          const { value } = e.target;
                          const cursorPos = e.target.selectionStart;
                          cursorPositionRef.current = cursorPos;
                          
                          const cleanValue = value.replace(/[^\d,]/g, '');
                          const numericString = cleanValue.replace(/,/g, '');
                          
                          if (numericString === '') {
                            setDepositInput('0');
                            setDeposit(0);
                            return;
                          }
                          
                          const numericValue = Number(numericString);
                          if (!isNaN(numericValue)) {
                            // Calculate percentage and cap at 90%
                            const percentage = Math.round(((numericValue / carValue) * 100) * 10) / 10;
                            const cappedPercentage = Math.min(90, Math.max(0, percentage));
                            const cappedValue = Math.round((carValue * cappedPercentage) / 100);
                            
                            const formattedValue = formatNumberWithCommas(numericValue);
                            
                            const oldValue = depositInput;
                            
                            setDepositInput(formattedValue);
                            setDeposit(cappedPercentage);
                            
                            setTimeout(() => {
                              const inputElement = inputRefs.current.deposit;
                              if (inputElement) {
                                const newCursorPos = calculateCursorPosition(
                                  cleanValue,
                                  oldValue,
                                  cursorPos,
                                  formattedValue
                                );
                                inputElement.setSelectionRange(newCursorPos, newCursorPos);
                              }
                            }, 0);
                          }
                        }}
                        onFocus={(e) => {
                          setFocusedField('deposit');
                          if (e.target.value === '0' || e.target.value === '0,000') {
                            setDepositInput('');
                          }
                          cursorPositionRef.current = e.target.selectionStart;
                        }}
                        onBlur={(e) => {
                          setFocusedField(null);
                          const value = e.target.value;
                          if (value === '') {
                            const defaultDeposit = Math.round((carValue * 10) / 100); // 10% default
                            setDepositInput(formatNumberWithCommas(defaultDeposit));
                            setDeposit(0);
                          } else {
                            const numericValue = parseFormattedNumber(e.target.value);
                            const percentage = Math.round(((numericValue / carValue) * 100) * 10) / 10;
                            const cappedPercentage = Math.min(90, Math.max(0, percentage));
                            const cappedValue = (carValue * cappedPercentage) / 100;
                            
                            setDepositInput(formatNumberWithCommas(cappedValue));
                            setDeposit(cappedPercentage);
                          }
                        }}
                        min={0}
                        max={carValue * 0.5}
                        step={100}
                        className="block w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start shadow-sm hover:shadow-md transition-shadow duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      Term (months)
                    </label>
                    <span className="text-sm font-medium">{term} months</span>
                  </div>
                  <Slider
                    value={[term]}
                    min={12}
                    max={60}
                    step={6}
                    onValueChange={(value) => setTerm(value[0])}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>12m</span>
                    <span>36m</span>
                    <span>60m</span>
                  </div>
                </div>

                {/* Custom Interest Rate Section */}
                <div className="pt-2 pb-2">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="customRates"
                      checked={useCustomRates}
                      onChange={(e) => setUseCustomRates(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="customRates" className="text-sm font-medium flex items-center gap-1.5">
                      <LineChart className="h-4 w-4 text-muted-foreground" />
                      Use Custom Interest Rates
                    </label>
                  </div>

                  {useCustomRates && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">PCP APR (%)</label>
                          <span className="text-sm font-medium">{pcpApr}%</span>
                        </div>
                        <Input
                          type="number"
                          value={pcpApr}
                          onChange={(e) => setPcpApr(Number(e.target.value))}
                          min={0}
                          max={30}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">HP APR (%)</label>
                          <span className="text-sm font-medium">{hpApr}%</span>
                        </div>
                        <Input
                          type="number"
                          value={hpApr}
                          onChange={(e) => setHpApr(Number(e.target.value))}
                          min={0}
                          max={30}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-auto">
                  <button
                    className="w-full gradient-button text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg"
                    onClick={calculateResults}
                  >
                    Calculate Car Payment
                  </button>
                  {(pcpResult?.monthlyPayment < 30 || hpResult?.monthlyPayment < 30) && (
                    <p className="text-sm text-sunset-text mt-2 text-center">
                      Monthly payment must be at least £30 to cover administrative costs
                    </p>
                  )}
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Representative example: Borrowing £20,000 over 48 months with a representative APR of 9.9%, 
                    the amount payable would be £503 per month, with a total cost of credit of £4,144 and a total 
                    amount payable of £24,144.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3"
        >
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="pcp">PCP</TabsTrigger>
              <TabsTrigger value="hp">HP</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="mt-0">
              {pcpResult && hpResult && (
                <FinanceComparison pcpResult={pcpResult} hpResult={hpResult} />
              )}
            </TabsContent>

            <TabsContent value="pcp" className="mt-0">
              {pcpResult && (
                <Card className="bg-white/80 backdrop-blur-sm gradient-border">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      Personal Contract Purchase (PCP)
                    </h3>
                    
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-gray-900">Monthly Payment</TableCell>
                          <TableCell className="text-right font-medium text-sunset-text">£{pcpResult.monthlyPayment.toFixed(2)}</TableCell>
                        </TableRow>
                        {pcpResult.isPaymentTooLow && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-sm text-sunset-text text-center">
                              Monthly payment must be at least £30 to cover administrative costs
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell className="font-medium">Deposit</TableCell>
                          <TableCell className="text-right">£{pcpResult.deposit.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Optional Final Payment</TableCell>
                          <TableCell className="text-right">£{pcpResult.balloonPayment.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Total Amount Payable</TableCell>
                          <TableCell className="text-right">£{pcpResult.totalPayable.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Total Interest</TableCell>
                          <TableCell className="text-right">£{pcpResult.totalInterest.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">APR</TableCell>
                          <TableCell className="text-right">{pcpResult.apr}%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    <div className="mt-6 bg-muted/30 p-4 rounded-lg">
                      <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        About PCP
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        With PCP, you pay lower monthly payments but have an optional balloon payment at the end. 
                        You can either pay this to own the car, return it, or trade it in for a new one.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="hp" className="mt-0">
              {hpResult && (
                <Card className="bg-white/80 backdrop-blur-sm gradient-border">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                        <Car className="h-4 w-4" />
                      </div>
                      Hire Purchase (HP)
                    </h3>
                    
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-gray-900">Monthly Payment</TableCell>
                          <TableCell className="text-right font-medium text-sunset-text">£{hpResult.monthlyPayment.toFixed(2)}</TableCell>
                        </TableRow>
                        {hpResult.isPaymentTooLow && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-sm text-sunset-text text-center">
                              Monthly payment must be at least £30 to cover administrative costs
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell className="font-medium">Deposit</TableCell>
                          <TableCell className="text-right">£{hpResult.deposit.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Total Amount Payable</TableCell>
                          <TableCell className="text-right">£{hpResult.totalPayable.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Total Interest</TableCell>
                          <TableCell className="text-right">£{hpResult.totalInterest.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">APR</TableCell>
                          <TableCell className="text-right">{hpResult.apr}%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    <div className="mt-6 bg-muted/30 p-4 rounded-lg">
                      <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        About HP
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        With Hire Purchase, you'll own the car outright once all payments are made. There's no balloon 
                        payment, but monthly payments are typically higher than PCP.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Interactive Gradient Background */}
      <div className="fixed inset-0 -z-10 opacity-50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-sunset-start/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-sunset-middle/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sunset-end/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Information Section */}
      <div className="mt-12">
        <CarFinanceInfo />
      </div>
      </div>
    </main>
  );
};

export default CarFinanceCalculator;
