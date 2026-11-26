import { Link } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import Icon from "../../../../shared/ui/Icon"
import { setAppearance } from "../../state/settingsSlice"

export default function AppearancePage() {
  const dispatch = useDispatch()
  const appearance = useSelector((state) => state.settings.appearance)
  const update = (value) => dispatch(setAppearance(value))

  return (
    <section className="mx-auto min-h-full max-w-2xl px-4 pb-10 pt-5 sm:px-6">
      <header className="mb-5 flex items-center gap-3">
        <Link to="/app/you" aria-label="Back" className="grid size-9 place-items-center rounded-full hover:bg-surface-container">
          <Icon name="arrow-left-s-line" className="text-xl" />
        </Link>
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-outline">EXPERIENCE & APP</p>
          <h1 className="font-heading text-headline-sm">Appearance</h1>
        </div>
      </header>
      <p className="text-body-sm text-on-surface-variant">Choose how enChat follows your device and motion preferences.</p>
      <div className="mt-5 rounded-2xl bg-white px-4 shadow-panel">
        <label className="flex min-h-16 cursor-pointer items-center gap-3 border-b border-sage-green/20 py-3">
          <span className="grid size-10 place-items-center rounded-xl bg-surface-container"><Icon name="sun-line" /></span>
          <span className="flex-1"><strong className="block text-label-lg">Sanctuary light</strong><small className="text-label-sm text-outline">Keep the warm parchment appearance</small></span>
          <input type="radio" name="colorMode" checked={appearance.colorMode === "light"} onChange={() => update({ colorMode: "light" })} />
        </label>
        <label className="flex min-h-16 cursor-pointer items-center gap-3 py-3">
          <span className="grid size-10 place-items-center rounded-xl bg-surface-container"><Icon name="contrast-2-line" /></span>
          <span className="flex-1"><strong className="block text-label-lg">Follow device</strong><small className="text-label-sm text-outline">Use the operating system color-scheme preference</small></span>
          <input type="radio" name="colorMode" checked={appearance.colorMode === "system"} onChange={() => update({ colorMode: "system" })} />
        </label>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-panel">
        <span className="grid size-10 place-items-center rounded-xl bg-surface-container"><Icon name="motion-line" /></span>
        <span className="flex-1"><strong className="block text-label-lg">Reduce animation</strong><small className="text-label-sm text-outline">Limit decorative motion throughout the app</small></span>
        <input type="checkbox" checked={appearance.reduceMotion} onChange={(event) => update({ reduceMotion: event.target.checked })} />
      </label>
      <p className="mt-4 text-label-sm text-outline">These preferences are stored in this browser.</p>
    </section>
  )
}
