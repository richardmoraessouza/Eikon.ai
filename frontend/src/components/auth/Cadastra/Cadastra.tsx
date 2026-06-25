"use client";

import { useState } from "react"
import Authetication from "@/components/auth/Authetication/Authetication"

function Cadastra() {
    const [verificar, setVerificar] = useState<boolean>(false)

    return (
            <Authetication verificar={verificar}/>
    )
}

export default Cadastra
