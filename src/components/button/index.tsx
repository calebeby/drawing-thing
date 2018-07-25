import { h, Component } from 'preact'
import style from './style'

const Button = (props: JSX.HTMLAttributes) => (
  <button class={style.button} {...props} />
)

export default Button
