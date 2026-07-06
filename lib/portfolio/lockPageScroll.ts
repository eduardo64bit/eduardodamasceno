/** Bloqueia rolagem da página enquanto overlay (modal/sheet) está aberto. */
export function lockPageScroll() {
  const prevBodyOverflow = document.body.style.overflow
  const prevBodyOverflowX = document.body.style.overflowX
  const prevHtmlOverflowX = document.documentElement.style.overflowX
  document.body.style.overflow = 'hidden'
  document.body.style.overflowX = 'hidden'
  document.documentElement.style.overflowX = 'hidden'

  return () => {
    document.body.style.overflow = prevBodyOverflow
    document.body.style.overflowX = prevBodyOverflowX
    document.documentElement.style.overflowX = prevHtmlOverflowX
  }
}
