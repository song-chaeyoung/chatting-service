"use client";

import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatManagement from "@/components/ChatManagement";

export default function Home() {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const savedUserName = localStorage.getItem("chatUserName");
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  const handleUserNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem("chatUserName", name);
  };

  if (!userName) {
    return <WelcomeScreen onUserNameSet={handleUserNameChange} />;
  }

  return (
    <ChatManagement
      userName={userName}
      onUserNameChange={handleUserNameChange}
    />
  );
}
