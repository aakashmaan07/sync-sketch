"use client";
import Image from "next/image";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";

interface ItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

export const Item = ({ id, name, imageUrl }: ItemProps) => {
  const { organization } = useOrganization();
  const { setActive } = useOrganizationList();

  const isActive = organization?.id === id;

  const onClick = () => {
    if (!isActive) return;
    if (isActive && setActive) setActive({ organization: id });
  };

  return (
    <div className="aspect-sqaure relative" style={{ height: "35px", width:"35px" }}>
      <Hint label={name} side="right" align="start" sideOffset={18}>
        <Image
          fill
          //sizes="(max-width: 768px) 100vw, 200px"  // image will take 100% viewport width for screen size less than 768px
          alt={name}                               // otherwise it will be 40px wide  
          src={imageUrl}
          onClick={onClick}
          className={cn(
            "rounded-md cursor-pointer opacity-75 hover:opacity-100 transition",
            isActive && "opacity-100"
          )}
        />
      </Hint>
    </div>
  );
};
