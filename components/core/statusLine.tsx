"use client";
import { ActivityIcon, Clock, Database, Server, Users } from "lucide-react";
import { useEffect, useState } from "react";

function StatusLine() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };
  return (
    <div
      className="
      h-8
      px-4
      py-4
     flex 
     items-center 
     gap-6 
     text-base 
     font-poppins 
     border-t 
     tracking-wide"
    >
      {/* Last query executed */}
      <div className="flex items-center gap-2">
        <ActivityIcon className="w-3.5 h-3.5 text-emerald-500" />
        <span>
          Last query: <span className="text-emerald-500">125ms</span>
        </span>
      </div>

      {/* Connection Name */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Database className="w-3.5 h-3.5" />
        <span>PostgreSQL 15.3</span>
      </div>

      {/* HostName  */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Server className="w-3.5 h-3.5" />
        <span>Localhost:5432</span>
      </div>

      {/* Connection Name */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-3.5 h-3.5" />
        <span>productionDB</span>
      </div>

      <div className="flex-1" />

      <div className="w-[2px] h-4 bg-border" />
      {/* Clock */}
      <div className="flex flex-end items-center gap-2 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>{formatTime(currentTime)}</span>
      </div>
    </div>
  );
}

export { StatusLine };
