import type { AnchorHTMLAttributes, ReactNode } from "react";
import { hashFor } from "./routes";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; children?: ReactNode };

export default function Link({ href, children, ...rest }: Props) {
  return (
    <a href={hashFor(href)} {...rest}>
      {children}
    </a>
  );
}
