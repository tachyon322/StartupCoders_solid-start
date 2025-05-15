import { mergeProps } from "solid-js"


export default function Header(session: any) {
  return (
    <div>header: {JSON.stringify(session)}</div>
  )
}
