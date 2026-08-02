export default function Benefit({ icon: Icon, title, text }) {
  return <article className="benefit"><span><Icon size={24}/></span><div><h3>{title}</h3><p>{text}</p></div></article>;
}
