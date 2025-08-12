"use client"

import { useEffect } from "react"
import { registerLicense } from "@syncfusion/ej2-base"

export function LicenseProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_SYNCFUSION_KEY ?? "";
        console.log("Registering Syncfusion key", key ? "found" : "missing");
        registerLicense(key);  
    }, []);

    return <>{children}</>;
}

