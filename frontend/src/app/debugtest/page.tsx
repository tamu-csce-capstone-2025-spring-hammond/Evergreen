"use client";

import { useEffect } from "react";

export default function DebugTest() {
  useEffect(() => {
    console.log("useEffect triggered");
  }, []);

  console.log("Component loaded");

  return <div>Hello from DebugTest</div>;
}
