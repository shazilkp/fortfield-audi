import React, { useState, useEffect,useMemo } from "react";
import { useRouter,usePathname,useParams } from "next/navigation";
import {
  format, startOfMonth,
  endOfMonth, isSameDay, eachDayOfInterval,startOfDay,endOfDay
} from "date-fns";
import { collection, getDocs, query, where,Timestamp,getDoc,doc,setDoc,updateDoc } from "firebase/firestore";
import { db } from "@/firebase"; 

import ScrollableDateSelector from "./ScrollableDateSelector";

  const cancelSlot = async (selectedDate, slot,setShowModal) => {
    const slotKey = slot == 3 ? "fullDay" : `slot${slot}`;
    console.log(selectedDate,slotKey)
    const reservationId = format(selectedDate, "yyyy-MM-dd");
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        [slotKey]: {}, // set the field to an empty object
      });
      console.log(`Slot "${slotKey}" reset to empty object.`);
      setShowModal(reservationId);
    } catch (error) {
      console.error("Error updating slot: ", error);
      setShowModal(reservationId);
    }
  };


  const CancelCard = ({ selectedDate,setSelectedDate, data, onCancel }) => {

    const [showModal, setShowModal] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const router = useRouter();
    const params = useParams();

    // Extract date and slot from the URL
    const { date, slot } = params;
    const isDetailedRoute = date && slot;

    //console.log(searchParams?.has("date"))

  
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    //console.log("hey",data);

    const renderSlot = (date, data, slotNo) => {
        const slotKey = slotNo == 3 ? "fullDay" : `slot${slotNo}`;
        const slotData = data ? slotNo ? data[slotKey] : {} : {};
        console.log("trrr",slotKey)

        return(
            <div className="bg-white rounded-2xl p-5 shadow-inner shadow-purple-200 space-y-4 border border-gray-100">
                <span className="flex flex-row justify-between items-center">
                    <p className="text-slate-500 text-xs ">{slotData?.bookingId || "—"}</p>
                </span>
              
          
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
                    ? format(slotData?.bookingTimestamp.toDate(), "d MMM yyyy, h:mm a")
                    : "—"}
                </span>
              </div>
             
              
            </div>
          );
        };
  
    const isSlotNotBooked = (slot) =>{
        if(!data){
            return true;
        }
        
        if(slot === 1){
            if(data.slot1?.name || data.slot1?.mobileNo){
                return false;
            }

            
            else{
                return true;
            }
        }

        if(slot === 2){
            if(data.slot2?.name || data.slot2?.mobileNo){
                return false;
            }
            
            else{
                return true;
            }
        }

        if(slot === 3){
            if(data.fullDay?.name || data.fullDay?.mobileNo){
                return false;
            }
            else{
                
                return true;
            }
        }
    }
        
    const handleCancel = () => {
      if (!selectedDate || !selectedSlot) return;
      onCancel(selectedDate,selectedSlot,setShowModal );
      setSelectedDate(null);
      setSelectedSlot(null);
    };

    useEffect(()=> {
        const slotNo = Number(slot); // → NaN
        
        if(date){
            setSelectedDate(new Date(date));
        }
        if (!isNaN(slotNo)) {
            setSelectedSlot(slotNo);
            console.log("slot just selected on params",slotNo)
        }
        
    },[params])

    useEffect(() => {
        if(!isDetailedRoute){
            console.log(selectedDate);
            console.log("trigered")
        }
    },[selectedDate,isDetailedRoute])
  
    return (
        <div>
        <div className={`bg-gradient-to-bl from-zinc-200 to-slate-50 p-6 rounded-3xl shadow-lg max-w-sm mx-auto space-y-6 text-gray-800 transition-all duration-300 ${
                showModal ? "blur-sm pointer-events-none select-none" : ""
                }`}>
    
    <h2 className="text-2xl font-semibold tracking-tight relative">
      Cancel Slot <span className="block text-base text-gray-500">{selectedDate?format(selectedDate, "PPP"):"         "}</span>
      
    </h2>
    {!isDetailedRoute && <ScrollableDateSelector setSelectedDate={setSelectedDate} selectedDate={selectedDate}/>}
    
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 shadow-inner space-x-2">
        {[1, 2, 3].map((slot) => {
          const label = slot === 3 ? "Full Day" : `Slot ${slot}`;
          const slotKey = slot === 3 ? "fullDay" : `slot${slot}`;
          const name = data ? data[slotKey]?.name:" " ;
          return (
            <button
              key={slot}
              disabled={isSlotNotBooked(slot)}
              onClick={() => setSelectedSlot(slot)}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 flex flex-col ${
                isSlotNotBooked(slot)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : selectedSlot === slot
                  ? "bg-gradient-to-tr from-slate-400 to-zinc-900 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-slate-100"
              }`}
            >
              <span>{label}</span>
              <span className="text-xs">{name}</span>
            </button>
          );
        })}
      </div>
      <span className="px-2.5 py-1 text-xs text-red-400">
        {isSlotNotBooked(1) && isSlotNotBooked(2) && isSlotNotBooked(3) ? "No booking to cancel" : ""}
      </span>
    </div>







    {renderSlot(selectedDate,data,selectedSlot)}
    

    <button
      onClick={handleCancel}
      disabled={!selectedSlot || !selectedDate}
      className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-slate-400 to-zinc-900 hover:from-slate-500 hover:to-zinc-950 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Cancel Slot
    </button>



    






  </div>
  {showModal && (
  <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-lg text-center space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Booking Confirmed</h3>
      <p className="text-sm text-gray-600">Slot {showModal} has been successfully cancelled .</p>
      <button
        onClick={() => {
            setShowModal(false);
            setSelectedDate(null);
            if(isDetailedRoute){
                router.push("/dashboard")
            }
            


        }}
        className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-slate-400 to-zinc-900 text-white font-medium hover:from-slate-500 hover:to-zinc-950 transition"
      >
        Close
      </button>
    </div>
  </div>
)}
  </div>
);

      
  }

  const CancelPage = ({ SetView }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateData, setSelectedDateData] = useState(null);


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
        setSelectedDateData(null);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(data)
            setSelectedDateData(data);
        });

    };

    useEffect(() => {
        
        fetchReservations();
        
    }, [selectedDate])

    return (
        <div className="">
                <CancelCard
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    data={selectedDateData}
                    onCancel={(selectedDate,selectedSlot,setShowModal ) => {
                        // Call Firestore or API here
                        
                        cancelSlot(selectedDate,selectedSlot,setShowModal);
                       
                    }}
                />
                </div>
    );

  };


  export default CancelPage;