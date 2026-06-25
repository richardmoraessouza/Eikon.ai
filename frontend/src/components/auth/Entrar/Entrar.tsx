"use client";

import { useState } from "react"

import Authetication from "@/components/auth/Authetication/Authetication"

function Entrar() {
    const [verificar, setVerificar] = useState<boolean>(true)

    return (
        <>
        <Authetication verificar={verificar}/>
        </>
    )
}

export default Entrar
