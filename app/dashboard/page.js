"use client";
//ac non ac,who booked,bookingtimestamp

import React, { useState, useEffect } from "react";
import {
  addMonths, subMonths, format, startOfMonth,
  endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, eachDayOfInterval,startOfDay,endOfDay
} from "date-fns";
import { collection, getDocs, query, where,Timestamp,getDoc,doc,setDoc,updateDoc } from "firebase/firestore";

import { db } from "@/firebase"; 

const CalendarPage = ({SetView}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState({});
  const [selectedDateData,setSelectedDateData] = useState(null);

  const ReservationCard = ({ data }) => {
   
    const { date, slot1, slot2, fullDay } = data;
  
    const renderSlot = (title, slotData) => (
        <div className="bg-white rounded-2xl p-5 shadow-inner shadow-purple-200 space-y-4 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      
          <div className="flex justify-between text-sm text-gray-700">
            <div>
              <p className="font-medium">{slotData?.name || "—"}</p>
              <p className="text-gray-500">{slotData?.mobileNo || "—"}</p>
            </div>
            <div className="text-right">
              <p>{slotData?.purpose || "—"}</p>
              <p className="text-xs text-gray-400">{slotData?.pax || 0} PAX</p>
            </div>
          </div>
      
          <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
            <span className="italic">{slotData?.bookedBy || "—"}</span>
            <span>
              {slotData?.bookingTimestamp
                ? format(slotData.bookingTimestamp.toDate(), "d MMM yyyy, h:mm a")
                : "—"}
            </span>
          </div>
        </div>
      );
      
  
      return (
        <div className=" flex flex-col max-w-lg mx-auto my-6 p-4 bg-gradient-to-b from-zinc-200 to-slate-50 rounded-2xl shadow-2xl space-y-11 border border-gray-200 min-w-xs">
          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {format(date.toDate(), "d MMMM yyyy")}
            </h2>
            <button
                onClick={() => setSelectedDateData(null)}
                className=" text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
          </div>
  
          {renderSlot("Slot 1", slot1)}
          {renderSlot("Slot 2", slot2)}
          {renderSlot("Full Day", fullDay)}
        </div>
      );
  };

  const fetchReservations = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    console.log(start,end)

    const q = query(
      collection(db, "reservations"),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<=", Timestamp.fromDate(end)),
    
    );

    const snapshot = await getDocs(q);
    const resMap = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateStr = format(data.date.toDate(), "yyyy-MM-dd");
      resMap[dateStr] = data; // You can store full doc if needed
    });

    setReservations(resMap);
    console.log(resMap)
  };

  useEffect(() => {
    fetchReservations();
  }, [currentMonth]);

  const header = () => (
    <div className="flex justify-between items-center mb-6">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</button>
      <h2 className="text-xl font-semibold text-gray-700">
        {format(currentMonth, "MMMM yyyy")}
      </h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</button>
    </div>
  );

  const daysOfWeek = () => {
    const start = startOfWeek(currentMonth);
    return (
      <div className="grid grid-cols-7 mb-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="text-center text-xs uppercase text-[#003e3e]">
            {format(addDays(start, i), "EEE")}
          </div>
        ))}
      </div>
    );
  };

  



  const calendarCells = (setSelectedDateData) => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, "yyyy-MM-dd");
        const res = reservations[dateStr];
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        let textColor = "text-black"
        
        if(!isCurrentMonth){
          textColor = "text-gray-400"
        }
        let bgColor = "bg-white";
        let topColor = "bg-white";
        let bottomColor = "bg-white"

        
        if (res?.fullDay && (res?.fullDay.name || res?.fullDay.mobileNo)) {
          topColor = "bg-red-500";  
          bottomColor = "bg-red-500";  
        }    // both slots booked
        if (res?.slot1 && (res?.slot1.name || res?.slot1.mobileNo)) topColor = "bg-yellow-400"; // one slot booked
        if (res?.slot2 && (res?.slot2.name || res?.slot2.mobileNo)) bottomColor = "bg-green-400";
        if (isToday) bgColor += " ring-2 ring-red";

        days.push(
          <div key={day} onClick={() => {setSelectedDateData(res)}} className={`relative text-center py-2 rounded-xl ${bgColor} text-sm min-h-10 overflow-hidden`}>
            {/* Top Half */}
            <div className={`absolute top-0 left-0 w-full  h-1/2 flex justify-center ${topColor} items-center`}>
              {/* Optional: You can add top content here */}
            </div>

            {/* Bottom Half */}
            <div className={`absolute bottom-0 left-0 w-full h-1/2 flex justify-center ${bottomColor} items-center`}>
              {/* Optional: You can add bottom content here */}
            </div>

            {/* Centered Text */}
            <div className={`absolute inset-0 flex justify-center ${textColor} items-center`}>
              {format(day, "d")}
            </div>
          </div>

        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-2 mb-2" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="relative">
     
      <div
        className={`flex flex-col justify-center max-w-md mx-auto px-4 font-sans min-h-screen transition-all duration-300 ${
          selectedDateData ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <button onClick={() => SetView("home")} className="p-8 absolute top-0 right-0 text-gray-500 hover:text-red-500">
          ✕
        </button>
        <div className="shadow-2xl p-4 rounded-2xl bg-white">
          {header()}
          {daysOfWeek()}
          {calendarCells(setSelectedDateData)}
        </div>
      </div>

      {/* Overlayed Reservation Card */}
      {selectedDateData && (
        
            <div className="fixed inset-0 flex justify-center items-center">
            <ReservationCard data={selectedDateData} />
            </div>

            
          
        
      )}
    </div>

  );



}

const HomePage = ({SetView}) => {
  return (<div className="flex flex-col p-36 justify-center min-h-screen space-y-10">
    <button onClick= {() => SetView("availability")} type="button" className="py-2.5 px-10  text-base font-medium text-gray-700 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">View Availability</button>
    <button onClick= {() => SetView("booking")} type="button" className="py-2.5 px-  text-m font-medium text-gray-700 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-[#32CD32] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Book Slot</button>
  </div>);
}

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
      <div className="flex flex-col items-center m-4">
        <div className="flex items-center justify-center w-full max-w-md mb-4 ">
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            disabled={isLoading}
            className="text-lg font-semibold text-slate-700"
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
            className="ml-4 text-lg font-semibold text-slate-700"
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
            

        <div className="overflow-x-scroll whitespace-nowrap py-4 px-6 bg-gray-100 rounded-lg w-screen md:w-[50rem]">
        {dates.map((date) => {
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        return (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`inline-block px-4 py-2 mx-2 rounded-lg shadow-md transition ${
              isSelected
                ? "bg-blue-500 text-white"
                : "bg-white text-black hover:bg-blue-500 hover:text-white"
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

  const saveReservation = async (selectedDate, slot, phone,purpose,pax,ac,name) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const docRef = doc(db, "reservations", formattedDate);
    let slotKey= "";
    if(slot === 1){
        slotKey = "slot1";
    }
    if(slot == 2){
        slotKey = "slot2";
    }
    if(slot == 3){
        slotKey = "fullDay";
    }
  
    try {
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        // Create the document with empty slot objects
        await setDoc(docRef, {
          date: Timestamp.fromDate(selectedDate),
          slot1: {},
          slot2: {},
          fullDay: {},
        });
      }
  
      // Update only the specified slot
      await updateDoc(docRef, {
        [slotKey]: {
          mobileNo: phone,
          name: name,
          pax: pax,
          purpose: purpose,
          bookingTimestamp: Timestamp.fromDate(new Date()),
          bookedBy: "Salim",
          ac: ac
        },
      });
  
      console.log("Reservation saved successfully");
    } catch (error) {
      console.error("Error saving reservation:", error);
    }
  };


  const BookingCard = ({ selectedDate,setSelectedDate, data, onBook }) => {
    //console.log(data);
    const [phone, setPhone] = useState("");
    const [purpose,setPurpose] = useState("");
    const [pax,setPax] = useState(0);
    const [ac,setAc] = useState(false);
    const [name,setName] = useState("");

    const [selectedSlot, setSelectedSlot] = useState(null);
  
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    console.log("hey",data);
  
    const isSlotBooked = (slot) =>{
        if(!data){
            return false;
        }
        
        if(slot === 1){
            if(data.slot1?.name || data.slot1?.mobileNo){
                return true;
            }
            if(data.fullDay?.name || data.fullDay?.mobileNo){
                return true;
            }
            else{
                return false;
            }
        }

        if(slot === 2){
            if(data.slot2?.name || data.slot2?.mobileNo){
                return true;
            }
            if(data.fullDay?.name || data.fullDay?.mobileNo){
                return true;
            }
            else{
                return false;
            }
        }

        if(slot === 3){
            if(data.fullDay?.name || data.fullDay?.mobileNo){
                return true;
            }
            else{
                if(isSlotBooked(1) || isSlotBooked(2)){
                    return true;
                }
                return false;
            }
        }
    }
        
    const handleBooking = () => {
      if (!phone || !selectedSlot) return;
      onBook(selectedDate,selectedSlot, phone,purpose,pax,ac,name );
      setPhone("");
      setSelectedSlot(null);
    };
  
    return (
  <div className="bg-gradient-to-bl from-zinc-200 to-slate-50 p-6 rounded-3xl shadow-lg max-w-sm mx-auto space-y-6 text-gray-800">
    <h2 className="text-2xl font-semibold tracking-tight relative">
      Book Slot <span className="block text-base text-gray-500">{format(selectedDate, "PPP")}</span>
      <button
        onClick={() => setSelectedDate(null)}
        className="p-4 absolute top-0 right-0 text-gray-500 hover:text-red-500"
      >
        ✕
      </button>
    </h2>

    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 shadow-inner space-x-2">
        {[1, 2, 3].map((slot) => {
          const label = slot === 3 ? "Full Day" : `Slot ${slot}`;
          return (
            <button
              key={slot}
              disabled={isSlotBooked(slot)}
              onClick={() => setSelectedSlot(slot)}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                isSlotBooked(slot)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : selectedSlot === slot
                  ? "bg-gradient-to-tr from-slate-400 to-zinc-900 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <span className="px-2.5 py-1 text-xs text-red-400">
        {isSlotBooked(1) && isSlotBooked(2) && isSlotBooked(3) ? "All slots are full" : ""}
      </span>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Name</label>
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-inner"
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Phone Number</label>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-inner"
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Purpose</label>
      <select
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <option value="">Select purpose</option>
        <option value="meeting">Meeting</option>
        <option value="event">Event</option>
        <option value="class">Class</option>
      </select>
    </div>

    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">AC Required</label>
      <input
        type="checkbox"
        checked={ac}
        onChange={() => setAc(!ac)}
        className="w-5 h-5 accent-purple-600"
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Number of Extra People (Pax)</label>
      <input
        type="number"
        value={pax}
        onChange={(e) => setPax(e.target.value)}
        min="1"
        className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>

    <button
      onClick={handleBooking}
      disabled={!phone || !selectedSlot || !name || !purpose}
      className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-slate-400 to-zinc-900 hover:from-slate-500 hover:to-zinc-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Book Slot
    </button>
  </div>
);

      
  }

  const BookingPage = ({ SetView }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateData, setSelectedDateData] = useState(null);
    const handleDateSelect = (date) => {
      console.log("Selected:", date);
    };

    const fetchReservations = async () => {
        if(!selectedDate){
            setSelectedDateData(null);
        }
        
        console.log("world")
        const start = Timestamp.fromDate(startOfDay(selectedDate));
        const end = Timestamp.fromDate(endOfDay(selectedDate));

        const q = query(
        collection(db, "reservations"),
        where("date", ">=", start),
        where("date", "<=", end)
        );

        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            const data = doc.data();
            
            setSelectedDateData(data);
        });

    };

    useEffect(() => {
        
        fetchReservations();
        
    }, [selectedDate])
  
    return (
        <div className="flex flex-col  justify-center w-screen relative">
            
            <div
            className={`flex flex-col justify-center mx-auto px-4 font-sans min-h-screen transition-all duration-300 ${
                selectedDate ? "blur-sm pointer-events-none select-none" : ""
            }`}
            >
            <button onClick={() => SetView("home")} className="p-8 absolute top-0 right-0 text-gray-500 hover:text-red-500">
                ✕
            </button>
            <ScrollableDateSelector setSelectedDate={setSelectedDate} selectedDate={selectedDate}/>
            </div>

            
            {selectedDate && (
            
                <div className="fixed inset-0 flex justify-center items-center">
                <BookingCard
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    data={selectedDateData}
                    onBook={(selectedDate,selectedSlot, phone,purpose,pax,ac,name ) => {
                        // Call Firestore or API here
                        saveReservation(selectedDate,selectedSlot, phone,purpose,pax,ac,name);
                       
                    }}
                />
                </div>
            )}
        </div>
    );

    return(<div className="flex flex-col p-36 justify-center min-h-screen space-y-10">
        <ScrollableDateSelector setSelectedDate={setSelectedDate} selectedDate={selectedDate}/>
        <BookingCard
        selectedDate={selectedDate}
        bookings={[{ date: "2025-05-07", slot: 1, phone: "9876543210" }]}
        onBook={(booking) => {
            // Call Firestore or API here
            console.log("Booking created:", booking);
        }}
        />
      </div>);
  };

const Dashboard = () => {
  const [view,SetView] = useState("home");
  

  return (<div >
    {view === "home" && <HomePage SetView={SetView}/>}
    {view === "availability" && <CalendarPage SetView={SetView}/>}
    {view === "booking" && <BookingPage SetView={SetView}/>}
    
  </div>);
}

export default Dashboard;
