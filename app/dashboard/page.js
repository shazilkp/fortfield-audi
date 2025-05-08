"use client";
//ac non ac,who booked,bookingtimestamp

import React, { useState, useEffect } from "react";

import HomePage from "../components/HomePage";
import CalendarPage from "../components/CalendarPage";
import BookingPage from "../components/BookingPage";

const Dashboard = () => {
  const [view,SetView] = useState("home");
  

  return (<div >
    {view === "home" && <HomePage SetView={SetView}/>}
    {view === "availability" && <CalendarPage SetView={SetView}/>}
    {view === "booking" && <BookingPage SetView={SetView}/>}
    
  </div>);
}

export default Dashboard;
