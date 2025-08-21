'use client'

import { DexieType, db } from "@/db/schema"
import { createContext, ReactNode, useContext } from "react"

const DexieContext = createContext<DexieType | undefined>(undefined)

export function DexieProvider({children}: {children: ReactNode}){
  return (
    <DexieContext.Provider value={db}>
      {children}
    </DexieContext.Provider>
  )
}

export function useDB(){
  const context = useContext(DexieContext)
  if (!context){
    throw new Error('useDB must be used within a Provider')
  }
  return context
}