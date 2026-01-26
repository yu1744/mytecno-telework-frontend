"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import NavigationMenu from "./NavigationMenu";

const MobileNavigation = () => {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px]">
                {/* 
                  SheetContent requires a DialogTitle for accessibility. 
                  Since we might not want a visible title, we can style it or put something meaningful. 
                  Here I'll add a hidden title or a simple header. 
                */}
                <div className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                </div>
                <NavigationMenu
                    className="w-full border-r-0"
                    onItemClick={() => setOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
};

export default MobileNavigation;
