import React, { useState, useMemo, useEffect } from 'react';
import { Typography } from 'antd'; // Keeping AntD Typography for structure
import { Calendar, ChevronLeft, ChevronRight, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../../components/common/Layout/PageHeader';

const { Title, Text } = Typography;

// --- Global Constants ---
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- Type Definitions ---
interface RepaymentEvent {
    id: string;
    loanId: string;
    amountDue: number;
    dueDate: Date;
    status: 'Due' | 'Paid' | 'Late' | 'Upcoming';
}

// --- Utility Functions ---

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

const isSameDay = (d1: Date, d2: Date): boolean => (
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate()
);

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// --- Calendar Event Visualization Map ---
const StatusMap = {
    Due: { text: "Due", color: "text-amber-700 bg-amber-50 border-amber-400", icon: DollarSign },
    Paid: { text: "Paid", color: "text-emerald-700 bg-emerald-50 border-emerald-400", icon: CheckCircle },
    Late: { text: "Late", color: "text-red-700 bg-red-50 border-red-400", icon: AlertTriangle },
    Upcoming: { text: "Upcoming", color: "text-indigo-700 bg-indigo-50 border-indigo-400", icon: Clock },
};

// --- Component: Repayment Event Card (Styled) ---
const RepaymentCard: React.FC<{ repayment: RepaymentEvent }> = ({ repayment }) => {
    const { text, color, icon: Icon } = StatusMap[repayment.status] || StatusMap.Due;
    const isDue = repayment.status === 'Due' || repayment.status === 'Late';

    return (
        <div className={`flex items-start p-4 rounded-xl border-l-4 ${color} transition duration-200 hover:shadow-md`}>
            <Icon className={`w-5 h-5 mt-1 mr-3 flex-shrink-0 ${color.split(' ')[0]}`} />
            <div className="flex-grow">
                <p className="font-bold text-xl text-gray-900">
                    {repayment.amountDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <p className={`text-sm font-medium ${color.split(' ')[0]}`}>
                    Status: {text}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Loan ID: {repayment.loanId}
                </p>
            </div>
            <button className="ml-4 px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-md">
                View Loan
            </button>
        </div>
    );
};

// --- Main Application Component ---
const AppCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const [repayments, setRepayments] = useState<RepaymentEvent[]>([]);

    // --- Mock Data Generation ---
    useEffect(() => {
        setIsLoading(true);

        const generateMockData = (year: number, month: number): RepaymentEvent[] => [
            { id: "r1", loanId: "L001", amountDue: 150.75, dueDate: new Date(year, month, 10), status: 'Due' },
            { id: "r2", loanId: "L002", amountDue: 50.00, dueDate: new Date(year, month, 10), status: 'Paid' },
            { id: "r3", loanId: "L003", amountDue: 220.50, dueDate: new Date(year, month, 22), status: 'Late' },
            { id: "r4", loanId: "L004", amountDue: 75.00, dueDate: new Date(year, month, 28), status: 'Upcoming' },
            { id: "r6", loanId: "L006", amountDue: 45.00, dueDate: new Date(year, month, 5), status: 'Paid' },
            { id: "r7", loanId: "L007", amountDue: 90.00, dueDate: new Date(year, month, 15), status: 'Due' },
            { id: "r8", loanId: "L008", amountDue: 110.00, dueDate: new Date(year, month, 15), status: 'Upcoming' },
            { id: "r9", loanId: "L009", amountDue: 600.00, dueDate: new Date(year, month, 20), status: 'Late' },
            // Add a next month event to show filtering is working
            { id: "r10", loanId: "L010", amountDue: 120.00, dueDate: new Date(year, month + 1, 5), status: 'Due' },
        ];

        // Simulate API delay
        const timer = setTimeout(() => {
            setRepayments(generateMockData(currentYear, currentMonth));
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [currentYear, currentMonth]);

    // --- Calendar Control Handlers ---
    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
        setCurrentDate(newDate);
        setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    };

    // --- Memoized Data Lookups ---
    const repaymentsByDay = useMemo(() => {
        const map = new Map<number, RepaymentEvent[]>();
        repayments.forEach(r => {
            const day = r.dueDate.getDate();
            if (r.dueDate.getFullYear() === currentYear && r.dueDate.getMonth() === currentMonth) {
                if (!map.has(day)) { map.set(day, []); }
                map.get(day)?.push(r);
            }
        });
        return map;
    }, [repayments, currentYear, currentMonth]);

    const calendarDays = useMemo(() => {
        const totalDays = getDaysInMonth(currentYear, currentMonth);
        const startDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);
        const days = [];

        // Add padding for the previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ date: null, isCurrentMonth: false });
        }

        // Add days of the current month
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(currentYear, currentMonth, day);
            days.push({
                date,
                dayNum: day,
                isCurrentMonth: true,
                events: repaymentsByDay.get(day) || [],
            });
        }

        // Add padding for the next month
        while (days.length % 7 !== 0) {
            days.push({ date: null, isCurrentMonth: false });
        }

        return days;
    }, [currentYear, currentMonth, repaymentsByDay]);


    const selectedDayEvents = useMemo(() => {
        return repayments.filter(r => isSameDay(r.dueDate, selectedDate)).sort((a, b) => {
            // Sort by status: Late > Due > Upcoming > Paid
            const order = { Late: 4, Due: 3, Upcoming: 2, Paid: 1 };
            return order[b.status] - order[a.status];
        });
    }, [repayments, selectedDate]);


    // --- Render Components ---

    const CalendarGrid = (
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 transition-all duration-300 border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
                    {MONTHS[currentMonth]} {currentYear}
                </h3>
                <button
                    onClick={() => changeMonth(1)}
                    className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition"
                    aria-label="Next month"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {WEEKDAYS.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((day, index) => {
                    if (!day.isCurrentMonth) {
                        return <div key={`empty-${index}`} className="aspect-square"></div>;
                    }

                    const dateToCheck = day.date!;
                    const isToday = isSameDay(dateToCheck, new Date());
                    const isSelected = isSameDay(dateToCheck, selectedDate);
                    const hasEvents = day.events.length > 0;

                    // Calculate total amounts
                    const paidCount = day.events.filter(e => e.status === 'Paid').length;
                    const dueCount = day.events.filter(e => e.status === 'Due' || e.status === 'Upcoming').length;
                    const lateCount = day.events.filter(e => e.status === 'Late').length;
                    const totalDueAmount = day.events.filter(e => e.status !== 'Paid').reduce((sum, e) => sum + e.amountDue, 0);

                    return (
                        <div
                            key={day.dayNum}
                            className={`
                                aspect-square rounded-xl p-1 text-center cursor-pointer flex flex-col justify-between transition-all duration-150
                                border ${isToday && !isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100'}
                                ${isSelected ? 'ring-4 ring-indigo-500 bg-indigo-100 shadow-lg scale-[1.03] border-indigo-600' : 'hover:bg-gray-50 hover:shadow-sm'}
                            `}
                            onClick={() => setSelectedDate(dateToCheck)}
                        >
                            {/* Day Number */}
                            <span className={`text-base sm:text-lg font-bold block mt-1 ${isSelected ? 'text-indigo-900' : 'text-gray-800'}`}>
                                {day.dayNum}
                            </span>

                            {/* Event Summary Dots/Badges */}
                            <div className="flex flex-col items-center justify-end h-auto pb-1 space-y-0.5">
                                {lateCount > 0 && (
                                    <span className="text-xs font-semibold text-red-600 leading-none">
                                        <AlertTriangle className="inline w-3 h-3 mr-1" />{lateCount} Late
                                    </span>
                                )}
                                {totalDueAmount > 0 && lateCount === 0 && (
                                    <span className="text-xs font-bold text-gray-800 bg-yellow-300 px-2 rounded-full leading-snug">
                                        {totalDueAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                )}
                                {paidCount > 0 && totalDueAmount === 0 && (
                                    <span className="text-xs font-medium text-emerald-600 leading-none">
                                        <CheckCircle className="inline w-3 h-3 mr-1" />{paidCount} Paid
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const EventsList = (
        <div className="bg-white rounded-3xl shadow-xl p-6 transition-all duration-300 border border-gray-100 h-full max-h-[85vh] flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
                Schedule for {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}
            </h3>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center h-full min-h-48 text-center">
                    <Calendar className="w-8 h-8 animate-spin text-indigo-500" />
                    <span className="mt-3 text-gray-500 text-sm">Fetching schedule details...</span>
                </div>
            ) : selectedDayEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-xl mt-4">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-lg">Clear Day!</p>
                    <p className="text-sm">No collections or payments scheduled.</p>
                </div>
            ) : (
                <div className="overflow-y-auto space-y-4 flex-grow pr-1">
                    {selectedDayEvents.map(repayment => (
                        <RepaymentCard key={repayment.id} repayment={repayment} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div>
            <PageHeader 
                title="Calendar" 
                breadcrumbs={[
                    { title: 'Calendar' }
                ]} 
            />
            
            <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Title level={2} className="text-gray-900 mb-1 flex items-center">
                            <Calendar className="w-9 h-9 mr-3 text-indigo-600" />
                            Repayment Calendar
                        </Title>
                        <Text type="secondary" className="text-base sm:text-lg block text-gray-500">
                            View and manage all outstanding **loan due dates** and collection schedules in one place.
                        </Text>
                    </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Calendar View (2/3 width on desktop, full width on mobile) */}
                    <div className="lg:col-span-2">
                        {CalendarGrid}
                    </div>

                    {/* Events List (1/3 width on desktop, full width on mobile) */}
                    <div className="lg:col-span-1">
                        {EventsList}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default AppCalendar;