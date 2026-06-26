import { useState } from "react";
import {RoleContext} from "./RoleContext";

export default function RoleProvider({ children }) {
  const [role, setRole] = useState("patient");

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}