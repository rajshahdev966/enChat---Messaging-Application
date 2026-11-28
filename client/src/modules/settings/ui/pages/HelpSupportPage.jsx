import { useMemo, useState } from "react";
import Icon from "../../../../shared/ui/Icon";

const faqCategories = [
  {
    title: "Privacy & Security",
    icon: "shield-keyhole-line",
    questions: [
      {
        question: "Who can see my profile information?",
        answer:
          "Your profile information is governed by the privacy settings associated with each field. Depending on your selected visibility, information such as your profile photo, bio and caption may be visible to different people. Review your privacy settings to ensure your profile is shared only with the audience you intend.",
      },
      {
        question: "Can someone message me without being my contact?",
        answer:
          "No. enChat requires an approved contact relationship before users can exchange messages. A contact request must be accepted before a new conversation can be used for messaging.",
      },
      {
        question: "What happens when I block someone?",
        answer:
          "Blocking prevents the blocked user from interacting with you through contact requests and messaging, according to enChat's blocking rules. Blocking does not necessarily erase previously stored conversations or messages. Existing conversation history may remain accessible.",
      },
      {
        question: "Is my conversation end-to-end encrypted?",
        answer:
          "No. End-to-end encryption is not currently implemented and verified in enChat. Messages should not be considered protected from access by the application server.",
      },
    ],
  },
  {
    title: "Contacts & Conversations",
    icon: "chat-3-line",
    questions: [
      {
        question: "What happens if someone rejects my contact request?",
        answer:
          "A rejected contact request cannot simply be sent again by the original sender. The recipient may reconsider and approve the request later. This helps prevent repeated unwanted connection requests.",
      },
      {
        question: "Why can't I send a message to someone?",
        answer:
          "Messaging requires an approved contact relationship. If your contact request is pending, rejected or no longer approved, messaging may be unavailable. A block may also prevent communication.",
      },
      {
        question:
          "Will my messages disappear if someone removes me from their contacts?",
        answer:
          "Removing a contact does not automatically delete the conversation or its message history. However, messaging between the two users is restricted until an approved contact relationship is restored.",
      },
      {
        question: "Can I recover messages that I deleted?",
        answer:
          "Message recovery is not currently available. Deleted messages may not be recoverable.",
      },
    ],
  },
  {
    title: "Account & Access",
    icon: "user-settings-line",
    questions: [
      {
        question: "Why was I logged out when I signed in somewhere else?",
        answer:
          "enChat is designed to allow one active authenticated session per account. Signing in from another session may invalidate your previous session to prevent simultaneous account access.",
      },
      {
        question: "What should I do if my session expires unexpectedly?",
        answer:
          "Sign in again to establish a new authenticated session. If the issue continues, check your internet connection and make sure your application is up to date.",
      },
      {
        question: "Can I change my name or username?",
        answer:
          "Your name and username are currently fixed and cannot be changed through profile editing. Other profile information may be editable according to the features available in your account.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    icon: "tools-line",
    questions: [
      {
        question: "Why are my messages not appearing immediately?",
        answer:
          "Messages depend on an active internet connection and a functioning connection to enChat. If messages are delayed, check your network connection, reconnect to the application and reopen the conversation to synchronize the latest messages.",
      },
      {
        question: "Why is someone missing from my People discovery list?",
        answer:
          "Discovery is influenced by your existing relationships, privacy restrictions, blocking rules and the recommendation criteria used by enChat. Not every user is guaranteed to appear in discovery.",
      },
      {
        question: "Why are my contact details or profile changes not appearing?",
        answer:
          "Changes may take a short time to synchronize across the application. Try refreshing the relevant page or reopening the app. If the information remains outdated, the issue may require further investigation.",
      },
    ],
  },
];

const allQuestions = faqCategories.flatMap((category) => category.questions);

export default function HelpSupportPage() {
  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] = useState(null);
  const normalizedSearch = search.trim().toLocaleLowerCase();

  const filteredCategories = useMemo(
    () =>
      faqCategories
        .map((category) => ({
          ...category,
          questions: category.questions.filter(({ question, answer }) =>
            `${question} ${answer}`.toLocaleLowerCase().includes(normalizedSearch),
          ),
        }))
        .filter((category) => category.questions.length > 0),
    [normalizedSearch],
  );

  const resultCount = filteredCategories.reduce(
    (total, category) => total + category.questions.length,
    0,
  );

  return (
    <section className="mx-auto min-h-full max-w-3xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
      <header className="mb-7 sm:mb-9">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">
          <Icon name="question-answer-line" /> enChat Support
        </p>
        <h1 className="font-heading text-headline-lg sm:text-display-lg">
          Help &amp; Support
        </h1>
        <p className="mt-2 max-w-2xl text-body-sm text-outline sm:text-body-md">
          Understand how enChat works, your privacy, and how to resolve common
          issues.
        </p>
      </header>

      <div className="mb-6">
        <label htmlFor="help-search" className="sr-only">
          Search help questions and answers
        </label>
        <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-border-subtle bg-surface-container-low px-4 transition focus-within:border-primary focus-within:outline focus-within:outline-2 focus-within:outline-primary/20">
          <Icon name="search-line" className="text-lg text-outline" />
          <input
            id="help-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search help topics..."
            className="min-w-0 flex-1 bg-transparent py-3 text-body-sm text-on-surface outline-none placeholder:text-outline"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="grid size-8 shrink-0 place-items-center rounded-full text-outline transition hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Clear search"
            >
              <Icon name="close-line" />
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {resultCount} {resultCount === 1 ? "answer" : "answers"} found
        </p>
      </div>

      {filteredCategories.length ? (
        <div className="space-y-5 sm:space-y-6">
          {filteredCategories.map((category) => (
            <section
              key={category.title}
              aria-labelledby={`faq-category-${category.title.replaceAll(" ", "-").replaceAll("&", "and")}`}
              className="rounded-2xl border border-border-subtle bg-surface-container-lowest p-4 shadow-panel sm:p-5"
            >
              <h2
                id={`faq-category-${category.title.replaceAll(" ", "-").replaceAll("&", "and")}`}
                className="mb-2 flex items-center gap-2 font-heading text-title-md"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-surface-container text-on-surface-variant">
                  <Icon name={category.icon} className="text-lg" />
                </span>
                {category.title}
                <span className="ml-auto text-label-sm font-normal text-outline">
                  {category.questions.length}
                </span>
              </h2>

              <div className="divide-y divide-border-subtle">
                {category.questions.map(({ question, answer }) => {
                  const id = `${category.title}-${question}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-");
                  const isOpen = openQuestion === id;
                  return (
                    <article key={question} className="py-1">
                      <h3>
                        <button
                          type="button"
                          id={`question-${id}`}
                          aria-expanded={isOpen}
                          aria-controls={`answer-${id}`}
                          onClick={() => setOpenQuestion(isOpen ? null : id)}
                          className="flex min-h-12 w-full items-center gap-4 py-3 text-left text-label-lg text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <span className="flex-1">{question}</span>
                          <Icon
                            name="add-line"
                            className={`shrink-0 text-lg text-outline transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-45" : ""}`}
                          />
                        </button>
                      </h3>
                      <div
                        id={`answer-${id}`}
                        role="region"
                        aria-labelledby={`question-${id}`}
                        aria-hidden={!isOpen}
                        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <p className="pb-4 pr-8 text-body-sm leading-relaxed text-on-surface-variant sm:pr-10">
                            {answer}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-structural bg-surface-container-low px-5 py-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-surface-container text-outline">
            <Icon name="search-eye-line" className="text-2xl" />
          </span>
          <h2 className="mt-4 font-heading text-title-md">No answers found</h2>
          <p className="mt-1 text-body-sm text-outline">
            Try a different word or a shorter search.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 rounded-full px-4 py-2 text-label-lg text-on-surface underline decoration-primary underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
          >
            Clear search
          </button>
        </div>
      )}

      <p className="mt-7 text-center text-label-sm text-outline">
        {resultCount} of {allQuestions.length} help topics
      </p>
    </section>
  );
}
