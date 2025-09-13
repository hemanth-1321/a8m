"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { providers } from "@/lib/actionProviders";

interface SidebarProps {
  onAddNode: (provider: any) => void;
}

export default function Sidebar({ onAddNode }: SidebarProps) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <Sheet>
      {/* Trigger button on right */}
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          style={{ position: "absolute", top: 10, right: 10, zIndex: 20 }}
        >
          <Plus size={40} />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Select Provider</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-2">
          {providers.map((provider: any) => {
            const Icon = provider.icon;
            return (
              <Button
                key={provider.id}
                variant={selected?.id === provider.id ? "default" : "outline"}
                className="justify-start gap-2"
                onClick={() => setSelected(provider)}
              >
                <Icon size={18} />
                <span>{provider.name}</span>
              </Button>
            );
          })}

          {selected && (
            <Button
              variant="default"
              className="mt-4"
              onClick={() => {
                onAddNode(selected);
                setSelected(null); // reset after adding
              }}
            >
              Add Node
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
