# **CLAUDE.md**

## **Project**

A small web app built by someone with NO coding background. What to build is defined in `PRD.md`. How it should look is defined in `DESIGN.md` and the `design-ui/` folder. Read them before every task.

\<\!-- Class mode: delete the next line when the class is over \--\>

@class-rules.md

## **Talking to the user (most important rule)**

The user is not a programmer. Every message to them must be in plain, everyday language.

* Reply in the user's language (usually Thai).  
* Avoid technical words. If one is unavoidable, explain it in one short everyday sentence, or use a simple comparison.  
* Never show a raw error message or code as your explanation.  
* When something goes wrong, explain in this order:  
  1. What happened, in everyday words  
  2. Is it serious? Did the user do anything wrong? (usually no)  
  3. What you are doing about it, or the ONE thing the user needs to do next  
* Don't ask the user technical questions. Make technical decisions yourself. Ask about their business and what they want the app to do.  
* When the user must do something themselves (e.g. in the Vercel website), give numbered steps: where to click, what to type, what they should see.  
* Keep messages short. One idea at a time.

Example:

* Bad: "Build failed: Type error in app/page.tsx — Property 'price' does not exist."  
* Good: "เว็บยังขึ้นไม่ได้ เพราะมีจุดหนึ่งที่ผมตั้งชื่อข้อมูล 'ราคา' ไม่ตรงกัน ไม่ใช่ความผิดของคุณครับ ผมแก้ให้แล้วและกำลังลองใหม่"

## **PRD.md and PLAN.md**

* `PRD.md` says what to build. When the user wants something new: talk it through, write it into `PRD.md` in their words, then build it.  
* The "Not in v1" list is the roadmap. When the user asks "what next?", suggest the smallest useful item from it.  
* `PLAN.md` splits the work into phases. Do one phase at a time, mark its status, then stop and wait for the user's OK before the next one.  
* Check the app type in the PRD (A \= personal tool, B \= public site \+ owner back office).

## **Design (DESIGN.md \+ design-ui/)**

* `DESIGN.md` holds the design tokens; `design-ui/` holds HTML mockups.  
* Before building or changing a screen, read `DESIGN.md` and the matching mockup.  
* Set up the tokens once (Tailwind theme / CSS variables in `globals.css`), then use them everywhere. No hard-coded colors or font sizes.  
* Treat mockups as a picture to match (layout, spacing, colors, text). Rebuild them with Tailwind \+ shadcn/ui. Don't copy their raw HTML or scripts.  
* `design-ui/` and `DESIGN.md` are reference only. Don't edit them unless asked.  
* The PRD decides WHAT the app does; the design decides HOW it looks. If a mockup shows something not in the PRD, don't build it. Tell the user.  
* If a screen has no mockup, design it from `DESIGN.md` in the same style, and say so.  
* After building a screen, compare it with the mockup and fix visible differences.

## **Tech stack**

* Next.js (App Router), React, TypeScript  
* Tailwind CSS \+ shadcn/ui  
* Neon Postgres (one database for both localhost and the live site)  
* Drizzle ORM (the only way to access the database)  
* Neon Auth for login  
* npm  
* Code on GitHub, deployed on Vercel

Keep using this stack. If a new feature truly needs another tool or service, explain in plain words what it is, what it costs, and why, then ask first.

## **Database (Neon \+ Drizzle)**

* There is ONE Neon database. Localhost and the live site share it, so test data also shows on the live site. Tell the user this once. Clear test data when they ask (always confirm first).  
* Use the Neon connector only to: create the project (region: Singapore, `aws-ap-southeast-1`), get the connection string, and look at data.  
* Create or change tables ONLY through `lib/db/schema.ts` \+ drizzle-kit. Never create tables with raw SQL through the connector.  
* Write the connection string into `.env.local` as `DATABASE_URL` yourself. If the connector isn't available, use `vercel env pull .env.local`. Never show the value in chat. Never commit any `.env*` file.  
* Before creating tables, explain them to the user as a simple Thai table (table name \+ what each column holds) and wait for their OK.  
* Use `drizzle-kit push` while the app has only test data. Once it holds real data, switch to `drizzle-kit generate` \+ `migrate`.  
* Never delete data, tables, or columns without asking first, in plain words, e.g. "ข้อมูลที่กรอกไว้ในช่องนี้จะหายไป โอเคไหมครับ"  
* Validate all user input on the server.

## **Login (Neon Auth)**

* Follow Neon's official Neon Auth setup (use the `neon-auth-nextjs` skill if installed). Don't guess imports from memory.  
* Type A app: every page requires login.  
* Type B app: only `/admin` pages require login. Public pages stay open.  
* Default: one owner account. Nobody else may sign up and see the owner's data. Test it: sign up with a second email and confirm it can't see anything.  
* Letting other people have their own accounts is a big change. Explain what it involves in plain words and update the PRD before building it.

## **Thai defaults**

* Website text in Thai. Dates and times in Asia/Bangkok.  
* Money in Thai baht. Phone numbers: 10 digits starting with 0\.  
* Use the fonts in `DESIGN.md`, loaded with `next/font`. If they don't support Thai, add a Thai font (Noto Sans Thai or IBM Plex Sans Thai) for Thai text.  
* Design mobile-first; most visitors will use a phone.

## **Saving work and going online**

* Commit after every change that works. Tell the user it's a save point they can go back to (e.g. "บันทึกจุดเซฟไว้แล้วครับ").  
* Pushing to GitHub updates the live website. At the end of each phase, suggest pushing; push only after the user says yes.  
* Before pushing, `npm run build` must pass on the computer.  
* Vercel gets the database values from the Neon integration. Don't ask the user to copy `DATABASE_URL`. If the live site needs a value the integration didn't add (e.g. for login), walk the user step by step through adding it in Vercel (Project → Settings → Environment Variables), copying from `.env.local`, never through chat.  
* After pushing, ask the user to open the live link and test what just changed.

## **How to work**

* Read the relevant files before changing anything.  
* Write the minimum, simplest code that does the job. Readable over clever.  
* Change only what the current task needs. No unrelated refactoring.  
* Before a non-trivial task, decide how you'll check that it works, then check it (open the page, submit sample data, run `npm run lint` and `npm run build`).  
* Use scripts from `package.json`. Don't guess commands.

## **Ask first (explain in plain words, then wait for a yes)**

* Adding payments, notifications (email, LINE, SMS), or file uploads  
* Anything that costs money or needs a new account/service  
* Deleting files or data  
* Changing the tech stack

Never (even if asked): put passwords, keys, or connection strings in code or chat; turn off type checks or lint to make an error go away.

## **When a task is finished**

Report to the user in plain language (their language):

1. ตอนนี้ทำอะไรได้แล้ว — 1–2 sentences  
2. ลองทดสอบยังไง — which page to open, what to click, what they should see  
3. ขั้นต่อไปคืออะไร

&nbsp;

&nbsp;