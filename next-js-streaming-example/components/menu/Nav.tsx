import Link from "next/link";

export function Nav() {
  return (
    <div>
      <div className="flex w-full items-center justify-between px-10 py-5 md:w-auto md:rounded-full">
        <Link href="/">
          <>
            <img className="dark:hidden" src="/hueman-logo.svg" alt="HUEMN logo" width={110} height={26} />
            <img
              className="hidden dark:block"
              src="/hueman-logo-dark.png"
              alt="HUEMN logo (dark)"
              width={110}
              height={26}
              onError={(e) => {
                // Fallback to the SVG if the dark PNG is missing or invalid
                const img = e.currentTarget as HTMLImageElement;
                img.onerror = null;
                img.src = "/hueman-logo.svg";
              }}
            />
          </>
        </Link>

        <div className="text-xs hidden md:block lg:text-sm">
          <NavItem route="/" name="Home" />
          <NavItem route="/multimodel" name="Multi-Model" />
          <NavItem route="/face" name="Facial Expression" />
          <NavItem route="/burst" name="Vocal Burst" />
          <NavItem route="/prosody" name="Speech Prosody" />
          <NavItem route="/language" name="Written Language" />
        </div>
      </div>

      <div className="w-full border-b-2 border-neutral-200 dark:border-neutral-800"></div>
    </div>
  );
}

type NavItemProps = {
  route: string;
  name: string;
};

function NavItem({ route, name }: NavItemProps) {
  return (
    <Link href={route} className="mr-2 py-2 rounded-full px-3 hover:bg-neutral-200 dark:hover:bg-neutral-800 duration-200 hover:ease-linear">
      <div className="block font-medium text-neutral-800 dark:text-neutral-100 md:inline-block">{name}</div>
    </Link>
  );
}
