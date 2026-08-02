import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  return <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); if (/^\S+@\S+\.\S+$/.test(email)) setSuccess(true); }}><input aria-label="Email address" required type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)}/><button className="button dark" type="submit">{success ? 'You\'re on the list' : 'Subscribe'}</button></form>;
}
