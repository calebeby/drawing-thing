import { h } from 'preact'

interface Props {
  icon: string
}

const Icon = ({ icon }: Props) => (
  <svg viewBox="0 0 24 24" style="width:24px;height:24px">
    <path d={icon} />
  </svg>
)

export default Icon
