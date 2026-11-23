import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { searchPeople } from "../state/peopleSlice"

export function usePeopleSearch() {
  const dispatch = useDispatch()
  const { query, results, loading, nextCursor, loadedQuery } = useSelector((state) => state.people)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (loadedQuery !== query) dispatch(searchPeople({ query }))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [dispatch, query, loadedQuery])
  return { query, results, loading, nextCursor, searchMore: () => nextCursor !== null && dispatch(searchPeople({ query, cursor: nextCursor })) }
}
