import React, { useState, useEffect, useRef } from 'react';
import { Baby, Calendar, Clock, Info, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DaySchedule {
  enabled: boolean;
  type: 'full' | 'half' | 'none';
}

interface Schedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
}

interface WeekdayCounts {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
}

type Location = 'england' | 'scotland';
type AgeGroup = '9m-3y' | '3-4y';
type FundingDistribution = 'spread' | 'term';

interface FundedHoursConfig {
  enabled: boolean;
  location: Location | null;
  ageGroup: AgeGroup;
  distribution: FundingDistribution;
  fullDayHours: number;
  halfDayHours: number;
}

// Funded hours constants
const FUNDED_HOURS = {
  england: {
    '9m-3y': {
      spread: 11,
      term: 15
    },
    '3-4y': {
      spread: 22,
      term: 30
    }
  },
  scotland: {
    '3-4y': {
      spread: 22,
      term: 30
    }
  }
};

export function ChildcareCost() {
  // Add ref for Tax-Free Childcare section
  const taxFreeChildcareSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Form state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  });
  const [fullDayCost, setFullDayCost] = useState<string>('50');
  const [halfDayCost, setHalfDayCost] = useState<string>('30');
  
  // Child schedule
  const [schedule, setSchedule] = useState<Schedule>({
    monday: { enabled: true, type: 'none' },
    tuesday: { enabled: true, type: 'none' },
    wednesday: { enabled: true, type: 'none' },
    thursday: { enabled: true, type: 'none' },
    friday: { enabled: true, type: 'none' }
  });

  // Funded hours state
  const [fundedHours, setFundedHours] = useState<FundedHoursConfig>({
    enabled: false,
    location: null,
    ageGroup: '3-4y',
    distribution: 'spread',
    fullDayHours: 10,
    halfDayHours: 5
  });

  // Weekday counts for selected month
  const [weekdayCounts, setWeekdayCounts] = useState<WeekdayCounts>({
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0
  });

  // Show/hide tooltips
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleTaxFreeChildcareClick = () => {
    const projection = calculateThreeMonthProjection();
    
    if (projection && projection.length === 3) {
      // If using term time distribution, use term time costs
      const costs = fundedHours.enabled && fundedHours.distribution === 'term'
        ? {
            month1: projection[0].termTime || 0,
            month2: projection[1].termTime || 0,
            month3: projection[2].termTime || 0
          }
        : {
            month1: projection[0].cost,
            month2: projection[1].cost,
            month3: projection[2].cost
          };

      navigate('/tax-free-childcare', {
        state: {
          monthlyChildcareCosts: costs
        }
      });
    } else {
      // If no costs calculated, just navigate
      navigate('/tax-free-childcare');
    }
  };
  
  // Calculate weekday counts when month changes
  useEffect(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const counts = calculateWeekdayCounts(year, month);
    setWeekdayCounts(counts);
  }, [selectedMonth]);

  // Update age group when location changes
  useEffect(() => {
    if (fundedHours.location === 'scotland') {
      setFundedHours(prev => ({
        ...prev,
        ageGroup: '3-4y'
      }));
    }
  }, [fundedHours.location]);

  // Calculate weekday counts for a given month
  const calculateWeekdayCounts = (year: number, month: number): WeekdayCounts => {
    const counts = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0
    };
    
    const date = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= lastDay; day++) {
      date.setDate(day);
      const weekday = date.getDay();
      
      if (weekday === 1) counts.monday++;
      if (weekday === 2) counts.tuesday++;
      if (weekday === 3) counts.wednesday++;
      if (weekday === 4) counts.thursday++;
      if (weekday === 5) counts.friday++;
    }
    
    return counts;
  };

  // Get weekday counts for next month
  const getNextMonthCounts = (year: number, month: number): WeekdayCounts => {
    if (month === 12) {
      return calculateWeekdayCounts(year + 1, 1);
    }
    return calculateWeekdayCounts(year, month + 1);
  };

  // Calculate funded hours for a day type
  const calculateFundedHoursForDay = (type: 'full' | 'half'): number => {
    if (!fundedHours.enabled || fundedHours.location === null) return 0;

    const hoursPerDay = type === 'full' ? fundedHours.fullDayHours : fundedHours.halfDayHours;
    const weeklyFundedHours = Math.floor(FUNDED_HOURS[fundedHours.location][fundedHours.ageGroup][fundedHours.distribution]);

    // Calculate daily funded hours based on complete days
    const daysPerWeek = 5;
    const dailyFundedHours = Math.floor(weeklyFundedHours / daysPerWeek);
    
    // Return the minimum of available funded hours and actual day hours
    return Math.min(Math.floor(dailyFundedHours), hoursPerDay);
  };

  // Calculate cost for a day with funded hours
  const calculateDayCost = (type: 'full' | 'half', count: number): number => {
    if (type === 'none') return 0;

    const baseCost = type === 'full' ? parseFloat(fullDayCost) : parseFloat(halfDayCost);
    const dayHours = type === 'full' ? fundedHours.fullDayHours : fundedHours.halfDayHours;
    
    if (!fundedHours.enabled || fundedHours.location === null) return baseCost * count;

    // For term time distribution, we need to calculate both term time and holiday costs
    if (fundedHours.distribution === 'term') {
      // During holidays, no funded hours are available
      return baseCost * count;
    }

    const fundedHoursForDay = calculateFundedHoursForDay(type);
    const fundedProportion = Math.floor(fundedHoursForDay) / dayHours;
    const costAfterFunding = baseCost * (1 - fundedProportion);

    return costAfterFunding * count;
  };

  // Calculate monthly cost based on schedule and weekday counts
  const calculateMonthlyCost = (counts: WeekdayCounts): number => {
    let totalCost = 0;

    Object.entries(schedule).forEach(([day, daySchedule]) => {
      const count = counts[day as keyof WeekdayCounts];
      if (daySchedule.type !== 'none') {
        totalCost += calculateDayCost(daySchedule.type, count);
      }
    });

    return totalCost;
  };

  // Handle schedule change
  const handleScheduleChange = (day: keyof Schedule, type: 'full' | 'half' | 'none') => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], type }
    }));
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Get month name
  const getMonthName = (monthNum: number): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthNum - 1];
  };

  // Calculate three-month projection
  const calculateThreeMonthProjection = (): { month: string; cost: number; termTime?: number; holiday?: number }[] => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const projection = [];

    // Helper function to calculate costs for a month
    const calculateMonthCosts = (counts: WeekdayCounts) => {
      const regularCost = calculateMonthlyCost(counts);
      
      if (fundedHours.enabled && fundedHours.distribution === 'term') {
        // For term time, temporarily enable funded hours
        const termTimeCost = Object.entries(schedule).reduce((total, [day, daySchedule]) => {
          const count = counts[day as keyof WeekdayCounts];
          if (daySchedule.type !== 'none') {
            const baseCost = daySchedule.type === 'full' ? parseFloat(fullDayCost) : parseFloat(halfDayCost);
            const dayHours = daySchedule.type === 'full' ? fundedHours.fullDayHours : fundedHours.halfDayHours;
            const fundedHoursForDay = calculateFundedHoursForDay(daySchedule.type);
            const fundedProportion = Math.floor(fundedHoursForDay) / dayHours;
            const costAfterFunding = baseCost * (1 - fundedProportion);
            return total + (costAfterFunding * count);
          }
          return total;
        }, 0);
        
        // For holidays, calculate without funded hours
        const holidayCost = Object.entries(schedule).reduce((total, [day, daySchedule]) => {
          const count = counts[day as keyof WeekdayCounts];
          if (daySchedule.type !== 'none') {
            const baseCost = daySchedule.type === 'full' ? parseFloat(fullDayCost) : parseFloat(halfDayCost);
            return total + (baseCost * count);
          }
          return total;
        }, 0);
        
        return {
          regular: regularCost,
          termTime: termTimeCost,
          holiday: holidayCost
        };
      }
      
      return { regular: regularCost };
    };

    // Current month
    const currentMonthCosts = calculateMonthCosts(weekdayCounts);
    projection.push({
      month: `${getMonthName(month)} ${year}`,
      cost: currentMonthCosts.regular,
      ...(currentMonthCosts.termTime && { termTime: currentMonthCosts.termTime }),
      ...(currentMonthCosts.holiday && { holiday: currentMonthCosts.holiday })
    });

    // Next month
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    const nextMonthCounts = getNextMonthCounts(year, month);
    const nextMonthCosts = calculateMonthCosts(nextMonthCounts);
    projection.push({
      month: `${getMonthName(nextMonth)} ${nextYear}`,
      cost: nextMonthCosts.regular,
      ...(nextMonthCosts.termTime && { termTime: nextMonthCosts.termTime }),
      ...(nextMonthCosts.holiday && { holiday: nextMonthCosts.holiday })
    });

    // Month after next
    let thirdMonth = nextMonth + 1;
    let thirdYear = nextYear;
    if (thirdMonth > 12) {
      thirdMonth = 1;
      thirdYear++;
    }
    const thirdMonthCounts = getNextMonthCounts(nextYear, nextMonth);
    const thirdMonthCosts = calculateMonthCosts(thirdMonthCounts);
    projection.push({
      month: `${getMonthName(thirdMonth)} ${thirdYear}`,
      cost: thirdMonthCosts.regular,
      ...(thirdMonthCosts.termTime && { termTime: thirdMonthCosts.termTime }),
      ...(thirdMonthCosts.holiday && { holiday: thirdMonthCosts.holiday })
    });

    return projection;
  };

  return (
    <main className="pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sunset-start via-sunset-middle to-sunset-end flex items-center justify-center mb-6">
            <Baby className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 logo-text bg-gradient-to-r from-sunset-start via-sunset-middle to-sunset-end bg-clip-text text-transparent leading-tight">
            What's My<br className="sm:hidden" /> Childcare Cost?
          </h1>
          <p className="text-gray-600 text-center max-w-2xl">
            Calculate your estimated childcare costs based on your schedule and rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calculator Form */}
          <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Childcare Details</h2>
            
            {/* Month Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  id="month"
                  value={selectedMonth.split('-')[1].padStart(2, '0')}
                  onChange={(e) => {
                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const selectedMonth = parseInt(e.target.value);
                    const selectedYear = selectedMonth < now.getMonth() + 1 ? currentYear + 1 : currentYear;
                    const month = e.target.value.padStart(2, '0');
                    setSelectedMonth(`${selectedYear}-${month}`);
                  }}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((month, index) => (
                    <option key={month} value={(index + 1).toString().padStart(2, '0')}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  id="year"
                  value={selectedMonth.split('-')[0]}
                  onChange={(e) => setSelectedMonth(`${e.target.value}-${selectedMonth.split('-')[1]}`)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                >
                  {[new Date().getFullYear(), new Date().getFullYear() + 1].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Costs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="fullDayCost" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Day Cost
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                  <input
                    type="text"
                    id="fullDayCost"
                    value={fullDayCost}
                    onChange={(e) => setFullDayCost(e.target.value.replace(/[^\d.]/g, ''))}
                    className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="halfDayCost" className="block text-sm font-medium text-gray-700 mb-1">
                  Half Day Cost
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                  <input
                    type="text"
                    id="halfDayCost"
                    value={halfDayCost}
                    onChange={(e) => setHalfDayCost(e.target.value.replace(/[^\d.]/g, ''))}
                    className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                  />
                </div>
              </div>
            </div>

            {/* Funded Hours Section */}
            <div className="mb-6 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-xl">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">Funded Hours</h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-sunset-text transition-colors"
                    onClick={() => setActiveTooltip(activeTooltip === 'funded' ? null : 'funded')}
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fundedHours.enabled}
                    onChange={(e) => setFundedHours(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sunset-start/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sunset-start"></div>
                </label>
              </div>

              {activeTooltip === 'funded' && (
                <div className="mx-2 mb-2 p-2 bg-white/80 rounded-lg text-sm text-gray-600">
                  <p>Government-funded childcare hours are available for eligible children. The amount of funded hours depends on your location and child's age.</p>
                </div>
              )}

              {fundedHours.enabled && (
                <div className="p-3 space-y-4">
                  {/* Day Duration Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Day Hours
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fundedHours.fullDayHours}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^\d]/g, '');
                          if (value === '') value = '';
                          const numValue = value === '' ? '' : Math.min(24, parseInt(value));
                          setFundedHours(prev => ({ ...prev, fullDayHours: numValue === '' ? '' : numValue }));
                        }}
                        onBlur={(e) => {
                          const value = Math.max(1, Math.min(24, parseInt(String(fundedHours.fullDayHours)) || 1));
                          setFundedHours(prev => ({ ...prev, fullDayHours: value }));
                        }}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Half Day Hours
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fundedHours.halfDayHours}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^\d]/g, '');
                          if (value === '') value = '';
                          const numValue = value === '' ? '' : Math.min(12, parseInt(value));
                          setFundedHours(prev => ({ ...prev, halfDayHours: numValue === '' ? '' : numValue }));
                        }}
                        onBlur={(e) => {
                          const value = Math.max(1, Math.min(12, parseInt(String(fundedHours.halfDayHours)) || 1));
                          setFundedHours(prev => ({ ...prev, halfDayHours: value }));
                        }}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                      />
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="location"
                          value="england"
                          checked={fundedHours.location === 'england'}
                          onChange={(e) => setFundedHours(prev => ({ ...prev, location: e.target.value as Location }))}
                          className="h-4 w-4 text-sunset-start focus:ring-sunset-start border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">England</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="location"
                          value="scotland"
                          checked={fundedHours.location === 'scotland'}
                          onChange={(e) => setFundedHours(prev => ({ ...prev, location: e.target.value as Location }))}
                          className="h-4 w-4 text-sunset-start focus:ring-sunset-start border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Scotland</span>
                      </label>
                    </div>
                  </div>

                  {/* Child Age Selection */}
                  {fundedHours.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Age
                      </label>
                      <select
                        value={fundedHours.ageGroup}
                        onChange={(e) => setFundedHours(prev => ({ ...prev, ageGroup: e.target.value as AgeGroup }))}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sunset-start focus:border-sunset-start"
                        disabled={fundedHours.location === 'scotland'}
                      >
                        {fundedHours.location === 'england' && (
                          <option value="9m-3y">9 months to under 3 years</option>
                        )}
                        <option value="3-4y">3 to 4 years old</option>
                      </select>
                    </div>
                  )}

                  {/* Funding Distribution */}
                  {fundedHours.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Funding Distribution
                      </label>
                      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-4">
                        <label className="relative flex items-center">
                          <input
                            type="radio"
                            name="distribution"
                            value="spread"
                            checked={fundedHours.distribution === 'spread'}
                            onChange={(e) => setFundedHours(prev => ({ ...prev, distribution: e.target.value as FundingDistribution }))}
                            className="sr-only peer"
                          />
                          <div className="w-full h-12 sm:h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                            <span className="text-sm font-medium peer-checked:text-sunset-text">Distributed year-round</span>
                          </div>
                        </label>
                        <label className="relative flex items-center">
                          <input
                            type="radio"
                            name="distribution"
                            value="term"
                            checked={fundedHours.distribution === 'term'}
                            onChange={(e) => setFundedHours(prev => ({ ...prev, distribution: e.target.value as FundingDistribution }))}
                            className="sr-only peer"
                          />
                          <div className="w-full h-12 sm:h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                            <span className="text-sm font-medium peer-checked:text-sunset-text">Term time only</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Funded Hours Summary */}
                  {fundedHours.location && (
                    <div className="mt-4 p-3 bg-white/80 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Funded Hours</h4>
                      <p className="text-sm text-gray-600">
                        {fundedHours.distribution === 'spread' ? (
                          <>
                            {FUNDED_HOURS[fundedHours.location][fundedHours.ageGroup].spread} hours per week, spread evenly
                          </>
                        ) : (
                          <>
                            {FUNDED_HOURS[fundedHours.location][fundedHours.ageGroup].term} hours per week during term time
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Schedule */}
            <div className="bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Childcare Schedule</h3>
              <div className="space-y-2">
                {Object.entries(schedule).map(([day, schedule]) => (
                  <div key={day} className="bg-white rounded-lg p-3 md:flex md:items-center md:justify-between">
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <div className="font-medium capitalize text-gray-800">{day}</div>
                      <div className="text-xs text-sunset-text">({weekdayCounts[day as keyof WeekdayCounts]} days)</div>
                    </div>
                    <div className="flex justify-center gap-1 mt-3 md:mt-0">
                      <label className="relative flex items-center">
                        <input
                          type="radio"
                          name={`${day}-type`}
                          checked={schedule.type === 'none'}
                          onChange={() => handleScheduleChange(day as keyof Schedule, 'none')}
                          className="sr-only peer"
                        />
                        <div className="w-16 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                          <span className="text-xs font-medium peer-checked:text-sunset-text md:hidden">No Care</span>
                          <span className="text-xs font-medium peer-checked:text-sunset-text hidden md:inline">No Care</span>
                        </div>
                      </label>
                      
                      <label className="relative flex items-center">
                        <input
                          type="radio"
                          name={`${day}-type`}
                          checked={schedule.type === 'full'}
                          onChange={() => handleScheduleChange(day as keyof Schedule, 'full')}
                          className="sr-only peer"
                        />
                        <div className="w-16 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                          <span className="text-xs font-medium peer-checked:text-sunset-text md:hidden">Full Day</span>
                          <span className="text-xs font-medium peer-checked:text-sunset-text hidden md:inline">Full Day</span>
                        </div>
                      </label>
                      
                      <label className="relative flex items-center">
                        <input
                          type="radio"
                          name={`${day}-type`}
                          checked={schedule.type === 'half'}
                          onChange={() => handleScheduleChange(day as keyof Schedule, 'half')}
                          className="sr-only peer"
                        />
                        <div className="w-16 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg peer-checked:border-sunset-start peer-checked:bg-sunset-start/5 transition-all duration-200">
                          <span className="text-xs font-medium peer-checked:text-sunset-text md:hidden">Half Day</span>
                          <span className="text-xs font-medium peer-checked:text-sunset-text hidden md:inline">Half Day</span>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 gradient-border">
            <h2 className="text-xl font-semibold mb-4">Estimated Cost</h2>
            
            <div className="bg-gradient-to-br from-sunset-start/10 to-sunset-end/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(fundedHours.enabled && fundedHours.distribution === 'term' 
                  ? Object.entries(schedule).reduce((total, [day, daySchedule]) => {
                      const count = weekdayCounts[day as keyof WeekdayCounts];
                      if (daySchedule.type !== 'none') {
                        const baseCost = daySchedule.type === 'full' ? parseFloat(fullDayCost) : parseFloat(halfDayCost);
                        const dayHours = daySchedule.type === 'full' ? fundedHours.fullDayHours : fundedHours.halfDayHours;
                        const fundedHoursForDay = calculateFundedHoursForDay(daySchedule.type);
                        const fundedProportion = Math.floor(fundedHoursForDay) / dayHours;
                        const costAfterFunding = baseCost * (1 - fundedProportion);
                        return total + (costAfterFunding * count);
                      }
                      return total;
                    }, 0)
                  : calculateMonthlyCost(weekdayCounts)
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                For {getMonthName(parseInt(selectedMonth.split('-')[1]))} {selectedMonth.split('-')[0]}
                {fundedHours.enabled && fundedHours.distribution === 'term' && (
                  <span className="block text-xs text-sunset-text mt-1">(Assuming term time)</span>
                )}
              </p>
            </div>
            
            {/* Three Month Projection */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">3-Month Projection</h3>
              <div className="space-y-2">
                {calculateThreeMonthProjection().map((projection, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {projection.month}
                      </span>
                      {!(fundedHours.enabled && fundedHours.distribution === 'term') && (
                        <span className="text-sm font-semibold">{formatCurrency(projection.cost)}</span>
                      )}
                    </div>
                    
                    {fundedHours.enabled && fundedHours.distribution === 'term' && (
                      <div className="ml-4 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Term time:</span>
                          <span className="font-medium">{formatCurrency(projection.termTime || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Holiday time:</span>
                          <span className="font-medium">{formatCurrency(projection.holiday || 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tax-Free Childcare Prompt */}
            <div className="mt-6 p-4 bg-gradient-to-br from-sunset-start/5 to-sunset-end/5 rounded-lg hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sunset-start to-sunset-end flex items-center justify-center mb-3">
                  <span className="text-white font-bold">!</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Save up to 20% with Tax-Free Childcare!
                  </h3>
                  <button 
                    onClick={handleTaxFreeChildcareClick}
                    className="px-4 py-2 bg-gradient-to-r from-sunset-start to-sunset-end text-white text-sm font-medium rounded-lg hover:shadow-md transition-all duration-300"
                  >
                    Estimate your family's savings
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Additional Information */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Understanding Childcare Costs</h2>
          <div className="space-y-8">
            {/* Funded Hours Section */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-lg md:rounded-xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
              <h3 className="text-xl font-semibold mb-4">Funded Childcare Hours</h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  The UK government offers free childcare hours to help parents with costs. The amount available depends on your location and child's age:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">England</h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>15 hours per week for eligible working parents of children from 9-months to 3-year olds</li>
                      <li>30 hours per week for eligible working parents of 3-4 year olds</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">Scotland</h4>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>1,140 hours per year for all 3-4 year olds</li>
                      <li>Some 2 year olds also eligible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Distribution Options */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-lg md:rounded-xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
              <h3 className="text-xl font-semibold mb-4">Funding Distribution Options</h3>
              <p className="text-gray-600 mb-4">The availability of term-time or year-round funding distribution depends on your childcare provider. Please check with them about their specific arrangements and which options they offer.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 rounded-xl p-6">
                  <h4 className="font-medium text-lg mb-4 text-sunset-text">Term Time Only</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Full funded hours during term time</li>
                    <li>• No funded hours during holidays</li>
                    <li>• Higher savings during term time</li>
                    <li>• Higher costs during holidays</li>
                  </ul>
                </div>
                <div className="bg-white/80 rounded-xl p-6">
                  <h4 className="font-medium text-lg mb-4 text-sunset-text">Year-Round Distribution</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Funded hours spread across the year</li>
                    <li>• Consistent monthly costs</li>
                    <li>• Easier budgeting</li>
                    <li>• Lower but steady savings</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Additional Support */}
            <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-lg md:rounded-xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
              <h3 className="text-xl font-semibold mb-4">Additional Financial Support</h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Beyond funded hours, there are several other ways to get help with childcare costs:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Tax-Free Childcare</h4>
                    <p className="text-sm text-gray-600">Get up to £2,000 per child per year towards childcare costs</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Universal Credit</h4>
                    <p className="text-sm text-gray-600">Claim back up to 85% of eligible childcare costs</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Tax Credits</h4>
                    <p className="text-sm text-gray-600">Get help with up to 70% of childcare costs</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50/80 to-red-50/80 rounded-lg md:rounded-xl p-4 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transform-gpu">
              <p className="text-sm">
                <strong>Important:</strong> This calculator provides estimates based on your inputs. Actual costs may vary depending on your provider's specific pricing, holiday periods, and other factors. Always check with your childcare provider and local authority for exact costs and funding eligibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}