import { useState, useEffect } from "react";
import { Calendar, X } from "lucide-react";
import Modal from "@/components/common/Modal";

export default function DatePicker({ value, onChange, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  // Always start from current month, not from selected date
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Update selectedDate when value prop changes (but don't change currentMonth)
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Reset to current month when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(new Date());
    }
  }, [isOpen]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    onClear();
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      
      // Check if we're within the allowed range (current month to +3 months)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setMonth(today.getMonth() + 3);
      
      const newDateOnly = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), 1);
      const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      
      // Don't allow going back
      if (newDateOnly < todayOnly) {
        return prev;
      }
      
      // Don't allow going more than 3 months ahead
      if (newDateOnly > maxDateOnly) {
        return prev;
      }
      
      return newDate;
    });
  };

  const canGoBack = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonthOnly = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentMonthOnly > todayOnly;
  };

  const canGoForward = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 3);
    
    const currentMonthOnly = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    
    return currentMonthOnly < maxDateOnly;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Adjust first day for Bulgarian week (Monday = 0)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    // Empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push(date);
    }

    const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    const monthNames = [
      "Януари", "Февруари", "Март", "Април", "Май", "Юни",
      "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
    ];

    return (
      <div className="py-2">
        {/* Header with month navigation */}
        <div className="flex items-center justify-between mb-6 px-2">
          <button
            onClick={() => navigateMonth(-1)}
            disabled={!canGoBack()}
            className={`p-2.5 rounded-xl transition-all ${
              canGoBack()
                ? "bg-gradient-to-br from-primary/10 to-secondary/10 text-primary hover:from-primary/20 hover:to-secondary/20 hover:shadow-soft active:scale-95"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Предишен месец"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex flex-col items-center">
            <div className="font-bold text-2xl text-gray-900 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {monthNames[currentMonth.getMonth()]}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {currentMonth.getFullYear()}
            </div>
          </div>
          <button
            onClick={() => navigateMonth(1)}
            disabled={!canGoForward()}
            className={`p-2.5 rounded-xl transition-all ${
              canGoForward()
                ? "bg-gradient-to-br from-primary/10 to-secondary/10 text-primary hover:from-primary/20 hover:to-secondary/20 hover:shadow-soft active:scale-95"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Следващ месец"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-3 px-2">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1.5 px-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isPastDate = isPast(date);
            const isSelectedDate = isSelected(date);
            const isTodayDate = isToday(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => !isPastDate && handleDateSelect(date)}
                disabled={isPastDate}
                className={`
                  aspect-square rounded-xl text-sm font-semibold transition-all duration-200
                  ${isPastDate 
                    ? "text-gray-300 cursor-not-allowed bg-gray-50" 
                    : "hover:bg-gradient-to-br hover:from-primary/10 hover:to-secondary/10 cursor-pointer active:scale-95 hover:shadow-soft"
                  }
                  ${isSelectedDate 
                    ? "bg-gradient-to-br from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-md scale-105" 
                    : isTodayDate 
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-400 font-bold" 
                    : "text-gray-700"
                  }
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const displayValue = selectedDate 
    ? selectedDate.toLocaleDateString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    : "Дата";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedDate
            ? "bg-purple-50 text-purple-700 border border-purple-300"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
        }`}
      >
        <Calendar className="w-4 h-4" />
        {displayValue}
        {selectedDate && (
          <button
            onClick={handleClear}
            className="ml-1 rounded-full p-0.5 hover:bg-purple-100"
            aria-label="Премахни дата"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </button>

      {/* Calendar Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Избери дата</span>
          </div>
        }
      >
        <div className="bg-gradient-to-br from-pink-50/50 via-white to-rose-50/30 rounded-2xl p-4">
          {renderCalendar()}
        </div>
      </Modal>
    </>
  );
}

