# AILU Website CMS guide

Open **Website CMS** in the staff menu at `/admin/cms`.

## How editing works
1. Open a section, such as Contact details or FAQs.
2. Change the text.
3. Click **Save draft** to keep working. Visitors do not see drafts.
4. Click **Publish** when it is ready. The website updates straight away.

Other buttons:
- **Discard draft:** removes unpublished changes.
- **Undo last publish:** goes back one version.
- **Restore original:** goes back to the wording built into the website.

Write `{phone}` or `{email}` in any text to use the values from Contact details.

## Who can do what
| Role | Save drafts | Publish | Publish legal, Dreams and Donation Box |
|---|---|---|---|
| Owner | Yes | Yes | Yes |
| Manager | Yes | Yes | No |
| Staff | Yes | No | No |
| Accounts | No access | No access | No access |

## SEO
Use **SEO for every page** to set:
- the title and description Google shows, with a live Google preview
- the image used when a page is shared
- **Hide from Google**, which also removes the page from the sitemap
- the Google verification code for Search Console

Each celebration has its own SEO title, description and share image under **Celebrations**.

Good lengths: title up to 60 characters, description up to 160. The CMS home page lists any problems.

## Photos
Photo upload needs a Blob store. Set it up once:
1. In Vercel, open the **worldofailu** project, then **Storage**.
2. Create a **Blob** store and connect it to Production and Preview.
3. Redeploy.

Use JPG, PNG or WebP up to 4 MB. Add a description for each photo. Use only real photos you have permission to publish.

A photo used on the website cannot be deleted until it is removed from the page.

## What stays in code
- Layout, brand colours, logo and animation
- The 3D scenes inside AILU World
- Form fields, such as the enquiry form labels
- The seven celebration web addresses. Their names and wording can change, but adding a new celebration needs code, because the CRM uses the same list.

## Rules
Publish only true information: no made-up prices, reviews, rewards or availability, and never a person's dream or story. Have changes to legal pages checked by a lawyer.

Preview links use the same database as the live site. Publishing from a preview link changes the live content too.
