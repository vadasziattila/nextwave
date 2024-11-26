"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
/* import { Icons } from "@/components/icons" */
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { MenuIcon } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const platforms: { title: string; href: string; description: string }[] = [
  {
    title: "Feature One",
    href: "feauture-on",
    description: "Highlight your main feature here",
  },
  {
    title: "Feature Two",
    href: "feature-two",
    description: "Brief description of another feature",
  },
  {
    title: "Feature Three",
    href: "feature-three",
    description: "Describe another one of your features here",
  },
  {
    title: "Feature Four",
    href: "feature-four",
    description: "Add a fourth feature or even a resource here",
  },
  {
    title: "Feature Five",
    href: "feature-five",
    description: "Add another feature highlight or link to a page",
  },
];

const resources: { title: string; description: string }[] = [
  {
    title: "Authentication",
    description:
      "Configure the login, register, and forgot password for your app",
  },
  {
    title: "Posts and Pages",
    description:
      "Easily write blog articles and create pages for your application",
  },
  {
    title: "Roles and Permissions",
    description: "We utilize the bullet-proof Spatie Permissions package",
  },
  {
    title: "Scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export function Navbar() {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <DialogTitle>
            <VisuallyHidden>Navigation Menu</VisuallyHidden>
          </DialogTitle>
          <Link href="#" className="mr-6 hidden lg:flex" prefetch={false}>
            <Image src="/globe.svg" width={25} height={25} alt="logo" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          <div className="grid gap-2 py-6">
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Home
            </Link>
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              About
            </Link>
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Services
            </Link>
            <Link
              href="#"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Contact
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden lg:flex gap-24">
        <Link href="/" className="flex items-center">
          <div className="flex gap-2">
            <Image src="/globe.svg" width={25} height={25} alt="logo" />
            <p className="text-lg font-bold">logo</p>
          </div>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-3">
                  {platforms.map((platform) => (
                    <ListItem
                      key={platform.title}
                      title={platform.title}
                      className="break-all"
                    >
                      {platform.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-3 ">
                  {resources.map((resource) => (
                    <ListItem
                      key={resource.title}
                      title={resource.title}
                      className="break-all whitespace-normal"
                    >
                      {resource.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/blog" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Blog
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex gap-x-3">
          <Link href="/login">
            <Button variant="secondary">Login</Button>
          </Link>
          <Button>Sign Up</Button>
        </div>
      </div>
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
