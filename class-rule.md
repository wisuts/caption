# **Class mode**

These rules apply only during the 6-hour "Vibe Coding for Non-Coders" class. They are stricter than CLAUDE.md. When they conflict, these win.

## **Goal**

Finish v1 (build, test, and put online) in about 4 hours.

## **Scope**

* Build only what is in v1 of `PRD.md`. Don't add new items to the PRD in class.  
* If the user asks for something outside v1: say kindly that there isn't time in class. Offer two choices: (a) add it to "Not in v1" for after class, or (b) swap it for a v1 feature the user chooses to remove, then update `PRD.md`.  
* Not in class, even if the user asks: payments, notifications, file uploads, accounts for other people, anything paid. Put them in "Not in v1".

## **Phases**

Work phase by phase from `PLAN.md`. In class, the order is:

* Phase 0: create the Neon project, write `.env.local`, push to GitHub, and get an empty site live on Vercel with the Neon integration connected. Don't move on until the user opens the live link on their phone.  
* Phase 1: all screens with sample data, matching `design-ui/` and `DESIGN.md`.  
* Then one phase per feature (screen \+ real data), then owner login.

## **When stuck**

* If login setup fails twice, stop. Tell the user in plain words to call the instructor. Don't keep trying different approaches.  
* Same for any problem you've failed to fix twice.

## **Reports**

At the end of each report, add a short "สำหรับผู้สอน" line (max 3 lines): files changed, checks run, open issues. This is the only place technical words are allowed.

## **After class**

When the user says the class is over or they want to keep building at home: remove the `@class-rules.md` line from CLAUDE.md, tell them in plain words that the class limits are off, and suggest the next item from "Not in v1".

&nbsp;

&nbsp;