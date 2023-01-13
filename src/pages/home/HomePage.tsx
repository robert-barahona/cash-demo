import { useEffect } from "react"
import { useDispatch } from "react-redux";
import { cashThunks } from "../../store/slices/cash/cashThunks";

export const HomePage = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(cashThunks.getConfig());

    return () => {

    }
  }, [])

  return (
    <div>HomePage</div>
  )
}
