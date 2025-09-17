import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

function AddTodoForm({ placeholder = 'Новая задача', onSubmit, onCancel }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm"
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      <div className="flex items-center gap-1">
        <button
          type="submit"
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600"
          aria-label="Сохранить"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
          aria-label="Отменить"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export default AddTodoForm;
