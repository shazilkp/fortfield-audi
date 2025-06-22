"use client";
//ac non ac,who booked,bookingtimestamp

import React, { useState, useEffect } from "react";

import CalendarPage from "../components/CalendarPage";
const Dashboard = () => {
  const [view,SetView] = useState("home");
  

  return (
    
  <div >
    <title></title>
      <CalendarPage SetView={SetView}/>
    
  </div>);
}

export default Dashboard;
