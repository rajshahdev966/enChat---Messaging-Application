import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import Icon from "../../../../shared/ui/Icon"
import ProfilePhoto from "../../../auth/ui/components/ProfilePhoto"
import { loadPerson, fetchContacts, fetchPendingContacts, fetchBlockedUsers, connectPerson, approvePerson, removePerson, blockPerson, unblockPerson } from "../../state/peopleSlice"
import { openConversation } from "../../../conversations/state/conversationSlice"

export default function PersonProfilePage() {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [actionError, setActionError] = useState("")
  const { selected, profileLoading, profileError, contacts, pending, blockedIds } = useSelector((state) => state.people)
  const person = selected?.user?.id === userId ? selected.user : null
  const isSelf = selected?.user?.id === userId && selected.isSelf
  const contact = useMemo(() => contacts.find((item) => item.id === userId), [contacts, userId])
  const request = useMemo(() => pending.find((item) => item.id === userId), [pending, userId])
  const blocked = blockedIds.includes(userId)

  useEffect(() => {
    const request = dispatch(loadPerson(userId))
    dispatch(fetchContacts())
    dispatch(fetchPendingContacts())
    dispatch(fetchBlockedUsers())
    return () => request.abort()
  }, [dispatch, userId])

  const run = async (action) => {
    setActionError("")
    const result = await dispatch(action)
    if (result.error) setActionError(result.payload?.message || "This action could not be completed.")
    return result
  }
  const message = async () => {
    const result = await run(openConversation(person))
    if (openConversation.fulfilled.match(result)) navigate(`/app/conversations/${result.payload.data.id}`)
  }

  if (profileLoading && !person) return <p className="p-8 text-center text-body-sm text-outline">Loading profile…</p>
  if (profileError || !person) return <section className="mx-auto max-w-xl p-6"><p role="alert" className="rounded-xl bg-surface-container p-4 text-body-sm">{profileError?.message || "This profile is unavailable."}</p><Link to="/app/people" className="mt-4 inline-block underline">Back to people</Link></section>

  return (
    <section className="mx-auto min-h-full max-w-xl px-4 pb-8 pt-4 sm:px-6">
      <header className="flex items-center gap-3"><Link to="/app/people" className="grid size-10 place-items-center rounded-full hover:bg-surface-container" aria-label="Back"><Icon name="arrow-left-s-line" className="text-xl" /></Link><h1 className="font-heading text-title-md">{isSelf ? "Your profile" : "Profile"}</h1></header>
      <article className="mt-4 rounded-3xl bg-white p-6 text-center shadow-panel">
        <div className="flex justify-center"><ProfilePhoto name={person.name} photoPath={person.profile?.profilePhoto?.filePath} size="size-28" /></div>
        <h2 className="mt-4 font-heading text-headline-sm">{person.name}</h2>
        <p className="text-body-sm text-outline">@{person.username}</p>
        {person.profile?.userCaption && <p className="mt-4 text-body-md">{person.profile.userCaption}</p>}
        {person.profile?.bio && <p className="mt-2 whitespace-pre-wrap text-body-sm text-on-surface-variant">{person.profile.bio}</p>}
        {!!person.profile?.interests?.length && <div className="mt-4 flex flex-wrap justify-center gap-2">{person.profile.interests.map((interest) => <span key={interest} className="rounded-full bg-surface-container px-3 py-1 text-label-sm">{interest}</span>)}</div>}
      </article>
      {!isSelf && <div className="mt-4 grid grid-cols-2 gap-2">
        {contact ? <button onClick={message} className="rounded-xl bg-vivid-yellow p-3 text-label-md"><Icon name="chat-1-line" className="mr-1" /> Message</button>
          : request && !request.requestedByMe ? <button onClick={() => run(approvePerson(userId))} className="rounded-xl bg-vivid-yellow p-3 text-label-md">Accept request</button>
          : <button disabled={blocked || Boolean(request)} onClick={() => run(connectPerson(userId))} className="rounded-xl bg-vivid-yellow p-3 text-label-md disabled:opacity-50">{blocked ? "Blocked" : request ? "Request sent" : "Connect"}</button>}
        {contact && <button onClick={() => run(removePerson(userId))} className="rounded-xl bg-surface-container p-3 text-label-md">Remove contact</button>}
        <button onClick={() => run(blocked ? unblockPerson(userId) : blockPerson(userId))} className="col-span-2 rounded-xl bg-error/10 p-3 text-label-md text-error">{blocked ? "Unblock" : "Block"} {person.name}</button>
      </div>}
      {actionError && <p role="alert" className="mt-3 text-body-sm text-error">{actionError}</p>}
    </section>
  )
}
