import type { StaffRole } from "@prisma/client";
import { canChangeNote } from "@/lib/recordRules";
import { deleteNoteAction, updateNoteAction } from "@/app/(admin)/admin/records/actions";
import { ConfirmButton, EditBox } from "./RecordControls";

// Edit and delete for one timeline note. Shows nothing when this person may not change it.
export default function NoteControls({ note, staff, back }: { note: { id: string; kind: string; body: string; byId: string | null }; staff: { id: string; role: StaffRole }; back: string }) {
  if (!canChangeNote(staff, note)) return null;
  return (
    <div className="mt-1 flex w-full flex-wrap items-start gap-3">
      <form action={deleteNoteAction}><input type="hidden" name="id" value={note.id} /><input type="hidden" name="back" value={back} /><ConfirmButton label="Delete" message="Delete this note? This cannot be undone." /></form>
      <div className="min-w-0 flex-1">
        <EditBox>
          <form action={updateNoteAction} className="space-y-2"><input type="hidden" name="id" value={note.id} /><input type="hidden" name="back" value={back} />
            <textarea name="body" required minLength={2} maxLength={2000} rows={3} defaultValue={note.body} aria-label="Note text" className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-ailu-cream" />
            <button className="rounded-lg border border-ailu-yellow/60 px-3 py-1 text-xs font-semibold text-ailu-yellow">Save note</button>
          </form>
        </EditBox>
      </div>
    </div>
  );
}
