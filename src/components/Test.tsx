import { useCash } from "../hooks/useCash";

export const Test = () => {

  console.log('DE NUEVO')

  const { connected } = useCash();

  return (
    <div>{connected ? 'Si' : 'No'}</div>
  )
}
