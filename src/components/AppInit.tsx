'use client'

import { ReactNode, useEffect, useState } from "react";
import { useCharacterEditorStore } from "./store";


export default function AppInit({ children }: { children: ReactNode }) {
  const [initialize, setInitialize] = useState(false)
  const initStore = useCharacterEditorStore(s => s.init)
  useEffect(() => {
    const init = async () => {
      if (initialize) return
      await initStore()
      setInitialize(true)
    }
    init()
  }, [initStore, setInitialize, initialize])
  if (!initialize) {
    return (
      <>loading..</>
    )
  } else {
    return (<>
      {children}
    </>)
  }
}