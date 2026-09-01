import type { ReactNode } from "react";
import "./PreferenceGroup.css";

type PreferenceGroupProps = {
  title: string;
  children: ReactNode;
};

export function PreferenceGroup({ title, children }: PreferenceGroupProps) {
  return (
    <fieldset className="preference-group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}
