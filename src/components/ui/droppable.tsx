import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";

export function Droppable({ id, children }: {
  id: UniqueIdentifier,
  children: React.ReactNode
}) {

  const { setNodeRef } = useDroppable({ id })


  return <div ref={setNodeRef} className="w-full">
    {children}
  </div>
}
