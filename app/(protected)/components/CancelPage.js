import React, { useState, useEffect,useMemo } from "react";
import { useRouter,usePathname,useParams } from "next/navigation";
import {
  format, startOfMonth,
  endOfMonth, isSameDay, eachDayOfInterval,startOfDay,endOfDay
} from "date-fns";
import { collection, getDocs, query, where,Timestamp,getDoc,doc,setDoc,updateDoc } from "firebase/firestore";
import { db } from "@/firebase"; 
import { writeBatch } from "firebase/firestore"; 

import ScrollableDateSelector from "./ScrollableDateSelector";

const cancelSlot = async (selectedDate, slot, setShowModal) => {
    const slotKey = slot === 3 ? "fullDay" : `slot${slot}`;
    //console.log(selectedDate, slotKey);
    const reservationId = format(selectedDate, "yyyy-MM-dd");
  
  
    // Start a new batch for write operations
    const batch = writeBatch(db);
  
    const reservationRef = doc(db, "reservations", reservationId);
  
    try {
      // Get the reservation document to retrieve the bookingIndex
      const reservationSnap = await getDoc(reservationRef);
  
      if (reservationSnap.exists()) {
        // Extract the bookingIndex from the specified slot
        const slotData = reservationSnap.data()[slotKey];
        const bookingIndex = slotData?.bookingId;
  
        if (bookingIndex) {
          // Prepare the reference to the corresponding document in the bookingIndex collection
          const bookingIndexRef = doc(db, "bookingsIndex", bookingIndex);
  
          // Add a delete operation to remove the booking index document
          batch.delete(bookingIndexRef);
        }
  
        // Add the update operation to reset the slot in the reservations collection
        batch.update(reservationRef, {
          [slotKey]: {}, // set the slot field to an empty object
        });
  
        // Commit the batch, ensuring atomicity
        await batch.commit();
  
        console.log(`Slot "${slotKey}" reset to empty object.`);
        setShowModal(reservationId);
      } else {
        console.log("Reservation not found.");
      }
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
        //console.log("trrr",slotKey)

        return(
            <div className="backdrop-blur-md text-white rounded-2xl p-5 inset-shadow-2xs space-y-4 border border-white/20">
                <span className="flex flex-row justify-between items-center">
                    <p className="text-xs text-gray-200">{slotData?.bookingId || "—"}</p>
                </span>
              
          
              <div className="flex justify-between text-sm ">
                <div>
                  <p className="text-lg font-bold text-white">{slotData?.name || "—"}</p>
                  <p className="text-md">{slotData?.mobileNo || "—"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold ">{slotData?.purpose || "—"}</p>
                  <p className="text-xs ">{slotData?.pax || 0} PAX</p>
                </div>
              </div>
          
              <div className="flex justify-between items-center text-xs border-t text-gray-200 border-white/30 pt-3">
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
            //console.log("slot just selected on params",slotNo)
        }
        
    },[params])

    
  
    return (
        <div>
        <div className={`backdrop-blur-xl bg-white/20 p-6 rounded-3xl shadow-lg max-w-sm mx-auto space-y-6 text-gray-800 transition-all duration-300 ${
                showModal ? "blur-sm pointer-events-none select-none" : ""
                }`}>
    
    <h2 className="text-2xl text-white font-semibold tracking-tight relative">
      Cancel Slot <span className="block text-base text-white/70">{selectedDate?format(selectedDate, "PPP"):"         "}</span>
      
    </h2>
    {!isDetailedRoute && <ScrollableDateSelector setSelectedDate={setSelectedDate} selectedDate={selectedDate}/>}
    
    <div className="flex flex-col space-y-2 min-w-80">
      <div className="flex justify-between items-center backdrop-blur-md rounded-full border border-white/20 px-4 py-3 shadow-inner space-x-2">
        {[1, 2, 3].map((slot) => {
          const label = slot === 3 ? "Full Day" : `Slot ${slot}`;
          const slotKey = slot === 3 ? "fullDay" : `slot${slot}`;
          const name = data ? data[slotKey]?.name:" " ;
          return (
            <button
              key={slot}
              disabled={isSlotNotBooked(slot)}
              onClick={() => setSelectedSlot(slot)}
              className={`text-sm  font-medium px-6 py-3 rounded-full transition-all duration-200 flex flex-col ${
                isSlotNotBooked(slot)
                  ? "bg-black/20 text-gray-400 cursor-not-allowed"
                  : selectedSlot === slot
                  ? "bg-white  shadow-md border border-white/40"
                  : "bg-white/30  shadow-md  text-gray-700 hover:bg-white/50"
              }`}
            >
            <span>{label}</span>
            <span className="text-xs font-semibold">{name}</span>
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
      className="w-full py-3 rounded-full font-semibold text-black bg-white hover:bg-white/40 hover:text-white  transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Cancel Slot
    </button>



    






  </div>
  {showModal && (
  <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white/40 rounded-3xl p-8 max-w-sm w-full shadow-lg text-center space-y-4 backdrop-blur-sm">
      <h3 className="text-xl font-semibold text-black">Cancel Confirmed</h3>
      <p className="text-sm text-gray-900">Slot {showModal} has been successfully cancelled .</p>
      <button
        onClick={() => {
            setShowModal(false);
            setSelectedDate(null);
            if(isDetailedRoute){
                router.push("/dashboard")
            }
            


        }}
        className="mt-4 px-6 py-2 rounded-full bg-white text-black font-semibold hover:text-white hover:bg-white/40 transition"
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
        
        //console.log("world")
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
            //console.log(data)
            setSelectedDateData(data);
        });

    };

    useEffect(() => {
        
        fetchReservations();
        
    }, [selectedDate])

    return (
        <div className="bg-center bg-cover bg-repeat-space flex flex-col justify-center items-center  h-max min-h-screen"
        style={{ backgroundImage: "url('/3.png')" }}>
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