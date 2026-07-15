'use client'

import CreateCharacter from "@/components/character/CreateCharacter/CreateCharacter";

export default function Page() {
  return (
    <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CreateCharacter />
    </div>
  );
}