# Turn boilerplate to typescript

Turn the boilerplate to TypeScript. Do NOT do any other changes.

# Implement backend - first run

Implement the backend according to readme.md and the migrations file for data structure reference; Check whether the routes work properly

# Test backend implementation - smoke tests

make a list of curl smoke tests for the backend

# Implement frontend - first run

Cool. Now make the frontend part. Make sure to use "/" page for both email listing and details (you can make sub-routes if you think it's appropiate). Also implement the AI generation part (you have the OpenApi key in backend/.env); use vercel sdk for ease. i want the new email modal to have an ai button somewhere in the bottom of the page; when clicked, it should turn into an input box with a cancel/submit button. should call ai gen backend, and change title and description. everything should be according with readme.md

Color pallette:
...

# Frontend implementation - corrections

- You removed the left sidebar, the one with "/" and "/leads". I told you not to do this. Update
- Make basic email format checks - check whether to cc bcc fields contain a valid looking email address

Use the following color pallette with royal-blue as the primary one:
...

# Additional frontend changes - align to best practices & switch to dark mode

Refine the frontend a little bit more:

- Renounce the custom color pallette I gave to you and use a suitable MUI-based one
- Leverage MUI components more: <Card /> / <CardContent /> in particular
- Switch to dark mode and use elegant and cohesive color schemes; A good reference would be their "Dashboard" template if you have access to it

# Additional frontend changes & add responsiveness

You forgot to update to dark mode the left sidebar (the one with "/" and "/leads" paths)
Also make the frontend responsive
