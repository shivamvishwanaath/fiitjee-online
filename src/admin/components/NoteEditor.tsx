import React, { useState } from 'react';
import { MessageSquare, Plus, Clock, User } from 'lucide-react';
import { RegistrationNote } from '../../types';

interface NoteEditorProps {
  notes?: RegistrationNote[];
  onAddNote: (text: string) => Promise<void>;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ notes = [], onAddNote }) => {
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setSubmitting(true);
    try {
      await onAddNote(newText.trim());
      setNewText('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#ED1C24]" />
          <h4 className="font-bold text-sm text-[#002147] uppercase tracking-wide">Internal Staff Notes</h4>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">{notes.length} notes</span>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={2}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add internal remark (e.g. Called parent, interested in Weekend batch, fee waiver requested)..."
          className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newText.trim()}
            className="bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{submitting ? 'Saving...' : 'Add Remark'}</span>
          </button>
        </div>
      </form>

      {/* Notes timeline */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-3">No internal notes recorded yet.</p>
        ) : (
          notes.map((note, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <p className="text-slate-800 leading-relaxed font-medium">{note.text}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <User className="w-3 h-3" />
                  {note.addedBy}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(note.addedAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
