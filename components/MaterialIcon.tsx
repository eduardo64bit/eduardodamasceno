interface Props {
  name: 'dark_mode' | 'light_mode' | 'logout'
}

export function MaterialIcon({ name }: Props) {
  return (
    <span className="material-symbols-outlined" aria-hidden>
      {name}
    </span>
  )
}
