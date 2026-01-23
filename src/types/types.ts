import React from "react";

export type SubItem = {
  name: string;
  path: string;
  pro: boolean;
};

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};
