export default function FormField({ label, name, register, errors, rules, ...props }) {
  return <label className="form-field"><span>{label}</span><input {...props} {...register(name, rules)} />{errors[name] && <small className="form-error">{errors[name].message}</small>}</label>;
}
