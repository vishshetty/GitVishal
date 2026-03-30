import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function PasswordInput({ value, onChange, placeholder, savedHint }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div className="password-wrapper">
        <input
          type={visible ? 'text' : 'password'}
          className="form-control"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible(!visible)}
          tabIndex={-1}
          title={visible ? 'Hide' : 'Show'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {savedHint && !value && (
        <div className="saved-hint">
          <ShieldCheck size={12} /> Saved securely. Leave blank to keep current value.
        </div>
      )}
    </>
  );
}
