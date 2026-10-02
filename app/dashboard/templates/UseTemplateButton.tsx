"use client";

import { useState } from "react";
import { UseTemplateDialog } from "@/components/dashboard/UseTemplateDialog";

export function UseTemplateButton({
  templateName,
  categoryLabel,
  galleryTemplateId,
  className,
}: {
  templateName: string;
  categoryLabel: string;
  galleryTemplateId?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        Use template
      </button>
      {open && (
        <UseTemplateDialog
          templateName={templateName}
          categoryLabel={categoryLabel}
          galleryTemplateId={galleryTemplateId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
