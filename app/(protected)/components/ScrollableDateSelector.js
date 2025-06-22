import React, { useState } from "react";
import {
  format, startOfMonth,
  endOfMonth, isSameDay, eachDayOfInterval
} from "date-fns";



const ScrollableDateSelector = ({ selectedDate,setSelectedDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
  
    // Get the start and end of the current month
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);
  
    // Generate an array of all dates in the current month
    const dates = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth,
    });
  
    // Handler for spinner change
    const handleMonthChange = (event) => {
      setIsLoading(true);
      const newMonthIndex = parseInt(event.target.value, 10);
      // Create a new date with the selected month and current year
      const newDate = new Date(currentMonth.getFullYear(), newMonthIndex, 1);
      setTimeout(() => {
        setCurrentMonth(newDate);
        setIsLoading(false);
      }, 300);
    };
  
    // Handler for year change (optional, for full flexibility)
    const handleYearChange = (event) => {
      setIsLoading(true);
      const newYear = parseInt(event.target.value, 10);
      const newDate = new Date(newYear, currentMonth.getMonth(), 1);
      setTimeout(() => {
        setCurrentMonth(newDate);
        setIsLoading(false);
      }, 300);
    };
  
    return (
      <div className="flex flex-col items-center  bg-white/40 rounded-2xl p-2 ">
        <div className="flex items-center justify-center  w-full max-w-md mb-4 ">
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            disabled={isLoading}
            className="text-lg  p-2 font-semibold rounded-xl text-black"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index} value={index}>
                {format(new Date(currentMonth.getFullYear(), index, 1), 'MMMM')}
              </option>
            ))}
          </select>
          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            disabled={isLoading}
            className="ml-4 text-lg  p-2 font-semibold rounded-xl text-black"
          >
            {Array.from({ length: 5 }).map((_, idx) => {
              const year = new Date().getFullYear() - 2 + idx;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
            

        <div className="overflow-x-scroll whitespace-nowrap py-4 px-6  no-scrollbar rounded-2xl w-full ">
        {dates.map((date) => {
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        return (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`inline-block px-4 w-14 py-2 mx-2 rounded-lg shadow-md transition ${
              isSelected
                ? "inset-shadow-2xs bg-gradient-to-r from-slate-50 via-stone-100 to-neutral-100"
                : " bg-white/50 text-gray-700 hover:bg-slate-100"
            }`}
          >
            <div className="text-sm font-semibold">{format(date, "EEE")}</div>
            <div className="text-lg">{format(date, "d")}</div>
          </button>
        );
      })}
        </div>
       
      </div>

    );
  };


  export default ScrollableDateSelector;