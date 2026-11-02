import { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (/^\S+@\S+\.\S+$/.test(email)) {
      setSuccess(true);
      setEmail('');
    }
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <div className="newsletter-input-wrap">
        <Mail size={18} className="newsletter-icon" />
        <input 
          aria-label="Email address" 
          required 
          type="email" 
          placeholder="Enter your email address..." 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button className="button primary newsletter-submit-btn" type="submit">
        {success ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Subscribed!
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Subscribe <ArrowRight size={15} />
          </span>
        )}
      </button>
    </form>
  );
}
